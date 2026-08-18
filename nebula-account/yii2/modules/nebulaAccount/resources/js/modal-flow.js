(function () {
  'use strict';
  var root = document.querySelector('[data-nebula-modal-flow]');
  if (!root) return;
  var launcher = root.querySelector('.c76-modal-flow__launcher');
  var reopen = root.querySelector('[data-flow-launcher-reopen]');
  var scrim = root.querySelector('[data-flow-scrim]');
  var dialog = root.querySelector('[data-flow-dialog]');
  var title = root.querySelector('[data-flow-title]');
  var kicker = root.querySelector('[data-flow-kicker]');
  var description = root.querySelector('[data-flow-description]');
  var body = root.querySelector('[data-flow-body]');
  var primary = root.querySelector('[data-flow-primary]');
  var back = root.querySelector('[data-flow-back]');
  var live = root.querySelector('[data-flow-live]');
  var status = root.querySelector('[data-flow-status]');
  var stack = [];
  var current = '';
  var opener = null;
  var previousOverflow = '';
  var selectedExpert = 'margo-lover';
  var selectedPackage = 'standard';
  var selectedMethod = 'paypal';

  var states = {
    question: ['Send a question', 'Before the consultation', 'Give Margo Lover enough context before the consultation begins.', 'Start chat', 'picker'],
    picker: ['We found psychics matching your request', 'Matching result', 'Choose an expert for your relationship consultation. Selection is local until the host confirms availability.', 'View details', 'details'],
    trial: ['Choose available psychic', '3 free minutes', 'Your selected expert is busy. Choose another online expert and keep the free-minute offer visible.', 'Start chat · 3 free minutes', 'connecting'],
    details: ['Learn more about Margo Lover', 'Expert profile', 'Review the selected expert before any payment or session request. Favorite and payment remain host intents.', 'Proceed to payment', 'checkout'],
    'chat-details': ['Margo Lover', 'Chat expert details', 'Open from the current chat header or avatar. Favorite and reviews remain local previews until the host confirms the thread snapshot.', 'Close details', 'chat-details'],
    unavailable: ['The Margo Lover is busy now', 'Availability branch', 'The selected expert is busy. Choose another expert, wait, or send a question in advance.', 'Select another expert', 'picker'],
    offline: ["Margo’s lover is currently offline", 'Availability branch', 'An expert match is unavailable right now. Choose another expert or ask the host to notify you.', 'Select another expert', 'picker'],
    'no-match': ['There are no experts online matching your request', 'Matching branch', 'Refine the selected topic or wait online. No match, presence or fallback is created locally.', 'Expand selection', 'question'],
    insufficient: ['Experience seamless conversations', 'Not enough credits to continue', 'The host must confirm balance pause, price and approved offer before any refill can happen.', 'Top up to start', 'topup-start'],
    'topup-start': ['Top up your balance to start chatting', 'Funding branch', 'Choose a package locally. The displayed catalog is a fixture and no payment is started.', 'Review order', 'checkout'],
    'topup-continue': ['Refill credits to continue chat', 'Funding branch', 'The consultation remains paused until the host confirms balance, package and resume capability.', 'Review order', 'checkout'],
    checkout: ['Order details', 'Checkout branch', 'Select a payment method preview. Buy emits a host intent only and never charges this fixture.', 'Buy · host intent only', 'payment-error'],
    'card-details': ['Order details', 'Card details', 'Complete the card fields locally. PCI validation, tokenization and charging belong to the host.', 'Buy · host intent only', 'card-error'],
    'payment-error': ['An error processing your order', 'Payment recovery', 'The order was not charged. Retry is a host intent and remains idempotency-gated.', 'Try another method', 'checkout'],
    'card-error': ['An error processing your order', 'Card payment recovery', 'The provider error is a fixture. Try another method or open the card-details preview.', 'Open card details preview', 'card-details'],
    discount: ['Refill credits for the reading', 'Discount offer', 'A host-approved campaign would be required for this price. Continue opens checkout intent only.', 'Continue', 'checkout'],
    'one-click': ["You’ve run out of credits", 'One-click top up', 'A saved payment method and idempotency key are required. This preview never charges.', 'Get 120 credits', 'checkout'],
    connecting: ['Connecting you to Margo Lover so you can get the answer to your question', 'Connection branch', 'Connection progress and session creation belong to the host. This is a static waiting state.', 'Show reconnect branch', 'reconnect'],
    reconnect: ['Contact with the expert has been lost', 'Reconnect grace', 'Charge is suspended only in an authoritative session snapshot. Wait or contact support; no local timer runs.', 'Wait for Margo Lover', 'connecting'],
    end: ['End consultation or stay', 'Active consultation', 'Confirm the next host action without ending a session locally.', 'Stay in chat', 'connecting'],
    followup: ['Get new insight from your previous chat', 'Follow-up offer', 'The expert follow-up offer must be supplied with an expiry and eligibility snapshot.', 'Accept · host intent', 'connecting'],
    completed: ['The consultation is complete!', 'Completion branch', 'Rate the completed consultation locally, then send a review intent to the host.', 'Rate consultation', 'review'],
    review: ["Rate Margo Lover’s consultation", 'Review branch', 'Draft a rating and review locally. Publishing and moderation remain host-owned.', 'Send review · host intent', 'completed'],
    notify: ['Choose where to be notified', 'Notification branch', 'Select a channel locally. Consent, endpoint verification and delivery require the notification host.', 'Continue', 'email'],
    email: ['Email notification', 'Delivery branch', 'Email is read-only in this preview. No address is edited or message sent.', 'Done · host intent', 'notify'],
    telegram: ['Telegram notification', 'Delivery branch', 'Telegram is read-only in this preview. No phone is edited or message sent.', 'Done · host intent', 'notify'],
    support: ['Help with consultation', 'Support branch', 'Draft a request locally. Submit is a host intent and does not create a ticket here.', 'Send request · host intent', 'support'],
    video: ['Video preview', 'Media branch', 'Poster-only source state. A real media URL, rights and player contract are still required.', 'Close preview', 'video']
  };

  function htmlFor(state) {
    if (state === 'question') return '<label>Subject<input value="Relationship reading" data-flow-input></label><label>Date of birth<input placeholder="Date of birth: 01.01.1990" data-flow-input></label><label>Detailed question<textarea data-flow-input>Tell the expert what you would like to understand.</textarea><button class="c76-modal-flow__choice-list" type="button" data-flow-local>📎 Attach a file if required</button>';
    if (state === 'picker' || state === 'trial') return '<div class="c76-modal-flow__choice-grid"><button class="c76-modal-flow__choice" aria-pressed="false" data-expert="medium-mark"><strong>Medium Mark</strong><small>Online · 4.8</small></button><button class="c76-modal-flow__choice is-selected" aria-pressed="true" data-expert="margo-lover"><strong>Margo Lover</strong><small>Online · 4.8</small></button><button class="c76-modal-flow__choice" aria-pressed="false" data-expert="victoriya"><strong>Victoriya</strong><small>Online · 4.7</small></button></div>' + (state === 'trial' ? '<p class="c76-modal-flow__notice">🪙 3 FREE MINUTES with a new psychic</p>' : '');
    if (state === 'details' || state === 'chat-details') return '<div class="c76-modal-flow__choice is-selected"><strong>Margo Lover · 4.8 ★</strong><small>Love &amp; Relationship expert · 10 years</small></div><div class="c76-modal-flow__choice-list"><button type="button" data-flow-local>♡ Add to favorites · local preview</button><button type="button" data-flow-local>View reviews · host intent</button></div>';
    if (state === 'topup-start' || state === 'topup-continue' || state === 'discount') return '<div class="c76-modal-flow__choice-list"><button class="is-selected" type="button" data-package="standard"><span>120 credits</span><b>$9.99</b></button><button type="button" data-package="plus"><span>350 credits</span><b>$24.99</b></button><button type="button" data-package="pro"><span>1800 credits</span><b>$99.99</b></button></div>';
    if (state === 'checkout') return '<div class="c76-modal-flow__choice-list"><button class="is-selected" type="button" data-method="paypal">PayPal <b>✓</b></button><button type="button" data-method="apple">Apple Pay</button><button type="button" data-method="card">Credit card · masked fixture</button></div><p class="c76-modal-flow__notice">Secure card fields and provider confirmation belong to the host.</p>';
    if (state === 'card-details') return '<div class="c76-modal-flow__choice-list"><button class="is-selected" type="button" data-method="card">Credit card · masked fixture</button></div><div class="c76-modal-flow__card-grid"><label>Validity period<input placeholder="MM/YY" data-flow-input inputmode="numeric"></label><label>CVV/CVC<input placeholder="•••" data-flow-input inputmode="numeric"></label></div><label>Name on the card<input placeholder="FULL NAME AS ON THE CARD" data-flow-input></label><p class="c76-modal-flow__notice">Guaranteed security payments · host checkout required.</p>';
    if (state === 'completed' || state === 'review') return '<div class="c76-modal-flow__stars" role="radiogroup" aria-label="Rating"><button type="button" data-rating="1">★</button><button type="button" data-rating="2">★</button><button type="button" data-rating="3">★</button><button type="button" data-rating="4">★</button><button type="button" data-rating="5">★</button></div>' + (state === 'review' ? '<textarea placeholder="Write a review" data-flow-input></textarea>' : '');
    if (state === 'notify') return '<div class="c76-modal-flow__choice-list"><button class="is-selected" type="button" data-channel="email">Email <b>verified fixture</b></button><button type="button" data-channel="telegram">Telegram <b>verified fixture</b></button><button type="button" data-channel="sms">SMS <b>verified fixture</b></button></div>';
    if (state === 'email' || state === 'telegram') return '<div class="c76-modal-flow__choice is-selected"><strong>' + (state === 'email' ? 'alexey@example.test' : '@nebula_fixture') + '</strong><small>Read-only endpoint fixture · not sent</small></div>';
    if (state === 'support') return '<label>Reason<textarea placeholder="Describe the issue" data-flow-input></textarea></label><label>Details<textarea data-flow-input></textarea></label>';
    if (state === 'video') return '<div class="c76-modal-flow__media"><div>Video poster · media source required</div></div>';
    return '<div class="c76-modal-flow__choice is-selected"><strong>' + (state === 'connecting' ? 'Margo Lover · waiting' : 'Host decision required') + '</strong><small>Fixture state · no lifecycle mutation</small></div>';
  }

  function emitIntent(action, next) {
    root.dispatchEvent(new CustomEvent('nebula:modal-flow-intent', {bubbles: true, detail: {fixtureOnly: true, backendCalled: false, persisted: false, action: action, state: current, nextState: next || current, paymentMutated: false, sessionMutated: false, deliveryClaimed: false}}));
  }

  function renderState(state) {
    var meta = states[state] || states.question;
    current = state;
    kicker.textContent = meta[1]; title.textContent = meta[0]; description.textContent = meta[2]; primary.textContent = meta[3]; body.innerHTML = htmlFor(state);
    back.hidden = stack.length === 0;
    live.textContent = meta[0] + '. Fixture preview only.';
    body.querySelectorAll('[data-expert]').forEach(function (button) { button.addEventListener('click', function () { selectedExpert = button.dataset.expert; body.querySelectorAll('[data-expert]').forEach(function (item) { var selected = item.dataset.expert === selectedExpert; item.classList.toggle('is-selected', selected); item.setAttribute('aria-pressed', selected ? 'true' : 'false'); }); emitIntent('select-expert-preview'); }); });
    body.querySelectorAll('[data-package]').forEach(function (button) { button.addEventListener('click', function () { selectedPackage = button.dataset.package; body.querySelectorAll('[data-package]').forEach(function (item) { item.classList.toggle('is-selected', item === button); }); emitIntent('select-package-preview'); }); });
    body.querySelectorAll('[data-method],[data-channel]').forEach(function (button) { button.addEventListener('click', function () { var selector = button.dataset.method ? '[data-method]' : '[data-channel]'; body.querySelectorAll(selector).forEach(function (item) { item.classList.toggle('is-selected', item === button); }); if (button.dataset.method) selectedMethod = button.dataset.method; emitIntent('select-option-preview'); }); });
    body.querySelectorAll('[data-rating]').forEach(function (button) { button.addEventListener('click', function () { var rating = Number(button.dataset.rating); body.querySelectorAll('[data-rating]').forEach(function (item) { item.classList.toggle('is-selected', Number(item.dataset.rating) <= rating); }); emitIntent('rate-preview'); }); });
  }

  function open(state, source) { opener = source || opener || launcher; stack = []; renderState(state); scrim.hidden = false; dialog.hidden = false; previousOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; var page = document.querySelector('[data-nebula-chatroom]'); if (page) { page.inert = true; page.setAttribute('aria-hidden', 'true'); } dialog.querySelector('[data-flow-close]').focus(); emitIntent('open'); }
  function close() { scrim.hidden = true; dialog.hidden = true; document.body.style.overflow = previousOverflow; var page = document.querySelector('[data-nebula-chatroom]'); if (page) { page.inert = false; page.removeAttribute('aria-hidden'); } if (opener && typeof opener.focus === 'function') opener.focus(); status.textContent = 'Fixture preview closed · no host was called'; emitIntent('dismiss'); }
  function go(next) { if (!next || next === current) { close(); return; } stack.push(current); emitIntent('transition', next); renderState(next); dialog.querySelector('[data-flow-close]').focus(); }

  function nextState() { if (current === 'notify') { var selected = body.querySelector('[data-channel].is-selected'); return selected && selected.dataset.channel !== 'sms' ? selected.dataset.channel : current; } if (current === 'checkout' && selectedMethod === 'card') return 'card-details'; return states[current] && states[current][4]; }
  root.addEventListener('click', function (event) { var openButton = event.target.closest('[data-flow-open]'); if (openButton) { open(openButton.dataset.flowOpen, openButton); return; } if (event.target.closest('[data-flow-launcher-toggle]')) { launcher.hidden = true; reopen.hidden = false; reopen.focus(); return; } if (event.target.closest('[data-flow-launcher-reopen]')) { launcher.hidden = false; reopen.hidden = true; launcher.querySelector('[data-flow-launcher-toggle]').focus(); return; } if (event.target.closest('[data-flow-close]') || event.target === scrim) { close(); return; } if (event.target.closest('[data-flow-primary]')) { go(nextState()); return; } if (event.target.closest('[data-flow-back]')) { var previous = stack.pop(); if (previous) { renderState(previous); emitIntent('back', previous); } else close(); return; } });
  document.addEventListener('click', function (event) { var consultation = event.target.closest('[data-consultation-control]'); if (!consultation || !dialog.hidden) { return; } event.preventDefault(); open('question', consultation); });
  document.addEventListener('keydown', function (event) { if (dialog.hidden) return; if (event.key === 'Escape') { event.preventDefault(); close(); } if (event.key === 'Tab') { var items = dialog.querySelectorAll('button:not([disabled]),input,textarea,select'); if (!items.length) return; var first = items[0], last = items[items.length - 1]; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } } });
}());
