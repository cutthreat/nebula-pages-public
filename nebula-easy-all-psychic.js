(() => {
  'use strict';

  document.documentElement.dataset.nebulaAllPsychicOwner = 'c76-20260727';

  const root = document.querySelector('[data-nebula-all-psychics]');
  if (!root) return;

  const advisorChatUrl = root.dataset.advisorChatUrl;
  if (!advisorChatUrl) return;

  root.querySelectorAll('.apn-love-card').forEach((card) => {
    const link = card.querySelector('.apn-love-card__cta .c-btn');
    const name = card.querySelector('.apn-love-card__name')?.textContent?.trim();
    if (!link || !name) return;

    const advisor = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const url = new URL(advisorChatUrl, document.baseURI);
    url.searchParams.set('advisor', advisor);
    link.href = url.href;
    link.dataset.advisorChatIntent = advisor;
  });
})();
