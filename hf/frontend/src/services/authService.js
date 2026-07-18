import api from '../utils/api';

export const signup = async (userData) => {
  const response = await api.post('/auth/signup', userData);
  if (response.data.success && response.data.data.token) {
    localStorage.setItem('token', response.data.data.token);
  }
  return response.data;
};

export const signin = async (credentials) => {
  const response = await api.post('/auth/signin', credentials);
  if (response.data.success && response.data.data.token) {
    localStorage.setItem('token', response.data.data.token);
  }
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
};

export const changePassword = async (passwords) => {
  const response = await api.post('/auth/change-password', passwords);
  return response.data;
};

