(() => {
  const root = document.querySelector('[data-nebula-messages-from-psychics]');
  if (!root) return;
  const status = root.querySelector('[data-notification-status]');
  const announce = (message) => { if (status) status.textContent = message; };
  const sync = (control, on) => {
    control.setAttribute('aria-pressed', String(on));
    control.setAttribute('aria-label', `${control.dataset.notificationToggle === 'psychics' ? 'Allow notification from psychics' : control.dataset.notificationToggle}: ${on ? 'on' : 'off'}`);
    const icon = control.querySelector('img');
    if (icon) icon.src = icon.src.replace(/(?:on|off)\.svg$/, `${on ? 'on' : 'off'}.svg`);
  };
  root.querySelectorAll('[data-notification-toggle]').forEach((control) => {
    control.addEventListener('click', () => {
      const on = control.getAttribute('aria-pressed') !== 'true';
      sync(control, on);
      root.dataset.lastAction = 'notification-preference-intent-host-required';
      announce(`${control.dataset.notificationToggle} is ${on ? 'on' : 'off'} locally. Saving requires the notification host.`);
      root.dispatchEvent(new CustomEvent('nebula:notification-preference-intent', {
        bubbles: true,
        detail: { channel: control.dataset.notificationToggle, enabled: on, backendRequired: true, persisted: false, deliveryClaimed: false, staticProjection: true }
      }));
    });
  });
})();
