(() => {
  'use strict';

  const menuButton = document.querySelector('.tc-header__menu');
  const drawer = document.querySelector('.tc-drawer');
  const closeButton = document.querySelector('.tc-drawer__close');

  const setMenu = (open) => {
    if (!menuButton || !drawer) return;
    menuButton.setAttribute('aria-expanded', String(open));
    drawer.hidden = !open;
    document.body.classList.toggle('is-menu-open', open);
    if (open) closeButton?.focus();
    else menuButton.focus();
  };

  menuButton?.addEventListener('click', () => setMenu(true));
  closeButton?.addEventListener('click', () => setMenu(false));
  drawer?.addEventListener('click', (event) => {
    if (event.target === drawer || event.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !drawer?.hidden) {
      event.preventDefault();
      setMenu(false);
    }
  });

  document.querySelectorAll('[data-accordion] button').forEach((button) => {
    button.addEventListener('click', () => {
      const item = button.closest('article');
      const panel = document.getElementById(button.getAttribute('aria-controls'));
      const wasOpen = button.getAttribute('aria-expanded') === 'true';

      document.querySelectorAll('[data-accordion] article').forEach((entry) => {
        entry.classList.remove('is-open');
        const entryButton = entry.querySelector('button');
        const entryPanel = document.getElementById(entryButton?.getAttribute('aria-controls'));
        entryButton?.setAttribute('aria-expanded', 'false');
        if (entryPanel) entryPanel.hidden = true;
      });

      if (!wasOpen && item && panel) {
        item.classList.add('is-open');
        button.setAttribute('aria-expanded', 'true');
        panel.hidden = false;
      }
    });
  });

  const hostIntent = document.querySelector('#tc-host-intent');
  const hostIntentClose = hostIntent?.querySelector('.tc-host-intent__close');
  const consultationCopy = hostIntent?.querySelector('.tc-host-intent__consultation');
  const videoCopy = hostIntent?.querySelector('.tc-host-intent__video');

  const openHostIntent = (kind) => {
    if (!hostIntent) return;
    consultationCopy.hidden = kind === 'video';
    videoCopy.hidden = kind !== 'video';
    hostIntent.showModal();
    hostIntentClose?.focus();
  };

  document.querySelectorAll('[data-consultation-intent]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      openHostIntent('consultation');
    });
  });

  document.querySelector('[data-video-host-intent]')?.addEventListener('click', () => openHostIntent('video'));
  hostIntentClose?.addEventListener('click', () => hostIntent?.close());
  hostIntent?.addEventListener('click', (event) => {
    if (event.target === hostIntent) hostIntent.close();
  });
})();
