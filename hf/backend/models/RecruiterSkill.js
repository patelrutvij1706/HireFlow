const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Recruiter = require('./Recruiter');

const RecruiterSkill = sequelize.define('RecruiterSkill', {
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
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'recruiter_skills',
  timestamps: true
});

Recruiter.hasMany(RecruiterSkill, { foreignKey: 'recruiterId', as: 'skills' });
RecruiterSkill.belongsTo(Recruiter, { foreignKey: 'recruiterId', as: 'recruiter' });

module.exports = RecruiterSkill;

