import { z } from 'zod';

import { fromDateTimeLocalValue } from './time';

/**
 * Schémata popisují podobu formulářů, ne dokumentů v databázi — hodnoty z
 * `datetime-local` a `date` jsou řetězce a na `Date` se převádějí až při ukládání.
 */

export const customerFormSchema = z.object({
  name: z.string().trim().min(1, 'Vyplňte název zákazníka'),
  ico: z.string().trim(),
  dic: z.string().trim(),
  address: z.string().trim(),
  person: z.string().trim(),
  phone: z.string().trim(),
  email: z.union([z.literal(''), z.string().trim().email('Neplatný e-mail')]),
  note: z.string(),
});

export type CustomerFormValues = z.infer<typeof customerFormSchema>;

export const emptyCustomerForm: CustomerFormValues = {
  name: '',
  ico: '',
  dic: '',
  address: '',
  person: '',
  phone: '',
  email: '',
  note: '',
};

export const activityFormSchema = z
  .object({
    name: z.string().trim().min(1, 'Vyplňte název činnosti'),
    customerId: z.string().min(1, 'Vyberte zákazníka'),
    start: z.string().min(1, 'Vyplňte začátek činnosti'),
    /** Prázdný konec znamená, že činnost běží. */
    end: z.string(),
    invoiced: z.boolean(),
    /** DUZP; zůstává nepovinné i u vyfakturované činnosti. */
    invoiceDate: z.string(),
    note: z.string(),
  })
  .refine(
    (values) => {
      if (!values.end) return true;
      const start = fromDateTimeLocalValue(values.start);
      const end = fromDateTimeLocalValue(values.end);
      if (!start || !end) return false;
      return end.getTime() > start.getTime();
    },
    { message: 'Konec nesmí předcházet začátku', path: ['end'] },
  );

export type ActivityFormValues = z.infer<typeof activityFormSchema>;

export const registrationSchema = z
  .object({
    displayName: z.string().trim().min(1, 'Vyplňte jméno'),
    email: z.string().trim().email('Neplatný e-mail'),
    password: z.string().min(6, 'Heslo musí mít alespoň 6 znaků'),
    passwordAgain: z.string(),
    termsAccepted: z.literal(true, { message: 'Bez souhlasu s podmínkami nelze účet založit' }),
  })
  .refine((values) => values.password === values.passwordAgain, {
    message: 'Hesla se neshodují',
    path: ['passwordAgain'],
  });

export type RegistrationValues = z.infer<typeof registrationSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email('Neplatný e-mail'),
  password: z.string().min(1, 'Vyplňte heslo'),
});

export type LoginValues = z.infer<typeof loginSchema>;
