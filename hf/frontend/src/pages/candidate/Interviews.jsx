import React, { useEffect, useState } from 'react';
import {
  FaSearch,
  FaCalendarAlt,
  FaClock,
  FaBriefcase,
  FaBuilding,
  FaChevronRight,
  FaVideo,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaTimes,
  FaUser
} from 'react-icons/fa';
import { getCandidateInterviews, getCandidateInterview, requestReschedule } from '../../services/candidateInterviewService';
import Loading from '../../components/Loading';

const Interviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [submittingReschedule, setSubmittingReschedule] = useState(false);

  useEffect(() => {
    loadInterviews();
  }, [currentPage, statusFilter]);

  const loadInterviews = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        ...(statusFilter !== 'All' && { status: statusFilter }),
        ...(searchQuery && { search: searchQuery })
      };
      const response = await getCandidateInterviews(params);
      if (response.data && response.data.success) {
        setInterviews(response.data.data.interviews || []);
        setTotalPages(response.data.data.totalPages || 1);
      }
    } catch (error) {
      console.error('Error loading interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInterviewClick = async (interviewId) => {
    try {
      setLoadingDetail(true);
      const response = await getCandidateInterview(interviewId);
      if (response.data && response.data.success) {
        setSelectedInterview(response.data.data);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error('Error loading interview details:', error);
      alert('Error loading interview details');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleRequestReschedule = () => {
    if (!selectedInterview) return;
    setRescheduleReason('');
    setShowRescheduleModal(true);
  };

  const handleSubmitReschedule = async (e) => {
    e.preventDefault();
    if (!selectedInterview || !rescheduleReason.trim()) {
      alert('Please provide a valid reason for rescheduling');
      return;
    }

    try {
      setSubmittingReschedule(true);
      const response = await requestReschedule(selectedInterview.id, rescheduleReason);
      if (response.data && response.data.success) {
        alert('Reschedule request submitted successfully. The recruiter will review your request.');
        setShowRescheduleModal(false);
        setRescheduleReason('');
        loadInterviews();
        // Reload interview details
        if (selectedInterview) {
          const detailResponse = await getCandidateInterview(selectedInterview.id);
          if (detailResponse.data && detailResponse.data.success) {
            setSelectedInterview(detailResponse.data.data);
          }
        }
      }
    } catch (error) {
      console.error('Error submitting reschedule request:', error);
      alert(error.response?.data?.message || 'Error submitting reschedule request');
    } finally {
      setSubmittingReschedule(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadInterviews();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getModeIcon = (mode) => {
    return mode === 'Online' ? <FaVideo className="w-4 h-4" /> : <FaMapMarkerAlt className="w-4 h-4" />;
  };

  if (loading && interviews.length === 0) {
    return <Loading />;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Interviews</h1>
        <p className="text-gray-600 text-sm">View and manage all your scheduled interviews</p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 bg-white rounded-xl shadow p-4">
        <form onSubmit={handleSearch} className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by job title or company name..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="All">All Status</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Canceled">Canceled</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Interviews List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : interviews.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <p className="text-gray-600 text-lg">No interviews found</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {interviews.map((interview) => (
              <div
                key={interview.id}
                onClick={() => handleInterviewClick(interview.id)}
                className="bg-white rounded-xl shadow p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-800">
                        {interview.job?.title || 'Unknown Job'}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          interview.status
                        )}`}
                      >
                        {interview.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3 flex items-center">
                      <FaBuilding className="w-4 h-4 mr-2 text-gray-400" />
                      {interview.job?.companyName || interview.recruiter?.companyName || 'Unknown Company'}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <FaCalendarAlt className="w-4 h-4 mr-2 text-gray-400" />
                        {formatDate(interview.interviewDate)}
                      </div>
                      <div className="flex items-center">
                        <FaClock className="w-4 h-4 mr-2 text-gray-400" />
                        {formatTime(interview.interviewTime)}
                      </div>
                      <div className="flex items-center">
                        {getModeIcon(interview.mode)}
                        <span className="ml-2">{interview.mode}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Arrow Icon */}
                <div className="flex justify-end mt-4">
                  <FaChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Interview Detail Modal */}
      {showDetailModal && selectedInterview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Interview Details</h2>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedInterview(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Job Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{selectedInterview.job?.title}</h3>
                <p className="text-gray-600 flex items-center mb-1">
                  <FaBuilding className="w-4 h-4 mr-2" />
                  {selectedInterview.job?.companyName || selectedInterview.recruiter?.companyName}
                </p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    selectedInterview.status
                  )}`}
                >
                  {selectedInterview.status}
                </span>
              </div>

              {/* Interview Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Date</p>
                  <p className="font-medium text-gray-800 flex items-center">
                    <FaCalendarAlt className="w-4 h-4 mr-2 text-gray-400" />
                    {formatDate(selectedInterview.interviewDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Time</p>
                  <p className="font-medium text-gray-800 flex items-center">
                    <FaClock className="w-4 h-4 mr-2 text-gray-400" />
                    {formatTime(selectedInterview.interviewTime)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Mode</p>
                  <p className="font-medium text-gray-800 flex items-center">
                    {getModeIcon(selectedInterview.mode)}
                    <span className="ml-2">{selectedInterview.mode}</span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Location</p>
                  <p className="font-medium text-gray-800">
                    {selectedInterview.job?.location || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Mode-specific Information */}
              {selectedInterview.mode === 'Online' && selectedInterview.meetingLink && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Meeting Link</p>
                  <a
                    href={selectedInterview.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center"
                  >
                    <FaVideo className="w-4 h-4 mr-2" />
                    {selectedInterview.meetingLink}
                  </a>
                </div>
              )}

              {selectedInterview.mode === 'Offline' && selectedInterview.location && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Interview Location</p>
                  <p className="font-medium text-gray-800 flex items-center">
                    <FaMapMarkerAlt className="w-4 h-4 mr-2 text-gray-400" />
                    {selectedInterview.location}
                  </p>
                </div>
              )}

              {/* Recruiter Information */}
              <div>
                <p className="text-sm text-gray-600 mb-2">Recruiter</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium text-gray-800 flex items-center mb-1">
                    <FaUser className="w-4 h-4 mr-2 text-gray-400" />
                    {selectedInterview.recruiter?.fullName || 'N/A'}
                  </p>
                  {selectedInterview.recruiter?.user?.email && (
                    <p className="text-sm text-gray-600">{selectedInterview.recruiter.user.email}</p>
                  )}
                  {selectedInterview.recruiter?.contactNumber && (
                    <p className="text-sm text-gray-600">{selectedInterview.recruiter.contactNumber}</p>
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedInterview.notes && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Notes</p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedInterview.notes}</p>
                  </div>
                </div>
              )}

              {/* Job Description */}
              {selectedInterview.job?.description && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Job Description</p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedInterview.job.description}</p>
                  </div>
                </div>
              )}

              {/* Reschedule Request Status */}
              {selectedInterview.rescheduleRequestReason && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-yellow-800 mb-2">Reschedule Request Pending</p>
                  <p className="text-sm text-yellow-700">Your reason: {selectedInterview.rescheduleRequestReason}</p>
                  <p className="text-xs text-yellow-600 mt-1">
                    Requested on {formatDate(selectedInterview.rescheduleRequestedAt)}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              {selectedInterview.status === 'Scheduled' && !selectedInterview.rescheduleRequestReason && (
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRequestReschedule();
                    }}
                    disabled={updatingStatus}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center space-x-2 disabled:opacity-50"
                  >
                    <FaCalendarAlt className="w-4 h-4" />
                    <span>Request to Reschedule</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Request Modal */}
      {showRescheduleModal && selectedInterview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Request to Reschedule Interview</h2>
                <button
                  onClick={() => {
                    setShowRescheduleModal(false);
                    setRescheduleReason('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmitReschedule} className="p-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Job</p>
                <p className="font-medium text-gray-800">{selectedInterview.job?.title || 'Unknown'}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedInterview.job?.companyName || selectedInterview.recruiter?.companyName}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Current Interview Schedule</p>
                <p className="font-medium text-gray-800">
                  {formatDate(selectedInterview.interviewDate)} at {formatTime(selectedInterview.interviewTime)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Rescheduling <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  rows={5}
                  required
                  placeholder="Please provide a valid reason for rescheduling the interview..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This message will be sent to the recruiter for review.
                </p>
              </div>
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowRescheduleModal(false);
                    setRescheduleReason('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReschedule || !rescheduleReason.trim()}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingReschedule ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Interviews;

