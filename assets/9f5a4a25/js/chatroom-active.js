(() => {
  const root = document.querySelector('[data-nebula-chatroom-active]');
  if (!root) return;
  const intent = (name, detail) => root.dispatchEvent(new CustomEvent(name, { bubbles: true, detail }));
  const composer = root.querySelector('[data-active-composer]');
  const send = root.querySelector('[data-active-action="send-intent"]');
  const sendStateImage = send?.querySelector('[data-active-send-state-image]');
  const live = root.querySelector('[data-active-live-status]');
  const favorite = root.querySelector('[data-active-action="favorite"]');
  const rail = root.querySelector('[data-active-list-open]');
  const drawer = root.querySelector('#active-list-drawer');
  const scrim = root.querySelector('[data-active-list-scrim]');
  const drawerClose = root.querySelector('[data-active-list-close]');
  const consultationControl = root.querySelector('[data-active-action="consultation-toggle"]');
  let drawerOrigin = null;
  const announce = (message) => { if (live) live.textContent = message; };
  const renderFavorite = (selected) => {
    if (!favorite) return;
    favorite.setAttribute('aria-pressed', selected ? 'true' : 'false');
    favorite.setAttribute('aria-label', selected ? 'Remove Miss Shaya from favorites' : 'Add Miss Shaya to favorites');
    const inactiveIcon = favorite.querySelector('[data-favorite-state="inactive"]');
    const activeIcon = favorite.querySelector('[data-favorite-state="active"]');
    if (inactiveIcon) inactiveIcon.hidden = selected;
    if (activeIcon) activeIcon.hidden = !selected;
    root.dataset.favoriteState = selected ? 'selected-local' : 'inactive';
  };
  const renderConsultation = (state) => {
    if (!consultationControl) return;
    const running = state === 'running';
    consultationControl.dataset.consultationState = state;
    consultationControl.setAttribute('aria-pressed', running ? 'true' : 'false');
    const label = consultationControl.querySelector('[data-consultation-label]');
    if (label) label.textContent = running ? 'Pause consultation' : 'Resume consultation';
    consultationControl.setAttribute('aria-label', running ? 'Pause consultation' : 'Resume consultation');
    root.dataset.consultationState = state;
  };
  const syncComposer = () => {
    if (!composer || !send) return;
    const ready = composer.value.trim().length > 0;
    const multiline = composer.value.includes('\n') || composer.scrollHeight > composer.clientHeight + 2;
    send.disabled = !ready;
    send.setAttribute('aria-disabled', ready ? 'false' : 'true');
    const state = ready ? (multiline ? 'multiline' : 'text_ready') : 'empty_unactive';
    root.dataset.composerState = state;
    const activeState = state === 'multiline' ? 'multiline' : (state === 'text_ready' ? 'ready' : 'empty');
    const stateSrc = sendStateImage?.dataset[`src${activeState[0].toUpperCase()}${activeState.slice(1)}`];
    if (sendStateImage && stateSrc) {
      sendStateImage.src = stateSrc;
      sendStateImage.dataset.state = activeState;
    }
  };
  const sendIntent = () => {
    if (!composer || !send || send.disabled) return;
    intent('nebula:chat-send-intent-required', {
      text: composer.value,
      messageLength: composer.value.trim().length,
      backendRequired: true,
      persisted: false,
      deliveryClaimed: false,
      staticProjection: true,
    });
    root.dataset.lastAction = 'send-intent-backend-required';
    announce('Message is ready to send. Delivery requires the chat backend.');
    composer.focus();
  };
  composer?.addEventListener('input', syncComposer);
  composer?.addEventListener('keydown', (event) => {
    if (event.isComposing || event.keyCode === 229) return;
    if (event.key !== 'Enter' || event.shiftKey) return;
    event.preventDefault();
    sendIntent();
  });
  send?.addEventListener('click', sendIntent);
  syncComposer();
  consultationControl?.addEventListener('click', () => {
    const next = consultationControl.dataset.consultationState === 'running' ? 'paused' : 'running';
    const eventName = next === 'running' ? 'nebula:consultation-start-intent-required' : 'nebula:consultation-pause-intent-required';
    renderConsultation(next);
    intent(eventName, { backendRequired: true, sessionMutated: false, timerStarted: false, timerMutated: false, billingMutated: false, persisted: false, staticProjection: true, liveMount: false });
    announce(next === 'running' ? 'Consultation start requested. Host confirmation is required.' : 'Consultation pause requested. Host confirmation is required.');
  });
  renderConsultation(consultationControl?.dataset.consultationState || 'running');
  renderFavorite(favorite?.getAttribute('aria-pressed') === 'true');
  favorite?.addEventListener('click', () => {
    const selected = favorite.getAttribute('aria-pressed') !== 'true';
    renderFavorite(selected);
    intent('nebula:active-favorite-intent-required', {
      backendRequired: true,
      favoriteSelected: selected,
      persisted: false,
      staticProjection: true,
      liveMount: false,
    });
    announce(selected ? 'Favorite request sent. Saving requires the account host.' : 'Favorite removal request sent. Saving requires the account host.');
  });
  root.querySelector('[data-active-action="end-chat-intent"]')?.addEventListener('click', () => {
    intent('nebula:end-chat-intent-required', { backendRequired: true, sessionMutated: false, staticProjection: true });
  });
  root.querySelector('.active-back')?.addEventListener('click', () => {
    intent('nebula:chat-active-back-required', { backendRequired: true, staticProjection: true });
  });

  const setDrawer = (open) => {
    if (!rail || !drawer) return;
    drawer.hidden = false;
    drawer.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
    drawer.inert = !open;
    rail.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (scrim) scrim.hidden = !open;
    if (open) {
      drawerOrigin = document.activeElement === rail ? rail : (drawerOrigin || rail);
      drawerClose?.focus();
    } else {
      drawerOrigin?.focus();
      drawerOrigin = null;
    }
  };
  if (drawer && window.matchMedia('(max-width: 991px)').matches) {
    drawer.setAttribute('aria-hidden', 'true');
    drawer.inert = true;
  }
  rail?.addEventListener('click', () => setDrawer(true));
  drawerClose?.addEventListener('click', () => setDrawer(false));
  scrim?.addEventListener('click', () => setDrawer(false));
  drawer?.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { event.preventDefault(); setDrawer(false); return; }
    if (event.key !== 'Tab') return;
    const focusables = [...drawer.querySelectorAll('button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])')].filter((node) => !node.hasAttribute('disabled'));
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
})();
