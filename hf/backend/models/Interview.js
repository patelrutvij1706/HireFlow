const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Recruiter = require('./Recruiter');
const Job = require('./Job');
const Candidate = require('./Candidate');

const useInMemoryDb = process.env.USE_IN_MEMORY_DB === 'true';
const enumOrString = (...values) => (useInMemoryDb ? DataTypes.STRING : DataTypes.ENUM(...values));

const Interview = sequelize.define('Interview', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  recruiterId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Recruiter,
      key: 'id'
    }
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
  interviewDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  interviewTime: {
    type: DataTypes.STRING,
    allowNull: false
  },
  mode: {
    type: enumOrString('Online', 'Offline'),
    allowNull: false,
    defaultValue: 'Online'
  },
  status: {
    type: enumOrString('Scheduled', 'Completed', 'Canceled'),
    allowNull: false,
    defaultValue: 'Scheduled'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  meetingLink: {
    type: DataTypes.STRING,
    allowNull: true
  },
  rescheduleRequestReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  rescheduleRequestedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'interviews',
  timestamps: true
});

// Define associations
Recruiter.hasMany(Interview, { foreignKey: 'recruiterId', as: 'interviews' });
Interview.belongsTo(Recruiter, { foreignKey: 'recruiterId', as: 'recruiter' });

Job.hasMany(Interview, { foreignKey: 'jobId', as: 'interviews' });
Interview.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });

Candidate.hasMany(Interview, { foreignKey: 'candidateId', as: 'interviews' });
Interview.belongsTo(Candidate, { foreignKey: 'candidateId', as: 'candidate' });

module.exports = Interview;

