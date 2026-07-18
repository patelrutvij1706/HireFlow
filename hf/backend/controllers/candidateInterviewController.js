const { Interview, Job, Candidate, Recruiter, User } = require('../models');
const { Op } = require('sequelize');

// Get all interviews for a candidate
const getCandidateInterviews = async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ where: { userId: req.user.id } });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate profile not found'
      });
    }

    const { search, status, page = 1, limit = 10 } = req.query;

    const where = {
      candidateId: candidate.id
    };

    // Filter by status
    if (status && status !== 'All') {
      where.status = status;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: interviews } = await Interview.findAndCountAll({
      where,
      include: [
        {
          model: Job,
          as: 'job',
          attributes: ['id', 'title', 'companyName', 'location', 'jobType']
        },
        {
          model: Recruiter,
          as: 'recruiter',
          attributes: ['id', 'fullName', 'companyName', 'contactNumber']
        }
      ],
      order: [['interviewDate', 'DESC'], ['interviewTime', 'DESC']],
      limit: parseInt(limit),
      offset: offset,
      distinct: true
    });

    // Filter by search (job title, company name) if provided
    let filteredInterviews = interviews;
    let filteredCount = count;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredInterviews = interviews.filter(interview => {
        const jobTitle = interview.job?.title?.toLowerCase() || '';
        const companyName = interview.job?.companyName?.toLowerCase() || '';
        const recruiterCompany = interview.recruiter?.companyName?.toLowerCase() || '';
        return jobTitle.includes(searchLower) || 
               companyName.includes(searchLower) || 
               recruiterCompany.includes(searchLower);
      });
      filteredCount = filteredInterviews.length;
    }

    res.json({
      success: true,
      data: {
        interviews: filteredInterviews,
        total: filteredCount,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(filteredCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching candidate interviews:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching interviews', 
      error: error.message 
    });
  }
};

// Get a single interview
const getCandidateInterview = async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ where: { userId: req.user.id } });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate profile not found'
      });
    }

    const { id } = req.params;

    const interview = await Interview.findOne({
      where: {
        id,
        candidateId: candidate.id
      },
      include: [
        {
          model: Job,
          as: 'job',
          attributes: ['id', 'title', 'companyName', 'location', 'jobType', 'workMode', 'description']
        },
        {
          model: Recruiter,
          as: 'recruiter',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'email']
            }
          ],
          attributes: ['id', 'fullName', 'companyName', 'contactNumber']
        }
      ]
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    res.json({
      success: true,
      data: interview
    });
  } catch (error) {
    console.error('Error fetching interview:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching interview', 
      error: error.message 
    });
  }
};

// Request to reschedule interview
const requestReschedule = async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ where: { userId: req.user.id } });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate profile not found'
      });
    }

    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Reschedule reason is required'
      });
    }

    const interview = await Interview.findOne({
      where: {
        id,
        candidateId: candidate.id
      }
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Only allow reschedule requests for scheduled interviews
    if (interview.status !== 'Scheduled') {
      return res.status(400).json({
        success: false,
        message: 'Can only request reschedule for scheduled interviews'
      });
    }

    // Update interview with reschedule request
    interview.rescheduleRequestReason = reason.trim();
    interview.rescheduleRequestedAt = new Date();
    await interview.save();

    // Fetch updated interview with associations
    const updatedInterview = await Interview.findByPk(interview.id, {
      include: [
        {
          model: Job,
          as: 'job',
          attributes: ['id', 'title', 'companyName']
        },
        {
          model: Recruiter,
          as: 'recruiter',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'email']
            }
          ],
          attributes: ['id', 'fullName', 'companyName', 'contactNumber']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Reschedule request submitted successfully. The recruiter will review your request.',
      data: updatedInterview
    });
  } catch (error) {
    console.error('Error requesting reschedule:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error submitting reschedule request', 
      error: error.message 
    });
  }
};

module.exports = {
  getCandidateInterviews,
  getCandidateInterview,
  requestReschedule
};

