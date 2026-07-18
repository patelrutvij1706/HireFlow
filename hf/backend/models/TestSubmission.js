const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const AptitudeTest = require('./AptitudeTest');
const Candidate = require('./Candidate');
const JobApplication = require('./JobApplication');

const useInMemoryDb = process.env.USE_IN_MEMORY_DB === 'true';
const decimalOrFloat = (precision, scale) => (useInMemoryDb ? DataTypes.FLOAT : DataTypes.DECIMAL(precision, scale));

const TestSubmission = sequelize.define('TestSubmission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  testId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'aptitude_tests',
      key: 'id'
    }
  },
  candidateId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'candidates',
      key: 'id'
    }
  },
  jobApplicationId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'job_applications',
      key: 'id'
    }
  },
  answers: {
    type: DataTypes.JSONB,
    allowNull: false,
    // Format: { questionId: selectedAnswerIndex }
    // e.g., { "uuid-1": 0, "uuid-2": 2, ... }
  },
  score: {
    type: decimalOrFloat(5, 2),
    allowNull: true,
    // Percentage score (0-100)
  },
  totalQuestions: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  correctAnswers: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  isPassed: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    // true if score >= passingPercentage, false otherwise
  },
  submittedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'test_submissions',
  timestamps: true
});

module.exports = TestSubmission;

