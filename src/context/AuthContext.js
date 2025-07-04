import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Create a centralized Axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 10000,
});

// Add a response interceptor for automatic token refresh
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    // If 401 and not already retried, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Prevent infinite retry loops
      if (originalRequest.url.includes('/auth/refresh')) {
        // If refresh token fails, force logout
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        try {
          // Attempt to refresh the token
          const refreshResponse = await axios.post('/api/auth/refresh', { refreshToken });
          const { token: newToken, refreshToken: newRefreshToken } = refreshResponse.data;
          
          // Update stored tokens
          localStorage.setItem('token', newToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }
          
          // Update the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          
          // Retry the original request with the new token
          return api(originalRequest);
        } catch (refreshError) {
          // If refresh fails, clear auth and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login?sessionExpired=true';
          return Promise.reject(refreshError);
        }
      }
    }
    
    // For other errors, just reject
    return Promise.reject(error);
  }
);

// Add request interceptor to always include token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('user');
    try {
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('refreshToken'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  }, [token]);
  useEffect(() => {
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    else localStorage.removeItem('refreshToken');
  }, [refreshToken]);
  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  // Listen for token refresh and update context
  useEffect(() => {
    const handler = () => {
      const newToken = localStorage.getItem('token');
      setToken(newToken);
    };
    window.addEventListener('tokenRefreshed', handler);
    return () => window.removeEventListener('tokenRefreshed', handler);
  }, []);

  const login = (user, token, refreshToken) => {
    setUser(user);
    setToken(token);
    setRefreshToken(refreshToken);
  };

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      if (token && refreshToken) {
        await axios.post('/api/auth/logout', { refreshToken }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setUser(null);
      setToken(null);
      setRefreshToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setLoading(false);
    }
  }, [token, refreshToken]);

  const refresh = useCallback(async () => {
    if (!refreshToken) return;
    try {
      const res = await axios.post('/api/auth/refresh', { refreshToken });
      setToken(res.data.token);
    } catch (e) {
      console.error('Token refresh error:', e);
      logout();
    }
  }, [refreshToken, logout]);

  // Optionally, auto-refresh token every 10 minutes
  useEffect(() => {
    if (!refreshToken) return;
    const interval = setInterval(() => {
      refresh();
    }, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshToken, refresh]);

  return (
    <AuthContext.Provider value={{ user, token, refreshToken, login, logout, refresh, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Export the api instance for use in all requests
export { api }; 