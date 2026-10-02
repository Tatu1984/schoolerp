import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { type AuthUser, clearTokens, restoreSession, setSessionExpiredHandler, signIn as apiSignIn, changePassword as apiChangePassword } from './api';

interface SessionValue {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
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

  const changePassword = async (currentPassword: string, newPassword: string) => {
    setUser(await apiChangePassword(currentPassword, newPassword));
  };

  return <SessionContext.Provider value={{ user, loading, signIn, signOut, changePassword }}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error('useSession must be used inside SessionProvider');
  return value;
}
