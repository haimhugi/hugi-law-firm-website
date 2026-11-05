import { describe, expect, it } from 'vitest';
import { validateContact } from '../../src/scripts/features/contact/validation';

const copy = {
  nameRequired: 'name',
  phoneRequired: 'phone',
  phoneInvalid: 'invalid',
  consentRequired: 'consent',
};

describe('validateContact', () => {
  it('requires a name, a phone number and privacy consent', () => {
    expect(validateContact({ name: '', phone: '', consent: false }, copy)).toEqual({
      name: 'name',
      phone: 'phone',
      consent: 'consent',
    });
  });

  it('treats whitespace as empty', () => {
    expect(validateContact({ name: '  ', phone: '   ', consent: true }, copy)).toEqual({
      name: 'name',
      phone: 'phone',
      consent: '',
    });
  });

  it('accepts labeled, international, and landline numbers', () => {
    for (const phone of ['נייד: 054 123 4567', '+972541234567', '03-566-5775', '0541234567']) {
      expect(validateContact({ name: 'בדיקה', phone, consent: true }, copy)).toEqual({
        name: '',
        phone: '',
        consent: '',
      });
    }
  });

  it('rejects text that does not contain a usable number', () => {
    for (const phone of ['abc', '!!!', '1', '12 34']) {
      expect(validateContact({ name: 'בדיקה', phone, consent: true }, copy)).toEqual({
        name: '',
        phone: 'invalid',
        consent: '',
      });
    }
  });

  it('requires consent even when the other fields are valid', () => {
    expect(validateContact({ name: 'בדיקה', phone: '0541234567', consent: false }, copy)).toEqual({
      name: '',
      phone: '',
      consent: 'consent',
    });
  });
});
