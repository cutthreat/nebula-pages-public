(() => {
  'use strict';

  const init = () => {
    const root = document.querySelector('[data-nebula-all-psychics]');
    if (!root) return;

    const view = root.ownerDocument.defaultView;
    const setMenu = (open) => {
      const menu = root.querySelector('#navbarOffcanvasAllPsychic');
      if (!menu) return;
      menu.classList.toggle('show', open);
      root.querySelectorAll('[data-all-psychics-menu-toggle]').forEach((button) => {
        button.setAttribute('aria-expanded', String(open));
      });
    };

    root.querySelectorAll('[data-all-psychics-menu-toggle]').forEach((button) => {
      button.addEventListener('click', () => {
        const menu = root.querySelector('#navbarOffcanvasAllPsychic');
        setMenu(!menu?.classList.contains('show'));
      });
    });
    root.querySelectorAll('[data-all-psychics-menu-close]').forEach((button) => {
      button.addEventListener('click', () => setMenu(false));
    });

    const syncAccordionState = (item) => {
      item.classList.toggle('apn-answer-item--open', item.open && item.classList.contains('apn-answer-item'));
      item.querySelector('summary')?.setAttribute('aria-expanded', String(item.open));
    };
    root.querySelectorAll('[data-accordion-root]').forEach((accordion) => {
      accordion.querySelectorAll('details').forEach((item) => {
        syncAccordionState(item);
        item.addEventListener('toggle', () => {
          syncAccordionState(item);
          if (!item.open) return;
          accordion.querySelectorAll('details').forEach((other) => {
            if (other !== item) {
              other.open = false;
              syncAccordionState(other);
            }
          });
        });
      });
    });

    const syncTitles = () => {
      const compact = view?.innerWidth <= 576;
      root.querySelectorAll('[data-mobile-title]').forEach((node) => {
        node.textContent = compact ? node.dataset.mobileTitle : node.dataset.desktopTitle;
      });

      const mobileAnswerCards = {
        3: {
          title: 'Convenience of Psychic Phone Reading and Online Psychic Readings',
          preview: 'Nowadays, psychic services have also taken a leap from traditional readings to more convenient phone readings, online consultations, and even a mobile app...'
        },
        4: {
          title: 'How Do Psychic Readings by Phone Work?',
          preview: 'During a psychic reading, the practitioner may use a variety of tools. They need it to access the spiritual energy and provide guidance. Some popular tools include:'
        },
        5: {
          title: 'Affordability of Psychic Phone Readings',
          preview: 'The flexibility in the price range of our psychic phone readings accommodates every budget. Everyone can call for our spiritual guidance. Nebula has made it its mission to ensure that quality...'
        }
      };
      const answerItems = Array.from(root.querySelectorAll('.apn-answer-stack > details'));
      if (answerItems.length >= 6) {
        answerItems[1].hidden = true;
        answerItems.forEach((item, index) => {
          const title = item.querySelector('.apn-answer-title');
          const preview = item.querySelector('.apn-answer-preview');
          if (!title) return;
          item.dataset.desktopTitle ||= title.textContent.trim();
          if (preview) item.dataset.desktopPreview ||= preview.textContent.trim();
          const mobile = mobileAnswerCards[index];
          title.textContent = compact && mobile ? mobile.title : item.dataset.desktopTitle;
          if (preview) preview.textContent = compact && mobile ? mobile.preview : item.dataset.desktopPreview;
        });
      }
    };

    const advisorChatUrl = root.dataset.advisorChatUrl;
    if (advisorChatUrl) {
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
    }
    syncTitles();
    view?.addEventListener('resize', syncTitles);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
