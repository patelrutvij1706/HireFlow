const { AptitudeTest, AptitudeQuestion, Job, Recruiter, JobSkill } = require('../models');
const { generateAptitudeTestQuestions } = require('../utils/geminiAptitudeGenerator');

// Generate aptitude test for a job
const generateAptitudeTest = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { numberOfQuestions = 10, passingPercentage, timeLimit } = req.body;

    // Get recruiter
    const recruiter = await Recruiter.findOne({ where: { userId: req.user.id } });
    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter profile not found'
      });
    }

    // Get job
    const job = await Job.findOne({
      where: {
        id: jobId,
        recruiterId: recruiter.id
      },
      include: [
        {
          model: JobSkill,
          as: 'skills',
          attributes: ['skillName']
        }
      ]
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if test already exists for this job
    const existingTest = await AptitudeTest.findOne({
      where: { jobId: job.id }
    });

    if (existingTest) {
      return res.status(400).json({
        success: false,
        message: 'Aptitude test already exists for this job. Please delete the existing test first.'
      });
    }

    // Extract job skills
    const jobSkills = job.skills ? job.skills.map(s => s.skillName) : [];

    // Generate questions using Gemini API
    let questions;
    try {
      questions = await generateAptitudeTestQuestions(
        job.title,
        job.description,
        jobSkills,
        parseInt(numberOfQuestions)
      );
    } catch (genError) {
      // Check for API overload/timeout errors
      if (genError.message.includes('API_OVERLOAD') || genError.message.includes('API_TIMEOUT')) {
        return res.status(503).json({
          success: false,
          message: genError.message.replace('API_OVERLOAD: ', '').replace('API_TIMEOUT: ', ''),
          error: 'API_OVERLOAD',
          retryAfter: 60 // Suggest retry after 60 seconds
        });
      }
      // Re-throw other errors
      throw genError;
    }

    // Create aptitude test
    let test;
    try {
      test = await AptitudeTest.create({
        jobId: job.id,
        recruiterId: recruiter.id,
        title: `Aptitude Test - ${job.title}`,
        numberOfQuestions: questions.length,
        passingPercentage: passingPercentage ? parseFloat(passingPercentage) : null,
        timeLimit: timeLimit ? parseInt(timeLimit) : null
      });
    } catch (dbError) {
      console.error('Error creating AptitudeTest:', dbError);
      console.error('Database error details:', {
        name: dbError.name,
        message: dbError.message,
        original: dbError.original
      });
      throw new Error(`Failed to create test in database: ${dbError.message}. Please ensure the database tables are created.`);
    }

    // Create questions
    try {
      const questionPromises = questions.map(q =>
        AptitudeQuestion.create({
          testId: test.id,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          category: q.category
        })
      );

      await Promise.all(questionPromises);
    } catch (dbError) {
      console.error('Error creating AptitudeQuestion:', dbError);
      console.error('Database error details:', {
        name: dbError.name,
        message: dbError.message,
        original: dbError.original
      });
      // Try to clean up the test if questions fail
      if (test && test.id) {
        try {
          await AptitudeTest.destroy({ where: { id: test.id } });
        } catch (cleanupError) {
          console.error('Error cleaning up test:', cleanupError);
        }
      }
      throw new Error(`Failed to create questions in database: ${dbError.message}. Please ensure the database tables are created.`);
    }

    // Fetch test with questions
    const testWithQuestions = await AptitudeTest.findByPk(test.id, {
      include: [
        {
          model: AptitudeQuestion,
          as: 'questions',
          attributes: ['id', 'question', 'options', 'correctAnswer', 'category']
        },
        {
          model: Job,
          as: 'job',
          attributes: ['id', 'title', 'companyName']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Aptitude test generated successfully',
      data: { test: testWithQuestions }
    });
  } catch (error) {
    console.error('Generate aptitude test error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      response: error.response?.data
    });
    
    // Check if it's already a handled API error
    if (error.message && (error.message.includes('API_OVERLOAD') || error.message.includes('API_TIMEOUT'))) {
      return res.status(503).json({
        success: false,
        message: error.message.replace('API_OVERLOAD: ', '').replace('API_TIMEOUT: ', ''),
        error: 'API_OVERLOAD',
        retryAfter: 60
      });
    }
    
    // Check for database errors
    if (error.name === 'SequelizeDatabaseError' || error.name === 'SequelizeValidationError') {
      return res.status(500).json({
        success: false,
        message: 'Database error occurred. Please ensure the database tables are created. Error: ' + error.message,
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating aptitude test. Please check server logs for details.',
      error: error.message,
      errorType: error.name
    });
  }
};

// Get all aptitude tests for a recruiter
const getRecruiterAptitudeTests = async (req, res) => {
  try {
    const recruiter = await Recruiter.findOne({ where: { userId: req.user.id } });
    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter profile not found'
      });
    }

    const tests = await AptitudeTest.findAll({
      where: { recruiterId: recruiter.id },
      include: [
        {
          model: Job,
          as: 'job',
          attributes: ['id', 'title', 'companyName']
        },
        {
          model: AptitudeQuestion,
          as: 'questions',
          attributes: ['id', 'question', 'options', 'correctAnswer', 'category'],
          order: [['createdAt', 'ASC']],
          separate: true
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: { tests }
    });
  } catch (error) {
    console.error('Get recruiter aptitude tests error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching aptitude tests',
      error: error.message
    });
  }
};

// Get single aptitude test by ID
const getAptitudeTest = async (req, res) => {
  try {
    const { id } = req.params;
    const recruiter = await Recruiter.findOne({ where: { userId: req.user.id } });
    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter profile not found'
      });
    }

    const test = await AptitudeTest.findOne({
      where: {
        id,
        recruiterId: recruiter.id
      },
      include: [
        {
          model: Job,
          as: 'job',
          attributes: ['id', 'title', 'companyName', 'description']
        },
        {
          model: AptitudeQuestion,
          as: 'questions',
          attributes: ['id', 'question', 'options', 'correctAnswer', 'category'],
          order: [['createdAt', 'ASC']],
          separate: true
        }
      ]
    });

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Aptitude test not found'
      });
    }

    res.json({
      success: true,
      data: { test }
    });
  } catch (error) {
    console.error('Get aptitude test error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching aptitude test',
      error: error.message
    });
  }
};

// Delete aptitude test
const deleteAptitudeTest = async (req, res) => {
  try {
    const { id } = req.params;
    const recruiter = await Recruiter.findOne({ where: { userId: req.user.id } });
    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter profile not found'
      });
    }

    const test = await AptitudeTest.findOne({
      where: {
        id,
        recruiterId: recruiter.id
      }
    });

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Aptitude test not found'
      });
    }

    // Delete all questions first
    await AptitudeQuestion.destroy({ where: { testId: test.id } });

    // Delete test
    await test.destroy();

    res.json({
      success: true,
      message: 'Aptitude test deleted successfully'
    });
  } catch (error) {
    console.error('Delete aptitude test error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting aptitude test',
      error: error.message
    });
  }
};

module.exports = {
  generateAptitudeTest,
  getRecruiterAptitudeTests,
  getAptitudeTest,
  deleteAptitudeTest
};

