import api from '../utils/api';

export const getRecruiterAptitudeTests = () => {
  return api.get('/recruiter/tests');
};

export const getAptitudeTest = (id) => {
  return api.get(`/recruiter/tests/${id}`);
};

export const deleteAptitudeTest = (id) => {
  return api.delete(`/recruiter/tests/${id}`);
};

export const generateAptitudeTest = (jobId, numberOfQuestions = 10, passingPercentage = null, timeLimit = null) => {
  return api.post(`/recruiter/jobs/${jobId}/generate-test`, { numberOfQuestions, passingPercentage, timeLimit });
};

