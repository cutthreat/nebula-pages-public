(() => {
  const root = document.querySelector('[data-nebula-psychics]');
  if (!root || root.dataset.psychicsBound === 'true') return;
  root.dataset.psychicsBound = 'true';

  const emit = (name, detail) => root.dispatchEvent(new CustomEvent(name, { bubbles: true, detail }));
  const nameOf = (node) => node.dataset.psychicName || node.closest('[data-psychic-card]')?.querySelector('.ps-card__identity h3')?.textContent?.trim() || 'Expert';
  const filterTrigger = root.querySelector('.ps-section-filter');
  const filterDrawer = root.querySelector('#ps-filter-drawer');
  const filterScrim = root.querySelector('[data-psychic-filter-scrim]');
  const filterStatus = root.querySelector('[data-psychic-filter-status]');
  const focusInputs = [...root.querySelectorAll('[data-psychic-filter-focus]')];
  const initialFocus = root.dataset.psychicsFocus || '';
  const focusLabel = root.dataset.psychicsFocusLabel || '';
  const focusContractVersion = root.dataset.focusContractVersion || 'psychic-focus/v1';
  const focusQueryParameter = root.dataset.focusQueryParameter || 'focus';
  const trialPicker = document.querySelector('[data-nebula-expert-picker-trial][data-modal-embed="true"]');
  const questionBeforeStart = document.querySelector('[data-nebula-question-before-start]');
  const clientPreviewChatroomUrl = root.dataset.clientPreviewChatroomUrl || '';
  const questionTargets = (() => {
    try {
      const supplied = JSON.parse(questionBeforeStart?.dataset.questionTargets || '[]');
      return Array.isArray(supplied) ? supplied.filter((target) => target && typeof target.id === 'string' && typeof target.displayName === 'string') : [];
    } catch (_) {
      return [];
    }
  })();
  const questionTarget = (id) => questionTargets.find((target) => target.id === id) || null;
  const openQuestion = (trigger, selectedExpertId) => {
    questionBeforeStart?.dispatchEvent(new CustomEvent('nebula:question-before-start-open', {
      bubbles: true, detail: {trigger, selectedExpertId, staticProjection: true},
    }));
    return questionBeforeStart?.hidden === false
      && questionBeforeStart.dataset.lastAction === 'question-before-start-opened'
      && questionBeforeStart.dataset.selectedExpertId === selectedExpertId;
  };
  const questionExpertId = (trigger) => trigger?.closest('[data-question-expert-id]')?.dataset.questionExpertId;
  const connectingExpert = document.querySelector('[data-nebula-connecting-expert]');
  const unavailable = document.querySelector('[data-expert-unavailable-modal]');
  const unavailableScrim = unavailable?.querySelector('[data-action="close-expert-unavailable"]');
  const unavailableHeading = unavailable?.querySelector('#expert-unavailable-title');
  let filterPreviousOverflow = '';
  let unavailableReturnFocus = null;
  let connectionIntentPendingExpertId = '';

  const cardsFor = (section) => [...(section?.querySelectorAll('[data-psychic-card]') || [])];
  const matchingCardsFor = (section) => cardsFor(section).filter((card) => (
    card.dataset.filterMatch !== 'false' && card.dataset.collectionMatch !== 'false'
  ));

  // C76 group_24: booking a busy expert has a distinct availability outcome.
  // It deliberately stops before session creation, persistence or payment.
  const unavailableFocusables = () => [...(unavailable?.querySelectorAll('button:not([disabled])') || [])]
    .filter((item) => item.offsetParent !== null);

  const closeUnavailable = ({ restoreFocus = true } = {}) => {
    if (!unavailable || unavailable.hidden) return;
    unavailable.hidden = true;
    root.removeAttribute('aria-hidden');
    root.inert = false;
    document.documentElement.classList.remove('c76-modal-open');
    if (restoreFocus && unavailableReturnFocus instanceof HTMLElement && unavailableReturnFocus.isConnected) {
      unavailableReturnFocus.focus();
    }
  };

  const openUnavailable = (opener) => {
    if (!unavailable || !unavailableScrim || !unavailableHeading) return;
    unavailableReturnFocus = opener instanceof HTMLElement ? opener : document.activeElement;
    unavailable.hidden = false;
    root.setAttribute('aria-hidden', 'true');
    root.inert = true;
    document.documentElement.classList.add('c76-modal-open');
    unavailableHeading.focus();
    emit('nebula:expert-unavailable', {
      expert: nameOf(opener),
      intentSaved: true,
      sessionCreated: false,
      backendRequired: true,
      staticProjection: true,
    });
  };

  const sectionPageSize = (section) => section?.dataset.catalogueExpanded === 'true' ? 15 : 3;

  const sectionPagination = (section) => {
    let pager = section?.querySelector('[data-section-pagination]');
    if (pager || !section) return pager;
    pager = document.createElement('nav');
    pager.className = 'ps-section-pagination';
    pager.setAttribute('aria-label', 'Collection pages');
    pager.setAttribute('data-section-pagination', '');
    section.querySelector('.ps-view-all')?.insertAdjacentElement('beforebegin', pager);
    return pager;
  };

  const renderSectionPagination = (section, page, pageCount) => {
    const pager = sectionPagination(section);
    if (!pager) return;
    const show = section.dataset.catalogueExpanded === 'true' && pageCount > 1;
    pager.hidden = !show;
    if (!show) {
      pager.replaceChildren();
      return;
    }
    pager.replaceChildren();
    for (let index = 0; index < pageCount; index += 1) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = String(index + 1);
      button.dataset.collectionPage = String(index);
      button.setAttribute('aria-label', `Page ${index + 1}`);
      button.setAttribute('aria-current', index === page ? 'page' : 'false');
      button.disabled = index === page;
      pager.appendChild(button);
    }
  };

  // Figma 01-Psychics 1200 / 1088:24332: compact collections expose one
  // three-card row. "View All" expands that same collection; no card is
  // redirected to the unrelated global catalogue.
  const syncSectionPage = (section) => {
    const grid = section?.querySelector('.ps-grid');
    if (!section || !grid) return;
    const cards = [...grid.querySelectorAll('[data-psychic-card]')];
    const matching = matchingCardsFor(section);
    const pageSize = sectionPageSize(section);
    const pageCount = Math.ceil(matching.length / pageSize);
    const requestedPage = Number(section.dataset.carouselPage || 0);
    const page = pageCount ? Math.min(Math.max(requestedPage, 0), pageCount - 1) : 0;
    const first = page * pageSize;
    const visible = new Set(matching.slice(first, first + pageSize));
    section.dataset.carouselPage = String(page);
    cards.forEach((card) => { card.hidden = !visible.has(card); });
    section.querySelector('[data-section-prev]')?.toggleAttribute('disabled', page === 0 || pageCount < 2);
    section.querySelector('[data-section-next]')?.toggleAttribute('disabled', pageCount < 2 || page >= pageCount - 1);
    renderSectionPagination(section, page, pageCount);
  };

  const syncCataloguePages = () => {
    root.querySelectorAll('.ps-section').forEach((section) => syncSectionPage(section));
  };

  const setFilterDrawer = (open, restore = false) => {
    if (!filterDrawer || !filterScrim || !filterTrigger) return;
    filterDrawer.hidden = !open;
    filterScrim.hidden = !open;
    filterTrigger.setAttribute('aria-expanded', String(open));
    root.querySelector('.ps-container')?.toggleAttribute('inert', open);
    if (open) {
      filterPreviousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      filterDrawer.querySelector('[data-psychic-filter-close]')?.focus();
    } else {
      document.body.style.overflow = filterPreviousOverflow;
      if (restore) filterTrigger.focus();
    }
  };

  const statusInputs = [...root.querySelectorAll('[data-psychic-filter-status]')];
  const resetFilters = ({ preserveFocus = false } = {}) => {
    root.querySelector('[data-psychic-filter-sort]').value = 'recommended';
    statusInputs.forEach((input) => { input.checked = input.value === 'all'; });
    root.querySelectorAll('[data-psychic-filter-specialty]').forEach((input) => { input.checked = false; });
    root.querySelector('[data-psychic-filter-experience][value="any"]').checked = true;
    root.querySelector('[data-psychic-filter-rating][value="4"]').checked = true;
    focusInputs.forEach((input) => { input.checked = preserveFocus ? input.value === initialFocus : input.value === ''; });
  };

  const emitFocusIntent = (focus, source) => emit('nebula:psychic-filter-intent-required', {
    backendRequired: true,
    persisted: false,
    staticProjection: true,
    routeIntentUnbound: true,
    source,
    filters: { focus: focus || null },
    focusContract: { version: focusContractVersion, queryParameter: focusQueryParameter, key: focus || null },
  });

  const applyFilters = (options = {}) => {
    const { closeDrawer = true, restoreFocus = true } = options;
    const selectedStatus = statusInputs.filter((input) => input.checked && input.value !== 'all').map((input) => input.value);
    const specialties = [...root.querySelectorAll('[data-psychic-filter-specialty]:checked')].map((input) => input.value);
    const selectedExperience = root.querySelector('[data-psychic-filter-experience]:checked')?.value || 'any';
    const minExperience = selectedExperience === 'any' ? 0 : Number(selectedExperience);
    const minRating = Number(root.querySelector('[data-psychic-filter-rating]:checked')?.value || 0);
    const sort = root.querySelector('[data-psychic-filter-sort]')?.value || 'recommended';
    const selectedFocusInput = focusInputs.find((input) => input.checked);
    const selectedFocus = selectedFocusInput?.value || null;
    const selectedFocusLabel = selectedFocusInput?.dataset.focusLabel || selectedFocus || '';
    root.dataset.psychicsFocus = selectedFocus || '';
    root.dataset.psychicsFocusLabel = selectedFocusLabel;
    root.dataset.psychicsFocusState = selectedFocus ? 'prefiltered' : 'all';
    filterTrigger?.setAttribute('aria-label', selectedFocus ? `Filter psychics; ${selectedFocusLabel} focus selected` : 'Filter psychics');
    const focusUrl = new URL(window.location.href);
    if (selectedFocus) focusUrl.searchParams.set(focusQueryParameter, selectedFocus);
    else focusUrl.searchParams.delete(focusQueryParameter);
    window.history.replaceState(null, '', `${focusUrl.pathname}${focusUrl.search}${focusUrl.hash}`);
    const cards = [...root.querySelectorAll('[data-psychic-card]')];
    cards.forEach((card) => {
      const matchesStatus = !selectedStatus.length || selectedStatus.includes(card.dataset.status);
      const matchesSpecialty = !specialties.length || specialties.every((tag) => (card.dataset.specialties || '').includes(tag));
      card.dataset.filterMatch = String(matchesStatus && matchesSpecialty && Number(card.dataset.experience || 0) >= minExperience && Number(card.dataset.rating || 0) >= minRating);
    });
    root.querySelectorAll('.ps-grid').forEach((grid) => {
      [...grid.querySelectorAll('[data-psychic-card]')].sort((a, b) => {
        if (sort === 'rating-desc') return Number(b.dataset.rating) - Number(a.dataset.rating);
        if (sort === 'experience-desc') return Number(b.dataset.experience) - Number(a.dataset.experience);
        return 0;
      }).forEach((card) => grid.appendChild(card));
    });
    root.querySelectorAll('.ps-section').forEach((section) => { section.dataset.carouselPage = '0'; });
    syncCataloguePages();
    const visible = cards.filter((card) => card.dataset.filterMatch !== 'false').length;
    if (filterStatus) filterStatus.textContent = selectedFocus
      ? `${selectedFocusLabel} focus selected; the host catalogue must apply expert membership.`
      : `${visible} experts shown locally. Saving filters requires the host.`;
    emit('nebula:psychic-filter-intent-required', {
      backendRequired: true,
      persisted: false,
      staticProjection: true,
      routeIntentUnbound: true,
      filters: { focus: selectedFocus, selectedStatus, specialties, minExperience, minRating, sort },
      focusContract: { version: focusContractVersion, queryParameter: focusQueryParameter, key: selectedFocus },
    });
    if (closeDrawer) setFilterDrawer(false, restoreFocus);
  };

  const updateCollectionUrl = (section, { replace = false } = {}) => {
    const url = new URL(window.location.href);
    if (section?.dataset.catalogueExpanded === 'true') {
      url.searchParams.set('collection', section.id);
      url.searchParams.set('page', String(Number(section.dataset.carouselPage || 0) + 1));
      url.hash = section.id;
    } else {
      url.searchParams.delete('collection');
      url.searchParams.delete('page');
      url.hash = section?.id || '';
    }
    window.history[replace ? 'replaceState' : 'pushState'](null, '', `${url.pathname}${url.search}${url.hash}`);
  };

  const setCollectionExpanded = (section, expanded, trigger, options = {}) => {
    const { updateHistory = true, scroll = true, focus = true, page = 0 } = options;
    if (!section) return;
    section.dataset.catalogueExpanded = String(expanded);
    section.dataset.carouselPage = String(Math.max(0, Number(page) || 0));
    const viewAll = section.querySelector('.ps-view-all');
    if (viewAll) {
      viewAll.textContent = expanded ? 'Show less →' : 'View All →';
      viewAll.setAttribute('aria-expanded', String(expanded));
    }
    syncSectionPage(section);
    if (updateHistory) updateCollectionUrl(section);
    if (scroll) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (focus) section.querySelector('[data-psychic-card]:not([hidden]) [data-profile-anchor]')?.focus?.({ preventScroll: true });
    emit('nebula:psychic-collection-expanded', {
      collection: section.id,
      expanded,
      trigger: trigger?.dataset.collectionLink ? 'view-all' : 'history',
      backendRequired: false,
      staticProjection: true,
    });
  };

  filterTrigger?.addEventListener('click', () => setFilterDrawer(filterDrawer?.hidden !== false));
  root.querySelector('[data-psychic-filter-close]')?.addEventListener('click', () => setFilterDrawer(false, true));
  filterScrim?.addEventListener('click', () => setFilterDrawer(false, true));
  root.querySelector('[data-psychic-filter-reset]')?.addEventListener('click', resetFilters);
  root.querySelector('[data-psychic-filter-apply]')?.addEventListener('click', applyFilters);
  statusInputs.forEach((input) => input.addEventListener('change', () => {
    if (input.value === 'all' && input.checked) statusInputs.filter((other) => other !== input).forEach((other) => { other.checked = false; });
    if (input.value !== 'all' && input.checked) statusInputs.find((other) => other.value === 'all').checked = false;
    if (!statusInputs.some((other) => other.checked)) statusInputs.find((other) => other.value === 'all').checked = true;
  }));
  resetFilters({ preserveFocus: true });
  if (initialFocus) {
    if (filterStatus && !filterStatus.textContent.trim()) filterStatus.textContent = `${focusLabel || initialFocus} focus selected; the host catalogue must apply expert membership.`;
    emitFocusIntent(initialFocus, 'query');
  }
  root.querySelectorAll('[data-psychic-card]').forEach((card) => {
    card.dataset.filterMatch = 'true';
    card.dataset.collectionMatch = 'true';
  });
  syncCataloguePages();

  const initialCollection = new URL(window.location.href).searchParams.get('collection');
  const initialSection = initialCollection ? root.querySelector(`#${CSS.escape(initialCollection)}`) : null;
  if (initialSection) {
    const initialPage = Math.max(0, Number(new URL(window.location.href).searchParams.get('page') || '1') - 1);
    setCollectionExpanded(initialSection, true, null, { updateHistory: false, scroll: false, focus: false, page: initialPage });
  }

  unavailableScrim?.addEventListener('click', (event) => {
    if (event.target === unavailableScrim) closeUnavailable();
  });
  unavailable?.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeUnavailable();
      return;
    }
    if (event.key !== 'Tab') return;
    const items = unavailableFocusables();
    if (!items.length) {
      event.preventDefault();
      unavailableHeading?.focus();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === unavailableHeading)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  unavailable?.querySelector('[data-unavailable-action="close"]')?.addEventListener('click', () => closeUnavailable());
  unavailable?.querySelector('[data-unavailable-action="wait"]')?.addEventListener('click', () => {
    emit('nebula:busy-expert-wait-intent-required', { backendRequired: true, persisted: false, staticProjection: true });
    closeUnavailable();
  });
  unavailable?.querySelector('[data-unavailable-action="select-another"]')?.addEventListener('click', () => {
    closeUnavailable({ restoreFocus: false });
    setCollectionExpanded(root.querySelector('#best-online'), true, null);
  });
  unavailable?.querySelector('[data-unavailable-action="question-in-advance"]')?.addEventListener('click', () => {
    if (!openQuestion(unavailableReturnFocus, questionExpertId(unavailableReturnFocus))) return;
    unavailable.hidden = true;
    document.documentElement.classList.remove('c76-modal-open');
    // The Question owner now holds the background lock.
  });

  // The gift has a concrete C76 continuation: choose the trial expert, then
  // provide the question context before a host creates a consultation.
  // The transition intentionally stops before session creation/persistence.
  trialPicker?.addEventListener('nebula:trial-selection-commit-required', (event) => {
    if (event.target !== trialPicker || !openQuestion(root.querySelector('[data-psychic-gift]'), event.detail?.selectedExpertId)) return;
    const pickerFrame = trialPicker.querySelector('.expert-picker-trial__frame');
    pickerFrame.hidden = true;
    trialPicker.hidden = true;
    // Preserve the background lock acquired by the Question owner.
  });

  // The Question owner opens Connecting. This page only retains the selected
  // expert so a terminal availability outcome is shown in its existing owner.
  questionBeforeStart?.addEventListener('nebula:question-before-start-submit-required', (event) => {
    const detail = event.detail || {};
    const target = questionTarget(detail.selectedExpertId);
    if (event.target !== questionBeforeStart || detail.staticProjection !== true || !target || connectionIntentPendingExpertId === target.id) return;
    connectionIntentPendingExpertId = target.id;
  });
  connectingExpert?.addEventListener('nebula:connection-attempt-terminal', (event) => {
    if (event.target !== connectingExpert) return;
    const detail = event.detail || {};
    if (detail.expertId !== connectionIntentPendingExpertId) return;
    connectionIntentPendingExpertId = '';
    if (detail.outcome === 'expert_unavailable_or_offline' || detail.outcome === 'expert_busy') openUnavailable(detail.statusAnchor);
  });
  connectingExpert?.addEventListener('nebula:connection-attempt-cancel-required', (event) => {
    if (event.target === connectingExpert && event.detail?.expertId === connectionIntentPendingExpertId) connectionIntentPendingExpertId = '';
  });

  root.addEventListener('click', (event) => {
    const gift = event.target.closest('[data-psychic-gift]');
    if (gift && root.contains(gift) && trialPicker) {
      event.preventDefault();
      trialPicker.dispatchEvent(new CustomEvent('nebula:expert-picker-trial-open', {
        bubbles: true,
        detail: {
          trigger: gift,
          selectedExpertId: 'margo-lover',
          entitlementVerified: true,
          fixture: true,
        },
      }));
      return;
    }

    const favorite = event.target.closest('[data-psychic-favorite]');
    if (favorite && root.contains(favorite)) {
      const wasPressed = favorite.getAttribute('aria-pressed') === 'true';
      const psychic = nameOf(favorite);
      const profileUrl = favorite.closest('[data-psychic-card]')?.dataset.profileUrl;
      root.querySelectorAll('[data-psychic-favorite]').forEach((candidate) => {
        if (candidate.closest('[data-psychic-card]')?.dataset.profileUrl !== profileUrl) return;
        candidate.setAttribute('aria-pressed', wasPressed ? 'false' : 'true');
        const icon = candidate.querySelector('img[data-favorite-on]');
        if (icon) icon.src = wasPressed ? icon.dataset.favoriteOff : icon.dataset.favoriteOn;
        candidate.setAttribute('aria-label', (wasPressed ? 'Add ' : 'Remove ') + psychic + (wasPressed ? ' to' : ' from') + ' favorites');
      });
      emit('nebula:psychic-favorite-intent-required', { psychic, backendRequired: true, persisted: false, listMutation: false, staticProjection: true });
      return;
    }

    if (event.target.closest('.ps-section-filter')) return;

    const start = event.target.closest('[data-psychic-start]');
    if (start && root.contains(start)) {
      // Keep the anchor as a no-JS route, but in the interactive catalogue the
      // C76 question step is the required continuation before entering chat.
      event.preventDefault();
      emit('nebula:psychic-start-intent-required', {
        psychic: nameOf(start),
        offer: {
          freeMinutes: Number(start.dataset.freeMinutes || 0),
          postTrialRateCreditsPerMinute: Number(start.dataset.rateCreditsPerMinute || 0),
          source: 'static-projection',
          eligibility: 'host-required'
        },
        backendRequired: true,
        sessionCreated: false,
        paymentStarted: false,
        persisted: false,
        staticProjection: true
      });
      openQuestion(start, questionExpertId(start));
      return;
    }

    const cardIntent = event.target.closest('[data-card-intent]');
    if (cardIntent && root.contains(cardIntent)) {
      if (cardIntent.dataset.cardIntent === 'book' && cardIntent.closest('[data-psychic-card]')?.dataset.status === 'busy') {
        event.preventDefault();
        openUnavailable(cardIntent);
        return;
      }
      emit('nebula:psychic-card-intent-required', {
        action: cardIntent.dataset.cardIntent || 'book',
        psychic: nameOf(cardIntent),
        backendRequired: true,
        persisted: false,
        sessionCreated: false,
        paymentStarted: false,
        staticProjection: true
      });
      return;
    }

    const browse = event.target.closest('[data-section-prev],[data-section-next]');
    if (browse && root.contains(browse)) {
      const section = browse.closest('.ps-section');
      if (!section) return;
      if (browse.hasAttribute('disabled')) return;
      const direction = browse.hasAttribute('data-section-next') ? 1 : -1;
      section.dataset.carouselPage = String(Number(section.dataset.carouselPage || 0) + direction);
      syncSectionPage(section);
      if (section.dataset.catalogueExpanded === 'true') updateCollectionUrl(section, { replace: true });
      return;
    }

    const pageButton = event.target.closest('[data-collection-page]');
    if (pageButton && root.contains(pageButton)) {
      const section = pageButton.closest('.ps-section');
      if (!section || pageButton.disabled) return;
      section.dataset.carouselPage = pageButton.dataset.collectionPage || '0';
      syncSectionPage(section);
      updateCollectionUrl(section, { replace: true });
      section.querySelector('[data-psychic-card]:not([hidden]) [data-profile-anchor]')?.focus?.({ preventScroll: true });
      return;
    }

    const viewAll = event.target.closest('.ps-view-all');
    if (viewAll && root.contains(viewAll)) {
      event.preventDefault();
      const section = viewAll.closest('.ps-section');
      setCollectionExpanded(section, section?.dataset.catalogueExpanded !== 'true', viewAll);
      return;
    }

    const profileCard = event.target.closest('[data-psychic-card][data-profile-url]');
    if (profileCard && root.contains(profileCard) && !event.target.closest('a,button')) {
      window.location.assign(profileCard.dataset.profileUrl);
    }
  });

  root.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && filterDrawer && !filterDrawer.hidden) {
      event.preventDefault();
      setFilterDrawer(false, true);
      return;
    }
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
