import api from '../utils/api';

export const updateCandidateProfile = (data) => {
  return api.put('/candidate/profile', data);
};

export const addEducation = (data) => {
  return api.post('/candidate/education', data);
};

export const getEducations = () => {
  return api.get('/candidate/education');
};

export const deleteEducation = (id) => {
  return api.delete(`/candidate/education/${id}`);
};

export const addExperience = (data) => {
  return api.post('/candidate/experience', data);
};

export const getExperiences = () => {
  return api.get('/candidate/experience');
};

export const deleteExperience = (id) => {
  return api.delete(`/candidate/experience/${id}`);
};

export const addSkill = (data) => {
  return api.post('/candidate/skill', data);
};

export const getSkills = () => {
  return api.get('/candidate/skill');
};

export const deleteSkill = (id) => {
  return api.delete(`/candidate/skill/${id}`);
};

export const uploadResume = (file) => {
  const formData = new FormData();
  formData.append('resume', file);
  return api.post('/candidate/resume', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const completeQuestionnaire = () => {
  return api.post('/candidate/complete-questionnaire');
};

export const parseResume = (file) => {
  const formData = new FormData();
  formData.append('resume', file);
  return api.post('/candidate/parse-resume', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getSettings = () => {
  return api.get('/candidate/settings');
};

export const updateSettings = (data) => {
  return api.put('/candidate/settings', data);
};

