import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const s = JSON.parse(localStorage.getItem('__session__'));
      return s || null;
    } catch { return null; }
  });

  // userData vem do login: { token, id, nome, email, cpf, tipo, nivelAcesso }
  const login = (userData) => {
    localStorage.setItem('__session__', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('__session__');
    setUser(null);
  };

  // Admin = nivelAcesso ADMIN (back) ou tipo 'admin' (fallback)
  const isAdmin = user?.nivelAcesso === 'ADMIN' || user?.tipo === 'admin';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}