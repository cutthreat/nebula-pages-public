(function () {
  var items = document.querySelectorAll(".palm-seo__item");
  if (!items.length) return;

  function textPreview(item) {
    var content = item.querySelector(".palm-seo__content");
    var text = content ? content.textContent.replace(/\s+/g, " ").trim() : "";
    return text.length > 180 ? text.slice(0, 177) + "..." : text;
  }

  function ensurePreview(item) {
    if (item.querySelector(".palm-seo__preview")) return;
    var previewText = textPreview(item);
    if (!previewText) return;
    var preview = document.createElement("div");
    preview.className = "palm-seo__preview";
    preview.textContent = previewText;
    item.appendChild(preview);
  }

  function ensureContent(item) {
    if (item.querySelector(".palm-seo__content")) return;
    var preview = item.querySelector(".palm-seo__preview");
    if (!preview) return;
    var content = document.createElement("div");
    content.className = "palm-seo__content";
    var paragraph = document.createElement("p");
    paragraph.textContent = preview.textContent.trim();
    content.appendChild(paragraph);
    item.appendChild(content);
  }

  function setOpen(target) {
    items.forEach(function (item) {
      var isTarget = item === target;
      var button = item.querySelector(".palm-seo__toggle");
      var icon = item.querySelector(".palm-seo__icon");
      if (!isTarget) ensurePreview(item);
      if (isTarget) ensureContent(item);
      item.classList.toggle("palm-seo__item--open", isTarget);
      if (button) button.setAttribute("aria-expanded", isTarget ? "true" : "false");
      if (icon) icon.classList.toggle("palm-seo__icon--close", isTarget);
    });
  }

  items.forEach(function (item) {
    var button = item.querySelector(".palm-seo__toggle");
    if (!button) return;
    button.addEventListener("click", function () {
      setOpen(item);
    });
  });
}());
