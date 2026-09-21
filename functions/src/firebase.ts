import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

initializeApp();

export const db = getFirestore();

/** Firestore dávka pojme nejvýš 500 zápisů. */
export const BATCH_LIMIT = 500;
