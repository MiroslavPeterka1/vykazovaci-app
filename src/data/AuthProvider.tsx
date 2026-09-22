import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';

import type { UserProfile } from '../domain/types';
import { ensureUserProfile, loadUserProfile, usesPasswordProvider } from './auth';
import { AuthContext, type AuthState } from './authContext';
import { auth } from './firebase';

function isVerified(user: User | null): boolean {
  if (!user) return false;
  // Účty přes Google chodí ověřené, výzva se jich netýká.
  return user.emailVerified || !usesPasswordProvider(user);
}

interface LoadedProfile {
  uid: string;
  value: UserProfile | null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);
  const [loadedProfile, setLoadedProfile] = useState<LoadedProfile | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    // Callback musí zůstat synchronní. Firebase na něj čeká, než dokončí
    // přihlášení, a dotaz do Firestore uvnitř by čekal na token, který se
    // právě ustaluje — obojí by se navzájem zablokovalo a registrace by
    // se zastavila hned po vytvoření účtu.
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setEmailVerified(isVerified(nextUser));
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    const uid = user.uid;
    let cancelled = false;

    async function load() {
      let value = await loadUserProfile(uid);
      if (!value) {
        // Účet bez profilu vznikne, když se registrace nedokončí — uživatel
        // třeba obnovil stránku dřív, než doběhl zápis. Bez profilu by pak
        // selhala i změna jména, protože pravidla u neexistujícího dokumentu
        // nemají z čeho ověřit e-mail. Doplníme ho tedy dodatečně.
        await ensureUserProfile(user!);
        value = await loadUserProfile(uid);
      }
      if (!cancelled) setLoadedProfile({ uid, value });
    }

    load().catch((error) => {
      console.error('Nepodařilo se načíst profil:', error);
      if (!cancelled) setLoadedProfile({ uid, value: null });
    });

    return () => {
      cancelled = true;
    };
  }, [user, reloadToken]);

  const refresh = useCallback(async () => {
    const current = auth.currentUser;
    if (!current) return;
    await current.reload();
    // reload() mění objekt na místě, takže se stav odvodí znovu ručně.
    setEmailVerified(isVerified(auth.currentUser));
    setReloadToken((token) => token + 1);
  }, []);

  const profile = user && loadedProfile?.uid === user.uid ? loadedProfile.value : null;

  const value = useMemo<AuthState>(
    () => ({ user, profile, loading, emailVerified, refresh }),
    [user, profile, loading, emailVerified, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
