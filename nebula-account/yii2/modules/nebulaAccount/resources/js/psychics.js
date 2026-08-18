(() => {
  const root = document.querySelector('[data-nebula-psychics]');
  if (!root) return;
  const favorite = root.querySelector('[data-psychic-favorite]');
  favorite?.addEventListener('click', () => {
    const pressed = favorite.getAttribute('aria-pressed') === 'true';
    favorite.setAttribute('aria-pressed', pressed ? 'false' : 'true');
    favorite.textContent = pressed ? '♡' : '♥';
    favorite.setAttribute('aria-label', pressed ? 'Add Margo Lover to favorites' : 'Remove Margo Lover from favorites');
    root.dispatchEvent(new CustomEvent('nebula:psychic-favorite-intent-required', {
      bubbles: true,
      detail: { psychic: 'Margo Lover', backendRequired: true, persisted: false, listMutation: false, staticProjection: true }
    }));
  });
  root.querySelectorAll('[data-faq-toggle]').forEach((toggle) => toggle.addEventListener('click', () => {
    const panel = document.getElementById(toggle.getAttribute('aria-controls'));
    if (!panel) return;
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', open ? 'false' : 'true');
    toggle.closest('.pc-faq__item')?.classList.toggle('is-open', !open);
    panel.hidden = open;
  }));
})();
