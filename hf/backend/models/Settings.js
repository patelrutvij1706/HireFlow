const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const useInMemoryDb = process.env.USE_IN_MEMORY_DB === 'true';
const enumOrString = (...values) => (useInMemoryDb ? DataTypes.STRING : DataTypes.ENUM(...values));

const Settings = sequelize.define('Settings', {
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
  // Notification settings
  emailNotifications: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  applicationUpdates: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  newApplications: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  // Privacy settings
  profileVisibility: {
    type: enumOrString('public', 'private'),
    defaultValue: 'public'
  },
  companyProfileVisibility: {
    type: enumOrString('public', 'private'),
    defaultValue: 'public'
  },
  // Preferences
  language: {
    type: DataTypes.STRING,
    defaultValue: 'English'
  },
  darkMode: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'settings',
  timestamps: true
});

// Define associations
User.hasOne(Settings, { foreignKey: 'userId', as: 'settings' });
Settings.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = Settings;






