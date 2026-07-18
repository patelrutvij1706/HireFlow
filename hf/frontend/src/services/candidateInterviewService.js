import api from '../utils/api';

export const getCandidateInterviews = (params = {}) => {
  return api.get('/candidate/interviews', { params });
};

export const getCandidateInterview = (id) => {
  return api.get(`/candidate/interviews/${id}`);
};

export const requestReschedule = (id, reason) => {
  return api.post(`/candidate/interviews/${id}/reschedule`, { reason });
};

