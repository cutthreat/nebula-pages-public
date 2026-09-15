(() => {
  const flow = document.querySelector('[data-credit-topup-checkout-flow]');
  const topup = document.querySelector('[data-nebula-credit-topup]');
  const review = flow?.querySelector('[data-nebula-checkout-review]');
  const card = flow?.querySelector('[data-nebula-card-details]');
  const cardError = flow?.querySelector('[data-nebula-card-error]');
  const paymentError = flow?.querySelector('[data-nebula-payment-error]');
  if (!flow || !topup || !review || !card || !cardError || !paymentError) return;
  flow.dataset.creditTopupFlowBound = 'true';
  const sandboxWorkflow = (flowName, eventName) => document.dispatchEvent(new CustomEvent('nebula:sandbox-workflow-request', {
    detail: { flow: flowName, event: eventName },
  }));
  const sandboxCommand = (command, payload) => document.dispatchEvent(new CustomEvent('nebula:sandbox-workflow-request', {
    detail: { command, payload },
  }));

  const methods = [
    { id: 'method-paypal', version: 'method-v1', type: 'paypal' },
    { id: 'method-apple-pay', version: 'method-v1', type: 'apple_pay' },
    { id: 'method-credit-card', version: 'method-v1', type: 'credit_card' },
    { id: 'method-saved-card', version: 'method-v1', type: 'saved_card', maskedDisplay: '5457 08XX XXXX 1075' },
  ];
  let selection = { packageId: 'fixture-120', credits: 120, amount: '$ 9.99', opener: null };
  const canonicalPackageId = () => `credits-${Number(selection.credits) || 120}`;
  const main = document.querySelector('main');
  const hide = (root) => { root.hidden = true; root.querySelector(':scope > [class$="__frame"]')?.setAttribute('hidden', ''); };
  const closeTopupForHandoff = () => {
    topup.hidden = true;
    topup.querySelector('[data-credit-topup-scrim]')?.setAttribute('hidden', '');
    topup.classList.remove('is-open');
  };
  const setPageInert = (value) => {
    if (!main) return;
    main.inert = value;
    if (value) main.setAttribute('aria-hidden', 'true'); else main.removeAttribute('aria-hidden');
  };
  const packagePayload = (methodType = 'credit_card', opener = selection.opener) => {
    const method = methods.find((item) => item.type === methodType) || methods[2];
    return {
      serverState: 'checkout_order_review', checkoutId: 'billing-sandbox-checkout', checkoutVersion: 'fixture-v1',
      packageId: selection.packageId, packageVersion: 'fixture-v1', credits: selection.credits, subtotal: selection.amount, total: selection.amount, currency: 'USD',
      eligibleMethods: methods, selectedMethodId: method.id, selectedMethodVersion: method.version,
      submitIdempotencyKey: 'billing-fixture-submit', chooserIdempotencyKey: 'billing-fixture-chooser', authenticatedClient: true,
      capabilities: { checkoutSubmit: true, savedMethodChooser: true }, opener,
    };
  };
  const syncCopy = (root) => {
    root.dataset.packageId = selection.packageId;
    root.querySelectorAll('.checkout-review__package small, .card-details__package small').forEach((node) => { node.textContent = `${selection.credits} credits`; });
    root.querySelectorAll('.checkout-review__package b, .checkout-review__line > b, .card-details__package b, .card-details__line > b').forEach((node) => { node.textContent = selection.amount; });
  };
  const open = (root, eventName, payload) => {
    flow.hidden = false;
    setPageInert(true);
    root.dataset.staticProjection = 'true';
    root.dataset.orderCopy = 'fixture-only';
    syncCopy(root);
    root.dispatchEvent(new CustomEvent(eventName, { bubbles: false, detail: payload }));
  };
  const closeAll = () => {
    [review, card, cardError, paymentError].forEach(hide);
    flow.hidden = true;
    setPageInert(false);
    document.documentElement.classList.remove('nebula-modal-open');
  };
  const completePsychicsPaidChat = (opener) => {
    sandboxWorkflow('psychics-paid-chat', 'payment.approved.fixture');
    closeAll();
    document.dispatchEvent(new CustomEvent('nebula:credit-topup-payment-approved', {
      detail: {
        context: flow.dataset.flowContext,
        packageId: selection.packageId,
        credits: selection.credits,
        amount: selection.amount,
        opener,
        fixture: true,
        paymentCaptured: false,
        balanceChanged: false,
      },
    }));
  };
  const openReview = (opener = selection.opener) => {
    sandboxWorkflow('billing', 'order.review');
    open(review, 'nebula:checkout-review-open', packagePayload('credit_card', opener));
  };
  const openCard = (opener) => open(card, 'nebula:card-details-open', {
    ...packagePayload('credit_card', opener), serverState: 'checkout_card_details', secureFormCapability: true,
    methodIdempotencyKey: 'billing-fixture-method', chooserIdempotencyKey: 'billing-fixture-chooser-card', secureFormIdempotencyKey: 'billing-fixture-secure-form', submitIdempotencyKey: 'billing-fixture-card-submit',
    capabilities: { paymentMethodSelection: true, savedMethodChooser: true, securePaymentForm: true, checkoutSubmit: true },
  });
  const openPaymentError = (opener) => open(paymentError, 'nebula:payment-error-open', {
    serverState: 'payment_order_error', orderId: 'billing-fixture-order', orderVersion: 'fixture-v1', attemptId: 'billing-fixture-attempt', attemptVersion: 'fixture-v1',
    upstreamContext: 'billing-sandbox', redactedReference: 'fixture-no-provider', idempotencyKey: 'billing-fixture-recovery', authenticatedClient: true,
    capabilities: { alternatePaymentMethod: true, paymentSupport: true }, opener,
  });
  const openCardError = (opener) => open(cardError, 'nebula:card-payment-error-open', {
    serverState: 'card_payment_error', reconciliationStatus: 'reconciled', orderId: 'billing-fixture-order', orderVersion: 'fixture-v1', attemptId: 'billing-fixture-attempt', attemptVersion: 'fixture-v1',
    upstreamContext: 'billing-sandbox', redactedReference: 'fixture-no-provider', eligibleMethods: [methods[1], methods[3]],
    idempotencyKeys: { wallet: 'billing-fixture-wallet', savedMethod: 'billing-fixture-saved', chooser: 'billing-fixture-error-chooser', support: 'billing-fixture-support' }, authenticatedClient: true,
    capabilities: { walletPaymentIntent: true, savedPaymentMethodIntent: true, paymentMethodChooser: true, paymentSupport: true }, opener,
  });

  document.addEventListener('nebula:credit-topup-checkout-requested', (event) => {
    if (event.target !== topup) return;
    selection = { ...selection, ...event.detail, opener: document.activeElement instanceof HTMLElement ? document.activeElement : null };
    sandboxWorkflow('billing', 'topup.open');
    sandboxCommand('checkout.order.create', { packageId: canonicalPackageId() });
    closeTopupForHandoff();
    openReview(selection.opener);
  });
  document.addEventListener('nebula:checkout-submit-requested', (event) => {
    if (event.target === review) {
      const active = review.querySelector('[role="radio"][aria-checked="true"]');
      hide(review);
      if (active?.dataset.methodType === 'credit_card') {
        sandboxWorkflow('billing', 'card.details');
        openCard(active);
      } else {
        sandboxWorkflow('billing', 'payment.failed');
        openPaymentError(active);
      }
    } else if (event.target === card) {
      if (flow.dataset.flowContext === 'psychics-paid-chat') completePsychicsPaidChat(event.target.querySelector('[data-card-details-action="submit"]'));
      else {
        sandboxWorkflow('billing', 'card.failed');
        hide(card);
        openCardError(event.target.querySelector('[data-card-details-action="submit"]'));
      }
    }
  });
  document.addEventListener('nebula:alternate-payment-method-requested', (event) => {
    if (event.target === paymentError) { sandboxWorkflow('billing', 'order.review'); hide(paymentError); openReview(event.target.querySelector('[data-payment-error-action="alternate"]')); }
  });
  ['nebula:wallet-payment-intent-requested', 'nebula:saved-payment-method-intent-requested', 'nebula:payment-method-chooser-requested'].forEach((eventName) => {
    document.addEventListener(eventName, (event) => {
      if (event.target !== cardError) return;
      sandboxWorkflow('billing', 'order.review');
      hide(cardError);
      openReview(event.target.querySelector('[data-card-error-action="chooser"]'));
    });
  });
  ['nebula:checkout-review-dismissed', 'nebula:card-details-dismissed', 'nebula:card-payment-error-dismissed', 'nebula:payment-error-dismissed'].forEach((eventName) => {
    document.addEventListener(eventName, (event) => {
      if (flow.contains(event.target)) closeAll();
    });
  });

  // Billing owns the local hand-off between the already-rendered C76 panels.
  // It intentionally intercepts only fixture actions and never submits data to a provider.
  document.addEventListener('click', (event) => {
    const action = event.target.closest('[data-checkout-action="submit"], [data-card-details-action="submit"], [data-card-error-action="chooser"], [data-payment-error-action="alternate"]');
    if (!action || !flow.contains(action)) return;
    const owner = action.closest('[data-nebula-checkout-review], [data-nebula-card-details], [data-nebula-card-error], [data-nebula-payment-error]');
    if (!owner) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (owner === review) {
      const active = review.querySelector('[role="radio"][aria-checked="true"]');
      hide(review);
      if (active?.dataset.methodType === 'credit_card') {
        sandboxWorkflow('billing', 'card.details');
        openCard(active);
      } else {
        sandboxWorkflow('billing', 'payment.failed');
        openPaymentError(active);
      }
    } else if (owner === card) {
      if (flow.dataset.flowContext === 'psychics-paid-chat') completePsychicsPaidChat(action);
      else {
        sandboxWorkflow('billing', 'card.failed');
        hide(card);
        openCardError(action);
      }
    } else if (owner === cardError) {
      sandboxWorkflow('billing', 'order.review');
      hide(cardError);
      openReview(action);
    } else if (owner === paymentError) {
      sandboxWorkflow('billing', 'order.review');
      hide(paymentError);
      openReview(action);
    }
  }, true);
})();
