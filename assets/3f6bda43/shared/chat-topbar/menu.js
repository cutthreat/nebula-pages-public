(() => {
  document.querySelectorAll('.c76-header[data-notification-shell]').forEach(header => {
    const toggle = header.querySelector('[data-account-menu-toggle]');
    const menu = header.querySelector('.c76-account-menu');
    if (!toggle || !menu) return;
    const items = [...menu.querySelectorAll('[role="menuitem"]')];
    const setOpen = (open, restoreFocus = false) => {
      if (open) header.dispatchEvent(new CustomEvent('nebula:account-menu-opening', { bubbles: true }));
      menu.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
      if (open) items[0]?.focus();
      else if (restoreFocus) toggle.focus();
    };
    toggle.addEventListener('click', () => setOpen(menu.hidden));
    toggle.addEventListener('keydown', event => {
      if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
      event.preventDefault();
      setOpen(true);
      if (event.key === 'ArrowUp') items.at(-1)?.focus();
    });
    menu.addEventListener('keydown', event => {
      const index = items.indexOf(document.activeElement);
      let next;
      if (event.key === 'Escape') { event.preventDefault(); setOpen(false, true); return; }
      if (event.key === 'Tab') { setOpen(false, true); return; }
      if (event.key === ' ') { event.preventDefault(); document.activeElement?.click(); return; }
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % items.length;
      else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index - 1 + items.length) % items.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = items.length - 1;
      else return;
      event.preventDefault(); items[next]?.focus();
    });
    document.addEventListener('click', event => {
      if (!menu.hidden && !menu.contains(event.target) && !toggle.contains(event.target)) setOpen(false);
    });
    document.addEventListener('focusin', event => {
      if (!menu.hidden && !header.contains(event.target)) setOpen(false);
    });
  });
})();
