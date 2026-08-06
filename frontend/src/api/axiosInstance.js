import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
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
    // Extracting error message centrally can be done here.
    if (error.response && error.response.data && error.response.data.message) {
      error.message = error.response.data.message;
    } else if (!error.response && error.request) {
      error.message = 'Network Error. Please check your connection or try again later.';
    }
    return Promise.reject(error);
  }
);

export default api;
