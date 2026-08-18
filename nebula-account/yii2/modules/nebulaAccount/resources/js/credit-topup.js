(() => {
  const root = document.querySelector('[data-nebula-credit-topup]');
  if (!root) return;
  const scrim = root.querySelector('[data-credit-topup-scrim]');
  const dialog = root.querySelector('.nb-credit-topup__dialog');
  const packages = [...root.querySelectorAll('[data-credit-package]')];
  const balanceLabel = root.querySelector('[data-credit-topup-balance]');
  const summary = root.querySelector('[data-credit-topup-summary]');
  const total = root.querySelector('[data-credit-topup-total]');
  const successCopy = root.querySelector('[data-credit-topup-success-copy]');
  const live = root.querySelector('[data-credit-topup-live]');
  const steps = [...root.querySelectorAll('[data-credit-topup-step]')];
  const confirm = root.querySelector('[data-credit-topup-action="confirm"]');
  if (!scrim || !dialog || packages.length !== 3 || !confirm) return;

  let opener = null;
  let timer = null;
  let currentBalance = 120;
  let selected = packages[0];
  const inerted = new Map();
  const announce = (message) => { if (live) live.textContent = message; };
  const firstPageBalance = () => {
    const page = document.querySelector('[data-balance-fixture]');
    const value = Number.parseInt(page?.dataset.balanceFixture || '', 10);
    if (Number.isFinite(value)) return value;
    const pill = document.querySelector('.nb-credit-pill span, [data-credit-topup-trigger] span');
    const parsed = Number.parseInt(pill?.textContent || '', 10);
    return Number.isFinite(parsed) ? parsed : 120;
  };
  const syncBalance = () => {
    const text = `${currentBalance} credits`;
    if (balanceLabel) balanceLabel.textContent = text;
    document.querySelectorAll('.nb-credit-pill span, [data-credit-topup-trigger] span').forEach((node) => { node.textContent = String(currentBalance); });
    document.querySelectorAll('.nb-credit-pill, [data-credit-topup-trigger]').forEach((node) => { node.setAttribute('aria-label', `Credits balance ${currentBalance}`); });
    document.querySelectorAll('.nb-sidebar-balance strong span').forEach((node) => { node.textContent = text; });
    document.querySelectorAll('.nb-affirmation-balance strong').forEach((node) => { node.textContent = `Balance: ${text}`; });
    document.querySelectorAll('[data-balance-fixture]').forEach((node) => { node.dataset.balanceFixture = String(currentBalance); });
  };
  const setStep = (name) => steps.forEach((step) => { step.hidden = step.dataset.creditTopupStep !== name; });
  const selectionDetail = (reason) => ({
    reason,
    packageId: selected?.dataset.creditPackage || null,
    credits: Number.parseInt(selected?.dataset.credits || '0', 10),
    amount: selected?.dataset.amount || null,
    backendRequired: true,
    demoOnly: true,
    paymentStarted: false,
    charged: false,
    serverBalanceMutation: false,
    persisted: false,
    staticProjection: true,
  });
  const markTriggers = () => {
    const controls = [...document.querySelectorAll('.nb-credit-pill, .nb-refill-visual, [data-credit-topup-trigger]')]
      .filter((control) => !root.contains(control) && control.dataset.profileAction !== 'refill');
    controls.forEach((control) => {
      if (control.dataset.creditTopupBound === 'true') return;
      control.dataset.creditTopupBound = 'true';
      control.setAttribute('aria-haspopup', 'dialog');
      control.setAttribute('aria-controls', 'nebula-credit-topup-dialog');
      if (control.tagName !== 'BUTTON' && control.tagName !== 'A') { control.setAttribute('role', 'button'); control.tabIndex = 0; }
      const activate = (event) => { if (event.type === 'keydown' && !['Enter', ' '].includes(event.key)) return; event.preventDefault(); open(control); };
      control.addEventListener('click', activate);
      if (control.tagName !== 'BUTTON' && control.tagName !== 'A') control.addEventListener('keydown', activate);
    });
  };
  const setBackgroundInert = (isInert) => {
    [...document.body.children].forEach((node) => {
      if (node === root) return;
      if (isInert) { inerted.set(node, { inert: node.inert, ariaHidden: node.getAttribute('aria-hidden') }); node.inert = true; node.setAttribute('aria-hidden', 'true'); }
      else { const prior = inerted.get(node); if (!prior) return; node.inert = prior.inert; if (prior.ariaHidden === null) node.removeAttribute('aria-hidden'); else node.setAttribute('aria-hidden', prior.ariaHidden); }
    });
    if (!isInert) inerted.clear();
  };
  const renderSelection = (focus = false) => {
    packages.forEach((item) => { const active = item === selected; item.classList.toggle('is-selected', active); item.setAttribute('aria-checked', String(active)); item.tabIndex = active ? 0 : -1; });
    if (summary) summary.textContent = `${selected.dataset.credits} credits`;
    if (total) total.textContent = selected.dataset.amount;
    if (focus) selected.focus();
  };
  const close = (reason = 'dismissed') => {
    if (timer) { window.clearTimeout(timer); timer = null; }
    root.hidden = true; scrim.hidden = true; root.classList.remove('is-open'); document.documentElement.classList.remove('nebula-modal-open');
    setBackgroundInert(false); root.dispatchEvent(new CustomEvent('nebula:credit-topup-dismissed', { bubbles: true, detail: { ...selectionDetail(reason), outcome: reason } }));
    opener?.focus();
  };
  const open = (control) => {
    opener = control; currentBalance = firstPageBalance(); syncBalance(); setStep('packages'); confirm.disabled = false; renderSelection();
    root.hidden = false; scrim.hidden = false; root.classList.add('is-open'); document.documentElement.classList.add('nebula-modal-open'); setBackgroundInert(true);
    announce('Choose a credit package. This is a local preview without a payment gateway.');
    root.dispatchEvent(new CustomEvent('nebula:credit-topup-opened', { bubbles: true, detail: { backendRequired: true, demoOnly: true, staticProjection: true } }));
    window.requestAnimationFrame(() => (packages.find((item) => item === selected) || dialog).focus());
  };
  const complete = () => {
    const added = Number.parseInt(selected.dataset.credits || '0', 10); const before = currentBalance; currentBalance += added; syncBalance(); setStep('success');
    if (successCopy) successCopy.textContent = `The preview added ${added} credits. Your balance is now ${currentBalance} credits. No payment was sent and this value resets after reload.`;
    announce(`Local preview complete. ${added} credits added to the page only.`);
    root.dispatchEvent(new CustomEvent('nebula:credit-topup-completed', { bubbles: true, detail: { ...selectionDetail('completed'), balanceBefore: before, balanceAfter: currentBalance, localBalanceChanged: true, serverBalanceMutation: false, persisted: false } }));
    timer = null;
  };
  packages.forEach((item, index) => {
    item.addEventListener('click', () => { selected = item; renderSelection(); announce(`${item.dataset.credits} credits selected locally.`); });
    item.addEventListener('keydown', (event) => { let next = null; if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = Math.min(index + 1, packages.length - 1); if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = Math.max(index - 1, 0); if (event.key === 'Home') next = 0; if (event.key === 'End') next = packages.length - 1; if (next === null) return; event.preventDefault(); selected = packages[next]; renderSelection(true); });
  });
  confirm.addEventListener('click', () => { if (timer) return; root.dispatchEvent(new CustomEvent('nebula:credit-topup-confirm-required', { bubbles: true, detail: selectionDetail('confirm') })); setStep('processing'); confirm.disabled = true; announce('Preparing local preview. No payment gateway was called.'); timer = window.setTimeout(complete, 650); });
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { event.preventDefault(); close('escape'); return; }
    if (event.key !== 'Tab') return;
    const focusables = [...dialog.querySelectorAll('button:not([disabled])')].filter((node) => node.getClientRects().length > 0); if (!focusables.length) return; const first = focusables[0]; const last = focusables[focusables.length - 1]; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  root.addEventListener('keydown', (event) => {
    if (!root.hidden && event.key === 'Escape') {
      event.preventDefault();
      close('escape');
    }
  });
  document.addEventListener('keydown', (event) => {
    if (!root.hidden && event.key === 'Escape') {
      event.preventDefault();
      close('escape');
    }
  });
  scrim.addEventListener('click', (event) => { if (event.target === scrim) close('scrim'); });
  root.querySelectorAll('[data-credit-topup-action="close"]').forEach((button) => button.addEventListener('click', () => close('close')));
  markTriggers();
  window.addEventListener('resize', markTriggers, { passive: true });
  document.addEventListener('nebula:credit-topup-open-requested', (event) => open(event.detail?.opener instanceof HTMLElement ? event.detail.opener : null));
})();
