(() => {
  const root = document.querySelector('.offline');
  if (!root) return;
  const modal = root.querySelector('.offline__modal');
  const close = root.querySelector('.offline__close');
  // The mounted chatroom surface owns this dialog as a sibling of `.c76-frame`.
  // Fence only the underlying frame; inerting the whole `[data-nebula-chatroom]`
  // root also inerted the dialog itself and made its primary action unclickable.
  const surface = document.querySelector('[data-nebula-psychics], [data-nebula-chatroom]');
  const background = surface?.matches('[data-nebula-chatroom]')
    ? (surface.querySelector('.c76-frame') || surface)
    : surface;
  const miaPage = document.querySelector('[data-nebula-chatroom][data-mia-dialogue-demo="true"]');
  let returnFocus = null;
  const controls = () => [close, ...root.querySelectorAll('[data-action]')].filter((item) => item && !item.disabled && item.offsetParent !== null);
  const closeModal = ({ restoreFocus = true } = {}) => {
    if (root.hidden) return;
    root.hidden = true;
    document.documentElement.classList.remove('nebula-modal-open');
    if (background) { background.removeAttribute('inert'); background.removeAttribute('aria-hidden'); }
    if (restoreFocus && returnFocus instanceof HTMLElement && returnFocus.isConnected) returnFocus.focus();
  };
  const dismiss = () => {
    closeModal();
    root.dataset.lastAction = 'dismiss-intent-owner-required';
    root.dispatchEvent(new CustomEvent('nebula:expert-offline-dismiss-required', {
      bubbles: true,
      detail: { dismissOnly: true, backendRequired: true, staticProjection: true },
    }));
    close?.focus();
  };
  const dispatchIntent = (button) => {
    const action = button.dataset.action;
    if (action === 'notify' && miaPage) {
      const expertId = root.dataset.expertId || 'mia-jacomo';
      const expertName = root.dataset.expertName || 'Mia Jacomo';
      const opener = returnFocus;
      closeModal({ restoreFocus: false });
      document.dispatchEvent(new CustomEvent('nebula:consultation-booking-open', {
        detail: { expertId, expertName, rate: miaPage.querySelector('[data-chat-rate]')?.textContent?.trim() || '30 demo credits/min', opener },
      }));
      root.dataset.lastAction = 'offline-booking-opened-local-demo';
      return;
    }
    root.dispatchEvent(new CustomEvent('nebula:expert-offline-intent', {
      bubbles: true,
      detail: { action, backendRequired: true, staticProjection: true },
    }));
  };
  root.querySelectorAll('[data-action]').forEach((button) => button.addEventListener('click', () => dispatchIntent(button)));
  document.addEventListener('nebula:connection-attempt-terminal', (event) => {
    const detail = event.detail || {};
    if (detail.outcome !== 'expert_unavailable_or_offline') return;
    returnFocus = detail.statusAnchor instanceof HTMLElement ? detail.statusAnchor : document.activeElement;
    root.dataset.expertId = detail.expertId || '';
    root.dataset.expertName = detail.expertName || '';
    if (detail.expertName && miaPage) {
      root.querySelector('#offline-title').textContent = `${detail.expertName} is currently offline`;
      root.querySelector('.offline__content>p').textContent = `${detail.expertName} matches your question but is currently offline. Choose another expert or book a time when they can meet you.`;
      const notify = root.querySelector('[data-action="notify"]');
      if (notify) notify.textContent = 'Book a consultation';
    }
    root.hidden = false;
    document.documentElement.classList.add('nebula-modal-open');
    if (background) { background.setAttribute('inert', ''); background.setAttribute('aria-hidden', 'true'); }
    root.dataset.lastAction = 'connection-terminal-offline';
    close?.focus();
  });
  document.addEventListener('nebula:mia-demo-reset', (event) => {
    if (miaPage && event.detail?.expertId === 'mia-jacomo') closeModal({ restoreFocus: false });
  });
  close?.addEventListener('click', dismiss);
  modal?.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { event.preventDefault(); dismiss(); return; }
    if (event.key !== 'Tab') return;
    const order = controls();
    if (!order.length) return;
    const first = order[0]; const last = order[order.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  if (!root.hidden) close?.focus();
})();
