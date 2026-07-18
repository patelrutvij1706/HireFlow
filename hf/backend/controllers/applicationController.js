const { JobApplication, Job, Candidate, Recruiter, JobSkill } = require('../models');
const { Op } = require('sequelize');

// Get all applications for a candidate
const getApplications = async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ where: { userId: req.user.id } });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate profile not found'
      });
    }

    const applications = await JobApplication.findAll({
      where: { candidateId: candidate.id },
      include: [
        {
          model: Job,
          as: 'job',
          include: [
            {
              model: Recruiter,
              as: 'recruiter',
              attributes: ['id', 'companyName', 'companyLogoUrl']
            },
            {
              model: JobSkill,
              as: 'skills',
              attributes: ['id', 'skillName'],
              required: false
            }
          ]
          // Include all job fields including test date/time
        }
      ],
      order: [['appliedAt', 'DESC']]
    });

    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: error.message
    });
  }
};

// Get single application by ID
const getApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const candidate = await Candidate.findOne({ where: { userId: req.user.id } });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate profile not found'
      });
    }

    const application = await JobApplication.findOne({
      where: {
        id,
        candidateId: candidate.id
      },
      include: [
        {
          model: Job,
          as: 'job',
          include: [
            {
              model: Recruiter,
              as: 'recruiter',
              attributes: ['id', 'companyName', 'companyLogoUrl', 'fullName', 'contactNumber']
            }
          ]
        }
      ]
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching application',
      error: error.message
    });
  }
};

// Get application status timeline
const getApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const candidate = await Candidate.findOne({ where: { userId: req.user.id } });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate profile not found'
      });
    }

    const application = await JobApplication.findOne({
      where: {
        id,
        candidateId: candidate.id
      },
      include: [
        {
          model: Job,
          as: 'job',
          attributes: ['id', 'title', 'companyName', 'companyLogoUrl']
        }
      ]
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Define status timeline
    const statusTimeline = [
      { status: 'Applied', label: 'Applied', date: application.appliedAt, completed: true },
      { status: 'Under Review', label: 'Under Review', date: null, completed: application.status !== 'Applied' },
      { status: 'Interview', label: 'Interview Scheduled', date: null, completed: ['Interview', 'Offer'].includes(application.status) },
      { status: 'Offer', label: 'Offer Received', date: null, completed: application.status === 'Offer' },
      { status: 'Rejected', label: 'Rejected', date: null, completed: application.status === 'Rejected' }
    ];

    // Find current status index
    const currentStatusIndex = statusTimeline.findIndex(s => s.status === application.status);
    
    // Mark all statuses up to current as completed
    statusTimeline.forEach((status, index) => {
      if (index <= currentStatusIndex && currentStatusIndex >= 0) {
        status.completed = true;
      }
    });

    res.json({
      success: true,
      data: {
        application,
        statusTimeline,
        currentStatus: application.status
      }
    });
  } catch (error) {
    console.error('Error fetching application status:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching application status',
      error: error.message
    });
  }
};

module.exports = {
  getApplications,
  getApplication,
  getApplicationStatus
};

