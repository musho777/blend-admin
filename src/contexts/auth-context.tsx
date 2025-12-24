import React, { useState, useEffect, useContext, createContext } from 'react';

import { apiService } from '../services/api';

import type { LoginCredentials } from '../services/api';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        const userData = await apiService.verifyToken();
        const userFromToken = {
          id: '', 
          username: userData.email.split('@')[0],
          email: userData.email,
          role: userData.role
        };
        setUser(userFromToken);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      console.log('Auth context: Starting login...');
      const response = await apiService.login(credentials);
      console.log('Auth context: Login response:', response);
      
      // Create user object from the response
      const userFromResponse = {
        id: '', // We'll get this from the JWT token decode or a separate call
        username: response.email.split('@')[0], // Use email prefix as username
        email: response.email,
        role: response.role
      };
      
      setUser(userFromResponse);
      console.log('Auth context: User set to:', userFromResponse);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}