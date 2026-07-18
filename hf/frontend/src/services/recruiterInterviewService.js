import api from '../utils/api';

export const getRecruiterInterviews = (params = {}) => {
  return api.get('/recruiter/interviews', { params });
};

export const getRecruiterInterview = (id) => {
  return api.get(`/recruiter/interviews/${id}`);
};

export const createInterview = (data) => {
  return api.post('/recruiter/interviews', data);
};

export const updateInterview = (id, data) => {
  return api.put(`/recruiter/interviews/${id}`, data);
};

export const deleteInterview = (id) => {
  return api.delete(`/recruiter/interviews/${id}`);
};

export const getJobCandidates = (jobId) => {
  return api.get(`/recruiter/jobs/${jobId}/candidates`);
};







