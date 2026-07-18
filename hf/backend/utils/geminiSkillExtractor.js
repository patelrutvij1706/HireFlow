const axios = require('axios');
const pdf = require('pdf-parse');
const fs = require('fs');

/**
 * Extract skills from resume using Gemini API
 * @param {string} filePath - Path to the resume file
 * @returns {Promise<string[]>} - Array of extracted skills
 */
const extractSkillsFromResume = async (filePath) => {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not configured');
      return [];
    }

    let modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    if (modelName.startsWith('models/')) {
      modelName = modelName.replace('models/', '');
    }

    // Extract text from PDF
    let resumeText;
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      resumeText = data.text;

      if (!resumeText || resumeText.trim().length === 0) {
        console.error('PDF file appears to be empty');
        return [];
      }
    } catch (pdfError) {
      console.error('PDF parsing error:', pdfError);
      return [];
    }

    // Create prompt to extract skills
    const prompt = `Extract all technical and professional skills from this resume. 
Return ONLY a JSON array of skill names (strings), nothing else. 
Focus on programming languages, frameworks, tools, technologies, and professional skills.

Example format: ["JavaScript", "React", "Node.js", "Python", "SQL", "AWS"]

Resume text:
${resumeText.substring(0, 10000)} // Limit text to avoid token limits

Return only the JSON array, no explanation or markdown formatting.`;

    // Call Gemini API
    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;

    const response = await axios.post(
      apiUrl,
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000 // 30 second timeout
      }
    );

    // Extract skills from response
    const geminiResponse = response.data;
    let skills = [];

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
              skills = JSON.parse(arrayMatch[0]);
            } else {
              // If no array found, try to parse the entire content as JSON
              const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                // Check if skills are in a 'skills' property
                if (parsed.skills && Array.isArray(parsed.skills)) {
                  skills = parsed.skills;
                } else if (Array.isArray(parsed)) {
                  skills = parsed;
                }
              } else {
                // Try to split by lines or commas if JSON parsing fails
                const lines = cleanContent.split('\n').filter(line => line.trim());
                skills = lines
                  .map(line => line.trim().replace(/^[-•*]\s*/, '').replace(/["']/g, ''))
                  .filter(skill => skill.length > 0);
              }
            }

            // Normalize skills - remove duplicates, trim, capitalize first letter
            skills = skills
              .map(skill => {
                if (typeof skill === 'string') {
                  return skill.trim();
                } else if (skill && typeof skill === 'object' && skill.name) {
                  return skill.name.trim();
                }
                return null;
              })
              .filter(skill => skill && skill.length > 0)
              .map(skill => skill.charAt(0).toUpperCase() + skill.slice(1).toLowerCase())
              .filter((skill, index, self) => self.indexOf(skill) === index) // Remove duplicates
              .slice(0, 50); // Limit to 50 skills
          } catch (parseError) {
            console.error('Error parsing skills from Gemini response:', parseError);
            console.error('Raw response:', content);
          }
        }
      }
    }

    return skills;
  } catch (error) {
    console.error('Error extracting skills from resume:', error);
    return [];
  }
};

module.exports = {
  extractSkillsFromResume
};

