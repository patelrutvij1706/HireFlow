const { User, Candidate, Recruiter } = require('../models');
const { generateToken } = require('../utils/jwt');
const { validationResult } = require('express-validator');

// Sign up
const signup = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password, role, fullName, companyName, companySize, workEmail } = req.body;

    // Determine user email based on role
    const userEmail = role === 'recruiter' ? workEmail : email;
    
    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: role === 'recruiter' ? 'Work email is required' : 'Email is required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email: userEmail } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user
    const user = await User.create({
      email: userEmail,
      password,
      role
    });

    // Create role-specific profile
    if (role === 'candidate') {
      await Candidate.create({
        userId: user.id,
        fullName: fullName || null
      });
    } else if (role === 'recruiter') {
      await Recruiter.create({
        userId: user.id,
        fullName: fullName || null,
        companyName: companyName || null,
        companySize: companySize || null
      });
    }

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating account',
      error: error.message
    });
  }
};

// Sign in
const signin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password, rememberMe } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive. Please contact support.'
      });
    }

    // Get user profile to check questionnaire status
    let questionnaireCompleted = false;
    if (user.role === 'candidate') {
      const candidate = await Candidate.findOne({ where: { userId: user.id } });
      questionnaireCompleted = candidate?.questionnaireCompleted || false;
    } else if (user.role === 'recruiter') {
      const recruiter = await Recruiter.findOne({ where: { userId: user.id } });
      questionnaireCompleted = recruiter?.questionnaireCompleted || false;
    }

    // Generate token
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          questionnaireCompleted
        }
      }
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message
    });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        { model: Candidate, as: 'candidateProfile' },
        { model: Recruiter, as: 'recruiterProfile' }
      ]
    });

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user data',
      error: error.message
    });
  }
};

module.exports = { signup, signin, getCurrentUser };

