(() => {
  const menu = document.querySelector('.ne404-menu');
  const nav = document.querySelector('.ne404-mobile-nav');
  const theme = document.querySelector('.ne404-theme');
  const setMenu = (open) => { if (!menu || !nav) return; menu.setAttribute('aria-expanded', String(open)); nav.hidden = !open; };
  if (menu && nav) menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !menu || menu.getAttribute('aria-expanded') !== 'true') return;
    event.preventDefault();
    setMenu(false);
    menu.focus({ preventScroll: true });
  });
  if (theme) theme.addEventListener('click', () => { const checked = theme.getAttribute('aria-checked') !== 'true'; theme.setAttribute('aria-checked', String(checked)); document.body.classList.toggle('ne404-dark', checked); });
})();
