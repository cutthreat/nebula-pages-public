(() => {
  'use strict';
  const root = document.querySelector('[data-nebula-faq]');
  if (!root) return;
  const live = root.querySelector('.faq-sr-only');
  const items = () => Array.from(root.querySelectorAll('[data-faq-item]'));
  const setItem = (item, open) => {
    const button = item.querySelector('[data-faq-action="toggle-answer"]');
    const panel = item.querySelector('[data-faq-panel]');
    if (!button || !panel) return;
    item.classList.toggle('is-open', open);
    button.setAttribute('aria-expanded', String(open));
    const marker = button.querySelector('b');
    if (marker) marker.textContent = open ? '×' : '+';
    panel.hidden = !open;
  };
  const toggleItem = (item) => {
    const button = item.querySelector('[data-faq-action="toggle-answer"]');
    const open = button?.getAttribute('aria-expanded') !== 'true';
    items().forEach((candidate) => { if (candidate !== item) setItem(candidate, false); });
    setItem(item, open);
    root.dataset.lastAction = open ? 'faq-answer-opened' : 'faq-answer-closed';
    if (live) live.textContent = open ? 'Answer opened.' : 'Answer closed.';
  };
  root.addEventListener('click', (event) => {
    const toggle = event.target.closest('[data-faq-action="toggle-answer"]');
    if (toggle && root.contains(toggle)) toggleItem(toggle.closest('[data-faq-item]'));
  });
  root.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const item = event.target.closest('[data-faq-item]');
    if (!item || item.querySelector('[data-faq-action="toggle-answer"]')?.getAttribute('aria-expanded') !== 'true') return;
    event.preventDefault();
    setItem(item, false);
    item.querySelector('[data-faq-action="toggle-answer"]')?.focus();
    root.dataset.lastAction = 'faq-answer-closed';
    if (live) live.textContent = 'Answer closed.';
  });
})();
