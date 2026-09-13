import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT access token to every outgoing request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('smartbudget_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 Unauthorized globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login if not already there
      const isAuthEndpoint = error.config?.url?.includes('/auth/');
      if (!isAuthEndpoint && window.location.pathname !== '/login') {
        localStorage.removeItem('smartbudget_token');
        localStorage.removeItem('smartbudget_refresh_token');
        localStorage.removeItem('smartbudget_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
