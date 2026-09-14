(() => {
  const root = document.querySelector('[data-psychic-profile]');
  if (!root || root.dataset.psychicProfileBound === 'true') return;
  root.dataset.psychicProfileBound = 'true';
  const psychicName = root.dataset.psychicName;
  const favorite = root.querySelector('[data-psychic-favorite]');
  favorite?.addEventListener('click', () => {
    const pressed = favorite.getAttribute('aria-pressed') === 'true';
    favorite.setAttribute('aria-pressed', pressed ? 'false' : 'true');
    const icon = favorite.querySelector('img[data-favorite-on]');
    if (icon) icon.src = pressed ? icon.dataset.favoriteOff : icon.dataset.favoriteOn;
    favorite.setAttribute('aria-label', `${pressed ? 'Add' : 'Remove'} ${psychicName} ${pressed ? 'to' : 'from'} favorites`);
    root.dispatchEvent(new CustomEvent('nebula:psychic-favorite-intent-required', {
      bubbles: true,
      detail: { psychic: psychicName, backendRequired: true, persisted: false, listMutation: false, staticProjection: true }
    }));
  });
  root.querySelectorAll('[data-faq-toggle]').forEach((toggle) => toggle.addEventListener('click', () => {
    const panel = document.getElementById(toggle.getAttribute('aria-controls'));
    if (!panel || !root.contains(panel)) return;
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', open ? 'false' : 'true');
    toggle.closest('.pc-faq__item')?.classList.toggle('is-open', !open);
    panel.hidden = open;
  }));
})();
