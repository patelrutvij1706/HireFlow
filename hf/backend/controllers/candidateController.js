const { Candidate, Education, Experience, Skill, User } = require('../models');
const path = require('path');
const fs = require('fs');
const pdf = require('pdf-parse');
const axios = require('axios');
const { Op } = require('sequelize');
const { extractSkillsFromResume } = require('../utils/geminiSkillExtractor');

// Update candidate profile (Step 1)
const updateCandidateProfile = async (req, res) => {
  try {
    const { fullName, contactNumber, location, isFresher } = req.body;
    const userId = req.user.id;

    const candidate = await Candidate.findOne({ where: { userId } });
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate profile not found'
      });
    }

    await candidate.update({
      fullName,
      contactNumber,
      location,
      isFresher: isFresher !== undefined ? isFresher : false
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { candidate }
    });
  } catch (error) {
    console.error('Update candidate profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// Add education (Step 2)
const addEducation = async (req, res) => {
  try {
    const { degree, institution, yearOfCompletion } = req.body;
    const userId = req.user.id;

    const candidate = await Candidate.findOne({ where: { userId } });
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate profile not found'
      });
    }

    const education = await Education.create({
      candidateId: candidate.id,
      degree,
      institution,
      yearOfCompletion
    });

    res.status(201).json({
      success: true,
      message: 'Education added successfully',
      data: { education }
    });
  } catch (error) {
    console.error('Add education error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding education',
      error: error.message
    });
  }
};

// Get all educations
const getEducations = async (req, res) => {
  try {
    const userId = req.user.id;
    const candidate = await Candidate.findOne({ where: { userId } });
    
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate profile not found'
      });
    }

    const educations = await Education.findAll({ where: { candidateId: candidate.id } });

    res.json({
      success: true,
      data: { educations }
    });
  } catch (error) {
    console.error('Get educations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching educations',
      error: error.message
    });
  }
};

// Delete education
const deleteEducation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const candidate = await Candidate.findOne({ where: { userId } });
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate profile not found'
      });
    }

    const education = await Education.findOne({ where: { id, candidateId: candidate.id } });
    if (!education) {
      return res.status(404).json({
        success: false,
        message: 'Education not found'
      });
    }

    await education.destroy();

    res.json({
      success: true,
      message: 'Education deleted successfully'
    });
  } catch (error) {
    console.error('Delete education error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting education',
      error: error.message
    });
  }
};

// Add experience (Step 3)
const addExperience = async (req, res) => {
  try {
    const { companyName, role, fromDate, toDate, isCurrent } = req.body;
    const userId = req.user.id;

    const candidate = await Candidate.findOne({ where: { userId } });
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate profile not found'
      });
    }

    const experience = await Experience.create({
      candidateId: candidate.id,
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
    const candidate = await Candidate.findOne({ where: { userId } });
    
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate profile not found'
      });
    }

    const experiences = await Experience.findAll({ where: { candidateId: candidate.id } });

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

    const candidate = await Candidate.findOne({ where: { userId } });
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate profile not found'
      });
    }

    const experience = await Experience.findOne({ where: { id, candidateId: candidate.id } });
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

    const candidate = await Candidate.findOne({ where: { userId } });
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate profile not found'
      });
    }

    // Check if skill already exists
    const existingSkill = await Skill.findOne({ where: { candidateId: candidate.id, name } });
    if (existingSkill) {
      return res.status(400).json({
        success: false,
        message: 'Skill already exists'
      });
    }

    const skill = await Skill.create({
      candidateId: candidate.id,
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
    const candidate = await Candidate.findOne({ where: { userId } });
    
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate profile not found'
      });
    }

    const skills = await Skill.findAll({ where: { candidateId: candidate.id } });

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

    const candidate = await Candidate.findOne({ where: { userId } });
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate profile not found'
      });
    }

    const skill = await Skill.findOne({ where: { id, candidateId: candidate.id } });
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

// Upload resume (Step 4)
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a resume file'
      });
    }

    const userId = req.user.id;
    const candidate = await Candidate.findOne({ where: { userId } });
    
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate profile not found'
      });
    }

    const resumeUrl = `/uploads/resumes/${req.file.filename}`;
    await candidate.update({ resumeUrl });

    // Extract skills from resume using Gemini API (async, don't block response)
    extractSkillsFromResume(req.file.path)
      .then(async (skills) => {
        if (skills && skills.length > 0) {
          try {
            console.log(`Extracting ${skills.length} skills from resume for candidate ${candidate.id}`);

            // Add extracted skills (avoid duplicates)
            for (const skillName of skills) {
              const existingSkill = await Skill.findOne({
                where: {
                  candidateId: candidate.id,
                  name: { [Op.iLike]: skillName }
                }
              });

              if (!existingSkill) {
                await Skill.create({
                  candidateId: candidate.id,
                  name: skillName
                });
              }
            }

            console.log(`Successfully saved ${skills.length} skills from resume for candidate ${candidate.id}`);
          } catch (skillError) {
            console.error('Error saving extracted skills:', skillError);
          }
        } else {
          console.log('No skills extracted from resume');
        }
      })
      .catch((error) => {
        console.error('Error extracting skills from resume:', error);
        // Don't fail the upload if skill extraction fails
      });

    res.json({
      success: true,
      message: 'Resume uploaded successfully',
      data: { resumeUrl }
    });
  } catch (error) {
    console.error('Upload resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading resume',
      error: error.message
    });
  }
};

// Complete questionnaire
const completeQuestionnaire = async (req, res) => {
  try {
    const userId = req.user.id;
    const candidate = await Candidate.findOne({ where: { userId } });
    
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate profile not found'
      });
    }

    await candidate.update({ questionnaireCompleted: true });

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

// Parse resume with Gemini API
const parseResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a resume file'
      });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'Gemini API key not configured. Please set GEMINI_API_KEY in your .env file.'
      });
    }

    // Model name - handle both formats:
    // - Standard: 'gemini-1.5-pro', 'gemini-1.5-flash', etc.
    // - User's prototype format: 'models/gemini-2.5-pro' (strip 'models/' prefix if present)
    let modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    
    // Remove 'models/' prefix if present (for compatibility with user's prototype format)
    if (modelName.startsWith('models/')) {
      modelName = modelName.replace('models/', '');
    }
    
    const filePath = req.file.path;

    // Extract text from PDF
    let resumeText;
    try {
      const dataBuffer = fs.readFileSync(filePath);
      
      // pdf-parse returns a promise, so we await it
      const data = await pdf(dataBuffer);
      resumeText = data.text;
      
      if (!resumeText || resumeText.trim().length === 0) {
        throw new Error('PDF file appears to be empty or could not extract text');
      }
      
      console.log('Successfully extracted text from PDF, length:', resumeText.length);
    } catch (pdfError) {
      console.error('PDF parsing error:', pdfError);
      console.error('PDF error stack:', pdfError.stack);
      throw new Error(`Failed to extract text from PDF: ${pdfError.message}`);
    }

    // Parse resume text via Gemini
    const prompt = `Extract and return the following details from this resume in clean JSON format:
- Full Name
- Email
- Phone
- Location (if mentioned)
- Years of Experience
- Skills (as a list/array)
- Education (degree + university/institution)
- Work Experience (role, company, duration)
- Certifications (if any)
- Summary (short professional overview)

Resume:
${resumeText}

Return only valid JSON without any markdown formatting or code blocks.`;

    // Construct the API URL - format: /v1/models/{model}:generateContent
    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
    
    console.log('Calling Gemini API with model:', modelName);
    console.log('API URL:', apiUrl.replace(GEMINI_API_KEY, '***'));
    console.log('Resume text length:', resumeText.length);

    const response = await axios.post(
      apiUrl,
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 60000 // 60 second timeout
      }
    );

    // Extract the parsed content from Gemini response
    const geminiResponse = response.data;
    let parsedData = {};
    
    console.log('Gemini API response status:', response.status);
    console.log('Gemini API response structure:', JSON.stringify(geminiResponse).substring(0, 500));
    
    if (geminiResponse.candidates && geminiResponse.candidates.length > 0) {
      const candidate = geminiResponse.candidates[0];
      
      // Check for content in the response
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        const content = candidate.content.parts[0].text;
        console.log('Extracted content length:', content ? content.length : 0);
        
        if (content) {
          try {
            // Try to parse JSON from the response text
            // Remove markdown code blocks if present
            let cleanContent = content.trim();
            if (cleanContent.startsWith('```json')) {
              cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
            } else if (cleanContent.startsWith('```')) {
              cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
            }
            
            // Try to find JSON object in the content
            const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              parsedData = JSON.parse(jsonMatch[0]);
            } else {
              // If no JSON found, store as raw response
              parsedData = { rawResponse: cleanContent };
            }
          } catch (parseError) {
            console.error('JSON parse error:', parseError);
            parsedData = { rawResponse: content, parseError: parseError.message };
          }
        } else {
          parsedData = { error: 'No text content in Gemini response' };
        }
      } else {
        // Check for finishReason to understand why content might be missing
        if (candidate.finishReason) {
          parsedData = { 
            error: `Gemini API finished with reason: ${candidate.finishReason}`,
            finishReason: candidate.finishReason,
            safetyRatings: candidate.safetyRatings
          };
        } else {
          parsedData = { error: 'Unexpected response structure from Gemini API' };
        }
      }
    } else {
      parsedData = { error: 'No candidates in Gemini API response', fullResponse: geminiResponse };
    }

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    // Check if parsing was successful
    if (parsedData.error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to parse resume content',
        error: parsedData.error,
        data: {
          parsedData,
          geminiResponse
        }
      });
    }

    res.json({
      success: true,
      message: 'Resume parsed successfully',
      data: {
        parsedData,
        geminiResponse
      }
    });
  } catch (error) {
    console.error('Parse resume error:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      stack: error.stack
    });
    
    // Clean up uploaded file on error
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }

    // Check for specific Gemini API errors
    let errorMessage = 'Failed to parse resume';
    let statusCode = 500;
    
    if (error.response) {
      const apiError = error.response.data;
      statusCode = error.response.status;
      
      // Handle Gemini API specific errors
      if (apiError.error) {
        const geminiError = apiError.error;
        if (typeof geminiError === 'object') {
          errorMessage = geminiError.message || geminiError.status || 'Gemini API error';
          
          // Check for overload/rate limit errors
          if (geminiError.message && (
            geminiError.message.toLowerCase().includes('overloaded') ||
            geminiError.message.toLowerCase().includes('quota') ||
            geminiError.message.toLowerCase().includes('rate limit') ||
            geminiError.status === 'RESOURCE_EXHAUSTED'
          )) {
            statusCode = 503; // Service Unavailable
            errorMessage = 'The AI model is currently overloaded. Please wait a moment and try again.';
          }
        } else if (typeof geminiError === 'string') {
          errorMessage = geminiError;
          if (geminiError.toLowerCase().includes('overloaded') || 
              geminiError.toLowerCase().includes('quota')) {
            statusCode = 503;
            errorMessage = 'The AI model is currently overloaded. Please wait a moment and try again.';
          }
        }
      } else if (apiError.message) {
        errorMessage = apiError.message;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(statusCode).json({
      success: false,
      message: 'Failed to parse resume',
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? {
        fullError: error.message,
        response: error.response?.data,
        status: error.response?.status
      } : undefined
    });
  }
};

module.exports = {
  updateCandidateProfile,
  addEducation,
  getEducations,
  deleteEducation,
  addExperience,
  getExperiences,
  deleteExperience,
  addSkill,
  getSkills,
  deleteSkill,
  uploadResume,
  completeQuestionnaire,
  parseResume
};

