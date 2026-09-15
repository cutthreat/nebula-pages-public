(function () {
  "use strict";

  var root = document.querySelector("[data-nebula-love-reading]");
  if (!root) return;

  function icon(open) {
    var primitive = document.createElement("span");
    primitive.className = open ? "faq-section__icon-cross" : "faq-section__icon-plus";
    return primitive;
  }

  function directItems(list) {
    return Array.prototype.filter.call(list.children, function (child) {
      return child.classList.contains("faq-section__item");
    });
  }

  function bindAccordion(list) {
    var items = directItems(list);
    var seo = list.id === "loveSeoAccordion";

    function setState(item, open) {
      var button = item.querySelector(".faq-section__toggle");
      var panel = item.querySelector(".faq-section__panel");
      var holder = item.querySelector(".faq-section__icon");
      if (!button || !panel || !holder) return;
      item.classList.toggle("is-open", open);
      button.setAttribute("aria-expanded", String(open));
      panel.hidden = seo ? false : !open;
      panel.setAttribute("aria-hidden", String(seo ? false : !open));
      holder.replaceChildren(icon(open));
    }

    items.forEach(function (item) {
      var button = item.querySelector(".faq-section__toggle");
      if (!button) return;
      setState(item, item.classList.contains("is-open") || button.getAttribute("aria-expanded") === "true");
      button.addEventListener("click", function () {
        var willOpen = !item.classList.contains("is-open");
        items.forEach(function (candidate) {
          setState(candidate, candidate === item && willOpen);
        });
      });
    });
  }

  function bindMenu() {
    var menu = root.querySelector(".navbar-toggler");
    var close = root.querySelector(".site-header__offcanvas-close");
    var panel = root.querySelector("#navbarOffcanvasLove");
    if (!menu || !close || !panel) return;

    function setMenu(open) {
      panel.classList.toggle("show", open);
      menu.setAttribute("aria-expanded", String(open));
      close.setAttribute("aria-expanded", String(open));
    }

    menu.addEventListener("click", function () { setMenu(!panel.classList.contains("show")); });
    close.addEventListener("click", function () { setMenu(false); });
    panel.addEventListener("click", function (event) {
      if (event.target.closest("a")) setMenu(false);
    });
  }

  root.querySelectorAll('[data-accordion="single"]').forEach(bindAccordion);
  bindMenu();
}());
