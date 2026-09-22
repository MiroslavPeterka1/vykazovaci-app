import { updateProfile } from 'firebase/auth';
import { serverTimestamp, updateDoc } from 'firebase/firestore';

import { userProfileRef } from './auth';
import { auth } from './firebase';

/** Jméno se drží na dvou místech: v účtu Firebase Auth a v profilovém dokumentu. */
export async function updateDisplayName(uid: string, displayName: string): Promise<void> {
  const trimmed = displayName.trim();
  if (auth.currentUser) {
    await updateProfile(auth.currentUser, { displayName: trimmed });
  }
  await updateDoc(userProfileRef(uid), { displayName: trimmed, updatedAt: serverTimestamp() });
}
