import React, { useEffect, useState } from 'react';
import {
  FaPlus,
  FaSearch,
  FaCalendarAlt,
  FaUser,
  FaBriefcase,
  FaEdit,
  FaTimes,
  FaVideo,
  FaMapMarkerAlt,
  FaClock,
  FaExclamationTriangle
} from 'react-icons/fa';
import {
  getRecruiterInterviews,
  createInterview,
  updateInterview,
  deleteInterview,
  getJobCandidates
} from '../../services/recruiterInterviewService';
import { getRecruiterJobs } from '../../services/recruiterJobService';
import Loading from '../../components/Loading';

const Interviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingInterview, setEditingInterview] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [jobFilter, setJobFilter] = useState('All');
  const [rescheduleFilter, setRescheduleFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form state
  const [formData, setFormData] = useState({
    jobId: '',
    candidateId: '',
    interviewDate: '',
    interviewTime: '',
    mode: 'Online',
    notes: '',
    location: '',
    meetingLink: ''
  });
  const [candidates, setCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    loadInterviews();
  }, [currentPage, statusFilter, jobFilter, rescheduleFilter]);

  const loadJobs = async () => {
    try {
      const response = await getRecruiterJobs({ page: 1, limit: 100 });
      if (response.data && response.data.success) {
        setJobs(response.data.data.jobs || []);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  };

  const loadInterviews = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        ...(statusFilter !== 'All' && { status: statusFilter }),
        ...(jobFilter !== 'All' && { jobId: jobFilter }),
        ...(searchQuery && { search: searchQuery })
      };
      const response = await getRecruiterInterviews(params);
      if (response.data && response.data.success) {
        let filteredInterviews = response.data.data.interviews || [];
        
        // Filter by reschedule requests if selected
        if (rescheduleFilter === 'Pending') {
          filteredInterviews = filteredInterviews.filter(
            interview => interview.rescheduleRequestReason
          );
        }
        
        setInterviews(filteredInterviews);
        // Recalculate total pages based on filtered results
        const totalFiltered = filteredInterviews.length;
        setTotalPages(Math.ceil(totalFiltered / 10) || 1);
      }
    } catch (error) {
      console.error('Error loading interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCandidates = async (jobId) => {
    if (!jobId) {
      setCandidates([]);
      return;
    }
    try {
      setLoadingCandidates(true);
      const response = await getJobCandidates(jobId);
      if (response.data && response.data.success) {
        setCandidates(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading candidates:', error);
      setCandidates([]);
    } finally {
      setLoadingCandidates(false);
    }
  };

  const handleScheduleInterview = () => {
    setEditingInterview(null);
    setFormData({
      jobId: '',
      candidateId: '',
      interviewDate: '',
      interviewTime: '',
      mode: 'Online',
      notes: '',
      location: '',
      meetingLink: ''
    });
    setCandidates([]);
    setShowScheduleModal(true);
  };

  const handleEditInterview = (interview) => {
    setEditingInterview(interview);
    setFormData({
      jobId: interview.jobId,
      candidateId: interview.candidateId,
      interviewDate: interview.interviewDate,
      interviewTime: interview.interviewTime,
      mode: interview.mode,
      notes: interview.notes || '',
      location: interview.location || '',
      meetingLink: interview.meetingLink || ''
    });
    loadCandidates(interview.jobId);
    setShowScheduleModal(true);
  };

  const handleJobChange = (e) => {
    const jobId = e.target.value;
    setFormData({ ...formData, jobId, candidateId: '' });
    loadCandidates(jobId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingInterview) {
        await updateInterview(editingInterview.id, formData);
      } else {
        await createInterview(formData);
      }
      setShowScheduleModal(false);
      setEditingInterview(null);
      loadInterviews();
    } catch (error) {
      console.error('Error saving interview:', error);
      alert(error.response?.data?.message || 'Error saving interview');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelInterview = async (interviewId) => {
    if (!window.confirm('Are you sure you want to cancel this interview?')) {
      return;
    }
    try {
      await deleteInterview(interviewId);
      loadInterviews();
    } catch (error) {
      console.error('Error canceling interview:', error);
      alert(error.response?.data?.message || 'Error canceling interview');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadInterviews();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    // Assuming time is in HH:MM format
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Interviews</h1>
          <p className="text-gray-600 text-sm">Schedule and manage all your interviews</p>
        </div>
        <button
          onClick={handleScheduleInterview}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center space-x-2"
        >
          <FaPlus className="w-4 h-4" />
          <span>Schedule Interview</span>
        </button>
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
              placeholder="Search by candidate name, job title, or email..."
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
          <select
            value={rescheduleFilter}
            onChange={(e) => {
              setRescheduleFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="All">All Interviews</option>
            <option value="Pending">Reschedule Requests</option>
          </select>
          <select
            value={jobFilter}
            onChange={(e) => {
              setJobFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="All">All Jobs</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
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
                className="bg-white rounded-xl shadow p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-800">
                        {interview.candidate?.fullName || 'Unknown Candidate'}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          interview.status
                        )}`}
                      >
                        {interview.status}
                      </span>
                      {interview.rescheduleRequestReason && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex items-center space-x-1">
                          <FaExclamationTriangle className="w-3 h-3" />
                          <span>Reschedule Requested</span>
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3">
                      <FaBriefcase className="inline w-4 h-4 mr-2 text-gray-400" />
                      {interview.job?.title}
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
                      {interview.mode === 'Online' && interview.meetingLink && (
                        <div className="flex items-center">
                          <a
                            href={interview.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Join Meeting
                          </a>
                        </div>
                      )}
                      {interview.mode === 'Offline' && interview.location && (
                        <div className="flex items-center">
                          <FaMapMarkerAlt className="w-4 h-4 mr-2 text-gray-400" />
                          {interview.location}
                        </div>
                      )}
                    </div>
                    {/* Reschedule Request Alert */}
                    {interview.rescheduleRequestReason && (
                      <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-start space-x-2">
                          <FaExclamationTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-yellow-800 mb-1">
                              Reschedule Request from Candidate
                            </p>
                            <p className="text-sm text-yellow-700 mb-1">
                              <span className="font-medium">Reason:</span> {interview.rescheduleRequestReason}
                            </p>
                            <p className="text-xs text-yellow-600">
                              Requested on {formatDate(interview.rescheduleRequestedAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    {interview.notes && (
                      <div className="mt-3 text-sm text-gray-600">
                        <p className="font-medium">Notes:</p>
                        <p className="text-gray-500">{interview.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                  {interview.status === 'Scheduled' && (
                    <>
                      <button
                        onClick={() => handleEditInterview(interview)}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium flex items-center space-x-2"
                      >
                        <FaEdit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleCancelInterview(interview.id)}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium flex items-center space-x-2"
                      >
                        <FaTimes className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    </>
                  )}
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

      {/* Schedule Interview Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingInterview ? 'Edit Interview' : 'Schedule Interview'}
                </h2>
                <button
                  onClick={() => {
                    setShowScheduleModal(false);
                    setEditingInterview(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.jobId}
                  onChange={handleJobChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select a job</option>
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Candidate <span className="text-red-500">*</span>
                </label>
                {loadingCandidates ? (
                  <div className="text-gray-500 text-sm">Loading candidates...</div>
                ) : (
                  <select
                    value={formData.candidateId}
                    onChange={(e) => setFormData({ ...formData, candidateId: e.target.value })}
                    required
                    disabled={!formData.jobId || candidates.length === 0}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
                  >
                    <option value="">
                      {!formData.jobId
                        ? 'Select a job first'
                        : candidates.length === 0
                        ? 'No candidates found'
                        : 'Select a candidate'}
                    </option>
                    {candidates.map((candidate) => (
                      <option key={candidate.id} value={candidate.id}>
                        {candidate.fullName} ({candidate.email})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.interviewDate}
                    onChange={(e) => setFormData({ ...formData, interviewDate: e.target.value })}
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
                    value={formData.interviewTime}
                    onChange={(e) => setFormData({ ...formData, interviewTime: e.target.value })}
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
                  value={formData.mode}
                  onChange={(e) => {
                    const newMode = e.target.value;
                    // Clear opposite field when switching modes
                    if (newMode === 'Online') {
                      setFormData({ ...formData, mode: newMode, location: '', meetingLink: formData.meetingLink || '' });
                    } else {
                      setFormData({ ...formData, mode: newMode, meetingLink: '', location: formData.location || '' });
                    }
                  }}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                </select>
              </div>

              {formData.mode === 'Online' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting Link
                  </label>
                  <input
                    type="url"
                    value={formData.meetingLink}
                    onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                    placeholder="https://meet.google.com/..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}

              {formData.mode === 'Offline' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Enter interview location address"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  placeholder="Additional notes for the interview..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowScheduleModal(false);
                    setEditingInterview(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingInterview ? 'Update Interview' : 'Schedule Interview'}
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

