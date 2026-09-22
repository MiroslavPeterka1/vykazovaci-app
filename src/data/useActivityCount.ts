import { useEffect, useState } from 'react';
import { getCountFromServer } from 'firebase/firestore';

import { activitiesCollection } from './collections';
import { useAuth } from './useAuth';

interface Loaded {
  uid: string;
  count: number;
}

/**
 * Počet všech činností uživatele pro statistiku v profilu. Jediný agregační
 * dotaz — načítat kvůli číslu celou historii by nedávalo smysl.
 */
export function useActivityCount(): { count: number; loading: boolean } {
  const { user } = useAuth();
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    if (!user) return;
    const uid = user.uid;
    let cancelled = false;

    getCountFromServer(activitiesCollection(uid))
      .then((snapshot) => {
        if (!cancelled) setLoaded({ uid, count: snapshot.data().count });
      })
      .catch((error) => {
        console.error('Nepodařilo se spočítat činnosti:', error);
        if (!cancelled) setLoaded({ uid, count: 0 });
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user) return { count: 0, loading: false };
  const fresh = loaded?.uid === user.uid ? loaded.count : null;
  return { count: fresh ?? 0, loading: fresh === null };
}
