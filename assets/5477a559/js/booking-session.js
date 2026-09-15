(() => {
  const modal = document.querySelector('[data-booking-session]');
  if (!modal) return;

  const dialog = modal.querySelector('[role="dialog"]');
  const closeButtons = modal.querySelectorAll('[data-booking-close]');
  const dayList = modal.querySelector('[data-booking-days]');
  const timeButtons = modal.querySelectorAll('[data-booking-time]');
  const submit = modal.querySelector('[data-booking-submit]');
  const status = modal.querySelector('[data-booking-status]');
  const name = modal.querySelector('[data-booking-expert-name]');
  const rate = modal.querySelector('[data-booking-expert-rate]');
  const avatar = modal.querySelector('[data-booking-expert-avatar]');
  let opener = null;
  let chosenDay = '';
  let chosenTime = '';

  const makeDays = () => {
    const formatter = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const labels = ['Today', 'Tomorrow'];
    dayList.replaceChildren(...Array.from({ length: 4 }, (_, offset) => {
      const date = new Date();
      date.setDate(date.getDate() + offset);
      const label = labels[offset] || formatter.format(date);
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.bookingDay = label;
      button.setAttribute('aria-pressed', 'false');
      button.textContent = label;
      return button;
    }));
  };

  const syncSubmit = () => { submit.disabled = !(chosenDay && chosenTime); };
  const select = (buttons, selected, value) => buttons.forEach((button) => button.setAttribute('aria-pressed', String(button === selected)));
  const restore = () => { if (opener instanceof HTMLElement && opener.isConnected) opener.focus(); };
  const close = () => {
    modal.hidden = true;
    document.documentElement.removeAttribute('data-booking-session-open');
    restore();
  };

  const open = (trigger) => {
    const card = trigger.closest('[data-psychic-card]');
    const cardName = card?.querySelector('.fv-card__identity h2, .ps-card__identity h3')?.textContent.trim() || 'Expert';
    const cardRate = card?.querySelector('.fv-card__action small, .ps-card__rate')?.textContent.trim() || 'Chat for 45 credits/min';
    const cardAvatar = card?.querySelector('.fv-card__avatar, .ps-card__avatar');
    opener = trigger;
    chosenDay = '';
    chosenTime = '';
    name.textContent = cardName;
    rate.textContent = cardRate;
    avatar.src = cardAvatar?.getAttribute('src') || '';
    avatar.alt = '';
    makeDays();
    select(timeButtons, null);
    status.textContent = 'Select a day and a time to continue.';
    submit.textContent = 'Book session';
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
    const button = event.target.closest('[data-booking-day]');
    if (!button) return;
    chosenDay = button.dataset.bookingDay || '';
    select(dayList.querySelectorAll('[data-booking-day]'), button);
    status.textContent = chosenTime ? 'Your preferred time is selected.' : 'Now choose an available time.';
    syncSubmit();
  });

  timeButtons.forEach((button) => button.addEventListener('click', () => {
    chosenTime = button.dataset.bookingTime || '';
    select(timeButtons, button);
    status.textContent = chosenDay ? 'Your preferred time is selected.' : 'Now choose a day.';
    syncSubmit();
  }));

  submit.addEventListener('click', () => {
    if (submit.disabled) return;
    submit.disabled = true;
    submit.textContent = 'Request prepared';
    status.textContent = `Booking request for ${chosenDay} at ${chosenTime} is ready.`;
    modal.dispatchEvent(new CustomEvent('nebula:booking-request-prepared', {
      bubbles: true,
      detail: { expert: name.textContent, day: chosenDay, time: chosenTime, backendRequired: true, persisted: false, staticProjection: true }
    }));
  });

  closeButtons.forEach((button) => button.addEventListener('click', close));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !modal.hidden) close(); });
})();
