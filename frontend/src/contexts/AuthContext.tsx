import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: true, // Default true for internal sales tool
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('iamonin_token'));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('iamonin_user');
    return saved
      ? JSON.parse(saved)
      : {
          id: 'usr-sales-default',
          email: 'sales@iamonin.com',
          name: 'IAMONIN Growth Consultant',
          role: 'SALES',
        };
  });

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('iamonin_token', newToken);
    localStorage.setItem('iamonin_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('iamonin_token');
    localStorage.removeItem('iamonin_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: true,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
