import { useEffect, useState } from 'react';
import { limit, onSnapshot, orderBy, query, where } from 'firebase/firestore';

import type { Activity } from '../domain/types';
import { activitiesCollection, toActivity } from './collections';
import { useAuth } from './useAuth';

const NONE: Activity[] = [];

/**
 * Pojistka proti zákazníkovi s extrémní historií. Návrh nad touto sadou filtruje
 * a stránkuje na klientovi, takže se načítá celá — strop drží načtení ohraničené.
 */
export const CUSTOMER_ACTIVITIES_LIMIT = 1000;

interface Loaded {
  key: string;
  activities: Activity[];
}

/**
 * Všechny činnosti jednoho zákazníka. Textové filtry v detailu Firestore neumí,
 * proto se sada načítá celá a filtruje se i stránkuje na klientovi.
 */
export function useCustomerActivities(customerId: string | undefined): {
  activities: Activity[];
  loading: boolean;
} {
  const { user } = useAuth();
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const key = user && customerId ? `${user.uid}/${customerId}` : null;

  useEffect(() => {
    if (!user || !customerId) return;
    const currentKey = `${user.uid}/${customerId}`;
    return onSnapshot(
      query(
        activitiesCollection(user.uid),
        where('customerId', '==', customerId),
        orderBy('start', 'desc'),
        limit(CUSTOMER_ACTIVITIES_LIMIT),
      ),
      (snapshot) => setLoaded({ key: currentKey, activities: snapshot.docs.map(toActivity) }),
      (error) => {
        console.error('Nepodařilo se načíst činnosti zákazníka:', error);
        setLoaded({ key: currentKey, activities: [] });
      },
    );
  }, [user, customerId]);

  if (!key) return { activities: NONE, loading: false };
  const fresh = loaded?.key === key ? loaded.activities : null;
  return { activities: fresh ?? NONE, loading: fresh === null };
}
