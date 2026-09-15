function createConnectionAttemptProjection({ now, onOpen, onProgress, onTerminal, onRejected }) {
  let activeAttempt = null;
  let settled = false;
  let lastProgress = 0;
  const terminalOutcomes = new Set(['expert_ready', 'expert_unavailable_or_offline', 'expert_busy']);
  const reject = (reason) => { onRejected(reason); return false; };
  const progressAt = () => {
    if (!activeAttempt) return 0;
    const elapsed = Math.max(0, now() - activeAttempt.startedAt);
    const value = Math.max(lastProgress, Math.min(100, (elapsed / (activeAttempt.deadline - activeAttempt.startedAt)) * 100));
    lastProgress = value;
    onProgress(value);
    return value;
  };
  const validSnapshot = (snapshot) => snapshot
    && typeof snapshot.connectionAttemptId === 'string' && snapshot.connectionAttemptId.length > 0
    && Number.isFinite(snapshot.startedAt) && Number.isFinite(snapshot.deadline)
    && snapshot.deadline - snapshot.startedAt === 30000
    && snapshot.expertSnapshot && typeof snapshot.expertSnapshot.id === 'string' && snapshot.expertSnapshot.id.length > 0
    && typeof snapshot.expertSnapshot.displayName === 'string' && snapshot.expertSnapshot.displayName.length > 0
    && snapshot.expertState === 'connecting'
    && ['pending', ...terminalOutcomes].includes(snapshot.outcome);
  const validReadyConfirmation = (snapshot) => {
    const confirmation = snapshot.sessionConfirmation;
    return confirmation && confirmation.confirmed === true && typeof confirmation.sessionId === 'string' && confirmation.sessionId.length > 0
      && confirmation.expertId === activeAttempt.expertId && typeof confirmation.route === 'string' && confirmation.route.startsWith('/');
  };
  const settle = (outcome, snapshot, timedOut = false) => {
    if (settled) return false;
    settled = true;
    lastProgress = 100;
    onProgress(100);
    onTerminal({ outcome, snapshot, timedOut, attempt: activeAttempt });
    return true;
  };
  return {
    apply(snapshot, expectedExpertId) {
      if (!validSnapshot(snapshot)) return reject('malformed');
      if (snapshot.expertSnapshot.id !== expectedExpertId) return reject('wrong-expert');
      if (!activeAttempt) {
        activeAttempt = { id: snapshot.connectionAttemptId, startedAt: snapshot.startedAt, deadline: snapshot.deadline, expertId: snapshot.expertSnapshot.id };
        onOpen(snapshot);
      } else if (snapshot.connectionAttemptId !== activeAttempt.id) return reject('wrong-attempt');
      else if (snapshot.startedAt !== activeAttempt.startedAt || snapshot.deadline !== activeAttempt.deadline || snapshot.expertSnapshot.id !== activeAttempt.expertId) return reject('attempt-mismatch');
      if (settled) return false;
      progressAt();
      if (snapshot.outcome === 'pending') return true;
      if (snapshot.outcome === 'expert_ready' && !validReadyConfirmation(snapshot)) return reject('ready-missing-session-confirmation');
      return settle(snapshot.outcome, snapshot);
    },
    tick() {
      if (!activeAttempt || settled) return false;
      progressAt();
      if (now() < activeAttempt.deadline) return false;
      return settle('expert_unavailable_or_offline', null, true);
    },
    cancel() {
      if (!activeAttempt || settled) return null;
      settled = true;
      return activeAttempt;
    },
  };
}

(() => {
  const root = document.querySelector('[data-nebula-connecting-expert]');
  if (!root) return;
  const frame = root.querySelector('.connecting-expert__frame');
  const modal = root.querySelector('.connecting-expert__modal');
  const heading = root.querySelector('#connecting-expert-title');
  const close = root.querySelector('[data-connecting-action="dismiss"]');
  const progress = root.querySelector('[data-connecting-progress]');
  const live = root.querySelector('[data-connecting-live]');
  if (!frame || !modal || !heading || !close || !progress) return;

  let statusAnchor = document.querySelector('[data-connecting-fixture-anchor]');
  let expectedExpertId = '';
  let expectedExpertName = '';
  let progressFrameId = null;
  const background = document.querySelector('[data-nebula-psychics], [data-nebula-chatroom]');
  const announce = (text) => { if (live) live.textContent = text; };
  const cancelProgressFrame = () => {
    if (progressFrameId === null) return;
    window.cancelAnimationFrame(progressFrameId);
    progressFrameId = null;
  };
  const closeModal = ({ restoreFocus = true } = {}) => {
    cancelProgressFrame();
    root.hidden = true;
    frame.hidden = true;
    document.documentElement.classList.remove('nebula-modal-open');
    if (background) { background.removeAttribute('inert'); background.removeAttribute('aria-hidden'); }
    if (restoreFocus) statusAnchor?.focus();
  };
  const setProgress = (value) => {
    const percent = Math.round(Math.max(0, Math.min(100, value)));
    root.style.setProperty('--connecting-attempt-progress', `${percent}%`);
    progress.setAttribute('aria-valuenow', String(percent));
    progress.setAttribute('aria-valuetext', 'Connection progress');
  };
  let projection;
  const createProjection = () => createConnectionAttemptProjection({
    now: () => Date.now(),
    onOpen: (snapshot) => {
      expectedExpertName = snapshot.expertSnapshot.displayName;
      heading.textContent = `Connecting you to ${expectedExpertName} so you can get the answer to your question`;
      root.hidden = false;
      frame.hidden = false;
      document.documentElement.classList.add('nebula-modal-open');
      if (background) { background.setAttribute('inert', ''); background.setAttribute('aria-hidden', 'true'); }
      root.dataset.lastAction = 'connection-attempt-opened';
      heading.focus();
      announce('Consultation is connecting. You will not be charged during this step.');
    },
    onProgress: setProgress,
    onRejected: (reason) => {
      root.dataset.lastAction = `connection-attempt-rejected-${reason}`;
      announce('Connection update was ignored because it did not match this request.');
    },
    onTerminal: ({ outcome, snapshot, timedOut, attempt }) => {
      cancelProgressFrame();
      root.dataset.lastAction = `connection-attempt-settled-${outcome}`;
      if (outcome === 'expert_ready') {
        window.location.assign(snapshot.sessionConfirmation.route);
        return;
      }
      closeModal({ restoreFocus: false });
      root.dispatchEvent(new CustomEvent('nebula:connection-attempt-terminal', {
        bubbles: true,
        detail: { outcome, timedOut, connectionAttemptId: attempt.id, expertId: attempt.expertId, expertName: expectedExpertName, statusAnchor, backendRequired: true, paymentCaptured: false, balanceChanged: false, sessionCreated: false, billingStarted: false, persisted: false, staticProjection: true },
      }));
    },
  });
  projection = createProjection();
  const scheduleProgress = () => {
    cancelProgressFrame();
    const nextFrame = () => {
      projection.tick();
      if (!root.hidden) progressFrameId = window.requestAnimationFrame(nextFrame);
    };
    progressFrameId = window.requestAnimationFrame(nextFrame);
  };
  const dismiss = (reason) => {
    const attempt = projection.cancel();
    closeModal();
    root.dataset.lastAction = 'connecting-dismiss-requested';
    if (attempt) root.dispatchEvent(new CustomEvent('nebula:connection-attempt-cancel-required', { bubbles: true, detail: { reason, connectionAttemptId: attempt.id, expertId: attempt.expertId, backendRequired: true, paymentCaptured: false, balanceChanged: false, sessionCreated: false, billingStarted: false, persisted: false, staticProjection: true } }));
    announce('Connection request dismissed. No paid session or billing state was changed.');
  };

  close.addEventListener('click', () => dismiss('close-button'));
  modal.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { event.preventDefault(); dismiss('escape'); return; }
    if (event.key === 'Tab') { event.preventDefault(); close.focus(); }
  });
  root.addEventListener('nebula:connection-attempt-selected-expert', (event) => {
    const detail = event.detail || {};
    if (typeof detail.expertId !== 'string' || !detail.expertId) return;
    if (detail.expertId !== expectedExpertId) projection = createProjection();
    expectedExpertId = detail.expertId;
    expectedExpertName = typeof detail.expertName === 'string' ? detail.expertName : '';
    statusAnchor = detail.statusAnchor instanceof HTMLElement ? detail.statusAnchor : statusAnchor;
    root.dataset.expectedExpertId = expectedExpertId;
  });
  root.addEventListener('nebula:connection-attempt-snapshot', (event) => {
    if (!expectedExpertId || !projection.apply(event.detail || {}, expectedExpertId)) return;
    scheduleProgress();
  });
  document.addEventListener('nebula:connection-attempt-snapshot', (event) => {
    root.dispatchEvent(new CustomEvent('nebula:connection-attempt-snapshot', { detail: event.detail || {} }));
  });
  root.addEventListener('nebula:connection-attempt-terminal', () => { expectedExpertId = ''; });
  root.addEventListener('nebula:connection-attempt-cancel-required', () => { expectedExpertId = ''; });
  root.hidden = true;
  frame.hidden = true;
})();
