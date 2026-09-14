document.addEventListener("DOMContentLoaded", function () {
  initOffcanvasScrollLock();
  initInlineVideoEmbed();
  initClientsSlider();
});

function initOffcanvasScrollLock() {
  if (!window.jQuery) return;

  var headers = document.querySelectorAll(".site-header");
  if (!headers.length) return;

  var bodyLock = null;

  function isControlForMenu(control, menu) {
    if (!control || !control.getAttribute) return false;
    return control.getAttribute("aria-controls") === menu.id
      || control.getAttribute("data-target") === "#" + menu.id;
  }

  function findExternalControl(header, menu) {
    var controls = header.querySelectorAll("[aria-controls], [data-target]");
    for (var index = 0; index < controls.length; index += 1) {
      if (isControlForMenu(controls[index], menu) && !menu.contains(controls[index])) {
        return controls[index];
      }
    }
    return null;
  }

  function syncMenuControls(header, menu, expanded) {
    var controls = header.querySelectorAll("[aria-controls], [data-target]");
    for (var index = 0; index < controls.length; index += 1) {
      if (isControlForMenu(controls[index], menu)) {
        controls[index].setAttribute("aria-expanded", expanded ? "true" : "false");
      }
    }
    // Keep the menu's accessibility tree in the same state as its visual
    // collapse.  At 993px Bootstrap's lg row is inline again, so a closed
    // collapse must still be exposed to screen readers on desktop.
    var desktop = window.matchMedia && window.matchMedia("(min-width: 993px)").matches;
    menu.setAttribute("aria-hidden", expanded || desktop ? "false" : "true");
  }

  function lockBodyScroll(menu) {
    if (!bodyLock) {
      bodyLock = {
        menu: menu,
        scrollY: window.scrollY || window.pageYOffset || 0,
        position: document.body.style.position,
        top: document.body.style.top,
        width: document.body.style.width
      };
    } else {
      bodyLock.menu = menu;
    }

    document.body.classList.add("nav-open");
    document.body.style.position = "fixed";
    document.body.style.top = -bodyLock.scrollY + "px";
    document.body.style.width = "100%";
  }

  function unlockBodyScroll(menu) {
    if (!bodyLock || bodyLock.menu !== menu) return;

    var restoreY = bodyLock.scrollY;
    document.body.classList.remove("nav-open");
    document.body.style.position = bodyLock.position;
    document.body.style.top = bodyLock.top;
    document.body.style.width = bodyLock.width;
    bodyLock = null;
    window.scrollTo(0, restoreY);
  }

  headers.forEach(function (header) {
    var menus = header.querySelectorAll(".navbar-collapse[id]");
    if (menus.length !== 1) return;

    var menu = menus[0];
    var $menu = window.jQuery(menu);
    if ($menu.data("nebulaOffcanvasBound")) return;
    $menu.data("nebulaOffcanvasBound", true);
    var returnFocus = null;

    $menu.on("show.bs.collapse", function () {
      var activeElement = document.activeElement;
      if (activeElement && header.contains(activeElement)
        && isControlForMenu(activeElement, menu) && !menu.contains(activeElement)) {
        returnFocus = activeElement;
      } else {
        returnFocus = findExternalControl(header, menu);
      }
    });

    $menu.on("shown.bs.collapse", function () {
      lockBodyScroll(menu);
      syncMenuControls(header, menu, true);
      var focusTarget = menu.querySelector(
        ".site-header__offcanvas-close, a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])"
      );
      if (focusTarget) {
        try { focusTarget.focus({ preventScroll: true }); } catch (error) { focusTarget.focus(); }
      }
    });

    $menu.on("hidden.bs.collapse", function () {
      unlockBodyScroll(menu);
      var focusReturnTarget = returnFocus;
      syncMenuControls(header, menu, false);
      returnFocus = null;
      window.requestAnimationFrame(function () {
        if (!focusReturnTarget || !document.documentElement.contains(focusReturnTarget)) return;
        try { focusReturnTarget.focus({ preventScroll: true }); } catch (error) { focusReturnTarget.focus(); }
      });
    });

    menu.addEventListener("keydown", function (event) {
      if (!$menu.hasClass("show")) return;
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        $menu.collapse("hide");
        return;
      }
      if (event.key !== "Tab") return;

      var focusable = Array.prototype.filter.call(
        menu.querySelectorAll("a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]"),
        function (element) {
          return element.tabIndex >= 0 && element.getClientRects().length > 0
            && window.getComputedStyle(element).visibility !== "hidden";
        }
      );
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    if ($menu.hasClass("show")) {
      syncMenuControls(header, menu, true);
      lockBodyScroll(menu);
    } else {
      syncMenuControls(header, menu, false);
    }

    window.addEventListener("resize", function () {
      if (!window.matchMedia || !window.matchMedia("(min-width: 993px)").matches) return;
      if ($menu.hasClass("show")) $menu.collapse("hide");
      else unlockBodyScroll(menu);
    });
  });
}

function initInlineVideoEmbed() {
  var cover = document.querySelector(".video-section__cover");
  if (!cover) return;

  cover.addEventListener("click", function () {
    if (cover.classList.contains("is-playing")) return;

    var videoUrl = cover.getAttribute("data-video-url");
    if (!videoUrl) return;

    var media = cover.querySelector(".video-section__cover-media");
    if (!media) return;

    var iframe = document.createElement("iframe");
    iframe.className = "video-section__iframe";
    iframe.src = videoUrl;
    iframe.title = "Neuro video";
    iframe.allow = "autoplay; encrypted-media; picture-in-picture";
    iframe.setAttribute("allowfullscreen", "");

    media.appendChild(iframe);
    cover.classList.add("is-playing");
    cover.setAttribute("aria-pressed", "true");
  });
}
document.addEventListener("DOMContentLoaded", function () {
  var roots = document.querySelectorAll('[data-accordion="single"]');
  if (!roots.length) return;

  roots.forEach(function (root) {
    function setIcon(btn, isOpen) {
      var icon = btn ? btn.querySelector(".faq-section__icon") : null;
      if (!icon) return;
      icon.innerHTML = isOpen
        ? '<span class="faq-section__icon-x"></span>'
        : '<span class="faq-section__icon-chevron"></span>';
    }

    function measurePreviewHeight(item) {
      var panel = item.querySelector(".faq-section__panel");
      var body = item.querySelector(".faq-section__body");
      if (!panel || !body) return 0;

      var wasOpen = item.classList.contains("is-open");
      item.classList.remove("is-open");

      var prevHeight = panel.scrollHeight;

      if (wasOpen) item.classList.add("is-open");
      return prevHeight;
    }

    function setToPreview(item) {
      var btn = item.querySelector(".faq-section__toggle");
      var panelId = btn && btn.getAttribute("aria-controls");
      var panel = panelId ? document.getElementById(panelId) : null;
      if (!btn || !panel) return;

      item.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
      setIcon(btn, false);

      var h = measurePreviewHeight(item);
      panel.style.height = h + "px";
    }

    function openItem(item) {
      var btn = item.querySelector(".faq-section__toggle");
      var panelId = btn && btn.getAttribute("aria-controls");
      var panel = panelId ? document.getElementById(panelId) : null;
      if (!btn || !panel) return;

      var from = panel.scrollHeight;

      item.classList.add("is-open");
      btn.setAttribute("aria-expanded", "true");
      setIcon(btn, true);

      var to = panel.scrollHeight;

      panel.style.height = from + "px";
      requestAnimationFrame(function () {
        panel.style.height = to + "px";
      });

      panel.addEventListener(
        "transitionend",
        function (e) {
          if (e.propertyName !== "height") return;
          if (!item.classList.contains("is-open")) return;
          panel.style.height = "auto";
        },
        { once: true },
      );
    }

    function closeItem(item) {
      var btn = item.querySelector(".faq-section__toggle");
      var panelId = btn && btn.getAttribute("aria-controls");
      var panel = panelId ? document.getElementById(panelId) : null;
      if (!btn || !panel) return;

      var from = panel.scrollHeight;

      item.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
      setIcon(btn, false);

      var to = panel.scrollHeight;

      panel.style.height = from + "px";
      requestAnimationFrame(function () {
        panel.style.height = to + "px";
      });
    }

    function closeAll(except) {
      root.querySelectorAll(".faq-section__item").forEach(function (item) {
        if (except && item === except) return;
        setToPreview(item);
      });
    }

    root.addEventListener("click", function (e) {
      var btn = e.target.closest(".faq-section__toggle");
      if (!btn || !root.contains(btn)) return;

      var item = btn.closest(".faq-section__item");
      if (!item) return;

      var isOpen = btn.getAttribute("aria-expanded") === "true";
      if (isOpen) {
        closeItem(item);
        return;
      }

      closeAll(item);
      openItem(item);
    });

    var items = root.querySelectorAll(".faq-section__item");
    var initiallyOpen = root.querySelector(".faq-section__item.is-open") || root.querySelector(".faq-section__item");
    items.forEach(function (item) {
      if (item === initiallyOpen) return;
      setToPreview(item);
    });

    if (initiallyOpen) {
      var initialBtn = initiallyOpen.querySelector(".faq-section__toggle");
      var initialPanelId = initialBtn && initialBtn.getAttribute("aria-controls");
      var initialPanel = initialPanelId ? document.getElementById(initialPanelId) : null;
      initiallyOpen.classList.add("is-open");
      if (initialBtn) {
        initialBtn.setAttribute("aria-expanded", "true");
        setIcon(initialBtn, true);
      }
      if (initialPanel) initialPanel.style.height = "auto";
    }
  });
});

function initClientsSlider() {
  if (typeof Swiper === "undefined") return;

  var container = document.querySelector(
    ".clients-section__grid-swiper.swiper",
  );
  if (!container) return;

  var prevBtn = document.querySelector(".clients-section__slider-btn--prev");
  var nextBtn = document.querySelector(".clients-section__slider-btn--next");

  var swiper = new Swiper(container, {
    slidesPerView: "auto",
    spaceBetween: 10,
    breakpoints: {
      0: {
        slidesPerView: 1,
        spaceBetween: 14,
      },
      768: {
        slidesPerView: "auto",
        spaceBetween: 10,
      },
    },
    navigation: {
      prevEl: prevBtn,
      nextEl: nextBtn,
    },
  });
}
