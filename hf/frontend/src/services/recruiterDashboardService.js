import api from '../utils/api';

export const getDashboardStats = () => {
  return api.get('/recruiter/dashboard/stats');
};

