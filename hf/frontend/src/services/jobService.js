import api from '../utils/api';

// Get all jobs with filters
export const getJobs = async (params = {}) => {
  try {
    const response = await api.get('/jobs', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get job by ID
export const getJobById = async (id) => {
  try {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Apply for a job
export const applyForJob = async (jobId, resumeFile, coverLetterFile = null, coverLetterText = null) => {
  try {
    const formData = new FormData();
    
    // Resume is required
    if (resumeFile) {
      formData.append('resume', resumeFile);
    }
    
    // Cover letter file (optional) - if file is provided, use it
    if (coverLetterFile) {
      formData.append('coverLetter', coverLetterFile);
    } else if (coverLetterText) {
      // If no file, send text as a regular field (will be in req.body.coverLetter)
      // Note: Multer will ignore non-file fields, so we need to send text separately
      // For now, we'll handle this by sending text only if no file is provided
      formData.append('coverLetterText', coverLetterText);
    }
    
    const response = await api.post(`/jobs/${jobId}/apply`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Save/Unsave a job
export const toggleSaveJob = async (jobId) => {
  try {
    const response = await api.post(`/jobs/${jobId}/save`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get saved jobs
export const getSavedJobs = async () => {
  try {
    const response = await api.get('/jobs/saved/all');
    return response.data;
  } catch (error) {
    throw error;
  }
};

