import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axiosInstance';

export const AuthContext = createContext();

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to get token from either storage
  const getToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');

  useEffect(() => {
    const fetchUser = async () => {
      const token = getToken();
      if (token) {
        try {
          const { data } = await api.get('/auth/profile');
          setUser(data);
        } catch (error) {
          console.error('Session restoration failed:', error.message);
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    fetchUser();

    // Axios interceptor to handle auto-logout on 401
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => api.interceptors.response.eject(interceptor);
  }, []);

  const login = async (email, password, rememberMe = false) => {
    const { data } = await api.post('/auth/login', { email, password, rememberMe });
    
    // Clear old tokens
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');

    if (rememberMe) {
      localStorage.setItem('token', data.token);
    } else {
      sessionStorage.setItem('token', data.token);
    }
    
    setUser(data);
    return data;
  };

  const register = async (name, email, password, course) => {
    const { data } = await api.post('/auth/register', { name, email, password, course });
    // Registration defaults to persistent login for better UX
    localStorage.setItem('token', data.token);
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    setUser(null);
    // Use navigate if available, else window.location. Prevent infinite loop if already on login.
    if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
      window.location.href = '/login';
    }
  };

  const updateUser = (updatedUser) => {
    setUser(prev => ({ ...prev, ...updatedUser }));
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, updateUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
