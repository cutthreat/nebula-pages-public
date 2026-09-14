(() => {
  const root = document.querySelector('[data-nebula-daily-horoscope]');
  if (!root) return;
  const status = root.querySelector('[data-notification-status]');
  const control = root.querySelector('[data-notification-toggle="email"]');
  if (!control) return;
  const sync = (enabled) => {
    control.setAttribute('aria-pressed', String(enabled));
    control.setAttribute('aria-label', `Email: ${enabled ? 'on' : 'off'}`);
    control.classList.toggle('is-off', !enabled);
  };
  const toggle = () => {
    const enabled = control.getAttribute('aria-pressed') !== 'true';
    sync(enabled);
    if (status) status.textContent = `Email is ${enabled ? 'on' : 'off'} locally. Saving requires the notification host.`;
    root.dispatchEvent(new CustomEvent('nebula:notification-preference-intent', { bubbles: true, detail: { channel: 'email', enabled, backendRequired: true, persisted: false, deliveryClaimed: false, staticProjection: true } }));
  };
  control.addEventListener('click', toggle);
  control.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggle(); } });
})();
