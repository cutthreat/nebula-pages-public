(() => {
  'use strict';

  const init = () => {
    const root = document.querySelector('[data-nebula-all-psychics]');
    if (!root) return;

    const view = root.ownerDocument.defaultView;
    const setMenu = (open) => {
      const menu = root.querySelector('#navbarOffcanvasAllPsychic');
      if (!menu) return;
      menu.classList.toggle('show', open);
      root.querySelectorAll('[data-all-psychics-menu-toggle]').forEach((button) => {
        button.setAttribute('aria-expanded', String(open));
      });
    };

    root.querySelectorAll('[data-all-psychics-menu-toggle]').forEach((button) => {
      button.addEventListener('click', () => {
        const menu = root.querySelector('#navbarOffcanvasAllPsychic');
        setMenu(!menu?.classList.contains('show'));
      });
    });
    root.querySelectorAll('[data-all-psychics-menu-close]').forEach((button) => {
      button.addEventListener('click', () => setMenu(false));
    });

    const syncAccordionState = (item) => {
      item.classList.toggle('apn-answer-item--open', item.open && item.classList.contains('apn-answer-item'));
      item.querySelector('summary')?.setAttribute('aria-expanded', String(item.open));
    };
    root.querySelectorAll('[data-accordion-root]').forEach((accordion) => {
      accordion.querySelectorAll('details').forEach((item) => {
        syncAccordionState(item);
        item.addEventListener('toggle', () => {
          syncAccordionState(item);
          if (!item.open) return;
          accordion.querySelectorAll('details').forEach((other) => {
            if (other !== item) {
              other.open = false;
              syncAccordionState(other);
            }
          });
        });
      });
    });

    const syncTitles = () => {
      const compact = view?.innerWidth <= 576;
      root.querySelectorAll('[data-mobile-title]').forEach((node) => {
        node.textContent = compact ? node.dataset.mobileTitle : node.dataset.desktopTitle;
      });
    };
    syncTitles();
    view?.addEventListener('resize', syncTitles);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
