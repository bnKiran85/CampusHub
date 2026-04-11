import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
});

// Request interceptor to attach token
api.interceptors.request.use(
  (config) => {
    // Check both localStorage and sessionStorage
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (AuthContext adds another one for logout logic)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // We let individual components or the AuthContext handler catch specific 401s if needed
    return Promise.reject(error);
  }
);

export default api;
