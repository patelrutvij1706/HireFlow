const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Candidate = require('./Candidate');

const Experience = sequelize.define('Experience', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  candidateId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Candidate,
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
  tableName: 'experiences',
  timestamps: true
});

Candidate.hasMany(Experience, { foreignKey: 'candidateId', as: 'experiences' });
Experience.belongsTo(Candidate, { foreignKey: 'candidateId', as: 'candidate' });

module.exports = Experience;

