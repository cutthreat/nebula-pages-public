(() => {
  const root = document.querySelector('[data-nebula-system-messages]');
  if (!root) return;
  const status = root.querySelector('[data-notification-status]');
  const sync = (control, enabled) => {
    control.setAttribute('aria-pressed', String(enabled));
    const name = control.dataset.notificationToggle === 'system' ? 'Allow system notifications' : control.dataset.notificationToggle;
    control.setAttribute('aria-label', `${name}: ${enabled ? 'on' : 'off'}`);
    control.classList.toggle('is-off', !enabled);
    const icon = control.querySelector('img');
    if (icon) icon.src = icon.src.replace(/(?:on|off)\.svg$/, `${enabled ? 'on' : 'off'}.svg`);
  };
  const toggle = (control) => {
    const enabled = control.getAttribute('aria-pressed') !== 'true';
    sync(control, enabled);
    if (status) status.textContent = `${control.dataset.notificationToggle} is ${enabled ? 'on' : 'off'} locally. Saving requires the notification host.`;
    root.dispatchEvent(new CustomEvent('nebula:notification-preference-intent', { bubbles: true, detail: { channel: control.dataset.notificationToggle, enabled, backendRequired: true, persisted: false, deliveryClaimed: false, staticProjection: true } }));
  };
  root.querySelectorAll('[data-notification-toggle]').forEach((control) => {
    control.addEventListener('click', () => toggle(control));
    control.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggle(control); } });
  });
})();
