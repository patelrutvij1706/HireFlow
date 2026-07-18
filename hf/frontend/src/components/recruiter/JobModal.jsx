import React, { useState, useEffect } from 'react';
import { FaTimes, FaSpinner } from 'react-icons/fa';
import { createJob, updateJob, getRecruiterJob, generateAptitudeTest } from '../../services/recruiterJobService';

const JobModal = ({ job, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    companyName: '',
    location: '',
    jobType: 'Full-time',
    workMode: 'On-site',
    experienceLevel: '',
    salaryMin: '',
    salaryMax: '',
    salaryCurrency: 'USD',
    description: '',
    requirements: '',
    benefits: '',
    skills: [],
    companyLogoUrl: '',
    isActive: true,
    applicationDeadline: '',
    testDate: '',
    testStartTime: '',
    testEndTime: ''
  });
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generateTest, setGenerateTest] = useState(false);
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [passingPercentage, setPassingPercentage] = useState(70);
  const [timeLimit, setTimeLimit] = useState(30); // Default 30 minutes
  const [generatingTest, setGeneratingTest] = useState(false);

  useEffect(() => {
    if (job) {
      // Load full job details if editing
      if (job.id && !job.skills) {
        loadJobDetails(job.id);
      } else {
        setFormData({
          title: job.title || '',
          companyName: job.companyName || '',
          location: job.location || '',
          jobType: job.jobType || 'Full-time',
          workMode: job.workMode || 'On-site',
          experienceLevel: job.experienceLevel || '',
          salaryMin: job.salaryMin || '',
          salaryMax: job.salaryMax || '',
          salaryCurrency: job.salaryCurrency || 'USD',
          description: job.description || '',
          requirements: job.requirements || '',
          benefits: job.benefits || '',
          skills: job.skills ? job.skills.map(s => s.skillName || s) : [],
          companyLogoUrl: job.companyLogoUrl || '',
          isActive: job.isActive !== undefined ? job.isActive : true,
          applicationDeadline: job.applicationDeadline ? new Date(job.applicationDeadline).toISOString().split('T')[0] : '',
          testDate: job.testDate || '',
          testStartTime: job.testStartTime || '',
          testEndTime: job.testEndTime || ''
        });
      }
    }
  }, [job]);

  const loadJobDetails = async (jobId) => {
    try {
      const response = await getRecruiterJob(jobId);
      if (response.data && response.data.success) {
        const jobData = response.data.data.job;
        setFormData({
          title: jobData.title || '',
          companyName: jobData.companyName || '',
          location: jobData.location || '',
          jobType: jobData.jobType || 'Full-time',
          workMode: jobData.workMode || 'On-site',
          experienceLevel: jobData.experienceLevel || '',
          salaryMin: jobData.salaryMin || '',
          salaryMax: jobData.salaryMax || '',
          salaryCurrency: jobData.salaryCurrency || 'USD',
          description: jobData.description || '',
          requirements: jobData.requirements || '',
          benefits: jobData.benefits || '',
          skills: jobData.skills ? jobData.skills.map(s => s.skillName || s) : [],
          companyLogoUrl: jobData.companyLogoUrl || '',
          isActive: jobData.isActive !== undefined ? jobData.isActive : true,
          applicationDeadline: jobData.applicationDeadline ? new Date(jobData.applicationDeadline).toISOString().split('T')[0] : '',
          testDate: jobData.testDate || '',
          testStartTime: jobData.testStartTime || '',
          testEndTime: jobData.testEndTime || ''
        });
      }
    } catch (error) {
      console.error('Error loading job details:', error);
      setError('Error loading job details');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddSkill = (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const validateForm = () => {
    if (!formData.title || !formData.location || !formData.jobType || !formData.workMode || !formData.experienceLevel || !formData.description) {
      setError('Please fill in all required fields');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      const data = {
        ...formData,
        salaryMin: formData.salaryMin ? parseFloat(formData.salaryMin) : null,
        salaryMax: formData.salaryMax ? parseFloat(formData.salaryMax) : null,
        isActive: formData.isActive !== undefined ? formData.isActive : true,
        applicationDeadline: formData.applicationDeadline || null,
        testDate: formData.testDate || null,
        testStartTime: formData.testStartTime || null,
        testEndTime: formData.testEndTime || null
      };

      let savedJob;
      if (job && job.id) {
        const response = await updateJob(job.id, data);
        savedJob = response.data?.data?.job || job;
      } else {
        const response = await createJob(data);
        savedJob = response.data?.data?.job;
      }

      // Generate aptitude test if requested (only for new jobs)
      if (generateTest && savedJob && savedJob.id && !job) {
        try {
          setGeneratingTest(true);
          setError(''); // Clear any previous errors
          await generateAptitudeTest(savedJob.id, numberOfQuestions, passingPercentage, timeLimit);
        } catch (testError) {
          console.error('Error generating aptitude test:', testError);
          const errorMessage = testError.response?.data?.message || testError.message || 'Failed to generate aptitude test';
          const statusCode = testError.response?.status;
          
          // Check if it's an API overload error (503 or API_OVERLOAD)
          if (
            statusCode === 503 || 
            testError.response?.data?.error === 'API_OVERLOAD' || 
            errorMessage.toLowerCase().includes('high load') || 
            errorMessage.toLowerCase().includes('wait') ||
            errorMessage.toLowerCase().includes('overloaded') ||
            errorMessage.toLowerCase().includes('rate limit') ||
            errorMessage.toLowerCase().includes('service unavailable')
          ) {
            setError('⚠️ The AI service is currently experiencing high load. Please wait a few moments (1-2 minutes) and try generating the test again from the job details page. The job has been saved successfully.');
          } else {
            setError('Job saved successfully, but failed to generate aptitude test: ' + errorMessage + '. You can try generating it again later from the job details page.');
          }
        } finally {
          setGeneratingTest(false);
        }
      }

      onSave();
    } catch (error) {
      console.error('Error saving job:', error);
      setError(error.response?.data?.message || 'Error saving job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            {job ? 'Edit Job' : 'Post New Job'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Level <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleChange}
                  placeholder="e.g., Entry Level, Mid Level, Senior"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                  <option value="Freelance">Freelance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Work Mode <span className="text-red-500">*</span>
                </label>
                <select
                  name="workMode"
                  value={formData.workMode}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Application Deadline
                </label>
                <input
                  type="date"
                  name="applicationDeadline"
                  value={formData.applicationDeadline}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-gray-500 mt-1">
                  After this date, the job will be removed from browse jobs section. Only candidates who have applied can see it.
                </p>
              </div>
            </div>
          </div>

          {/* Test Schedule */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Test Schedule</h3>
            <p className="text-sm text-gray-600 mb-4">
              Set the date and time window when candidates can take the aptitude test. Candidates can only attempt the test during this period.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Date
                </label>
                <input
                  type="date"
                  name="testDate"
                  value={formData.testDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  name="testStartTime"
                  value={formData.testStartTime}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  name="testEndTime"
                  value={formData.testEndTime}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Candidates can only take the test between the specified start and end time on the test date. If they miss this window, they will be automatically rejected.
            </p>
          </div>

          {/* Salary */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Salary</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Salary
                </label>
                <input
                  type="number"
                  name="salaryMin"
                  value={formData.salaryMin}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Salary
                </label>
                <input
                  type="number"
                  name="salaryMax"
                  value={formData.salaryMax}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  name="salaryCurrency"
                  value={formData.salaryCurrency}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="INR">INR</option>
                </select>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Description</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Requirements */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Requirements</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requirements
              </label>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                rows={4}
                placeholder="List the requirements for this job..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Benefits */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Benefits</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Benefits
              </label>
              <textarea
                name="benefits"
                value={formData.benefits}
                onChange={handleChange}
                rows={4}
                placeholder="List the benefits for this job..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Skills */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Required Skills</h3>
            
            <div className="mb-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill(e);
                    }
                  }}
                  placeholder="Add a skill and press Enter"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            {formData.skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary bg-opacity-10 text-primary rounded-full text-sm flex items-center space-x-2"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-primary hover:text-primary-dark"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Company Logo URL */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Company Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Logo URL
              </label>
              <input
                type="url"
                name="companyLogoUrl"
                value={formData.companyLogoUrl}
                onChange={handleChange}
                placeholder="https://example.com/logo.png"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Generate Aptitude Test (only for new jobs) */}
          {!job && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Aptitude Test</h3>
              <label className="flex items-center space-x-2 mb-4">
                <input
                  type="checkbox"
                  checked={generateTest}
                  onChange={(e) => setGenerateTest(e.target.checked)}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="text-sm font-medium text-gray-700">
                  Generate aptitude test using Gemini API
                </span>
              </label>
              {generateTest && (
                <div className="ml-6 mb-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Questions
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="50"
                      value={numberOfQuestions}
                      onChange={(e) => setNumberOfQuestions(parseInt(e.target.value) || 10)}
                      className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Passing Percentage <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={passingPercentage}
                        onChange={(e) => setPassingPercentage(parseFloat(e.target.value) || 0)}
                        className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <span className="text-gray-600">%</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Candidates scoring above this percentage will be shortlisted.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time Limit (Minutes)
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="5"
                        max="300"
                        value={timeLimit}
                        onChange={(e) => setTimeLimit(parseInt(e.target.value) || 30)}
                        className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <span className="text-gray-600">minutes</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Maximum time candidates will have to complete the test. Test will auto-submit when time expires.
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">
                    Generate an aptitude test with questions related to this job position.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Job Status (for editing) */}
          {job && (
            <div className="border-t border-gray-200 pt-6">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="text-sm font-medium text-gray-700">
                  {formData.isActive ? 'Job is active' : 'Job is closed'}
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Uncheck to close this job posting. Closed jobs won't appear in job listings.
              </p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || generatingTest}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {(loading || generatingTest) && <FaSpinner className="animate-spin" />}
              <span>
                {generatingTest ? 'Generating Test...' : loading ? 'Saving...' : job ? 'Update Job' : 'Post Job'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobModal;
