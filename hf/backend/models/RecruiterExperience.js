const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Recruiter = require('./Recruiter');

const RecruiterExperience = sequelize.define('RecruiterExperience', {
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
  companyName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fromDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  toDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isCurrent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'recruiter_experiences',
  timestamps: true
});

Recruiter.hasMany(RecruiterExperience, { foreignKey: 'recruiterId', as: 'experiences' });
RecruiterExperience.belongsTo(Recruiter, { foreignKey: 'recruiterId', as: 'recruiter' });

module.exports = RecruiterExperience;

