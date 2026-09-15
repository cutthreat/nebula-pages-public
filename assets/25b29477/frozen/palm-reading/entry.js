(() => {
  document.documentElement.dataset.nebulaEasyCandidate = "palm-reading-source-rebase";
  // Source-backed legacy links are relative to _unzipped; rebind them for this isolated entry route.
  document.querySelectorAll('a[href]').forEach((link) => {
    const href = link.getAttribute('href');
    if (href && !href.startsWith('#') && !href.startsWith('/') && !href.startsWith('_unzipped/') && href.includes('.html')) {
      link.setAttribute('href', `_unzipped/${href}`);
    }
  });
})();
