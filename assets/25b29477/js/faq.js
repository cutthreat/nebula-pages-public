document.querySelectorAll(".faq-item__question").forEach((button) => {
    const item = button.closest(".faq-item");
    const answer = item?.querySelector(".faq-item__answer");

    if (!item || !answer) {
        button.disabled = true;
        button.setAttribute("aria-disabled", "true");
        return;
    }

    if (!answer.id) {
        answer.id = "faq-answer-social-report";
    }

    button.setAttribute("aria-controls", answer.id);
    button.setAttribute("aria-expanded", String(item.classList.contains("faq-item--open")));

    button.addEventListener("click", () => {
        item.classList.toggle("faq-item--open");
        button.setAttribute("aria-expanded", String(item.classList.contains("faq-item--open")));
    });
});
