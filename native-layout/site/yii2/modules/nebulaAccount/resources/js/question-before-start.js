(() => {
  const root = document.querySelector('[data-nebula-question-before-start]');
  if (!root) return;

  const frame = root.querySelector('.question-before-start__frame');
  const modal = root.querySelector('.question-before-start__modal');
  const close = root.querySelector('[data-question-action="close"]');
  const subject = root.querySelector('[data-question-subject]');
  const dob = root.querySelector('[data-question-dob]');
  const details = root.querySelector('[data-question-details]');
  const attachment = root.querySelector('[data-question-action="attachment-intent"]');
  const submit = root.querySelector('[data-question-action="submit-intent"]');
  const live = root.querySelector('[data-question-live]');
  if (!frame || !modal || !close || !subject || !dob || !details || !attachment || !submit) return;
  const description = root.querySelector('#question-before-start-description');
  // PHP supplies the finite fixture identity map. It is not an entitlement or price catalog.
  const targets = new Map();
  try {
    const supplied = JSON.parse(root.dataset.questionTargets || 'null');
    if (!Array.isArray(supplied) || !supplied.length) return;
    for (const target of supplied) {
      if (!target || typeof target.id !== 'string' || !target.id.trim()
        || typeof target.displayName !== 'string' || !target.displayName.trim() || targets.has(target.id)) return;
      targets.set(target.id, Object.freeze({id: target.id, displayName: target.displayName}));
    }
  } catch (_) { return; }
  const initialTarget = targets.get(root.dataset.questionExpertId);
  if (!initialTarget || !description) return;
  let activeTarget = initialTarget;
  let opener = null;
  // Unsent personal fields stay in this document only; never cross expert owners.
  const drafts = new Map();
  const saveDraft = () => drafts.set(activeTarget.id, {subject: subject.value, dob: dob.value, details: details.value});
  const backgroundOwner = document.querySelector('[data-nebula-psychics], [data-nebula-chatroom]');
  // In Chatroom the modal is a child of <main>; making main inert also disables
  // the modal itself. Fence only its sibling content frame, never its ancestor.
  const background = backgroundOwner?.matches('[data-nebula-chatroom]') && backgroundOwner.contains(root)
    ? backgroundOwner.querySelector('.c76-frame') : backgroundOwner;

  const announce = (message) => {
    if (live) live.textContent = message;
  };

  root.addEventListener('nebula:question-before-start-open', (event) => {
    const selectedId = Object.prototype.hasOwnProperty.call(event.detail || {}, 'selectedExpertId')
      ? event.detail.selectedExpertId : initialTarget.id;
    const target = targets.get(selectedId);
    if (!target) {
      root.dataset.lastAction = 'question-open-rejected-unknown-expert';
      announce('The selected expert requires a source-bound question target.');
      return;
    }
    saveDraft();
    const changed = activeTarget.id !== target.id;
    activeTarget = target;
    const draft = drafts.get(target.id);
    subject.value = draft?.subject || '';
    dob.value = draft?.dob || '';
    details.value = draft?.details || '';
    if (changed) { dob.removeAttribute('aria-invalid'); details.removeAttribute('aria-invalid'); }
    description.textContent = 'Give ' + target.displayName + ' enough context before the consultation begins';
    root.dataset.selectedExpertId = target.id;
    opener = event.detail?.trigger instanceof HTMLElement
      ? event.detail.trigger
      : (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    root.hidden = false;
    frame.hidden = false;
    document.documentElement.classList.add('nebula-modal-open');
    if (background) { background.setAttribute('inert', ''); background.setAttribute('aria-hidden', 'true'); }
    root.dataset.lastAction = 'question-before-start-opened';
    subject.focus();
    announce('Question form opened.');
  });

  // The paid-chat launcher is owned by the chatroom, while this Figma form is
  // the single place where a client supplies the consultation question.
  // Relay its public intent to this concrete form instead of maintaining a
  // second confirmation dialog.
  document.addEventListener('nebula:open-question-before-start', (event) => {
    if (event.target === root) return;
    const detail = event.detail || {};
    root.dispatchEvent(new CustomEvent('nebula:question-before-start-open', {
      bubbles: true,
      detail: {
        selectedExpertId: detail.selectedExpertId || initialTarget.id,
        trigger: detail.trigger instanceof HTMLElement ? detail.trigger : null,
        source: detail.source || 'paid-consultation-launcher',
      },
    }));
  });

  // A client-only walkthrough may advance to the connecting fixture after
  // validation. This closes the local question surface without recording a
  // cancellation or implying that any personal data was persisted.
  root.addEventListener('nebula:question-before-start-client-transition', (event) => {
    const detail = event.detail || {};
    if (root.hidden || frame.hidden || detail.selectedExpertId !== activeTarget.id || detail.staticProjection !== true) return;
    saveDraft();
    frame.hidden = true;
    root.hidden = true;
    document.documentElement.classList.remove('nebula-modal-open');
    if (background) { background.removeAttribute('inert'); background.removeAttribute('aria-hidden'); }
    root.dataset.lastAction = 'client-transition-to-connecting-preview';
    announce('Question accepted for the client preview. Opening the chat fixture.');
  });

  const closeFixture = () => {
    saveDraft();
    frame.hidden = true;
    root.hidden = true;
    document.documentElement.classList.remove('nebula-modal-open');
    if (background) { background.removeAttribute('inert'); background.removeAttribute('aria-hidden'); }
    root.dataset.lastAction = 'close-intent-owner-transition-required';
    announce('Question form close intent recorded.');
    root.dispatchEvent(new CustomEvent('nebula:question-before-start-dismiss-required', {
      bubbles: true,
      detail: { selectedExpertId: activeTarget.id, dismissOnly: true, backendRequired: true, staticProjection: true, sessionCreated: false }
    }));
    opener?.focus();
  };

  close.addEventListener('click', closeFixture);
  frame.addEventListener('click', (event) => {
    if (event.target === frame) closeFixture();
  });
  modal.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeFixture();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusables = [close, subject, dob, details, attachment, root.querySelector('[data-question-action="skip-demo"]'), submit].filter(e => e && e.getClientRects().length && !e.disabled);
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

  attachment.addEventListener('click', () => {
    root.dataset.lastAction = 'attachment-policy-required';
    announce('Attachment selection requires the server file policy.');
  });

  const validDob = (value) => {
    if (!value) return true;
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return false;
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const parsed = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return parsed.getFullYear() === year
      && parsed.getMonth() === month - 1
      && parsed.getDate() === day
      && parsed <= today;
  };

  const finishDemoQuestion = (text) => {
    if (!document.querySelector('[data-mia-dialogue-demo="true"]')) return false;
    root.dispatchEvent(new CustomEvent('nebula:question-before-start-client-transition', { bubbles: true, detail: { selectedExpertId: activeTarget.id, staticProjection: true } }));
    document.dispatchEvent(new CustomEvent('nebula:mia-demo-question', { detail: { text } }));
    return true;
  };
  root.querySelector('[data-question-action="skip-demo"]')?.addEventListener('click', () => finishDemoQuestion(''));

  submit.addEventListener('click', () => {
    if (root.hidden || frame.hidden) return;
    const dobValue = dob.value.trim();
    const dobValid = validDob(dobValue);
    dob.setAttribute('aria-invalid', dobValid ? 'false' : 'true');
    if (!dobValid) {
      dob.focus();
      root.dataset.lastAction = 'validation-dob-invalid';
      announce('Choose a valid date of birth.');
      return;
    }
    const body = details.value.trim();
    details.setAttribute('aria-invalid', body ? 'false' : 'true');
    if (!body) {
      details.focus();
      root.dataset.lastAction = 'validation-question-required';
      announce('Enter a detailed question.');
      return;
    }
    if (finishDemoQuestion(body)) return;
    root.dataset.lastAction = 'free-message-submit-intent-backend-required';
    announce('The question is ready. Waiting for the expert connection.');
    // The 30-second Connecting screen is always the next visual step after a
    // valid paid-consultation request. It is only a presentation attempt: no
    // session, payment or billing state is created here.
    root.dispatchEvent(new CustomEvent('nebula:question-before-start-client-transition', {
      bubbles: true,
      detail: { selectedExpertId: activeTarget.id, staticProjection: true },
    }));
    document.dispatchEvent(new CustomEvent('nebula:connection-presentation-open', {
      detail: {
        expertId: activeTarget.id,
        expertName: activeTarget.displayName,
        statusAnchor: opener instanceof HTMLElement ? opener : null,
        durationMs: 30000,
        presentationOnly: true,
      },
    }));
    root.dispatchEvent(new CustomEvent('nebula:connection-attempt-required', {
      bubbles: true,
      detail: {
        expertId: activeTarget.id,
        expert: activeTarget.displayName,
        backendRequired: true,
        paymentCaptured: false,
        balanceChanged: false,
        sessionCreated: false,
        billingStarted: false,
        persisted: false,
        staticProjection: true,
      },
    }));
    root.dispatchEvent(new CustomEvent('nebula:question-before-start-submit-required', {
      bubbles: true,
      detail: {
        selectedExpertId: activeTarget.id,
        subjectLength: subject.value.trim().length,
        hasDob: Boolean(dobValue),
        detailsLength: body.length,
        attachmentSelected: false,
        trigger: opener instanceof HTMLElement ? opener : null,
        backendRequired: true,
        persisted: false,
        sessionCreated: false,
        staticProjection: true
      }
    }));
  });
})();
