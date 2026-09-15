/*
 * Shared expert-card action contract.
 *
 * This file is intentionally a host boundary. It renders a local preview of
 * the action states and emits request events, but it never creates a
 * subscription, reservation, session or payment. A matching host receipt is
 * required before any card is shown as confirmed. The chatroom's explicit
 * loopback preview may provide that receipt locally; production still requires
 * the owning host.
 */
(() => {
  if (typeof document === 'undefined') return;

  const modal = document.querySelector('[data-expert-card-action-modal]');
  if (!modal) return;

  const dialog = modal.querySelector('[role="dialog"]');
  const title = modal.querySelector('[data-expert-action-title]');
  const description = modal.querySelector('[data-expert-action-description]');
  const icon = modal.querySelector('[data-expert-action-icon]');
  const demo = modal.querySelector('[data-expert-action-demo]');
  const views = {
    notify: modal.querySelector('[data-expert-action-view="notify"]'),
    book: modal.querySelector('[data-expert-action-view="book"]'),
  };
  const calendar = modal.querySelector('[data-expert-booking-calendar]');
  if (!dialog || !title || !description || !views.notify || !views.book || !calendar) return;

  const entries = new Map();
  let active = null;
  let sequence = 0;
  let lastFocus = null;
  const localPreview = () => {
    const page = document.querySelector('[data-nebula-chatroom]');
    return page?.dataset.staticProjection === 'true'
      && page.dataset.consultationDemo === 'true'
      && ['localhost', '127.0.0.1', '[::1]', '::1'].includes(window.location.hostname);
  };

  const roots = () => [...document.querySelectorAll('[data-nebula-profile],[data-nebula-psychics],[data-nebula-favorites]')];
  const rootFor = (node) => node?.closest('[data-nebula-profile],[data-nebula-psychics],[data-nebula-favorites]') || null;
  const expertIdFor = (trigger) => trigger.dataset.expertId || trigger.closest('[data-expert-id]')?.dataset.expertId || rootFor(trigger)?.dataset.expertId || trigger.closest('[data-psychic-card]')?.dataset.questionExpertId || trigger.closest('[data-profile-card]')?.dataset.psychicName || '';
  const expertNameFor = (trigger) => trigger.dataset.expertName || trigger.dataset.psychicName || trigger.closest('[data-expert-id]')?.dataset.expertName || trigger.closest('[data-psychic-card]')?.querySelector('.ps-card__identity h3')?.textContent.trim() || trigger.closest('[data-profile-card]')?.dataset.psychicName || rootFor(trigger)?.dataset.psychicName || 'Expert';
  const actionFor = (trigger) => trigger.dataset.expertCardAction || '';
  const keyFor = (kind, expertId) => `${kind}:${expertId}`;
  const entryFor = (kind, expertId, expertName) => {
    const key = keyFor(kind, expertId);
    if (!entries.has(key)) entries.set(key, { key, kind, expertId, expertName, phase: 'off', operation: null, requestId: null, idempotencyKey: null, subscriptionId: null, bookingId: null, selectedSlot: null, timer: null, receiptTimer: null });
    const entry = entries.get(key);
    if (expertName) entry.expertName = expertName;
    return entry;
  };
  const labelNode = (button) => button.querySelector('[data-expert-action-label]') || button;
  const allActionButtons = (entry) => [...document.querySelectorAll(`[data-expert-card-action="${entry.kind}"]`)].filter((button) => {
    const id = button.dataset.expertId || button.closest('[data-expert-id]')?.dataset.expertId || rootFor(button)?.dataset.expertId || button.closest('[data-psychic-card]')?.dataset.questionExpertId || '';
    return id === entry.expertId;
  });
  const confirmedLabel = (entry) => {
    if (entry.kind === 'notify') return 'Notification on';
    if (!entry.booking) return 'Booked';
    return `Booked for ${entry.booking.label || entry.booking.display || entry.booking.startsAt || 'selected time'}`;
  };
  const cardLabel = (entry) => {
    if (entry.phase === 'pending') return entry.operation === 'cancel' ? (entry.kind === 'notify' ? 'Turning off notification' : 'Cancelling your booking') : (entry.kind === 'notify' ? 'Turning on notification' : 'Confirming your booking');
    if (entry.phase === 'confirmed') return confirmedLabel(entry);
    if (entry.phase === 'indeterminate') return entry.kind === 'notify' ? 'Check notification status' : 'Check booking status';
    return entry.kind === 'notify' ? 'Notify me' : 'Book session';
  };
  const syncCards = (entry) => {
    allActionButtons(entry).forEach((button) => {
      const pending = entry.phase === 'pending';
      const confirmed = entry.phase === 'confirmed';
      const node = labelNode(button);
      node.textContent = cardLabel(entry);
      button.setAttribute('aria-pressed', String(confirmed));
      button.setAttribute('aria-label', `${cardLabel(entry)} for ${entry.expertName}`);
      button.setAttribute('aria-busy', String(pending));
      button.dataset.expertActionState = entry.phase;
      button.classList.toggle('is-action-pending', pending);
      button.classList.toggle('is-action-confirmed', confirmed);
      button.classList.toggle('is-action-indeterminate', entry.phase === 'indeterminate');
      button.disabled = pending;
      button.title = pending ? 'Waiting for the host confirmation' : confirmed ? cardLabel(entry) : '';
    });
  };
  const dispatch = (name, detail, source = active?.root || rootFor(lastFocus)) => {
    const payload = { ...detail, staticProjection: true, persisted: false };
    // Emit once from the nearest page root so both root-scoped and document-
    // scoped hosts receive the same request without duplicate backend work.
    (source || document).dispatchEvent(new CustomEvent(name, { bubbles: Boolean(source), detail: payload }));
  };
  const clearTimer = (entry) => {
    if (entry.timer !== null) window.clearTimeout(entry.timer);
    if (entry.receiptTimer !== null) window.clearTimeout(entry.receiptTimer);
    entry.timer = null;
    entry.receiptTimer = null;
  };
  const operationDetail = (entry, extra = {}) => ({
    action: entry.operation,
    kind: entry.kind,
    expertId: entry.expertId,
    expertName: entry.expertName,
    requestId: entry.requestId,
    idempotencyKey: entry.idempotencyKey,
    subscriptionId: entry.subscriptionId,
    bookingId: entry.bookingId,
    selectedSlot: entry.selectedSlot ? { ...entry.selectedSlot } : null,
    backendRequired: true,
    ...extra,
  });
  const announce = (message) => {
    const root = active?.root || rootFor(lastFocus);
    const status = root?.querySelector('[data-profile-status],[data-psychic-filter-status],[data-favorite-status]');
    if (status) status.textContent = message;
  };
  const activeView = (kind) => views[kind];
  const activeStatus = (kind) => activeView(kind)?.querySelector('[data-expert-action-status]');
  const activeSubmit = (kind) => activeView(kind)?.querySelector('[data-expert-action-submit]');
  const activeSecondary = (kind) => activeView(kind)?.querySelector('[data-expert-action-secondary]');
  const setPhase = (entry, phase, message = '') => {
    entry.phase = phase;
    modal.dataset.expertActionPhase = phase;
    syncCards(entry);
    const status = activeStatus(entry.kind);
    if (status && message) status.textContent = message;
  };
  const formatDate = (date) => new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(date);
  const formatTime = (date) => new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(date);
  const buildSlots = (expertId) => Array.from({ length: 4 }, (_, index) => {
    const date = new Date();
    date.setHours(index < 2 ? 18 : 16, index % 2 ? 30 : 0, 0, 0);
    date.setDate(date.getDate() + index + 1);
    return { id: `${expertId}:${date.toISOString()}`, startsAt: date.toISOString(), label: `${formatDate(date)} at ${formatTime(date)}`, window: index < 2 ? '6:00 PM – 8:00 PM' : '4:00 PM – 6:00 PM' };
  });
  const renderCalendar = (entry) => {
    calendar.replaceChildren();
    const disabled = entry.phase === 'pending' || entry.phase === 'confirmed';
    buildSlots(entry.expertId).forEach((slot) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.expertBookingSlot = slot.id;
      button.setAttribute('aria-pressed', String(entry.selectedSlot?.id === slot.id));
      button.disabled = disabled;
      const strong = document.createElement('strong');
      strong.textContent = slot.label;
      const hint = document.createElement('span');
      hint.textContent = slot.window;
      button.append(strong, hint);
      button.addEventListener('click', () => {
        if (!active || active !== entry || entry.phase === 'pending' || entry.phase === 'confirmed') return;
        entry.selectedSlot = slot;
        calendar.querySelectorAll('[data-expert-booking-slot]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
        const submit = activeSubmit('book');
        if (submit) { submit.disabled = false; submit.textContent = 'Confirm booking'; }
        const status = activeStatus('book');
        if (status) status.textContent = `${slot.label} selected. Final availability is checked by the host.`;
      });
      calendar.append(button);
    });
  };
  const render = (entry, message = '') => {
    views.notify.hidden = entry.kind !== 'notify';
    views.book.hidden = entry.kind !== 'book';
    modal.dataset.expertActionKind = entry.kind;
    title.textContent = entry.kind === 'notify' ? `${entry.expertName} is busy right now` : `Book a session with ${entry.expertName}`;
    description.textContent = entry.kind === 'notify' ? 'Ask to be notified when this expert is available for a chat.' : 'Choose a date and time window for a consultation with this expert.';
    icon.src = entry.kind === 'notify' ? icon.dataset.notifyIcon : icon.dataset.bookIcon;
    demo.textContent = 'Preview only · no notification or reservation will be created.';
    if (entry.kind === 'notify') {
      const submit = activeSubmit('notify');
      const secondary = activeSecondary('notify');
      if (entry.phase === 'pending') { submit.disabled = true; submit.textContent = entry.operation === 'cancel' ? 'Turning off notification' : 'Turning on notification'; secondary.textContent = 'Close'; }
      else if (entry.phase === 'confirmed') { submit.disabled = false; submit.textContent = 'Turn off notification'; secondary.textContent = 'Close'; }
      else if (entry.phase === 'indeterminate') { submit.disabled = false; submit.textContent = 'Check notification status'; secondary.textContent = 'Close'; }
      else if (entry.phase === 'error') { submit.disabled = false; submit.textContent = 'Try again'; secondary.textContent = 'Close'; }
      else { submit.disabled = false; submit.textContent = 'Notify me when expert is available'; secondary.textContent = 'Not now'; }
      const status = activeStatus('notify');
      if (status) status.textContent = message || (entry.phase === 'confirmed' ? 'Notification is on. You can turn it off before the expert becomes available.' : entry.phase === 'pending' ? 'Waiting for the host to confirm this request.' : entry.phase === 'indeterminate' ? 'The host did not confirm this request. Reconcile the same request before retrying.' : '');
    } else {
      const submit = activeSubmit('book');
      const secondary = activeSecondary('book');
      calendar.hidden = entry.phase === 'confirmed';
      if (entry.phase === 'pending') { submit.disabled = true; submit.textContent = entry.operation === 'cancel' ? 'Cancelling your booking' : 'Confirming your booking'; secondary.textContent = 'Close'; }
      else if (entry.phase === 'confirmed') { submit.disabled = true; submit.textContent = confirmedLabel(entry); secondary.textContent = entry.bookingId ? 'Cancel booking' : 'Close'; }
      else if (entry.phase === 'indeterminate') { submit.disabled = false; submit.textContent = 'Check booking status'; secondary.textContent = 'Close'; }
      else if (entry.phase === 'error') { submit.disabled = !entry.selectedSlot; submit.textContent = 'Try again'; secondary.textContent = 'Close'; }
      else { submit.disabled = !entry.selectedSlot; submit.textContent = entry.selectedSlot ? 'Confirm booking' : 'Choose a date'; secondary.textContent = entry.bookingId ? 'Cancel booking' : 'Not now'; }
      const status = activeStatus('book');
      if (status) status.textContent = message || (entry.phase === 'confirmed' ? `${confirmedLabel(entry)}. The host supplied the receipt.` : entry.phase === 'pending' ? 'Waiting for the host to confirm this request.' : entry.phase === 'indeterminate' ? 'The host did not confirm this request. Reconcile the same request before retrying.' : 'Dates shown here are layout fixtures; the booking service owns availability.');
      renderCalendar(entry);
    }
    modal.dataset.expertActionPhase = entry.phase;
    syncCards(entry);
  };
  const markIndeterminate = (entry) => {
    if (entry.phase !== 'pending') return;
    clearTimer(entry);
    entry.phase = 'indeterminate';
    syncCards(entry);
    if (active === entry) render(entry);
    dispatch('nebula:expert-card-action-timeout', operationDetail(entry, { reconciliationRequired: true, source: 'ui' }));
  };
  const armTimeout = (entry) => {
    clearTimer(entry);
    entry.timer = window.setTimeout(() => markIndeterminate(entry), 8000);
  };
  const scheduleLocalPreviewReceipt = (entry) => {
    if (!localPreview() || entry.kind !== 'notify') return;
    const operation = entry.operation;
    if (!['subscribe', 'unsubscribe'].includes(operation)) return;
    if (operation === 'subscribe' && !entry.subscriptionId) entry.subscriptionId = `preview-subscription:${entry.requestId}`;
    const detail = operationDetail(entry, {
      accepted: true,
      confirmed: true,
      hostReceipt: true,
      demo: true,
      backendRequired: false,
      persisted: false,
      subscribed: operation !== 'unsubscribe',
      source: 'local-preview-host',
    });
    entry.receiptTimer = window.setTimeout(() => {
      entry.receiptTimer = null;
      if (entry.phase !== 'pending' || entry.requestId !== detail.requestId) return;
      dispatch('nebula:expert-availability-subscription-receipt', detail, active?.root || rootFor(lastFocus));
    }, 260);
  };
  const begin = (entry, operation) => {
    if (entry.phase === 'pending') return;
    if (operation === 'reserve' && !entry.selectedSlot) return;
    if (operation === 'cancel' && !entry.bookingId) return;
    const reconcile = entry.phase === 'indeterminate' && entry.requestId;
    if (!reconcile) {
      sequence += 1;
      entry.requestId = `${entry.kind}-${operation}-${sequence}`;
      entry.idempotencyKey = `expert-card:${entry.kind}:${entry.expertId}:${entry.requestId}`;
    }
    entry.operation = operation;
    setPhase(entry, 'pending');
    if (active === entry) {
      render(entry);
      // Disabling the focused submit otherwise drops focus to <body>, where
      // the dialog's Escape/Tab handling no longer receives keyboard events.
      activeSecondary(entry.kind)?.focus({ preventScroll: true });
    }
    armTimeout(entry);
    const eventName = entry.kind === 'notify'
      ? 'nebula:expert-availability-subscription-requested'
      : operation === 'cancel' ? 'nebula:expert-booking-cancel-requested' : 'nebula:expert-booking-requested';
    dispatch(eventName, operationDetail(entry, { reconcile: Boolean(reconcile), source: 'ui' }));
    scheduleLocalPreviewReceipt(entry);
    announce(entry.kind === 'notify' ? 'Notification request sent to the host; waiting for confirmation.' : 'Booking request sent to the host; waiting for confirmation.');
  };
  const accepted = (detail) => detail.accepted === true || detail.confirmed === true || detail.ok === true;
  const matches = (entry, detail) => entry && entry.expertId === detail.expertId && entry.requestId === detail.requestId && (!detail.idempotencyKey || detail.idempotencyKey === entry.idempotencyKey);
  const settle = (kind, detail, operationOverride = null) => {
    const entry = entries.get(keyFor(kind, detail.expertId));
    if (!matches(entry, detail)) return;
    clearTimer(entry);
    if (!accepted(detail)) {
      entry.phase = 'error';
      if (active === entry) render(entry, detail.error || 'The host could not confirm this request.');
      syncCards(entry);
      return;
    }
    const operation = operationOverride || detail.operation || entry.operation;
    if (kind === 'notify') {
      if (operation === 'unsubscribe' || detail.subscribed === false) { entry.phase = 'off'; entry.subscriptionId = null; }
      else { entry.phase = 'confirmed'; entry.subscriptionId = detail.subscriptionId || entry.subscriptionId || null; }
    } else if (operation === 'cancel' || detail.cancelled === true) {
      entry.phase = 'off'; entry.bookingId = null; entry.booking = null; entry.selectedSlot = null;
    } else {
      entry.phase = 'confirmed';
      entry.bookingId = detail.bookingId || detail.booking?.id || entry.bookingId || null;
      entry.booking = detail.booking || { label: entry.selectedSlot?.label || 'selected time', startsAt: entry.selectedSlot?.startsAt || null };
    }
    entry.operation = null;
    syncCards(entry);
    if (active === entry) render(entry, kind === 'notify' ? (entry.phase === 'confirmed' ? 'Notification confirmed by the host.' : 'Notification turned off by the host.') : (entry.phase === 'confirmed' ? 'Booking confirmed by the host.' : 'Booking cancelled by the host.'));
    announce(kind === 'notify' ? (entry.phase === 'confirmed' ? 'Notification is on.' : 'Notification turned off.') : (entry.phase === 'confirmed' ? 'Booking confirmed.' : 'Booking cancelled.'));
  };
  const open = (trigger) => {
    const kind = actionFor(trigger);
    if (!['notify', 'book'].includes(kind) || trigger.disabled) return;
    const expertId = expertIdFor(trigger);
    if (!expertId) return;
    const expertName = expertNameFor(trigger);
    const entry = entryFor(kind, expertId, expertName);
    active = entry;
    active.root = rootFor(trigger);
    lastFocus = trigger;
    if (trigger.matches('[data-consultation-control]')) trigger.setAttribute('aria-expanded', 'true');
    modal.hidden = false;
    document.documentElement.dataset.expertCardActionOpen = 'true';
    render(entry);
    title.focus({ preventScroll: true });
  };
  const openExternal = (detail = {}) => {
    const kind = detail.kind || 'notify';
    const trigger = detail.opener instanceof HTMLElement ? detail.opener : null;
    if (!['notify', 'book'].includes(kind) || !detail.expertId || trigger?.disabled) return;
    const entry = entryFor(kind, String(detail.expertId), detail.expertName || 'Expert');
    // A chatroom may restore a confirmed notification before this modal store
    // has seen a card action. Preserve that ownership when the header asks to
    // cancel, so the modal opens on the destructive action instead of subscribe.
    if (detail.mode === 'cancel' && kind === 'notify') {
      entry.phase = 'confirmed';
      entry.operation = null;
      entry.subscriptionId = detail.subscriptionId || entry.subscriptionId || null;
    }
    active = entry;
    active.root = rootFor(trigger);
    lastFocus = trigger || (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    if (trigger?.matches('[data-consultation-control]')) trigger.setAttribute('aria-expanded', 'true');
    modal.hidden = false;
    document.documentElement.dataset.expertCardActionOpen = 'true';
    render(entry);
    title.focus({ preventScroll: true });
  };
  const close = () => {
    if (modal.hidden) return;
    modal.hidden = true;
    document.documentElement.removeAttribute('data-expert-card-action-open');
    modal.dataset.expertActionKind = '';
    modal.dataset.expertActionPhase = '';
    const restore = lastFocus;
    if (restore?.matches('[data-consultation-control]')) restore.setAttribute('aria-expanded', 'false');
    active = null;
    if (restore?.isConnected) {
      // A pending operation keeps its trigger disabled. Closing the visual
      // dialog does not cancel that operation or unlock a duplicate request.
      const fallback = restore.closest('main')?.querySelector('.pc-back-link, a[href], button:not([disabled])');
      const target = restore.disabled ? fallback : restore;
      target?.focus({ preventScroll: true });
    }
  };

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-expert-card-action]');
    if (!trigger || actionFor(trigger) === 'chat') return;
    event.preventDefault();
    event.stopImmediatePropagation();
    open(trigger);
  }, true);
  document.addEventListener('nebula:expert-card-action-open', (event) => openExternal(event.detail || {}));
  modal.querySelectorAll('[data-expert-action-close]').forEach((button) => button.addEventListener('click', close));
  modal.addEventListener('keydown', (event) => {
    if (modal.hidden) return;
    if (event.key === 'Escape') { event.preventDefault(); close(); return; }
    if (event.key !== 'Tab') return;
    const focusable = [...dialog.querySelectorAll('button:not([disabled]),[tabindex="0"]')].filter((node) => node.getClientRects().length);
    if (!focusable.length) { event.preventDefault(); title.focus(); return; }
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  Object.entries(views).forEach(([kind, view]) => {
    view.querySelector('[data-expert-action-submit]')?.addEventListener('click', () => {
      if (!active || active.kind !== kind) return;
      if (kind === 'notify') begin(active, active.phase === 'confirmed' ? 'unsubscribe' : active.operation || 'subscribe');
      else if (active.phase === 'confirmed') return;
      else begin(active, 'reserve');
    });
    view.querySelector('[data-expert-action-secondary]')?.addEventListener('click', () => {
      if (!active || active.kind !== kind) return;
      if (kind === 'book' && active.phase === 'confirmed' && active.bookingId) begin(active, 'cancel');
      else close();
    });
  });
  document.addEventListener('nebula:expert-availability-subscription-receipt', (event) => settle('notify', event.detail || {}));
  document.addEventListener('nebula:expert-availability-subscription-error', (event) => settle('notify', { ...(event.detail || {}), accepted: false }));
  document.addEventListener('nebula:expert-booking-receipt', (event) => settle('book', event.detail || {}));
  document.addEventListener('nebula:expert-booking-cancel-receipt', (event) => settle('book', event.detail || {}, 'cancel'));
  document.addEventListener('nebula:expert-booking-error', (event) => settle('book', { ...(event.detail || {}), accepted: false }));
  document.addEventListener('nebula:expert-card-action-receipt', (event) => {
    const detail = event.detail || {};
    settle(detail.kind || (detail.action?.includes('booking') ? 'book' : 'notify'), detail);
  });

  window.NebulaExpertCardActions = {
    getState: () => [...entries.values()].map((entry) => { const { root, timer, ...snapshot } = entry; return snapshot; }),
    close,
    emitHostReceipt: (detail) => document.dispatchEvent(new CustomEvent('nebula:expert-card-action-receipt', { detail })),
  };
  roots().forEach((root) => { root.dataset.expertCardActionsReady = 'true'; });
})();
