const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AptitudeQuestion = sequelize.define('AptitudeQuestion', {
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
  question: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  options: {
    type: DataTypes.JSONB,
    allowNull: false,
    // Array of strings: ["Option 1", "Option 2", "Option 3", "Option 4"]
  },
  correctAnswer: {
    type: DataTypes.INTEGER,
    allowNull: false,
    // Index of correct answer in options array (0-based)
    validate: {
      min: 0,
      max: 3
    }
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
    // e.g., 'Technical', 'Logical Reasoning', 'Quantitative Aptitude', 'Verbal'
  }
}, {
  tableName: 'aptitude_questions',
  timestamps: true
});

module.exports = AptitudeQuestion;

