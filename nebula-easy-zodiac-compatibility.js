(function () {
  // Header collapse lifecycle belongs to Bootstrap + home.js.
  var lowerItems = document.querySelectorAll('.zcn-lower details');
  lowerItems.forEach(function (item, index) {
    if (index === 0) {
      item.setAttribute('open', '');
    } else {
      item.removeAttribute('open');
    }
    item.addEventListener('toggle', function () {
      if (!item.open) return;
      lowerItems.forEach(function (sibling) {
        if (sibling !== item) sibling.removeAttribute('open');
      });
    });
  });

  if (window.matchMedia('(max-width: 1199.98px)').matches) {
    var expertCards = document.querySelectorAll('.zcn-page main > section:nth-of-type(7) .zcn-advisor');
    if (expertCards.length > 1) {
      var sourceCard = expertCards[0].cloneNode(true);
      expertCards.forEach(function (card, index) {
        if (index === 0) return;
        card.innerHTML = sourceCard.innerHTML;
        card.setAttribute('data-responsive-source', 'figma-repeat-veronika-card');
      });
    }
  }
})();
