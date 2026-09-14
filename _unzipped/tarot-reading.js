(() => {
  const sourceDesc = "The main goal of my work is to help find answers to tormenting questions, understand and love yourself and the world, live in harmony and pleasure. And also to maintain a connection with your Higher Self, to be able to live ...";
  const desktopExperts = [
    { name: "Veronika", avatar: "img/avatar-1.png", rating: "4.8", role: "tarot reader", years: "9 years", consultations: "16752", desc: sourceDesc },
    { name: "Marina", avatar: "img/avatar-2.png", rating: "4.2", role: "tarot reader", years: "6 years", consultations: "9752", desc: sourceDesc },
    { name: "Svetlana", avatar: "img/avatar-3.png", rating: "4.9", role: "tarot reader", years: "9 years", consultations: "16752", desc: sourceDesc },
    { name: "Izolda", avatar: "img/avatar-1.png", rating: "4.8", role: "tarot reader", years: "9 years", consultations: "16752", desc: sourceDesc },
    { name: "Galina", avatar: "img/avatar-1.png", rating: "4.8", role: "tarot reader", years: "9 years", consultations: "16752", desc: sourceDesc },
    { name: "Magic Pig", avatar: "img/avatar-1.png", rating: "4.8", role: "tarot reader", years: "9 years", consultations: "16752", desc: sourceDesc }
  ];
  const compactExperts = desktopExperts;
  const media = window.matchMedia("(max-width: 1199.98px)");

  function setExpertCard(card, data) {
    const avatar = card.querySelector(".apn-love-card__avatar img");
    avatar.src = data.avatar;
    avatar.alt = data.name;
    card.querySelector(".apn-love-card__name").textContent = data.name;
    card.querySelector(".apn-love-card__rating").textContent = data.rating;
    card.querySelector(".apn-love-card__role").textContent = data.role;
    const facts = card.querySelectorAll(".apn-love-card__fact");
    facts[0].innerHTML = `<span class="apn-love-card__fact-accent">${data.years}</span><span class="apn-love-card__fact-space"> </span><span class="apn-love-card__fact-muted">of experience</span>`;
    facts[1].innerHTML = `<span class="apn-love-card__fact-accent">${data.consultations}</span><span class="apn-love-card__fact-space"> </span><span class="apn-love-card__fact-muted">consultation done</span>`;
    card.querySelector(".apn-love-card__desc").textContent = data.desc;
  }

  function applyExpertVariant() {
    const variant = media.matches ? compactExperts : desktopExperts;
    document.querySelectorAll(".tarot-experts__grid > .apn-love-card").forEach((card, index) => {
      if (variant[index]) setExpertCard(card, variant[index]);
    });
    document.documentElement.dataset.breakpointContentVariant = media.matches ? "compact-diverse-heritage" : "desktop-diverse-source";
  }

  applyExpertVariant();
  media.addEventListener?.("change", applyExpertVariant);
})();

(() => {
  const opener = document.querySelector("button[aria-label='Open menu'][data-target='#navbarOffcanvasTarot']");
  const panel = document.querySelector("#navbarOffcanvasTarot");
  if (!opener || !panel || !window.jQuery) return;

  let panelOpener = null;
  opener.addEventListener("click", (event) => {
    if (!panel.classList.contains("show")) panelOpener = event.currentTarget;
  });
  window.jQuery(panel).on("hidden.bs.collapse.tarotFocusReturn", () => {
    const focusTarget = panelOpener;
    panelOpener = null;
    if (focusTarget?.isConnected) focusTarget.focus();
  });
})();

(() => {
  const opener = document.querySelector("button[aria-label='Open menu'][data-target='#navbarOffcanvasTarot']");
  const panel = document.querySelector("#navbarOffcanvasTarot");
  const close = panel?.querySelector(".site-header__offcanvas-close[data-target='#navbarOffcanvasTarot']");
  if (!opener || !panel || !close) return;

  function activateFromKeyboard(event) {
    if (event.defaultPrevented || event.repeat) return;
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    event.currentTarget.click();
  }

  opener.addEventListener("keydown", activateFromKeyboard);
  close.addEventListener("keydown", activateFromKeyboard);
})();

(() => {
  function bindAccordionKeyboardActivation(rootSelector, toggleSelector) {
    document.querySelectorAll(rootSelector).forEach((root) => {
      root.addEventListener("keydown", (event) => {
        if (event.defaultPrevented || event.repeat) return;
        if (event.key !== "Enter" && event.key !== " ") return;

        const button = event.target.closest(toggleSelector);
        if (!button || !root.contains(button)) return;

        event.preventDefault();
        button.click();
        button.focus();
      });
    });
  }

  function bindSingleAccordion(rootSelector, itemSelector, openClass, markText) {
    document.querySelectorAll(rootSelector).forEach((root) => {
      const items = Array.from(root.querySelectorAll(itemSelector));
      items.forEach((item) => {
        const button = item.querySelector("button");
        if (!button) return;
        button.setAttribute("aria-expanded", item.classList.contains(openClass) ? "true" : "false");
        button.addEventListener("click", () => {
          const willOpen = !item.classList.contains(openClass);
          items.forEach((sibling) => {
            sibling.classList.remove(openClass);
            const siblingButton = sibling.querySelector("button");
            if (siblingButton) siblingButton.setAttribute("aria-expanded", "false");
            if (markText) {
              const mark = siblingButton?.querySelector("span:last-child");
              if (mark) mark.textContent = "+";
            }
          });
          if (willOpen) {
            item.classList.add(openClass);
            button.setAttribute("aria-expanded", "true");
            if (markText) {
              const mark = button.querySelector("span:last-child");
              if (mark) mark.textContent = "x";
            }
          }
        });
      });
    });
  }

  bindSingleAccordion(".tarot-seo__list", ".tarot-seo__item", "tarot-seo__item--open", false);
  bindAccordionKeyboardActivation("#tarotFaq", ".faq-section__toggle");
  bindAccordionKeyboardActivation(".tarot-seo__list", ".tarot-seo__item > button");
})();
