(() => {
  'use strict';
  const root = document.querySelector('[data-nebula-consent-settings]');
  if (!root) return;
  const status = root.querySelector('[data-consent-status]');
  const toggles = [...root.querySelectorAll('[data-consent-toggle]')];
  const actions = [...root.querySelectorAll('[data-consent-action]')];
  if (toggles.length !== 4 || actions.length !== 2) return;
  // Ephemeral layout state only: no cookie, storage or backend access.
  let selected = toggles.map(() => true);
  let draft = [...selected];
  const announce = (message) => { if (status) status.textContent = message; };
  const render = () => {
    toggles.forEach((control, index) => {
      const checked = control.hasAttribute('data-consent-required') || draft[index];
      control.setAttribute('aria-checked', String(checked));
      control.querySelectorAll('[data-consent-on-src]').forEach((image) => {
        image.setAttribute(image.tagName === 'SOURCE' ? 'srcset' : 'src', checked ? image.dataset.consentOnSrc : image.dataset.consentOffSrc);
      });
    });
    root.dataset.selectionState = draft.every((value, index) => value === selected[index]) ? 'selected-in-preview' : 'draft';
  };
  toggles.forEach((control, index) => {
    control.disabled = control.hasAttribute('data-consent-required');
    control.addEventListener('click', () => {
      if (control.disabled) return;
      control.focus({ preventScroll: true });
      draft[index] = !draft[index];
      render();
      announce('Preview selection changed. Press Escape to undo. No browser preferences were changed.');
    });
  });
  actions.forEach((control) => {
    control.disabled = false;
    control.addEventListener('click', () => {
      control.focus({ preventScroll: true });
      const action = control.dataset.consentAction;
      if (action === 'reject') draft = toggles.map((toggle) => toggle.hasAttribute('data-consent-required'));
      selected = [...draft];
      render();
      root.dataset.lastAction = `consent-${action}-preview-only`;
      announce(action === 'reject'
        ? 'Optional categories rejected in this preview only. No browser preferences were changed.'
        : 'Choices confirmed in this preview only. No browser preferences were changed.');
      root.dispatchEvent(new CustomEvent('nebula:consent-action-required', {
        bubbles: true,
        detail: { action, selection: { targeting: draft[0], performance: draft[1], functional: draft[2], necessary: true }, backendRequired: true, persisted: false, cookieWrite: false, legalConsentChanged: false, staticProjection: true }
      }));
    });
  });
  root.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !event.target.closest('.nb-consent-options,.nb-consent-actions')) return;
    event.preventDefault();
    draft = [...selected];
    render();
    announce('Unsaved preview changes undone. No browser preferences were changed.');
  });
  render();
})();
