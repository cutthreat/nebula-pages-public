(() => {
  const icon = (open) => {
    const primitive = document.createElement("span");
    primitive.className = open ? "faq-section__icon-cross" : "faq-section__icon-plus";
    return primitive;
  };

  const bindAccordion = (list) => {
    const items = Array.from(list.querySelectorAll(":scope > .faq-section__item"));
    const seo = list.id === "loveSeoAccordion";
    const setState = (item, open) => {
      const button = item.querySelector(".faq-section__toggle");
      const panel = item.querySelector(".faq-section__panel");
      const holder = item.querySelector(".faq-section__icon");
      if (!button || !panel || !holder) return;
      item.classList.toggle("is-open", open);
      button.setAttribute("aria-expanded", String(open));
      panel.hidden = seo ? false : !open;
      panel.setAttribute("aria-hidden", String(seo ? false : !open));
      holder.replaceChildren(icon(open));
    };

    items.forEach((item) => {
      const button = item.querySelector(".faq-section__toggle");
      if (!button) return;
      setState(item, item.classList.contains("is-open") || button.getAttribute("aria-expanded") === "true");
      button.addEventListener("click", () => {
        const willOpen = !item.classList.contains("is-open");
        items.forEach((candidate) => setState(candidate, candidate === item && willOpen));
      });
    });
  };

  const bindMenu = () => {
    const menu = document.querySelector(".navbar-toggler");
    const close = document.querySelector(".site-header__offcanvas-close");
    const panel = document.querySelector("#navbarOffcanvasLove");
    const header = document.querySelector(".site-header");
    if (!menu || !close || !panel || !header) return;

    let bodyLock = null;
    let returnFocus = menu;
    const getFocusable = () => Array.from(panel.querySelectorAll(
      "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]",
    )).filter((element) => element.tabIndex >= 0
      && element.getClientRects().length > 0
      && window.getComputedStyle(element).visibility !== "hidden");
    const focusElement = (element) => {
      if (!element) return;
      try { element.focus({ preventScroll: true }); } catch (error) { element.focus(); }
    };
    const lockBody = () => {
      if (bodyLock) return;
      const scrollY = window.scrollY || window.pageYOffset || 0;
      bodyLock = {
        scrollY,
        position: document.body.style.position,
        top: document.body.style.top,
        width: document.body.style.width,
      };
      document.body.classList.add("nav-open");
      document.body.style.position = "fixed";
      document.body.style.top = `${-scrollY}px`;
      document.body.style.width = "100%";
    };
    const unlockBody = () => {
      if (!bodyLock) return;
      const restoreY = bodyLock.scrollY;
      document.body.classList.remove("nav-open");
      document.body.style.position = bodyLock.position;
      document.body.style.top = bodyLock.top;
      document.body.style.width = bodyLock.width;
      bodyLock = null;
      window.scrollTo(0, restoreY);
    };
    const setMenu = (open, restoreFocus = true) => {
      const wasOpen = panel.classList.contains("show");
      if (open === wasOpen) return;
      if (open) {
        const active = document.activeElement;
        returnFocus = active && header.contains(active) && active !== close ? active : menu;
        panel.classList.add("show");
        menu.setAttribute("aria-expanded", "true");
        close.setAttribute("aria-expanded", "true");
        panel.setAttribute("aria-hidden", "false");
        lockBody();
        window.requestAnimationFrame(() => focusElement(close || getFocusable()[0]));
        return;
      }

      panel.classList.remove("show");
      menu.setAttribute("aria-expanded", "false");
      close.setAttribute("aria-expanded", "false");
      panel.setAttribute("aria-hidden", "true");
      unlockBody();
      const target = restoreFocus ? returnFocus : null;
      returnFocus = menu;
      if (target) window.requestAnimationFrame(() => focusElement(target));
    };
    menu.addEventListener("click", () => setMenu(!panel.classList.contains("show")));
    close.addEventListener("click", () => setMenu(false));
    panel.addEventListener("click", (event) => {
      if (event.target.closest("a")) setMenu(false);
    });
    panel.addEventListener("keydown", (event) => {
      if (!panel.classList.contains("show")) return;
      if (event.key === "Escape") {
        event.preventDefault();
        setMenu(false);
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = getFocusable();
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        focusElement(last);
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        focusElement(first);
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && panel.classList.contains("show")) {
        event.preventDefault();
        setMenu(false);
      }
    });
    window.addEventListener("resize", () => {
      if (window.matchMedia("(min-width: 992px)").matches) setMenu(false, false);
    });
    panel.setAttribute("aria-hidden", panel.classList.contains("show") ? "false" : "true");
    if (panel.classList.contains("show")) {
      menu.setAttribute("aria-expanded", "true");
      close.setAttribute("aria-expanded", "true");
      lockBody();
    }
  };

  const bindReviewCarousel = () => {
    const viewport = document.querySelector("[data-love-review-carousel]");
    const controls = document.querySelector(".lov-review-controls");
    const previous = controls?.querySelector(".lov-review-control--prev");
    const next = controls?.querySelector(".lov-review-control--next");
    if (!viewport || !controls || !previous || !next) return;

    const maxScroll = () => Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    const update = () => {
      previous.disabled = viewport.scrollLeft <= 1;
      next.disabled = viewport.scrollLeft >= maxScroll() - 1;
    };
    const move = (toEnd) => {
      viewport.scrollTo({
        left: toEnd ? maxScroll() : 0,
        behavior: "smooth",
      });
    };

    previous.addEventListener("click", () => move(false));
    next.addEventListener("click", () => move(true));
    viewport.addEventListener("scroll", update, { passive: true });
    update();
  };

  document.querySelectorAll('[data-accordion="single"]').forEach(bindAccordion);
  bindMenu();
  bindReviewCarousel();
})();
