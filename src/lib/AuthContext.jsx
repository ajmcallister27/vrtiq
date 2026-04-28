import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, setToken, clearToken, getToken } from '@/api/apiClient';

const AuthContext = createContext();
const CACHED_USER_KEY = 'vrtIQ_cached_user';

function decodeJwtPayload(token) {
  try {
    const parts = String(token || '').split('.');
    if (parts.length < 2) return null;

    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const payload = JSON.parse(window.atob(padded));

    if (!payload?.email) return null;
    return {
      email: payload.email,
      role: payload.role || 'user',
      full_name: payload.email,
      isRecovered: true,
    };
  } catch {
    return null;
  }
}

function getCachedUser() {
  try {
    const raw = localStorage.getItem(CACHED_USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && parsed.email ? parsed : null;
  } catch {
    return null;
  }
}

function setCachedUser(user) {
  if (!user) return;
  localStorage.setItem(CACHED_USER_KEY, JSON.stringify(user));
}

function clearCachedUser() {
  localStorage.removeItem(CACHED_USER_KEY);
}

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
      clearCachedUser();
      setIsLoadingAuth(false);
      return;
    }

    const recoveredUser = getCachedUser() || decodeJwtPayload(token);
    if (recoveredUser) {
      setUser(recoveredUser);
      setIsAuthenticated(true);
      setCachedUser(recoveredUser);
    }

    try {
      const currentUser = await api.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
      setCachedUser(currentUser);
    } catch (error) {
      if (!recoveredUser) {
        setUser(null);
        setIsAuthenticated(false);
        setAuthError({ type: 'auth_unavailable', message: 'Unable to verify session right now.' });
      }
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
      setCachedUser(currentUser);
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
      setCachedUser(currentUser);
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
    clearCachedUser();
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
