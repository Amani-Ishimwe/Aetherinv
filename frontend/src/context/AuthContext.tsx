import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

export type UserRole = 
  | 'Super Admin' 
  | 'Admin' 
  | 'Inventory Manager' 
  | 'Sales Staff' 
  | 'Warehouse Staff' 
  | 'Accountant' 
  | 'Viewer';

interface User {
  firstname?: string;
  lastname?: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (firstname: string, lastname: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUserRole: (role: UserRole) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if token and user info exist in storage
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        const parsedUser = JSON.parse(storedUser);
        // Default role to Super Admin if not present
        if (!parsedUser.role) {
          parsedUser.role = 'Super Admin';
        }
        setUser(parsedUser);
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);

    // Setup unauthorized listener
    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth-unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth-unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const response = await api.post('/auth/authenticate', { email, password });
      const { token: jwtToken } = response.data;
      
      const userData: User = { 
        email, 
        role: 'Super Admin' // Defaults to Super Admin on login
      };
      
      localStorage.setItem('token', jwtToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(jwtToken);
      setUser(userData);
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Authentication failed. Please check your credentials.';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const register = async (firstname: string, lastname: string, email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const response = await api.post('/auth/register', { firstname, lastname, email, password });
      const { token: jwtToken } = response.data;
      
      const userData: User = { 
        firstname, 
        lastname, 
        email, 
        role: 'Super Admin' 
      };
      
      localStorage.setItem('token', jwtToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(jwtToken);
      setUser(userData);
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Registration failed. Email might already be in use.';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = (role: UserRole) => {
    if (user) {
      const updatedUser = { ...user, role };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('aetherinv_screen');
    setToken(null);
    setUser(null);
    setError(null);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        updateUserRole,
        error,
        setError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
