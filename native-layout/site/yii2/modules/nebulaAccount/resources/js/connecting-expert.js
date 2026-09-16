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
  const validPresentation = (presentation) => presentation
    && typeof presentation.expertId === 'string' && presentation.expertId.length > 0
    && typeof presentation.expertName === 'string' && presentation.expertName.length > 0
    && Number.isFinite(presentation.durationMs) && presentation.durationMs === 30000;
  const settle = (outcome, snapshot, timedOut = false) => {
    if (settled) return false;
    settled = true;
    lastProgress = 100;
    onProgress(100);
    onTerminal({ outcome, snapshot, timedOut, attempt: activeAttempt });
    return true;
  };
  return {
    beginPresentation(presentation) {
      if (!validPresentation(presentation) || (activeAttempt && !settled)) return reject('invalid-presentation');
      settled = false;
      lastProgress = 0;
      const startedAt = now();
      activeAttempt = {
        id: `presentation:${presentation.expertId}:${startedAt}`,
        startedAt,
        deadline: startedAt + presentation.durationMs,
        expertId: presentation.expertId,
        presentationOnly: true,
        demo: presentation.demo === true,
        requestId: presentation.requestId,
      };
      onOpen({ expertSnapshot: { id: presentation.expertId, displayName: presentation.expertName }, presentationOnly: true });
      progressAt();
      return true;
    },
    apply(snapshot, expectedExpertId) {
      if (!validSnapshot(snapshot)) return reject('malformed');
      if (snapshot.expertSnapshot.id !== expectedExpertId) return reject('wrong-expert');
      // A real service response replaces the visual-only wait for the same
      // expert. It never inherits a client presentation identity or route.
      if (activeAttempt?.presentationOnly) {
        activeAttempt = null;
        settled = false;
        lastProgress = 0;
      }
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
      return settle(activeAttempt.presentationOnly && activeAttempt.demo ? 'demo_ready' : 'expert_unavailable_or_offline', null, true);
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
  let inertBackground = [];
  let portraitSource = '';
  const countdown = root.querySelector('[data-connecting-countdown]');
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
    inertBackground.forEach((element) => { element.inert = false; });
    inertBackground = [];
    if (restoreFocus) statusAnchor?.focus();
  };
  const setProgress = (value) => {
    const percent = Math.round(Math.max(0, Math.min(100, value)));
    root.style.setProperty('--connecting-attempt-progress', `${percent}%`);
    progress.setAttribute('aria-valuenow', String(percent));
    const remaining = Math.max(0, Math.ceil(30 * (1 - value / 100)));
    progress.setAttribute('aria-valuetext', `${remaining} seconds remaining`);
    if (countdown) countdown.textContent = `${remaining} seconds remaining`;
  };
  let projection;
  const createProjection = () => createConnectionAttemptProjection({
    now: () => Date.now(),
    onOpen: (snapshot) => {
      expectedExpertName = snapshot.expertSnapshot.displayName;
      heading.textContent = `Connecting you to ${expectedExpertName} so you can get the answer to your question`;
      root.querySelector('.connecting-expert__profile strong').textContent = expectedExpertName;
      const portrait = root.querySelector('.connecting-expert__avatar img');
      portrait.alt = expectedExpertName;
      if (portraitSource) {
        portrait.src = portraitSource;
        root.querySelectorAll('.connecting-expert__avatar source').forEach((source) => { source.srcset = portraitSource; });
      }
      root.hidden = false;
      frame.hidden = false;
      document.documentElement.classList.add('nebula-modal-open');
      // Only sibling branches: the dialog can be embedded inside the page root.
      let branch = root;
      while (branch.parentElement && branch !== document.body) {
        Array.from(branch.parentElement.children).forEach((sibling) => {
          if (sibling !== branch && !sibling.inert) { sibling.inert = true; inertBackground.push(sibling); }
        });
        branch = branch.parentElement;
      }
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
      if (outcome === 'demo_ready') {
        root.dispatchEvent(new CustomEvent('nebula:connection-demo-ready', { bubbles: true, detail: { expertId: attempt.expertId, requestId: attempt.requestId, billingStarted: false } }));
        statusAnchor?.focus();
        return;
      }
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
    if (attempt) root.dispatchEvent(new CustomEvent(attempt.demo ? 'nebula:connection-demo-cancelled' : 'nebula:connection-attempt-cancel-required', { bubbles: true, detail: { reason, requestId: attempt.requestId, connectionAttemptId: attempt.id, expertId: attempt.expertId, backendRequired: !attempt.demo, paymentCaptured: false, balanceChanged: false, sessionCreated: false, billingStarted: false, persisted: false, staticProjection: true } }));
    statusAnchor?.focus();
    announce('Connection request dismissed. No paid session or billing state was changed.');
  };

  close.addEventListener('click', () => dismiss('close-button'));
  document.addEventListener('nebula:mia-demo-connection-settled', () => {
    if (!document.querySelector('[data-mia-dialogue-demo="true"]') || expectedExpertId !== 'mia-jacomo') return;
    projection.cancel(); closeModal(); expectedExpertId = '';
  });
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
  document.addEventListener('nebula:connection-presentation-open', (event) => {
    const detail = event.detail || {};
    if (typeof detail.expertId !== 'string' || !detail.expertId
      || typeof detail.expertName !== 'string' || !detail.expertName
      || detail.durationMs !== 30000 || detail.presentationOnly !== true) return;
    if (!root.hidden) return;
    cancelProgressFrame();
    expectedExpertId = detail.expertId;
    expectedExpertName = detail.expertName;
    statusAnchor = detail.statusAnchor instanceof HTMLElement ? detail.statusAnchor : statusAnchor;
    root.dataset.expectedExpertId = expectedExpertId;
    portraitSource = '';
    if (typeof detail.avatar === 'string') {
      try { const url = new URL(detail.avatar, window.location.href); if (url.origin === window.location.origin) portraitSource = url.href; } catch (_) {}
    }
    const demo = detail.demo === true && ['127.0.0.1', 'localhost', '[::1]'].includes(window.location.hostname)
      && document.querySelector('[data-nebula-chatroom][data-consultation-demo="true"][data-static-projection="true"]') !== null;
    root.dataset.connectionDemo = String(demo);
    projection = createProjection();
    if (!projection.beginPresentation({ expertId: expectedExpertId, expertName: expectedExpertName, durationMs: detail.durationMs, demo, requestId: detail.requestId })) return;
    scheduleProgress();
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
  window.addEventListener('pagehide', () => { if (!root.hidden) dismiss('pagehide'); });
  root.hidden = true;
  frame.hidden = true;
})();
