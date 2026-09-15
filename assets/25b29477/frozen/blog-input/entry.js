(() => {
  'use strict';

  const page = document.querySelector('.blog-input-page');
  if (!page) return;

  const menu = document.getElementById('navbarOffcanvasBlogInput');
  const menuToggle = document.querySelector('[aria-controls="navbarOffcanvasBlogInput"]');
  const menuClose = document.querySelector('.site-header__offcanvas-close');

  const syncMenuState = (open) => {
    if (menuToggle) menuToggle.setAttribute('aria-expanded', String(open));
    if (menuClose) menuClose.setAttribute('aria-expanded', String(open));
  };

  if (window.jQuery && menu) {
    window.jQuery(menu)
      .on('shown.bs.collapse', () => {
        syncMenuState(true);
        const firstLink = menu.querySelector('a');
        if (firstLink) firstLink.focus();
      })
      .on('hidden.bs.collapse', () => {
        syncMenuState(false);
        if (menuToggle) menuToggle.focus();
      });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu && menu.classList.contains('show') && window.jQuery) {
      window.jQuery(menu).collapse('hide');
    }
  });

})();
