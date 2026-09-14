(() => {
  const root = document.querySelector('[data-nebula-psychics]');
  if (!root) return;

  const status = root.querySelector('[data-psychic-filter-status]');
  const say = (message) => { if (status) status.textContent = message; };
  const cards = [...root.querySelectorAll('[data-psychic-card]')];
  root.querySelectorAll('[data-psychic-favorite]').forEach((control) => {
    control.addEventListener('click', (event) => {
      event.stopPropagation();
      const pressed = control.getAttribute('aria-pressed') === 'true';
      const card = control.closest('[data-psychic-card]');
      const name = card?.querySelector('h3')?.textContent?.trim() || 'Psychic';
      control.setAttribute('aria-pressed', pressed ? 'false' : 'true');
      control.setAttribute('aria-label', `${pressed ? 'Add' : 'Remove'} ${name} ${pressed ? 'to' : 'from'} favorites`);
      const image = control.querySelector('img');
      if (image?.dataset.favoriteOn && image?.dataset.favoriteOff) image.src = pressed ? image.dataset.favoriteOff : image.dataset.favoriteOn;
      say(`${name} ${pressed ? 'removed from' : 'added to'} favorites locally.`);
      root.dispatchEvent(new CustomEvent('nebula:psychic-favorite-intent-required', { bubbles: true, detail: { psychic: name, backendRequired: true, persisted: false, listMutation: false, staticProjection: true } }));
    });
  });

  cards.forEach((card) => {
    const openProfile = () => { if (card.dataset.profileUrl) window.location.assign(card.dataset.profileUrl); };
    card.addEventListener('click', (event) => { if (!event.target.closest('a,button')) openProfile(); });
    card.addEventListener('keydown', (event) => {
      if ((event.key === 'Enter' || event.key === ' ') && !event.target.closest('a,button')) { event.preventDefault(); openProfile(); }
    });
  });

  const drawer = root.querySelector('#ps-filter-drawer');
  const scrim = root.querySelector('[data-psychic-filter-scrim]');
  const setDrawer = (open) => {
    if (!drawer || !scrim) return;
    drawer.hidden = !open;
    scrim.hidden = !open;
    document.body.classList.toggle('fv-filter-open', open);
    if (open) drawer.querySelector('[data-psychic-filter-close]')?.focus();
  };
  root.querySelectorAll('.ps-section-filter').forEach((control) => control.addEventListener('click', () => setDrawer(true)));
  drawer?.querySelector('[data-psychic-filter-close]')?.addEventListener('click', () => setDrawer(false));
  scrim?.addEventListener('click', () => setDrawer(false));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && drawer && !drawer.hidden) setDrawer(false); });

  const applyFilters = () => {
    if (!drawer) return;
    const selectedStatus = [...drawer.querySelectorAll('[data-psychic-filter-status]:checked')].map((node) => node.value).filter((value) => value !== 'all');
    const specialties = [...drawer.querySelectorAll('[data-psychic-filter-specialty]:checked')].map((node) => node.value);
    const experience = drawer.querySelector('[data-psychic-filter-experience]:checked')?.value || 'any';
    const rating = Number(drawer.querySelector('[data-psychic-filter-rating]:checked')?.value || 0);
    let visible = 0;
    cards.forEach((card) => {
      const statusMatch = !selectedStatus.length || selectedStatus.includes(card.dataset.status || '');
      const specialtyMatch = !specialties.length || specialties.some((value) => (card.dataset.specialties || '').includes(value));
      const experienceMatch = experience === 'any' || Number(card.dataset.experience || 0) >= Number(experience);
      const ratingMatch = Number(card.dataset.rating || 0) >= rating;
      card.hidden = !(statusMatch && specialtyMatch && experienceMatch && ratingMatch);
      if (!card.hidden) visible += 1;
    });
    say(visible ? `${visible} matching psychics shown.` : 'No psychics match these filters.');
    setDrawer(false);
  };
  drawer?.querySelector('[data-psychic-filter-apply]')?.addEventListener('click', applyFilters);
  drawer?.querySelector('[data-psychic-filter-reset]')?.addEventListener('click', () => {
    drawer.querySelectorAll('input[type="checkbox"]').forEach((input) => { input.checked = input.value === 'all'; });
    drawer.querySelector('[data-psychic-filter-experience][value="any"]')?.click();
    drawer.querySelector('[data-psychic-filter-rating][value="4"]')?.click();
    cards.forEach((card) => { card.hidden = false; });
    say('Psychic filters reset.');
    setDrawer(false);
  });
  drawer?.querySelectorAll('[data-psychic-filter-status]').forEach((input) => input.addEventListener('change', () => {
    if (input.value === 'all' && input.checked) drawer.querySelectorAll('[data-psychic-filter-status]').forEach((node) => { if (node !== input) node.checked = false; });
    if (input.value !== 'all' && input.checked) drawer.querySelector('[data-psychic-filter-status][value="all"]').checked = false;
  }));

  root.querySelectorAll('.ps-section').forEach((section) => {
    const grid = section.querySelector('.ps-grid');
    section.querySelector('[data-section-prev]')?.addEventListener('click', () => grid?.scrollBy({ left: -Math.max(240, grid.clientWidth * .85), behavior: 'smooth' }));
    section.querySelector('[data-section-next]')?.addEventListener('click', () => grid?.scrollBy({ left: Math.max(240, grid.clientWidth * .85), behavior: 'smooth' }));
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
