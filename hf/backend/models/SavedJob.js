const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Job = require('./Job');
const Candidate = require('./Candidate');

const SavedJob = sequelize.define('SavedJob', {
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
  }
}, {
  tableName: 'saved_jobs',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['jobId', 'candidateId']
    }
  ]
});

// Define associations
Job.hasMany(SavedJob, { foreignKey: 'jobId', as: 'savedBy' });
SavedJob.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });

Candidate.hasMany(SavedJob, { foreignKey: 'candidateId', as: 'savedJobs' });
SavedJob.belongsTo(Candidate, { foreignKey: 'candidateId', as: 'candidate' });

module.exports = SavedJob;

