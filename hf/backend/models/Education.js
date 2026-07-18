const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Candidate = require('./Candidate');

const Education = sequelize.define('Education', {
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
  degree: {
    type: DataTypes.STRING,
    allowNull: false
  },
  institution: {
    type: DataTypes.STRING,
    allowNull: false
  },
  yearOfCompletion: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'educations',
  timestamps: true
});

Candidate.hasMany(Education, { foreignKey: 'candidateId', as: 'educations' });
Education.belongsTo(Candidate, { foreignKey: 'candidateId', as: 'candidate' });

module.exports = Education;

