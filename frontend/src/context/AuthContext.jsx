import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try { return JSON.parse(localStorage.getItem('zerone_auth') || 'null'); }
    catch { return null; }
  });

  const login = (data) => {
    localStorage.setItem('zerone_auth', JSON.stringify(data));
    setAuth(data);
  };

  const logout = () => {
    localStorage.removeItem('zerone_auth');
    setAuth(null);
  };

  const token    = auth?.token    || null;
  const role     = auth?.role     || null;
  const teamId   = auth?.teamId   || null;
  const teamName = auth?.teamName || null;
  const teamCode = auth?.code     || null;

  return (
    <AuthContext.Provider value={{ auth, login, logout, token, role, teamId, teamName, teamCode }}>
      {children}
    </AuthContext.Provider>
  );
}
