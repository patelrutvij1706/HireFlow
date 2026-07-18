const { JobApplication, Job, Candidate, Recruiter, User, Education, Experience, Skill, AptitudeTest, TestSubmission } = require('../models');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Get all applications for recruiter's jobs
const getRecruiterApplications = async (req, res) => {
  try {
    const recruiter = await Recruiter.findOne({ where: { userId: req.user.id } });

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter profile not found'
      });
    }

    const { search, status, jobId, page = 1, limit = 10 } = req.query;

    // Get all jobs for this recruiter
    const recruiterJobs = await Job.findAll({
      where: { recruiterId: recruiter.id },
      attributes: ['id']
    });
    const jobIds = recruiterJobs.map(job => job.id);

    if (jobIds.length === 0) {
      return res.json({
        success: true,
        data: {
          applications: [],
          total: 0,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: 0
        }
      });
    }

    const where = {
      jobId: { [Op.in]: jobIds }
    };

    // Filter by status
    if (status && status !== 'All') {
      where.status = status;
    } else {
    }

    // Filter by job
    if (jobId) {
      where.jobId = jobId;
    }

    // First, identify which jobs have tests and get test submissions
    const jobIdsWithTests = new Set();
    const jobsWithTests = await AptitudeTest.findAll({
      where: { jobId: { [Op.in]: jobIds } },
      attributes: ['jobId']
    });
    jobsWithTests.forEach(test => jobIdsWithTests.add(test.jobId));

    // Get all test submissions for all applications of these jobs
    let testSubmissionsMap = new Map();
    if (jobIdsWithTests.size > 0) {
      // Get all applications for jobs with tests to find their submissions
      const allAppIds = await JobApplication.findAll({
        where: { jobId: { [Op.in]: Array.from(jobIdsWithTests) } },
        attributes: ['id']
      });
      const applicationIds = allAppIds.map(app => app.id);
      
      if (applicationIds.length > 0) {
        const submissions = await TestSubmission.findAll({
          where: { jobApplicationId: { [Op.in]: applicationIds } },
          attributes: ['jobApplicationId', 'isPassed', 'score']
        });
        submissions.forEach(sub => {
          testSubmissionsMap.set(sub.jobApplicationId, {
            isPassed: sub.isPassed,
            score: sub.score
          });
        });
      }
    }

    // Get all applications (we'll filter in memory for now)
    // For better performance with large datasets, consider using a subquery
    const { count, rows: allApplications } = await JobApplication.findAndCountAll({
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
          attributes: ['id', 'fullName', 'contactNumber', 'location', 'resumeUrl'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'email']
            }
          ]
        }
      ],
      order: [['appliedAt', 'DESC']],
      distinct: true
    });

    // Filter applications based on test results
    // Only show applications where:
    // 1. Job has no test, OR
    // 2. Job has test and candidate passed it
    let filteredApplications = allApplications.filter(app => {
      const jobHasTest = jobIdsWithTests.has(app.jobId);
      
      // If job has no test, show all applications
      if (!jobHasTest) {
        return true;
      }

      // If job has test, check if candidate has submitted and passed
      const submission = testSubmissionsMap.get(app.id);
      
      // If no submission yet, don't show (candidate hasn't taken test)
      if (!submission) {
        return false;
      }

      // Only show if candidate passed the test
      return submission.isPassed === true;
    });

    // Filter by search (candidate name, job title, or email) if provided
    if (search) {
      const searchLower = search.toLowerCase();
      filteredApplications = filteredApplications.filter(app => {
        const candidateName = app.candidate?.fullName?.toLowerCase() || '';
        const jobTitle = app.job?.title?.toLowerCase() || '';
        const candidateEmail = app.candidate?.user?.email?.toLowerCase() || '';
        return candidateName.includes(searchLower) || 
               jobTitle.includes(searchLower) || 
               candidateEmail.includes(searchLower);
      });
    }

    // Apply pagination after filtering
    const totalFiltered = filteredApplications.length;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    filteredApplications = filteredApplications.slice(offset, offset + parseInt(limit));

    res.json({
      success: true,
      data: {
        applications: filteredApplications,
        total: totalFiltered,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalFiltered / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching recruiter applications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: error.message
    });
  }
};

// Get single application by ID
const getRecruiterApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const recruiter = await Recruiter.findOne({ where: { userId: req.user.id } });

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter profile not found'
      });
    }

    // Get all jobs for this recruiter
    const recruiterJobs = await Job.findAll({
      where: { recruiterId: recruiter.id },
      attributes: ['id']
    });
    const jobIds = recruiterJobs.map(job => job.id);

    if (jobIds.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    console.log('Looking for application:', { id, jobIds });

    const application = await JobApplication.findOne({
      where: {
        id,
        jobId: { [Op.in]: jobIds }
      },
      include: [
        {
          model: Job,
          as: 'job',
          attributes: ['id', 'title', 'companyName', 'location', 'jobType', 'workMode']
        },
        {
          model: Candidate,
          as: 'candidate',
          attributes: ['id', 'fullName', 'contactNumber', 'location', 'resumeUrl'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'email']
            }
          ]
        }
      ]
    });

    // Check if job has test and if candidate passed
    if (application) {
      const jobHasTest = await AptitudeTest.findOne({
        where: { jobId: application.jobId }
      });

      if (jobHasTest) {
        const testSubmission = await TestSubmission.findOne({
          where: { jobApplicationId: application.id }
        });

        // If test exists but candidate hasn't taken it or failed, don't show
        if (!testSubmission || testSubmission.isPassed !== true) {
          return res.status(404).json({
            success: false,
            message: 'Application not found or candidate has not passed the required test'
          });
        }
      }
    }

    console.log('Application query result:', { 
      found: !!application, 
      applicationId: application?.id,
      jobId: application?.jobId,
      candidateId: application?.candidateId 
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Get candidate's full profile
    const candidate = await Candidate.findByPk(application.candidateId, {
      include: [
        {
          model: Education,
          as: 'educations',
          attributes: ['id', 'degree', 'institution', 'yearOfCompletion']
        },
        {
          model: Experience,
          as: 'experiences',
          attributes: ['id', 'companyName', 'role', 'fromDate', 'toDate', 'isCurrent']
        },
        {
          model: Skill,
          as: 'skills',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email']
        }
      ]
    });

    // Log resume URLs for debugging
    console.log('Recruiter application data:', {
      applicationId: application.id,
      applicationResumeUrl: application.resumeUrl,
      candidateResumeUrl: candidate?.resumeUrl,
      hasApplicationResume: !!application.resumeUrl,
      hasCandidateResume: !!candidate?.resumeUrl,
      applicationData: application.toJSON ? application.toJSON() : application
    });
    
    // Verify resume file exists if resumeUrl is present
    if (application.resumeUrl || candidate?.resumeUrl) {
      const resumeUrl = application.resumeUrl || candidate.resumeUrl;
      let filePath;
      
      if (resumeUrl.startsWith('/uploads/resumes/')) {
        // Full path like /uploads/resumes/filename.pdf
        filePath = path.join(__dirname, '..', resumeUrl);
      } else if (resumeUrl.startsWith('/uploads/')) {
        // Path like /uploads/filename.pdf (incorrect but handle it)
        filePath = path.join(__dirname, '..', resumeUrl);
      } else if (resumeUrl.startsWith('/')) {
        // Just /filename.pdf
        filePath = path.join(__dirname, '..', 'uploads', 'resumes', resumeUrl.substring(1));
      } else {
        // Just filename.pdf
        filePath = path.join(__dirname, '..', 'uploads', 'resumes', resumeUrl);
      }
      
      const fileExists = fs.existsSync(filePath);
      console.log('Resume file check:', {
        resumeUrl,
        filePath,
        exists: fileExists,
        normalizedPath: filePath
      });
      
      if (!fileExists) {
        console.warn(`Resume file not found at: ${filePath}`);
      }
    }

    res.json({
      success: true,
      data: {
        application,
        candidate
      }
    });
  } catch (error) {
    console.error('Error fetching recruiter application:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching application',
      error: error.message
    });
  }
};

// Update application status
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const validStatuses = ['Applied', 'Under Review', 'Interview', 'Offer', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const recruiter = await Recruiter.findOne({ where: { userId: req.user.id } });

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter profile not found'
      });
    }

    // Get all jobs for this recruiter
    const recruiterJobs = await Job.findAll({
      where: { recruiterId: recruiter.id },
      attributes: ['id']
    });
    const jobIds = recruiterJobs.map(job => job.id);

    const application = await JobApplication.findOne({
      where: {
        id,
        jobId: { [Op.in]: jobIds }
      }
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    await application.update({ status });

    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: { application }
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating application status',
      error: error.message
    });
  }
};

module.exports = {
  getRecruiterApplications,
  getRecruiterApplication,
  updateApplicationStatus
};

