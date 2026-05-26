import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.DEV ? '' : 'https://campus-resell.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT bearer token if present in local storage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: handle unauthorized responses globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and reload if unauthorized (optional logout handler)
      localStorage.removeItem('token');
      // Only reload if we are not on the login page already
      if (!window.location.pathname.includes('/auth') && window.location.pathname !== '/') {
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
