(() => {
  'use strict';

  document.documentElement.dataset.nebulaEasyCandidate = 'phone-psychic-source-rebase';

  document.querySelectorAll('.pp-seo__item button').forEach((button) => {
    button.addEventListener('click', () => {
      const item = button.closest('.pp-seo__item');
      const willOpen = !item.classList.contains('pp-seo__item--open');

      document.querySelectorAll('.pp-seo__item').forEach((otherItem) => {
        otherItem.classList.remove('pp-seo__item--open');
        otherItem.querySelector('button')?.setAttribute('aria-expanded', 'false');
      });

      item.classList.toggle('pp-seo__item--open', willOpen);
      button.setAttribute('aria-expanded', String(willOpen));
    });
  });

  const faq = document.querySelector('#phoneFaq[data-phone-faq-contract="c76"]');
  if (faq) {
    const setState = (item, open) => {
      const button = item.querySelector('.faq-section__toggle');
      const icon = item.querySelector('.faq-section__icon');
      if (!button || !icon) return;
      item.classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', String(open));
      icon.innerHTML = `<span class="${open ? 'faq-section__icon-cross' : 'faq-section__icon-plus'}"></span>`;
    };

    faq.addEventListener('click', (event) => {
      const button = event.target.closest('.faq-section__toggle');
      if (!button || !faq.contains(button)) return;
      const item = button.closest('.pp-faq__item');
      if (!item) return;
      const open = !item.classList.contains('is-open');
      faq.querySelectorAll('.pp-faq__item').forEach((other) => setState(other, other === item && open));
    });
  }
})();
