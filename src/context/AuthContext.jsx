import { createContext, useCallback, useContext, useMemo, useState } from 'react';

/** @typedef {'patient'|'dentist'|'assistant'|'owner'} UserRole */

const AuthContext = createContext(null);

/**
 * @param {object} profile Must include role, id, displayName. Dentists: branchIds, specialty. Assistants: branchId.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = useCallback((profile) => {
    if (!profile?.role || !profile.id) return;
    setUser({ ...profile });
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      isAuthenticated: Boolean(user),
    }),
    [user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function getRoleHomePath(role) {
  switch (role) {
    case 'patient':
      return '/patient';
    case 'dentist':
      return '/dentist';
    case 'assistant':
      return '/assistant';
    case 'owner':
      return '/owner';
    default:
      return '/';
  }
}
