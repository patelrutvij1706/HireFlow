const { Job, JobSkill, JobApplication, SavedJob, Candidate, Recruiter, Skill } = require('../models');
const { Op } = require('sequelize');
const { getRecommendedJobs } = require('../utils/jobRecommendation');

// Get all jobs with filters and search
const getJobs = async (req, res) => {
  try {
    const {
      search,
      location,
      experienceLevel,
      jobType,
      workMode,
      page = 1,
      limit = 12
    } = req.query;

    const where = {
      isActive: true
    };

    // Get candidate's applied jobs if authenticated (needed for filtering expired jobs)
    let appliedJobIds = [];
    let candidateId = null;
    if (req.user && req.user.role === 'candidate') {
      const candidate = await Candidate.findOne({ where: { userId: req.user.id } });
      if (candidate) {
        candidateId = candidate.id;
        const applications = await JobApplication.findAll({
          where: { candidateId: candidate.id },
          attributes: ['jobId']
        });
        appliedJobIds = applications.map(app => app.jobId);
      }
    }

    // Search by title, company, or skills
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { companyName: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (location && location !== 'All locations') {
      where.location = { [Op.iLike]: `%${location}%` };
    }

    if (experienceLevel && experienceLevel !== 'All experience levels') {
      where.experienceLevel = { [Op.iLike]: `%${experienceLevel}%` };
    }

    if (jobType && jobType !== 'All job types') {
      where.jobType = jobType;
    }

    if (workMode && workMode !== 'All work modes') {
      where.workMode = workMode;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: jobs } = await Job.findAndCountAll({
      where,
      include: [
        {
          model: JobSkill,
          as: 'skills',
          attributes: ['id', 'skillName']
        },
        {
          model: Recruiter,
          as: 'recruiter',
          attributes: ['id', 'companyName', 'companyLogoUrl']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    // Get candidate's saved jobs if authenticated
    let savedJobIds = [];
    if (req.user && req.user.role === 'candidate' && candidateId) {
      const savedJobs = await SavedJob.findAll({
        where: { candidateId: candidateId },
        attributes: ['jobId']
      });
      savedJobIds = savedJobs.map(sj => sj.jobId);
    }

    // Filter out expired jobs (unless candidate has applied)
    const now = new Date();
    const validJobs = jobs.filter(job => {
      // If job has no deadline, include it
      if (!job.applicationDeadline) {
        return true;
      }
      
      const deadline = new Date(job.applicationDeadline);
      // If deadline hasn't passed, include it
      if (deadline >= now) {
        return true;
      }
      
      // If deadline has passed, only include if candidate has applied
      return appliedJobIds.includes(job.id);
    });

    // Convert jobs to JSON format
    const jobsWithStatus = validJobs.map(job => {
      const jobData = job.toJSON();
      jobData.isSaved = savedJobIds.includes(job.id);
      jobData.isApplied = appliedJobIds.includes(job.id);
      jobData.matchScore = 0;
      jobData.isRecommended = false;
      return jobData;
    });

    // Get recommended jobs if candidate is authenticated
    let jobsWithRecommendations = jobsWithStatus;
    if (candidateId) {
      jobsWithRecommendations = await getRecommendedJobs(candidateId, jobsWithStatus);
      
      // Separate recommended and non-recommended jobs
      const recommendedJobs = jobsWithRecommendations.filter(job => job.isRecommended && job.matchScore > 0);
      const otherJobs = jobsWithRecommendations.filter(job => !job.isRecommended || job.matchScore === 0);
      
      // Sort recommended jobs by match score (descending)
      recommendedJobs.sort((a, b) => b.matchScore - a.matchScore);
      
      // Sort other jobs by creation date (descending)
      otherJobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      // Combine: recommended first, then others
      jobsWithRecommendations = [...recommendedJobs, ...otherJobs];
    } else {
      // For non-authenticated users or non-candidates, sort by creation date
      jobsWithRecommendations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.json({
      success: true,
      data: {
        jobs: jobsWithRecommendations,
        total: validJobs.length, // Use filtered count instead of all jobs count
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(validJobs.length / parseInt(limit)),
        recommendedCount: candidateId ? jobsWithRecommendations.filter(job => job.isRecommended && job.matchScore > 0).length : 0
      }
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching jobs',
      error: error.message
    });
  }
};

// Get single job by ID
const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findByPk(id, {
      include: [
        {
          model: JobSkill,
          as: 'skills',
          attributes: ['id', 'skillName']
        },
        {
          model: Recruiter,
          as: 'recruiter',
          attributes: ['id', 'companyName', 'companyLogoUrl', 'companyWebsite', 'industryType', 'companySize', 'headquartersLocation']
        }
      ]
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if job has expired
    const now = new Date();
    let isExpired = false;
    if (job.applicationDeadline) {
      const deadline = new Date(job.applicationDeadline);
      isExpired = deadline < now;
    }

    // Get candidate's saved and applied status if authenticated
    let isSaved = false;
    let isApplied = false;
    let application = null;
    let candidateId = null;

    if (req.user && req.user.role === 'candidate') {
      const candidate = await Candidate.findOne({ where: { userId: req.user.id } });
      if (candidate) {
        candidateId = candidate.id;
        const savedJob = await SavedJob.findOne({
          where: { candidateId: candidate.id, jobId: id }
        });
        isSaved = !!savedJob;

        application = await JobApplication.findOne({
          where: { candidateId: candidate.id, jobId: id }
        });
        isApplied = !!application;
      }
    }

    // If job is expired, only show it to:
    // 1. Recruiters (they can see their own jobs)
    // 2. Candidates who have applied
    if (isExpired) {
      const canView = 
        (req.user && req.user.role === 'recruiter') || // Recruiters can always see
        (req.user && req.user.role === 'candidate' && isApplied); // Candidates who applied can see
      
      if (!canView) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }
    }

    const jobData = job.toJSON();
    jobData.isSaved = isSaved;
    jobData.isApplied = isApplied;
    if (application) {
      jobData.application = {
        id: application.id,
        status: application.status,
        appliedAt: application.appliedAt
      };
    }

    res.json({
      success: true,
      data: { job: jobData }
    });
  } catch (error) {
    console.error('Get job by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching job',
      error: error.message
    });
  }
};

// Apply for a job
const applyForJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { coverLetterText } = req.body;

    if (req.user.role !== 'candidate') {
      return res.status(403).json({
        success: false,
        message: 'Only candidates can apply for jobs'
      });
    }

    // Check if resume file is uploaded
    if (!req.files || !req.files.resume || !req.files.resume[0]) {
      return res.status(400).json({
        success: false,
        message: 'Resume is required. Please upload your resume.'
      });
    }

    const candidate = await Candidate.findOne({ where: { userId: req.user.id } });
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate profile not found'
      });
    }

    const job = await Job.findByPk(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (!job.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This job is no longer active'
      });
    }

    // Check if application deadline has passed
    if (job.applicationDeadline) {
      const deadline = new Date(job.applicationDeadline);
      const now = new Date();
      if (deadline < now) {
        return res.status(400).json({
          success: false,
          message: 'The application deadline for this job has passed'
        });
      }
    }

    // Check if already applied
    const existingApplication = await JobApplication.findOne({
      where: { candidateId: candidate.id, jobId: id }
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    // Get resume file URL
    const resumeUrl = `/uploads/resumes/${req.files.resume[0].filename}`;
    
    // Get cover letter file URL if uploaded
    let coverLetterUrl = null;
    let coverLetterTextValue = null;
    
    if (req.files.coverLetter && req.files.coverLetter[0]) {
      // Cover letter uploaded as file
      coverLetterUrl = `/uploads/cover-letters/${req.files.coverLetter[0].filename}`;
    } else if (coverLetterText && coverLetterText.trim()) {
      // Cover letter provided as text
      coverLetterTextValue = coverLetterText.trim();
    }

    // Create application
    const application = await JobApplication.create({
      jobId: id,
      candidateId: candidate.id,
      resumeUrl: resumeUrl,
      coverLetter: coverLetterTextValue || null,
      coverLetterUrl: coverLetterUrl,
      status: 'Applied'
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: { application }
    });
  } catch (error) {
    console.error('Apply for job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error applying for job',
      error: error.message
    });
  }
};

// Save/Unsave a job
const toggleSaveJob = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 'candidate') {
      return res.status(403).json({
        success: false,
        message: 'Only candidates can save jobs'
      });
    }

    const candidate = await Candidate.findOne({ where: { userId: req.user.id } });
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate profile not found'
      });
    }

    const job = await Job.findByPk(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if already saved
    const savedJob = await SavedJob.findOne({
      where: { candidateId: candidate.id, jobId: id }
    });

    if (savedJob) {
      // Unsave
      await savedJob.destroy();
      res.json({
        success: true,
        message: 'Job unsaved successfully',
        data: { isSaved: false }
      });
    } else {
      // Save
      await SavedJob.create({
        candidateId: candidate.id,
        jobId: id
      });
      res.json({
        success: true,
        message: 'Job saved successfully',
        data: { isSaved: true }
      });
    }
  } catch (error) {
    console.error('Toggle save job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving/unsaving job',
      error: error.message
    });
  }
};

// Get saved jobs for candidate
const getSavedJobs = async (req, res) => {
  try {
    if (req.user.role !== 'candidate') {
      return res.status(403).json({
        success: false,
        message: 'Only candidates can view saved jobs'
      });
    }

    const candidate = await Candidate.findOne({ where: { userId: req.user.id } });
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate profile not found'
      });
    }

    const savedJobs = await SavedJob.findAll({
      where: { candidateId: candidate.id },
      include: [
        {
          model: Job,
          as: 'job',
          include: [
            {
              model: JobSkill,
              as: 'skills',
              attributes: ['id', 'skillName']
            },
            {
              model: Recruiter,
              as: 'recruiter',
              attributes: ['id', 'companyName', 'companyLogoUrl']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const jobs = savedJobs.map(sj => {
      const jobData = sj.job.toJSON();
      jobData.isSaved = true;
      return jobData;
    });

    res.json({
      success: true,
      data: { jobs }
    });
  } catch (error) {
    console.error('Get saved jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching saved jobs',
      error: error.message
    });
  }
};

module.exports = {
  getJobs,
  getJobById,
  applyForJob,
  toggleSaveJob,
  getSavedJobs
};

