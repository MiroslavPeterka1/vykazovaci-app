import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, Timestamp } from 'firebase/firestore';

import { TERMS_VERSION } from '../content/terms';
import type { UserProfile } from '../domain/types';
import { auth, db } from './firebase';

export function userProfileRef(uid: string) {
  return doc(db, 'users', uid);
}

/**
 * Založí profilový dokument, pokud ještě neexistuje.
 *
 * U registrace e-mailem souhlas s podmínkami potvrzuje zaškrtávátko ve formuláři,
 * u Google přihlášení věta „Pokračováním souhlasíte…“ pod kartou — v obou případech
 * se čas souhlasu a verze podmínek ukládají sem.
 */
export async function ensureUserProfile(user: User, displayName?: string): Promise<void> {
  const ref = userProfileRef(user.uid);
  const existing = await getDoc(ref);
  if (existing.exists()) return;

  await setDoc(ref, {
    displayName: displayName ?? user.displayName ?? '',
    email: user.email ?? '',
    termsAcceptedAt: serverTimestamp(),
    termsVersion: TERMS_VERSION,
    createdAt: serverTimestamp(),
  });
}

export async function loadUserProfile(uid: string): Promise<UserProfile | null> {
  const snapshot = await getDoc(userProfileRef(uid));
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  const acceptedAt = data.termsAcceptedAt;
  return {
    displayName: typeof data.displayName === 'string' ? data.displayName : '',
    email: typeof data.email === 'string' ? data.email : '',
    termsAcceptedAt: acceptedAt instanceof Timestamp ? acceptedAt.toDate() : null,
    termsVersion: typeof data.termsVersion === 'string' ? data.termsVersion : '',
  };
}

export interface RegisterInput {
  displayName: string;
  email: string;
  password: string;
}

export async function registerWithEmail({
  displayName,
  email,
  password,
}: RegisterInput): Promise<void> {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(user, { displayName });
  await ensureUserProfile(user, displayName);
  await sendEmailVerification(user);
}

export async function signInWithEmail(email: string, password: string): Promise<void> {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  await ensureUserProfile(user);
}

export async function signInWithGoogle(): Promise<void> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const { user } = await signInWithPopup(auth, provider);
  await ensureUserProfile(user);
}

export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export async function resendVerification(): Promise<void> {
  if (!auth.currentUser) return;
  await sendEmailVerification(auth.currentUser);
}

export async function logout(): Promise<void> {
  await signOut(auth);
}

/** Účet přes Google přichází s ověřeným e-mailem, výzva se ho tedy netýká. */
export function usesPasswordProvider(user: User): boolean {
  return user.providerData.some((provider) => provider.providerId === 'password');
}
