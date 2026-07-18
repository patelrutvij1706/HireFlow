const axios = require('axios');

/**
 * Generate aptitude test questions using Gemini API
 * @param {string} jobTitle - Title of the job
 * @param {string} jobDescription - Description of the job
 * @param {string[]} jobSkills - Array of required skills
 * @param {number} numberOfQuestions - Number of questions to generate (default: 10)
 * @returns {Promise<Array>} - Array of question objects
 */
const generateAptitudeTestQuestions = async (jobTitle, jobDescription, jobSkills = [], numberOfQuestions = 10) => {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not configured in environment variables');
      throw new Error('GEMINI_API_KEY not configured. Please set GEMINI_API_KEY in your .env file.');
    }
    
    console.log('Generating aptitude test questions...');
    console.log('Job Title:', jobTitle);
    console.log('Number of questions:', numberOfQuestions);
    console.log('API Key configured:', GEMINI_API_KEY ? 'Yes' : 'No');

    let modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    if (modelName.startsWith('models/')) {
      modelName = modelName.replace('models/', '');
    }

    // Create prompt for Gemini API
    const skillsText = jobSkills.length > 0 ? `Required Skills: ${jobSkills.join(', ')}` : '';
    const prompt = `Generate ${numberOfQuestions} aptitude test questions for a job position.

Job Title: ${jobTitle}
Job Description: ${jobDescription}
${skillsText}

Generate a mix of questions covering:
1. Technical questions related to the job role and skills
2. Logical reasoning questions
3. Quantitative aptitude questions
4. Verbal ability questions

For each question, provide:
- A clear and concise question
- Exactly 4 multiple choice options (A, B, C, D)
- The correct answer (as an index: 0, 1, 2, or 3)
- A category (Technical, Logical Reasoning, Quantitative Aptitude, or Verbal)

Return the response as a JSON array with the following structure:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "category": "Technical"
  },
  ...
]

Return ONLY the JSON array, no explanation or markdown formatting.`;

    // Call Gemini API
    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;

    let response;
    try {
      response = await axios.post(
        apiUrl,
        {
          contents: [{ parts: [{ text: prompt }] }],
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 90000 // 90 second timeout
        }
      );
    } catch (apiError) {
      // Handle Gemini API specific errors
      if (apiError.response) {
        const errorData = apiError.response.data;
        const errorMessage = errorData?.error?.message || errorData?.message || apiError.message;
        
        // Check for rate limit or overload errors
        if (
          errorMessage.toLowerCase().includes('overloaded') ||
          errorMessage.toLowerCase().includes('quota') ||
          errorMessage.toLowerCase().includes('rate limit') ||
          errorMessage.toLowerCase().includes('resource exhausted') ||
          apiError.response.status === 429 ||
          errorData?.error?.status === 'RESOURCE_EXHAUSTED'
        ) {
          throw new Error('API_OVERLOAD: The AI service is currently experiencing high load. Please wait a few moments and try again.');
        }
        
        // Check for timeout errors
        if (apiError.code === 'ECONNABORTED' || errorMessage.toLowerCase().includes('timeout')) {
          throw new Error('API_TIMEOUT: The request took too long. The AI service may be busy. Please wait a moment and try again.');
        }
        
        // Generic API error
        throw new Error(`API_ERROR: ${errorMessage}`);
      }
      
      // Network or other errors
      if (apiError.code === 'ECONNABORTED') {
        throw new Error('API_TIMEOUT: The request took too long. The AI service may be busy. Please wait a moment and try again.');
      }
      
      throw apiError;
    }

    // Extract questions from response
    const geminiResponse = response.data;
    let questions = [];

    if (geminiResponse.candidates && geminiResponse.candidates.length > 0) {
      const candidate = geminiResponse.candidates[0];

      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        const content = candidate.content.parts[0].text;

        if (content) {
          try {
            // Clean the content - remove markdown code blocks if present
            let cleanContent = content.trim();
            if (cleanContent.startsWith('```json')) {
              cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
            } else if (cleanContent.startsWith('```')) {
              cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
            }

            // Try to find JSON array in the content
            const arrayMatch = cleanContent.match(/\[[\s\S]*\]/);
            if (arrayMatch) {
              questions = JSON.parse(arrayMatch[0]);
            } else {
              // If no array found, try to parse the entire content as JSON
              questions = JSON.parse(cleanContent);
            }

            // Validate and normalize questions
            questions = questions
              .filter(q => q && q.question && q.options && Array.isArray(q.options) && q.options.length === 4)
              .map(q => ({
                question: q.question.trim(),
                options: q.options.map(opt => String(opt).trim()),
                correctAnswer: parseInt(q.correctAnswer) >= 0 && parseInt(q.correctAnswer) <= 3 ? parseInt(q.correctAnswer) : 0,
                category: q.category || 'General'
              }))
              .slice(0, numberOfQuestions); // Ensure we don't exceed requested number

            // If we got fewer questions than requested, pad with default questions
            if (questions.length < numberOfQuestions) {
              console.warn(`Only generated ${questions.length} questions, requested ${numberOfQuestions}`);
            }

          } catch (parseError) {
            console.error('Error parsing questions from Gemini response:', parseError);
            console.error('Raw response:', content.substring(0, 500));
            throw new Error('Failed to parse questions from API response');
          }
        }
      }
    }

    if (questions.length === 0) {
      throw new Error('No questions generated from API response. Please try again.');
    }

    return questions;
  } catch (error) {
    console.error('Error generating aptitude test questions:', error);
    
    // Re-throw with user-friendly message if it's already a custom error
    if (error.message.startsWith('API_OVERLOAD:') || error.message.startsWith('API_TIMEOUT:') || error.message.startsWith('API_ERROR:')) {
      throw error;
    }
    
    // Check if it's a Gemini API error that we might have missed
    if (error.response) {
      const errorData = error.response.data;
      const errorMessage = errorData?.error?.message || errorData?.message || error.message;
      
      if (
        errorMessage.toLowerCase().includes('overloaded') ||
        errorMessage.toLowerCase().includes('quota') ||
        errorMessage.toLowerCase().includes('rate limit') ||
        errorMessage.toLowerCase().includes('resource exhausted') ||
        error.response.status === 429
      ) {
        throw new Error('API_OVERLOAD: The AI service is currently experiencing high load. Please wait a few moments and try again.');
      }
    }
    
    // Generic error
    throw new Error(`Failed to generate test questions: ${error.message}`);
  }
};

module.exports = {
  generateAptitudeTestQuestions
};

