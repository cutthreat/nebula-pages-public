(() => {
  'use strict';

  const root = document.querySelector('[data-nebula-legal-center]');
  if (!root) return;

  const status = root.querySelector('[data-legal-center-status]');
  root.querySelectorAll('[data-legal-document]').forEach((button) => {
    const emitIntent = () => {
      button.setAttribute('aria-pressed', 'true');
      if (status) {
        status.textContent = `${button.dataset.legalDocument} is ready for the legal-document host.`;
      }
      root.dispatchEvent(new CustomEvent('nebula:legal-document-intent', {
        bubbles: true,
        detail: {
          document: button.dataset.legalDocument || '',
          backendRequired: true,
          documentOpened: false,
          navigationStarted: false,
          staticProjection: true,
        },
      }));
    };
    button.addEventListener('click', emitIntent);
    button.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        emitIntent();
      }
    });
  });
})();
