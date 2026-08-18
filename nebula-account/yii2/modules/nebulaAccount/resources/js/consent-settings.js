(() => {
  const root = document.querySelector('[data-nebula-consent-settings]');
  if (!root) return;
  const status = root.querySelector('[data-consent-status]');
  const announce = (message) => { if (status) status.textContent = message; };
  // Category copy/panels are not present in the confirmed source state. Keep rows
  // static until the consent host supplies authoritative policy text and outcomes.
  root.querySelectorAll('[data-consent-action]').forEach((control) => control.addEventListener('click', () => {
    const action = control.dataset.consentAction; root.dataset.lastAction = `consent-${action}-host-required`; announce(`${action === 'reject' ? 'Reject All' : 'Confirm My Choices'} requires the consent host; no browser preference was changed.`);
    root.dispatchEvent(new CustomEvent('nebula:consent-action-required', { bubbles: true, detail: { action, backendRequired: true, persisted: false, cookieWrite: false, legalConsentChanged: false, staticProjection: true } }));
  }));
})();
