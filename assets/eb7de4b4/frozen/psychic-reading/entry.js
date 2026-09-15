(function () {
  "use strict";

  var root = document.querySelector("[data-nebula-easy-psychic-reading]");
  if (!root) return;

  function bindMenu() {
    var opener = root.querySelector(".navbar-toggler");
    var closer = root.querySelector(".site-header__offcanvas-close");
    var panel = root.querySelector("#navbarOffcanvas");
    if (!opener || !closer || !panel) return;

    function setOpen(open) {
      panel.classList.toggle("show", open);
      opener.setAttribute("aria-expanded", String(open));
      closer.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("nav-open", open);
    }

    opener.addEventListener("click", function () { setOpen(!panel.classList.contains("show")); });
    closer.addEventListener("click", function () { setOpen(false); });
    panel.addEventListener("click", function (event) {
      if (event.target.closest("a")) setOpen(false);
    });
    window.addEventListener("resize", function () {
      if (window.matchMedia("(min-width: 992px)").matches) setOpen(false);
    });
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
