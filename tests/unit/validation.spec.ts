import { describe, expect, it } from 'vitest';
import { validateContact } from '../../src/scripts/features/contact/validation';

const copy = { nameRequired: 'name', phoneRequired: 'phone', phoneInvalid: 'invalid' };

describe('validateContact', () => {
  it('requires a name and a phone number', () => {
    expect(validateContact({ name: '', phone: '' }, copy)).toEqual({
      name: 'name',
      phone: 'phone',
    });
  });

  it('treats whitespace as empty', () => {
    expect(validateContact({ name: '  ', phone: '   ' }, copy)).toEqual({
      name: 'name',
      phone: 'phone',
    });
  });

  it('accepts labeled, international, and landline numbers', () => {
    for (const phone of ['נייד: 054 123 4567', '+972541234567', '03-566-5775', '0541234567']) {
      expect(validateContact({ name: 'בדיקה', phone }, copy)).toEqual({ name: '', phone: '' });
    }
  });

  it('rejects text that does not contain a usable number', () => {
    for (const phone of ['abc', '!!!', '1', '12 34']) {
      expect(validateContact({ name: 'בדיקה', phone }, copy)).toEqual({
        name: '',
        phone: 'invalid',
      });
    }
  });
});
