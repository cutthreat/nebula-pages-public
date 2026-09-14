/* UI-only projection. No requests, storage, auth, presence or synthetic availability. */
(() => {
  'use strict';
  const root = document.querySelector('[data-psychic-profile]');
  if (!root) return;
  const name = root.dataset.psychicName;
  const favorite = root.querySelector('[data-psychic-favorite]');
  favorite?.addEventListener('click', () => {
    const pressed = favorite.getAttribute('aria-pressed') === 'true';
    favorite.setAttribute('aria-pressed', String(!pressed));
    favorite.setAttribute('aria-label', `${pressed ? 'Add' : 'Remove'} ${name} ${pressed ? 'to' : 'from'} favorites`);
    const icon = favorite.querySelector('img[data-favorite-on]');
    if (icon) icon.src = pressed ? icon.dataset.favoriteOff : icon.dataset.favoriteOn;
    root.dispatchEvent(new CustomEvent('nebula:psychic-favorite-intent-required', {
      bubbles: true, detail: { psychic: name, backendRequired: true, persisted: false, listMutation: false, staticProjection: true }
    }));
  });
  root.querySelectorAll('[data-faq-toggle]').forEach((toggle) => toggle.addEventListener('click', () => {
    const panel = document.getElementById(toggle.getAttribute('aria-controls'));
    if (!panel) return;
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    toggle.closest('.pc-faq__item')?.classList.toggle('is-open', !open);
    panel.hidden = open;
  }));
  const booking = document.querySelector('[data-booking-session]');
  const dialog = booking?.querySelector('[role="dialog"]');
  let returnFocus = null;
  const closeBooking = () => { if (booking) booking.hidden = true; returnFocus?.focus(); };
  root.querySelector('[data-card-intent="book"]')?.addEventListener('click', (event) => {
    if (!booking || !dialog) return;
    returnFocus = event.currentTarget;
    booking.hidden = false;
    dialog.focus();
  });
  booking?.querySelectorAll('[data-booking-close]').forEach((button) => button.addEventListener('click', closeBooking));
  booking?.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { event.preventDefault(); closeBooking(); }
    if (event.key === 'Tab') {
      const close = dialog.querySelector('[data-booking-close]');
      if (close) { event.preventDefault(); close.focus(); }
    }
  });
  const notice = document.getElementById('mia-integration-notice');
  root.querySelectorAll('[data-integration-required]').forEach((link) => link.addEventListener('click', (event) => {
    event.preventDefault();
    notice.querySelector('[data-integration-message]').textContent = `${link.dataset.integrationRequired} requires integration. This is a static frontend preview; no account, credits or consultation state was changed.`;
    notice.showModal();
  }));
})();
