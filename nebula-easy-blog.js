(() => {
  'use strict';

  const menuToggle = document.querySelector('[aria-controls="navbarOffcanvasBlog"]');
  const menu = document.querySelector('#navbarOffcanvasBlog');

  if (menuToggle && menu) {
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || !menu.classList.contains('show')) return;
      event.preventDefault();
      menuToggle.click();
      menuToggle.focus({ preventScroll: true });
    });
  }

  const root = document.querySelector('.blog-advisor');
  const track = root?.querySelector('.blog-advisor__experts');
  const cards = track ? Array.from(track.querySelectorAll('.blog-advisor__expert')) : [];
  const previous = root?.querySelector('.blog-advisor__control--previous');
  const next = root?.querySelector('.blog-advisor__control--next');

  if (!root || !track || cards.length < 2 || !previous || !next) return;

  const narrow = window.matchMedia('(max-width: 575.98px)');
  let index = 0;

  const sync = () => {
    previous.disabled = index === 0;
    next.disabled = index === cards.length - 1;
    track.setAttribute('aria-label', `Advisors, item ${index + 1} of ${cards.length}`);
  };

  const show = (nextIndex, focusControl = false) => {
    index = Math.max(0, Math.min(cards.length - 1, nextIndex));
    const cardLeft = cards[index].offsetLeft - track.offsetLeft;
    track.scrollTo({
      left: Math.max(0, Math.min(cardLeft, track.scrollWidth - track.clientWidth)),
      behavior: 'instant'
    });
    sync();
    if (focusControl) (index === 0 ? next : previous).focus();
  };

  previous.addEventListener('click', () => show(index - 1, true));
  next.addEventListener('click', () => show(index + 1, true));
  track.addEventListener('keydown', (event) => {
    if (!narrow.matches || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) return;
    event.preventDefault();
    show(index + (event.key === 'ArrowRight' ? 1 : -1));
  });
  track.addEventListener('scrollend', () => {
    if (!narrow.matches) return;
    index = cards.reduce((closest, card, cardIndex) =>
      Math.abs(card.offsetLeft - track.scrollLeft) < Math.abs(cards[closest].offsetLeft - track.scrollLeft)
        ? cardIndex
        : closest, 0);
    sync();
  });
  narrow.addEventListener('change', (event) => {
    index = 0;
    track.scrollTo({ left: 0, behavior: 'instant' });
    if (event.matches) sync();
  });

  sync();
})();
