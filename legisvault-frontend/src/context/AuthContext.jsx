import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import api from '../api/axios';

/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} name
 * @property {string} email
 * @property {('admin'|'uploader'|'viewer')} role
 * @property {boolean} [is_active]
 */

/**
 * @typedef {Object} AuthContextType
 * @property {User|null} user
 * @property {string|null} token
 * @property {boolean} isAuthenticated
 * @property {boolean} loading
 * @property {boolean} isAdmin
 * @property {boolean} isUploader
 * @property {boolean} isViewer
 * @property {(credentials: {email: string, password: string}) => Promise<User>} login
 * @property {() => Promise<void>} logout
 * @property {(userData: object) => Promise<User>} register
 * @property {(role: string|string[]) => boolean} checkRole
 */

export const AuthContext = createContext(/** @type {AuthContextType|null} */ (null));

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Synchronize auth state with API on boot if token exists
  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const response = await api.get('/me');
        if (isMounted && response.data) {
          const currentUser = response.data.user || response.data;
          setUser(currentUser);
          localStorage.setItem('user', JSON.stringify(currentUser));
        }
      } catch (err) {
        console.warn('Session verification fallback to stored user:', err.message);
        // If server is offline or fails, keep cached user if available
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    verifySession();
    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Performs user login
   */
  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      // Attempt backend API call
      const response = await api.post('/login', { email, password });
      const { user: userData, token: authToken } = response.data;

      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setToken(authToken);
      setUser(userData);
      return userData;
    } catch (err) {
      // In development / demo mode when backend server is offline, provide helpful fallback
      if (err.code === 'ERR_NETWORK' || !err.response) {
        console.warn('API server unreachable, initiating offline demo session.');
        let fallbackRole = 'admin';
        if (email.includes('uploader')) fallbackRole = 'uploader';
        if (email.includes('viewer')) fallbackRole = 'viewer';

        const mockUser = {
          id: 1,
          name: email.split('@')[0].replace('.', ' ').toUpperCase() || 'Admin User',
          email,
          role: fallbackRole,
          is_active: true,
        };
        const mockToken = 'mock-sanctum-token-' + Date.now();

        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(mockUser));
        setToken(mockToken);
        setUser(mockUser);
        return mockUser;
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Registers a new user
   */
  const register = useCallback(async (userData) => {
    setLoading(true);
    try {
      const response = await api.post('/register', userData);
      const { user: newUser, token: authToken } = response.data;

      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(newUser));

      setToken(authToken);
      setUser(newUser);
      return newUser;
    } catch (err) {
      if (err.code === 'ERR_NETWORK' || !err.response) {
        const mockUser = {
          id: Date.now(),
          name: userData.name,
          email: userData.email,
          role: userData.role || 'viewer',
          is_active: true,
        };
        const mockToken = 'mock-register-token-' + Date.now();
        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(mockUser));
        setToken(mockToken);
        setUser(mockUser);
        return mockUser;
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Logs out user and destroys credentials
   */
  const logout = useCallback(async () => {
    try {
      if (token) {
        await api.post('/logout').catch(() => null);
      }
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    }
  }, [token]);

  // Role checking helpers
  const isAdmin = useMemo(() => user?.role === 'admin', [user]);
  const isUploader = useMemo(() => user?.role === 'uploader' || user?.role === 'admin', [user]);
  const isViewer = useMemo(() => Boolean(user), [user]);

  const checkRole = useCallback((requiredRole) => {
    if (!user) return false;
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role);
    }
    return user.role === requiredRole;
  }, [user]);

  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated: Boolean(token && user),
    loading,
    isAdmin,
    isUploader,
    isViewer,
    login,
    logout,
    register,
    checkRole,
  }), [user, token, loading, isAdmin, isUploader, isViewer, login, logout, register, checkRole]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
