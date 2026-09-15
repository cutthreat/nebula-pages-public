(() => {
  'use strict';

  const page = document.querySelector('[data-nebula-chatroom][data-mia-dialogue-demo="true"]');
  const modal = document.querySelector('[data-mia-availability-notification]');
  if (!page || !modal || !['127.0.0.1', 'localhost', '[::1]', '::1'].includes(window.location.hostname)) return;

  const frame = page.querySelector('.c76-frame');
  const dialog = modal.querySelector('[role="dialog"]');
  const heading = modal.querySelector('#mia-notification-title');
  const description = modal.querySelector('[data-mia-notification-description]');
  const status = modal.querySelector('[data-mia-notification-status]');
  const submit = modal.querySelector('[data-mia-notification-submit]');
  const secondary = modal.querySelector('[data-mia-notification-secondary]');
  const reconcile = modal.querySelector('[data-mia-notification-reconcile]');
  const channels = [...modal.querySelectorAll('[data-mia-notification-channel]')];
  if (!frame || !dialog || !heading || !description || !status || !submit || !secondary || !reconcile || !channels.length) return;

  const expertStates = new Map();
  let expertId = 'mia-jacomo';
  let expertName = 'Mia Jacomo';
  let opener = null;
  let operation = null;
  let inertOwned = [];
  let ackTimer = null;
  let timeoutTimer = null;
  let sequence = 0;
  let latestRunId = null;

  const now = () => new Date().toISOString();
  const emit = (name, detail = {}) => document.dispatchEvent(new CustomEvent(name, { detail }));
  const stateFor = (id = expertId) => {
    if (!expertStates.has(id)) expertStates.set(id, { expertId: id, phase: 'idle', confirmed: false, channels: ['email'], requestId: null, idempotencyKey: null, operation: null, updatedAt: now() });
    return expertStates.get(id);
  };
  const snapshot = (state = stateFor()) => ({ ...state, demo: true, persisted: false, backendRequired: false, sessionMutated: false, billingMutated: false, staticProjection: true });
  const publish = (state = stateFor()) => {
    page.dataset.miaNotificationPhase = state.phase;
    page.dataset.miaNotificationExpertId = state.expertId;
    page.dataset.miaNotificationOperation = state.operation || '';
    modal.dataset.miaNotificationPhase = state.phase;
    modal.dataset.miaNotificationOperation = state.operation || '';
    page.dispatchEvent(new CustomEvent('nebula:mia-notification-snapshot', { bubbles: true, detail: snapshot(state) }));
  };
  const announce = (message) => { status.textContent = message; };
  const clearTimers = () => {
    if (ackTimer !== null) window.clearTimeout(ackTimer);
    if (timeoutTimer !== null) window.clearTimeout(timeoutTimer);
    ackTimer = null;
    timeoutTimer = null;
  };
  const focusables = () => [...dialog.querySelectorAll('button:not(:disabled),input:not(:disabled)')].filter((item) => item.getClientRects().length);
  const fenceBackground = () => {
    let branch = modal;
    while (branch.parentElement && branch !== document.body) {
      [...branch.parentElement.children].forEach((sibling) => {
        if (sibling !== branch && !sibling.inert) { sibling.inert = true; inertOwned.push(sibling); }
      });
      branch = branch.parentElement;
    }
  };
  const releaseBackground = () => {
    inertOwned.forEach((element) => { element.inert = false; element.removeAttribute('aria-hidden'); });
    inertOwned = [];
  };
  const render = () => {
    const state = stateFor();
    publish(state);
    const confirmed = state.confirmed === true;
    const pending = state.phase === 'pending' || state.phase === 'cancelling';
    const error = state.phase === 'error';
    const indeterminate = state.phase === 'indeterminate';
    modal.dataset.miaNotificationConfirmed = String(confirmed);
    channels.forEach((input) => {
      input.checked = state.channels.includes(input.value);
      input.disabled = pending || confirmed || indeterminate;
    });
    submit.disabled = pending;
    reconcile.hidden = !indeterminate;
    if (state.phase === 'idle') {
      heading.textContent = `Get a note when ${expertName} is available`;
      description.textContent = `${expertName} is busy right now. Choose how this local preview should remember your request.`;
      submit.textContent = 'Notify me';
      secondary.textContent = 'Not now';
      announce('Choose at least one channel. No notification will be sent in this local preview.');
    } else if (state.phase === 'pending') {
      heading.textContent = 'Saving your notification request';
      description.textContent = `We’re checking the notification preference for ${expertName}.`;
      submit.textContent = 'Saving…';
      secondary.textContent = 'Cancel request';
      announce('Pending — waiting for the local host acknowledgement.');
    } else if (state.phase === 'confirmed') {
      heading.textContent = `You’ll hear when ${expertName} is available`;
      description.textContent = 'Your request is confirmed for this page only. You can keep the alert or stop it below.';
      submit.textContent = 'Done';
      secondary.textContent = 'Stop notifications';
      announce(`Confirmed after host acknowledgement. Channels: ${state.channels.join(', ')}.`);
    } else if (state.phase === 'cancelling') {
      heading.textContent = 'Stopping notifications';
      description.textContent = `We’re checking the cancellation for ${expertName}.`;
      submit.textContent = 'Stopping…';
      secondary.textContent = 'Keep notification';
      announce('Pending — waiting for the local host acknowledgement.');
    } else if (state.phase === 'error') {
      heading.textContent = state.operation === 'cancel' ? 'Notification is still on' : 'We couldn’t save that yet';
      description.textContent = state.operation === 'cancel'
        ? `The cancellation could not be confirmed. Your ${expertName} alert remains active.`
        : 'Nothing was sent or saved. Review the channels and try the same request again.';
      submit.textContent = state.operation === 'cancel' ? 'Try cancellation again' : 'Try again';
      secondary.textContent = state.operation === 'cancel' ? 'Keep notification' : 'Not now';
      announce(state.errorMessage || 'The host returned an error. No green confirmation is shown.');
    } else if (state.phase === 'indeterminate') {
      heading.textContent = 'Checking your notification status';
      description.textContent = `The host did not answer in time. ${expertName} was not changed by this preview.`;
      submit.textContent = 'Check status';
      secondary.textContent = 'Close';
      announce('Status is unknown. Reconcile the same request; do not send a duplicate.');
    }
    if (!modal.hidden) window.setTimeout(() => (indeterminate ? reconcile : (pending ? secondary : heading))?.focus(), 0);
  };
  const open = ({ id = 'mia-jacomo', name = 'Mia Jacomo', trigger = null, phase = null, outcome = '' } = {}) => {
    if (id !== 'mia-jacomo') return;
    clearTimers();
    expertId = id; expertName = name; opener = trigger instanceof HTMLElement ? trigger : (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    const state = stateFor(id);
    if (!state.confirmed && !['pending', 'indeterminate', 'error'].includes(state.phase)) { state.phase = phase || 'idle'; state.operation = null; state.errorMessage = ''; }
    if (phase === 'indeterminate') { state.phase = 'indeterminate'; state.operation = 'notify'; state.errorMessage = 'Timed out while checking availability.'; }
    state.outcome = outcome || state.outcome || '';
    modal.hidden = false;
    document.documentElement.classList.add('nebula-modal-open');
    fenceBackground();
    render();
    heading.focus({ preventScroll: true });
  };
  const close = ({ restoreFocus = true, reason = 'dismiss' } = {}) => {
    if (modal.hidden) return;
    const state = stateFor();
    if (state.phase === 'pending' || state.phase === 'cancelling') {
      clearTimers();
      emit('nebula:consultation-notification-aborted', { ...snapshot(state), reason, requestId: state.requestId });
      state.phase = state.confirmed ? 'confirmed' : 'idle';
      state.operation = null;
      state.requestId = null;
      state.idempotencyKey = null;
      state.updatedAt = now();
      operation = null;
      publish(state);
    }
    modal.hidden = true;
    document.documentElement.classList.remove('nebula-modal-open');
    releaseBackground();
    if (restoreFocus && opener?.isConnected) opener.focus({ preventScroll: true });
    opener = null;
  };
  const selectedChannels = () => channels.filter((input) => input.checked).map((input) => input.value);
  const beginOperation = (kind, { reconcileRequest = false } = {}) => {
    const state = stateFor();
    if (kind === 'notify' && !selectedChannels().length) { announce('Choose at least one channel before continuing.'); channels[0].focus(); return; }
    const isCancel = kind === 'cancel';
    const requestId = reconcileRequest && state.requestId ? state.requestId : `mia-notification-${++sequence}`;
    const idempotencyKey = reconcileRequest && state.idempotencyKey ? state.idempotencyKey : `mia-notification:${requestId}`;
    state.channels = isCancel ? state.channels : selectedChannels();
    state.requestId = requestId; state.idempotencyKey = idempotencyKey; state.operation = isCancel ? 'cancel' : 'notify'; state.phase = isCancel ? 'cancelling' : 'pending'; state.updatedAt = now(); state.errorMessage = '';
    operation = { expertId, requestId, idempotencyKey, kind };
    render();
    const detail = { expertId, expertName, channels: state.channels, requestId, idempotencyKey, operation: state.operation, demo: true, backendRequired: false, persisted: false, sessionMutated: false, billingMutated: false, staticProjection: true };
    emit('nebula:consultation-notification-intent', detail);
    emit(`nebula:consultation-notification-${isCancel ? 'cancel-' : ''}intent`, detail);
    // This delayed receipt is the named local host adapter, not a backend
    // simulation. Production must replace it with a real, correlated receipt.
    const fault = page.dataset.miaNotificationTestFault || '';
    delete page.dataset.miaNotificationTestFault;
    if (fault === 'timeout') {
      timeoutTimer = window.setTimeout(() => markIndeterminate('Host acknowledgement timed out.'), 650);
    } else if (fault === 'error' || fault === 'cancel-error') {
      ackTimer = window.setTimeout(() => markError('The local host rejected this request.', isCancel ? 'cancel' : 'notify'), 260);
    } else {
      ackTimer = window.setTimeout(() => emit(isCancel ? 'nebula:consultation-notification-cancel-receipt' : 'nebula:consultation-notification-receipt', { ...detail, accepted: true, confirmed: true, demo: true, persisted: false }), 260);
      timeoutTimer = window.setTimeout(() => { if (operation?.requestId === requestId && ['pending', 'cancelling'].includes(stateFor().phase)) markIndeterminate('Host acknowledgement timed out.'); }, 1200);
    }
  };
  const markError = (message, kind = operation?.kind === 'cancel' ? 'cancel' : 'notify') => {
    const state = stateFor();
    if (!operation || operation.expertId !== expertId || state.requestId !== operation.requestId) return;
    clearTimers();
    state.phase = 'error'; state.operation = kind; state.confirmed = kind === 'cancel' ? true : state.confirmed; state.errorMessage = message; state.updatedAt = now();
    publish(state); render();
    emit('nebula:consultation-notification-error', { ...snapshot(state), requestId: state.requestId, operation: kind, error: message, source: 'ui' });
  };
  const markIndeterminate = (message) => {
    const state = stateFor();
    if (!operation || operation.expertId !== expertId || state.requestId !== operation.requestId) return;
    clearTimers(); state.phase = 'indeterminate'; state.errorMessage = message; state.updatedAt = now(); publish(state); render();
    emit('nebula:consultation-notification-timeout', { ...snapshot(state), requestId: state.requestId, operation: state.operation, reconciliationRequired: true, source: 'ui' });
  };
  const receipt = (detail, isCancel) => {
    const state = stateFor();
    if (!operation || detail?.expertId !== operation.expertId || detail?.requestId !== operation.requestId || detail?.idempotencyKey !== operation.idempotencyKey) return;
    clearTimers();
    if (detail.accepted !== true && detail.confirmed !== true) { markError(detail.error || 'The host did not confirm this request.', isCancel ? 'cancel' : 'notify'); return; }
    if (isCancel) { state.confirmed = false; state.phase = 'idle'; state.operation = null; state.requestId = null; state.idempotencyKey = null; }
    else { state.confirmed = true; state.phase = 'confirmed'; state.operation = null; }
    state.updatedAt = now(); operation = null; publish(state); render();
    emit('nebula:consultation-notification-changed', { ...snapshot(state), transition: isCancel ? 'cancelled' : 'confirmed', hostReceipt: true });
  };

  modal.querySelectorAll('[data-mia-notification-close]').forEach((button) => button.addEventListener('click', () => close()));
  submit.addEventListener('click', () => {
    const state = stateFor();
    if (state.phase === 'idle') beginOperation('notify');
    else if (state.phase === 'confirmed') close();
    else if (state.phase === 'error') beginOperation(state.operation === 'cancel' ? 'cancel' : 'notify', { reconcileRequest: true });
    else if (state.phase === 'indeterminate') beginOperation(state.operation || 'notify', { reconcileRequest: true });
  });
  secondary.addEventListener('click', () => {
    const state = stateFor();
    if (state.phase === 'confirmed') beginOperation('cancel');
    else close({ reason: 'secondary' });
  });
  reconcile.addEventListener('click', () => beginOperation(stateFor().operation || 'notify', { reconcileRequest: true }));
  channels.forEach((input) => input.addEventListener('change', () => { if (stateFor().phase === 'idle') stateFor().channels = selectedChannels(); }));
  modal.addEventListener('keydown', (event) => {
    if (modal.hidden) return;
    if (event.key === 'Escape') { event.preventDefault(); close(); return; }
    if (event.key !== 'Tab') return;
    const items = focusables(); if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });

  document.addEventListener('nebula:expert-unavailable-action', (event) => {
    const detail = event.detail || {};
    if (detail.action !== 'wait' || page.dataset.miaDialogueDemo !== 'true') return;
    open({ id: detail.expertId || 'mia-jacomo', name: detail.expertName || 'Mia Jacomo', trigger: detail.opener });
  });
  document.addEventListener('nebula:consultation-notification-open', (event) => {
    const detail = event.detail || {};
    if (detail.demo !== true || detail.expertId !== 'mia-jacomo') return;
    open({ id: detail.expertId, name: detail.expertName || 'Mia Jacomo', trigger: detail.opener });
  });
  document.addEventListener('nebula:mia-demo-availability', (event) => {
    const detail = event.detail || {};
    if (detail.expertId !== 'mia-jacomo' || (latestRunId && detail.runId && detail.runId !== latestRunId)) return;
    page.dataset.miaAvailabilityOutcome = detail.outcome || '';
    if (detail.outcome === 'busy') {
      page.dispatchEvent(new CustomEvent('nebula:expert-unavailable', { bubbles: true, detail: { intentSaved: true, expertId: detail.expertId, expertName: detail.expertName || 'Mia Jacomo', opener: detail.statusAnchor || null, demo: true } }));
    } else if (detail.outcome === 'offline') {
      document.dispatchEvent(new CustomEvent('nebula:connection-attempt-terminal', { detail: { outcome: 'expert_unavailable_or_offline', expertId: detail.expertId, expertName: detail.expertName || 'Mia Jacomo', statusAnchor: detail.statusAnchor || null, timedOut: false, demo: true, backendRequired: false, persisted: false, staticProjection: true } }));
    } else if (detail.outcome === 'timeout') {
      open({ id: detail.expertId, name: detail.expertName || 'Mia Jacomo', trigger: detail.statusAnchor, phase: 'indeterminate', outcome: 'timeout' });
    }
  });
  document.addEventListener('nebula:mia-demo-snapshot', (event) => { if (event.detail?.expertId === 'mia-jacomo') latestRunId = event.detail.runId || latestRunId; });
  document.addEventListener('nebula:mia-demo-reset', (event) => {
    if (event.detail?.expertId !== 'mia-jacomo') return;
    latestRunId = event.detail.runId || latestRunId;
    if (!modal.hidden) close({ restoreFocus: false, reason: 'demo-reset' });
    page.dataset.miaAvailabilityOutcome = '';
  });
  document.addEventListener('nebula:consultation-notification-receipt', (event) => receipt(event.detail || {}, false));
  document.addEventListener('nebula:consultation-notification-cancel-receipt', (event) => receipt(event.detail || {}, true));
  document.addEventListener('nebula:consultation-notification-error', (event) => { if (event.detail?.source !== 'ui') markError(event.detail?.error || 'The notification host returned an error.', event.detail?.operation || 'notify'); });
  document.addEventListener('nebula:consultation-notification-timeout', (event) => { if (event.detail?.source !== 'ui' && event.detail?.requestId === operation?.requestId) markIndeterminate(event.detail?.error || 'Host acknowledgement timed out.'); });
  document.addEventListener('nebula:mia-state-test-fault', (event) => {
    const kind = event.detail?.kind || event.detail?.fault;
    if (kind === 'notification-timeout') markIndeterminate('Host acknowledgement timed out.');
    else if (kind === 'notification-error' || kind === 'cancel-error') markError('The local host rejected this request.', kind === 'cancel-error' ? 'cancel' : 'notify');
  });
  document.addEventListener('nebula:chat-conversation-selected-local', (event) => {
    if (!modal.hidden && event.detail?.conversationId !== expertId) close({ restoreFocus: false, reason: 'expert-changed' });
  });
  window.addEventListener('pagehide', () => { clearTimers(); close({ restoreFocus: false, reason: 'pagehide' }); });

  window.NebulaMiaStateInteractions = {
    getState: (id = 'mia-jacomo') => snapshot(stateFor(id)),
    injectFault: (kind) => { page.dataset.miaNotificationTestFault = kind; return snapshot(stateFor()); },
    reconcile: () => { if (stateFor().phase === 'indeterminate') beginOperation(stateFor().operation || 'notify', { reconcileRequest: true }); },
  };
  page.dataset.miaStateInteractionsReady = 'true';
  page.dispatchEvent(new CustomEvent('nebula:mia-state-interactions-ready', { bubbles: true }));
  publish(stateFor());
})();
