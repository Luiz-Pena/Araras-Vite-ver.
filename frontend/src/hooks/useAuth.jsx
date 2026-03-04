// src/hooks/useAuth.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = carregando

  useEffect(() => {
    api.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const login = async (data) => {
    const u = await api.auth.login(data);
    setUser(u);
    return u;
  };

  const cadastro = async (data) => {
    const u = await api.auth.cadastro(data);
    setUser(u);
    return u;
  };

  const logout = async () => {
    await api.auth.logout();
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, login, cadastro, logout }}>
      {user === undefined ? (
        <div className="d-flex justify-content-center align-items-center vh-100">
          <div className="spinner-border text-primary" />
        </div>
      ) : children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
