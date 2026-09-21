import { FieldValue } from 'firebase-admin/firestore';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { logger } from 'firebase-functions';

import { db } from './firebase';

interface ActivityShape {
  customerId?: unknown;
  durationMinutes?: unknown;
  invoiced?: unknown;
  end?: unknown;
}

interface Contribution {
  customerId: string | null;
  total: number;
  invoiced: number;
}

/**
 * Čím činnost přispívá do součtů zákazníka. Běžící činnost nepřispívá ničím —
 * dokud nemá konec, její doba se ještě mění.
 */
function contributionOf(data: ActivityShape | undefined): Contribution {
  if (!data) return { customerId: null, total: 0, invoiced: 0 };
  const customerId = typeof data.customerId === 'string' ? data.customerId : null;
  const minutes =
    data.end != null && typeof data.durationMinutes === 'number' ? data.durationMinutes : 0;
  return { customerId, total: minutes, invoiced: data.invoiced === true ? minutes : 0 };
}

async function applyDelta(
  uid: string,
  customerId: string,
  total: number,
  invoiced: number,
): Promise<void> {
  if (total === 0 && invoiced === 0) return;
  try {
    // update, ne set — kdyby zákazník mezitím zmizel, nesmí ho zápis vzkřísit.
    await db.doc(`users/${uid}/customers/${customerId}`).update({
      totalMinutes: FieldValue.increment(total),
      invoicedMinutes: FieldValue.increment(invoiced),
    });
  } catch (error) {
    if ((error as { code?: number }).code === 5) return; // NOT_FOUND: zákazník už neexistuje
    throw error;
  }
}

/**
 * Udržuje `totalMinutes` a `invoicedMinutes` na dokumentu zákazníka.
 *
 * Proč trigger a ne přepočet na klientovi: administrace probíhá i přímo
 * z konzole Firebase a takové úpravy by klientské počítadlo neviděl.
 *
 * Přesun činnosti k jinému zákazníkovi se řeší jako dva pohyby — odečtení
 * u původního a přičtení u nového.
 */
export const onActivityWritten = onDocumentWritten(
  'users/{uid}/activities/{activityId}',
  async (event) => {
    const uid = event.params.uid;
    const before = contributionOf(event.data?.before.data() as ActivityShape | undefined);
    const after = contributionOf(event.data?.after.data() as ActivityShape | undefined);

    if (before.customerId && before.customerId === after.customerId) {
      await applyDelta(
        uid,
        before.customerId,
        after.total - before.total,
        after.invoiced - before.invoiced,
      );
      return;
    }

    if (before.customerId) {
      await applyDelta(uid, before.customerId, -before.total, -before.invoiced);
    }
    if (after.customerId) {
      await applyDelta(uid, after.customerId, after.total, after.invoiced);
    }

    logger.debug('Součty zákazníka přepočteny', {
      uid,
      from: before.customerId,
      to: after.customerId,
    });
  },
);
