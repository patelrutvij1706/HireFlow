const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Candidate = require('./Candidate');

const Skill = sequelize.define('Skill', {
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
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'skills',
  timestamps: true
});

Candidate.hasMany(Skill, { foreignKey: 'candidateId', as: 'skills' });
Skill.belongsTo(Candidate, { foreignKey: 'candidateId', as: 'candidate' });

module.exports = Skill;

