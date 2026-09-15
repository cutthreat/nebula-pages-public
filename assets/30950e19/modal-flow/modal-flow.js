/* Exact C76 partial mount bridge; published from a dedicated AssetBundle source path. */
(function () {
  'use strict';

  var registry = document.querySelector('[data-nebula-modal-flow]');
  if (!registry) return;

  var launcher = registry.querySelector('[data-flow-launcher]');
  var launcherToggle = registry.querySelector('[data-flow-launcher-toggle]');
  var reopen = registry.querySelector('[data-flow-launcher-reopen]');
  var mount = registry.querySelector('[data-flow-mount]');
  var live = registry.querySelector('[data-flow-live]');
  var chatroom = document.querySelector('[data-nebula-chatroom]');
  var fixtureConsole = document.querySelector('[data-nebula-fixture-console]');
  var selectedState = registry.dataset.selectedState || '';
  var selectedLink = launcher && launcher.querySelector('[aria-current="page"]');
  var scenarioRoot = mount && mount.firstElementChild;
  var scenarioFrame = scenarioRoot && Array.prototype.find.call(scenarioRoot.children, function (child) {
    return child.hidden;
  });
  var closing = false;
  var previousOverflow = '';
  var fixtureConsoleWasHidden = true;
  var chatDetailsPrepared = false;
  var observer = null;

  function announce(message) {
    if (live) live.textContent = message;
  }

  function setLauncherState(launcherVisible, reopenVisible) {
    if (!launcher || !reopen) return;
    launcher.hidden = !launcherVisible;
    reopen.hidden = !reopenVisible;
    launcher.inert = !launcherVisible;
    reopen.inert = !reopenVisible;
  }

  function lockBackground() {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.classList.add('nebula-modal-open', 'c76-modal-flow-open');
    if (chatroom) {
      chatroom.inert = true;
      chatroom.setAttribute('aria-hidden', 'true');
    }
    if (fixtureConsole) {
      fixtureConsoleWasHidden = fixtureConsole.hidden;
      fixtureConsole.hidden = true;
      fixtureConsole.inert = true;
      fixtureConsole.setAttribute('aria-hidden', 'true');
    }
  }

  function unlockBackground(options) {
    if (closing) return;
    closing = true;
    options = options || {};
    document.body.style.overflow = previousOverflow;
    document.documentElement.classList.remove('nebula-modal-open', 'c76-modal-flow-open');
    if (chatroom) {
      chatroom.inert = false;
      chatroom.removeAttribute('aria-hidden');
    }
    if (fixtureConsole) {
      fixtureConsole.hidden = fixtureConsoleWasHidden;
      fixtureConsole.inert = false;
      fixtureConsole.removeAttribute('aria-hidden');
    }
    if (scenarioRoot && options.hide !== false) scenarioRoot.hidden = true;
    if (scenarioFrame && options.hide !== false) scenarioFrame.hidden = true;
    if (observer) observer.disconnect();
    if (mount) delete mount.dataset.flowMounted;
    setLauncherState(true, false);
    announce('C76 source state closed. No backend state was changed.');
    if (selectedLink && typeof selectedLink.focus === 'function') selectedLink.focus();
    try {
      var url = new URL(window.location.href);
      url.searchParams.delete('modal');
      window.history.replaceState({}, '', url.toString());
    } catch (error) {
      // URL cleanup is progressive enhancement only.
    }
    closing = false;
  }

  function focusScenario() {
    if (!scenarioRoot) return;
    var target = scenarioRoot.querySelector('[role="dialog"] h1,[role="dialog"] h2,[role="dialog"] [tabindex="-1"],button[aria-label*="Close" i],button[aria-label*="Dismiss" i]');
    if (!target) return;
    if (!target.hasAttribute('tabindex') && !target.matches('button,input,textarea,select,a[href]')) {
      target.setAttribute('tabindex', '-1');
    }
    target.focus({preventScroll: true});
  }

  function activeDialog() {
    if (!scenarioRoot || scenarioRoot.hidden) return null;
    return Array.prototype.find.call(scenarioRoot.querySelectorAll('[role="dialog"]'), function (dialog) {
      return !dialog.hidden && dialog.getClientRects().length > 0;
    }) || null;
  }

  function focusableElements(dialog) {
    if (!dialog) return [];
    return Array.prototype.filter.call(dialog.querySelectorAll(
      'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
    ), function (element) {
      return !element.hidden && element.getClientRects().length > 0 && element.getAttribute('aria-hidden') !== 'true';
    });
  }

  function showExactScenario() {
    if (!scenarioRoot) {
      announce('The selected C76 state did not render because its authoritative fixture contract failed closed.');
      return;
    }
    setLauncherState(false, false);
    lockBackground();
    scenarioRoot.hidden = false;
    if (scenarioFrame) scenarioFrame.hidden = false;
    mount.dataset.flowMounted = 'true';
    scenarioRoot.dataset.modalFlowMounted = 'true';
    announce('Exact C76 state ' + selectedState + ' opened from its Yii2 partial.');
    observer = new MutationObserver(function () {
      if (scenarioRoot.hidden || (scenarioFrame && scenarioFrame.hidden)) {
        unlockBackground({hide: false});
      }
    });
    observer.observe(scenarioRoot, {attributes: true, attributeFilter: ['hidden']});
    if (scenarioFrame) observer.observe(scenarioFrame, {attributes: true, attributeFilter: ['hidden']});
    window.requestAnimationFrame(focusScenario);
  }

  function showChatDetails(attempt) {
    attempt = attempt || 0;
    var opener = chatroom && chatroom.querySelector('[data-action="open-expert-details"]');
    var dialog = chatroom && chatroom.querySelector('[data-expert-details-modal]');
    var ownerReady = chatroom && chatroom.dataset.chatOverlaysReady === 'true';
    if ((!opener || !dialog || !ownerReady) && attempt < 400) {
      window.setTimeout(function () { showChatDetails(attempt + 1); }, 25);
      return;
    }
    if (!opener || !dialog || !ownerReady) {
      announce('The mounted chat expert-details owner is unavailable after the bounded owner wait.');
      setLauncherState(true, false);
      return;
    }
    setLauncherState(false, false);
    if (fixtureConsole && !chatDetailsPrepared) {
      fixtureConsoleWasHidden = fixtureConsole.hidden;
      fixtureConsole.hidden = true;
      fixtureConsole.inert = true;
      fixtureConsole.setAttribute('aria-hidden', 'true');
      chatDetailsPrepared = true;
    }
    opener.click();
    window.setTimeout(function verifyOpen() {
      if (dialog.hidden && attempt < 400) {
        showChatDetails(attempt + 1);
        return;
      }
      if (dialog.hidden) {
        announce('The Chatroom owner did not open expert details within the bounded wait.');
        if (fixtureConsole) {
          fixtureConsole.hidden = fixtureConsoleWasHidden;
          fixtureConsole.inert = false;
          fixtureConsole.removeAttribute('aria-hidden');
        }
        setLauncherState(true, false);
        return;
      }
      announce('Chat expert details opened through the normal Chatroom owner.');
      observer = new MutationObserver(function () {
        if (!dialog.hidden) return;
        if (observer) observer.disconnect();
        if (fixtureConsole) {
          fixtureConsole.hidden = fixtureConsoleWasHidden;
          fixtureConsole.inert = false;
          fixtureConsole.removeAttribute('aria-hidden');
        }
        setLauncherState(true, false);
        if (selectedLink && typeof selectedLink.focus === 'function') selectedLink.focus();
        try {
          var url = new URL(window.location.href);
          url.searchParams.delete('modal');
          window.history.replaceState({}, '', url.toString());
        } catch (error) {
          // URL cleanup is progressive enhancement only.
        }
      });
      observer.observe(dialog, {attributes: true, attributeFilter: ['hidden']});
    }, 25);
  }

  function isDismissControl(target) {
    return Boolean(target.closest(
      '[data-picker-action="close"],' +
      '[data-trial-picker-action="close"],' +
      '[data-expert-details-action="close"],' +
      '[data-expert-details-action="back"],' +
      '[data-unavailable-action="close"],' +
      '[data-balance-action="dismiss"],' +
      '[data-funding-action="dismiss"],' +
      '[data-funding-action="back"],' +
      '[data-continuation-action="dismiss"],' +
      '[data-checkout-action="dismiss"],' +
      '[data-card-details-action="dismiss"],' +
      '[data-card-error-action="dismiss"],' +
      '[data-payment-error-action="dismiss"],' +
      '[data-discount-action="dismiss"],' +
      '[data-one-click-action="dismiss"],' +
      '[data-reconnect-action="dismiss"],' +
      '[data-offer-action="dismiss"],' +
      '[data-completed-action="dismiss"],' +
      '[data-completed-action="return"],' +
      '[data-review-action="dismiss"],' +
      '[data-notify-action="dismiss"],' +
      '.empty__close,.endstay__close,.delivery__close'
    ));
  }

  if (launcherToggle) {
    launcherToggle.addEventListener('click', function () {
      setLauncherState(false, true);
      reopen.focus();
    });
  }

  if (reopen) {
    reopen.addEventListener('click', function () {
      setLauncherState(true, false);
      if (launcherToggle) launcherToggle.focus();
    });
  }

  registry.addEventListener('click', function (event) {
    if (!scenarioRoot || !scenarioRoot.contains(event.target)) return;
    if (event.target === scenarioRoot || event.target === scenarioFrame || isDismissControl(event.target)) {
      window.setTimeout(function () {
        if (!scenarioRoot.hidden) unlockBackground();
      }, 0);
    }
  });

  document.addEventListener('keydown', function (event) {
    if (!scenarioRoot || scenarioRoot.hidden) return;
    if (event.key === 'Tab') {
      var dialog = activeDialog();
      var focusables = focusableElements(dialog);
      if (!dialog || !focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (!dialog.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
      return;
    }
    if (event.key !== 'Escape') return;
    event.preventDefault();
    window.setTimeout(function () {
      if (!scenarioRoot.hidden) unlockBackground();
    }, 0);
  });

  if (selectedState === 'chat-details') {
    window.requestAnimationFrame(showChatDetails);
  } else if (selectedState && mount) {
    window.requestAnimationFrame(showExactScenario);
  }
}());
