const { Recruiter, RecruiterExperience, RecruiterSkill, User } = require('../models');
const axios = require('axios');

// Update recruiter profile (Step 2)
const updateRecruiterProfile = async (req, res) => {
  try {
    const { fullName, role, contactNumber, linkedinProfile } = req.body;
    const userId = req.user.id;

    const recruiter = await Recruiter.findOne({ where: { userId } });
    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter profile not found'
      });
    }

    await recruiter.update({
      fullName,
      role,
      contactNumber,
      linkedinProfile
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { recruiter }
    });
  } catch (error) {
    console.error('Update recruiter profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// Update company info (Step 1)
const updateCompanyInfo = async (req, res) => {
  try {
    const { companyName, companyWebsite, industryType, companySize, headquartersLocation } = req.body;
    const userId = req.user.id;

    const recruiter = await Recruiter.findOne({ where: { userId } });
    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter profile not found'
      });
    }

    await recruiter.update({
      companyName,
      companyWebsite,
      industryType,
      companySize,
      headquartersLocation
    });

    res.json({
      success: true,
      message: 'Company information updated successfully',
      data: { recruiter }
    });
  } catch (error) {
    console.error('Update company info error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating company information',
      error: error.message
    });
  }
};

// Add experience (Step 3)
const addExperience = async (req, res) => {
  try {
    const { companyName, role, fromDate, toDate, isCurrent } = req.body;
    const userId = req.user.id;

    const recruiter = await Recruiter.findOne({ where: { userId } });
    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter profile not found'
      });
    }

    const experience = await RecruiterExperience.create({
      recruiterId: recruiter.id,
      companyName,
      role,
      fromDate,
      toDate: isCurrent ? null : toDate,
      isCurrent: isCurrent || false
    });

    res.status(201).json({
      success: true,
      message: 'Experience added successfully',
      data: { experience }
    });
  } catch (error) {
    console.error('Add experience error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding experience',
      error: error.message
    });
  }
};

// Get all experiences
const getExperiences = async (req, res) => {
  try {
    const userId = req.user.id;
    const recruiter = await Recruiter.findOne({ where: { userId } });
    
    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter profile not found'
      });
    }

    const experiences = await RecruiterExperience.findAll({ where: { recruiterId: recruiter.id } });

    res.json({
      success: true,
      data: { experiences }
    });
  } catch (error) {
    console.error('Get experiences error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching experiences',
      error: error.message
    });
  }
};

// Delete experience
const deleteExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const recruiter = await Recruiter.findOne({ where: { userId } });
    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter profile not found'
      });
    }

    const experience = await RecruiterExperience.findOne({ where: { id, recruiterId: recruiter.id } });
    if (!experience) {
      return res.status(404).json({
        success: false,
        message: 'Experience not found'
      });
    }

    await experience.destroy();

    res.json({
      success: true,
      message: 'Experience deleted successfully'
    });
  } catch (error) {
    console.error('Delete experience error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting experience',
      error: error.message
    });
  }
};

// Add skill
const addSkill = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    const recruiter = await Recruiter.findOne({ where: { userId } });
    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter profile not found'
      });
    }

    // Check if skill already exists
    const existingSkill = await RecruiterSkill.findOne({ where: { recruiterId: recruiter.id, name } });
    if (existingSkill) {
      return res.status(400).json({
        success: false,
        message: 'Skill already exists'
      });
    }

    const skill = await RecruiterSkill.create({
      recruiterId: recruiter.id,
      name
    });

    res.status(201).json({
      success: true,
      message: 'Skill added successfully',
      data: { skill }
    });
  } catch (error) {
    console.error('Add skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding skill',
      error: error.message
    });
  }
};

// Get all skills
const getSkills = async (req, res) => {
  try {
    const userId = req.user.id;
    const recruiter = await Recruiter.findOne({ where: { userId } });
    
    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter profile not found'
      });
    }

    const skills = await RecruiterSkill.findAll({ where: { recruiterId: recruiter.id } });

    res.json({
      success: true,
      data: { skills }
    });
  } catch (error) {
    console.error('Get skills error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching skills',
      error: error.message
    });
  }
};

// Delete skill
const deleteSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const recruiter = await Recruiter.findOne({ where: { userId } });
    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter profile not found'
      });
    }

    const skill = await RecruiterSkill.findOne({ where: { id, recruiterId: recruiter.id } });
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    await skill.destroy();

    res.json({
      success: true,
      message: 'Skill deleted successfully'
    });
  } catch (error) {
    console.error('Delete skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting skill',
      error: error.message
    });
  }
};

// Upload company documents (Step 4)
const uploadCompanyDocuments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { domainEmail } = req.body;
    const recruiter = await Recruiter.findOne({ where: { userId } });
    
    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter profile not found'
      });
    }

    const updateData = {};
    if (req.files?.companyLogo) {
      updateData.companyLogoUrl = `/uploads/company-logos/${req.files.companyLogo[0].filename}`;
    }
    if (req.files?.businessProof) {
      updateData.businessProofUrl = `/uploads/business-proofs/${req.files.businessProof[0].filename}`;
    }
    if (domainEmail) {
      updateData.domainEmail = domainEmail;
    }

    await recruiter.update(updateData);

    res.json({
      success: true,
      message: 'Company documents uploaded successfully',
      data: { recruiter }
    });
  } catch (error) {
    console.error('Upload company documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading company documents',
      error: error.message
    });
  }
};

// Complete questionnaire
const completeQuestionnaire = async (req, res) => {
  try {
    const userId = req.user.id;
    const recruiter = await Recruiter.findOne({ where: { userId } });
    
    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter profile not found'
      });
    }

    await recruiter.update({ questionnaireCompleted: true });

    res.json({
      success: true,
      message: 'Questionnaire completed successfully'
    });
  } catch (error) {
    console.error('Complete questionnaire error:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing questionnaire',
      error: error.message
    });
  }
};

module.exports = {
  updateRecruiterProfile,
  updateCompanyInfo,
  addExperience,
  getExperiences,
  deleteExperience,
  addSkill,
  getSkills,
  deleteSkill,
  uploadCompanyDocuments,
  completeQuestionnaire
};

