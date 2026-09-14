function createNebulaBiorhythmModel(options = {}) {
  const DAY = 86400000;
  const periods = { physical: 23, emotional: 28, intellectual: 33 };
  const parse = (value) => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const time = Date.parse(value + 'T00:00:00Z');
    return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value ? time / DAY : null;
  };
  const iso = (day) => new Date(day * DAY).toISOString().slice(0, 10);
  const now = options.now ? new Date(options.now) : new Date();
  const localToday = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
  const today = parse(localToday);
  const minimum = parse('1900-01-01');
  const maximum = parse('2100-12-31');
  const sampleBirth = parse(options.sampleBirthDate || '1992-05-07');
  if (today === null || today < minimum || today > maximum || sampleBirth === null || sampleBirth < minimum || sampleBirth > today) throw new Error('Invalid biorhythm source dates');
  let birth = sampleBirth, selected = today, first = Math.max(birth, Math.min(maximum - 6, today - 3)), sample = true;
  const raw = (day, period) => Math.sin(2 * Math.PI * (day - birth) / period) * 100;
  const values = (day) => Object.fromEntries(Object.entries(periods).map(([key, period]) => [key, Math.round(raw(day, period)) || 0]));
  const snapshot = () => ({
    today: iso(today), selectedDate: iso(selected), birthDate: iso(birth), sample,
    minDate: iso(birth), maxDate: iso(maximum), values: values(selected),
    trends: Object.fromEntries(Object.entries(periods).map(([key, period]) => {
      const delta = raw(selected + 1, period) - raw(selected, period);
      return [key, Math.abs(delta) < 0.01 ? 'Turning' : delta > 0 ? 'Rising' : 'Falling'];
    })),
    days: Array.from({ length: 7 }, (_, index) => { const day = first + index; return { date: iso(day), values: values(day) }; }),
    selectedIndex: selected - first
  });
  const choose = (value, recenter = false) => {
    const next = parse(value);
    if (next === null || next < birth || next > maximum) return false;
    selected = next;
    if (recenter || selected < first || selected > first + 6) first = Math.max(birth, Math.min(maximum - 6, selected - 3));
    return true;
  };
  return {
    snapshot, parse,
    select: choose,
    shift: (days) => { if (!Number.isInteger(days)) return false; const next = selected + days; if (next < birth || next > maximum) return false; const offset = selected - first; selected = next; first = Math.max(birth, Math.min(maximum - 6, selected - offset)); return true; },
    move: (days) => Number.isInteger(days) && choose(iso(Math.max(birth, Math.min(maximum, selected + days)))),
    today: () => choose(iso(today), true),
    setBirth: (value) => { const next = parse(value); if (next === null || next < minimum || next > today) return false; birth = next; sample = false; selected = Math.max(selected, birth); first = Math.max(birth, Math.min(maximum - 6, selected - 3)); return true; },
    resetBirth: () => { birth = sampleBirth; sample = true; selected = Math.max(selected, birth); first = Math.max(birth, Math.min(maximum - 6, selected - 3)); },
    plot: (width, height) => {
      if (!Number.isFinite(width) || width < 120 || !Number.isFinite(height) || height < 100) throw new Error('Invalid chart size');
      const left = 42, right = width - 20, top = 16, bottom = height - 12;
      const x = (index) => left + index / 6 * (right - left), y = (value) => top + (100 - value) / 200 * (bottom - top);
      const paths = Object.fromEntries(Object.entries(periods).map(([key, period]) => [key, Array.from({ length: 73 }, (_, index) => (index ? 'L' : 'M') + x(index / 12).toFixed(2) + ' ' + y(raw(first + index / 12, period)).toFixed(2)).join(' ')]));
      return { left, right, top, bottom, paths, selectedX: x(selected - first), points: Object.fromEntries(Object.entries(periods).map(([key, period]) => [key, { x: x(selected - first), y: y(raw(selected, period)) }])), gridY: [100, 50, 0, -50, -100].map(value => ({ value, y: y(value) })), gridX: Array.from({ length: 7 }, (_, index) => x(index)) };
    }
  };
}
if (typeof module !== 'undefined' && module.exports) module.exports = { createNebulaBiorhythmModel };

(() => {
  if (typeof document === 'undefined') return;
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
  root.querySelectorAll('[data-horoscope-focus]').forEach((link) => link.addEventListener('click', () => { const focus = link.dataset.horoscopeFocus || 'career'; if (focusHeading) focusHeading.textContent = focus.charAt(0).toUpperCase() + focus.slice(1); announce(`${focus} psychic search prepared. The psychics catalogue will open with a host-ranked list.`); emit('nebula:horoscope-focus-intent', { focus, backendRequired: true, route: link.getAttribute('href'), queryParameter: root.dataset.focusQueryParameter || 'focus', contractVersion: root.dataset.focusContractVersion || 'psychic-focus/v1', routeIntentUnbound: true, staticProjection: true, consultationCreated: false }); }));
  root.querySelectorAll('[data-horoscope-start]').forEach((link) => link.addEventListener('click', () => { announce('Free consultation request prepared. The chat host will decide the next step.'); emit('nebula:horoscope-start-consultation-intent', { backendRequired: true, route: link.getAttribute('href'), sessionCreated: false, paymentStarted: false, staticProjection: true }); }));
  root.querySelector('[data-horoscope-find-psychic]')?.addEventListener('click', (event) => { announce('Psychic search prepared. The catalogue will open without creating a consultation.'); emit('nebula:horoscope-find-psychic-intent', { backendRequired: true, route: event.currentTarget.getAttribute('href'), consultationCreated: false, staticProjection: true }); });
  const video = root.querySelector('[data-horoscope-video]');
  const videoTrigger = video?.querySelector('[data-horoscope-video-trigger]');
  const videoLabel = video?.querySelector('[data-horoscope-video-label]');
  const videoPlayer = video?.querySelector('[data-horoscope-video-player]');
  const mountVideo = () => {
    if (!video || !videoTrigger || !videoPlayer || video.dataset.videoState === 'playing') return;
    const videoUrl = (video.dataset.videoUrl || '').trim();
    let parsedUrl = null;
    try { parsedUrl = new URL(videoUrl, window.location.href); } catch { parsedUrl = null; }
    if (!parsedUrl || parsedUrl.protocol !== 'https:' || !parsedUrl.hostname) {
      announce('The video is not available in this preview. The host must provide a valid media URL.');
      emit('nebula:horoscope-video-intent', { version: video.dataset.videoContractVersion || root.dataset.videoContractVersion || 'horoscope-video/v1', action: 'play', backendRequired: true, playerMounted: false, mediaUrlMissing: true, staticProjection: true });
      return;
    }
    const iframe = document.createElement('iframe');
    iframe.className = 'nh-video__iframe';
    iframe.src = parsedUrl.toString();
    iframe.title = 'Neuro horoscope video';
    iframe.loading = 'eager';
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    videoPlayer.replaceChildren(iframe);
    videoPlayer.hidden = false;
    videoPlayer.setAttribute('aria-hidden', 'false');
    video.dataset.videoState = 'playing';
    video.classList.add('is-playing');
    videoTrigger.hidden = true;
    videoLabel?.setAttribute('hidden', '');
    videoTrigger.setAttribute('aria-pressed', 'true');
    announce('Horoscope video player opened. Playback is provided by the configured media host.');
    emit('nebula:horoscope-video-intent', { version: video.dataset.videoContractVersion || root.dataset.videoContractVersion || 'horoscope-video/v1', action: 'play', provider: video.dataset.videoProvider || null, route: parsedUrl.toString(), backendRequired: true, playerMounted: true, playbackRequested: true, hostPlaybackConfirmed: false, staticProjection: true });
    iframe.focus({ preventScroll: true });
  };
  videoTrigger?.addEventListener('click', mountVideo);

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

  const bioRoot = root.querySelector('[data-biorhythm]');
  const bioModel = createNebulaBiorhythmModel({ sampleBirthDate: root.dataset.bioBirthDate });
  const bioDates = [...bioRoot.querySelectorAll('[data-bio-date]')];
  const bioSeries = [...bioRoot.querySelectorAll('[data-bio-series]')];
  const chart = bioRoot.querySelector('.nh-chart');
  const svg = chart.querySelector('svg');
  const dateInput = bioRoot.querySelector('[data-bio-jump-date]');
  const dateError = bioRoot.querySelector('[data-bio-date-error]');
  const birthForm = bioRoot.querySelector('[data-bio-birth-form]');
  const birthInput = bioRoot.querySelector('[data-bio-birth-input]');
  const birthError = bioRoot.querySelector('[data-bio-birth-error]');
  const birthOpener = bioRoot.querySelector('[data-bio-edit-birth]');
  const hiddenSeries = new Set();
  const labels = { physical: 'Physical', emotional: 'Emotional', intellectual: 'Intellectual' };
  const prompts = { physical: 'Where could you make room for a pace that feels right for you?', emotional: 'Which relationship would you like to give thoughtful attention to?', intellectual: 'What question would you like to see from a different perspective?' };
  const display = (date, opts = {}) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', ...opts, timeZone: 'UTC' }).format(new Date(date + 'T00:00:00Z'));
  const signed = (value) => (value > 0 ? '+' : '') + value + '%';
  let currentBioSnapshot = null;
  let chartGeometry = null;
  const inspector = bioRoot.querySelector('[data-bio-inspector]');
  const hoverMarker = chart.querySelector('.nh-bio-hover-marker');
  let pinnedInspection = false;
  let inspectionIndex = null;
  let inspectionY = 0;
  const hideInspection = () => { inspector.hidden = true; hoverMarker.hidden = true; hoverMarker.setAttribute('hidden', ''); pinnedInspection = false; inspectionIndex = null; };
  const showInspection = (index, pinned = false, pointerY = 0) => {
    if (!chartGeometry) return;
    const state = bioModel.snapshot(), day = state.days[index];
    if (!day) return;
    inspectionIndex = index; inspectionY = pointerY;
    if (pinned) pinnedInspection = true;
    inspector.hidden = false;
    inspector.dataset.date = day.date;
    inspector.dataset.pinned = String(pinned);
    inspector.querySelector('[data-bio-inspector-date]').textContent = display(day.date, { weekday: 'short', year: undefined });
    Object.keys(labels).forEach(key => { inspector.querySelector('[data-bio-inspector-value="' + key + '"]').textContent = signed(day.values[key]); });
    inspector.querySelector('[data-bio-inspector-hint]').textContent = pinned ? 'Selected day · tap another day to compare' : 'Preview · click to select this day';
    const x = chartGeometry.gridX[index];
    hoverMarker.removeAttribute('hidden');
    hoverMarker.setAttribute('d', 'M' + x + ' ' + chartGeometry.top + 'V' + chartGeometry.bottom);
    inspector.style.left = Math.max(0, Math.min(chartGeometry.width - inspector.offsetWidth, x - inspector.offsetWidth / 2)) + 'px';
    inspector.style.top = (pointerY < chartGeometry.height / 2 ? Math.max(8, chartGeometry.height - inspector.offsetHeight - 8) : 8) + 'px';
  };
  const renderChart = () => {
    const width = Math.max(120, chart.clientWidth), height = width < 400 ? 210 : 270;
    const geometry = bioModel.plot(width, height);
    chartGeometry = { ...geometry, width, height };
    svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
    svg.style.height = height + 'px';
    chart.querySelector('.nh-grid path').setAttribute('d', [
      ...geometry.gridY.map(row => 'M' + geometry.left + ' ' + row.y + 'H' + geometry.right),
      ...geometry.gridX.map(x => 'M' + x + ' ' + geometry.top + 'V' + geometry.bottom)
    ].join(' '));
    chart.querySelector('[data-bio-axis]').innerHTML = geometry.gridY.map(row => '<text x="34" y="' + (row.y + 4) + '" text-anchor="end">' + row.value + '%</text>').join('');
    Object.keys(labels).forEach(key => { const path = chart.querySelector('.nh-' + key); path.setAttribute('d', geometry.paths[key]); path.classList.toggle('is-hidden', hiddenSeries.has(key)); });
    chart.querySelector('.nh-today-marker').setAttribute('d', 'M' + geometry.selectedX + ' ' + geometry.top + 'V' + geometry.bottom);
    chart.querySelector('[data-bio-points]').innerHTML = Object.entries(geometry.points).filter(([key]) => !hiddenSeries.has(key)).map(([key, point]) => '<circle class="nh-bio-point nh-bio-point--' + key + '" cx="' + point.x + '" cy="' + point.y + '" r="4"/>').join('');
    const state = bioModel.snapshot();
    chart.querySelector('title').textContent = 'Biorhythm, ' + display(state.days[0].date) + ' to ' + display(state.days[6].date);
    chart.setAttribute('aria-label', 'Explore biorhythm. Selected ' + display(state.selectedDate) + '. ' + Object.keys(labels).filter(key => !hiddenSeries.has(key)).map(key => labels[key] + ' ' + signed(state.values[key])).join(', '));
    bioDates.forEach((button, index) => { button.style.left = geometry.gridX[index] + 'px'; button.style.width = Math.max(24, Math.min(44, (geometry.right - geometry.left) / 6 - 2)) + 'px'; });
    if (!inspector.hidden && inspectionIndex !== null) showInspection(inspectionIndex, inspector.dataset.pinned === 'true', inspectionY);
  };
  const renderBio = (announceUpdate = true) => {
    hideInspection();
    const state = bioModel.snapshot();
    const focusKey = Object.keys(state.values).sort((a, b) => Math.abs(state.values[b]) - Math.abs(state.values[a]))[0];
    const focusText = labels[focusKey] + ' curve · ' + (state.values[focusKey] > 0 ? 'above zero' : state.values[focusKey] < 0 ? 'below zero' : 'at zero') + '.';
    currentBioSnapshot = { isoDate: state.selectedDate, label: display(state.selectedDate), values: state.values, focusKey, focusText, sample: state.sample };
    bioRoot.dataset.bioSelectedDate = state.selectedDate;
    bioRoot.dataset.bioSample = String(state.sample);
    bioRoot.querySelector('[data-bio-selected-date]').textContent = display(state.selectedDate, { weekday: 'short' });
    bioRoot.querySelector('[data-bio-today-badge]').hidden = state.selectedDate !== state.today;
    bioRoot.querySelector('[data-bio-basis]').textContent = (state.sample ? 'Sample chart' : 'Your local chart') + ' · birth date ' + display(state.birthDate);
    bioRoot.querySelector('[data-bio-week-label]').textContent = display(state.days[0].date, { year: undefined }) + ' – ' + display(state.days[6].date);
    dateInput.min = state.minDate; dateInput.max = state.maxDate; dateInput.value = state.selectedDate;
    birthInput.max = state.today;
    bioRoot.querySelector('[data-bio-today]').disabled = state.selectedDate === state.today;
    bioRoot.querySelectorAll('[data-bio-shift]').forEach(button => { const candidate = bioModel.parse(state.selectedDate) + Number(button.dataset.bioShift); button.disabled = candidate < bioModel.parse(state.minDate) || candidate > bioModel.parse(state.maxDate); });
    bioDates.forEach((button, index) => {
      const day = state.days[index], active = day.date === state.selectedDate;
      button.dataset.bioIsoDate = day.date; button.dataset.bioDate = day.date;
      button.setAttribute('aria-pressed', String(active)); button.setAttribute('aria-label', display(day.date, { weekday: 'long' }) + (day.date === state.today ? ', today' : ''));
      button.tabIndex = active ? 0 : -1; button.classList.toggle('is-selected', active); button.classList.toggle('is-today', day.date === state.today);
      button.querySelector('[data-bio-weekday]').textContent = display(day.date, { weekday: 'short', month: undefined, day: undefined, year: undefined });
      button.querySelector('[data-bio-day]').textContent = Number(day.date.slice(8));
    });
    bioSeries.forEach(button => {
      const key = button.dataset.bioSeries, visible = !hiddenSeries.has(key);
      button.setAttribute('aria-pressed', String(visible)); button.classList.toggle('is-active', visible);
      button.setAttribute('aria-label', labels[key] + ', ' + signed(state.values[key]) + ', ' + state.trends[key] + ', ' + (visible ? 'shown' : 'hidden') + '. ' + (visible ? 'Hide' : 'Show') + ' curve');
      button.querySelector('[data-bio-value]').textContent = signed(state.values[key]);
      button.querySelector('[data-bio-trend]').textContent = visible ? state.trends[key] : 'Hidden';
    });
    bioRoot.querySelector('[data-bio-focus]').textContent = focusText;
    bioRoot.querySelector('#nh-bio-chart-help').textContent = 'Hover to preview. Click or tap to select a day. Keyboard: ← →, Home / End; Esc to close values.' + (hiddenSeries.size === 2 ? ' Keep one curve visible; show another before hiding this one.' : '');
    bioRoot.querySelector('[data-bio-insight]').textContent = prompts[focusKey];
    bioRoot.querySelector('[data-bio-table-caption]').textContent = 'Cycle values · ' + display(state.days[0].date) + ' – ' + display(state.days[6].date);
    bioRoot.querySelector('[data-bio-table-body]').innerHTML = state.days.map(day => '<tr' + (day.date === state.selectedDate ? ' class="is-selected"' : '') + '><th scope="row">' + display(day.date, { year: undefined }) + '</th>' + Object.keys(labels).map(key => '<td>' + signed(day.values[key]) + '</td>').join('') + '</tr>').join('');
    renderChart();
    if (announceUpdate) {
      announce('Biorhythm for ' + currentBioSnapshot.label + ': ' + Object.keys(labels).map(key => labels[key] + ' ' + signed(state.values[key])).join(', ') + '. Reflection only.');
      emit('nebula:horoscope-biorhythm-intent', { selectedDate: state.selectedDate, cycles: { ...state.values }, algorithm: 'sinusoidal-23-28-33/v1', sampleData: state.sample, profileBirthDateRequired: true, backendRequired: true, persisted: false, medicalAdvice: false });
    }
  };
  const clearDateError = () => { dateError.textContent = ''; dateInput.removeAttribute('aria-invalid'); };
  bioDates.forEach(button => {
    button.addEventListener('click', () => { bioModel.select(button.dataset.bioIsoDate); clearDateError(); renderBio(); });
    button.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault(); const state = bioModel.snapshot();
      if (event.key === 'Home' || event.key === 'End') bioModel.select(state.days[event.key === 'Home' ? 0 : 6].date);
      else bioModel.move(event.key === 'ArrowLeft' ? -1 : 1);
      clearDateError(); renderBio(); bioDates[bioModel.snapshot().selectedIndex].focus();
    });
  });
  bioRoot.querySelectorAll('[data-bio-shift]').forEach(button => button.addEventListener('click', () => { if (bioModel.shift(Number(button.dataset.bioShift))) { clearDateError(); renderBio(); } }));
  bioRoot.querySelector('[data-bio-today]').addEventListener('click', () => { bioModel.today(); clearDateError(); renderBio(); dateInput.focus(); });
  dateInput.addEventListener('change', () => {
    if (!bioModel.select(dateInput.value, true)) { dateError.textContent = 'Choose a valid date on or after the birth date, up to December 31, 2100.'; dateInput.setAttribute('aria-invalid', 'true'); return; }
    clearDateError(); renderBio();
  });
  bioSeries.forEach(button => button.addEventListener('click', () => {
    const key = button.dataset.bioSeries;
    if (!hiddenSeries.has(key) && hiddenSeries.size === 2) { announce('Keep at least one curve visible. Show another curve before hiding this one.'); return; }
    if (hiddenSeries.has(key)) hiddenSeries.delete(key); else hiddenSeries.add(key);
    renderBio(false); announce(labels[key] + (hiddenSeries.has(key) ? ' curve hidden.' : ' curve shown.'));
  }));
  chart.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); hideInspection(); chart.focus({ preventScroll: true }); return; }
    if (event.target.closest('[data-bio-inspector]')) return;
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault(); const state = bioModel.snapshot();
    if (event.key === 'Home' || event.key === 'End') bioModel.select(state.days[event.key === 'Home' ? 0 : 6].date);
    else bioModel.move(event.key === 'ArrowLeft' ? -1 : 1);
    clearDateError(); renderBio();
    showInspection(bioModel.snapshot().selectedIndex, true, chartGeometry.height);
  });
  let pointer = null;
  const inspectPointer = event => {
    if (!chartGeometry) return;
    const rect = svg.getBoundingClientRect();
    const x = (event.clientX - rect.left) * chartGeometry.width / rect.width;
    const index = Math.max(0, Math.min(6, Math.round((x - chartGeometry.left) / (chartGeometry.right - chartGeometry.left) * 6)));
    const state = bioModel.snapshot();
    if (state.selectedIndex !== index) { bioModel.select(state.days[index].date); clearDateError(); renderBio(false); }
  };
  chart.addEventListener('pointerdown', event => { if (event.target.closest('[data-bio-inspector-close]') || !event.isPrimary || event.button !== 0) return; pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, dragging: false }; });
  chart.addEventListener('pointermove', event => {
    if (!pointer && event.target.closest('[data-bio-inspector]')) return;
    if (!pointer && event.pointerType === 'mouse' && event.buttons === 0 && chartGeometry) {
      const rect = svg.getBoundingClientRect(), x = event.clientX - rect.left;
      if (x < chartGeometry.left || x > chartGeometry.right) return;
      const index = Math.max(0, Math.min(6, Math.round((x - chartGeometry.left) / (chartGeometry.right - chartGeometry.left) * 6)));
      showInspection(index, false, event.clientY - rect.top); return;
    }
    if (!pointer || pointer.id !== event.pointerId) return;
    const dx = Math.abs(event.clientX - pointer.x), dy = Math.abs(event.clientY - pointer.y);
    if (!pointer.dragging && dy > 8 && dy > dx) { pointer = null; return; }
    if (!pointer.dragging && dx > 8 && dx > dy) { pointer.dragging = true; chart.setPointerCapture(event.pointerId); }
    if (pointer.dragging) { inspectPointer(event); showInspection(bioModel.snapshot().selectedIndex, true, event.clientY - svg.getBoundingClientRect().top); }
  });
  chart.addEventListener('pointerup', event => { if (!pointer || pointer.id !== event.pointerId) return; const moved = Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y); if (pointer.dragging || moved < 8) { inspectPointer(event); renderBio(); showInspection(bioModel.snapshot().selectedIndex, true, event.clientY - svg.getBoundingClientRect().top); chart.focus({ preventScroll: true }); } pointer = null; });
  chart.addEventListener('pointerleave', () => { if (pointer) return; if (pinnedInspection) showInspection(bioModel.snapshot().selectedIndex, true, inspectionY); else hideInspection(); });
  inspector.querySelector('[data-bio-inspector-close]').addEventListener('click', () => { hideInspection(); chart.focus({ preventScroll: true }); });
  document.addEventListener('pointerdown', event => { if (!chart.contains(event.target)) hideInspection(); });
  chart.addEventListener('pointercancel', () => { pointer = null; });
  chart.addEventListener('lostpointercapture', () => { pointer = null; });
  const closeBirth = () => { birthForm.hidden = true; birthOpener.setAttribute('aria-expanded', 'false'); birthOpener.focus(); };
  birthOpener.addEventListener('click', () => {
    if (!birthForm.hidden) { closeBirth(); return; }
    birthInput.value = bioModel.snapshot().birthDate; birthError.textContent = ''; birthInput.removeAttribute('aria-invalid');
    birthForm.hidden = false; birthOpener.setAttribute('aria-expanded', 'true'); birthInput.focus();
  });
  birthForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!bioModel.setBirth(birthInput.value)) { birthError.textContent = 'Enter a valid birth date from January 1, 1900 through today.'; birthInput.setAttribute('aria-invalid', 'true'); birthInput.focus(); return; }
    birthInput.removeAttribute('aria-invalid'); birthError.textContent = ''; clearDateError(); renderBio(); closeBirth();
  });
  bioRoot.querySelector('[data-bio-cancel-birth]').addEventListener('click', closeBirth);
  bioRoot.querySelector('[data-bio-reset-birth]').addEventListener('click', () => { bioModel.resetBirth(); clearDateError(); renderBio(); closeBirth(); });
  birthForm.addEventListener('keydown', event => { if (event.key === 'Escape') { event.preventDefault(); closeBirth(); } });
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(renderChart).observe(chart);
  else window.addEventListener('resize', renderChart);
  renderBio(false);
})();
