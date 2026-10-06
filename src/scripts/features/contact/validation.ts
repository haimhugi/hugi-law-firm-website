export interface ContactValues {
  name: string;
  phone: string;
}

export interface ContactErrors {
  name: string;
  phone: string;
}

export function validateContact(
  values: ContactValues,
  copy: { nameRequired: string; phoneRequired: string },
): ContactErrors {
  return {
    name: values.name.trim() ? '' : copy.nameRequired,
    phone: values.phone.trim() ? '' : copy.phoneRequired,
  };
}
