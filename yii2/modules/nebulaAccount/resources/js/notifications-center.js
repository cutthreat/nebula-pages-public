(function () {
  'use strict';

  const root = document.querySelector('[data-nebula-notifications][data-notification-center]');
  if (!root) return;

  const items = Array.from(root.querySelectorAll('[data-notification-item]'));
  const filters = Array.from(root.querySelectorAll('[data-notification-filter]'));
  const feed = root.querySelector('[data-notification-feed]');
  const empty = root.querySelector('[data-notification-empty]');
  const status = root.querySelector('[data-notification-status]');
  const markAll = root.querySelector('[data-notification-mark-all]');
  const unreadBadges = Array.from(root.querySelectorAll('[data-notification-unread-count], [data-notification-footer-count]'));
  const unreadSource = root.dataset.notificationUnreadSource || 'preview-fixture';
  let serverUnreadCount = Number.parseInt(root.dataset.notificationUnreadCount || '', 10);
  if (!Number.isInteger(serverUnreadCount) || serverUnreadCount < 0) serverUnreadCount = null;
  let activeFilter = 'all';

  const emit = (action, detail) => {
    root.dataset.lastAction = action;
    root.dispatchEvent(new CustomEvent('nebula:notification-center-intent', {
      bubbles: true,
      detail: Object.assign({
        action,
        backendRequired: true,
        persisted: false,
        readReceipt: false,
        deliveryClaimed: false,
        staticProjection: true,
      }, detail || {}),
    }));
  };

  const announce = (text) => {
    if (status) status.textContent = text;
  };

  const unreadItems = () => items.filter((item) => item.dataset.notificationUnread === 'true');

  const unreadLabel = (count) => `${count} unread notification${count === 1 ? '' : 's'}`;
  const unreadDisplay = (count) => count > 99 ? '99+' : String(count);
  const unreadLinkLabel = (count) => count === 0 ? 'Notifications' : `Notifications, ${unreadLabel(count)}`;
  const currentUnreadCount = () => unreadSource === 'server' && serverUnreadCount !== null
    ? serverUnreadCount
    : unreadItems().length;

  const updateCounts = () => {
    const unread = currentUnreadCount();
    unreadBadges.forEach((badge) => {
      badge.textContent = unreadDisplay(unread);
      badge.hidden = unread === 0;
      badge.setAttribute('aria-label', unreadLabel(unread));
    });
    root.querySelectorAll('[data-notifications-link], [data-notification-menu-link]').forEach((link) => {
      link.setAttribute('aria-label', unreadLinkLabel(unread));
    });
    const unreadFilterCount = root.querySelector('[data-notification-filter-count="unread"]');
    if (unreadFilterCount) unreadFilterCount.textContent = unreadDisplay(unread);
    const allFilterCount = root.querySelector('[data-notification-filter-count="all"]');
    if (allFilterCount) allFilterCount.textContent = String(items.length);
    if (markAll) markAll.disabled = unread === 0;
  };

  // A live notification host may publish a server-authoritative count after
  // mount. Preview pages intentionally ignore this event and derive counts
  // from their local fixture items instead.
  root.addEventListener('nebula:notification-unread-count', (event) => {
    if (unreadSource !== 'server') return;
    const next = Number(event.detail?.count);
    if (!Number.isInteger(next) || next < 0) return;
    serverUnreadCount = next;
    root.dataset.notificationUnreadCount = String(next);
    updateCounts();
  });

  const matches = (item) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return item.dataset.notificationUnread === 'true';
    return item.dataset.notificationCategory === activeFilter;
  };

  const render = () => {
    let visible = 0;
    items.forEach((item) => {
      const shown = matches(item);
      item.hidden = !shown;
      if (shown) visible += 1;
      item.classList.toggle('is-unread', item.dataset.notificationUnread === 'true');
      const trigger = item.querySelector('[data-notification-open]');
      if (trigger) {
        const title = trigger.getAttribute('aria-label') || 'Notification';
        trigger.setAttribute('aria-label', `${title.replace(/, read locally$|, unread$/, '')}${item.dataset.notificationUnread === 'true' ? ', unread' : ', read locally'}`);
      }
    });
    if (empty) empty.hidden = visible !== 0;
    updateCounts();
  };

  const markRead = (item, reason) => {
    if (item.dataset.notificationUnread !== 'true') return;
    item.dataset.notificationUnread = 'false';
    const id = item.dataset.notificationId || null;
    announce('Marked as read in this preview. Saving the read state requires the notification host.');
    emit('notification-read-intent', { notificationId: id, reason: reason || 'open' });
    render();
  };

  const activateFilter = (filter, focus = false) => {
    if (!filter) return;
    activeFilter = filter.dataset.notificationFilter || 'all';
    filters.forEach((candidate) => {
      const active = candidate === filter;
      candidate.setAttribute('aria-selected', String(active));
      candidate.tabIndex = active ? 0 : -1;
    });
    if (feed && filter.id) feed.setAttribute('aria-labelledby', filter.id);
    announce(activeFilter === 'all' ? 'Showing all notifications.' : `Showing ${filter.textContent.trim()} notifications.`);
    render();
    if (focus) filter.focus();
  };

  filters.forEach((filter, index) => {
    filter.addEventListener('click', () => activateFilter(filter));
    filter.addEventListener('keydown', (event) => {
      let next = null;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % filters.length;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + filters.length) % filters.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = filters.length - 1;
      if (next === null) return;
      event.preventDefault();
      activateFilter(filters[next], true);
    });
  });

  items.forEach((item) => {
    item.querySelector('[data-notification-open]')?.addEventListener('click', () => markRead(item, 'open'));
  });

  markAll?.addEventListener('click', () => {
    const unread = unreadItems();
    if (!unread.length) return;
    unread.forEach((item) => { item.dataset.notificationUnread = 'false'; });
    announce('All notifications in this preview are read. Saving requires the notification host.');
    emit('notification-mark-all-read-intent', { notificationIds: unread.map((item) => item.dataset.notificationId || null) });
    render();
  });

  render();
}());
