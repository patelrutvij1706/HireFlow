const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { signup, signin, getCurrentUser } = require('../controllers/authController');
const { changePassword } = require('../controllers/settingsController');
const { authenticate } = require('../middleware/auth');

// Validation rules
const signupValidation = [
  body('email').optional().isEmail().withMessage('Please provide a valid email'),
  body('workEmail').optional().isEmail().withMessage('Please provide a valid work email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['candidate', 'recruiter']).withMessage('Role must be candidate or recruiter'),
  body().custom((value, { req }) => {
    const { role, email, workEmail } = req.body;
    if (role === 'candidate' && !email) {
      throw new Error('Email is required for candidates');
    }
    if (role === 'recruiter' && !workEmail) {
      throw new Error('Work email is required for recruiters');
    }
    return true;
  })
];

const signinValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

// Routes
router.post('/signup', signupValidation, signup);
router.post('/signin', signinValidation, signin);
router.get('/me', authenticate, getCurrentUser);
router.post('/change-password', authenticate, changePassword);

module.exports = router;

