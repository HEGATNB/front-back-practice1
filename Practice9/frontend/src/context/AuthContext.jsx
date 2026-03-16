import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth } from '../api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const accessToken = localStorage.getItem('accessToken');
    console.log('Saved user from localStorage:', savedUser);
    console.log('Access token present:', !!accessToken);

    if (savedUser && savedUser !== 'undefined' && accessToken) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log('Parsed user:', parsedUser);
        setUser(parsedUser);

        auth.getMe().catch(() => {
          console.log('Token might be expired, refresh interceptor will handle it');
        });
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    console.log('Login called with:', userData);
    setUser(userData);
  };

  const logout = async () => {
    console.log('Logout called');
    await auth.logout();
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};