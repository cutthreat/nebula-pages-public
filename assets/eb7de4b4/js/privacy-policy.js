(() => {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const root = document.querySelector('[data-nebula-privacy-policy]');
    if (!root) return;

    const menu = root.querySelector('#navbarOffcanvasPrivacy');
    const opener = root.querySelector('[data-privacy-menu-toggle]');
    const closer = root.querySelector('[data-privacy-menu-close]');
    if (!menu || !opener || !closer) return;

    const setMenu = (open) => {
      menu.classList.toggle('show', open);
      opener.setAttribute('aria-expanded', String(open));
    };

    opener.addEventListener('click', () => setMenu(!menu.classList.contains('show')));
    closer.addEventListener('click', () => setMenu(false));
  });
})();
