const { Job, JobSkill, Skill } = require('../models');
const { Op } = require('sequelize');

/**
 * Calculate job match score based on candidate skills
 * @param {Array} candidateSkills - Array of candidate skill names
 * @param {Array} jobSkills - Array of job skill names
 * @returns {number} - Match score between 0 and 100
 */
const calculateJobMatchScore = (candidateSkills, jobSkills) => {
  if (!candidateSkills || candidateSkills.length === 0) {
    return 0;
  }

  if (!jobSkills || jobSkills.length === 0) {
    return 0;
  }

  // Normalize skills to lowercase for comparison
  const candidateSkillsLower = candidateSkills.map(skill => 
    typeof skill === 'string' ? skill.toLowerCase().trim() : (skill.name || '').toLowerCase().trim()
  ).filter(skill => skill.length > 0);

  const jobSkillsLower = jobSkills.map(skill => 
    typeof skill === 'string' ? skill.toLowerCase().trim() : (skill.skillName || '').toLowerCase().trim()
  ).filter(skill => skill.length > 0);

  // Count matching skills
  const matchingSkills = candidateSkillsLower.filter(candidateSkill => 
    jobSkillsLower.some(jobSkill => {
      // Exact match
      if (candidateSkill === jobSkill) return true;
      // Partial match (e.g., "React" matches "React.js")
      if (candidateSkill.includes(jobSkill) || jobSkill.includes(candidateSkill)) return true;
      return false;
    })
  );

  // Calculate match percentage
  const matchScore = (matchingSkills.length / jobSkillsLower.length) * 100;
  return Math.min(100, Math.round(matchScore * 100) / 100); // Round to 2 decimal places
};

/**
 * Get recommended jobs for a candidate based on their skills
 * @param {string} candidateId - Candidate ID
 * @param {Array} jobs - Array of job objects with skills
 * @returns {Array} - Array of jobs with match scores, sorted by score (descending)
 */
const getRecommendedJobs = async (candidateId, jobs) => {
  try {
    // Get candidate skills
    const candidateSkills = await Skill.findAll({
      where: { candidateId },
      attributes: ['name']
    });

    if (!candidateSkills || candidateSkills.length === 0) {
      return jobs.map(job => ({
        ...job,
        matchScore: 0,
        isRecommended: false
      }));
    }

    const candidateSkillNames = candidateSkills.map(skill => skill.name);

    // Calculate match score for each job
    const jobsWithScores = jobs.map(job => {
      const jobSkills = job.skills || [];
      const matchScore = calculateJobMatchScore(candidateSkillNames, jobSkills);
      
      return {
        ...job,
        matchScore,
        isRecommended: matchScore > 0, // Recommended if there's any skill match
        matchedSkillsCount: jobSkills.filter(jobSkill => {
          const jobSkillName = (jobSkill.skillName || '').toLowerCase().trim();
          return candidateSkillNames.some(candidateSkill => {
            const candidateSkillLower = candidateSkill.toLowerCase().trim();
            return candidateSkillLower === jobSkillName || 
                   candidateSkillLower.includes(jobSkillName) || 
                   jobSkillName.includes(candidateSkillLower);
          });
        }).length
      };
    });

    // Sort by match score (descending), then by matched skills count
    jobsWithScores.sort((a, b) => {
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      return b.matchedSkillsCount - a.matchedSkillsCount;
    });

    return jobsWithScores;
  } catch (error) {
    console.error('Error getting recommended jobs:', error);
    return jobs.map(job => ({
      ...job,
      matchScore: 0,
      isRecommended: false
    }));
  }
};

module.exports = {
  calculateJobMatchScore,
  getRecommendedJobs
};

