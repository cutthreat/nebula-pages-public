(() => {
  const root = document.querySelector('[data-nebula-chatroom][data-c76-state="notification_destination"]');
  const notify = root?.querySelector('[data-notify-action="toggle-menu"]');
  const menu = root?.querySelector('#c76-notify-menu');
  const items = menu ? [...menu.querySelectorAll('[role="menuitem"]')] : [];
  if (!root || !notify || !menu || !items.length) return;

  // This sidebar is a read-only index. Native links hand off to canonical
  // Chatroom; no selected/unread/message state is changed on this page.
  const sidebar = root.querySelector('.c76-menu');
  const workspace = root.querySelector('.c76-workspace');
  const list = root.querySelector('.c76-menu-list');
  const rows = [...root.querySelectorAll('[data-conversation-row]')];
  const search = root.querySelector('[data-conversation-search]');
  const searchTrigger = root.querySelector('[data-conversation-search-trigger]');
  const searchClear = root.querySelector('[data-conversation-search-clear]');
  const searchShell = search?.closest('.c76-search');
  const results = root.querySelector('[data-conversation-results]');
  const filterToggle = root.querySelector('[data-conversation-filter-toggle]');
  const filterMenu = root.querySelector('[data-conversation-filter-menu]');
  const filters = [...(filterMenu?.querySelectorAll('[data-conversation-filter]') || [])];
  const back = root.querySelector('[data-action="back-to-list"]');
  const compact = window.matchMedia('(max-width: 991.98px)');
  let filter = 'all';
  let sidebarFocus = false;
  const syncScrollbar = () => {
    const track = root.querySelector('.c76-scrollbar');
    const thumb = track?.querySelector('span');
    if (!list || !thumb || !list.clientHeight) return;
    const height = Math.max(24, track.clientHeight * list.clientHeight / list.scrollHeight);
    thumb.style.height = `${Math.min(track.clientHeight, height)}px`;
    thumb.style.transform = `translateY(${list.scrollHeight > list.clientHeight ? list.scrollTop / (list.scrollHeight - list.clientHeight) * (track.clientHeight - height) : 0}px)`;
  };
  const renderIndex = () => {
    const query = search.value.trim().toLocaleLowerCase();
    let count = 0;
    rows.forEach(row => {
      const data = row.dataset;
      const matchesFilter = filter === 'all'
        || (filter === 'unread' && Number(data.conversationUnread) > 0)
        || (filter === 'online' && data.conversationOnline === 'true')
        || (filter === 'favorites' && data.conversationFavorite === 'true')
        || (filter === 'muted' && data.conversationMuted === 'true');
      row.hidden = !matchesFilter || !data.conversationName.toLocaleLowerCase().includes(query);
      if (!row.hidden) count += 1;
    });
    root.querySelectorAll('[data-conversation-group]').forEach(group => {
      group.hidden = ![...group.querySelectorAll('[data-conversation-row]')].some(row => !row.hidden);
    });
    results.textContent = `${count} conversations found`;
    syncScrollbar();
  };
  const setSearchOpen = open => {
    searchShell.classList.toggle('is-search-open', open);
    searchTrigger.hidden = open;
    searchTrigger.setAttribute('aria-expanded', String(open));
    searchClear.hidden = !open;
  };
  const clearSearch = () => {
    search.value = ''; renderIndex(); setSearchOpen(false); searchTrigger.focus();
  };
  searchTrigger.addEventListener('click', () => { setSearchOpen(true); search.focus(); });
  search.addEventListener('focus', () => setSearchOpen(true));
  search.addEventListener('input', renderIndex);
  search.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); clearSearch(); }
  });
  searchClear.addEventListener('click', clearSearch);
  const setFilterOpen = (open, restoreFocus = false) => {
    filterMenu.hidden = !open;
    filterToggle.setAttribute('aria-expanded', String(open));
    if (open) filters.find(item => item.getAttribute('aria-checked') === 'true')?.focus();
    else if (restoreFocus) filterToggle.focus();
  };
  filterToggle.addEventListener('click', () => setFilterOpen(filterMenu.hidden));
  filters.forEach(item => item.addEventListener('click', () => {
    filter = item.dataset.conversationFilter;
    filters.forEach(option => option.setAttribute('aria-checked', String(option === item)));
    renderIndex(); setFilterOpen(false, true);
  }));
  filterMenu.addEventListener('keydown', event => {
    const index = filters.indexOf(document.activeElement);
    if (event.key === 'Escape') { event.preventDefault(); setFilterOpen(false, true); return; }
    if (event.key === 'Tab') { setFilterOpen(false, true); return; }
    let next;
    if (event.key === 'ArrowDown') next = (index + 1) % filters.length;
    else if (event.key === 'ArrowUp') next = (index - 1 + filters.length) % filters.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = filters.length - 1;
    else return;
    event.preventDefault(); filters[next]?.focus();
  });
  document.addEventListener('click', event => {
    if (!filterMenu.hidden && !filterMenu.contains(event.target) && !filterToggle.contains(event.target)) setFilterOpen(false);
  });
  document.addEventListener('focusin', event => { sidebarFocus = sidebar.contains(event.target); });
  const syncCompact = () => {
    back.hidden = !compact.matches;
    back.tabIndex = compact.matches ? 0 : -1;
    if (!compact.matches) workspace.classList.remove('is-list-view');
    else if (sidebarFocus) workspace.classList.add('is-list-view');
    syncScrollbar();
  };
  back.addEventListener('click', () => {
    if (!compact.matches) return;
    setOpen(false, false); setFilterOpen(false);
    workspace.classList.add('is-list-view');
    (rows.find(row => !row.hidden && row.getAttribute('aria-current') === 'true') || searchTrigger).focus();
    syncScrollbar();
  });
  compact.addEventListener('change', syncCompact);
  list.addEventListener('scroll', syncScrollbar, { passive: true });
  window.addEventListener('resize', syncScrollbar, { passive: true });

  const rail = root.querySelector('[data-suggestion-rail]');
  const suggestionNav = [...root.querySelectorAll('[data-suggestion-nav]')];
  const syncSuggestions = () => suggestionNav.forEach(button => {
    button.disabled = button.dataset.suggestionNav === 'prev' ? rail.scrollLeft <= 1 : rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 1;
    button.setAttribute('aria-disabled', String(button.disabled));
  });
  suggestionNav.forEach(button => button.addEventListener('click', () => {
    rail.scrollBy({ left: (button.dataset.suggestionNav === 'prev' ? -1 : 1) * rail.clientWidth * .8 });
    syncSuggestions();
  }));
  rail.addEventListener('scroll', syncSuggestions, { passive: true });
  window.addEventListener('resize', syncSuggestions, { passive: true });
  document.fonts.ready.then(() => { syncScrollbar(); syncSuggestions(); });
  syncCompact(); renderIndex(); syncSuggestions();

  const emitHostIntent = (action) => {
    const isSettings = action === 'settings';
    root.dataset.lastAction = isSettings ? 'notification-destination-open-required' : 'notification-reminder-open-required';
    root.dispatchEvent(new CustomEvent(isSettings ? 'nebula:notification-destination-open-required' : 'nebula:notification-reminder-open-required', {
      bubbles: true,
      detail: {
        routeOwner: './chatroom-notify.html',
        state: 'notification_destination',
        targetState: isSettings ? 'notification_channel_selection' : 'notification_reminder_setup',
        action,
        backendRequired: true,
        transitionEvidence: 'figma_1489_45092_notify_interaction_state',
        preferenceSaved: false,
        notificationSent: false,
        deliveryClaimed: false,
        reminderScheduled: false,
        sessionMutation: false,
        balanceMutation: false,
        messageMutation: false,
      },
    }));
  };

  const setOpen = (open, returnFocus = true) => {
    notify.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
    if (open) {
      items[0].focus();
      return;
    }
    if (returnFocus) notify.focus();
  };

  const toggle = () => setOpen(menu.hidden);

  notify.addEventListener('click', toggle);
  notify.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (menu.hidden) toggle();
    }
  });

  menu.addEventListener('click', (event) => {
    const item = event.target.closest('[role="menuitem"]');
    if (!item) return;
    emitHostIntent(item.dataset.notifyMenuAction || 'settings');
    setOpen(false);
  });

  menu.addEventListener('keydown', (event) => {
    const index = items.indexOf(document.activeElement);
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      items[(index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length].focus();
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      items[event.key === 'Home' ? 0 : items.length - 1].focus();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === 'Tab') {
      setOpen(false, false);
    }
  });

  document.addEventListener('click', (event) => {
    if (!menu.hidden && !event.target.closest('.c76-notify-wrap')) setOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !menu.hidden) {
      event.preventDefault();
      setOpen(false);
    }
  });
})();
