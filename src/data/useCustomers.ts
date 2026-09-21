import { useEffect, useState } from 'react';
import { onSnapshot, query } from 'firebase/firestore';

import { sortCustomersByName } from '../domain/filters';
import type { Customer } from '../domain/types';
import { customersCollection, toCustomer } from './collections';
import { useAuth } from './useAuth';

const NONE: Customer[] = [];

interface Loaded {
  uid: string;
  customers: Customer[];
}

/**
 * Načítá všechny zákazníky přihlášeného uživatele najednou.
 *
 * Firestore neumí hledat podřetězce ani kombinovat filtry nad více sloupci,
 * a zákazníků má jeden uživatel řádově desítky až stovky — fulltext, filtry,
 * řazení i stránkování proto běží na klientovi nad touto sadou.
 */
export function useCustomers(): { customers: Customer[]; loading: boolean } {
  const { user } = useAuth();
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    if (!user) return;
    const uid = user.uid;
    return onSnapshot(
      query(customersCollection(uid)),
      (snapshot) =>
        setLoaded({ uid, customers: sortCustomersByName(snapshot.docs.map(toCustomer)) }),
      (error) => {
        console.error('Nepodařilo se načíst zákazníky:', error);
        setLoaded({ uid, customers: [] });
      },
    );
  }, [user]);

  if (!user) return { customers: NONE, loading: false };
  const fresh = loaded?.uid === user.uid ? loaded.customers : null;
  return { customers: fresh ?? NONE, loading: fresh === null };
}
