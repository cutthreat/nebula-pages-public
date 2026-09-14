(() => {
  const header = document.querySelector('.topbar');
  const toggle = document.querySelector('.menu-toggle');
  if (!header || !toggle) return;
  toggle.addEventListener('click', () => {
    const open = header.classList.toggle('menu-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  document.querySelectorAll('.nav a').forEach((link) => link.addEventListener('click', () => {
    header.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
  }));
})();
