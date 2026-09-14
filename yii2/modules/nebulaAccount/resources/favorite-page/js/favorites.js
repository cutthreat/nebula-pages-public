(() => {
  const root = document.querySelector('[data-nebula-favorites]');
  if (!root) return;
  const status = root.querySelector('[data-favorite-status]');
  const announce = (message) => { if (status) status.textContent = message; };
  const menuTrigger = root.querySelector('[data-account-menu-toggle]');
  const accountMenu = root.querySelector('#fv-account-menu');
  const filterTrigger = root.querySelector('[data-filter-toggle]');
  const filterMenu = root.querySelector('#fv-filter-menu');
  const close = () => { [accountMenu, filterMenu].forEach((menu) => { if (menu) menu.hidden = true; }); [menuTrigger, filterTrigger].forEach((button) => button?.setAttribute('aria-expanded', 'false')); };
  menuTrigger?.addEventListener('click', () => { const open = accountMenu && accountMenu.hidden; close(); if (accountMenu) { accountMenu.hidden = !open; menuTrigger.setAttribute('aria-expanded', open ? 'true' : 'false'); if (open) accountMenu.querySelector('a')?.focus(); } });
  filterTrigger?.addEventListener('click', () => { const open = filterMenu && filterMenu.hidden; close(); if (filterMenu) { filterMenu.hidden = !open; filterTrigger.setAttribute('aria-expanded', open ? 'true' : 'false'); if (open) filterMenu.querySelector('button')?.focus(); } });
  root.addEventListener('click', (event) => { if (!event.target.closest('.fv-account-actions,.fv-filter-trigger,.fv-filter-menu')) close(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { close(); menuTrigger?.focus(); } });
  root.querySelectorAll('[data-filter]').forEach((button) => button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    root.querySelectorAll('[data-psychic-card]').forEach((card) => { card.hidden = filter === 'online' && card.dataset.status !== 'online'; });
    announce(filter === 'online' ? 'Showing online favorites locally. Saving requires the host.' : 'Showing all favorites locally.');
    close();
  }));
  root.querySelectorAll('[data-favorite-toggle]').forEach((button) => button.addEventListener('click', () => {
    const card = button.closest('[data-psychic-card]');
    const name = card?.querySelector('h2')?.textContent.trim() || 'Expert';
    const pressed = button.getAttribute('aria-pressed') === 'true';
    button.setAttribute('aria-pressed', pressed ? 'false' : 'true');
    button.setAttribute('aria-label', `${pressed ? 'Add' : 'Remove'} ${name} ${pressed ? 'to' : 'from'} favorites`);
    announce(`${name} ${pressed ? 'removed from' : 'kept in'} favorites locally. Saving requires the host.`);
    root.dispatchEvent(new CustomEvent('nebula:favorite-host-intent', { bubbles: true, detail: { action: pressed ? 'remove' : 'add', psychicName: name, backendRequired: true, persisted: false, listMutation: false, staticProjection: true } }));
  }));
  root.querySelectorAll('[data-card-intent]').forEach((button) => button.addEventListener('click', () => { const name = button.closest('[data-psychic-card]')?.querySelector('h2')?.textContent.trim() || 'Expert'; announce(`${button.dataset.cardIntent === 'book' ? 'Booking' : 'Chat'} for ${name} requires the host; no session or payment was started.`); root.dispatchEvent(new CustomEvent('nebula:favorite-card-host-intent', { bubbles: true, detail: { action: button.dataset.cardIntent, psychicName: name, backendRequired: true, sessionCreated: false, paymentStarted: false, persisted: false, staticProjection: true } })); }));
})();
