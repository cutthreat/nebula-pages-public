(() => {
  'use strict';
  const root = document.querySelector('[data-mia-dialogue-demo="true"]');
  const api = window.NebulaIntegration;
  if (!root || !api || !['127.0.0.1', 'localhost', '[::1]'].includes(location.hostname)) return;
  const emit = (name, detail) => document.dispatchEvent(new CustomEvent(name, { detail }));
  const scenarios = { happy: 'Полный диалог', 'expert-offer': 'Предложение от Mia', busy: 'Эксперт занят', offline: 'Эксперт офлайн', decline: 'Эксперт отказал', timeout: 'Тайм-аут подключения', 'low-balance': 'Баланс на 8 секунд' };
  const labels = { free: 'Бесплатный диалог', connecting: 'Подключение к Mia', offer: 'Предложение ожидает согласия', awaiting_start: 'Согласие принято · ждём Start эксперта', active: 'Платная тестовая сессия', paused: 'Пауза · списаний нет', disconnected: 'Связь потеряна · тестовая пауза', completed: 'Консультация завершена' };
  const panel = document.createElement('aside');
  panel.className = 'mia-demo';
  panel.setAttribute('aria-label', 'Mia local test controls');
  panel.innerHTML = `<details><summary>DEMO · Mia · Сценарии</summary><div class="mia-demo__body">
    <p>Только локальные тестовые кредиты. Реальные деньги и общий баланс не меняются.</p>
    <label>Сценарий <select data-demo-scenario>${Object.entries(scenarios).map(([key, name]) => `<option value="${key}">${name}</option>`).join('')}</select></label>
    <button type="button" data-demo-action="reset">Начать сценарий заново</button>
    <strong data-demo-phase>Загрузка…</strong><output data-demo-meter></output>
    <p data-demo-hint></p><div class="mia-demo__actions">
      <button type="button" data-demo-action="question">Запросить консультацию</button>
      <button type="button" data-demo-action="offer">Посмотреть условия / согласиться</button>
      <button type="button" data-demo-action="decline">Отклонить предложение</button>
      <button type="button" data-demo-action="cancel">Отменить подключение</button>
      <button type="button" data-demo-action="pause">Попросить паузу</button>
      <button type="button" data-demo-action="resume">Попросить продолжить</button>
      <button type="button" data-demo-action="end">Завершить консультацию</button>
      <button type="button" data-demo-action="disconnect">Сымитировать потерю связи</button>
      <button type="button" data-demo-action="reconnect">Восстановить связь</button>
      <button type="button" data-demo-action="topup">Тестовое пополнение +60</button>
      <button type="button" data-demo-action="topup-failed">Тестовая ошибка пополнения</button>
      <button type="button" data-demo-action="new-session">Новая сессия в том же диалоге</button>
    </div>
    <label data-demo-rating-wrap hidden>Оценка консультации <select data-demo-rating><option value="">Выберите</option>${[1,2,3,4,5].map(n => `<option>${n}</option>`).join('')}</select><button type="button" data-demo-action="review">Сохранить тестовый отзыв</button></label>
    <output data-demo-status role="status" aria-live="polite"></output>
    <details><summary>События эксперта и расчёт</summary><pre data-demo-ledger></pre></details>
    <p>Тестовая политика: 30 кредитов/мин, 0,5 за секунду; offer — 30 с, timeout — 10 с, автозавершение — через 90 с после Start. При потере связи — неоплачиваемая пауза. Это параметры стенда, не утверждённые production-правила.</p>
  </div></details>`;
  document.body.append(panel);
  const status = panel.querySelector('[data-demo-status]');
  let current = null;
  let busy = false;
  let stopped = false;
  let transportFailed = false;
  let timer = null;
  let connectionShown = false;
  let lastAutoOffer = '';
  let lastConnectionPhase = null;
  const allowed = {
    question: ['free'], offer: ['offer'], decline: ['offer'], cancel: ['connecting', 'awaiting_start'],
    pause: ['active'], resume: ['paused'], end: ['active', 'paused', 'disconnected'],
    disconnect: ['active'], reconnect: ['disconnected'], topup: ['paused', 'free', 'offer'],
    'topup-failed': ['paused', 'free', 'offer'], 'new-session': ['completed'], review: ['completed'],
  };
  const render = (d) => {
    if (!d?.demo) return;
    current = d;
    root.dataset.miaDemoPhase = d.phase;
    emit('nebula:mia-demo-snapshot', d);
    panel.querySelector('[data-demo-phase]').textContent = labels[d.phase];
    panel.querySelector('[data-demo-meter]').textContent = `${(d.balanceUnits / 2).toFixed(1)} тест. кредитов · ${d.billedSeconds} оплачиваемых секунд · ${(d.billedSeconds / 2).toFixed(1)} списано`;
    panel.querySelector('[data-demo-hint]').textContent = d.phase === 'offer' ? 'До согласия клиента и отдельного Start эксперта списаний нет.' : d.pauseReason === 'balance' ? 'Тестовые кредиты закончились. Пополните и отдельно попросите продолжить.' : d.phase === 'completed' ? 'История сохранена. Можно оценить консультацию, писать бесплатно или запросить новую сессию.' : d.typing ? 'Mia печатает ответ…' : '';
    panel.querySelectorAll('[data-demo-action]').forEach(button => {
      const action = button.dataset.demoAction;
      button.hidden = action !== 'reset' && !(allowed[action] || []).includes(d.phase);
      button.disabled = busy || (action === 'resume' && d.balanceUnits <= 0) || (action === 'review' && d.review !== null);
    });
    panel.querySelector('[data-demo-rating-wrap]').hidden = d.phase !== 'completed';
    const last = d.events.at(-1);
    if (!busy && last) status.textContent = d.review ? `Тестовый отзыв сохранён: ${d.review}/5.` : last.type;
    panel.querySelector('[data-demo-ledger]').textContent = d.events.slice(-10).map(e => `${e.actor}: ${e.type}`).join('\n') + '\n\n' + Object.values(d.ledger).map(l => `${l.type}: ${l.units / 2} credits${l.seconds !== undefined ? ` / ${l.seconds} sec` : ''}`).join('\n');
    const previousConnectionPhase = lastConnectionPhase;
    lastConnectionPhase = d.phase;
    if (d.phase === 'connecting' && !connectionShown) {
      connectionShown = true;
      emit('nebula:connection-presentation-open', {expertId: d.expertId, expertName: 'Mia Jacomo', avatar: root.querySelector('[data-chat-avatar]')?.currentSrc, durationMs: 30000, presentationOnly: true, demo: true});
    } else if (d.phase !== 'connecting' && connectionShown) {
      connectionShown = false;
      const lifecycleEvent = d.events.at(-1)?.type || '';
      const outcome = ['demo.busy', 'demo.offline', 'demo.timeout', 'demo.decline'].includes(lifecycleEvent)
        ? lifecycleEvent.slice('demo.'.length) : '';
      emit('nebula:mia-demo-connection-settled', { expertId: d.expertId, expertName: 'Mia Jacomo', outcome, statusAnchor: root.querySelector('[data-consultation-control]') || null, previousPhase: previousConnectionPhase });
      if (outcome) emit('nebula:mia-demo-availability', { expertId: d.expertId, expertName: 'Mia Jacomo', outcome, statusAnchor: root.querySelector('[data-consultation-control]') || null, demo: true, persisted: false, backendRequired: false });
    }
    if (d.phase === 'offer' && lastAutoOffer !== `${d.runId}:${d.offerId}`) {
      lastAutoOffer = `${d.runId}:${d.offerId}`;
      emit('nebula:mia-demo-offer-open', {});
    }
    if (d.phase !== 'offer') emit('nebula:mia-demo-offer-close');
  };
  // One command in flight. Every mutation has a stable idempotency key. On an
  // uncertain network result, read back; never repeat a possible submit.
  const execute = async (action, extra = {}) => {
    if (busy || stopped) return false;
    busy = true;
    panel.querySelectorAll('button').forEach(b => { b.disabled = true; });
    try {
      const result = await api.command('mia.demo', { action, runId: current?.runId, ...extra }, {idempotencyKey: `mia:${crypto.randomUUID()}`});
      transportFailed = false;
      render(result.demo);
      return true;
    } catch (error) {
      transportFailed = true;
      status.textContent = `Состояние требует сверки: ${error.message}. Повторной отправки нет.`;
      emit('nebula:mia-demo-command-error', { action, error: error.message, demo: true, persisted: false, backendRequired: false, reconciliationRequired: true });
      try {
        const state = await api.loadState();
        if (state.miaDemo) { render(state.miaDemo); transportFailed = false; }
      } catch { status.textContent = 'Локальный сервер недоступен. Текущее состояние неизвестно; отправка остановлена до восстановления связи.'; }
      return false;
    } finally {
      busy = false;
      if (current && !transportFailed) render(current);
    }
  };
  let commandTail = Promise.resolve();
  let userActionQueued = false;
  const run = (action, extra = {}) => {
    if (stopped || (action === 'tick' && (busy || userActionQueued))) return Promise.resolve(false);
    if (action !== 'tick') {
      if (userActionQueued) return Promise.resolve(false);
      userActionQueued = true;
      const composer = root.querySelector('[data-composer-input]');
      if (composer) composer.disabled = true;
    }
    const work = commandTail.then(() => execute(action, extra));
    commandTail = work.catch(() => false);
    return work.finally(() => {
      if (action !== 'tick') {
        userActionQueued = false;
        const composer = root.querySelector('[data-composer-input]');
        if (composer) composer.disabled = false;
      }
    });
  };
  const openQuestion = (opener) => emit('nebula:open-question-before-start', {selectedExpertId: 'mia-jacomo', trigger: opener});
  panel.addEventListener('click', async event => {
    const button = event.target.closest('[data-demo-action]');
    if (!button || button.disabled) return;
    const action = button.dataset.demoAction;
    if (action === 'question') { openQuestion(button); return; }
    if (action === 'offer') { emit('nebula:mia-demo-offer-open', {opener: button}); return; }
    if (action === 'reset' && current && !window.confirm('Сбросить только историю и тестовый баланс сценария Mia?')) return;
    await run(action, action === 'reset' ? {scenario: panel.querySelector('[data-demo-scenario]').value} : action === 'review' ? {rating: Number(panel.querySelector('[data-demo-rating]').value)} : {});
  });
  document.addEventListener('nebula:mia-demo-message', async event => {
    const text = event.detail?.text;
    if (await run('message', {text})) emit('nebula:mia-demo-message-accepted', {text});
  });
  document.addEventListener('nebula:mia-demo-question', async event => {
    if (event.detail?.text && !await run('message', {text: event.detail.text})) return;
    await run('request');
  });
  document.addEventListener('nebula:mia-demo-intent', event => run(event.detail.action, {offerId: current?.offerId}));
  document.addEventListener('nebula:mia-demo-control', event => {
    if (current?.phase === 'offer') emit('nebula:mia-demo-offer-open', event.detail);
    else if (current?.phase === 'free') openQuestion(event.detail?.opener);
  });
  document.addEventListener('nebula:connection-attempt-cancel-required', event => {
    if (event.detail?.expertId === 'mia-jacomo' && event.detail.reason !== 'pagehide' && current?.phase === 'connecting') run('cancel');
  });
  document.addEventListener('nebula:chat-conversation-selected-local', event => {
    panel.hidden = event.detail?.conversationId !== 'mia-jacomo';
    if (!panel.hidden && current) render(current);
  });
  const poll = async () => {
    if (stopped) return;
    if (!busy && current) await run('tick');
    timer = setTimeout(poll, transportFailed ? 3000 : 1000);
  };
  const boot = async () => {
    try {
      const state = await api.loadState();
      if (state.miaDemo) { panel.querySelector('[data-demo-scenario]').value = state.miaDemo.scenario; render(state.miaDemo); }
      else await run('reset', {scenario: 'happy'});
      poll();
    } catch (error) { status.textContent = `Не удалось загрузить тест: ${error.message}. Перезагрузите страницу после восстановления сервера.`; }
  };
  window.addEventListener('pagehide', () => { stopped = true; clearTimeout(timer); });
  window.addEventListener('pageshow', event => { if (event.persisted) { stopped = false; boot(); } });
  // The demo text fixture deliberately does not pretend to persist media edits.
  root.querySelectorAll('[data-composer-action="attachment"], [data-composer-action="voice"]').forEach(b => { b.disabled = true; b.title = 'Media transport is outside this text-dialogue demo.'; });
  boot();
})();
