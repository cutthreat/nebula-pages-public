(() => {
  'use strict';

  const config = window.NebulaIntegrationConfig;
  if (!config || window.NebulaIntegration) return;

  const baseUrl = String(config.baseUrl || '').replace(/\/$/, '');
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

  const recordedIntents = [
    'nebula:chat-clear-history-intent-required', 'nebula:chat-delete-intent-required',
    'nebula:chat-report-intent-required', 'nebula:chat-review-intent-required',
    'nebula:payment-preflight-required', 'nebula:checkout-submit-requested',
    'nebula:payment-method-selection-requested', 'nebula:notification-delivery-required',
    'nebula:horoscope-advisor-required', 'nebula:horoscope-find-psychic-intent',
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
    getState: () => snapshot ? JSON.parse(JSON.stringify(snapshot)) : null,
    getRevision: () => revision,
  });
  document.documentElement.dataset.nebulaIntegration = 'sandbox-v1';
  loadState()
    .then((state) => emit('nebula:integration-ready', { state, sandbox: true }))
    .catch((error) => emit('nebula:integration-error', { intent: 'bootstrap', code: error.code, message: error.message, sandbox: true }));
})();
