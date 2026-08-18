(() => {
  const headers = [...document.querySelectorAll('[data-account-shell]')];
  headers.forEach((header) => {
    const trigger = header.querySelector('[data-common-account-menu-trigger]');
    const menu = header.querySelector('#nb-account-menu');
    const scrim = header.querySelector('[data-common-account-menu-scrim]');
    if (!trigger || !menu) return;
    let open = false;
    let lastFocus = trigger;
    const items = () => [...menu.querySelectorAll('[role="menuitem"]')].filter((item) => item.getClientRects().length);
    const setOpen = (next, restore = false) => {
      open = next;
      menu.hidden = !open;
      trigger.setAttribute('aria-expanded', String(open));
      if (scrim) scrim.hidden = !open;
      header.classList.toggle('is-account-menu-open', open);
      if (open) {
        lastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : trigger;
        items()[0]?.focus();
      } else if (restore) {
        (lastFocus || trigger).focus();
      }
    };
    trigger.addEventListener('click', () => setOpen(!open));
    scrim?.addEventListener('click', () => setOpen(false, true));
    menu.addEventListener('click', (event) => {
      if (event.target.closest('[role="menuitem"]')) setOpen(false);
    });
    menu.addEventListener('keydown', (event) => {
      const list = items();
      if (event.key === 'Escape') { event.preventDefault(); setOpen(false, true); return; }
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const index = Math.max(0, list.indexOf(document.activeElement));
        list[(index + (event.key === 'ArrowDown' ? 1 : list.length - 1)) % list.length]?.focus();
      }
      if (event.key === 'Tab' && list.length) {
        const first = list[0]; const last = list[list.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });
    document.addEventListener('keydown', (event) => {
      if (open && event.key === 'Escape') { event.preventDefault(); setOpen(false, true); }
    });
  });
})();
