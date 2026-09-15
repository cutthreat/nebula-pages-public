(() => {
  const root = document.querySelector('[data-nebula-chatroom]');
  const frame = root?.querySelector('.c76-frame');
  const opener = root?.querySelector('[data-action="open-expert-details"]');
  const modal = root?.querySelector('[data-expert-details-modal]');
  const scrim = modal?.querySelector('[data-action="close-expert-details"]');
  if (!root || !frame || !opener || !modal || !scrim) return;

  const desktop = window.matchMedia('(min-width: 321px)');
  const activeDialog = () => modal.querySelector(desktop.matches ? '.expert-card--standard' : '.expert-card--mobile');
  const activeHeading = () => activeDialog()?.querySelector('h2');
  const focusables = () => Array.from(activeDialog()?.querySelectorAll('button:not([disabled]),a[href]') || [])
    .filter((item) => item.offsetParent !== null);

  const announce = (message) => {
    const live = root.querySelector('[data-c76-live-status]');
    if (live) live.textContent = message;
  };

  const close = () => {
    if (modal.hidden) return;
    modal.hidden = true;
    opener.setAttribute('aria-expanded', 'false');
    frame.removeAttribute('aria-hidden');
    frame.inert = false;
    document.documentElement.classList.remove('c76-modal-open');
    root.dataset.overlayState = 'closed';
    opener.focus();
    announce('Expert details closed.');
  };

  const open = () => {
    if (!modal.hidden) return;
    modal.hidden = false;
    opener.setAttribute('aria-expanded', 'true');
    frame.setAttribute('aria-hidden', 'true');
    frame.inert = true;
    document.documentElement.classList.add('c76-modal-open');
    root.dataset.overlayState = 'expert_details_open';
    activeHeading()?.focus();
    announce('Expert details opened.');
  };

  opener.addEventListener('click', open);
  opener.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    open();
  });

  modal.querySelectorAll('[data-expert-details-close]').forEach((button) => button.addEventListener('click', close));

  scrim.addEventListener('click', (event) => {
    if (event.target === scrim) close();
  });

  modal.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== 'Tab') return;
    const items = focusables();
    if (!items.length) {
      event.preventDefault();
      activeHeading()?.focus();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === activeHeading())) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  modal.querySelectorAll('[data-expert-action]').forEach((control) => {
    control.addEventListener('click', () => {
      root.dataset.lastAction = `${control.dataset.expertAction}-backend-required`;
      announce('This expert action requires the product backend.');
    });
  });

  root.dataset.chatOverlaysReady = 'true';
  root.dispatchEvent(new CustomEvent('nebula:chat-overlays-ready', { bubbles: true }));

  const unavailable = root.querySelector('[data-expert-unavailable-modal]');
  const unavailableScrim = unavailable?.querySelector('[data-action="close-expert-unavailable"]');
  const unavailableHeading = unavailable?.querySelector('h2');
  let unavailableReturnFocus = null;
  if (!unavailable || !unavailableScrim || !unavailableHeading) return;

  const unavailableFocusables = () => Array.from(unavailable.querySelectorAll('button:not([disabled])'))
    .filter((item) => item.offsetParent !== null);

  const closeUnavailable = ({ restoreFocus = true } = {}) => {
    if (unavailable.hidden) return;
    unavailable.hidden = true;
    frame.removeAttribute('aria-hidden');
    frame.inert = false;
    document.documentElement.classList.remove('c76-modal-open');
    root.dataset.overlayState = 'closed';
    if (restoreFocus && unavailableReturnFocus instanceof HTMLElement && unavailableReturnFocus.isConnected) {
      unavailableReturnFocus.focus();
    }
    announce('Expert unavailable dialog closed.');
  };

  const openUnavailable = (detail = {}) => {
    if (detail.intentSaved !== true) {
      announce('The expert availability could not be confirmed. Please try again.');
      return;
    }
    close();
    unavailableReturnFocus = detail.opener instanceof HTMLElement ? detail.opener : document.activeElement;
    unavailable.dataset.expertId = detail.expertId || '';
    unavailable.dataset.expertName = detail.expertName || '';
    if (detail.expertName && root.dataset.miaDialogueDemo === 'true') {
      unavailableHeading.textContent = `${detail.expertName} is busy right now`;
      unavailable.querySelector('.expert-unavailable__copy p').textContent = `${detail.expertName} is currently helping another client. You can ask to be notified when they are available or choose another expert.`;
      const wait = unavailable.querySelector('[data-unavailable-action="wait"]');
      if (wait) {
        wait.textContent = 'Notify me when available';
        wait.setAttribute('aria-label', `Notify me when ${detail.expertName} is available`);
      }
    }
    unavailable.hidden = false;
    frame.setAttribute('aria-hidden', 'true');
    frame.inert = true;
    document.documentElement.classList.add('c76-modal-open');
    root.dataset.overlayState = 'expert_unavailable';
    unavailableHeading.focus();
    announce('The selected expert is busy.');
  };

  document.addEventListener('nebula:mia-demo-reset', (event) => {
    if (root.dataset.miaDialogueDemo === 'true' && event.detail?.expertId === 'mia-jacomo') closeUnavailable({ restoreFocus: false });
  });

  root.addEventListener('nebula:expert-unavailable', (event) => openUnavailable(event.detail || {}));
  document.addEventListener('nebula:connection-attempt-terminal', (event) => {
    const detail = event.detail || {};
    if (detail.outcome !== 'expert_busy') return;
    openUnavailable({ intentSaved: true, opener: detail.statusAnchor });
  });
  unavailableScrim.addEventListener('click', (event) => {
    if (event.target === unavailableScrim) closeUnavailable();
  });
  unavailable.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeUnavailable();
      return;
    }
    if (event.key !== 'Tab') return;
    const items = unavailableFocusables();
    if (!items.length) {
      event.preventDefault();
      unavailableHeading.focus();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === unavailableHeading)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  unavailable.querySelector('[data-unavailable-action="close"]')?.addEventListener('click', closeUnavailable);
  unavailable.querySelector('[data-unavailable-action="wait"]')?.addEventListener('click', (event) => {
    if (root.dataset.miaDialogueDemo === 'true') {
      const detail = { action: 'wait', expertId: unavailable.dataset.expertId || 'mia-jacomo', expertName: unavailable.dataset.expertName || unavailableHeading.textContent.replace(/^The | is busy.*$/g, ''), opener: unavailableReturnFocus, demo: true, persisted: false, backendRequired: false };
      closeUnavailable({ restoreFocus: false });
      root.dispatchEvent(new CustomEvent('nebula:expert-unavailable-action', { bubbles: true, detail }));
      return;
    }
    closeUnavailable();
  });
  unavailable.querySelector('[data-unavailable-action="select-another"]')?.addEventListener('click', () => {
    root.dataset.lastAction = 'select-another-expert-server-required';
    if (root.dataset.miaDialogueDemo === 'true') closeUnavailable({ restoreFocus: false });
    root.dispatchEvent(new CustomEvent('nebula:select-alternative-expert', { bubbles: true }));
    announce('Finding an eligible available expert requires the matching service.');
  });
  unavailable.querySelector('[data-unavailable-action="question-in-advance"]')?.addEventListener('click', () => {
    root.dataset.lastAction = 'question-in-advance-state-required';
    root.dispatchEvent(new CustomEvent('nebula:open-question-before-start', { bubbles: true }));
    announce('The advance question form is not connected yet.');
  });
})();
