(() => {
  const root = document.querySelector('[data-nebula-billing]');
  if (!root) return;
  const control = root.querySelector('[data-billing-auto-refill]'); const status = root.querySelector('[data-billing-status]');
  if (!control) return;
  const toggle = () => { const enabled = control.getAttribute('aria-pressed') !== 'true'; control.setAttribute('aria-pressed', String(enabled)); control.setAttribute('aria-label', `Turn on auto refill: ${enabled ? 'on' : 'off'}`); control.classList.toggle('is-off', !enabled); if (status) status.textContent = `Auto refill is ${enabled ? 'on' : 'off'} locally. Enrollment requires the billing host.`; root.dispatchEvent(new CustomEvent('nebula:auto-refill-intent', { bubbles: true, detail: { enabled, backendRequired: true, enrolled: false, charged: false, balanceMutation: false, staticProjection: true } })); };
  control.addEventListener('click', toggle); control.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggle(); } });
})();
