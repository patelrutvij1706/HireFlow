const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const Candidate = sequelize.define('Candidate', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    },
    unique: true
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  contactNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isFresher: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  resumeUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  questionnaireCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'candidates',
  timestamps: true
});

// Define associations
User.hasOne(Candidate, { foreignKey: 'userId', as: 'candidateProfile' });
Candidate.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = Candidate;

