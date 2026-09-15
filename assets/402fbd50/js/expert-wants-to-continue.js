(() => {
  const root = document.querySelector('[data-nebula-followup-offer]');
  if (!root) return;

  const frame = root.querySelector('.followup-offer__frame');
  const modal = root.querySelector('.followup-offer__modal');
  const heading = root.querySelector('#followup-offer-title');
  const close = root.querySelector('[data-offer-action="dismiss"]');
  const start = root.querySelector('[data-offer-action="accept"]');
  const live = root.querySelector('[data-offer-live]');
  const display = {
    subtitle: root.querySelector('#followup-offer-subtitle'),
    card: root.querySelector('.followup-offer__card'),
    avatar: root.querySelector('.followup-offer__avatar > img'),
    name: root.querySelector('.followup-offer__message strong'),
    message: root.querySelector('.followup-offer__message > span'),
    time: root.querySelector('.followup-offer__card time'),
    waiting: root.querySelector('.followup-offer__deadline p'),
    deadline: root.querySelector('.followup-offer__deadline strong'),
    presence: root.querySelector('.followup-offer__presence'),
  };
  if (!frame || !modal || !heading || !close || !start || Object.values(display).some((node) => !node)) return;

  let offerAnchor = document.querySelector('[data-offer-anchor]');
  let acceptPending = false;
  const announce = (message) => { if (live) live.textContent = message; };
  const detail = (reason) => ({
    reason,
    offerId: root.dataset.offerId || null,
    offerVersion: root.dataset.offerVersion || null,
    expertId: root.dataset.expertId || null,
    fixtureCopyOnly: root.dataset.visibleCopy === 'fixture-only',
    offerAccepted: false,
    sessionCreated: false,
    sessionStarted: false,
    connectingStarted: false,
    paymentStarted: false,
    balanceMutation: false,
  });
  const dismiss = (reason) => {
    root.hidden = true;
    frame.hidden = true;
    document.documentElement.classList.remove('nebula-modal-open');
    root.dataset.lastAction = 'followup-offer-dismissed';
    root.dispatchEvent(new CustomEvent('nebula:followup-offer-dismissed', { detail: detail(reason), bubbles: true }));
    offerAnchor?.focus();
    announce('Follow-up offer dismissed. The persistent free dialogue and server offer state are unchanged.');
  };

  close.addEventListener('click', () => dismiss('close-button'));
  start.addEventListener('click', () => {
    if (acceptPending) return;
    acceptPending = true;
    root.dataset.lastAction = 'consultation-offer-accept-requested';
    start.setAttribute('aria-disabled', 'true');
    start.setAttribute('aria-busy', 'true');
    root.dispatchEvent(new CustomEvent('nebula:consultation-offer-accept-requested', {
      detail: detail('start-chat-button'),
      bubbles: true,
    }));
    announce('Offer acceptance was requested from the host. No session, connection, payment or balance change occurred.');
  });

  root.addEventListener('nebula:followup-offer-accept-rejected', (event) => {
    const payload = event.detail || {};
    if (payload.offerId !== root.dataset.offerId || String(payload.offerVersion) !== root.dataset.offerVersion) return;
    acceptPending = false;
    start.removeAttribute('aria-disabled');
    start.removeAttribute('aria-busy');
    root.dataset.lastAction = 'consultation-offer-accept-rejected';
    start.focus();
    announce(payload.fixtureOnly ? 'Fixture simulated rejection — no host was called. Start chat is available to retry.' : 'The host rejected the offer acceptance request. Start chat is available to retry.');
  });

  modal.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      dismiss('escape');
      return;
    }
    if (event.key !== 'Tab') return;
    const focusables = [close, start];
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  root.addEventListener('nebula:followup-offer-open', (event) => {
    const payload = event.detail || {};
    const expert = payload.expertSnapshot || {};
    const scalar = (value) => typeof value === 'string' || typeof value === 'number' ? String(value) : '';
    const offerId = scalar(payload.offerId);
    const expertId = scalar(expert.id);
    // Rebind the complete existing PHP read model; flat IDs cannot relabel old copy.
    const valid = payload.serverState === 'expert_followup_offer_pending'
      && offerId && payload.offerVersion != null && expertId
      && scalar(payload.expiresAt) && payload.eligibility != null && payload.capabilities != null
      && payload.authenticatedClient === true && scalar(payload.deadlineLabel)
      && ['displayName', 'avatarUrl', 'messagePreview', 'messageTimeLabel', 'presenceState'].every((key) => scalar(expert[key]));
    if (!valid) {
      root.dataset.lastAction = 'open-rejected-authoritative-offer-required';
      announce('A complete server-authoritative follow-up offer snapshot is required.');
      return;
    }
    const sameOffer = offerId === root.dataset.offerId && String(payload.offerVersion) === root.dataset.offerVersion;
    offerAnchor = payload.offerAnchor instanceof HTMLElement ? payload.offerAnchor : offerAnchor;
    root.dataset.offerId = offerId;
    root.dataset.offerVersion = String(payload.offerVersion);
    root.dataset.expertId = expertId;
    root.dataset.offerExpiresAt = scalar(payload.expiresAt);
    const name = scalar(expert.displayName);
    display.subtitle.textContent = `${name} is already waiting for you!`;
    display.card.setAttribute('aria-label', `Follow-up message from ${name}`);
    display.avatar.src = scalar(expert.avatarUrl);
    display.avatar.alt = '';
    display.name.textContent = name;
    display.message.textContent = scalar(expert.messagePreview);
    display.time.textContent = scalar(expert.messageTimeLabel);
    display.waiting.textContent = `${name} is waiting for you.`;
    display.deadline.textContent = scalar(payload.deadlineLabel);
    display.presence.dataset.presenceState = scalar(expert.presenceState);
    if (!sameOffer) {
      acceptPending = false;
      start.removeAttribute('aria-disabled');
      start.removeAttribute('aria-busy');
    }
    root.hidden = false;
    frame.hidden = false;
    document.documentElement.classList.add('nebula-modal-open');
    root.dataset.lastAction = 'followup-offer-opened';
    heading.focus();
  });

  if (!root.hidden && !frame.hidden) {
    document.documentElement.classList.add('nebula-modal-open');
    requestAnimationFrame(() => heading.focus());
  }
})();
