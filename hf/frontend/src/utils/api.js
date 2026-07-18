import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
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

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

// Utility function to get the base URL for static files (without /api)
export const getFileUrl = (filePath) => {
  if (!filePath) return '';
  if (filePath.startsWith('http')) return filePath;
  
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  // Remove /api from the URL for static files
  const baseUrl = apiUrl.replace('/api', '');
  // Ensure filePath starts with /
  const normalizedPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
  return `${baseUrl}${normalizedPath}`;
};

export default api;

