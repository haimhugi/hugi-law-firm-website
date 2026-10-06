import { afterEach, describe, expect, it, vi } from 'vitest';
import { initContactForm, type ContactCopy } from '../../src/scripts/features/contact/contact-form';
import type { FormSubmitter } from '../../src/scripts/features/contact/form-submitter';

const copy: ContactCopy = {
  nameRequired: 'נא למלא שם מלא.',
  phoneRequired: 'נא למלא מספר טלפון.',
  fixFields: 'יש לתקן את השדות המסומנים.',
  label: 'שלח הודעה',
  pending: 'שולח...',
  sent: 'נשלח',
  success: 'ההודעה נשלחה בהצלחה. נחזור אליכם בהקדם.',
  rejected: 'שגיאה בשליחה. נסו שוב או התקשרו למשרד: 03-566-5775.',
  timeout: 'השליחה לא הושלמה בזמן. הפרטים נשמרו בטופס — נסו שוב או התקשרו למשרד: 03-566-5775.',
  offline: 'שגיאת חיבור. נסו שוב או התקשרו למשרד: 03-566-5775.',
};

function mountForm(): HTMLFormElement {
  document.body.innerHTML = `
    <form id="contactForm">
      <input id="fname" name="name">
      <p id="fname-error" hidden></p>
      <input id="fphone" name="phone">
      <p id="fphone-error" hidden></p>
      <input id="fmsg" name="message">
      <button id="submitBtn" type="submit">שלח הודעה</button>
      <p id="formMsg"></p>
    </form>
  `;
  const form = document.querySelector('#contactForm');
  if (!(form instanceof HTMLFormElement)) throw new Error('fixture form missing');
  return form;
}

function submitterOf(submit: FormSubmitter['submit']): FormSubmitter {
  return { submit };
}

afterEach(() => {
  document.body.innerHTML = '';
  vi.useRealTimers();
});

describe('contact form', () => {
  it('shows the name and phone errors and focuses the name', () => {
    const form = mountForm();
    initContactForm(
      form,
      submitterOf(() => Promise.resolve({ ok: true })),
      { timeoutMs: 15_000, copy },
    );
    form.requestSubmit();
    expect(document.querySelector('#fname-error')?.textContent).toBe(copy.nameRequired);
    expect(document.querySelector('#fphone-error')?.textContent).toBe(copy.phoneRequired);
    expect(document.activeElement?.id).toBe('fname');
  });

  it('clears the form after a successful send and resets the button on new input', async () => {
    const form = mountForm();
    initContactForm(
      form,
      submitterOf(() => Promise.resolve({ ok: true })),
      { timeoutMs: 15_000, copy },
    );
    const name = form.querySelector<HTMLInputElement>('#fname');
    const phone = form.querySelector<HTMLInputElement>('#fphone');
    if (!name || !phone) throw new Error('fields missing');
    name.value = 'בדיקה';
    phone.value = '0541234567';
    form.requestSubmit();
    await vi.waitFor(() => {
      expect(document.querySelector('#formMsg')?.textContent).toBe(copy.success);
    });
    expect(name.value).toBe('');
    expect(document.querySelector('#submitBtn')?.textContent).toBe(copy.sent);
    name.value = 'פנייה נוספת';
    name.dispatchEvent(new Event('input'));
    expect(document.querySelector('#submitBtn')?.textContent).toBe(copy.label);
  });

  it('keeps the typed name when the server rejects the message', async () => {
    const form = mountForm();
    initContactForm(
      form,
      submitterOf(() => Promise.resolve({ ok: false })),
      { timeoutMs: 15_000, copy },
    );
    const name = form.querySelector<HTMLInputElement>('#fname');
    const phone = form.querySelector<HTMLInputElement>('#fphone');
    if (!name || !phone) throw new Error('fields missing');
    name.value = 'בדיקה';
    phone.value = '0541234567';
    form.requestSubmit();
    await vi.waitFor(() => {
      expect(document.querySelector('#formMsg')?.textContent).toContain('03-566-5775');
    });
    expect(name.value).toBe('בדיקה');
    expect(form.querySelector<HTMLButtonElement>('#submitBtn')?.disabled).toBe(false);
  });

  it('keeps the message when the request times out', async () => {
    vi.useFakeTimers();
    const form = mountForm();
    const pending = submitterOf(
      (_body, signal) =>
        new Promise((_resolve, reject) => {
          signal.addEventListener('abort', () => {
            reject(new DOMException('The operation was aborted.', 'AbortError'));
          });
        }),
    );
    initContactForm(form, pending, { timeoutMs: 15_000, copy });
    const name = form.querySelector<HTMLInputElement>('#fname');
    const phone = form.querySelector<HTMLInputElement>('#fphone');
    const message = form.querySelector<HTMLInputElement>('#fmsg');
    if (!name || !phone || !message) throw new Error('fields missing');
    name.value = 'בדיקה';
    phone.value = '0541234567';
    message.value = 'חוזה שכירות';
    form.requestSubmit();
    await vi.advanceTimersByTimeAsync(15_000);
    expect(document.querySelector('#formMsg')?.textContent).toContain('השליחה לא הושלמה בזמן');
    expect(message.value).toBe('חוזה שכירות');
    expect(form.querySelector<HTMLButtonElement>('#submitBtn')?.disabled).toBe(false);
  });
});
