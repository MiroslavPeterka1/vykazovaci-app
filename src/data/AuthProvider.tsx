import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';

import type { UserProfile } from '../domain/types';
import { loadUserProfile, usesPasswordProvider } from './auth';
import { AuthContext, type AuthState } from './authContext';
import { auth } from './firebase';

function isVerified(user: User | null): boolean {
  if (!user) return false;
  // Účty přes Google chodí ověřené, výzva se jich netýká.
  return user.emailVerified || !usesPasswordProvider(user);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      setEmailVerified(isVerified(nextUser));
      setProfile(nextUser ? await loadUserProfile(nextUser.uid) : null);
      setLoading(false);
    });
  }, []);

  const refresh = useCallback(async () => {
    const current = auth.currentUser;
    if (!current) return;
    await current.reload();
    // reload() mění objekt na místě, takže se stav odvodí znovu ručně.
    setEmailVerified(isVerified(auth.currentUser));
    setProfile(await loadUserProfile(current.uid));
  }, []);

  const value = useMemo<AuthState>(
    () => ({ user, profile, loading, emailVerified, refresh }),
    [user, profile, loading, emailVerified, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
