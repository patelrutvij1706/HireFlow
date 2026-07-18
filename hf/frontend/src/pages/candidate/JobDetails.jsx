import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUser,
  FaDollarSign,
  FaBookmark,
  FaBuilding,
  FaArrowLeft,
  FaCheckCircle,
  FaUpload,
  FaFile,
  FaTimes,
  FaBan
} from 'react-icons/fa';
import { getJobById, applyForJob, toggleSaveJob } from '../../services/jobService';
import { checkTestAvailability } from '../../services/candidateTestService';
import Loading from '../../components/Loading';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [coverLetterFile, setCoverLetterFile] = useState(null);
  const [coverLetterText, setCoverLetterText] = useState('');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [error, setError] = useState('');
  const [testInfo, setTestInfo] = useState(null);
  const [loadingTestInfo, setLoadingTestInfo] = useState(false);

  useEffect(() => {
    loadJob();
  }, [id]);

  useEffect(() => {
    // Load test info if candidate has applied (to check availability and submission status)
    if (job && job.isApplied) {
      loadTestInfo();
    } else if (job && !job.isApplied) {
      // Reset test info if not applied
      setTestInfo(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job?.isApplied, id]);

  const loadJob = async () => {
    try {
      setLoading(true);
      const response = await getJobById(id);
      if (response.success) {
        setJob(response.data.job);
      }
    } catch (error) {
      console.error('Error loading job:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTestInfo = async () => {
    try {
      setLoadingTestInfo(true);
      const response = await checkTestAvailability(id);
      if (response.data && response.data.success) {
        setTestInfo(response.data.data);
      } else {
        console.error('Unexpected response format:', response);
        setTestInfo({ hasTest: false, hasApplied: true });
      }
    } catch (error) {
      console.error('Error loading test info:', error);
      console.error('Error details:', error.response?.data);
      // Set default values on error
      setTestInfo({ hasTest: false, hasApplied: true });
    } finally {
      setLoadingTestInfo(false);
    }
  };

  const handleSaveJob = async () => {
    try {
      setSaving(true);
      const response = await toggleSaveJob(id);
      if (response.success) {
        setJob(prev => ({ ...prev, isSaved: response.data.isSaved }));
      }
    } catch (error) {
      console.error('Error saving job:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleResumeFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!allowedTypes.includes(file.type)) {
        setError('Invalid resume file type. Please upload PDF, DOC, or DOCX file.');
        return;
      }

      if (file.size > maxSize) {
        setError('Resume file size exceeds 10MB limit.');
        return;
      }

      setResumeFile(file);
      setError('');
    }
  };

  const handleCoverLetterFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!allowedTypes.includes(file.type)) {
        setError('Invalid cover letter file type. Please upload PDF, DOC, or DOCX file.');
        return;
      }

      if (file.size > maxSize) {
        setError('Cover letter file size exceeds 10MB limit.');
        return;
      }

      setCoverLetterFile(file);
      setCoverLetterText(''); // Clear text if file is uploaded
      setError('');
    }
  };

  const handleApply = async () => {
    setError('');
    
    // Validate resume is uploaded
    if (!resumeFile) {
      setError('Please upload your resume to apply for this job.');
      return;
    }

    try {
      setApplying(true);
      const response = await applyForJob(id, resumeFile, coverLetterFile, coverLetterText);
      if (response.success) {
        setJob(prev => ({ ...prev, isApplied: true, application: response.data.application }));
        setShowApplyModal(false);
        setResumeFile(null);
        setCoverLetterFile(null);
        setCoverLetterText('');
        // Reload job to get updated isApplied status
        await loadJob();
        // Load test info after applying
        await loadTestInfo();
      }
    } catch (error) {
      console.error('Error applying for job:', error);
      setError(error.response?.data?.message || 'Error applying for job');
    } finally {
      setApplying(false);
    }
  };

  const removeResumeFile = () => {
    setResumeFile(null);
  };

  const removeCoverLetterFile = () => {
    setCoverLetterFile(null);
  };

  const formatSalary = (min, max, currency = 'USD') => {
    if (!min && !max) return 'Not specified';
    const formatNumber = (num) => {
      return new Intl.NumberFormat('en-US').format(num);
    };
    if (min && max) {
      return `$${formatNumber(min)} - $${formatNumber(max)}`;
    }
    return min ? `$${formatNumber(min)}+` : `Up to $${formatNumber(max)}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (loading) {
    return <Loading />;
  }

  if (!job) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600 text-lg">Job not found</p>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 space-y-4">
        {/* Back Button */}
        <button
          onClick={() => navigate('/browse-jobs')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <FaArrowLeft className="w-4 h-4" />
          <span>Back to Jobs</span>
        </button>

        {/* Job Header */}
        <div className="bg-white rounded-lg shadow p-6">
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
                <h1 className="text-2xl font-bold text-gray-800 mb-1">{job.title}</h1>
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
                </div>
              </div>
            </div>
            <button
              onClick={handleSaveJob}
              disabled={saving}
              className={`p-3 rounded-lg transition-colors ${
                job.isSaved
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FaBookmark className="w-5 h-5" />
            </button>
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

          {/* Test Schedule Information */}
          {job.testDate && job.testStartTime && job.testEndTime && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">📅 Aptitude Test Schedule</h3>
              <p className="text-sm text-blue-800">
                <span className="font-medium">Date:</span> {new Date(job.testDate).toLocaleDateString('en-GB', { 
                  day: '2-digit', 
                  month: '2-digit', 
                  year: 'numeric' 
                })}
              </p>
              <p className="text-sm text-blue-800">
                <span className="font-medium">Time:</span> {job.testStartTime} - {job.testEndTime}
              </p>
              <p className="text-xs text-blue-700 mt-2">
                ⚠️ You can only take the test during this time window. Missing the test will result in automatic rejection.
              </p>
            </div>
          )}

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

          <div className="flex gap-3 flex-wrap">
            {job.isApplied ? (
              <>
                {job.application?.status === 'Rejected' ? (
                  <button
                    disabled
                    className="px-6 py-2 bg-red-100 text-red-700 rounded-lg flex items-center space-x-2 cursor-not-allowed"
                  >
                    <FaBan className="w-5 h-5" />
                    <span>Application Rejected</span>
                  </button>
                ) : job.application?.status === 'Offer' ? (
                  <button
                    disabled
                    className="px-6 py-2 bg-purple-100 text-purple-700 rounded-lg flex items-center space-x-2 cursor-not-allowed"
                  >
                    <FaCheckCircle className="w-5 h-5" />
                    <span>Offer Received</span>
                  </button>
                ) : job.application?.status === 'Interview' ? (
                  <button
                    disabled
                    className="px-6 py-2 bg-green-100 text-green-700 rounded-lg flex items-center space-x-2 cursor-not-allowed"
                  >
                    <FaCheckCircle className="w-5 h-5" />
                    <span>Interview Scheduled</span>
                  </button>
                ) : job.application?.status === 'Under Review' ? (
                  <button
                    disabled
                    className="px-6 py-2 bg-blue-100 text-blue-700 rounded-lg flex items-center space-x-2 cursor-not-allowed"
                  >
                    <FaCheckCircle className="w-5 h-5" />
                    <span>Under Review</span>
                  </button>
                ) : (
                  <button
                    disabled
                    className="px-6 py-2 bg-green-100 text-green-700 rounded-lg flex items-center space-x-2 cursor-not-allowed"
                  >
                    <FaCheckCircle className="w-5 h-5" />
                    <span>Applied</span>
                  </button>
                )}
                {job.application?.status !== 'Rejected' && (
                  <>
                    {loadingTestInfo ? (
                      <div className="px-6 py-2 text-gray-500">Checking test...</div>
                    ) : testInfo && testInfo.hasTest && !testInfo.hasSubmitted && (
                      <>
                        {testInfo.canTakeTest ? (
                          <button
                            onClick={() => navigate(`/jobs/${id}/take-test`)}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Take Aptitude Test
                          </button>
                        ) : (
                          <div className="px-6 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-800 font-medium">
                              {testInfo.testStatus === 'scheduled' && (
                                <>⏰ {testInfo.testMessage}</>
                              )}
                              {testInfo.testStatus === 'expired' && (
                                <>❌ {testInfo.testMessage}</>
                              )}
                              {!testInfo.testStatus && testInfo.testMessage && (
                                <>{testInfo.testMessage}</>
                              )}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
                {job.application?.status !== 'Rejected' && testInfo && testInfo.hasTest && testInfo.testStatus === 'available' && !testInfo.hasSubmitted && (
                  <div className="px-6 py-2 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      ✅ {testInfo.testMessage || 'Test is available now'}
                    </p>
                  </div>
                )}
                {job.application?.status !== 'Rejected' && testInfo && testInfo.hasSubmitted && (
                  <button
                    onClick={() => navigate(`/jobs/${id}/test-result`)}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    View Test Result
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={() => setShowApplyModal(true)}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                Apply Now
              </button>
            )}
          </div>
        </div>

        {/* Job Description */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Job Description</h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
          </div>
        </div>

        {/* Requirements */}
        {job.requirements && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Requirements</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-line">{job.requirements}</p>
            </div>
          </div>
        )}

        {/* Benefits */}
        {job.benefits && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Benefits</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-line">{job.benefits}</p>
            </div>
          </div>
        )}

        {/* Company Info */}
        {job.recruiter && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">About {job.companyName}</h2>
            {job.recruiter.industryType && (
              <p className="text-gray-700 mb-2">
                <span className="font-medium">Industry:</span> {job.recruiter.industryType}
              </p>
            )}
            {job.recruiter.companySize && (
              <p className="text-gray-700 mb-2">
                <span className="font-medium">Company Size:</span> {job.recruiter.companySize}
              </p>
            )}
            {job.recruiter.headquartersLocation && (
              <p className="text-gray-700 mb-2">
                <span className="font-medium">Headquarters:</span> {job.recruiter.headquartersLocation}
              </p>
            )}
            {job.recruiter.companyWebsite && (
              <a
                href={job.recruiter.companyWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Visit Company Website
              </a>
            )}
          </div>
        )}
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Apply for {job.title}</h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Resume Upload - Required */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resume <span className="text-red-500">*</span>
              </label>
              {resumeFile ? (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-2">
                    <FaFile className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-700">{resumeFile.name}</span>
                    <span className="text-xs text-gray-500">
                      ({(resumeFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <button
                    onClick={removeResumeFile}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTimes className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="block">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors">
                    <FaUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-1">Click to upload resume</p>
                    <p className="text-xs text-gray-500">PDF, DOC, DOCX (Max 10MB)</p>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeFile}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Cover Letter Upload - Optional */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Letter (Optional)
              </label>
              
              {/* Cover Letter File Upload */}
              {coverLetterFile ? (
                <div className="mb-3 flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-2">
                    <FaFile className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-700">{coverLetterFile.name}</span>
                    <span className="text-xs text-gray-500">
                      ({(coverLetterFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <button
                    onClick={removeCoverLetterFile}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTimes className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="mb-3">
                  <label className="block">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors">
                      <FaUpload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs text-gray-600 mb-1">Upload cover letter as file</p>
                      <p className="text-xs text-gray-500">PDF, DOC, DOCX (Max 10MB)</p>
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleCoverLetterFile}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {/* Cover Letter Text Input - Only show if no file uploaded */}
              {!coverLetterFile && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Or write your cover letter below:</p>
                  <textarea
                    value={coverLetterText}
                    onChange={(e) => setCoverLetterText(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Tell the employer why you're a good fit for this position..."
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowApplyModal(false);
                  setResumeFile(null);
                  setCoverLetterFile(null);
                  setCoverLetterText('');
                  setError('');
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={applying || !resumeFile}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {applying ? 'Applying...' : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default JobDetails;

