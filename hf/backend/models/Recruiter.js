const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const Recruiter = sequelize.define('Recruiter', {
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
  role: {
    type: DataTypes.STRING,
    allowNull: true
  },
  contactNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  linkedinProfile: {
    type: DataTypes.STRING,
    allowNull: true
  },
  companyName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  companyWebsite: {
    type: DataTypes.STRING,
    allowNull: true
  },
  industryType: {
    type: DataTypes.STRING,
    allowNull: true
  },
  companySize: {
    type: DataTypes.STRING,
    allowNull: true
  },
  headquartersLocation: {
    type: DataTypes.STRING,
    allowNull: true
  },
  companyLogoUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  businessProofUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  domainEmail: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  questionnaireCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'recruiters',
  timestamps: true
});

// Define associations
User.hasOne(Recruiter, { foreignKey: 'userId', as: 'recruiterProfile' });
Recruiter.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = Recruiter;

