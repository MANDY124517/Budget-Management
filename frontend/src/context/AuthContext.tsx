import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse } from '../types';
import { authApi } from '../api/authApi';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { fullName: string; email: string; password: string; defaultCurrency?: string }) => Promise<void>;
  logout: () => void;
  updateUser: (updated: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('smartbudget_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('smartbudget_token');
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('smartbudget_token');
      if (storedToken) {
        try {
          const profile = await authApi.getCurrentUser();
          setUser(profile);
          localStorage.setItem('smartbudget_user', JSON.stringify(profile));
        } catch (e) {
          console.error('Session validation error:', e);
          logout();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const saveAuthSession = (authData: AuthResponse) => {
    localStorage.setItem('smartbudget_token', authData.accessToken);
    localStorage.setItem('smartbudget_refresh_token', authData.refreshToken);
    localStorage.setItem('smartbudget_user', JSON.stringify(authData.user));
    setToken(authData.accessToken);
    setUser(authData.user);
  };

  const login = async (email: string, password: string) => {
    const data = await authApi.login({ email, password });
    saveAuthSession(data);
  };

  const register = async (data: { fullName: string; email: string; password: string; defaultCurrency?: string }) => {
    const res = await authApi.register(data);
    saveAuthSession(res);
  };

  const logout = () => {
    localStorage.removeItem('smartbudget_token');
    localStorage.removeItem('smartbudget_refresh_token');
    localStorage.removeItem('smartbudget_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updated: User) => {
    setUser(updated);
    localStorage.setItem('smartbudget_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
