(() => {
  'use strict';
  const root = document.querySelector('[data-nebula-faq]');
  if (!root) return;
  const answer = root.querySelector('[data-faq-answer]');
  const toggle = root.querySelector('[data-faq-action="toggle-answer"]');
  const support = root.querySelector('[data-faq-action="support-required"]');
  const live = root.querySelector('.faq-sr-only');
  toggle?.addEventListener('click', () => {
    const open = !answer.classList.contains('is-open');
    answer.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('b').textContent = open ? '×' : '+';
    root.dataset.lastAction = open ? 'faq-answer-opened' : 'faq-answer-closed';
    if (live) live.textContent = open ? 'Answer opened.' : 'Answer closed.';
  });
  support?.addEventListener('click', () => {
    root.dataset.lastAction = 'faq-support-required';
    if (live) live.textContent = 'Customer Support handoff requires the host.';
    root.dispatchEvent(new CustomEvent('nebula:faq-support-required', {
      bubbles: true,
      detail: { fixtureOnly: true, backendRequired: true, supportTicketCreated: false, destinationProven: false }
    }));
  });
})();
