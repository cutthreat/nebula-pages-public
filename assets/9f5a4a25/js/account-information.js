(() => {
  'use strict';
  const root = document.querySelector('[data-nebula-account-information]');
  if (!root) return;
  const status = root.querySelector('[data-account-information-status]');
  root.querySelectorAll('[data-account-information-edit]').forEach((button) => {
    const emit = () => {
      const field = button.dataset.accountInformationEdit || '';
      button.setAttribute('aria-pressed', 'true');
      if (status) status.textContent = `${field} edit is ready for the identity host.`;
      root.dispatchEvent(new CustomEvent('nebula:account-information-edit-required', {
        bubbles: true,
        detail: { field, backendRequired: true, profileMutation: false, saved: false, staticProjection: true },
      }));
    };
    button.addEventListener('click', emit);
    button.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); emit(); }
    });
  });
})();
