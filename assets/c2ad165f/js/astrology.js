(() => {
  'use strict';

  const root = document.querySelector('[data-nebula-astrology-profile]');
  if (!root) return;

  const status = root.querySelector('[data-astrology-status]');
  const timers = new WeakMap();
  const specs = {
    date: {
      validate: (value) => {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
        const [year, month, day] = value.split('-').map(Number);
        const date = new Date(Date.UTC(year, month - 1, day));
        return year >= 1900 && year <= new Date().getUTCFullYear() && date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
      },
      message: 'Enter a valid date in YYYY-MM-DD format.',
    },
    place: {
      validate: (value) => value.length >= 2 && value.length <= 100,
      message: 'Enter a place of birth between 2 and 100 characters.',
    },
    time: {
      validate: (value) => {
        const match = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value);
        if (!match) return false;
        const hours = Number(match[1]);
        const minutes = Number(match[2]);
        const seconds = match[3] === undefined ? 0 : Number(match[3]);
        return hours <= 23 && minutes <= 59 && seconds <= 59;
      },
      message: 'Enter a valid time in HH:MM or HH:MM:SS format.',
    },
  };

  const announce = (message) => { if (status) status.textContent = message; };
  const emit = (name, detail) => root.dispatchEvent(new CustomEvent(name, { bubbles: true, detail }));

  const clearCheckTimer = (row) => {
    const timer = timers.get(row);
    if (timer) window.clearTimeout(timer);
    timers.delete(row);
  };

  const setCheck = (row, visible, timed = false) => {
    const check = row.querySelector('[data-astrology-check]');
    if (!check) return;
    clearCheckTimer(row);
    check.hidden = !visible;
    check.setAttribute('aria-hidden', visible ? 'false' : 'true');
    if (visible && timed) {
      timers.set(row, window.setTimeout(() => {
        check.hidden = true;
        check.setAttribute('aria-hidden', 'true');
        row.classList.remove('is-valid');
        const edit = row.querySelector('[data-astrology-edit]');
        if (edit && !row.classList.contains('is-editing')) edit.hidden = false;
      }, 5000));
    }
  };

  const clearInvalid = (row) => {
    const input = row.querySelector('[data-astrology-input]');
    const error = row.querySelector('[data-astrology-error]');
    row.classList.remove('is-invalid');
    if (input) input.setAttribute('aria-invalid', 'false');
    if (error) { error.textContent = ''; error.hidden = true; }
  };

  const resultFor = (row) => {
    const key = row.dataset.field || '';
    const value = (row.querySelector('[data-astrology-input]')?.value || '').trim();
    const spec = specs[key];
    return { key, value, valid: Boolean(spec?.validate(value)), message: spec?.message || 'Enter a valid value.' };
  };

  const setInvalid = (row, result) => {
    const input = row.querySelector('[data-astrology-input]');
    const error = row.querySelector('[data-astrology-error]');
    row.classList.add('is-invalid');
    row.classList.remove('is-valid');
    if (input) input.setAttribute('aria-invalid', 'true');
    if (error) { error.textContent = result.message; error.hidden = false; }
    setCheck(row, false);
    announce(`${row.querySelector('strong')?.textContent || 'Field'} is invalid. The value was not saved.`);
    emit('nebula:astrology-validation', {
      field: result.key, value: result.value, valid: false, backendRequired: true,
      profileMutation: false, saved: false, staticProjection: true,
    });
  };

  const finishEdit = (row, result) => {
    const display = row.querySelector('[data-astrology-display]');
    const input = row.querySelector('[data-astrology-input]');
    const edit = row.querySelector('[data-astrology-edit]');
    if (!display || !input || !edit) return;
    row.dataset.value = result.value;
    display.textContent = result.value;
    input.hidden = true;
    display.hidden = false;
    edit.hidden = true;
    edit.setAttribute('aria-pressed', 'false');
    row.classList.remove('is-editing', 'is-invalid');
    row.classList.add('is-valid');
    input.setAttribute('aria-invalid', 'false');
    clearInvalid(row);
    setCheck(row, true, true);
    announce(`${row.querySelector('strong')?.textContent || 'Field'} is valid locally. Saving requires the profile host.`);
    emit('nebula:astrology-validation', {
      field: result.key, value: result.value, valid: true, backendRequired: true,
      profileMutation: false, saved: false, staticProjection: true,
    });
  };

  const commit = (row) => {
    const result = resultFor(row);
    if (!result.valid) {
      setInvalid(row, result);
      row.querySelector('[data-astrology-input]')?.focus();
      return false;
    }
    finishEdit(row, result);
    return true;
  };

  const cancel = (row) => {
    const input = row.querySelector('[data-astrology-input]');
    const display = row.querySelector('[data-astrology-display]');
    const edit = row.querySelector('[data-astrology-edit]');
    if (!input || !display || !edit) return;
    clearCheckTimer(row);
    input.value = row.dataset.value || '';
    input.hidden = true;
    display.hidden = false;
    edit.hidden = false;
    edit.textContent = 'Edit';
    edit.setAttribute('aria-pressed', 'false');
    row.classList.remove('is-editing', 'is-invalid', 'is-valid');
    clearInvalid(row);
    setCheck(row, false);
    announce(`${row.querySelector('strong')?.textContent || 'Field'} edit cancelled.`);
  };

  const startEdit = (row) => {
    const input = row.querySelector('[data-astrology-input]');
    const display = row.querySelector('[data-astrology-display]');
    const edit = row.querySelector('[data-astrology-edit]');
    if (!input || !display || !edit) return;
    clearCheckTimer(row);
    setCheck(row, false);
    clearInvalid(row);
    row.classList.remove('is-valid');
    row.classList.add('is-editing');
    input.value = row.dataset.value || '';
    input.hidden = false;
    display.hidden = true;
    edit.hidden = false;
    edit.textContent = 'Save';
    edit.setAttribute('aria-pressed', 'true');
    input.focus();
    input.select?.();
    announce(`${row.querySelector('strong')?.textContent || 'Field'} is ready for editing. Enter a valid value and choose Save.`);
    emit('nebula:astrology-edit-required', {
      field: row.dataset.field || '', backendRequired: true, profileMutation: false,
      saved: false, staticProjection: true,
    });
  };

  root.querySelectorAll('[data-astrology-row]').forEach((row) => {
    const edit = row.querySelector('[data-astrology-edit]');
    const input = row.querySelector('[data-astrology-input]');
    if (!edit || !input) return;
    edit.addEventListener('click', () => { if (row.classList.contains('is-editing')) commit(row); else startEdit(row); });
    edit.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); if (row.classList.contains('is-editing')) commit(row); else startEdit(row); }
    });
    input.addEventListener('input', () => {
      if (!row.classList.contains('is-editing')) return;
      const result = resultFor(row);
      if (result.valid) clearInvalid(row);
      else if (row.classList.contains('is-invalid')) setInvalid(row, result);
    });
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') { event.preventDefault(); commit(row); }
      if (event.key === 'Escape') { event.preventDefault(); cancel(row); edit.focus(); }
    });
  });
})();
