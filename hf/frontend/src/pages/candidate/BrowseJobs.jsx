import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaSearch, 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaUser, 
  FaDollarSign,
  FaBookmark,
  FaBuilding,
  FaStar
} from 'react-icons/fa';
import { getJobs, toggleSaveJob } from '../../services/jobService';

const BrowseJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [otherJobs, setOtherJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    location: 'All locations',
    experienceLevel: 'All experience levels',
    jobType: 'All job types',
    workMode: 'All work modes'
  });
  const [totalJobs, setTotalJobs] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [savingJobId, setSavingJobId] = useState(null);
  const [recommendedCount, setRecommendedCount] = useState(0);

  useEffect(() => {
    loadJobs();
  }, [currentPage, filters]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 12,
        ...(searchQuery && { search: searchQuery }),
        ...(filters.location !== 'All locations' && { location: filters.location }),
        ...(filters.experienceLevel !== 'All experience levels' && { experienceLevel: filters.experienceLevel }),
        ...(filters.jobType !== 'All job types' && { jobType: filters.jobType }),
        ...(filters.workMode !== 'All work modes' && { workMode: filters.workMode })
      };

      const response = await getJobs(params);
      if (response.success) {
        const allJobs = response.data.jobs || [];
        // Separate recommended and other jobs
        const recommended = allJobs.filter(job => job.isRecommended && job.matchScore > 0);
        const other = allJobs.filter(job => !job.isRecommended || job.matchScore === 0);
        
        setRecommendedJobs(recommended);
        setOtherJobs(other);
        setJobs(allJobs); // Keep all jobs for backward compatibility
        setTotalJobs(response.data.total);
        setRecommendedCount(response.data.recommendedCount || 0);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadJobs();
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilters({
      location: 'All locations',
      experienceLevel: 'All experience levels',
      jobType: 'All job types',
      workMode: 'All work modes'
    });
    setCurrentPage(1);
  };

  const handleSaveJob = async (jobId, e) => {
    e.stopPropagation();
    try {
      setSavingJobId(jobId);
      const response = await toggleSaveJob(jobId);
      if (response.success) {
        // Update the job in all lists
        setJobs(prevJobs =>
          prevJobs.map(job =>
            job.id === jobId ? { ...job, isSaved: response.data.isSaved } : job
          )
        );
        setRecommendedJobs(prevJobs =>
          prevJobs.map(job =>
            job.id === jobId ? { ...job, isSaved: response.data.isSaved } : job
          )
        );
        setOtherJobs(prevJobs =>
          prevJobs.map(job =>
            job.id === jobId ? { ...job, isSaved: response.data.isSaved } : job
          )
        );
      }
    } catch (error) {
      console.error('Error saving job:', error);
    } finally {
      setSavingJobId(null);
    }
  };

  const handleViewDetails = (jobId) => {
    navigate(`/jobs/${jobId}`);
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

  // Job Card Component
  const JobCard = ({ job, showMatchScore = false }) => {
    return (
      <div
        className="bg-white rounded-xl shadow p-5 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-transparent"
        style={showMatchScore && job.matchScore > 0 ? { borderLeftColor: '#10b981' } : {}}
        onClick={() => handleViewDetails(job.id)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            {job.companyLogoUrl ? (
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
              <h3 className="text-lg font-bold text-gray-800">{job.title}</h3>
              <p className="text-sm text-gray-600">{job.companyName}</p>
            </div>
          </div>
          <button
            onClick={(e) => handleSaveJob(job.id, e)}
            disabled={savingJobId === job.id}
            className={`p-2 rounded-lg transition-colors ${
              job.isSaved
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FaBookmark className="w-4 h-4" />
          </button>
        </div>

        {showMatchScore && job.matchScore > 0 && (
          <div className="mb-3 flex items-center space-x-2">
            <FaStar className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-semibold text-green-600">
              {Math.round(job.matchScore)}% Match
            </span>
            <span className="text-xs text-gray-500">
              ({job.matchedSkillsCount || 0} skills match)
            </span>
          </div>
        )}

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <FaMapMarkerAlt className="w-4 h-4 mr-2 text-gray-400" />
            {job.location}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <FaCalendarAlt className="w-4 h-4 mr-2 text-gray-400" />
            Posted on {formatDate(job.createdAt)}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <FaUser className="w-4 h-4 mr-2 text-gray-400" />
            {job.experienceLevel}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <FaDollarSign className="w-4 h-4 mr-2 text-gray-400" />
            {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            job.jobType === 'Full-time' ? 'bg-blue-100 text-blue-700' :
            job.jobType === 'Part-time' ? 'bg-green-100 text-green-700' :
            job.jobType === 'Contract' ? 'bg-purple-100 text-purple-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {job.jobType}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            job.workMode === 'Remote' ? 'bg-green-100 text-green-700' :
            job.workMode === 'Hybrid' ? 'bg-blue-100 text-blue-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {job.workMode}
          </span>
        </div>

        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {job.skills.slice(0, 3).map((skill) => (
              <span
                key={skill.id}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
              >
                {skill.skillName}
              </span>
            ))}
            {job.skills.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                +{job.skills.length - 3}
              </span>
            )}
          </div>
        )}

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {job.description}
        </p>

        {!job.isApplied && (
          <div className="flex gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetails(job.id);
              }}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Apply Now
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Browse Jobs</h1>
        <p className="text-gray-600 text-sm mt-0.5">
          {totalJobs > 0 ? `${totalJobs}+ Jobs Found` : 'Discover and apply for open positions'}
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-xl shadow p-4 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap gap-3">
          <select
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option>All locations</option>
            <option>San Francisco, CA</option>
            <option>New York, NY</option>
            <option>Seattle, WA</option>
            <option>Austin, TX</option>
            <option>Remote</option>
          </select>

          <select
            value={filters.experienceLevel}
            onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option>All experience levels</option>
            <option>0-1 years</option>
            <option>1-3 years</option>
            <option>3-5 years</option>
            <option>5+ years</option>
          </select>

          <select
            value={filters.jobType}
            onChange={(e) => handleFilterChange('jobType', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option>All job types</option>
            <option>Full-time</option>
            <option>Part-time</option>
            <option>Contract</option>
            <option>Internship</option>
            <option>Freelance</option>
          </select>

          <select
            value={filters.workMode}
            onChange={(e) => handleFilterChange('workMode', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option>All work modes</option>
            <option>Remote</option>
            <option>Hybrid</option>
            <option>On-site</option>
          </select>

          <button
            onClick={handleClearFilters}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Recommended Jobs Section */}
      {!loading && recommendedJobs.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <FaStar className="w-5 h-5 text-yellow-500" />
            <h2 className="text-xl font-bold text-gray-800">
              Recommended for You ({recommendedCount})
            </h2>
            <span className="text-sm text-gray-500">Based on your skills</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendedJobs.map((job) => (
              <JobCard key={job.id} job={job} showMatchScore={true} />
            ))}
          </div>
        </div>
      )}

      {/* Other Jobs Section */}
      {!loading && recommendedJobs.length > 0 && otherJobs.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-800 mb-4">All Jobs</h2>
        </div>
      )}

      {/* Job Listings */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <p className="text-gray-600 text-lg">No jobs found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(recommendedJobs.length > 0 ? otherJobs : jobs).map((job) => (
            <JobCard key={job.id} job={job} showMatchScore={job.isRecommended && job.matchScore > 0} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && jobs.length > 0 && (
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-700">
            Page {currentPage}
          </span>
          <button
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={jobs.length < 12}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default BrowseJobs;
