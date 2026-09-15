(() => {
  'use strict';
  const root = document.querySelector('[data-expert-details-modal]');
  if (!root) return;
  const frame = root.querySelector('.chat-details__scrim');
  const dialogs = [...root.querySelectorAll('[role="dialog"]')];
  const heading = () => dialogs.find((dialog) => getComputedStyle(dialog).display !== 'none')?.querySelector('h2') || dialogs[0]?.querySelector('h2');
  let opener = document.querySelector('[data-expert-details-opener]');
  const emit = (name, detail) => root.dispatchEvent(new CustomEvent(name, { bubbles: true, detail }));
  const hide = (reason) => {
    root.hidden = true;
    document.documentElement.classList.remove('nebula-modal-open');
    emit('nebula:expert-details-dismiss-required', { reason, staticProjection: true, sessionMutation: false });
    opener?.focus();
  };
  const show = (trigger) => {
    opener = trigger instanceof HTMLElement ? trigger : opener;
    root.hidden = false;
    document.documentElement.classList.add('nebula-modal-open');
    requestAnimationFrame(() => heading()?.focus());
  };
  frame?.addEventListener('click', (event) => { if (event.target === frame) hide('scrim'); });
  root.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { event.preventDefault(); hide('escape'); return; }
    if (event.key === 'Tab' && !event.shiftKey && document.activeElement === heading()) { event.preventDefault(); heading()?.focus(); }
  });
  root.addEventListener('nebula:expert-details-open-requested', (event) => show(event.detail?.opener));
  root.querySelectorAll('[data-action="close-expert-details"]').forEach((node) => node.addEventListener('click', () => hide('close')));
})();
