import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, userAPI } from '../lib/api';
import { toast } from '../lib/toast';

interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  year_of_study: number;
  semester_of_study: number;
  specialization?: string;
  profile_picture?: string;
  phone_number?: string;
  is_verified: boolean;
  is_admin: boolean;
  is_disabled: boolean;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (login: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (userData: {
    username: string;
    email: string;
    name: string;
    password: string;
    year_of_study: number;
    semester_of_study: number;
    specialization?: string;
    verification_method: 'email' | 'sms';
    phone_number?: string;
  }) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  console.log('AuthProvider rendering...');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;
  console.log('AuthProvider state:', { isAuthenticated, isLoading, user });

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await userAPI.getProfile();
      setUser(response.data);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (loginValue: string, password: string, rememberMe?: boolean) => {
    console.log('Login attempt for:', loginValue);
    try {
      console.log('Making login API call...');
      const response = await authAPI.login({ login: loginValue, password, remember_me: rememberMe });
      console.log('Login API response:', response);
      const { access_token } = response.data;
      
      console.log('Storing token and fetching profile...');
      localStorage.setItem('authToken', access_token);
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberMe');
      }
      
      // Get user profile
      const profileResponse = await userAPI.getProfile();
      console.log('Profile response:', profileResponse);
      setUser(profileResponse.data);
      
      toast({
        title: "Welcome back!",
        description: "Successfully logged in to your account.",
      });
    } catch (error: any) {
      console.error('Login error:', error);
      const message = error.response?.data?.detail || 'Login failed';
      toast({
        title: "Login failed",
        description: message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const register = async (userData: {
    username: string;
    email: string;
    name: string;
    password: string;
    year_of_study: number;
    semester_of_study: number;
    specialization?: string;
    verification_method: 'email' | 'sms';
    phone_number?: string;
  }) => {
    try {
      await authAPI.register(userData);
      const method = userData.verification_method === 'sms' ? 'SMS' : 'email';
      toast({
        title: "Registration successful!",
        description: `Please check your ${method} for verification code.`,
      });
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Registration failed';
      toast({
        title: "Registration failed",
        description: message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    // Redirect to homepage
    window.location.href = '/';
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};