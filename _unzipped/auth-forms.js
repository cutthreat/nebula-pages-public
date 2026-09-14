/* Frontend state boundary: figma-manifest/truth-packets/auth-account-entry-state-handoff-2026-07-28.json.
 * No transport, credential storage, automatic success or inferred redirect.
 */
(() => {
  'use strict';
  if (window.NebulaAuth) return;
  const states = new WeakMap();
  let adapter = null;
  let nextFormId = 0;
  let nextRequestId = 0;
  const unavailable = 'This preview does not submit your information. This action requires the connected service.';
  const unknown = 'The result is not confirmed. Please wait for the service to check before trying again.';

  function controls(form) {
    return [...form.querySelectorAll('input, select, textarea, button')];
  }

  function status(form, message, focus = false) {
    const output = form.querySelector('[data-auth-status]');
    output.textContent = message;
    output.hidden = !message;
    if (focus) output.focus();
  }

  function unlock(form) {
    const state = states.get(form);
    state.disabled?.forEach(([element, disabled]) => {element.disabled = disabled;});
    state.disabled = null;
    form.setAttribute('aria-busy', 'false');
  }

  function clearErrors(form) {
    controls(form).forEach(field => {
      field.setCustomValidity?.('');
      field.removeAttribute('aria-invalid');
    });
  }

  function validate(form) {
    clearErrors(form);
    const email = form.elements.namedItem('email');
    if (email) email.value = email.value.trim();
    const name = form.elements.namedItem('name');
    if (name && !name.value.trim()) name.setCustomValidity('Please enter your name.');
    const password = form.elements.namedItem('password');
    const confirmation = form.elements.namedItem('password_confirmation');
    if (confirmation && confirmation.value && confirmation.value !== password.value) {
      confirmation.setCustomValidity('The passwords do not match.');
    }
    const invalid = controls(form).filter(field => field.willValidate && !field.validity.valid);
    invalid.forEach(field => field.setAttribute('aria-invalid', 'true'));
    if (!invalid.length) return true;
    status(form, invalid[0].validationMessage);
    invalid[0].focus();
    invalid[0].reportValidity();
    form.dataset.authState = 'invalid';
    return false;
  }

  function result(form, response, version) {
    const state = states.get(form);
    if (!state || version !== state.version || !['pending', 'unknown'].includes(form.dataset.authState)) return;
    state.version += 1;
    if (!response || !['invalid', 'unavailable', 'accepted'].includes(response.status)) {
      form.dataset.authState = 'unknown';
      form.setAttribute('aria-busy', 'false');
      status(form, unknown, true);
      return;
    }
    if (response.status === 'accepted') {
      form.querySelectorAll('input[type="password"]').forEach(field => {field.value = '';});
      form.dataset.authState = 'accepted';
      form.setAttribute('aria-busy', 'false');
      status(form, 'The service has responded. Waiting for the next step.', true);
      const nextUrl = form.querySelector('[data-auth-submit][data-auth-success-url]')?.dataset.authSuccessUrl || null;
      form.dispatchEvent(new CustomEvent('nebula:auth:accepted', {bubbles: true, detail: {intent: state.intent, requestId: state.requestId, result: response, nextUrl}}));
      return;
    }
    unlock(form);
    form.dataset.authState = response.status;
    if (response.status === 'unavailable') {
      status(form, unavailable, true);
      return;
    }
    // An authoritative rejection invalidates credentials; non-secret fields remain.
    form.querySelectorAll('input[type="password"]').forEach(field => {field.value = '';});
    let firstInvalid = null;
    for (const [key, message] of Object.entries(response.fieldErrors || {})) {
      const field = form.elements.namedItem(key);
      if (!(field instanceof HTMLElement) || typeof field.setCustomValidity !== 'function' || typeof message !== 'string') continue;
      field.setCustomValidity(message);
      field.setAttribute('aria-invalid', 'true');
      firstInvalid ||= field;
    }
    const message = firstInvalid?.validationMessage || (typeof response.message === 'string' && response.message) || 'Please check your information and try again.';
    status(form, message, !firstInvalid);
    if (firstInvalid) {firstInvalid.focus(); firstInvalid.reportValidity();}
  }

  function submit(form, intent, validateFields) {
    const state = states.get(form);
    if (['pending', 'unknown', 'accepted'].includes(form.dataset.authState)) return;
    if (validateFields && !validate(form)) return;
    if (!adapter) {
      form.dataset.authState = 'unavailable';
      status(form, unavailable, true);
      return;
    }
    const activeAdapter = adapter;
    const unbound = new Set([...form.querySelectorAll('[data-auth-unbound][name]')].map(field => field.name));
    const fields = validateFields ? Object.fromEntries([...new FormData(form)].filter(([name]) => !unbound.has(name))) : {};
    const version = ++state.version;
    const requestId = ++nextRequestId;
    state.requestId = requestId;
    state.intent = intent;
    state.disabled = controls(form).map(field => [field, field.disabled]);
    state.disabled.forEach(([field]) => {field.disabled = true;});
    form.dataset.authState = 'pending';
    form.setAttribute('aria-busy', 'true');
    status(form, 'Please wait. Your request is being processed.', true);
    // An adapter rejection has an unknown outcome: never unlock blindly for a duplicate request.
    Promise.resolve().then(() => activeAdapter.submit({intent, fields, requestId})).then(
      response => result(form, response, version),
      () => result(form, null, version)
    ).finally(() => {Object.keys(fields).forEach(key => {delete fields[key];});});
  }

  function mount(root = document) {
    const forms = root.matches?.('[data-auth-form]') ? [root] : root.querySelectorAll('[data-auth-form]');
    forms.forEach(form => {
      if (states.has(form)) return;
      states.set(form, {version: 0, disabled: null, intent: form.dataset.authForm});
      form.dataset.authState = 'idle';
      form.noValidate = true;
      form.setAttribute('aria-busy', 'false');
      const output = document.createElement('p');
      output.id = `auth-form-status-${++nextFormId}`;
      output.className = 'auth-form-status';
      output.dataset.authStatus = '';
      output.setAttribute('role', 'status');
      output.setAttribute('aria-live', 'polite');
      output.setAttribute('aria-atomic', 'true');
      output.tabIndex = 0;
      output.hidden = true;
      form.append(output);
      controls(form).filter(field => field.name).forEach(field => {
        field.setAttribute('aria-describedby', [field.getAttribute('aria-describedby'), output.id].filter(Boolean).join(' '));
      });
      form.addEventListener('submit', event => {event.preventDefault(); submit(form, form.dataset.authForm, true);});
      form.addEventListener('pointerdown', event => {
        if (['pending', 'unknown', 'accepted'].includes(form.dataset.authState) && event.target.closest('[disabled]')) {
          event.preventDefault();
          output.focus();
        }
      }, true);
      form.querySelectorAll('[data-auth-social]').forEach(button => {
        button.addEventListener('click', event => {event.preventDefault(); submit(form, button.dataset.authSocial, false);});
        button.disabled = false;
      });
      form.addEventListener('input', event => {
        if (['pending', 'unknown', 'accepted'].includes(form.dataset.authState)) return;
        event.target.setCustomValidity?.('');
        event.target.removeAttribute('aria-invalid');
        const confirmation = form.elements.namedItem('password_confirmation');
        if (event.target.name === 'password' && confirmation) {
          confirmation.setCustomValidity('');
          confirmation.removeAttribute('aria-invalid');
        }
        form.dataset.authState = 'idle';
        status(form, '');
      });
      form.querySelector('[data-auth-submit]').disabled = false;
    });
  }

  window.NebulaAuth = Object.freeze({
    mount,
    setAdapter(value) {
      if (value !== null && typeof value?.submit !== 'function') throw new TypeError('Auth adapter must implement submit.');
      adapter = value;
    },
    resolve(form, response, requestId) {
      const state = states.get(form);
      if (state && requestId === state.requestId) result(form, response, state.version);
    }
  });
  mount();
})();
