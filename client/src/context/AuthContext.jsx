import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import {
  signInWithGoogle,
  signInWithFacebook,
  logoutFirebase,
} from '../services/firebaseAuthService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('aurasole_token') || null);
  const [isLoading, setIsLoading] = useState(true);
  const [authNotification, setAuthNotification] = useState(null);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('aurasole_token');
      if (storedToken) {
        try {
          const response = await authService.getMe();
          if (response?.data) {
            setUser(response.data);
          }
        } catch (error) {
          console.warn('Session expired or invalid, logging out silently.');
          localStorage.removeItem('aurasole_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const response = await authService.login({ email, password });
    if (response?.data?.token) {
      localStorage.setItem('aurasole_token', response.data.token);
      setToken(response.data.token);
      setUser(response.data.user);
      setAuthNotification({
        type: 'returning',
        message: `Welcome back, ${response.data.user?.name?.split(' ')[0] || 'Friend'}! 👋`,
      });
    }
    return response;
  };

  const register = async (userData) => {
    const response = await authService.register(userData);
    if (response?.data?.token) {
      localStorage.setItem('aurasole_token', response.data.token);
      setToken(response.data.token);
      setUser(response.data.user);
      setAuthNotification({
        type: 'new',
        message: `Welcome to AuraSole, ${response.data.user?.name?.split(' ')[0] || 'Friend'}! 🎉 Let's complete your profile.`,
      });
    }
    return response;
  };

  /**
   * Google OAuth Login via Firebase
   */
  const loginGoogle = async () => {
    const fbUser = await signInWithGoogle();
    const syncRes = await authService.firebaseSync({
      firebaseUid: fbUser.uid,
      email: fbUser.email,
      name: fbUser.displayName || 'Valued Footwear Guest',
      photoURL: fbUser.photoURL || null,
      loginProvider: 'GOOGLE',
    });

    if (syncRes?.data?.token) {
      localStorage.setItem('aurasole_token', syncRes.data.token);
      setToken(syncRes.data.token);
      setUser(syncRes.data.user);
      setAuthNotification({
        type: syncRes.data.isNewCustomer ? 'new' : 'returning',
        message: syncRes.data.isNewCustomer
          ? `Welcome to AuraSole Footwear, ${syncRes.data.user?.name?.split(' ')[0] || 'Friend'}! 🎉`
          : `Welcome back, ${syncRes.data.user?.name?.split(' ')[0] || 'Friend'}! 👋`,
      });
    }
    return syncRes.data;
  };

  /**
   * Facebook OAuth Login via Firebase
   */
  const loginFacebook = async () => {
    const fbUser = await signInWithFacebook();
    const syncRes = await authService.firebaseSync({
      firebaseUid: fbUser.uid,
      email: fbUser.email || `${fbUser.uid}@facebook.com`,
      name: fbUser.displayName || 'Valued Footwear Guest',
      photoURL: fbUser.photoURL || null,
      loginProvider: 'FACEBOOK',
    });

    if (syncRes?.data?.token) {
      localStorage.setItem('aurasole_token', syncRes.data.token);
      setToken(syncRes.data.token);
      setUser(syncRes.data.user);
      setAuthNotification({
        type: syncRes.data.isNewCustomer ? 'new' : 'returning',
        message: syncRes.data.isNewCustomer
          ? `Welcome to AuraSole Footwear, ${syncRes.data.user?.name?.split(' ')[0] || 'Friend'}! 🎉`
          : `Welcome back, ${syncRes.data.user?.name?.split(' ')[0] || 'Friend'}! 👋`,
      });
    }
    return syncRes.data;
  };

  /**
   * Complete Customer Onboarding Flow
   */
  const submitOnboarding = async (onboardingData) => {
    const response = await authService.completeOnboarding(onboardingData);
    if (response?.data) {
      setUser(response.data);
      setAuthNotification({
        type: 'success',
        message: 'Your footwear profile has been saved successfully! Enjoy shopping.',
      });
    }
    return response;
  };

  const logout = async () => {
    try {
      await authService.logout();
      await logoutFirebase();
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('aurasole_token');
      setToken(null);
      setUser(null);
      setAuthNotification(null);
    }
  };

  const updateUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  };

  const clearNotification = () => setAuthNotification(null);

  const loginWithToken = (newToken, userData) => {
    localStorage.setItem('aurasole_token', newToken);
    localStorage.setItem('adminToken', newToken);
    setToken(newToken);
    if (userData) setUser(userData);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN',
    isLoading,
    authNotification,
    clearNotification,
    login,
    loginWithToken,
    register,
    loginGoogle,
    loginFacebook,
    submitOnboarding,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
