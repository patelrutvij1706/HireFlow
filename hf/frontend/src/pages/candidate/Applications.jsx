import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaChevronRight, 
  FaMapMarkerAlt, 
  FaUser, 
  FaDollarSign,
  FaBuilding
} from 'react-icons/fa';
import { getApplications } from '../../services/applicationService';
import { checkTestAvailability } from '../../services/candidateTestService';
import Loading from '../../components/Loading';

const Applications = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testInfoMap, setTestInfoMap] = useState({});
  const [loadingTests, setLoadingTests] = useState({});

  useEffect(() => {
    const loadApplications = async () => {
      try {
        setLoading(true);
        const response = await getApplications();
        if (response.data && response.data.success) {
          const apps = response.data.data || [];
          setApplications(apps);
          
          // Load test info for each application
          apps.forEach(async (app) => {
            if (app.job?.id) {
              loadTestInfo(app.job.id, app.id);
            }
          });
        } else {
          console.error('Unexpected response format:', response);
        }
      } catch (error) {
        console.error('Error loading applications:', error);
        if (error.response) {
          console.error('Error response:', error.response.data);
        }
      } finally {
        setLoading(false);
      }
    };
    loadApplications();
  }, [location.pathname]); // Reload when pathname changes

  const loadTestInfo = async (jobId, applicationId) => {
    try {
      setLoadingTests(prev => ({ ...prev, [applicationId]: true }));
      const response = await checkTestAvailability(jobId);
      if (response.data && response.data.success) {
        setTestInfoMap(prev => ({
          ...prev,
          [applicationId]: response.data.data
        }));
      }
    } catch (error) {
      console.error('Error loading test info:', error);
    } finally {
      setLoadingTests(prev => ({ ...prev, [applicationId]: false }));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Interview':
        return 'bg-green-100 text-green-800';
      case 'Under Review':
        return 'bg-blue-100 text-blue-800';
      case 'Offer':
        return 'bg-purple-100 text-purple-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'Interview':
        return 'Interview Scheduled';
      case 'Offer':
        return 'Offer Received';
      default:
        return status;
    }
  };

  const getNextStep = (status) => {
    switch (status) {
      case 'Applied':
        return 'Waiting for response';
      case 'Under Review':
        return 'Waiting for response';
      case 'Interview':
        return 'Technical Interview';
      case 'Offer':
        return 'Pending decision';
      case 'Rejected':
        return 'Application rejected';
      default:
        return 'Waiting for response';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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

  const handleApplicationClick = (applicationId) => {
    navigate(`/applications/${applicationId}`);
  };

  const handleViewJob = (e, jobId) => {
    e.stopPropagation();
    navigate(`/jobs/${jobId}`);
  };

  const handleTakeTest = (e, jobId) => {
    e.stopPropagation();
    navigate(`/jobs/${jobId}/take-test`);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">My Applications</h1>
        <p className="text-gray-600 text-sm">Track all your job applications</p>
      </div>

      {/* Apply Button */}
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => navigate('/browse-jobs')}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
        >
          + Apply to Jobs
        </button>
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 mb-4">No applications yet</p>
          <button
            onClick={() => navigate('/browse-jobs')}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
          >
            Browse Jobs
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => {
            const job = application.job;
            const testInfo = testInfoMap[application.id];
            const isLoadingTest = loadingTests[application.id];

            return (
              <div
                key={application.id}
                className="bg-white rounded-lg shadow p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3 flex-1">
                    {job?.companyLogoUrl ? (
                      <img
                        src={job.companyLogoUrl}
                        alt={job.companyName}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        <FaBuilding className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {job?.title || 'Job Title'}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            application.status
                          )}`}
                        >
                          {getStatusLabel(application.status)}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">
                        {job?.companyName || 'Company Name'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Job Details */}
                {job && (
                  <div className="mb-4 space-y-2">
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      {job.location && (
                        <div className="flex items-center">
                          <FaMapMarkerAlt className="w-4 h-4 mr-2 text-gray-400" />
                          {job.location}
                        </div>
                      )}
                      {job.experienceLevel && (
                        <div className="flex items-center">
                          <FaUser className="w-4 h-4 mr-2 text-gray-400" />
                          {job.experienceLevel}
                        </div>
                      )}
                      {(job.salaryMin || job.salaryMax) && (
                        <div className="flex items-center">
                          <FaDollarSign className="w-4 h-4 mr-2 text-gray-400" />
                          {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                        </div>
                      )}
                      <div className="flex items-center">
                        <FaCalendarAlt className="w-4 h-4 mr-2 text-gray-400" />
                        Applied {formatDate(application.appliedAt)}
                      </div>
                    </div>

                    {/* Job Type and Work Mode */}
                    <div className="flex flex-wrap gap-2">
                      {job.jobType && (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          job.jobType === 'Full-time' ? 'bg-blue-100 text-blue-700' :
                          job.jobType === 'Part-time' ? 'bg-green-100 text-green-700' :
                          job.jobType === 'Contract' ? 'bg-purple-100 text-purple-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {job.jobType}
                        </span>
                      )}
                      {job.workMode && (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          job.workMode === 'Remote' ? 'bg-green-100 text-green-700' :
                          job.workMode === 'Hybrid' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {job.workMode}
                        </span>
                      )}
                    </div>

                    {/* Skills */}
                    {job.skills && job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {job.skills.slice(0, 5).map((skill) => (
                          <span
                            key={skill.id}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                          >
                            {skill.skillName}
                          </span>
                        ))}
                        {job.skills.length > 5 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            +{job.skills.length - 5} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Test Schedule Information */}
                    {job.testDate && job.testStartTime && job.testEndTime && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="text-xs font-semibold text-blue-900 mb-1">📅 Aptitude Test Schedule</h4>
                        <p className="text-xs text-blue-800">
                          <span className="font-medium">Date:</span> {new Date(job.testDate).toLocaleDateString('en-GB', { 
                            day: '2-digit', 
                            month: '2-digit', 
                            year: 'numeric' 
                          })} | <span className="font-medium">Time:</span> {job.testStartTime} - {job.testEndTime}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Test Button and Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <FaClock className="w-4 h-4" />
                    <span>{getNextStep(application.status)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isLoadingTest ? (
                      <div className="px-4 py-2 text-gray-500 text-sm">Checking test...</div>
                    ) : testInfo && testInfo.hasTest && !testInfo.hasSubmitted && (
                      <>
                        {testInfo.canTakeTest ? (
                          <button
                            onClick={(e) => handleTakeTest(e, job.id)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            Take Test
                          </button>
                        ) : (
                          <div className="px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-xs text-yellow-800">
                              {testInfo.testStatus === 'scheduled' && <>⏰ {testInfo.testMessage}</>}
                              {testInfo.testStatus === 'expired' && <>❌ {testInfo.testMessage}</>}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                    {testInfo && testInfo.hasSubmitted && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/jobs/${job.id}/test-result`);
                        }}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                      >
                        View Result
                      </button>
                    )}
                    <button
                      onClick={(e) => handleViewJob(e, job.id)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleApplicationClick(application.id)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <FaChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Applications;

