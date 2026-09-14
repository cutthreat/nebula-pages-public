document.addEventListener("DOMContentLoaded", function () {
  var list = document.querySelector(".cheap-seo__list");
  if (!list) return;

  var items = Array.from(list.querySelectorAll(".cheap-seo__item"));

  function setOpen(item, isOpen) {
    var button = item.querySelector("button");
    var icon = button && button.querySelector("span:last-child");
    item.classList.toggle("cheap-seo__item--open", isOpen);
    if (button) button.setAttribute("aria-expanded", String(isOpen));
    if (icon) icon.textContent = isOpen ? "−" : "+";
  }

  list.addEventListener("click", function (event) {
    var button = event.target.closest("button");
    if (!button || !list.contains(button)) return;

    var selected = button.closest(".cheap-seo__item");
    var shouldOpen = !selected.classList.contains("cheap-seo__item--open");
    items.forEach(function (item) {
      setOpen(item, item === selected && shouldOpen);
    });
  });

  var initial = items.find(function (item) {
    return item.classList.contains("cheap-seo__item--open");
  });
  items.forEach(function (item) {
    setOpen(item, item === initial);
  });
});
