import React, { createContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('study_token') || null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Check current session on initial load
  useEffect(() => {
    const loadUser = async () => {
      const storedToken = localStorage.getItem('study_token');
      const storedUser = localStorage.getItem('study_user');

      if (storedToken) {
        try {
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
          // Validate with backend
          const res = await authAPI.getMe();
          if (res.data?.success && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('study_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Session verification failed:', err.message);
          localStorage.removeItem('study_token');
          localStorage.removeItem('study_user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await authAPI.login({ email, password });
      const { user: loggedInUser, token: authToken } = res.data;

      localStorage.setItem('study_token', authToken);
      localStorage.setItem('study_user', JSON.stringify(loggedInUser));

      setToken(authToken);
      setUser(loggedInUser);
      setLoading(false);
      return { success: true, user: loggedInUser };
    } catch (err) {
      setLoading(false);
      const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setAuthError(message);
      return { success: false, error: message };
    }
  };

  // Register handler
  const register = async (name, email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await authAPI.register({ name, email, password });
      const { user: newUser, token: authToken } = res.data;

      localStorage.setItem('study_token', authToken);
      localStorage.setItem('study_user', JSON.stringify(newUser));

      setToken(authToken);
      setUser(newUser);
      setLoading(false);
      return { success: true, user: newUser };
    } catch (err) {
      setLoading(false);
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      setAuthError(message);
      return { success: false, error: message };
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      // Ignore backend logout error if any
    }
    localStorage.removeItem('study_token');
    localStorage.removeItem('study_user');
    setToken(null);
    setUser(null);
  };

  // Profile update handler
  const updateUserData = (updatedData) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedData };
      localStorage.setItem('study_user', JSON.stringify(merged));
      return merged;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        authError,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        updateUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
