import { getDocs, orderBy, query, Timestamp, where } from 'firebase/firestore';

import type { Activity } from '../domain/types';
import { activitiesCollection, toActivity } from './collections';

/**
 * Činnosti zákazníka, jejichž začátek spadá do období [od, do).
 *
 * Do výkazu jdou jen ukončené činnosti. Běžící se odfiltrují až tady — druhá
 * nerovnost vedle rozsahu přes `start` by ve Firestore nešla a kvůli hrstce
 * běžících činností nemá smysl zavádět další index.
 */
export async function loadActivitiesForPeriod(
  uid: string,
  customerId: string,
  from: Date,
  to: Date,
): Promise<Activity[]> {
  const snapshot = await getDocs(
    query(
      activitiesCollection(uid),
      where('customerId', '==', customerId),
      where('start', '>=', Timestamp.fromDate(from)),
      where('start', '<', Timestamp.fromDate(to)),
      orderBy('start', 'asc'),
    ),
  );
  return snapshot.docs.map(toActivity).filter((activity) => activity.end !== null);
}
