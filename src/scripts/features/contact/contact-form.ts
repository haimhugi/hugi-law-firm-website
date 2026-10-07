import { requireChild } from '../../core/dom';
import type { FormSubmitter } from './form-submitter';
import { validateContact } from './validation';

export interface ContactCopy {
  nameRequired: string;
  phoneRequired: string;
  phoneInvalid: string;
  fixFields: string;
  label: string;
  pending: string;
  sent: string;
  success: string;
  rejected: string;
  timeout: string;
  offline: string;
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

export function initContactForm(
  form: HTMLFormElement,
  submitter: FormSubmitter,
  options: { timeoutMs: number; copy: ContactCopy },
): void {
  const submitButton = requireChild<HTMLButtonElement>(form, '#submitBtn');
  const status = requireChild<HTMLElement>(form, '#formMsg');
  const name = requireChild<HTMLInputElement>(form, '#fname');
  const phone = requireChild<HTMLInputElement>(form, '#fphone');
  const message = requireChild<HTMLInputElement>(form, '#fmsg');

  function showStatus(text: string, kind?: 'is-error' | 'is-ok'): void {
    status.textContent = text;
    status.classList.remove('is-error', 'is-ok');
    if (kind) status.classList.add(kind);
  }

  function setFieldError(input: HTMLInputElement, messageText: string): void {
    const error = document.getElementById(`${input.id}-error`);
    if (!error) return;
    if (messageText) {
      input.setAttribute('aria-invalid', 'true');
      error.textContent = messageText;
      error.hidden = false;
      return;
    }
    input.removeAttribute('aria-invalid');
    error.textContent = '';
    error.hidden = true;
  }

  function resetButton(): void {
    submitButton.textContent = options.copy.label;
    submitButton.disabled = false;
    submitButton.classList.remove('is-sent');
  }

  for (const input of [name, phone, message]) {
    input.addEventListener('input', () => {
      setFieldError(input, '');
      if (!submitButton.classList.contains('is-sent')) return;
      resetButton();
      showStatus('');
    });
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const errors = validateContact({ name: name.value, phone: phone.value }, options.copy);
    setFieldError(name, errors.name);
    setFieldError(phone, errors.phone);
    const invalid = errors.name ? name : errors.phone ? phone : null;
    if (invalid) {
      showStatus(options.copy.fixFields, 'is-error');
      invalid.focus();
      return;
    }
    void send();
  });

  async function send(): Promise<void> {
    const payload = new FormData(form);
    const fields = [name, phone, message];
    showStatus('');
    submitButton.textContent = options.copy.pending;
    submitButton.disabled = true;
    submitButton.classList.remove('is-sent');
    for (const field of fields) field.disabled = true;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
    }, options.timeoutMs);

    try {
      const result = await submitter.submit(payload, controller.signal);
      if (result.ok) {
        form.reset();
        resetButton();
        submitButton.textContent = options.copy.sent;
        submitButton.classList.add('is-sent');
        showStatus(options.copy.success, 'is-ok');
        return;
      }
      resetButton();
      showStatus(options.copy.rejected, 'is-error');
    } catch (error) {
      resetButton();
      showStatus(isAbortError(error) ? options.copy.timeout : options.copy.offline, 'is-error');
    } finally {
      clearTimeout(timer);
      for (const field of fields) field.disabled = false;
      if (!document.activeElement || document.activeElement === document.body) submitButton.focus();
    }
  }
}
