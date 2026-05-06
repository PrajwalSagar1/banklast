import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  accountNumber: string;
  balance: number;
  accountType: string;
  memberSince: string;
  lastLogin?: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  token: string | null;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  setBalance: (balance: number) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('mybank_token'));
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('mybank_user');
    return stored ? JSON.parse(stored) : null;
  });

  const isLoggedIn = !!token && !!user;

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const { token: jwt, user: userData } = data;
      localStorage.setItem('mybank_token', jwt);
      localStorage.setItem('mybank_user', JSON.stringify(userData));
      setToken(jwt);
      setUser(userData);
      return { success: true };
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Login failed';
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('mybank_token');
    localStorage.removeItem('mybank_user');
    setToken(null);
    setUser(null);
  };

  const setBalance = (balance: number) => {
    if (!user) return;
    const updated = { ...user, balance };
    setUser(updated);
    localStorage.setItem('mybank_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, token, user, login, logout, setBalance }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
