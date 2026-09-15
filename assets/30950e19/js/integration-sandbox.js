(() => {
  'use strict';

  const config = window.NebulaIntegrationConfig;
  if (!config || window.NebulaIntegration) return;

  const baseUrl = String(config.baseUrl || '').replace(/\/$/, '');
  const query = new URLSearchParams(window.location.search);
  const isExplicitSandbox = query.get('sandbox') === '1';
  let revision = null;
  let snapshot = null;
  const id = (prefix) => {
    const value = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    return `${prefix}:${value}`;
  };
  const headers = (extra = {}) => ({
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-CSRF-Token': config.csrfToken || '',
    'X-Nebula-Sandbox': '1',
    'X-Correlation-ID': id('browser'),
    ...extra,
  });
  const request = async (path, options = {}) => {
    const response = await fetch(`${baseUrl}/${path}`, {
      credentials: 'same-origin',
      cache: 'no-store',
      ...options,
      headers: headers(options.headers || {}),
    });
    const body = await response.json().catch(() => null);
    if (!response.ok || !body?.ok) {
      const error = new Error(body?.error?.message || `Sandbox request failed with HTTP ${response.status}.`);
      error.code = body?.error?.code || 'SANDBOX_TRANSPORT_ERROR';
      error.fields = body?.error?.fields || {};
      error.status = response.status;
      error.correlationId = body?.meta?.correlationId || response.headers.get('X-Correlation-ID');
      throw error;
    }
    return body;
  };
  const syncBalance = (state) => {
    const value = Number(state?.balance);
    if (!Number.isFinite(value)) return;
    document.querySelectorAll('.nb-credit-pill span, [data-credit-topup-trigger] span').forEach((node) => { node.textContent = String(value); });
    document.querySelectorAll('.nb-sidebar-balance strong span').forEach((node) => { node.textContent = `${value} credits`; });
    document.querySelectorAll('[data-balance-fixture]').forEach((node) => { node.dataset.balanceFixture = String(value); });
  };
  const acceptState = (state) => {
    if (!state || typeof state !== 'object') return;
    snapshot = state;
    revision = Number.isInteger(state.revision) ? state.revision : revision;
    syncBalance(state);
    document.documentElement.dataset.nebulaSandboxRevision = String(revision ?? 'unknown');
  };
  const loadState = async () => {
    const body = await request('state', { method: 'GET' });
    acceptState(body.data?.state);
    return snapshot;
  };
  const command = async (name, payload = {}, options = {}) => {
    const key = options.idempotencyKey || id(name);
    const execute = () => request('command', {
      method: 'POST',
      headers: { 'Idempotency-Key': key },
      body: JSON.stringify({ command: name, payload, expectedRevision: revision }),
    });
    let body;
    try {
      body = await execute();
    } catch (error) {
      if (error.code !== 'REVISION_CONFLICT' || options.retryOnConflict === false) throw error;
      await loadState();
      body = await execute();
    }
    acceptState(body.data?.state);
    return body.data?.commandResult || body.data;
  };
  const reset = async () => {
    const body = await request('reset', { method: 'POST', body: '{}' });
    acceptState(body.data?.state);
    return snapshot;
  };
  const emit = (name, detail) => document.dispatchEvent(new CustomEvent(name, { detail }));
  const fixtureUrl = (modal) => {
    const url = new URL('/nebula-account/chatroom', window.location.origin);
    url.searchParams.set('fixture', '1');
    url.searchParams.set('state', 'modal_flow');
    url.searchParams.set('modal', modal);
    url.searchParams.set('sandbox', '1');
    if (query.get('scenarioLab') === '1') url.searchParams.set('scenarioLab', '1');
    return url.toString();
  };
  const transitionWorkflow = async (flow, event, options = {}) => {
    const result = await command('sandbox.workflow.transition', { flow, event }, options);
    emit('nebula:sandbox-workflow-updated', { flow, event, result, sandbox: true });
    return result;
  };
  const scenarioCatalog = Object.freeze({
    'chat-sent': { label: 'Сообщение отправлено', modal: null },
    'chat-delivered': { label: 'Сообщение доставлено', modal: null },
    'chat-read': { label: 'Сообщение прочитано', modal: null },
    'consultation-connecting': { label: 'Подключение к эксперту', modal: 'connecting' },
    'consultation-lost': { label: 'Связь потеряна', modal: 'reconnect' },
    'payment-authorized': { label: 'Оплата ожидает сверки', modal: 'checkout' },
    'payment-failed': { label: 'Ошибка оплаты', modal: 'card-error' },
    'consultation-start': { label: 'Начать консультацию', workflow: ['consultation', 'start'], modal: 'question' },
    'question-submitted': { label: 'Вопрос отправлен', workflow: ['consultation', 'question.submit'], modal: 'connecting' },
    'expert-busy': { label: 'Эксперт занят', workflow: ['consultation', 'busy'], modal: 'unavailable' },
    'expert-offline': { label: 'Эксперт не в сети', workflow: ['consultation', 'offline'], modal: 'unavailable' },
    'no-match': { label: 'Нет подходящих экспертов', workflow: ['consultation', 'no-match'], modal: 'no-match' },
    'insufficient-credits': { label: 'Недостаточно кредитов', workflow: ['consultation', 'insufficient-credits'], modal: 'insufficient' },
    'topup-package': { label: 'Выбрать пакет кредитов', workflow: ['billing', 'topup.open'], modal: 'topup-start' },
    'checkout-review': { label: 'Проверить заказ', workflow: ['billing', 'order.review'], modal: 'checkout' },
    'card-details': { label: 'Ввести данные карты', workflow: ['billing', 'card.details'], modal: 'card-details' },
    'payment-error': { label: 'Ошибка платежа', workflow: ['billing', 'payment.failed'], modal: 'payment-error' },
    'notification-channel': { label: 'Настроить уведомление', workflow: ['notifications', 'choose-channel'], modal: 'notify' },
    'media-preview': { label: 'Открыть медиа', workflow: ['media', 'preview'], modal: 'video' },
  });
  const persistIntent = async (event, mapping) => {
    if (!event?.detail || event.detail.integrationHandled === true) return;
    let commandName = mapping.command;
    let payload = mapping.payload(event.detail, event);
    if (!payload) return;
    try {
      const result = await command(commandName, payload, {
        idempotencyKey: event.detail.idempotencyKey || id(event.type),
      });
      emit('nebula:integration-receipt', { intent: event.type, command: commandName, payload, result, sandbox: true });
    } catch (error) {
      emit('nebula:integration-error', {
        intent: event.type,
        command: commandName,
        code: error.code,
        message: error.message,
        fields: error.fields,
        payload,
        correlationId: error.correlationId,
        sandbox: true,
      });
    }
  };

  const mappings = {
    'nebula:chat-message-created-local': {
      command: 'chat.message.create',
      payload: (detail) => ({
        conversationId: detail.conversationId,
        clientMessageId: detail.messageId,
        text: detail.text || '',
        media: detail.media || null,
      }),
    },
    'nebula:chat-message-edited-local': {
      command: 'chat.message.edit',
      payload: (detail) => ({ conversationId: detail.conversationId, clientMessageId: detail.messageId, text: detail.text || '' }),
    },
    'nebula:chat-favorite-intent-required': {
      command: 'chat.favorite.set',
      payload: (detail) => ({ conversationId: detail.conversationId, favorite: Boolean(detail.favorite) }),
    },
    'nebula:chat-message-pin-intent': {
      command: 'chat.message.pin.set',
      payload: (detail) => ({ conversationId: detail.conversationId, messageId: detail.messageId, pinned: Boolean(detail.pinned) }),
    },
    'nebula:chat-message-bookmark-intent': {
      command: 'chat.message.bookmark.set',
      payload: (detail) => ({ conversationId: detail.conversationId, messageId: detail.messageId, bookmarked: Boolean(detail.bookmarked) }),
    },
    'nebula:chat-message-reaction-intent': {
      command: 'chat.message.reaction.set',
      payload: (detail) => ({ conversationId: detail.conversationId, messageId: detail.messageId, reaction: detail.reaction || '' }),
    },
    'nebula:account-information-validation': {
      command: 'profile.field.update',
      payload: (detail) => detail.valid ? { field: detail.field, value: detail.value } : null,
    },
    'nebula:astrology-validation': {
      command: 'astrology.field.update',
      payload: (detail) => detail.valid ? { field: detail.field, value: detail.value } : null,
    },
    'nebula:notification-preference-intent': {
      command: 'notification.preference.set',
      payload: (detail) => ({
        key: detail.key || detail.preference || `${window.location.pathname.split('/').filter(Boolean).pop() || 'notifications'}.${detail.channel || 'unknown'}`,
        enabled: Boolean(detail.enabled ?? detail.checked),
      }),
    },
    'nebula:consultation-start-intent-required': {
      command: 'consultation.transition',
      payload: () => ({ action: 'start' }),
    },
    'nebula:consultation-pause-intent-required': {
      command: 'consultation.transition',
      payload: (detail) => ({ action: detail?.paused === false ? 'resume' : 'pause' }),
    },
    'nebula:end-chat-intent-required': {
      command: 'consultation.transition',
      payload: () => ({ action: 'end' }),
    },
  };
  Object.entries(mappings).forEach(([eventName, mapping]) => {
    document.addEventListener(eventName, (event) => { persistIntent(event, mapping); });
  });

  // These are deliberately separate from the visual handlers.  A real host can
  // replace this adapter with its API client without changing a modal, card or
  // route.  In sandbox mode each request returns the next existing C76 fixture.
  const workflowEvents = {
    'nebula:consultation-start-intent-required': ['consultation', 'start', true],
    'nebula:question-before-start-submit-required': ['consultation', 'question.submit', true],
    'nebula:psychic-start-intent-required': ['consultation', 'start', true],
    'nebula:expert-busy-intent-required': ['consultation', 'busy', true],
    'nebula:expert-offline-intent-required': ['consultation', 'offline', true],
    'nebula:no-matching-experts-intent': ['consultation', 'no-match', true],
    'nebula:insufficient-credits-open': ['consultation', 'insufficient-credits', true],
    'nebula:consultation-reconnect-open': ['consultation', 'connection.lost', true],
    'nebula:end-or-stay-intent': ['consultation', 'end.request', true],
    'nebula:payment-preflight-required': ['billing', 'topup.open', false],
    'nebula:checkout-submit-requested': ['billing', 'order.review', false],
    'nebula:payment-method-selection-requested': ['billing', 'card.details', false],
    'nebula:notification-delivery-required': ['notifications', 'choose-channel', true],
    'nebula:horoscope-advisor-required': ['consultation', 'start', true],
    'nebula:horoscope-find-psychic-intent': ['catalog', 'picker', true],
    'nebula:horoscope-start-consultation-intent': ['consultation', 'start', true],
    'nebula:horoscope-biorhythm-intent': ['consultation', 'start', true],
    'nebula:biorhythm-reading-intent': ['consultation', 'start', true],
    'nebula:biorhythm-psychic-selection-intent': ['catalog', 'picker', true],
    'nebula:media-preview-intent': ['media', 'preview', true],
  };
  Object.entries(workflowEvents).forEach(([eventName, descriptor]) => {
    document.addEventListener(eventName, async (event) => {
      if (event?.detail?.integrationHandled === true) return;
      const [flow, workflowEvent, openFixture] = descriptor;
      try {
        const result = await transitionWorkflow(flow, workflowEvent, { idempotencyKey: event?.detail?.idempotencyKey || id(eventName) });
        if (isExplicitSandbox && openFixture && result?.nextRoute) window.location.assign(result.nextRoute);
      } catch (error) {
        emit('nebula:integration-error', { intent: eventName, code: error.code, message: error.message, sandbox: true });
      }
    });
  });
  document.addEventListener('nebula:sandbox-workflow-request', async (event) => {
    const detail = event.detail || {};
    try {
      const result = detail.command
        ? await command(detail.command, detail.payload || {}, { idempotencyKey: detail.idempotencyKey || id('workflow-command') })
        : await transitionWorkflow(detail.flow, detail.event, { idempotencyKey: detail.idempotencyKey || id('workflow') });
      emit('nebula:sandbox-workflow-receipt', { detail, result, sandbox: true });
      if (isExplicitSandbox && detail.openFixture && result?.nextRoute) window.location.assign(result.nextRoute);
    } catch (error) {
      emit('nebula:integration-error', { intent: 'nebula:sandbox-workflow-request', code: error.code, message: error.message, sandbox: true });
    }
  });

  const recordedIntents = [
    'nebula:chat-clear-history-intent-required', 'nebula:chat-delete-intent-required',
    'nebula:chat-report-intent-required', 'nebula:chat-review-intent-required',
    'nebula:payment-preflight-required', 'nebula:checkout-submit-requested',
    'nebula:payment-method-selection-requested', 'nebula:notification-delivery-required',
    'nebula:horoscope-advisor-required', 'nebula:horoscope-find-psychic-intent',
    'nebula:horoscope-zodiac-intent', 'nebula:horoscope-period-intent',
    'nebula:horoscope-focus-intent', 'nebula:horoscope-start-consultation-intent',
    'nebula:horoscope-biorhythm-intent', 'nebula:biorhythm-reading-intent',
    'nebula:biorhythm-psychic-selection-intent',
    'nebula:psychic-filter-intent-required',
    // Catalogue availability/booking is a host-owned decision.  Persist only
    // the request envelope in the local sandbox; it must not fabricate an
    // availability confirmation, session, booking or payment outcome.
    'nebula:psychic-card-intent-required', 'nebula:psychic-start-intent-required', 'nebula:favorite-card-host-intent',
    'nebula:psychic-favorite-intent-required', 'nebula:favorite-host-intent',
  ];
  recordedIntents.forEach((eventName) => {
    document.addEventListener(eventName, (event) => persistIntent(event, {
      command: 'host.intent.record',
      payload: (detail) => ({ intent: eventName, detail: detail || {} }),
    }));
  });

  window.NebulaIntegration = Object.freeze({
    mode: config.mode,
    command,
    loadState,
    reset,
    transitionWorkflow,
    getState: () => snapshot ? JSON.parse(JSON.stringify(snapshot)) : null,
    getRevision: () => revision,
  });

  const createScenarioLab = () => {
    const query = new URLSearchParams(window.location.search);
    if (query.get('scenarioLab') !== '1' || document.querySelector('[data-nebula-scenario-lab]')) return;

    const lab = document.createElement('section');
    lab.className = 'nb-scenario-lab';
    lab.dataset.nebulaScenarioLab = 'true';
    lab.innerHTML = [
      '<button class="nb-scenario-lab__open" type="button" aria-expanded="false">Тестовые сценарии</button>',
      '<div class="nb-scenario-lab__panel" hidden>',
      '<div class="nb-scenario-lab__title">Локальная QA-имитация</div>',
      '<p>Состояния записываются только в sandbox. Реальные платежи, доставка и баланс не меняются.</p>',
      '<div class="nb-scenario-lab__actions"></div>',
      '<button class="nb-scenario-lab__random" type="button">Случайный сценарий</button>',
      '<button class="nb-scenario-lab__reset" type="button">Сбросить sandbox</button>',
      '<output class="nb-scenario-lab__status" aria-live="polite"></output>',
      '</div>',
    ].join('');
    document.body.append(lab);

    const open = lab.querySelector('.nb-scenario-lab__open');
    const panel = lab.querySelector('.nb-scenario-lab__panel');
    const actions = lab.querySelector('.nb-scenario-lab__actions');
    const status = lab.querySelector('.nb-scenario-lab__status');
    const setStatus = (text) => { status.textContent = text; };
    const setOpen = (value) => {
      panel.hidden = !value;
      open.setAttribute('aria-expanded', String(value));
    };
    Object.entries(scenarioCatalog).forEach(([key, item]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = item.label;
      button.dataset.scenario = key;
      actions.append(button);
    });
    const run = async (scenario) => {
      const item = scenarioCatalog[scenario];
      if (!item) return;
      setStatus(`Запускаю: ${item.label}…`);
      try {
        const result = item.workflow
          ? await transitionWorkflow(item.workflow[0], item.workflow[1])
          : await command('sandbox.scenario.apply', { scenario });
        emit('nebula:sandbox-scenario-applied', { scenario, fixtureOnly: true, state: snapshot });
        const nextRoute = result?.nextRoute || (item.modal ? fixtureUrl(item.modal) : null);
        if (nextRoute) {
          window.location.assign(nextRoute);
          return;
        }
        setStatus(`${item.label}: применено локально. Состояние можно проверить в консоли сценариев.`);
      } catch (error) {
        setStatus(`Ошибка sandbox: ${error.message}`);
      }
    };
    open.addEventListener('click', () => setOpen(panel.hidden));
    actions.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-scenario]');
      if (button) run(button.dataset.scenario);
    });
    lab.querySelector('.nb-scenario-lab__random').addEventListener('click', () => {
      const keys = Object.keys(scenarioCatalog);
      run(keys[Math.floor(Math.random() * keys.length)]);
    });
    lab.querySelector('.nb-scenario-lab__reset').addEventListener('click', async () => {
      try {
        await reset();
        setStatus('Sandbox сброшен до исходного локального состояния.');
      } catch (error) {
        setStatus(`Сброс не выполнен: ${error.message}`);
      }
    });
  };
  document.documentElement.dataset.nebulaIntegration = 'sandbox-v1';
  loadState()
    .then((state) => emit('nebula:integration-ready', { state, sandbox: true }))
    .catch((error) => emit('nebula:integration-error', { intent: 'bootstrap', code: error.code, message: error.message, sandbox: true }));
  createScenarioLab();
})();
