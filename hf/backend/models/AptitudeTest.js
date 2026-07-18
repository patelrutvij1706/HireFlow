const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const useInMemoryDb = process.env.USE_IN_MEMORY_DB === 'true';
const decimalOrFloat = (precision, scale) => (useInMemoryDb ? DataTypes.FLOAT : DataTypes.DECIMAL(precision, scale));

const AptitudeTest = sequelize.define('AptitudeTest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  jobId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'jobs',
      key: 'id'
    }
  },
  recruiterId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'recruiters',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Aptitude Test'
  },
  numberOfQuestions: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10
  },
  passingPercentage: {
    type: decimalOrFloat(5, 2),
    allowNull: true,
    // Percentage value (0-100), e.g., 70.00 means 70%
    validate: {
      min: 0,
      max: 100
    }
  },
  timeLimit: {
    type: DataTypes.INTEGER,
    allowNull: true,
    // Time limit in minutes, e.g., 30 means 30 minutes
    validate: {
      min: 1
    },
    comment: 'Time limit for the test in minutes'
  }
}, {
  tableName: 'aptitude_tests',
  timestamps: true
});

module.exports = AptitudeTest;

