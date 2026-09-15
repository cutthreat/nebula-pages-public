(() => {
  const root = document.querySelector('[data-nebula-horoscope]');
  if (!root) return;
  const emit = (name, detail) => root.dispatchEvent(new CustomEvent(name, { bubbles: true, detail }));
  const zodiac = [...root.querySelectorAll('[data-horoscope-zodiac]')];
  const chooseZodiac = (item) => {
    zodiac.forEach((candidate) => {
      const selected = candidate === item;
      candidate.setAttribute('aria-pressed', String(selected));
      candidate.tabIndex = selected ? 0 : -1;
      candidate.classList.toggle('is-selected', selected);
    });
    emit('nebula:horoscope-zodiac-intent', { zodiac: item.dataset.horoscopeZodiac || '', backendRequired: true, contentRecomputed: false, staticProjection: true });
  };
  const zodiacColumns = () => window.matchMedia('(max-width: 400px)').matches ? 3 : 6;
  const moveZodiacFocus = (item, key) => {
    const current = zodiac.indexOf(item);
    if (current < 0 || !zodiac.length) return;
    let next = current;
    if (key === 'ArrowRight') next = (current + 1) % zodiac.length;
    if (key === 'ArrowLeft') next = (current - 1 + zodiac.length) % zodiac.length;
    if (key === 'ArrowDown') next = (current + zodiacColumns()) % zodiac.length;
    if (key === 'ArrowUp') next = (current - zodiacColumns() + zodiac.length) % zodiac.length;
    if (key === 'Home') next = 0;
    if (key === 'End') next = zodiac.length - 1;
    zodiac.forEach((candidate, index) => { candidate.tabIndex = index === next ? 0 : -1; });
    zodiac[next].focus();
  };
  zodiac.forEach((item) => {
    item.addEventListener('click', () => chooseZodiac(item));
    item.addEventListener('keydown', (event) => {
      if (['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        moveZodiacFocus(item, event.key);
        return;
      }
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); chooseZodiac(item); }
    });
  });
  const today = root.querySelector('[data-horoscope-period="today"]');
  today?.addEventListener('click', () => emit('nebula:horoscope-period-intent', { period: 'today', contentRecomputed: false, staticProjection: true }));
  today?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); today.click(); }
  });
  root.querySelector('[data-horoscope-action="ask-advisor"]')?.addEventListener('click', () => emit('nebula:horoscope-advisor-required', { backendRequired: true, staticProjection: true, consultationCreated: false, noMutation: true }));
})();
