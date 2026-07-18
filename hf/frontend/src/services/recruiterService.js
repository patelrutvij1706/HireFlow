import api from '../utils/api';

export const updateRecruiterProfile = (data) => {
  return api.put('/recruiter/profile', data);
};

export const updateCompanyInfo = (data) => {
  return api.put('/recruiter/company', data);
};

export const addExperience = (data) => {
  return api.post('/recruiter/experience', data);
};

export const getExperiences = () => {
  return api.get('/recruiter/experience');
};

export const deleteExperience = (id) => {
  return api.delete(`/recruiter/experience/${id}`);
};

export const addSkill = (data) => {
  return api.post('/recruiter/skill', data);
};

export const getSkills = () => {
  return api.get('/recruiter/skill');
};

export const deleteSkill = (id) => {
  return api.delete(`/recruiter/skill/${id}`);
};

export const uploadCompanyDocuments = (files, domainEmail) => {
  const formData = new FormData();
  if (files.companyLogo) {
    formData.append('companyLogo', files.companyLogo);
  }
  if (files.businessProof) {
    formData.append('businessProof', files.businessProof);
  }
  if (domainEmail) {
    formData.append('domainEmail', domainEmail);
  }
  return api.post('/recruiter/documents', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const completeQuestionnaire = () => {
  return api.post('/recruiter/complete-questionnaire');
};

export const getSettings = () => {
  return api.get('/recruiter/settings');
};

export const updateSettings = (data) => {
  return api.put('/recruiter/settings', data);
};
