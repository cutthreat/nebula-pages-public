(() => {
  const root = document.querySelector('[data-nebula-plans]');
  if (!root) return;
  const status = root.querySelector('[data-plans-status]');
  root.querySelectorAll('[data-plans-action]').forEach((control) => {
    const intent = control.dataset.plansAction;
    const activate = () => { control.classList.add('is-active'); if (status) status.textContent = `${intent === 'contact' ? 'Contact us' : 'Personalized reading'} requires the host; no plan, payment or reading was started.`; root.dispatchEvent(new CustomEvent('nebula:plans-host-intent', { bubbles: true, detail: { action: intent, backendRequired: true, requestCreated: false, subscriptionCreated: false, paymentStarted: false, creditsChanged: false, staticProjection: true } })); };
    control.addEventListener('click', activate); control.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); activate(); } });
  });
})();
