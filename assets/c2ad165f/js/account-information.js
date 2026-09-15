(() => {
  'use strict';

  const root = document.querySelector('[data-nebula-account-information]');
  if (!root) return;

  const status = root.querySelector('[data-account-information-status]');
  const timers = new WeakMap();
  let activeRow = null;
  const specs = {
    password: {
      validate: (value) => value.length >= 8 && /[A-Za-zА-Яа-я]/.test(value) && /\d/.test(value),
      message: 'Password must contain at least 8 characters, a letter and a number.',
    },
    nickname: {
      validate: (value) => value.length >= 2 && value.length <= 32 && /^[\p{L}\p{N}][\p{L}\p{N} ._-]*$/u.test(value),
      message: 'Nickname must be 2–32 characters and use letters, numbers, spaces, dots, dashes or underscores.',
    },
    phone: {
      validate: (value) => {
        const digits = value.replace(/\D/g, '');
        return /^\+?[0-9 ()-]+$/.test(value) && digits.length >= 10 && digits.length <= 15;
      },
      message: 'Enter a valid phone number with 10–15 digits.',
    },
    email: {
      validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value),
      message: 'Enter a valid email address.',
    },
    language: {
      validate: (value) => /^[\p{L}][\p{L} -]{1,29}$/u.test(value),
      message: 'Enter a language name using letters only.',
    },
  };

  const announce = (message) => {
    if (status) status.textContent = message;
  };

  const emit = (name, detail) => {
    root.dispatchEvent(new CustomEvent(name, { bubbles: true, detail }));
  };

  const clearCheckTimer = (row) => {
    const timer = timers.get(row);
    if (timer) window.clearTimeout(timer);
    timers.delete(row);
  };

  const setCheck = (row, visible, timed = false) => {
    const check = row.querySelector('[data-account-information-check]');
    if (!check) return;
    clearCheckTimer(row);
    check.hidden = !visible;
    check.setAttribute('aria-hidden', visible ? 'false' : 'true');
    if (visible && timed) {
      timers.set(row, window.setTimeout(() => {
        check.hidden = true;
        check.setAttribute('aria-hidden', 'true');
        row.classList.remove('is-confirmed-state');
        const edit = row.querySelector('[data-account-information-edit]');
        if (edit && !row.classList.contains('is-editing')) edit.hidden = false;
      }, 5000));
    }
  };

  const setInvalid = (row, message) => {
    const input = row.querySelector('[data-account-information-input]');
    const error = row.querySelector('[data-account-information-error]');
    row.classList.add('is-invalid');
    row.classList.remove('is-valid');
    if (input) input.setAttribute('aria-invalid', 'true');
    if (error) {
      error.textContent = message;
      error.hidden = false;
    }
    setCheck(row, false);
    announce(`${row.querySelector('strong')?.textContent || 'Field'} is invalid. The value was not saved.`);
  };

  const clearInvalid = (row) => {
    const input = row.querySelector('[data-account-information-input]');
    const error = row.querySelector('[data-account-information-error]');
    row.classList.remove('is-invalid');
    if (input) input.setAttribute('aria-invalid', 'false');
    if (error) {
      error.textContent = '';
      error.hidden = true;
    }
  };

  const resultFor = (row) => {
    const key = row.dataset.field || '';
    const input = row.querySelector('[data-account-information-input]');
    const value = (input?.value || '').trim();
    const spec = specs[key];
    return { key, value, valid: Boolean(spec?.validate(value)), message: spec?.message || 'Enter a valid value.' };
  };

  const finishEdit = (row, result) => {
    const display = row.querySelector('[data-account-information-display]');
    const input = row.querySelector('[data-account-information-input]');
    const edit = row.querySelector('[data-account-information-edit]');
    if (!display || !input || !edit) return;

    row.dataset.value = result.value;
    display.textContent = row.dataset.field === 'password' ? '• • • • • • • •' : result.value;
    input.hidden = true;
    display.hidden = false;
    edit.textContent = 'Edit';
    edit.setAttribute('aria-pressed', 'false');
    edit.hidden = true;
    row.classList.remove('is-editing', 'is-invalid');
    row.classList.add('is-valid', 'is-confirmed-state');
    if (activeRow === row) activeRow = null;
    input.setAttribute('aria-invalid', 'false');
    const error = row.querySelector('[data-account-information-error]');
    if (error) { error.textContent = ''; error.hidden = true; }
    setCheck(row, true, true);
    announce(`${row.querySelector('strong')?.textContent || 'Field'} is valid locally. Saving requires the identity host.`);
    emit('nebula:account-information-validation', {
      field: result.key,
      value: result.value,
      valid: true,
      backendRequired: true,
      profileMutation: false,
      saved: false,
      staticProjection: true,
    });
  };

  const commit = (row) => {
    const result = resultFor(row);
    if (!result.valid) {
      setInvalid(row, result.message);
      row.querySelector('[data-account-information-input]')?.focus();
      emit('nebula:account-information-validation', {
        field: result.key,
        value: result.value,
        valid: false,
        backendRequired: true,
        profileMutation: false,
        saved: false,
        staticProjection: true,
      });
      return false;
    }
    finishEdit(row, result);
    return true;
  };

  const cancel = (row, announceResult = true) => {
    const input = row.querySelector('[data-account-information-input]');
    const display = row.querySelector('[data-account-information-display]');
    const edit = row.querySelector('[data-account-information-edit]');
    if (!input || !display || !edit) return;
    clearCheckTimer(row);
    input.value = row.dataset.field === 'password' ? '' : (row.dataset.value || '');
    input.hidden = true;
    display.hidden = false;
    edit.hidden = false;
    edit.textContent = 'Edit';
    edit.setAttribute('aria-pressed', 'false');
    row.classList.remove('is-editing', 'is-invalid', 'is-valid');
    clearInvalid(row);
    if (activeRow === row) activeRow = null;
    if (announceResult) announce(`${row.querySelector('strong')?.textContent || 'Field'} edit cancelled.`);
  };

  const startEdit = (row) => {
    const input = row.querySelector('[data-account-information-input]');
    const display = row.querySelector('[data-account-information-display]');
    const edit = row.querySelector('[data-account-information-edit]');
    if (!input || !display || !edit) return;
    if (activeRow && activeRow !== row) cancel(activeRow, false);
    activeRow = row;
    clearCheckTimer(row);
    setCheck(row, false);
    clearInvalid(row);
    row.classList.remove('is-valid');
    row.classList.add('is-editing');
    input.value = row.dataset.field === 'password' ? '' : (row.dataset.value || '');
    input.hidden = false;
    display.hidden = true;
    edit.hidden = false;
    edit.textContent = 'Save';
    edit.setAttribute('aria-pressed', 'true');
    input.focus();
    input.select?.();
    const field = row.querySelector('strong')?.textContent || row.dataset.field || 'Field';
    announce(`${field} is ready for editing. Enter a valid value and choose Save.`);
    emit('nebula:account-information-edit-required', {
      field: row.dataset.field || '',
      backendRequired: true,
      profileMutation: false,
      saved: false,
      staticProjection: true,
    });
  };

  root.querySelectorAll('[data-account-information-row]').forEach((row) => {
    const edit = row.querySelector('[data-account-information-edit]');
    const input = row.querySelector('[data-account-information-input]');
    const initiallyConfirmed = row.dataset.initialConfirmed === 'true';
    if (initiallyConfirmed) {
      edit.hidden = true;
      row.classList.add('is-valid');
      setCheck(row, true, true);
    }
    edit.addEventListener('click', () => {
      if (row.classList.contains('is-editing')) commit(row);
      else startEdit(row);
    });
    edit.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (row.classList.contains('is-editing')) commit(row);
        else startEdit(row);
      }
    });
    input.addEventListener('input', () => {
      if (!row.classList.contains('is-editing')) return;
      const result = resultFor(row);
      if (result.valid) {
        clearInvalid(row);
        row.classList.add('is-valid');
        setCheck(row, true, true);
      } else {
        row.classList.remove('is-valid');
        setCheck(row, false);
        if (row.classList.contains('is-invalid')) setInvalid(row, result.message);
      }
    });
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') { event.preventDefault(); commit(row); }
      if (event.key === 'Escape') { event.preventDefault(); cancel(row); edit.focus(); }
    });
  });
})();
