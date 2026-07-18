import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaCheckCircle, 
  FaCircle, 
  FaClipboardList,
  FaMapMarkerAlt,
  FaUser,
  FaDollarSign,
  FaBuilding,
  FaArrowLeft,
  FaFile,
  FaDownload
} from 'react-icons/fa';
import { getApplicationStatus } from '../../services/applicationService';
import Loading from '../../components/Loading';
import { getFileUrl } from '../../utils/api';

const ApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [applicationData, setApplicationData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadApplicationStatus = async () => {
      try {
        const response = await getApplicationStatus(id);
        if (response.data && response.data.success) {
          setApplicationData(response.data.data);
        } else {
          console.error('Unexpected response format:', response);
        }
      } catch (error) {
        console.error('Error loading application status:', error);
        if (error.response) {
          console.error('Error response:', error.response.data);
        }
      } finally {
        setLoading(false);
      }
    };
    loadApplicationStatus();
  }, [id]);

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

  const formatDate = (dateString) => {
    if (!dateString) return null;
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

  const formatDateShort = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (loading) {
    return <Loading />;
  }

  if (!applicationData) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <p className="text-gray-600 mb-4">Application not found</p>
          <button
            onClick={() => navigate('/applications')}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Back to Applications
          </button>
        </div>
      </div>
    );
  }

  const { application, statusTimeline, currentStatus } = applicationData;

  return (
    <div className="p-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/applications')}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors mb-4"
      >
        <FaArrowLeft className="w-4 h-4" />
        <span>Back to Applications</span>
      </button>

      {/* Job Card - Similar to Browse Jobs */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4 flex-1">
            {application.job?.companyLogoUrl ? (
              <img
                src={application.job.companyLogoUrl}
                alt={application.job.companyName}
                className="w-16 h-16 rounded-lg object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                <FaBuilding className="w-8 h-8 text-gray-400" />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800 mb-1">{application.job?.title || 'Job Title'}</h1>
              <p className="text-lg text-gray-600 mb-3">{application.job?.companyName || 'Company Name'}</p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center">
                  <FaMapMarkerAlt className="w-4 h-4 mr-2 text-gray-400" />
                  {application.job?.location || 'N/A'}
                </div>
                <div className="flex items-center">
                  <FaCalendarAlt className="w-4 h-4 mr-2 text-gray-400" />
                  Posted on {formatDateShort(application.job?.createdAt)}
                </div>
                <div className="flex items-center">
                  <FaUser className="w-4 h-4 mr-2 text-gray-400" />
                  {application.job?.experienceLevel || 'N/A'}
                </div>
                <div className="flex items-center">
                  <FaDollarSign className="w-4 h-4 mr-2 text-gray-400" />
                  {formatSalary(application.job?.salaryMin, application.job?.salaryMax, application.job?.salaryCurrency)}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {application.job?.jobType && (
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    application.job.jobType === 'Full-time' ? 'bg-blue-100 text-blue-700' :
                    application.job.jobType === 'Part-time' ? 'bg-green-100 text-green-700' :
                    application.job.jobType === 'Contract' ? 'bg-purple-100 text-purple-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {application.job.jobType}
                  </span>
                )}
                {application.job?.workMode && (
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    application.job.workMode === 'Remote' ? 'bg-green-100 text-green-700' :
                    application.job.workMode === 'Hybrid' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {application.job.workMode}
                  </span>
                )}
              </div>
              {application.job?.skills && application.job.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {application.job.skills.slice(0, 5).map((skill) => (
                    <span
                      key={skill.id}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                    >
                      {skill.skillName}
                    </span>
                  ))}
                  {application.job.skills.length > 5 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      +{application.job.skills.length - 5}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="ml-4">
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(currentStatus)}`}
            >
              {currentStatus}
            </span>
          </div>
        </div>

        {/* Job Description */}
        {application.job?.description && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Job Description</h3>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{application.job.description}</p>
          </div>
        )}

        {/* Applied Date */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Applied on:</span> {formatDate(application.appliedAt)}
          </p>
        </div>
      </div>

      {/* Horizontal Status Timeline */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">Application Progress</h2>
        <div className="relative px-4">
          {/* Progress Line Container */}
          <div className="relative mb-8">
            {/* Background Line */}
            <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200"></div>
            
            {/* Completed Progress Line */}
            {(() => {
              const completedIndexes = statusTimeline
                .map((s, idx) => s.completed ? idx : -1)
                .filter(idx => idx !== -1);
              
              if (completedIndexes.length <= 1) return null;
              
              const firstCompleted = completedIndexes[0];
              const lastCompleted = completedIndexes[completedIndexes.length - 1];
              const totalSteps = statusTimeline.length;
              
              // Calculate width percentage
              const startPercent = (firstCompleted / (totalSteps - 1)) * 100;
              const endPercent = (lastCompleted / (totalSteps - 1)) * 100;
              
              return (
                <div
                  className="absolute top-6 h-0.5 bg-primary transition-all duration-500"
                  style={{
                    left: `${startPercent}%`,
                    width: `${endPercent - startPercent}%`
                  }}
                />
              );
            })()}

            {/* Status Items */}
            <div className="relative flex justify-between">
              {statusTimeline.map((status, index) => (
                <div key={index} className="flex flex-col items-center relative" style={{ flex: '1 1 0', minWidth: '0' }}>
                  <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                    status.completed
                      ? 'bg-primary border-primary text-white shadow-md'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}>
                    {status.completed ? (
                      <FaCheckCircle className="w-6 h-6" />
                    ) : (
                      <FaCircle className="w-5 h-5" />
                    )}
                  </div>
                  <div className="mt-3 text-center px-1" style={{ maxWidth: '100px' }}>
                    <p className={`text-xs font-medium leading-tight ${
                      status.completed ? 'text-gray-800' : 'text-gray-400'
                    }`}>
                      {status.label}
                    </p>
                    {status.date && (
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(status.date)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>


      {/* Application Documents */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Application Documents</h2>
        
        {/* Resume */}
        {application.resumeUrl && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FaFile className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Resume</p>
                  <p className="text-xs text-gray-500">Uploaded with application</p>
                </div>
              </div>
              <a
                href={getFileUrl(application.resumeUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center space-x-2"
              >
                <FaDownload className="w-4 h-4" />
                <span>Download</span>
              </a>
            </div>
          </div>
        )}

        {/* Cover Letter File */}
        {application.coverLetterUrl && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FaFile className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Cover Letter</p>
                  <p className="text-xs text-gray-500">Uploaded as file</p>
                </div>
              </div>
              <a
                href={getFileUrl(application.coverLetterUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center space-x-2"
              >
                <FaDownload className="w-4 h-4" />
                <span>Download</span>
              </a>
            </div>
          </div>
        )}

        {/* Cover Letter Text */}
        {application.coverLetter && !application.coverLetterUrl && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-800 mb-2">Cover Letter</h3>
            <p className="text-gray-700 whitespace-pre-wrap text-sm">{application.coverLetter}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationDetail;

