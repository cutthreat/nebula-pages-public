// Explicit page-local demo data; never a service availability or booking confirmation.
function createConsultationBookingModel({ now = () => Date.now(), timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone } = {}) {
  const reservations = new Map();
  const dayFormat = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone });
  const slots = (expertId) => {
    if (typeof expertId !== 'string' || !expertId.trim()) return [];
    return Array.from({ length: 4 }, (_, offset) => {
      const date = new Date(now());
      date.setDate(date.getDate() + offset + 1);
      date.setHours(offset < 2 ? 18 : 16, 0, 0, 0);
      return Array.from({ length: 4 }, (_, index) => {
        const startsAt = new Date(date.getTime() + index * 30 * 60 * 1000).toISOString();
        return { id: expertId + ':' + startsAt, expertId, startsAt, dayKey: dayFormat.format(new Date(startsAt)), timeZone };
      });
    }).flat();
  };
  const get = (expertId) => {
    const booking = reservations.get(expertId);
    if (booking && Date.parse(booking.startsAt) <= now()) { reservations.delete(expertId); return null; }
    return booking ? { ...booking } : null;
  };
  const reserve = (expertId, slotId) => {
    const slot = slots(expertId).find((candidate) => candidate.id === slotId && Date.parse(candidate.startsAt) > now());
    if (!slot) return { ok: false, reason: 'slot-unavailable' };
    const booking = { ...slot, demo: true, persisted: false, billingMutated: false, sessionMutated: false };
    reservations.set(expertId, booking);
    return { ok: true, booking: { ...booking } };
  };
  const cancel = (expertId) => reservations.delete(expertId);
  return { slots, get, reserve, cancel, timeZone };
}
if (typeof module !== 'undefined' && module.exports) module.exports = { createConsultationBookingModel };

function mountConsultationBooking(modal) {
  const root = document.querySelector('[data-nebula-chatroom]');
  const demo = !!root && root.dataset.consultationDemo === 'true' && root.dataset.staticProjection === 'true'
    && ['localhost', '127.0.0.1', '[::1]', '::1'].includes(window.location.hostname);
  const model = createConsultationBookingModel();
  // The header and dialog share this page's calendar, including its demo-only boundary.
  document.addEventListener('nebula:consultation-booking-availability', (event) => {
    const detail = event.detail;
    if (!detail || typeof detail.expertId !== 'string' || !detail.expertId.trim()) return;
    detail.booked = demo && !!model.get(detail.expertId);
    detail.available = demo && model.slots(detail.expertId).some((slot) => Date.parse(slot.startsAt) > Date.now());
  });
  const dialog = modal.querySelector('[role="dialog"]');
  const title = modal.querySelector('#booking-session-title');
  const description = modal.querySelector('#booking-session-description');
  const days = modal.querySelector('[data-booking-days]');
  const times = modal.querySelector('[data-booking-times]');
  const timeSection = modal.querySelector('[data-booking-time-section]');
  const selection = modal.querySelector('[data-booking-selection]');
  const summary = modal.querySelector('[data-booking-summary]');
  const status = modal.querySelector('[data-booking-status]');
  const submit = modal.querySelector('[data-booking-submit]');
  const secondary = modal.querySelector('[data-booking-secondary]');
  const cancelReservation = modal.querySelector('[data-booking-cancel-reservation]');
  const dateFormat = new Intl.DateTimeFormat('en-US', { dateStyle: 'full', timeZone: model.timeZone });
  const dayFormat = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: model.timeZone });
  const timeFormat = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: model.timeZone });
  let expert = null, opener = null, stage = 'choose', selectedDay = '', selectedSlot = null, available = [], inertOwned = [];
  let pendingOperation = null;
  let operationAckTimer = null;
  let operationTimeoutTimer = null;
  let operationSequence = 0;
  const changed = (booking) => document.dispatchEvent(new CustomEvent('nebula:consultation-demo-booking-changed', {
    detail: { expertId: expert.id, booking, demo: true, persisted: false, sessionMutated: false, billingMutated: false },
  }));
  const clearOperationTimers = () => {
    if (operationAckTimer !== null) window.clearTimeout(operationAckTimer);
    if (operationTimeoutTimer !== null) window.clearTimeout(operationTimeoutTimer);
    operationAckTimer = null;
    operationTimeoutTimer = null;
  };
  const operationSnapshot = (operation = pendingOperation) => operation ? {
    ...operation, expertName: expert?.name || operation.expertName, demo: true, backendRequired: false,
    persisted: false, sessionMutated: false, billingMutated: false, staticProjection: true,
  } : null;
  const dispatchOperation = (name, detail) => document.dispatchEvent(new CustomEvent(name, { detail }));
  const markOperationIndeterminate = () => {
    if (!pendingOperation) return;
    clearOperationTimers();
    pendingOperation.indeterminate = true;
    stage = 'indeterminate';
    modal.dataset.bookingOperation = pendingOperation.kind;
    status.textContent = 'The calendar did not confirm this request. Check the same request before trying again.';
    render('indeterminate');
    dispatchOperation('nebula:consultation-booking-timeout', { ...operationSnapshot(), reconciliationRequired: true, source: 'ui' });
  };
  const markOperationError = (message = 'The calendar could not confirm this request.') => {
    if (!pendingOperation) return;
    clearOperationTimers();
    pendingOperation.error = message;
    pendingOperation.indeterminate = false;
    stage = 'error';
    modal.dataset.bookingOperation = pendingOperation.kind;
    render('error');
    status.textContent = message;
    dispatchOperation('nebula:consultation-booking-error', { ...operationSnapshot(), error: message, source: 'ui' });
  };
  const settleOperation = (detail = {}) => {
    if (!pendingOperation || !expert || detail.expertId !== pendingOperation.expertId || detail.requestId !== pendingOperation.requestId || detail.idempotencyKey !== pendingOperation.idempotencyKey) return;
    clearOperationTimers();
    if (detail.accepted !== true && detail.confirmed !== true) { markOperationError(detail.error || 'The calendar did not confirm this request.'); return; }
    const operation = pendingOperation;
    pendingOperation = null;
    modal.dataset.bookingOperation = '';
    if (operation.kind === 'reserve') {
      const result = model.reserve(operation.expertId, operation.slotId);
      if (!result.ok) { pendingOperation = operation; markOperationError('That time is no longer available. Choose another time.'); return; }
      changed(result.booking); render('saved');
    } else {
      model.cancel(operation.expertId); changed(null); close();
    }
    dispatchOperation('nebula:consultation-booking-changed', { ...operationSnapshot(operation), transition: operation.kind === 'reserve' ? 'confirmed' : 'cancelled', hostReceipt: true });
  };
  const scheduleLocalReceipt = () => {
    if (!pendingOperation) return;
    const operation = pendingOperation;
    const fault = root?.dataset.miaBookingTestFault || '';
    if (root) delete root.dataset.miaBookingTestFault;
    if (fault === 'timeout') {
      operationTimeoutTimer = window.setTimeout(markOperationIndeterminate, 650);
    } else if (fault === 'error' || (fault === 'cancel-error' && operation.kind === 'cancel')) {
      operationAckTimer = window.setTimeout(() => markOperationError('The local calendar host rejected this request.'), 260);
    } else {
      operationAckTimer = window.setTimeout(() => dispatchOperation(operation.kind === 'reserve' ? 'nebula:consultation-booking-receipt' : 'nebula:consultation-booking-cancel-receipt', {
        ...operationSnapshot(operation), accepted: true, confirmed: true, hostReceipt: true,
      }), 260);
      operationTimeoutTimer = window.setTimeout(() => { if (pendingOperation?.requestId === operation.requestId) markOperationIndeterminate(); }, 1200);
    }
  };
  const beginOperation = (kind, { reconcile = false } = {}) => {
    if (!expert || !demo) return;
    const previous = pendingOperation;
    const requestId = reconcile && previous?.requestId ? previous.requestId : `booking-${++operationSequence}`;
    const idempotencyKey = reconcile && previous?.idempotencyKey ? previous.idempotencyKey : `booking:${requestId}`;
    pendingOperation = {
      kind, expertId: expert.id, expertName: expert.name, requestId, idempotencyKey,
      slotId: kind === 'reserve' ? selectedSlot?.id : null, startedAt: Date.now(), indeterminate: false,
    };
    modal.dataset.bookingOperation = kind;
    render(kind === 'cancel' ? 'pending-cancel' : 'pending');
    const detail = operationSnapshot();
    dispatchOperation('nebula:consultation-booking-intent', detail);
    dispatchOperation(kind === 'reserve' ? 'nebula:consultation-booking-reserve-intent' : 'nebula:consultation-booking-cancel-intent', detail);
    scheduleLocalReceipt();
  };
  const close = ({ restoreFocus = true, reason = 'dismiss' } = {}) => {
    if (modal.hidden) return;
    if (pendingOperation) {
      const operation = pendingOperation;
      clearOperationTimers();
      pendingOperation = null;
      dispatchOperation('nebula:consultation-booking-aborted', { ...operationSnapshot(operation), reason });
    }
    modal.hidden = true;
    document.documentElement.removeAttribute('data-booking-session-open');
    inertOwned.forEach((element) => { element.inert = false; });
    inertOwned = [];
    opener?.setAttribute('aria-expanded', 'false');
    if (restoreFocus && opener?.isConnected) opener.focus({ preventScroll: true });
    opener = null;
  };
  const summaryRow = (label, value) => {
    const row = document.createElement('div'), term = document.createElement('dt'), detail = document.createElement('dd');
    term.textContent = label; detail.textContent = value; row.append(term, detail); return row;
  };
  const updateSummary = (slot) => {
    summary.replaceChildren(...[
      ['Expert', expert.name], ['Date', dateFormat.format(new Date(slot.startsAt))],
      ['Start time', timeFormat.format(new Date(slot.startsAt))], ['Rate', expert.rate],
    ].map(([label, value]) => summaryRow(label, value)));
  };
  const slotButton = (slot) => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'booking-session__time'; button.dataset.bookingSlot = slot.id;
    button.textContent = timeFormat.format(new Date(slot.startsAt));
    button.setAttribute('aria-pressed', String(slot.id === selectedSlot?.id));
    button.addEventListener('click', () => {
      selectedSlot = slot;
      times.querySelectorAll('[data-booking-slot]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
      submit.disabled = false;
      status.textContent = dateFormat.format(new Date(slot.startsAt)) + ' at ' + timeFormat.format(new Date(slot.startsAt)) + '. Review before confirming.';
    });
    return button;
  };
  const renderTimes = () => {
    timeSection.hidden = !selectedDay;
    times.replaceChildren(...available.filter((slot) => slot.dayKey === selectedDay).map(slotButton));
  };
  const renderDays = () => {
    const uniqueDays = [...new Set(available.map((slot) => slot.dayKey))];
    days.replaceChildren(...uniqueDays.map((dayKey) => {
      const daySlots = available.filter((slot) => slot.dayKey === dayKey);
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'booking-session__day'; button.dataset.bookingDay = dayKey;
      button.setAttribute('aria-pressed', String(dayKey === selectedDay));
      const copy = document.createElement('strong'), hint = document.createElement('span');
      copy.textContent = dayFormat.format(new Date(daySlots[0].startsAt)); hint.textContent = '4 demo times';
      button.append(copy, hint);
      button.addEventListener('click', () => {
        selectedDay = dayKey; selectedSlot = null; submit.disabled = true;
        days.querySelectorAll('[data-booking-day]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
        renderTimes(); status.textContent = 'Now choose a start time.';
      });
      return button;
    }));
    renderTimes();
  };
  const render = (nextStage, { focus = true } = {}) => {
    stage = nextStage; modal.dataset.bookingPhase = stage;
    const choosing = stage === 'choose', reviewing = stage === 'review', cancelling = stage === 'cancel';
    const pending = stage === 'pending' || stage === 'pending-cancel';
    const indeterminate = stage === 'indeterminate';
    const error = stage === 'error';
    const saved = stage === 'saved' || (error && pendingOperation?.kind === 'cancel' && !!model.get(expert.id));
    const pendingSlot = pendingOperation?.slotId ? available.find((slot) => slot.id === pendingOperation.slotId) : null;
    const currentSlot = reviewing ? selectedSlot : model.get(expert.id) || pendingSlot || selectedSlot;
    modal.dataset.bookingPending = String(pending);
    modal.dataset.bookingConfirmed = String(saved);
    modal.dataset.bookingError = String(error);
    modal.dataset.bookingIndeterminate = String(indeterminate);
    title.textContent = choosing ? 'Book your consultation' : reviewing ? 'Review your booking' : cancelling ? 'Cancel this booking?' : pending ? (stage === 'pending-cancel' ? 'Cancelling your booking' : 'Saving your booking') : indeterminate ? 'Checking your booking status' : error ? (pendingOperation?.kind === 'cancel' ? 'Your booking is still active' : 'We couldn’t save that yet') : 'Your demo booking';
    description.textContent = choosing ? 'Choose a date and time with ' + expert.name + '.' : saved ? 'Saved for this page only. No real appointment has been reserved.' : cancelling ? 'This removes your demo booking with ' + expert.name + '.' : pending ? 'We are waiting for the calendar host to acknowledge the same request.' : indeterminate ? 'The calendar did not answer in time. Reconcile before trying anything new.' : error ? (pendingOperation?.kind === 'cancel' ? 'The cancellation was not confirmed, so your booking remains active.' : 'Nothing was saved. You can retry the same request without creating a duplicate.') : 'Check the details before you confirm.';
    selection.hidden = !choosing || !demo;
    summary.hidden = choosing || !currentSlot;
    cancelReservation.hidden = !(saved && !!model.get(expert.id));
    submit.classList.toggle('is-destructive', cancelling);
    submit.textContent = choosing ? (demo ? 'Review booking' : 'Calendar unavailable') : reviewing ? 'Confirm demo booking' : cancelling ? 'Cancel booking' : pending ? (stage === 'pending-cancel' ? 'Cancelling…' : 'Saving…') : indeterminate ? 'Check status' : error ? (pendingOperation?.kind === 'cancel' ? 'Try cancellation again' : 'Try again') : 'Done';
    submit.disabled = pending || (choosing && (!demo || !selectedSlot)) || reviewing && !selectedSlot;
    secondary.textContent = choosing ? 'Not now' : reviewing ? 'Change date or time' : cancelling ? 'Keep booking' : pending ? 'Cancel request' : indeterminate ? 'Close' : error ? (pendingOperation?.kind === 'cancel' ? 'Keep booking' : 'Not now') : saved ? 'Change booking' : 'Close';
    if (choosing) {
      renderDays();
      status.textContent = demo ? 'Demo calendar. Booking does not start the paid chat.' : 'The expert calendar is not connected. No booking can be made here yet.';
    } else if (currentSlot) {
      updateSummary(currentSlot);
      if (pending) status.textContent = 'Pending — waiting for the local calendar host acknowledgement.';
      else if (indeterminate) status.textContent = 'Status unknown. Use Check status to reconcile the same request.';
      else if (error) status.textContent = pendingOperation?.error || (pendingOperation?.kind === 'cancel' ? 'Cancellation failed. Your confirmed booking remains active.' : 'Booking was not confirmed.');
      else if (cancelling) status.textContent = 'Review before cancelling. No credits are charged.';
      else status.textContent = 'No credits charged. The consultation timer stays off.';
    } else {
      selectedSlot = null;
      if (!['pending', 'pending-cancel', 'indeterminate', 'error'].includes(stage)) { render('choose'); return; }
      status.textContent = pending ? 'Pending — waiting for the local calendar host acknowledgement.' : indeterminate ? 'Status unknown. Use Check status to reconcile the same request.' : (pendingOperation?.error || 'Booking was not confirmed.');
    }
    if (focus) { dialog.scrollTop = 0; title.focus({ preventScroll: true }); }
  };
  document.addEventListener('nebula:consultation-booking-open', (event) => {
    const detail = event.detail;
    if (!modal.hidden || !detail || typeof detail.expertId !== 'string' || !detail.expertId.trim() || typeof detail.expertName !== 'string') return;
    if (!(detail.opener instanceof HTMLElement) || !root?.contains(detail.opener)) return;
    clearOperationTimers();
    pendingOperation = null;
    expert = { id: detail.expertId, name: detail.expertName, rate: typeof detail.rate === 'string' ? detail.rate : 'Rate unavailable' };
    opener = detail.opener; selectedDay = ''; selectedSlot = null; available = demo ? model.slots(expert.id) : [];
    modal.querySelector('[data-booking-demo]').hidden = !demo;
    modal.querySelector('[data-booking-timezone]').textContent = 'All times in your time zone: ' + model.timeZone.replaceAll('_', ' ');
    let branch = modal;
    while (branch.parentElement && branch !== document.body) {
      Array.from(branch.parentElement.children).forEach((sibling) => { if (sibling !== branch && !sibling.inert) { sibling.inert = true; inertOwned.push(sibling); } });
      branch = branch.parentElement;
    }
    modal.hidden = false; document.documentElement.dataset.bookingSessionOpen = 'true'; opener.setAttribute('aria-expanded', 'true');
    const existingBooking = demo ? model.get(expert.id) : null;
    // The header's confirmed booking action opens the same source calendar in
    // its cancellation state; a fresh offline action still starts at choose.
    render(detail.mode === 'cancel' && existingBooking ? 'cancel' : existingBooking ? 'saved' : 'choose');
  });
  document.addEventListener('nebula:consultation-booking-receipt', (event) => settleOperation(event.detail || {}));
  document.addEventListener('nebula:consultation-booking-cancel-receipt', (event) => settleOperation(event.detail || {}));
  document.addEventListener('nebula:consultation-booking-error', (event) => {
    const detail = event.detail || {};
    if (detail.source === 'ui' || !pendingOperation || detail.requestId !== pendingOperation.requestId || detail.expertId !== pendingOperation.expertId) return;
    markOperationError(detail.error || 'The calendar host returned an error.');
  });
  document.addEventListener('nebula:consultation-booking-timeout', (event) => {
    if (event.detail?.source !== 'ui' && event.detail?.requestId === pendingOperation?.requestId) markOperationIndeterminate();
  });
  document.addEventListener('nebula:chat-conversation-selected-local', (event) => {
    if (!modal.hidden && expert && event.detail?.conversationId !== expert.id) close({ restoreFocus: false, reason: 'expert-changed' });
  });
  document.addEventListener('nebula:mia-demo-reset', (event) => {
    const expertId = event.detail?.expertId;
    if (!demo || typeof expertId !== 'string' || !expertId) return;
    model.cancel(expertId);
    if (expert?.id === expertId && !modal.hidden) close({ restoreFocus: false, reason: 'demo-reset' });
  });
  submit.addEventListener('click', () => {
    if (submit.disabled || !demo || modal.hidden) return;
    if (stage === 'choose') { render('review'); return; }
    if (stage === 'review') {
      beginOperation('reserve');
      return;
    }
    if (stage === 'cancel') { beginOperation('cancel'); return; }
    if (stage === 'error' && pendingOperation) { beginOperation(pendingOperation.kind, { reconcile: true }); return; }
    if (stage === 'indeterminate' && pendingOperation) { beginOperation(pendingOperation.kind, { reconcile: true }); return; }
    close();
  });
  secondary.addEventListener('click', () => {
    if (stage === 'choose') close();
    else if (stage === 'cancel') render('saved');
    else if (stage === 'pending' || stage === 'pending-cancel') close({ reason: 'cancel-request' });
    else if (stage === 'indeterminate') close({ reason: 'indeterminate-dismiss' });
    else if (stage === 'error' && pendingOperation?.kind === 'cancel') { pendingOperation = null; clearOperationTimers(); render('saved'); }
    else { const current = stage === 'saved' ? model.get(expert.id) : selectedSlot; available = model.slots(expert.id); selectedSlot = available.find((slot) => slot.id === current?.id) || null; selectedDay = selectedSlot?.dayKey || ''; render('choose'); }
  });
  cancelReservation.addEventListener('click', () => { if (!cancelReservation.hidden && !pendingOperation) render('cancel'); });
  modal.querySelectorAll('[data-booking-close]').forEach((button) => button.addEventListener('click', () => close()));
  modal.addEventListener('keydown', (event) => {
    if (modal.hidden) return;
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); }
    if (event.key !== 'Tab') return;
    const focusable = [...dialog.querySelectorAll('button:not(:disabled), [href], input, select, textarea, [tabindex="0"]')].filter((element) => element.getClientRects().length);
    if (!focusable.length) { event.preventDefault(); title.focus(); return; }
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || !focusable.includes(document.activeElement))) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && (document.activeElement === last || !focusable.includes(document.activeElement))) { event.preventDefault(); first.focus(); }
  });
  document.addEventListener('nebula:mia-state-test-fault', (event) => {
    const kind = event.detail?.kind || event.detail?.fault;
    if (!pendingOperation) return;
    if (kind === 'booking-timeout') markOperationIndeterminate();
    else if (kind === 'booking-error' || kind === 'cancel-error') markOperationError('The local calendar host rejected this request.');
  });
  window.NebulaMiaBooking = {
    getState: () => ({ expertId: expert?.id || null, stage, pendingOperation: pendingOperation ? { ...pendingOperation } : null, booking: expert ? model.get(expert.id) : null, demo }),
    injectFault: (kind) => { if (root) root.dataset.miaBookingTestFault = kind; return pendingOperation ? { ...pendingOperation } : null; },
    reconcile: () => { if (pendingOperation && stage === 'indeterminate') beginOperation(pendingOperation.kind, { reconcile: true }); },
  };
  window.addEventListener('pagehide', () => close({ restoreFocus: false, reason: 'pagehide' }));
  document.dispatchEvent(new CustomEvent('nebula:consultation-booking-ready'));
}

(() => {
  if (typeof document === 'undefined') return;
  const modal = document.querySelector('[data-booking-session]');
  if (!modal) return;
  if (modal.hasAttribute('data-booking-consultation')) { mountConsultationBooking(modal); return; }

  const dialog = modal.querySelector('[role="dialog"]');
  const closeButtons = modal.querySelectorAll('[data-booking-close]');
  const dayList = modal.querySelector('[data-booking-days]');
  const submit = modal.querySelector('[data-booking-submit]');
  const status = modal.querySelector('[data-booking-status]');
  const title = modal.querySelector('#booking-session-title');
  const sourceOnly = modal.hasAttribute('data-booking-source-only');
  let opener = null;
  let chosenDay = '';
  let chosenHours = '';

  const makeDays = () => {
    const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long' });
    const shortDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
    const spokenDate = new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'long' });
    dayList.replaceChildren(...Array.from({ length: 4 }, (_, offset) => {
      const date = new Date();
      date.setDate(date.getDate() + offset + 1);
      const label = shortDate.format(date);
      const hours = offset < 2 ? '6:00 PM - 8:00 PM' : '4:00 PM - 6:00 PM';
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'booking-session__day';
      button.dataset.bookingDay = spokenDate.format(date);
      button.dataset.bookingHours = hours;
      button.setAttribute('aria-pressed', 'false');
      button.innerHTML = `<span class="booking-session__day-copy"><span>${weekday.format(date)}</span><strong>${label}</strong></span><span class="booking-session__hours"><small>Available hours</small><strong>${hours}</strong></span>`;
      return button;
    }));
  };

  const syncSubmit = () => { submit.disabled = !chosenDay; };
  const select = (buttons, selected, value) => buttons.forEach((button) => button.setAttribute('aria-pressed', String(button === selected)));
  const restore = () => { if (opener instanceof HTMLElement && opener.isConnected) opener.focus(); };
  const close = () => {
    modal.hidden = true;
    document.documentElement.removeAttribute('data-booking-session-open');
    restore();
  };

  const open = (trigger) => {
    const card = trigger.closest('[data-psychic-card]');
    const cardName = trigger.dataset.bookingExpertName
      || card?.querySelector('.fv-card__identity h2, .ps-card__identity h3')?.textContent.trim()
      || 'Expert';
    opener = trigger;
    chosenDay = '';
    chosenHours = '';
    if (sourceOnly) {
      dayList.replaceChildren();
      status.textContent = 'Static layout only. Expert availability and notifications require backend integration. No booking will be made.';
      submit.textContent = 'Calendar integration required';
    } else {
      title.textContent = `Pick dates from ${cardName} psychic’s calendar`;
      makeDays();
      status.textContent = 'Select a date from the expert’s available hours.';
      submit.textContent = 'Choose an available date';
    }
    syncSubmit();
    modal.hidden = false;
    document.documentElement.dataset.bookingSessionOpen = 'true';
    dialog.focus({ preventScroll: true });
  };

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-card-intent="book"]');
    if (!trigger) return;
    event.preventDefault();
    event.stopPropagation();
    open(trigger);
  }, true);

  dayList.addEventListener('click', (event) => {
    if (sourceOnly) return;
    const button = event.target.closest('[data-booking-day]');
    if (!button) return;
    chosenDay = button.dataset.bookingDay || '';
    chosenHours = button.dataset.bookingHours || '';
    select(dayList.querySelectorAll('[data-booking-day]'), button);
    status.textContent = `${chosenDay}, ${chosenHours} is selected.`;
    submit.textContent = `Notify me on ${chosenDay}`;
    syncSubmit();
  });

  submit.addEventListener('click', () => {
    if (sourceOnly || submit.disabled) return;
    submit.disabled = true;
    submit.textContent = 'Notification request prepared';
    status.textContent = `We will notify you about ${chosenDay}, ${chosenHours}.`;
    modal.dispatchEvent(new CustomEvent('nebula:booking-request-prepared', {
      bubbles: true,
      detail: { expert: title.textContent, day: chosenDay, time: chosenHours, backendRequired: true, persisted: false, staticProjection: true }
    }));
  });

  closeButtons.forEach((button) => button.addEventListener('click', close));
  modal.addEventListener('keydown', (event) => {
    if (sourceOnly && event.key === 'Tab' && !modal.hidden) {
      const closeButton = dialog.querySelector('[data-booking-close]');
      if (closeButton) { event.preventDefault(); closeButton.focus(); }
    }
  });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !modal.hidden) close(); });
})();
