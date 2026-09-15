(() => {
  const root = document.querySelector('[data-nebula-horoscope]');
  if (!root || root.dataset.horoscopeBound === 'true') return;
  root.dataset.horoscopeBound = 'true';
  const emit = (name, detail) => root.dispatchEvent(new CustomEvent(name, { bubbles: true, detail }));
  const status = root.querySelector('[data-horoscope-status]');
  const announce = (message) => { if (status) status.textContent = message; };
  const title = root.querySelector('[data-horoscope-title]');
  const range = root.querySelector('[data-horoscope-range]');
  const date = root.querySelector('[data-horoscope-date]');
  const copy = root.querySelector('[data-horoscope-copy]');
  const readingSign = root.querySelector('[data-horoscope-reading-sign]');
  const art = root.querySelector('[data-horoscope-art-image]');
  let fullArtMap = {};
  try { fullArtMap = JSON.parse(root.dataset.horoscopeArtMap || '{}'); } catch { fullArtMap = {}; }
  const zodiac = [...root.querySelectorAll('[data-horoscope-zodiac]')];
  const periods = [...root.querySelectorAll('[data-horoscope-period]')];
  const zodiacData = {
    Aries: { range: 'Mar 21 - Apr 19', today: 'Today, Aries, direct energy helps you turn intention into action. Start with one clear step, then give your decision enough time to settle before you add another.', theme: 'Courage is strongest when it is paired with focus.' },
    Taurus: { range: 'Apr 20 - May 20', today: 'Today, Taurus, the fiery energy of the Aries moon ignites your passion and determination. Use this momentum to take charge while keeping your choices grounded.', theme: 'Steady progress gives a practical choice more meaning.' },
    Gemini: { range: 'May 21 - Jun 20', today: 'Today, Gemini, curiosity opens a useful conversation. Ask one thoughtful question and listen for the detail that changes your perspective.', theme: 'A clear exchange can reveal the next opportunity.' },
    Cancer: { range: 'Jun 21 - Jul 22', today: 'Today, Cancer, protect your energy while making room for honest connection. A calm boundary can make your next step feel lighter.', theme: 'Gentle honesty helps you feel safe enough to move forward.' },
    Leo: { range: 'Jul 23 - Aug 22', today: 'Today, Leo, your confidence is most effective when it leaves room for collaboration. Share your idea, then invite another point of view.', theme: 'Warm leadership turns attention into a shared result.' },
    Virgo: { range: 'Aug 23 - Sep 22', today: 'Today, Virgo, practical details support a bigger intention. Organize one priority and let the rest wait until you have more clarity.', theme: 'A simple routine creates space for a better decision.' },
    Libra: { range: 'Sep 23 - Oct 22', today: 'Today, Libra, balance is a decision rather than a pause. Name what matters most and make space for a fair exchange.', theme: 'A thoughtful choice restores ease to your relationships.' },
    Scorpio: { range: 'Oct 23 - Nov 21', today: 'Today, Scorpio, trust your instincts but test assumptions with a direct question. Quiet focus helps you notice what is ready to change.', theme: 'Depth becomes useful when it leads to a clear next step.' },
    Sagittarius: { range: 'Nov 22 - Dec 21', today: 'Today, Sagittarius, a wider view brings optimism back into a practical plan. Choose a direction and leave room for discovery.', theme: 'Curiosity keeps a long-term goal moving without pressure.' },
    Capricorn: { range: 'Dec 22 - Jan 19', today: 'Today, Capricorn, steady effort creates more progress than a dramatic reset. Protect your time and finish the next achievable task.', theme: 'Consistency makes a demanding goal feel manageable.' },
    Aquarius: { range: 'Jan 20 - Feb 18', today: 'Today, Aquarius, a new idea becomes useful when you give it a human context. Share it with someone who can help you shape it.', theme: 'A fresh perspective can become a practical connection.' },
    Pisces: { range: 'Feb 19 - Mar 20', today: 'Today, Pisces, intuition and compassion can work together. Keep one concrete promise to yourself while you follow the feeling.', theme: 'Sensitivity is most helpful when it is anchored in a plan.' }
  };
  const periodData = {
    today: { label: 'Today', date: 'April 17, 2026', copy: (sign) => sign.today },
    tomorrow: { label: 'Tomorrow', date: 'April 18, 2026', copy: (sign) => `Tomorrow, ${sign.theme} Let a conversation develop at its own pace, and commit only after the details feel clear.` },
    week: { label: 'This week', date: 'April 14 - 20, 2026', copy: (sign) => `This week, ${sign.theme} Protect your focus, ask for clarity, and keep one realistic priority in view.` },
    month: { label: 'This month', date: 'April 2026', copy: (sign) => `This month, ${sign.theme} Small, repeatable choices will carry more weight than a sudden change of direction.` },
    year: { label: 'This year', date: '2026', copy: (sign) => `This year, ${sign.theme} Return to the values that guide you whenever a decision begins to feel complicated.` }
  };
  let selectedZodiac = 'Taurus';
  let selectedPeriod = 'today';
  const renderContent = () => {
    const data = zodiacData[selectedZodiac] || zodiacData.Taurus;
    const currentPeriod = periodData[selectedPeriod] || periodData.today;
    if (title) title.textContent = `${selectedZodiac} ${selectedPeriod === 'today' ? 'daily' : currentPeriod.label.toLowerCase()} horoscope`;
    if (range) range.textContent = data.range;
    if (date) date.textContent = currentPeriod.date;
    if (copy) copy.textContent = currentPeriod.copy(data);
    if (readingSign) readingSign.textContent = `TODAY’S ${selectedZodiac.toUpperCase()} ENERGY?`;
    const fullArt = fullArtMap[selectedZodiac] || fullArtMap.Taurus;
    if (art && fullArt?.src) art.src = fullArt.src;
    // Eleven user-approved visual candidates deliberately remain traceable as
    // pre-Figma full-art drafts; they are never represented as Figma exports.
    root.dataset.horoscopeArtwork = fullArt?.provenance || 'full-art-source-missing';
    root.dataset.horoscopeZodiac = selectedZodiac.toLowerCase();
    root.dataset.horoscopePeriod = selectedPeriod;
  };
  const chooseZodiac = (item) => {
    selectedZodiac = item.dataset.horoscopeZodiac || 'Taurus';
    zodiac.forEach((candidate) => { const selected = candidate === item; candidate.setAttribute('aria-pressed', String(selected)); candidate.tabIndex = selected ? 0 : -1; candidate.classList.toggle('is-selected', selected); });
    renderContent();
    announce(`${selectedZodiac} selected. This preview stays local until the horoscope host confirms the reading.`);
    emit('nebula:horoscope-zodiac-intent', { zodiac: selectedZodiac, backendRequired: true, contentRecomputed: false, staticProjection: true });
  };
  const choosePeriod = (button) => {
    selectedPeriod = button.dataset.horoscopePeriod || 'today';
    periods.forEach((candidate) => { const selected = candidate === button; candidate.setAttribute('aria-selected', String(selected)); candidate.classList.toggle('is-selected', selected); });
    renderContent();
    const label = periodData[selectedPeriod]?.label || 'Today';
    announce(`${label} selected for ${selectedZodiac}. This preview stays local until the horoscope host supplies the period reading.`);
    emit('nebula:horoscope-period-intent', { period: selectedPeriod, zodiac: selectedZodiac, contentRecomputed: false, staticProjection: true });
  };
  const moveFocus = (items, item, key, columns) => {
    const current = items.indexOf(item); if (current < 0 || !items.length) return;
    let next = current;
    if (key === 'ArrowRight') next = (current + 1) % items.length;
    if (key === 'ArrowLeft') next = (current - 1 + items.length) % items.length;
    if (key === 'ArrowDown') next = (current + columns) % items.length;
    if (key === 'ArrowUp') next = (current - columns + items.length) % items.length;
    if (key === 'Home') next = 0; if (key === 'End') next = items.length - 1;
    items.forEach((candidate, index) => { candidate.tabIndex = index === next ? 0 : -1; }); items[next].focus();
  };
  const zodiacColumns = () => window.matchMedia('(max-width: 400px)').matches ? 3 : 6;
  zodiac.forEach((item) => {
    item.addEventListener('click', () => chooseZodiac(item));
    item.addEventListener('keydown', (event) => { if (['ArrowRight','ArrowLeft','ArrowDown','ArrowUp','Home','End'].includes(event.key)) { event.preventDefault(); moveFocus(zodiac, item, event.key, zodiacColumns()); } if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); chooseZodiac(item); } });
  });
  periods.forEach((item, index) => {
    item.tabIndex = index === 0 ? 0 : -1;
    item.addEventListener('click', () => choosePeriod(item));
    item.addEventListener('keydown', (event) => { if (['ArrowRight','ArrowLeft','Home','End'].includes(event.key)) { event.preventDefault(); moveFocus(periods, item, event.key, 1); } if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); choosePeriod(item); } });
  });
  const focusHeading = root.querySelector('[data-focus-heading]');
  root.querySelectorAll('[data-horoscope-focus]').forEach((link) => link.addEventListener('click', () => { const focus = link.dataset.horoscopeFocus || 'career'; if (focusHeading) focusHeading.textContent = focus.charAt(0).toUpperCase() + focus.slice(1); announce(`${focus} psychic search prepared. The psychics catalogue will open with a host-ranked list.`); emit('nebula:horoscope-focus-intent', { focus, backendRequired: true, route: link.getAttribute('href'), staticProjection: true, consultationCreated: false }); }));
  root.querySelectorAll('[data-horoscope-start]').forEach((link) => link.addEventListener('click', () => { announce('Free consultation request prepared. The chat host will decide the next step.'); emit('nebula:horoscope-start-consultation-intent', { backendRequired: true, route: link.getAttribute('href'), sessionCreated: false, paymentStarted: false, staticProjection: true }); }));
  root.querySelector('[data-horoscope-find-psychic]')?.addEventListener('click', (event) => { announce('Psychic search prepared. The catalogue will open without creating a consultation.'); emit('nebula:horoscope-find-psychic-intent', { backendRequired: true, route: event.currentTarget.getAttribute('href'), consultationCreated: false, staticProjection: true }); });

  const dialog = root.querySelector('[data-horoscope-advisor-dialog]');
  const dialogPanel = dialog?.querySelector('[role="dialog"]');
  const advisorInput = dialog?.querySelector('[data-horoscope-advisor-input]');
  const feedback = dialog?.querySelector('[data-horoscope-advisor-feedback]');
  const advisorContext = dialog?.querySelector('[data-horoscope-advisor-context]');
  const advisorContinue = dialog?.querySelector('[data-horoscope-advisor-continue]');
  let dialogOpener = null;
  const advisorBackground = dialog ? [...root.children].filter((node) => node !== dialog) : [];
  const advisorBackgroundState = new Map();
  const setAdvisorBackground = (inert) => {
    advisorBackground.forEach((node) => {
      if (inert) {
        advisorBackgroundState.set(node, { inert: node.inert, ariaHidden: node.getAttribute('aria-hidden') });
        node.inert = true;
        node.setAttribute('aria-hidden', 'true');
      } else {
        const previous = advisorBackgroundState.get(node);
        node.inert = Boolean(previous?.inert);
        if (previous?.ariaHidden === null || previous?.ariaHidden === undefined) node.removeAttribute('aria-hidden');
        else node.setAttribute('aria-hidden', previous.ariaHidden);
      }
    });
    if (!inert) advisorBackgroundState.clear();
  };
  const closeAdvisor = () => {
    if (!dialog || dialog.hidden) return;
    dialog.hidden = true;
    setAdvisorBackground(false);
    dialogOpener?.focus();
  };
  const openAdvisor = (opener) => {
    if (!dialog) return;
    dialogOpener = opener;
    setAdvisorBackground(true);
    dialog.hidden = false;
    feedback.textContent = '';
    if (currentBioSnapshot && advisorContext) advisorContext.textContent = `${currentBioSnapshot.label}: Physical ${currentBioSnapshot.values.physical > 0 ? '+' : ''}${currentBioSnapshot.values.physical}%, Emotional ${currentBioSnapshot.values.emotional > 0 ? '+' : ''}${currentBioSnapshot.values.emotional}%, Intellectual ${currentBioSnapshot.values.intellectual > 0 ? '+' : ''}${currentBioSnapshot.values.intellectual}%. ${currentBioSnapshot.focusText} This is a reflection-only chart, not medical advice.`;
    advisorInput?.focus();
  };
  root.querySelectorAll('[data-horoscope-action="ask-advisor"]').forEach((button) => button.addEventListener('click', () => openAdvisor(button)));
  dialog?.querySelectorAll('[data-horoscope-advisor-close]').forEach((node) => node.addEventListener('click', closeAdvisor));
  dialog?.querySelector('[data-horoscope-advisor-submit]')?.addEventListener('click', () => { const question = advisorInput?.value.trim() || ''; if (!question) { feedback.textContent = 'Add a question before preparing the request.'; advisorInput?.focus(); return; } const snapshot = currentBioSnapshot || { isoDate: null, values: null }; feedback.textContent = 'Chart context is ready. Choose a psychic to continue; no consultation or data was created in this preview.'; announce('Biorhythm context prepared locally. Choose a psychic to continue.'); emit('nebula:biorhythm-reading-intent', { version: root.dataset.bioContractVersion || 'biorhythm-reading-intent/v1', selectedDate: snapshot.isoDate, cycles: snapshot.values, question, profileBirthDateRequired: true, backendRequired: true, persisted: false, consultationCreated: false, medicalAdvice: false }); });
  advisorContinue?.addEventListener('click', (event) => emit('nebula:biorhythm-psychic-selection-intent', { selectedDate: currentBioSnapshot?.isoDate || null, route: event.currentTarget.getAttribute('href'), backendRequired: true, consultationCreated: false, persisted: false }));
  dialog?.addEventListener('keydown', (event) => { if (event.key === 'Escape') { event.preventDefault(); closeAdvisor(); return; } if (event.key !== 'Tab' || !dialogPanel) return; const focusable = [...dialogPanel.querySelectorAll('button,textarea,a[href]')].filter((node) => !node.disabled); const first = focusable[0]; const last = focusable[focusable.length - 1]; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } });

  const bioDates = [...root.querySelectorAll('[data-bio-date]')];
  const marker = root.querySelector('.nh-today-marker');
  const insight = root.querySelector('[data-bio-insight]');
  const insightTitle = root.querySelector('[data-bio-insight-title]');
  const selectedBioDate = root.querySelector('[data-bio-selected-date]');
  const bioValues = root.querySelector('[data-bio-values]');
  const bioFocus = root.querySelector('[data-bio-focus]');
  const bioPaths = { physical: root.querySelector('.nh-physical'), emotional: root.querySelector('.nh-emotional'), intellectual: root.querySelector('.nh-intellectual') };
  const bioCycles = { physical: 23, emotional: 28, intellectual: 33 };
  const bioBaseDate = new Date('2026-04-17T00:00:00Z');
  const bioBirthDate = new Date(`${root.dataset.bioBirthDate || '1992-05-07'}T00:00:00Z`);
  const isoDate = (date) => date.toISOString().slice(0, 10);
  const displayDate = (date) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(date);
  const shortDate = (date) => `${String(date.getUTCMonth() + 1).padStart(2, '0')}/${String(date.getUTCDate()).padStart(2, '0')}`;
  const dateOffset = (date) => Math.round((date.getTime() - bioBirthDate.getTime()) / 86400000);
  const cycleValue = (date, period) => Math.round(Math.sin((Math.PI * 2 * dateOffset(date)) / period) * 100);
  const cycleTone = (value) => value >= 45 ? 'accented' : value <= -45 ? 'quiet' : 'balanced';
  const bioLabels = { physical: 'Physical', emotional: 'Emotional', intellectual: 'Intellectual' };
  const bioPrompts = {
    physical: 'Where would a steadier pace help you feel more present today?',
    emotional: 'Which conversation or relationship would you like to approach with more intention?',
    intellectual: 'What one idea deserves your clearest attention today?'
  };
  const pathFor = (dates, period) => dates.map((date, index) => `${index ? 'L' : 'M'}${55 + index * 87} ${140 - (cycleValue(date, period) * 1.1)}`).join(' ');
  let currentBioSnapshot = null;
  const updateBio = (button, announceUpdate = true) => {
    const selected = new Date(`${button.dataset.bioIsoDate || '2026-04-17'}T00:00:00Z`);
    const week = bioDates.map((candidate) => new Date(`${candidate.dataset.bioIsoDate || '2026-04-17'}T00:00:00Z`));
    const values = Object.fromEntries(Object.entries(bioCycles).map(([key, period]) => [key, cycleValue(selected, period)]));
    const focusKey = Object.keys(values).sort((left, right) => Math.abs(values[right]) - Math.abs(values[left]))[0];
    const focusText = `Reflection focus: ${bioLabels[focusKey]} curve is ${cycleTone(values[focusKey])}.`;
    currentBioSnapshot = { isoDate: isoDate(selected), label: displayDate(selected), values, focusKey, focusText };
    Object.entries(bioPaths).forEach(([key, path]) => path?.setAttribute('d', pathFor(week, bioCycles[key])));
    const index = week.findIndex((date) => isoDate(date) === currentBioSnapshot.isoDate);
    if (marker) marker.setAttribute('d', `M${55 + Math.max(index, 0) * 87} 30V250`);
    bioDates.forEach((candidate) => { const active = candidate === button; candidate.setAttribute('aria-selected', String(active)); candidate.tabIndex = active ? 0 : -1; candidate.classList.toggle('is-selected', active); });
    if (insightTitle) insightTitle.textContent = currentBioSnapshot.isoDate === '2026-04-17' ? 'Today insight' : `${shortDate(selected)} insight`;
    if (selectedBioDate) selectedBioDate.textContent = currentBioSnapshot.label;
    if (bioValues) bioValues.textContent = `Physical ${values.physical > 0 ? '+' : ''}${values.physical}% · Emotional ${values.emotional > 0 ? '+' : ''}${values.emotional}% · Intellectual ${values.intellectual > 0 ? '+' : ''}${values.intellectual}%`;
    if (bioFocus) bioFocus.textContent = focusText;
    if (insight) insight.textContent = `${bioPrompts[focusKey]} Use this chart as a reflective prompt for a conversation with an advisor, not as health guidance.`;
    if (announceUpdate) announce(`Biorhythm for ${currentBioSnapshot.label} updated: physical ${values.physical} percent, emotional ${values.emotional} percent, intellectual ${values.intellectual} percent.`);
    emit('nebula:horoscope-biorhythm-intent', { selectedDate: currentBioSnapshot.isoDate, cycles: values, algorithm: 'sinusoidal-23-28-33/v1', profileBirthDateRequired: true, backendRequired: true, persisted: false, medicalAdvice: false });
  };
  bioDates.forEach((button, index) => {
    const date = new Date(bioBaseDate.getTime() + ((index - 3) * 86400000));
    button.dataset.bioIsoDate = isoDate(date);
    button.dataset.bioDate = shortDate(date);
    button.textContent = shortDate(date);
    button.tabIndex = button.getAttribute('aria-selected') === 'true' ? 0 : -1;
    button.addEventListener('click', () => updateBio(button));
    button.addEventListener('keydown', (event) => { if (['ArrowRight','ArrowLeft','Home','End'].includes(event.key)) { event.preventDefault(); moveFocus(bioDates, button, event.key, 1); } if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); updateBio(button); } });
  });
  updateBio(bioDates.find((button) => button.getAttribute('aria-selected') === 'true') || bioDates[3], false);
  root.querySelectorAll('[data-bio-series]').forEach((toggle) => toggle.addEventListener('click', () => { const series = toggle.dataset.bioSeries; const active = toggle.getAttribute('aria-pressed') === 'true'; toggle.setAttribute('aria-pressed', String(!active)); toggle.classList.toggle('is-active', !active); root.querySelector(`.nh-${series}`)?.classList.toggle('is-hidden', active); announce(`${series.charAt(0).toUpperCase() + series.slice(1)} biorhythm ${active ? 'hidden' : 'shown'}.`); }));
})();
