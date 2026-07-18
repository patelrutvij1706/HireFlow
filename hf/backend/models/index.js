const { sequelize, testConnection } = require('../config/database');

// Import all models
const User = require('./User');
const Candidate = require('./Candidate');
const Recruiter = require('./Recruiter');
const Education = require('./Education');
const Experience = require('./Experience');
const Skill = require('./Skill');
const RecruiterExperience = require('./RecruiterExperience');
const RecruiterSkill = require('./RecruiterSkill');
const Job = require('./Job');
const JobSkill = require('./JobSkill');
const JobApplication = require('./JobApplication');
const SavedJob = require('./SavedJob');
const Interview = require('./Interview');
const AptitudeTest = require('./AptitudeTest');
const AptitudeQuestion = require('./AptitudeQuestion');
const TestSubmission = require('./TestSubmission');

// Define associations for AptitudeTest and AptitudeQuestion
Job.hasMany(AptitudeTest, { foreignKey: 'jobId', as: 'aptitudeTests' });
AptitudeTest.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });

Recruiter.hasMany(AptitudeTest, { foreignKey: 'recruiterId', as: 'aptitudeTests' });
AptitudeTest.belongsTo(Recruiter, { foreignKey: 'recruiterId', as: 'recruiter' });

AptitudeTest.hasMany(AptitudeQuestion, { foreignKey: 'testId', as: 'questions' });
AptitudeQuestion.belongsTo(AptitudeTest, { foreignKey: 'testId', as: 'test' });

// TestSubmission associations
AptitudeTest.hasMany(TestSubmission, { foreignKey: 'testId', as: 'submissions' });
TestSubmission.belongsTo(AptitudeTest, { foreignKey: 'testId', as: 'test' });

Candidate.hasMany(TestSubmission, { foreignKey: 'candidateId', as: 'testSubmissions' });
TestSubmission.belongsTo(Candidate, { foreignKey: 'candidateId', as: 'candidate' });

JobApplication.hasOne(TestSubmission, { foreignKey: 'jobApplicationId', as: 'testSubmission' });
TestSubmission.belongsTo(JobApplication, { foreignKey: 'jobApplicationId', as: 'jobApplication' });

// Sync database
const syncDatabase = async (force = false) => {
  try {
    await testConnection();
    await sequelize.sync({ force, alter: true }); // Use alter: true to add new columns
    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Error synchronizing database:', error);
    throw error; // Re-throw to handle in server startup
  }
};

module.exports = {
  sequelize,
  User,
  Candidate,
  Recruiter,
  Education,
  Experience,
  Skill,
  RecruiterExperience,
  RecruiterSkill,
  Job,
  JobSkill,
  JobApplication,
  SavedJob,
  Interview,
  AptitudeTest,
  AptitudeQuestion,
  TestSubmission,
  syncDatabase
};

