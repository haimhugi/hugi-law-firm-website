import { describe, expect, it } from 'vitest';
import { validateContact } from '../../src/scripts/features/contact/validation';

const copy = { nameRequired: 'name', phoneRequired: 'phone' };

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

  it('accepts any non-empty phone text', () => {
    expect(validateContact({ name: 'בדיקה', phone: 'נייד: 054 123 4567' }, copy)).toEqual({
      name: '',
      phone: '',
    });
  });
});
