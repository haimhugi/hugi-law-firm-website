export interface ContactValues {
  name: string;
  phone: string;
  consent: boolean;
}

export interface ContactErrors {
  name: string;
  phone: string;
  consent: string;
}

export interface ValidationCopy {
  nameRequired: string;
  phoneRequired: string;
  phoneInvalid: string;
  consentRequired: string;
}

const MIN_PHONE_DIGITS = 7;

function digitCount(value: string): number {
  let count = 0;
  for (const character of value) {
    if (character >= '0' && character <= '9') count += 1;
  }
  return count;
}

function phoneError(phone: string, copy: { phoneRequired: string; phoneInvalid: string }): string {
  const trimmed = phone.trim();
  if (!trimmed) return copy.phoneRequired;
  if (digitCount(trimmed) < MIN_PHONE_DIGITS) return copy.phoneInvalid;
  return '';
}

export function validateContact(values: ContactValues, copy: ValidationCopy): ContactErrors {
  return {
    name: values.name.trim() ? '' : copy.nameRequired,
    phone: phoneError(values.phone, copy),
    consent: values.consent ? '' : copy.consentRequired,
  };
}
