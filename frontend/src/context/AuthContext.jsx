import React, { createContext, useState, useEffect, useCallback } from 'react';
import authApi from '../services/authApi';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('tapasya_token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check authenticated session on startup
  const checkAuth = useCallback(async () => {
    const storedToken = localStorage.getItem('tapasya_token');
    if (!storedToken) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await authApi.getMe();
      if (res.success && res.user) {
        setUser(res.user);
        setToken(storedToken);
      } else {
        localStorage.removeItem('tapasya_token');
        setUser(null);
        setToken(null);
      }
    } catch (err) {
      localStorage.removeItem('tapasya_token');
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await authApi.login(email, password);
      if (res.success && res.token && res.user) {
        localStorage.setItem('tapasya_token', res.token);
        setToken(res.token);
        setUser(res.user);
        return { success: true };
      }
      throw new Error(res.message || 'Login failed.');
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  const register = async (name, email, password) => {
    setError(null);
    try {
      const res = await authApi.register(name, email, password);
      if (res.success && res.token && res.user) {
        localStorage.setItem('tapasya_token', res.token);
        setToken(res.token);
        setUser(res.user);
        return { success: true };
      }
      throw new Error(res.message || 'Registration failed.');
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  const googleLogin = async (credential) => {
    setError(null);
    try {
      const res = await authApi.googleLogin(credential);
      if (res.success && res.token && res.user) {
        localStorage.setItem('tapasya_token', res.token);
        setToken(res.token);
        setUser(res.user);
        return { success: true };
      }
      throw new Error(res.message || 'Google authentication failed.');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Google authentication failed.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('tapasya_token');
      setUser(null);
      setToken(null);
    }
  };

  const updateUser = (updatedUserData) => {
    setUser((prev) => (prev ? { ...prev, ...updatedUserData } : updatedUserData));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        error,
        login,
        register,
        googleLogin,
        logout,
        checkAuth,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
