import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, jsonBody } from '../services/api.js';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('artisan-token')));
  useEffect(() => {
    if (!localStorage.getItem('artisan-token')) return;
    api('/auth/profile').then(({ user: current }) => setUser(current)).catch(() => { localStorage.removeItem('artisan-token'); setUser(null); }).finally(() => setLoading(false));
  }, []);
  const authenticate = async (path, credentials) => {
    const data = await api(path, { method: 'POST', ...jsonBody(credentials) });
    localStorage.setItem('artisan-token', data.token);
    setUser(data.user);
    return data.user;
  };
  const value = useMemo(() => ({ user, loading, login: (data) => authenticate('/auth/login', data), register: (data) => authenticate('/auth/register', data), logout: () => { localStorage.removeItem('artisan-token'); setUser(null); }, refresh: async () => { const data = await api('/auth/profile'); setUser(data.user); return data.user; }, setUser }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
