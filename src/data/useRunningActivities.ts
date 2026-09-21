import { useEffect, useState } from 'react';
import { onSnapshot, orderBy, query, where } from 'firebase/firestore';

import type { Activity } from '../domain/types';
import { activitiesCollection, toActivity } from './collections';
import { useAuth } from './useAuth';

const NONE: Activity[] = [];

interface Loaded {
  uid: string;
  activities: Activity[];
}

/**
 * Běžící činnosti sleduje živě — je jich řádově pár a Přehled i odznak v horní
 * liště se mají měnit hned, jak se některá spustí nebo ukončí.
 *
 * Stav mění výhradně callback subscription; výsledek se drží spolu s uid, aby
 * se po přepnutí uživatele nezobrazila data toho předchozího.
 */
export function useRunningActivities(): { activities: Activity[]; loading: boolean } {
  const { user } = useAuth();
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    if (!user) return;
    const uid = user.uid;
    const runningQuery = query(
      activitiesCollection(uid),
      where('running', '==', true),
      orderBy('start', 'desc'),
    );
    return onSnapshot(
      runningQuery,
      (snapshot) => setLoaded({ uid, activities: snapshot.docs.map(toActivity) }),
      (error) => {
        console.error('Nepodařilo se načíst běžící činnosti:', error);
        setLoaded({ uid, activities: [] });
      },
    );
  }, [user]);

  if (!user) return { activities: NONE, loading: false };
  const fresh = loaded?.uid === user.uid ? loaded.activities : null;
  return { activities: fresh ?? NONE, loading: fresh === null };
}
