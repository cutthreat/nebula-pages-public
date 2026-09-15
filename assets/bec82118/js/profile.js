(() => {
  const root = document.querySelector('[data-nebula-profile]');
  if (!root) return;
  const statuses = root.querySelectorAll('[data-profile-status]');
  const showStatus = (message) => statuses.forEach((status) => {
    status.textContent = message;
    status.classList.add('is-visible');
  });

  const trigger = root.querySelector('#profile-menu-trigger');
  const drawer = root.querySelector('[data-profile-drawer]');
  const scrim = root.querySelector('[data-profile-drawer-scrim]');
  let drawerOpen = false;
  let lastFocused = trigger;
  const isCompact = () => window.matchMedia('(max-width: 991.98px)').matches;
  const focusables = () => drawer ? [...drawer.querySelectorAll('a, button:not([disabled])')].filter((el) => el.getClientRects().length > 0) : [];
  const setDrawer = (open, restore = true) => {
    if (!drawer || !trigger || !isCompact()) return;
    drawerOpen = open;
    drawer.classList.toggle('is-drawer-open', open);
    drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
    drawer.setAttribute('role', open ? 'dialog' : 'navigation');
    drawer.setAttribute('aria-modal', open ? 'true' : 'false');
    trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (scrim) scrim.hidden = !open;
    root.classList.toggle('is-profile-drawer-open', open);
    if (open) {
      lastFocused = trigger;
      const first = focusables()[0];
      if (first) first.focus();
    } else if (restore && lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
    }
  };
  const syncDrawerMode = () => {
    if (!drawer || !trigger) return;
    if (isCompact()) {
      if (!drawerOpen) {
        drawer.classList.remove('is-drawer-open');
        drawer.setAttribute('aria-hidden', 'true');
        drawer.setAttribute('role', 'navigation');
        drawer.setAttribute('aria-modal', 'false');
        trigger.setAttribute('aria-expanded', 'false');
        if (scrim) scrim.hidden = true;
      }
    } else {
      drawerOpen = false;
      drawer.classList.remove('is-drawer-open');
      drawer.removeAttribute('aria-hidden');
      drawer.setAttribute('role', 'navigation');
      drawer.setAttribute('aria-modal', 'false');
      trigger.setAttribute('aria-expanded', 'false');
      if (scrim) scrim.hidden = true;
      root.classList.remove('is-profile-drawer-open');
    }
  };
  syncDrawerMode();
  window.addEventListener('resize', syncDrawerMode, { passive: true });
  trigger?.addEventListener('click', () => {
    if (isCompact()) setDrawer(!drawerOpen);
    else showStatus('Account navigation is already visible.');
  });
  scrim?.addEventListener('click', () => setDrawer(false));
  drawer?.addEventListener('keydown', (event) => {
    if (!drawerOpen) return;
    if (event.key === 'Escape') { event.preventDefault(); setDrawer(false); return; }
    if (event.key !== 'Tab') return;
    const items = focusables();
    if (!items.length) return;
    const first = items[0]; const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });

  root.querySelectorAll('[data-profile-navigation]').forEach((control) => {
    control.addEventListener('click', () => {
      const action = control.dataset.profileNavigation;
      showStatus(`${action === 'favorite' ? 'Favorite' : 'Psychics'} requires the host; no route or server list was changed.`);
      root.dispatchEvent(new CustomEvent('nebula:profile-navigation-intent', { bubbles: true, detail: { action, routeIntentUnbound: true, navigationStarted: false, persisted: false, staticProjection: true } }));
      if (drawerOpen) setDrawer(false);
    });
  });

  root.querySelectorAll('[data-horoscope-period]').forEach((control) => {
    control.addEventListener('click', () => {
      showStatus('Today is the only source-backed period in this profile preview.');
      root.dispatchEvent(new CustomEvent('nebula:horoscope-period-intent', { bubbles: true, detail: { period: control.dataset.horoscopePeriod, backendRequired: true, contentRecomputed: false, navigationStarted: false, persisted: false, staticProjection: true } }));
    });
  });
  root.querySelectorAll('[data-profile-action]').forEach((control) => {
    const activate = () => {
      const action = control.dataset.profileAction;
      control.classList.add('is-active');
      showStatus(`${action === 'refill' ? 'Refill credits' : action === 'learn-more' ? 'Learn more' : 'See all psychics'} requires the host; no navigation or payment was started.`);
      root.dispatchEvent(new CustomEvent('nebula:profile-host-intent', { bubbles: true, detail: { action, backendRequired: true, navigationStarted: false, paymentStarted: false, creditsChanged: false, persisted: false, staticProjection: true } }));
    };
    control.addEventListener('click', activate);
    control.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); activate(); } });
  });
  root.querySelectorAll('[data-profile-card-action]').forEach((control) => {
    control.addEventListener('click', () => {
      const action = control.dataset.profileCardAction; const name = control.dataset.psychicName || 'psychic';
      if (action === 'favorite') { const pressed = control.getAttribute('aria-pressed') === 'true'; control.setAttribute('aria-pressed', pressed ? 'false' : 'true'); showStatus(`${name} ${pressed ? 'removed from' : 'added to'} favorites locally. No server list was changed.`); return; }
      root.dispatchEvent(new CustomEvent('nebula:profile-card-host-intent', { bubbles: true, detail: { action, psychicName: name, backendRequired: true, bookingStarted: false, availabilityChanged: false, persisted: false, staticProjection: true } }));
      showStatus(`${action === 'offline' ? 'This expert is offline' : 'Booking'} requires the host; no session or payment was started.`);
    });
  });
})();
