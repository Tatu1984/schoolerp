import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { type AuthUser, clearTokens, restoreSession, setSessionExpiredHandler, signIn as apiSignIn } from './api';

interface SessionValue {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSessionExpiredHandler(() => setUser(null));
    restoreSession()
      .then(setUser)
      .finally(() => setLoading(false));
    return () => setSessionExpiredHandler(null);
  }, []);

  const signIn = async (email: string, password: string) => {
    setUser(await apiSignIn(email, password));
  };

  const signOut = async () => {
    await clearTokens();
    setUser(null);
  };

  return <SessionContext.Provider value={{ user, loading, signIn, signOut }}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error('useSession must be used inside SessionProvider');
  return value;
}
