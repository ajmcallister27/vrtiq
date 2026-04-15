import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, setToken, clearToken, getToken } from '@/api/apiClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    checkUserAuth();
  }, []);

  const checkUserAuth = async () => {
    setIsLoadingAuth(true);
    setAuthError(null);

    const token = getToken();
    if (!token) {
      setUser(null);
      setIsAuthenticated(false);
      setAuthError({ type: 'auth_required', message: 'Authentication required' });
      setIsLoadingAuth(false);
      return;
    }

    try {
      const currentUser = await api.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
    } catch (error) {
      clearToken();
      setUser(null);
      setIsAuthenticated(false);
      setAuthError({ type: 'auth_required', message: 'Authentication required' });
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const login = async (email, password) => {
    setIsLoadingAuth(true);
    setAuthError(null);

    try {
      const { token, user: currentUser } = await api.auth.login(email, password);
      setToken(token);
      setUser(currentUser);
      setIsAuthenticated(true);
      return currentUser;
    } catch (error) {
      clearToken();
      setUser(null);
      setIsAuthenticated(false);
      setAuthError({ type: 'auth_failed', message: error.message });
      throw error;
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const signup = async (email, password, fullName) => {
    setIsLoadingAuth(true);
    setAuthError(null);

    try {
      const { token, user: currentUser } = await api.auth.signup(email, password, fullName);
      setToken(token);
      setUser(currentUser);
      setIsAuthenticated(true);
      return currentUser;
    } catch (error) {
      clearToken();
      setUser(null);
      setIsAuthenticated(false);
      setAuthError({ type: 'signup_failed', message: error.message });
      throw error;
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const logout = async () => {
    clearToken();
    setUser(null);
    setIsAuthenticated(false);
    try {
      await api.auth.logout();
    } catch (err) {
      // ignore
    }
    navigate('/Login');
  };

  const navigateToLogin = () => {
    navigate('/Login');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      authError,
      login,
      signup,
      logout,
      navigateToLogin,
      checkUserAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
