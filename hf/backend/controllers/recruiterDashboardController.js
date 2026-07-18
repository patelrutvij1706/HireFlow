const { Job, JobApplication, Recruiter, Interview, AptitudeTest, TestSubmission, Candidate } = require('../models');
const { Op } = require('sequelize');

// Get recruiter dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const recruiter = await Recruiter.findOne({ where: { userId: req.user.id } });

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter profile not found'
      });
    }

    // Get all jobs for this recruiter
    const allJobs = await Job.findAll({
      where: { recruiterId: recruiter.id },
      attributes: ['id', 'title', 'isActive', 'createdAt']
    });
    const jobIds = allJobs.map(job => job.id);

    // Calculate date ranges
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Total jobs
    const totalJobs = allJobs.length;
    const activeJobs = allJobs.filter(job => job.isActive).length;
    const inactiveJobs = totalJobs - activeJobs;

    // Jobs created this week
    const jobsThisWeek = allJobs.filter(job => 
      new Date(job.createdAt) >= startOfWeek
    ).length;

    // Get all applications
    let totalApplications = 0;
    let applicationsThisWeek = 0;
    let applicationsThisMonth = 0;
    let applicationStatusCounts = {
      Applied: 0,
      'Under Review': 0,
      Interview: 0,
      Offer: 0,
      Rejected: 0
    };

    if (jobIds.length > 0) {
      const allApplications = await JobApplication.findAll({
        where: { jobId: { [Op.in]: jobIds } },
        attributes: ['id', 'status', 'appliedAt']
      });

      totalApplications = allApplications.length;
      
      applicationsThisWeek = allApplications.filter(app => 
        new Date(app.appliedAt) >= startOfWeek
      ).length;

      applicationsThisMonth = allApplications.filter(app => {
        const appliedDate = new Date(app.appliedAt);
        return appliedDate >= startOfMonth && appliedDate <= endOfMonth;
      }).length;

      // Count by status
      allApplications.forEach(app => {
        if (applicationStatusCounts.hasOwnProperty(app.status)) {
          applicationStatusCounts[app.status]++;
        }
      });
    }

    // Get interviews
    let allInterviews = [];
    if (jobIds.length > 0) {
      allInterviews = await Interview.findAll({
        where: { 
          jobId: { [Op.in]: jobIds }
        },
        attributes: ['id', 'interviewDate', 'interviewTime', 'status']
      });
    }

    const totalInterviews = allInterviews.length;
    const upcomingInterviews = allInterviews.filter(interview => {
      if (!interview.interviewDate) return false;
      // Combine date and time for comparison
      const [hours, minutes] = (interview.interviewTime || '00:00').split(':').map(Number);
      const interviewDateTime = new Date(interview.interviewDate);
      interviewDateTime.setHours(hours, minutes, 0, 0);
      return interviewDateTime >= now;
    }).length;

    // Get test statistics
    let totalTests = 0;
    let testsPassed = 0;
    let testsFailed = 0;
    let averageTestScore = 0;

    if (jobIds.length > 0) {
      const allTests = await AptitudeTest.findAll({
        where: { jobId: { [Op.in]: jobIds } },
        attributes: ['id']
      });
      totalTests = allTests.length;

      const testIds = allTests.map(test => test.id);
      if (testIds.length > 0) {
        const allSubmissions = await TestSubmission.findAll({
          where: { testId: { [Op.in]: testIds } },
          attributes: ['isPassed', 'score']
        });

        testsPassed = allSubmissions.filter(sub => sub.isPassed === true).length;
        testsFailed = allSubmissions.filter(sub => sub.isPassed === false).length;
        
        if (allSubmissions.length > 0) {
          const totalScore = allSubmissions.reduce((sum, sub) => sum + (parseFloat(sub.score) || 0), 0);
          averageTestScore = parseFloat((totalScore / allSubmissions.length).toFixed(2));
        }
      }
    }

    const testPassRate = totalTests > 0 && (testsPassed + testsFailed) > 0
      ? parseFloat(((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1))
      : 0;

    // Get recent applications (last 4)
    let recentApplications = [];
    if (jobIds.length > 0) {
      recentApplications = await JobApplication.findAll({
        where: { jobId: { [Op.in]: jobIds } },
        include: [
          {
            model: Job,
            as: 'job',
            attributes: ['id', 'title', 'companyName']
          },
          {
            model: Candidate,
            as: 'candidate',
            attributes: ['id', 'fullName']
          }
        ],
        order: [['appliedAt', 'DESC']],
        limit: 4
      });
    }

    // Get upcoming interviews (next 5)
    // We'll filter in memory since we need to combine date and time
    let upcomingInterviewsList = [];
    if (jobIds.length > 0) {
      const allInterviewsForList = await Interview.findAll({
        where: { 
          jobId: { [Op.in]: jobIds },
          interviewDate: { [Op.gte]: new Date().toISOString().split('T')[0] } // Filter by date first
        },
        include: [
          {
            model: Job,
            as: 'job',
            attributes: ['id', 'title', 'companyName']
          },
          {
            model: Candidate,
            as: 'candidate',
            attributes: ['id', 'fullName']
          }
        ],
        order: [['interviewDate', 'ASC'], ['interviewTime', 'ASC']],
        limit: 20 // Get more to filter properly
      });

      // Filter and sort by combined datetime
      upcomingInterviewsList = allInterviewsForList
        .map(interview => {
          if (!interview.interviewDate) return null;
          const [hours, minutes] = (interview.interviewTime || '00:00').split(':').map(Number);
          const interviewDateTime = new Date(interview.interviewDate);
          interviewDateTime.setHours(hours, minutes, 0, 0);
          return { ...interview.toJSON(), scheduledDateTime: interviewDateTime };
        })
        .filter(interview => interview && interview.scheduledDateTime >= now)
        .sort((a, b) => a.scheduledDateTime - b.scheduledDateTime)
        .slice(0, 5)
        .map(interview => {
          const { scheduledDateTime, ...rest } = interview;
          return rest;
        });
    }

    // Get weekly application trends (last 7 days)
    const weeklyTrends = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);

      let dayApplications = 0;
      if (jobIds.length > 0) {
        dayApplications = await JobApplication.count({
          where: {
            jobId: { [Op.in]: jobIds },
            appliedAt: {
              [Op.gte]: date,
              [Op.lt]: nextDate
            }
          }
        });
      }

      weeklyTrends.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        applications: dayApplications
      });
    }

    // Get top performing jobs (by application count)
    const topJobs = [];
    if (jobIds.length > 0) {
      const jobApplicationCounts = await JobApplication.findAll({
        where: { jobId: { [Op.in]: jobIds } },
        attributes: [
          'jobId',
          [JobApplication.sequelize.fn('COUNT', JobApplication.sequelize.col('id')), 'count']
        ],
        group: ['jobId'],
        order: [[JobApplication.sequelize.fn('COUNT', JobApplication.sequelize.col('id')), 'DESC']],
        limit: 5,
        raw: true
      });

      for (const jobCount of jobApplicationCounts) {
        const job = allJobs.find(j => j.id === jobCount.jobId);
        if (job) {
          topJobs.push({
            id: job.id,
            title: job.title,
            applicationCount: parseInt(jobCount.count)
          });
        }
      }
    }

    res.json({
      success: true,
      data: {
        metrics: {
          totalJobs,
          activeJobs,
          inactiveJobs,
          jobsThisWeek,
          totalApplications,
          applicationsThisWeek,
          applicationsThisMonth,
          totalInterviews,
          upcomingInterviews,
          totalTests,
          testsPassed,
          testsFailed,
          averageTestScore,
          testPassRate
        },
        applicationStatusCounts,
        recentApplications: recentApplications.map(app => ({
          id: app.id,
          jobTitle: app.job?.title,
          candidateName: app.candidate?.fullName,
          status: app.status,
          appliedAt: app.appliedAt
        })),
        upcomingInterviews: upcomingInterviewsList.map(interview => {
          // Combine interviewDate and interviewTime for frontend
          const scheduledDate = interview.interviewDate && interview.interviewTime
            ? `${interview.interviewDate}T${interview.interviewTime}:00`
            : interview.interviewDate;
          return {
            id: interview.id,
            jobTitle: interview.job?.title,
            candidateName: interview.candidate?.fullName,
            scheduledDate: scheduledDate,
            interviewDate: interview.interviewDate,
            interviewTime: interview.interviewTime,
            status: interview.status
          };
        }),
        weeklyTrends,
        topJobs
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

module.exports = {
  getDashboardStats
};

