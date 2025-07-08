'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '@/lib/eden';

// Define User type based on your backend response
interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signin: (email: string, password: string) => Promise<void>;
  signup: (userData: { name: string; email: string; phone: string; password: string }) => Promise<void>;
  signout: () => Promise<void>;
  clearError: () => void;
}

// Create a default context value
const defaultAuthContext: AuthContextType = {
  user: null,
  loading: true,
  error: null,
  signin: async () => {
    throw new Error('AuthProvider not initialized');
  },
  signup: async () => {
    throw new Error('AuthProvider not initialized');
  },
  signout: async () => {
    throw new Error('AuthProvider not initialized');
  },
  clearError: () => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Ensure we're mounted before accessing localStorage
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if user is already authenticated after mount
  useEffect(() => {
    if (mounted) {
      checkAuth();
    }
  }, [mounted]);

  const checkAuth = async () => {
    try {
      // Check if we have user data in localStorage
      const userData = localStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        console.log('User data found, user appears to be authenticated');
        setUser(user);
      } else {
        console.log('No user data found, user not authenticated');
      }
    } catch (error) {
      console.log('Error checking auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const signin = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authApi.signin({ email, password });
      
      if (response.success && response.user) {
        // Store user data in localStorage for persistence
        localStorage.setItem('user_data', JSON.stringify(response.user));
        setUser(response.user);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData: { name: string; email: string; phone: string; password: string }) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authApi.signup(userData);
      
      if (response.success && response.user) {
        // Store user data in localStorage for persistence
        localStorage.setItem('user_data', JSON.stringify(response.user));
        setUser(response.user);
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signout = async () => {
    try {
      await authApi.signout();
      // Clear local storage
      localStorage.removeItem('user_data');
      localStorage.removeItem('auth_token');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear user even if logout request fails
      localStorage.removeItem('user_data');
      localStorage.removeItem('auth_token');
      setUser(null);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    signin,
    signup,
    signout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === defaultAuthContext) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 