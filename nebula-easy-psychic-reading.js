(function () {
  "use strict";

  var root = document.querySelector("[data-nebula-easy-psychic-reading]");
  if (!root) return;

  function bindMenu() {
    var opener = root.querySelector(".navbar-toggler");
    var closer = root.querySelector(".site-header__offcanvas-close");
    var panel = root.querySelector("#navbarOffcanvas");
    var header = root.querySelector(".site-header");
    if (!opener || !closer || !panel || !header) return;

    var bodyLock = null;
    var returnFocus = opener;
    function getFocusable() {
      return Array.prototype.filter.call(panel.querySelectorAll(
        "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]",
      ), function (element) {
        return element.tabIndex >= 0 && element.getClientRects().length > 0
          && window.getComputedStyle(element).visibility !== "hidden";
      });
    }

    function focusElement(element) {
      if (!element) return;
      try { element.focus({ preventScroll: true }); } catch (error) { element.focus(); }
    }

    function lockBody() {
      if (bodyLock) return;
      var scrollY = window.scrollY || window.pageYOffset || 0;
      bodyLock = {
        scrollY: scrollY,
        position: document.body.style.position,
        top: document.body.style.top,
        width: document.body.style.width,
      };
      document.body.classList.add("nav-open");
      document.body.style.position = "fixed";
      document.body.style.top = -scrollY + "px";
      document.body.style.width = "100%";
    }

    function unlockBody() {
      if (!bodyLock) return;
      var restoreY = bodyLock.scrollY;
      document.body.classList.remove("nav-open");
      document.body.style.position = bodyLock.position;
      document.body.style.top = bodyLock.top;
      document.body.style.width = bodyLock.width;
      bodyLock = null;
      window.scrollTo(0, restoreY);
    }

    function setOpen(open, restoreFocus) {
      var wasOpen = panel.classList.contains("show");
      if (open === wasOpen) return;
      if (open) {
        var active = document.activeElement;
        returnFocus = active && header.contains(active) && active !== closer ? active : opener;
        panel.classList.add("show");
        opener.setAttribute("aria-expanded", "true");
        closer.setAttribute("aria-expanded", "true");
        panel.setAttribute("aria-hidden", "false");
        lockBody();
        window.requestAnimationFrame(function () { focusElement(closer || getFocusable()[0]); });
        return;
      }

      panel.classList.toggle("show", open);
      opener.setAttribute("aria-expanded", "false");
      closer.setAttribute("aria-expanded", "false");
      panel.setAttribute("aria-hidden", "true");
      unlockBody();
      var target = restoreFocus === false ? null : returnFocus;
      returnFocus = opener;
      if (target) window.requestAnimationFrame(function () { focusElement(target); });
    }

    opener.addEventListener("click", function () { setOpen(!panel.classList.contains("show")); });
    closer.addEventListener("click", function () { setOpen(false); });
    panel.addEventListener("click", function (event) {
      if (event.target.closest("a")) setOpen(false);
    });
    panel.addEventListener("keydown", function (event) {
      if (!panel.classList.contains("show")) return;
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      var focusable = getFocusable();
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        focusElement(last);
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        focusElement(first);
      }
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && panel.classList.contains("show")) {
        event.preventDefault();
        setOpen(false);
      }
    });
    window.addEventListener("resize", function () {
      if (window.matchMedia("(min-width: 992px)").matches) setOpen(false, false);
    });
    panel.setAttribute("aria-hidden", panel.classList.contains("show") ? "false" : "true");
    if (panel.classList.contains("show")) {
      opener.setAttribute("aria-expanded", "true");
      closer.setAttribute("aria-expanded", "true");
      lockBody();
    }
  }

  function icon(open) {
    var span = document.createElement("span");
    span.className = open ? "faq-section__icon-cross" : "faq-section__icon-plus";
    return span;
  }

  function bindAccordion(list) {
    var items = Array.prototype.filter.call(list.children, function (child) {
      return child.classList.contains("faq-section__item");
    });

    function setState(item, open) {
      var button = item.querySelector(".faq-section__toggle");
      var panel = item.querySelector(".faq-section__panel");
      var holder = item.querySelector(".faq-section__icon");
      if (!button || !panel || !holder) return;
      item.classList.toggle("is-open", open);
      button.setAttribute("aria-expanded", String(open));
      panel.setAttribute("aria-hidden", String(!open));
      holder.replaceChildren(icon(open));
    }

    items.forEach(function (item) {
      var button = item.querySelector(".faq-section__toggle");
      if (!button) return;
      setState(item, item.classList.contains("is-open"));
      button.addEventListener("click", function () {
        var willOpen = !item.classList.contains("is-open");
        items.forEach(function (candidate) { setState(candidate, candidate === item && willOpen); });
      });
    });
  }

  root.querySelectorAll('[data-accordion="single"]').forEach(bindAccordion);
  bindMenu();
}());
