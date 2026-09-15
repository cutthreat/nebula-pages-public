(() => {
  const root = document.querySelector('[data-nebula-astrology-profile]');
  if (!root) return;
  const status = root.querySelector('[data-astrology-status]');
  root.querySelectorAll('[data-astrology-edit]').forEach((control) => {
    const activate = () => { control.setAttribute('aria-pressed', 'true'); control.classList.add('is-requested'); if (status) status.textContent = `${control.dataset.astrologyEdit} editing requires the profile host; no value was changed.`; root.dispatchEvent(new CustomEvent('nebula:astrology-edit-required', { bubbles: true, detail: { field: control.dataset.astrologyEdit, backendRequired: true, profileMutation: false, saved: false, staticProjection: true } })); };
    control.addEventListener('click', activate); control.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); activate(); } });
  });
})();
