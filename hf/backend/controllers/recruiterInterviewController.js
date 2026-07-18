const { Interview, Job, Candidate, Recruiter, User, JobApplication } = require('../models');
const { Op } = require('sequelize');

// Get all interviews for recruiter
const getRecruiterInterviews = async (req, res) => {
  try {
    const recruiter = await Recruiter.findOne({ where: { userId: req.user.id } });

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter profile not found'
      });
    }

    const { search, status, jobId, page = 1, limit = 10 } = req.query;

    const where = {
      recruiterId: recruiter.id
    };

    // Filter by status
    if (status && status !== 'All') {
      where.status = status;
    }

    // Filter by job
    if (jobId && jobId !== 'All') {
      where.jobId = jobId;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: interviews } = await Interview.findAndCountAll({
      where,
      include: [
        {
          model: Job,
          as: 'job',
          attributes: ['id', 'title', 'companyName']
        },
        {
          model: Candidate,
          as: 'candidate',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'email']
            }
          ],
          attributes: ['id', 'fullName', 'contactNumber', 'location']
        }
      ],
      order: [['interviewDate', 'DESC'], ['interviewTime', 'DESC']],
      limit: parseInt(limit),
      offset: offset,
      distinct: true
    });

    // Filter by search (candidate name, job title, or email) if provided
    let filteredInterviews = interviews;
    let filteredCount = count;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredInterviews = interviews.filter(interview => {
        const candidateName = interview.candidate?.fullName?.toLowerCase() || '';
        const jobTitle = interview.job?.title?.toLowerCase() || '';
        const candidateEmail = interview.candidate?.user?.email?.toLowerCase() || '';
        return candidateName.includes(searchLower) || 
               jobTitle.includes(searchLower) || 
               candidateEmail.includes(searchLower);
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
    console.error('Error fetching recruiter interviews:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching interviews', 
      error: error.message 
    });
  }
};

// Get a single interview
const getRecruiterInterview = async (req, res) => {
  try {
    const recruiter = await Recruiter.findOne({ where: { userId: req.user.id } });

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter profile not found'
      });
    }

    const { id } = req.params;

    const interview = await Interview.findOne({
      where: {
        id,
        recruiterId: recruiter.id
      },
      include: [
        {
          model: Job,
          as: 'job',
          attributes: ['id', 'title', 'companyName', 'location', 'jobType']
        },
        {
          model: Candidate,
          as: 'candidate',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'email']
            }
          ],
          attributes: ['id', 'fullName', 'contactNumber', 'location', 'resumeUrl']
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

// Create a new interview
const createInterview = async (req, res) => {
  try {
    const recruiter = await Recruiter.findOne({ where: { userId: req.user.id } });

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter profile not found'
      });
    }

    const { jobId, candidateId, interviewDate, interviewTime, mode, notes, location, meetingLink } = req.body;

    // Validate required fields
    if (!jobId || !candidateId || !interviewDate || !interviewTime || !mode) {
      return res.status(400).json({
        success: false,
        message: 'Job ID, Candidate ID, Date, Time, and Mode are required'
      });
    }

    // Validate location is required for Offline mode
    if (mode === 'Offline' && !location) {
      return res.status(400).json({
        success: false,
        message: 'Location is required for Offline interviews'
      });
    }

    // Verify that the job belongs to this recruiter
    const job = await Job.findOne({
      where: {
        id: jobId,
        recruiterId: recruiter.id
      }
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or does not belong to you'
      });
    }

    // Verify that the candidate has applied for this job
    const application = await JobApplication.findOne({
      where: {
        jobId,
        candidateId
      }
    });

    if (!application) {
      return res.status(400).json({
        success: false,
        message: 'Candidate has not applied for this job'
      });
    }

    // Create interview
    const interview = await Interview.create({
      recruiterId: recruiter.id,
      jobId,
      candidateId,
      interviewDate,
      interviewTime,
      mode,
      notes: notes || null,
      location: mode === 'Offline' ? location : null,
      meetingLink: mode === 'Online' ? meetingLink : null,
      status: 'Scheduled'
    });

    // Fetch the created interview with associations
    const createdInterview = await Interview.findByPk(interview.id, {
      include: [
        {
          model: Job,
          as: 'job',
          attributes: ['id', 'title', 'companyName']
        },
        {
          model: Candidate,
          as: 'candidate',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'email']
            }
          ],
          attributes: ['id', 'fullName', 'contactNumber', 'location']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Interview scheduled successfully',
      data: createdInterview
    });
  } catch (error) {
    console.error('Error creating interview:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating interview', 
      error: error.message 
    });
  }
};

// Update an interview
const updateInterview = async (req, res) => {
  try {
    const recruiter = await Recruiter.findOne({ where: { userId: req.user.id } });

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter profile not found'
      });
    }

    const { id } = req.params;
    const { interviewDate, interviewTime, mode, status, notes, location, meetingLink } = req.body;

    const interview = await Interview.findOne({
      where: {
        id,
        recruiterId: recruiter.id
      }
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Validate location is required for Offline mode
    const finalMode = mode || interview.mode;
    if (finalMode === 'Offline' && !location && !interview.location) {
      return res.status(400).json({
        success: false,
        message: 'Location is required for Offline interviews'
      });
    }

    // Update fields
    if (interviewDate) interview.interviewDate = interviewDate;
    if (interviewTime) interview.interviewTime = interviewTime;
    if (mode) {
      interview.mode = mode;
      // Update location/meetingLink based on mode
      if (mode === 'Offline') {
        interview.location = location || null;
        interview.meetingLink = null;
      } else {
        interview.meetingLink = meetingLink || null;
        interview.location = null;
      }
    }
    if (status) interview.status = status;
    if (notes !== undefined) interview.notes = notes;
    if (location && mode === 'Offline') interview.location = location;
    if (meetingLink && mode === 'Online') interview.meetingLink = meetingLink;
    
    // Clear reschedule request if interview date/time is being updated (interview is being rescheduled)
    if (interviewDate || interviewTime) {
      interview.rescheduleRequestReason = null;
      interview.rescheduleRequestedAt = null;
    }

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
          model: Candidate,
          as: 'candidate',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'email']
            }
          ],
          attributes: ['id', 'fullName', 'contactNumber', 'location']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Interview updated successfully',
      data: updatedInterview
    });
  } catch (error) {
    console.error('Error updating interview:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating interview', 
      error: error.message 
    });
  }
};

// Delete/Cancel an interview
const deleteInterview = async (req, res) => {
  try {
    const recruiter = await Recruiter.findOne({ where: { userId: req.user.id } });

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter profile not found'
      });
    }

    const { id } = req.params;

    const interview = await Interview.findOne({
      where: {
        id,
        recruiterId: recruiter.id
      }
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Instead of deleting, mark as canceled
    interview.status = 'Canceled';
    await interview.save();

    res.json({
      success: true,
      message: 'Interview canceled successfully'
    });
  } catch (error) {
    console.error('Error canceling interview:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error canceling interview', 
      error: error.message 
    });
  }
};

// Get candidates who have applied for a specific job (for scheduling interviews)
const getJobCandidates = async (req, res) => {
  try {
    const recruiter = await Recruiter.findOne({ where: { userId: req.user.id } });

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter profile not found'
      });
    }

    const { jobId } = req.params;

    // Verify that the job belongs to this recruiter
    const job = await Job.findOne({
      where: {
        id: jobId,
        recruiterId: recruiter.id
      }
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or does not belong to you'
      });
    }

    // Get all applications for this job
    const applications = await JobApplication.findAll({
      where: {
        jobId
      },
      include: [
        {
          model: Candidate,
          as: 'candidate',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'email']
            }
          ],
          attributes: ['id', 'fullName', 'contactNumber', 'location']
        }
      ],
      order: [['appliedAt', 'DESC']]
    });

    const candidates = applications.map(app => ({
      id: app.candidate.id,
      fullName: app.candidate.fullName,
      email: app.candidate.user.email,
      contactNumber: app.candidate.contactNumber,
      location: app.candidate.location,
      applicationStatus: app.status
    }));

    res.json({
      success: true,
      data: candidates
    });
  } catch (error) {
    console.error('Error fetching job candidates:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching job candidates', 
      error: error.message 
    });
  }
};

module.exports = {
  getRecruiterInterviews,
  getRecruiterInterview,
  createInterview,
  updateInterview,
  deleteInterview,
  getJobCandidates
};

