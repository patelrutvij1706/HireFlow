import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaPlus,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUsers,
  FaSearch,
  FaTimes
} from 'react-icons/fa';
import {
  getRecruiterJobs
} from '../../services/recruiterJobService';
import Loading from '../../components/Loading';
import JobModal from '../../components/recruiter/JobModal';

const Jobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadJobs();
  }, [currentPage, statusFilter, searchQuery]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter !== 'All' && { status: statusFilter })
      };
      const response = await getRecruiterJobs(params);
      if (response.data && response.data.success) {
        setJobs(response.data.data.jobs || []);
        setTotalPages(response.data.data.totalPages || 1);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = () => {
    setEditingJob(null);
    setShowJobModal(true);
  };

  const handleJobSaved = () => {
    setShowJobModal(false);
    setEditingJob(null);
    loadJobs();
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
      return `${currency} ${formatNumber(min)} - ${formatNumber(max)}`;
    }
    return min ? `${currency} ${formatNumber(min)}+` : `Up to ${currency} ${formatNumber(max)}`;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadJobs();
  };

  const clearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
  };

  if (loading && jobs.length === 0) {
    return <Loading />;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Jobs</h1>
          <p className="text-gray-600 text-sm">Manage all your job postings</p>
        </div>
        <button
          onClick={handleCreateJob}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center space-x-2"
        >
          <FaPlus className="w-4 h-4" />
          <span>Post New Job</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <form onSubmit={handleSearch} className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search jobs by title or company..."
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            )}
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
            <option value="Active">Active</option>
            <option value="Closed">Closed</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Jobs List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <p className="text-gray-600 text-lg mb-4">No jobs found</p>
          <button
            onClick={handleCreateJob}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Post Your First Job
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                onClick={() => navigate(`/recruiter/jobs/${job.id}`)}
                className="bg-white rounded-xl shadow p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-800">{job.title}</h3>
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
                    <p className="text-gray-600 mb-3">{job.companyName}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <FaMapMarkerAlt className="w-4 h-4 mr-2 text-gray-400" />
                        {job.location}
                      </div>
                      <div className="flex items-center">
                        <FaCalendarAlt className="w-4 h-4 mr-2 text-gray-400" />
                        Posted on {formatDate(job.createdAt)}
                      </div>
                      <div className="flex items-center">
                        <FaUsers className="w-4 h-4 mr-2 text-gray-400" />
                        {job.applicationCount || 0} applications
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {job.jobType}
                      </span>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        {job.workMode}
                      </span>
                      {job.skills && job.skills.length > 0 && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                          {job.skills.length} skills
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      Salary: {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                    </p>
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Job Modal */}
      {showJobModal && (
        <JobModal
          job={editingJob}
          onClose={() => {
            setShowJobModal(false);
            setEditingJob(null);
          }}
          onSave={handleJobSaved}
        />
      )}
    </div>
  );
};

export default Jobs;

