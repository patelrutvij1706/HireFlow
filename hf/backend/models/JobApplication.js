const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Job = require('./Job');
const Candidate = require('./Candidate');

const useInMemoryDb = process.env.USE_IN_MEMORY_DB === 'true';
const enumOrString = (...values) => (useInMemoryDb ? DataTypes.STRING : DataTypes.ENUM(...values));

const JobApplication = sequelize.define('JobApplication', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  jobId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Job,
      key: 'id'
    }
  },
  candidateId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Candidate,
      key: 'id'
    }
  },
  status: {
    type: enumOrString('Applied', 'Under Review', 'Interview', 'Offer', 'Rejected'),
    defaultValue: 'Applied'
  },
  resumeUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  coverLetter: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  coverLetterUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  appliedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'job_applications',
  timestamps: true
});

// Define associations
Job.hasMany(JobApplication, { foreignKey: 'jobId', as: 'applications' });
JobApplication.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });

Candidate.hasMany(JobApplication, { foreignKey: 'candidateId', as: 'jobApplications' });
JobApplication.belongsTo(Candidate, { foreignKey: 'candidateId', as: 'candidate' });

module.exports = JobApplication;

