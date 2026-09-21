import { describe, expect, it } from 'vitest';

import {
  activityFormSchema,
  customerFormSchema,
  emptyCustomerForm,
  registrationSchema,
} from './schemas';

const baseActivity = {
  name: 'Vývoj API',
  customerId: 'c1',
  start: '2026-09-20T09:00',
  end: '',
  invoiced: false,
  invoiceDate: '',
  note: '',
};

describe('activityFormSchema', () => {
  it('běžící činnost bez konce je platná', () => {
    expect(activityFormSchema.safeParse(baseActivity).success).toBe(true);
  });

  it('vyžaduje název i zákazníka', () => {
    expect(activityFormSchema.safeParse({ ...baseActivity, name: '  ' }).success).toBe(false);
    expect(activityFormSchema.safeParse({ ...baseActivity, customerId: '' }).success).toBe(false);
  });

  it('odmítne konec před začátkem', () => {
    const result = activityFormSchema.safeParse({ ...baseActivity, end: '2026-09-20T08:00' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Konec nesmí předcházet začátku');
    }
  });

  it('přijme činnost přes změnu času, protože se počítá z absolutních okamžiků', () => {
    const result = activityFormSchema.safeParse({
      ...baseActivity,
      start: '2026-10-24T22:00',
      end: '2026-10-25T06:00',
    });
    expect(result.success).toBe(true);
  });
});

describe('customerFormSchema', () => {
  it('vyžaduje jen název', () => {
    expect(customerFormSchema.safeParse({ ...emptyCustomerForm, name: 'Alfatech' }).success).toBe(
      true,
    );
    expect(customerFormSchema.safeParse(emptyCustomerForm).success).toBe(false);
  });

  it('kontroluje e-mail, ale prázdný povolí', () => {
    const withName = { ...emptyCustomerForm, name: 'Alfatech' };
    expect(customerFormSchema.safeParse({ ...withName, email: 'nesmysl' }).success).toBe(false);
    expect(customerFormSchema.safeParse({ ...withName, email: 'a@b.cz' }).success).toBe(true);
  });
});

describe('registrationSchema', () => {
  const base = {
    displayName: 'Miroslav Peterka',
    email: 'mp@example.cz',
    password: 'tajneheslo',
    passwordAgain: 'tajneheslo',
    termsAccepted: true as const,
  };

  it('projde s vyplněným jménem a souhlasem', () => {
    expect(registrationSchema.safeParse(base).success).toBe(true);
  });

  it('bez souhlasu s podmínkami neprojde', () => {
    expect(registrationSchema.safeParse({ ...base, termsAccepted: false }).success).toBe(false);
  });

  it('hlídá shodu hesel', () => {
    const result = registrationSchema.safeParse({ ...base, passwordAgain: 'jine' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Hesla se neshodují');
    }
  });
});
