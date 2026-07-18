import api from '../utils/api';

export const getRecruiterJobs = (params = {}) => {
  return api.get('/recruiter/jobs', { params });
};

export const getRecruiterJob = (id) => {
  return api.get(`/recruiter/jobs/${id}`);
};

export const createJob = (data) => {
  return api.post('/recruiter/jobs', data);
};

export const updateJob = (id, data) => {
  return api.put(`/recruiter/jobs/${id}`, data);
};

export const deleteJob = (id) => {
  return api.delete(`/recruiter/jobs/${id}`);
};

export const getJobApplications = (id) => {
  return api.get(`/recruiter/jobs/${id}/applications`);
};

export const generateAptitudeTest = (jobId, numberOfQuestions = 10, passingPercentage = null, timeLimit = null) => {
  return api.post(`/recruiter/jobs/${jobId}/generate-test`, { numberOfQuestions, passingPercentage, timeLimit });
};






