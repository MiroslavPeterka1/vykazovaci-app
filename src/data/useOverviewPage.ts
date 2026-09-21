import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';

import type { Activity } from '../domain/types';
import { activitiesCollection, toActivity } from './collections';
import { useAuth } from './useAuth';

const NONE: Activity[] = [];

interface Loaded {
  key: string;
  activities: Activity[];
  total: number;
  hasNext: boolean;
}

export interface OverviewPage {
  activities: Activity[];
  total: number;
  pageIndex: number;
  hasNext: boolean;
  loading: boolean;
  goToPage: (next: number) => void;
  /** Po zápisu: zahodí kurzory a vrátí se na první stránku. */
  reload: () => void;
}

/**
 * Ukončené činnosti napříč zákazníky, stránkované serverem přes kurzory.
 *
 * Tahle tabulka jako jediná nemá textové filtry, takže stránkovat na serveru
 * jde — historie může být dlouhá a načítat ji celou nemá smysl. Načítá se vždy
 * o jeden záznam víc, než kolik se zobrazí; jeho existence prozradí, jestli má
 * smysl nabízet další stránku.
 */
export function useOverviewPage(pageSize: number): OverviewPage {
  const { user } = useAuth();
  const [nav, setNav] = useState({ pageIndex: 0, token: 0 });
  const cursors = useRef<(QueryDocumentSnapshot | null)[]>([null]);
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  const { pageIndex, token } = nav;
  const key = user ? `${user.uid}|${pageIndex}|${token}` : null;

  useEffect(() => {
    if (!user) return;
    const currentKey = `${user.uid}|${pageIndex}|${token}`;
    let cancelled = false;

    async function load() {
      const base = query(
        activitiesCollection(user!.uid),
        where('running', '==', false),
        orderBy('start', 'desc'),
      );
      const totalSnapshot = await getCountFromServer(base);
      const cursor = cursors.current[pageIndex] ?? null;
      const pageQuery = cursor
        ? query(base, startAfter(cursor), limit(pageSize + 1))
        : query(base, limit(pageSize + 1));
      const snapshot = await getDocs(pageQuery);

      const documents = snapshot.docs.slice(0, pageSize);
      const last = documents.at(-1);
      if (last) cursors.current[pageIndex + 1] = last;

      if (cancelled) return;
      setLoaded({
        key: currentKey,
        activities: documents.map(toActivity),
        total: totalSnapshot.data().count,
        hasNext: snapshot.docs.length > pageSize,
      });
    }

    load().catch((error) => {
      console.error('Nepodařilo se načíst odpracovanou práci:', error);
      if (!cancelled) {
        setLoaded({ key: currentKey, activities: [], total: 0, hasNext: false });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [user, pageIndex, token, pageSize]);

  const goToPage = useCallback((next: number) => {
    setNav((current) => ({ ...current, pageIndex: Math.max(0, next) }));
  }, []);

  const reload = useCallback(() => {
    cursors.current = [null];
    setNav((current) => ({ pageIndex: 0, token: current.token + 1 }));
  }, []);

  if (!key) {
    return {
      activities: NONE,
      total: 0,
      pageIndex: 0,
      hasNext: false,
      loading: false,
      goToPage,
      reload,
    };
  }

  const fresh = loaded?.key === key ? loaded : null;
  return {
    activities: fresh?.activities ?? NONE,
    total: fresh?.total ?? 0,
    pageIndex,
    hasNext: fresh?.hasNext ?? false,
    loading: fresh === null,
    goToPage,
    reload,
  };
}
