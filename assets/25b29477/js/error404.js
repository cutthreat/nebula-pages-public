(() => {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const root = document.querySelector('[data-nebula-error404]');
    if (!root) return;

    const menu = root.querySelector('.ne404-menu');
    const nav = root.querySelector('.ne404-mobile-nav');
    const theme = root.querySelector('.ne404-theme');
    const body = root.ownerDocument.body;
    const setMenu = (open, restoreFocus = false) => {
      if (!menu || !nav) return;
      menu.setAttribute('aria-expanded', String(open));
      nav.hidden = !open;
      if (!open && restoreFocus) menu.focus();
    };

    if (menu && nav) {
      menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
      root.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
          setMenu(false, true);
        }
      });
    }

    if (theme) {
      theme.addEventListener('click', () => {
        const checked = theme.getAttribute('aria-checked') !== 'true';
        theme.setAttribute('aria-checked', String(checked));
        body.classList.toggle('ne404-dark', checked);
      });
    }
  });
})();
