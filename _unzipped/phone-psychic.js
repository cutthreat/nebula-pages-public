(function () {
  "use strict";

  document.querySelectorAll(".pp-seo__item button").forEach(function (button) {
    button.addEventListener("click", function () {
      var item = button.closest(".pp-seo__item");
      var wasOpen = item.classList.contains("pp-seo__item--open");
      var icon = item.querySelector("button span:last-child");

      document.querySelectorAll(".pp-seo__item").forEach(function (otherItem) {
        var otherButton = otherItem.querySelector("button");
        var otherIcon = otherItem.querySelector("button span:last-child");

        otherItem.classList.remove("pp-seo__item--open");
        if (otherButton) {
          otherButton.setAttribute("aria-expanded", "false");
        }
        if (otherIcon) {
          otherIcon.textContent = "\u2304";
        }
      });

      item.classList.toggle("pp-seo__item--open", !wasOpen);
      button.setAttribute("aria-expanded", String(!wasOpen));
      if (icon) {
        icon.textContent = wasOpen ? "\u2304" : "\u00d7";
      }
    });
  });

  var themeToggle = document.querySelector(".site-header__theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var isPressed = themeToggle.getAttribute("aria-pressed") === "true";
      themeToggle.setAttribute("aria-pressed", String(!isPressed));
    });
  }

  var reviewTrack = document.querySelector(".pp-reviews__grid");
  var reviewPrev = document.querySelector(".pp-reviews__nav-prev");
  var reviewNext = document.querySelector(".pp-reviews__nav-next");

  function scrollReviews(direction) {
    if (!reviewTrack) {
      return;
    }
    reviewTrack.scrollBy({ left: direction * 270, behavior: "smooth" });
  }

  if (reviewPrev) {
    reviewPrev.addEventListener("click", function () { scrollReviews(-1); });
  }
  if (reviewNext) {
    reviewNext.addEventListener("click", function () { scrollReviews(1); });
  }
}());
