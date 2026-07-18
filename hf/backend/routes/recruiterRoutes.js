const express = require('express');
const router = express.Router();
const { requireRecruiter } = require('../middleware/roleAuth');
const upload = require('../utils/upload');
const {
  updateRecruiterProfile,
  updateCompanyInfo,
  addExperience,
  getExperiences,
  deleteExperience,
  addSkill,
  getSkills,
  deleteSkill,
  uploadCompanyDocuments,
  completeQuestionnaire
} = require('../controllers/recruiterController');
const {
  getRecruiterInterviews,
  getRecruiterInterview,
  createInterview,
  updateInterview,
  deleteInterview,
  getJobCandidates
} = require('../controllers/recruiterInterviewController');
const {
  getRecruiterJobs,
  getRecruiterJob,
  createJob,
  updateJob,
  deleteJob,
  getJobApplications
} = require('../controllers/recruiterJobController');
const {
  getRecruiterApplications,
  getRecruiterApplication,
  updateApplicationStatus
} = require('../controllers/recruiterApplicationController');
const {
  generateAptitudeTest,
  getRecruiterAptitudeTests,
  getAptitudeTest,
  deleteAptitudeTest
} = require('../controllers/aptitudeTestController');
const {
  getDashboardStats
} = require('../controllers/recruiterDashboardController');

// All routes require recruiter role
router.use(requireRecruiter);

// Dashboard routes
router.get('/dashboard/stats', getDashboardStats);

// Profile routes
router.put('/profile', updateRecruiterProfile);
router.put('/company', updateCompanyInfo);
router.post('/documents', upload.fields([
  { name: 'companyLogo', maxCount: 1 },
  { name: 'businessProof', maxCount: 1 }
]), uploadCompanyDocuments);
router.post('/complete-questionnaire', completeQuestionnaire);

// Experience routes
router.post('/experience', addExperience);
router.get('/experience', getExperiences);
router.delete('/experience/:id', deleteExperience);

// Skill routes
router.post('/skill', addSkill);
router.get('/skill', getSkills);
router.delete('/skill/:id', deleteSkill);

// Interview routes
router.get('/interviews', getRecruiterInterviews);
router.get('/interviews/:id', getRecruiterInterview);
router.post('/interviews', createInterview);
router.put('/interviews/:id', updateInterview);
router.delete('/interviews/:id', deleteInterview);
router.get('/jobs/:jobId/candidates', getJobCandidates);

// Job routes
router.get('/jobs', getRecruiterJobs);
router.get('/jobs/:id', getRecruiterJob);
router.post('/jobs', createJob);
router.put('/jobs/:id', updateJob);
router.delete('/jobs/:id', deleteJob);
router.get('/jobs/:id/applications', getJobApplications);

// Application routes
router.get('/applications', getRecruiterApplications);
router.get('/applications/:id', getRecruiterApplication);
router.put('/applications/:id/status', updateApplicationStatus);

// Aptitude Test routes
router.post('/jobs/:jobId/generate-test', generateAptitudeTest);
router.get('/tests', getRecruiterAptitudeTests);
router.get('/tests/:id', getAptitudeTest);
router.delete('/tests/:id', deleteAptitudeTest);

module.exports = router;

