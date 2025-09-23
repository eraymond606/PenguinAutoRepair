// client/src/AuthContext.js
import { createContext, useContext, useMemo, useState } from 'react';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // store {id, name, role} etc.

  const value = useMemo(() => ({
    user,
    login: (u) => setUser(u),
    logout: () => setUser(null),
    isAuthed: !!user
  }), [user]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
