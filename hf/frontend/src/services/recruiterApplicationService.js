import api from '../utils/api';

export const getRecruiterApplications = (params = {}) => {
  return api.get('/recruiter/applications', { params });
};

export const getRecruiterApplication = (id) => {
  return api.get(`/recruiter/applications/${id}`);
};

export const updateApplicationStatus = (id, status) => {
  return api.put(`/recruiter/applications/${id}/status`, { status });
};







