(() => {
  document.documentElement.dataset.nebulaEasyCandidate = "palm-reading-source-rebase";
  // Source-backed legacy links are rebound to existing local host routes.
  const routes = {
    "psychic-reading-new.html": "/psychic-reading",
    // The static preview exposes the frozen all-psychic page as an HTML
    // entrypoint; Yii2 keeps the canonical /all-psychics route separately.
    "all-psychic-new.html": "/all-psychic-new.html",
    "zodiac-compatibility-new.html": "/zodiac-compatibility",
    "blog-new.html": "/blog",
    // The static preview owns the /signup/ directory; Yii2 maps the same
    // canonical intent to /signup-step-1 in its route table.
    "signup-step-1.html": "/signup/",
    "login.html": "/login",
    "faq-new.html": "/faq",
    "privacy-policy-new.html": "/privacy-policy"
  };
  document.querySelectorAll('a[href]').forEach((link) => {
    const href = link.getAttribute('href');
    if (href && Object.prototype.hasOwnProperty.call(routes, href)) {
      link.setAttribute('href', routes[href]);
    }
  });
})();
