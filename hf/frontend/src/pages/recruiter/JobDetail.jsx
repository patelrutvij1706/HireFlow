import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaEye,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUser,
  FaDollarSign,
  FaUsers,
  FaBuilding,
  FaTimes,
  FaSpinner
} from 'react-icons/fa';
import { getRecruiterJob, deleteJob } from '../../services/recruiterJobService';
import { generateAptitudeTest, getRecruiterAptitudeTests } from '../../services/aptitudeTestService';
import JobModal from '../../components/recruiter/JobModal';
import Loading from '../../components/Loading';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showJobModal, setShowJobModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [generatingTest, setGeneratingTest] = useState(false);
  const [testError, setTestError] = useState('');
  const [hasTest, setHasTest] = useState(false);
  const [checkingTest, setCheckingTest] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [testParams, setTestParams] = useState({
    numberOfQuestions: 10,
    passingPercentage: 70,
    timeLimit: 30
  });

  useEffect(() => {
    loadJob();
  }, [id]);

  useEffect(() => {
    if (job) {
      checkExistingTest();
    }
  }, [job, id]);

  const loadJob = async () => {
    try {
      setLoading(true);
      const response = await getRecruiterJob(id);
      if (response.data && response.data.success) {
        setJob(response.data.data.job);
      }
    } catch (error) {
      console.error('Error loading job:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setShowJobModal(true);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      const response = await deleteJob(id);
      if (response.data && response.data.success) {
        navigate('/recruiter/jobs');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      alert(error.response?.data?.message || 'Error deleting job');
    } finally {
      setDeleting(false);
    }
  };

  const handleViewApplications = () => {
    navigate(`/recruiter/applications?jobId=${id}`);
  };

  const handleJobSaved = () => {
    setShowJobModal(false);
    loadJob();
  };

  const checkExistingTest = async () => {
    try {
      setCheckingTest(true);
      const response = await getRecruiterAptitudeTests();
      if (response.data && response.data.success) {
        const tests = response.data.data.tests || [];
        const testForThisJob = tests.find(t => t.jobId === id);
        setHasTest(!!testForThisJob);
      }
    } catch (error) {
      console.error('Error checking existing test:', error);
    } finally {
      setCheckingTest(false);
    }
  };

  const handleOpenTestModal = () => {
    setTestError('');
    setShowTestModal(true);
  };

  const handleCloseTestModal = () => {
    setShowTestModal(false);
    setTestError('');
  };

  const handleTestParamChange = (field, value) => {
    setTestParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGenerateTest = async () => {
    try {
      setGeneratingTest(true);
      setTestError('');
      await generateAptitudeTest(
        id, 
        testParams.numberOfQuestions, 
        testParams.passingPercentage, 
        testParams.timeLimit
      );
      setHasTest(true);
      setShowTestModal(false);
      alert('Aptitude test generated successfully! You can view it in the Aptitude Tests section.');
    } catch (error) {
      console.error('Error generating test:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to generate test';
      const statusCode = error.response?.status;
      
      // Check if it's an API overload error (503 or API_OVERLOAD)
      if (
        statusCode === 503 || 
        error.response?.data?.error === 'API_OVERLOAD' || 
        errorMessage.toLowerCase().includes('high load') || 
        errorMessage.toLowerCase().includes('wait') ||
        errorMessage.toLowerCase().includes('overloaded') ||
        errorMessage.toLowerCase().includes('rate limit') ||
        errorMessage.toLowerCase().includes('service unavailable')
      ) {
        setTestError('⚠️ The AI service is currently experiencing high load. Please wait a few moments (1-2 minutes) and try again.');
      } else {
        setTestError('Failed to generate test: ' + errorMessage + '. Please try again later.');
      }
    } finally {
      setGeneratingTest(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatSalary = (min, max, currency = 'USD') => {
    if (!min && !max) return 'Not specified';
    const formatNumber = (num) => {
      return new Intl.NumberFormat('en-US').format(num);
    };
    if (min && max) {
      return `${currency} ${formatNumber(min)} - ${formatNumber(max)}`;
    }
    return min ? `${currency} ${formatNumber(min)}+` : `Up to ${currency} ${formatNumber(max)}`;
  };

  if (loading) {
    return <Loading />;
  }

  if (!job) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <p className="text-gray-600 text-lg mb-4">Job not found</p>
          <button
            onClick={() => navigate('/recruiter/jobs')}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/recruiter/jobs')}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors mb-4"
      >
        <FaArrowLeft className="w-4 h-4" />
        <span>Back to Jobs</span>
      </button>

      {/* Job Header */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4 flex-1">
            {job.companyLogoUrl ? (
              <img
                src={job.companyLogoUrl}
                alt={job.companyName}
                className="w-16 h-16 rounded-lg object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                <FaBuilding className="w-8 h-8 text-gray-400" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-800">{job.title}</h1>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    job.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {job.isActive ? 'Active' : 'Closed'}
                </span>
              </div>
              <p className="text-lg text-gray-600 mb-3">{job.companyName}</p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <FaMapMarkerAlt className="w-4 h-4 mr-2 text-gray-400" />
                  {job.location}
                </div>
                <div className="flex items-center">
                  <FaCalendarAlt className="w-4 h-4 mr-2 text-gray-400" />
                  Posted on {formatDate(job.createdAt)}
                </div>
                <div className="flex items-center">
                  <FaUser className="w-4 h-4 mr-2 text-gray-400" />
                  {job.experienceLevel}
                </div>
                <div className="flex items-center">
                  <FaDollarSign className="w-4 h-4 mr-2 text-gray-400" />
                  {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                </div>
                <div className="flex items-center">
                  <FaUsers className="w-4 h-4 mr-2 text-gray-400" />
                  {job.applicationCount || 0} applications
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            job.jobType === 'Full-time' ? 'bg-blue-100 text-blue-700' :
            job.jobType === 'Part-time' ? 'bg-green-100 text-green-700' :
            job.jobType === 'Contract' ? 'bg-purple-100 text-purple-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {job.jobType}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            job.workMode === 'Remote' ? 'bg-green-100 text-green-700' :
            job.workMode === 'Hybrid' ? 'bg-blue-100 text-blue-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {job.workMode}
          </span>
        </div>

        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {job.skills.map((skill) => (
              <span
                key={skill.id}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded"
              >
                {skill.skillName}
              </span>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 flex-wrap">
          <button
            onClick={handleViewApplications}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center space-x-2"
          >
            <FaEye className="w-5 h-5" />
            <span>View Applications ({job.applicationCount || 0})</span>
          </button>
          {!hasTest && !checkingTest && (
            <button
              onClick={handleOpenTestModal}
              disabled={generatingTest}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              {generatingTest ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Generating Test...</span>
                </>
              ) : (
                <>
                  <span>📝</span>
                  <span>Generate Aptitude Test</span>
                </>
              )}
            </button>
          )}
          {hasTest && (
            <button
              onClick={() => navigate('/recruiter/aptitude-tests')}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <FaEye className="w-5 h-5" />
              <span>View Test</span>
            </button>
          )}
          <button
            onClick={handleEdit}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
          >
            <FaEdit className="w-5 h-5" />
            <span>Edit</span>
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-6 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <FaTrash className="w-5 h-5" />
            <span>{deleting ? 'Deleting...' : 'Delete'}</span>
          </button>
        </div>
        
        {/* Test Error Message */}
        {testError && (
          <div className={`mt-4 p-4 rounded-lg border ${
            testError.includes('high load') || testError.includes('overloaded') || testError.includes('wait')
              ? 'bg-orange-50 border-orange-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <p className={`text-sm ${
              testError.includes('high load') || testError.includes('overloaded') || testError.includes('wait')
                ? 'text-orange-800'
                : 'text-red-800'
            }`}>
              {testError}
            </p>
          </div>
        )}
      </div>

      {/* Job Description */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Job Description</h2>
        <div className="prose max-w-none">
          <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
        </div>
      </div>

      {/* Requirements */}
      {job.requirements && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Requirements</h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-line">{job.requirements}</p>
          </div>
        </div>
      )}

      {/* Benefits */}
      {job.benefits && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Benefits</h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-line">{job.benefits}</p>
          </div>
        </div>
      )}

      {/* Job Modal */}
      {showJobModal && (
        <JobModal
          job={job}
          onClose={() => setShowJobModal(false)}
          onSave={handleJobSaved}
        />
      )}

      {/* Test Generation Modal */}
      {showTestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Generate Aptitude Test</h2>
              <button
                onClick={handleCloseTestModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={generatingTest}
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {testError && (
                <div className={`p-3 rounded-lg border ${
                  testError.includes('high load') || testError.includes('overloaded') || testError.includes('wait')
                    ? 'bg-orange-50 border-orange-200 text-orange-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  <p className="text-sm">{testError}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Questions
                </label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={testParams.numberOfQuestions}
                  onChange={(e) => handleTestParamChange('numberOfQuestions', parseInt(e.target.value) || 10)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={generatingTest}
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 5, Maximum 50 questions</p>
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
                    value={testParams.passingPercentage}
                    onChange={(e) => handleTestParamChange('passingPercentage', parseFloat(e.target.value) || 0)}
                    className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={generatingTest}
                  />
                  <span className="text-gray-600">%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Candidates scoring above this percentage will be shortlisted.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Limit (Minutes) <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="5"
                    max="300"
                    value={testParams.timeLimit}
                    onChange={(e) => handleTestParamChange('timeLimit', parseInt(e.target.value) || 30)}
                    className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={generatingTest}
                  />
                  <span className="text-gray-600">minutes</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Maximum time candidates will have to complete the test. Test will auto-submit when time expires.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleCloseTestModal}
                  disabled={generatingTest}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateTest}
                  disabled={generatingTest || !testParams.passingPercentage || !testParams.timeLimit}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {generatingTest ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <span>Generate Test</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetail;

