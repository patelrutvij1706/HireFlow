const { Job, JobSkill, JobApplication, Recruiter, Candidate, User, AptitudeTest, TestSubmission } = require('../models');
const { Op } = require('sequelize');

// Get all jobs for a recruiter
const getRecruiterJobs = async (req, res) => {
  try {
    const recruiter = await Recruiter.findOne({ where: { userId: req.user.id } });

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter profile not found'
      });
    }

    const { search, status, page = 1, limit = 10 } = req.query;

    const where = {
      recruiterId: recruiter.id
    };

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { companyName: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (status && status !== 'All') {
      if (status === 'Active') {
        where.isActive = true;
      } else if (status === 'Inactive') {
        where.isActive = false;
      }
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: jobs } = await Job.findAndCountAll({
      where,
      include: [
        {
          model: JobSkill,
          as: 'skills',
          attributes: ['id', 'skillName'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: offset,
      distinct: true
    });

    // Get application counts for each job
    const jobIds = jobs.map(job => job.id);
    const applicationCounts = await JobApplication.findAll({
      where: { jobId: { [Op.in]: jobIds } },
      attributes: ['jobId', [JobApplication.sequelize.fn('COUNT', JobApplication.sequelize.col('id')), 'count']],
      group: ['jobId'],
      raw: true
    });

    const countsMap = {};
    applicationCounts.forEach(item => {
      countsMap[item.jobId] = parseInt(item.count);
    });

    const jobsWithCounts = jobs.map(job => {
      const jobData = job.toJSON();
      jobData.applicationCount = countsMap[job.id] || 0;
      return jobData;
    });

    res.json({
      success: true,
      data: {
        jobs: jobsWithCounts,
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get recruiter jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching jobs',
      error: error.message
    });
  }
};

// Get single job by ID
const getRecruiterJob = async (req, res) => {
  try {
    const { id } = req.params;
    const recruiter = await Recruiter.findOne({ where: { userId: req.user.id } });

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter profile not found'
      });
    }

    const job = await Job.findOne({
      where: {
        id,
        recruiterId: recruiter.id
      },
      include: [
        {
          model: JobSkill,
          as: 'skills',
          attributes: ['id', 'skillName']
        }
      ]
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Get application count
    const applicationCount = await JobApplication.count({
      where: { jobId: id }
    });

    const jobData = job.toJSON();
    jobData.applicationCount = applicationCount;

    res.json({
      success: true,
      data: { job: jobData }
    });
  } catch (error) {
    console.error('Get recruiter job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching job',
      error: error.message
    });
  }
};

// Create a new job
const createJob = async (req, res) => {
  try {
    const recruiter = await Recruiter.findOne({ where: { userId: req.user.id } });

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter profile not found'
      });
    }

    const {
      title,
      companyName,
      location,
      jobType,
      workMode,
      experienceLevel,
      salaryMin,
      salaryMax,
      salaryCurrency,
      description,
      requirements,
      benefits,
      skills,
      companyLogoUrl,
      isActive,
      applicationDeadline,
      testDate,
      testStartTime,
      testEndTime
    } = req.body;

    // Validate required fields
    if (!title || !location || !jobType || !workMode || !experienceLevel || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Create job
    const job = await Job.create({
      recruiterId: recruiter.id,
      title,
      companyName: companyName || recruiter.companyName,
      location,
      jobType,
      workMode,
      experienceLevel,
      salaryMin: salaryMin ? parseFloat(salaryMin) : null,
      salaryMax: salaryMax ? parseFloat(salaryMax) : null,
      salaryCurrency: salaryCurrency || 'USD',
      description,
      requirements: requirements || null,
      benefits: benefits || null,
      companyLogoUrl: companyLogoUrl || recruiter.companyLogoUrl || null,
      isActive: isActive !== undefined ? isActive : true,
      applicationDeadline: applicationDeadline || null,
      testDate: testDate || null,
      testStartTime: testStartTime || null,
      testEndTime: testEndTime || null
    });

    // Add skills if provided
    if (skills && Array.isArray(skills) && skills.length > 0) {
      const skillPromises = skills.map(skillName =>
        JobSkill.create({
          jobId: job.id,
          skillName: skillName.trim()
        })
      );
      await Promise.all(skillPromises);
    }

    // Fetch job with skills
    const jobWithSkills = await Job.findByPk(job.id, {
      include: [
        {
          model: JobSkill,
          as: 'skills',
          attributes: ['id', 'skillName']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: { job: jobWithSkills }
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating job',
      error: error.message
    });
  }
};

// Update a job
const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const recruiter = await Recruiter.findOne({ where: { userId: req.user.id } });

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter profile not found'
      });
    }

    const job = await Job.findOne({
      where: {
        id,
        recruiterId: recruiter.id
      }
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const {
      title,
      companyName,
      location,
      jobType,
      workMode,
      experienceLevel,
      salaryMin,
      salaryMax,
      salaryCurrency,
      description,
      requirements,
      benefits,
      skills,
      companyLogoUrl,
      isActive,
      applicationDeadline,
      testDate,
      testStartTime,
      testEndTime
    } = req.body;

    // Update job fields
    if (title) job.title = title;
    if (companyName) job.companyName = companyName;
    if (location) job.location = location;
    if (jobType) job.jobType = jobType;
    if (workMode) job.workMode = workMode;
    if (experienceLevel) job.experienceLevel = experienceLevel;
    if (salaryMin !== undefined) job.salaryMin = salaryMin ? parseFloat(salaryMin) : null;
    if (salaryMax !== undefined) job.salaryMax = salaryMax ? parseFloat(salaryMax) : null;
    if (salaryCurrency) job.salaryCurrency = salaryCurrency;
    if (description) job.description = description;
    if (requirements !== undefined) job.requirements = requirements;
    if (benefits !== undefined) job.benefits = benefits;
    if (companyLogoUrl !== undefined) job.companyLogoUrl = companyLogoUrl;
    if (isActive !== undefined) job.isActive = isActive;
    if (applicationDeadline !== undefined) job.applicationDeadline = applicationDeadline || null;
    if (testDate !== undefined) job.testDate = testDate || null;
    if (testStartTime !== undefined) job.testStartTime = testStartTime || null;
    if (testEndTime !== undefined) job.testEndTime = testEndTime || null;

    await job.save();

    // Update skills if provided
    if (skills && Array.isArray(skills)) {
      // Delete existing skills
      await JobSkill.destroy({ where: { jobId: job.id } });

      // Add new skills
      if (skills.length > 0) {
        const skillPromises = skills.map(skillName =>
          JobSkill.create({
            jobId: job.id,
            skillName: skillName.trim()
          })
        );
        await Promise.all(skillPromises);
      }
    }

    // Fetch updated job with skills
    const updatedJob = await Job.findByPk(job.id, {
      include: [
        {
          model: JobSkill,
          as: 'skills',
          attributes: ['id', 'skillName']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Job updated successfully',
      data: { job: updatedJob }
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating job',
      error: error.message
    });
  }
};

// Delete a job
const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const recruiter = await Recruiter.findOne({ where: { userId: req.user.id } });

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter profile not found'
      });
    }

    const job = await Job.findOne({
      where: {
        id,
        recruiterId: recruiter.id
      }
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Delete associated skills
    await JobSkill.destroy({ where: { jobId: id } });

    // Delete job
    await job.destroy();

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting job',
      error: error.message
    });
  }
};

// Get applications for a specific job
const getJobApplications = async (req, res) => {
  try {
    const { id } = req.params;
    const recruiter = await Recruiter.findOne({ where: { userId: req.user.id } });

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter profile not found'
      });
    }

    const job = await Job.findOne({
      where: {
        id,
        recruiterId: recruiter.id
      }
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Get all applications
    const allApplications = await JobApplication.findAll({
      where: { jobId: id },
      include: [
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
      order: [['appliedAt', 'DESC']]
    });

    // Check if job has test
    const jobHasTest = await AptitudeTest.findOne({
      where: { jobId: id }
    });

    // Filter applications based on test results
    let applications = allApplications;
    if (jobHasTest) {
      // Get all test submissions for these applications
      const applicationIds = allApplications.map(app => app.id);
      const submissions = await TestSubmission.findAll({
        where: { jobApplicationId: { [Op.in]: applicationIds } },
        attributes: ['jobApplicationId', 'isPassed']
      });

      const submissionsMap = new Map();
      submissions.forEach(sub => {
        submissionsMap.set(sub.jobApplicationId, sub.isPassed);
      });

      // Only show applications where candidate passed the test
      applications = allApplications.filter(app => {
        const isPassed = submissionsMap.get(app.id);
        return isPassed === true; // Only show if passed
      });
    }

    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('Get job applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: error.message
    });
  }
};

module.exports = {
  getRecruiterJobs,
  getRecruiterJob,
  createJob,
  updateJob,
  deleteJob,
  getJobApplications
};
