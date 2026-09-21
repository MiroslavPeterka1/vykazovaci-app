/** Aplikační podoba entit. Převod z/do Firestore (Timestamp ↔ Date) dělá vrstva src/data. */

export interface Customer {
  id: string;
  name: string;
  ico: string;
  dic: string;
  address: string;
  person: string;
  phone: string;
  email: string;
  /** Součty udržuje Cloud Function trigger, klient do nich nezapisuje. */
  totalMinutes: number;
  invoicedMinutes: number;
}

export interface Activity {
  id: string;
  customerId: string;
  name: string;
  start: Date;
  /** null = činnost běží */
  end: Date | null;
  durationMinutes: number | null;
  invoiced: boolean;
  /** DUZP — datum uskutečnění zdanitelného plnění */
  invoiceDate: Date | null;
  note: string;
}

export interface UserProfile {
  displayName: string;
  email: string;
  termsAcceptedAt: Date | null;
  termsVersion: string;
}
