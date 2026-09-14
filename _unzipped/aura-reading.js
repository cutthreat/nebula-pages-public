(function () {
  "use strict";

  function initReviewCarousel() {
    var viewport = document.querySelector(".aura-review-viewport");
    var track = viewport && viewport.querySelector(".aura-review-grid");
    var previous = document.querySelector(".aura-review-control--prev");
    var next = document.querySelector(".aura-review-control--next");
    var cards = track ? track.querySelectorAll(".aura-review-card") : [];

    if (!viewport || !track || !previous || !next || !cards.length) return;

    var index = 0;
    var maxIndex = cards.length - 1;

    function render() {
      track.style.setProperty("--aura-review-index", String(index));
      track.setAttribute("data-review-index", String(index));
      previous.disabled = index === 0;
      next.disabled = index === maxIndex;
      previous.setAttribute("aria-disabled", String(previous.disabled));
      next.setAttribute("aria-disabled", String(next.disabled));
    }

    function setIndex(nextIndex) {
      index = Math.max(0, Math.min(maxIndex, nextIndex));
      render();
    }

    previous.addEventListener("click", function () {
      setIndex(index - 1);
    });

    next.addEventListener("click", function () {
      setIndex(index + 1);
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 575) index = 0;
      render();
    });

    render();
  }

  function initAuraReading() {
    initReviewCarousel();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAuraReading);
  } else {
    initAuraReading();
  }
}());
