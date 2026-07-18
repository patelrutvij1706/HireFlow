import api from '../utils/api';

export const getApplications = () => {
  return api.get('/candidate/applications');
};

export const getApplication = (id) => {
  return api.get(`/candidate/applications/${id}`);
};

export const getApplicationStatus = (id) => {
  return api.get(`/candidate/applications/${id}/status`);
};

