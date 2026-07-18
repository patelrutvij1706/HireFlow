import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaDownload,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaGraduationCap,
  FaBriefcase,
  FaCheckCircle,
  FaTimes,
  FaCalendarAlt,
  FaVideo
} from 'react-icons/fa';
import { getRecruiterApplication, updateApplicationStatus } from '../../services/recruiterApplicationService';
import { createInterview } from '../../services/recruiterInterviewService';
import Loading from '../../components/Loading';
import { getFileUrl } from '../../utils/api';

const ApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [applicationData, setApplicationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [submittingInterview, setSubmittingInterview] = useState(false);
  const [interviewFormData, setInterviewFormData] = useState({
    interviewDate: '',
    interviewTime: '',
    mode: 'Online',
    notes: '',
    location: '',
    meetingLink: ''
  });

  useEffect(() => {
    loadApplication();
  }, [id]);

  const loadApplication = async () => {
    try {
      setLoading(true);
      const response = await getRecruiterApplication(id);
      console.log('API Response:', response);
      if (response.data && response.data.success) {
        setApplicationData(response.data.data);
        // Debug: Log the application data to check resume URLs
        console.log('Application data loaded:', {
          applicationResumeUrl: response.data.data.application?.resumeUrl,
          candidateResumeUrl: response.data.data.candidate?.resumeUrl,
          fullData: response.data.data
        });
      } else {
        console.error('Application not found or error in response:', response.data);
      }
    } catch (error) {
      console.error('Error loading application:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      const response = await updateApplicationStatus(id, newStatus);
      if (response.data && response.data.success) {
        loadApplication();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert(error.response?.data?.message || 'Error updating application status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDownloadResume = async () => {
    // Prioritize application resume (job-specific) over candidate profile resume
    let resumeUrl = applicationData?.application?.resumeUrl || applicationData?.candidate?.resumeUrl;
    
    if (!resumeUrl) {
      console.error('No resume URL found:', {
        applicationResumeUrl: applicationData?.application?.resumeUrl,
        candidateResumeUrl: applicationData?.candidate?.resumeUrl,
        applicationData
      });
      alert('Resume not available for this application.');
      return;
    }
    
    // Normalize the resume URL - handle cases where it might be just a filename
    // or already have the full path
    if (!resumeUrl.startsWith('http') && !resumeUrl.startsWith('/')) {
      // If it's just a filename, add the full path
      resumeUrl = `/uploads/resumes/${resumeUrl}`;
    } else if (!resumeUrl.startsWith('http') && !resumeUrl.includes('/uploads/resumes/') && !resumeUrl.includes('/uploads/cover-letters/')) {
      // If it starts with / but doesn't have the uploads path, it might be malformed
      // Check if it looks like just a filename with a leading slash
      if (resumeUrl.match(/^\/[^/]+\.(pdf|doc|docx)$/i)) {
        resumeUrl = `/uploads/resumes${resumeUrl}`;
      }
    }
    
    // Construct the full URL using the utility function
    const fullUrl = getFileUrl(resumeUrl);
    
    console.log('Attempting to download resume:', {
      originalUrl: applicationData?.application?.resumeUrl || applicationData?.candidate?.resumeUrl,
      normalizedUrl: resumeUrl,
      fullUrl: fullUrl,
      apiUrl: import.meta.env.VITE_API_URL
    });
    
    // Try to open in new tab, if that fails, try to download directly
    try {
      // First, verify the file exists by making a HEAD request
      const response = await fetch(fullUrl, { method: 'HEAD' });
      if (!response.ok) {
        console.error('Resume file not found:', response.status, response.statusText);
        alert(`Resume file not found. Please contact support. (Error: ${response.status})`);
        return;
      }
      
      const link = document.createElement('a');
      link.href = fullUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.download = resumeUrl.split('/').pop() || 'resume.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading resume:', error);
      // Fallback to window.open
      window.open(fullUrl, '_blank');
    }
  };

  const handleDownloadCoverLetter = async () => {
    if (applicationData?.application?.coverLetterUrl) {
      let coverLetterUrl = applicationData.application.coverLetterUrl;
      
      // Normalize the cover letter URL similar to resume
      if (!coverLetterUrl.startsWith('http') && !coverLetterUrl.startsWith('/')) {
        coverLetterUrl = `/uploads/cover-letters/${coverLetterUrl}`;
      } else if (!coverLetterUrl.startsWith('http') && !coverLetterUrl.includes('/uploads/cover-letters/')) {
        if (coverLetterUrl.match(/^\/[^/]+\.(pdf|doc|docx)$/i)) {
          coverLetterUrl = `/uploads/cover-letters${coverLetterUrl}`;
        }
      }
      
      // Construct the full URL using the utility function
      const fullUrl = getFileUrl(coverLetterUrl);
      
      console.log('Downloading cover letter:', fullUrl);
      
      try {
        const response = await fetch(fullUrl, { method: 'HEAD' });
        if (!response.ok) {
          console.error('Cover letter file not found:', response.status);
          alert(`Cover letter file not found. (Error: ${response.status})`);
          return;
        }
        window.open(fullUrl, '_blank');
      } catch (error) {
        console.error('Error downloading cover letter:', error);
        window.open(fullUrl, '_blank');
      }
    }
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    if (!applicationData) return;

    try {
      setSubmittingInterview(true);
      const interviewData = {
        jobId: applicationData.application.jobId,
        candidateId: applicationData.application.candidateId,
        ...interviewFormData
      };
      await createInterview(interviewData);
      
      // Update application status to Interview
      await handleStatusUpdate('Interview');
      
      setShowInterviewModal(false);
      setInterviewFormData({
        interviewDate: '',
        interviewTime: '',
        mode: 'Online',
        notes: '',
        location: '',
        meetingLink: ''
      });
    } catch (error) {
      console.error('Error scheduling interview:', error);
      alert(error.response?.data?.message || 'Error scheduling interview');
    } finally {
      setSubmittingInterview(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Applied':
        return 'bg-yellow-100 text-yellow-800';
      case 'Under Review':
        return 'bg-blue-100 text-blue-800';
      case 'Interview':
        return 'bg-green-100 text-green-800';
      case 'Offer':
        return 'bg-emerald-100 text-emerald-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'Applied':
        return 'Pending';
      case 'Under Review':
        return 'Under Review';
      case 'Interview':
        return 'Interview Scheduled';
      case 'Offer':
        return 'Accepted';
      case 'Rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
            onClick={() => navigate('/recruiter/applications')}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Back to Applications
          </button>
        </div>
      </div>
    );
  }

  const { application, candidate } = applicationData;

  return (
    <div className="p-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/recruiter/applications')}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors mb-4"
      >
        <FaArrowLeft className="w-4 h-4" />
        <span>Back to Applications</span>
      </button>

      {/* Application Header */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-800">
                {candidate?.fullName || 'Unknown Candidate'}
              </h1>
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
                  application.status
                )}`}
              >
                {getStatusLabel(application.status)}
              </span>
            </div>
            <p className="text-lg text-gray-600 mb-4">
              Applied for: <span className="font-medium">{application.job?.title}</span>
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center">
                <FaCalendarAlt className="w-4 h-4 mr-2 text-gray-400" />
                Applied on {formatDate(application.appliedAt)}
              </div>
              <div className="flex items-center">
                <FaMapMarkerAlt className="w-4 h-4 mr-2 text-gray-400" />
                {application.job?.location || 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleDownloadResume}
            disabled={!application?.resumeUrl && !candidate?.resumeUrl}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title={!application?.resumeUrl && !candidate?.resumeUrl ? 'No resume available' : 'Download resume'}
          >
            <FaDownload className="w-4 h-4" />
            <span>Download Resume</span>
          </button>
          {application?.coverLetterUrl && (
            <button
              onClick={handleDownloadCoverLetter}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
            >
              <FaDownload className="w-4 h-4" />
              <span>Download Cover Letter</span>
            </button>
          )}
          {application.status === 'Applied' && (
            <button
              onClick={() => handleStatusUpdate('Under Review')}
              disabled={updatingStatus}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <FaCheckCircle className="w-4 h-4" />
              <span>Shortlist</span>
            </button>
          )}
          {application.status !== 'Rejected' && (
            <button
              onClick={() => handleStatusUpdate('Rejected')}
              disabled={updatingStatus}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <FaTimes className="w-4 h-4" />
              <span>Reject</span>
            </button>
          )}
          {application.status === 'Under Review' && (
            <button
              onClick={() => setShowInterviewModal(true)}
              disabled={updatingStatus}
              className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <FaCalendarAlt className="w-4 h-4" />
              <span>Schedule Interview</span>
            </button>
          )}
          {application.status === 'Interview' && (
            <button
              onClick={() => handleStatusUpdate('Offer')}
              disabled={updatingStatus}
              className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <FaCheckCircle className="w-4 h-4" />
              <span>Accept</span>
            </button>
          )}
        </div>
      </div>

      {/* Candidate Information */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Candidate Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <FaUser className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Full Name</p>
              <p className="font-medium text-gray-800">{candidate?.fullName || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <FaEnvelope className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium text-gray-800">{candidate?.user?.email || 'N/A'}</p>
            </div>
          </div>
          {candidate?.contactNumber && (
            <div className="flex items-center space-x-3">
              <FaPhone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Contact Number</p>
                <p className="font-medium text-gray-800">{candidate.contactNumber}</p>
              </div>
            </div>
          )}
          {candidate?.location && (
            <div className="flex items-center space-x-3">
              <FaMapMarkerAlt className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-medium text-gray-800">{candidate.location}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cover Letter */}
      {(application.coverLetter || application.coverLetterUrl) && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Cover Letter</h2>
          {application.coverLetterUrl ? (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-3">Cover letter uploaded as file.</p>
              <button
                onClick={handleDownloadCoverLetter}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center space-x-2"
              >
                <FaDownload className="w-4 h-4" />
                <span>Download Cover Letter</span>
              </button>
            </div>
          ) : (
            <p className="text-gray-700 whitespace-pre-wrap">{application.coverLetter}</p>
          )}
        </div>
      )}

      {/* Education */}
      {candidate?.educations && candidate.educations.length > 0 && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <FaGraduationCap className="w-5 h-5 mr-2" />
            Education
          </h2>
          <div className="space-y-4">
            {candidate.educations.map((education) => (
              <div key={education.id} className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-800">{education.degree}</h3>
                <p className="text-gray-600">{education.institution}</p>
                <p className="text-sm text-gray-500">Completed: {education.yearOfCompletion}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Experience */}
      {candidate?.experiences && candidate.experiences.length > 0 && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <FaBriefcase className="w-5 h-5 mr-2" />
            Experience
          </h2>
          <div className="space-y-4">
            {candidate.experiences.map((experience) => (
              <div key={experience.id} className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-gray-800">{experience.role}</h3>
                <p className="text-gray-600">{experience.companyName}</p>
                <p className="text-sm text-gray-500">
                  {formatDate(experience.fromDate)} - {experience.isCurrent ? 'Present' : formatDate(experience.toDate)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {candidate?.skills && candidate.skills.length > 0 && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {candidate.skills.map((skill) => (
              <span
                key={skill.id}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
              >
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Job Details */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Job Details</h2>
        <div className="space-y-3">
          <div>
            <span className="text-sm font-medium text-gray-700">Job Title:</span>
            <p className="text-gray-800">{application.job?.title || 'N/A'}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700">Company:</span>
            <p className="text-gray-800">{application.job?.companyName || 'N/A'}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700">Location:</span>
            <p className="text-gray-800">{application.job?.location || 'N/A'}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700">Job Type:</span>
            <p className="text-gray-800">{application.job?.jobType || 'N/A'}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700">Work Mode:</span>
            <p className="text-gray-800">{application.job?.workMode || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Schedule Interview Modal */}
      {showInterviewModal && applicationData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Schedule Interview</h2>
                <button
                  onClick={() => {
                    setShowInterviewModal(false);
                    setInterviewFormData({
                      interviewDate: '',
                      interviewTime: '',
                      mode: 'Online',
                      notes: '',
                      location: '',
                      meetingLink: ''
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
            </div>
            <form onSubmit={handleScheduleInterview} className="p-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Candidate</p>
                <p className="font-medium text-gray-800">{applicationData.candidate?.fullName || 'Unknown'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Job</p>
                <p className="font-medium text-gray-800">{applicationData.application.job?.title || 'Unknown'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={interviewFormData.interviewDate}
                    onChange={(e) => setInterviewFormData({ ...interviewFormData, interviewDate: e.target.value })}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={interviewFormData.interviewTime}
                    onChange={(e) => setInterviewFormData({ ...interviewFormData, interviewTime: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mode <span className="text-red-500">*</span>
                </label>
                <select
                  value={interviewFormData.mode}
                  onChange={(e) => {
                    const newMode = e.target.value;
                    if (newMode === 'Online') {
                      setInterviewFormData({ ...interviewFormData, mode: newMode, location: '', meetingLink: interviewFormData.meetingLink || '' });
                    } else {
                      setInterviewFormData({ ...interviewFormData, mode: newMode, meetingLink: '', location: interviewFormData.location || '' });
                    }
                  }}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                </select>
              </div>

              {interviewFormData.mode === 'Online' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting Link
                  </label>
                  <input
                    type="url"
                    value={interviewFormData.meetingLink}
                    onChange={(e) => setInterviewFormData({ ...interviewFormData, meetingLink: e.target.value })}
                    placeholder="https://meet.google.com/..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}

              {interviewFormData.mode === 'Offline' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={interviewFormData.location}
                    onChange={(e) => setInterviewFormData({ ...interviewFormData, location: e.target.value })}
                    placeholder="Enter interview location address"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={interviewFormData.notes}
                  onChange={(e) => setInterviewFormData({ ...interviewFormData, notes: e.target.value })}
                  rows={4}
                  placeholder="Additional notes for the interview..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowInterviewModal(false);
                    setInterviewFormData({
                      interviewDate: '',
                      interviewTime: '',
                      mode: 'Online',
                      notes: '',
                      location: '',
                      meetingLink: ''
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingInterview}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {submittingInterview ? 'Scheduling...' : 'Schedule Interview'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationDetail;

