import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMe } from '../api/auth';
// getMe points to /api/auth/me which is an alias for /api/auth/profile

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('zepnest_token'));
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const savedToken = localStorage.getItem('zepnest_token');
    if (!savedToken) { setLoading(false); return; }
    try {
      const res = await getMe();
      setUser(res.data.data.user);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = (tokenValue, userData) => {
    localStorage.setItem('zepnest_token', tokenValue);
    localStorage.setItem('zepnest_user', JSON.stringify(userData));
    setToken(tokenValue);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('zepnest_token');
    localStorage.removeItem('zepnest_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
