import api from '../utils/api';

export const checkTestAvailability = (jobId) => {
  return api.get(`/candidate/jobs/${jobId}/test/check`);
};

export const getTestForJob = (jobId) => {
  return api.get(`/candidate/jobs/${jobId}/test`);
};

export const submitTest = (jobId, answers, applicationId) => {
  return api.post(`/candidate/jobs/${jobId}/test/submit`, { answers, applicationId });
};

export const getTestResult = (jobId) => {
  return api.get(`/candidate/jobs/${jobId}/test/result`);
};

