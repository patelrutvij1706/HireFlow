const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Job = require('./Job');

const JobSkill = sequelize.define('JobSkill', {
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
  skillName: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'job_skills',
  timestamps: true
});

// Define associations
Job.hasMany(JobSkill, { foreignKey: 'jobId', as: 'skills' });
JobSkill.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });

module.exports = JobSkill;

