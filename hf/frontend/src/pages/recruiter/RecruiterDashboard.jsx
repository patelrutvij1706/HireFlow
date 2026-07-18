import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaBriefcase, 
  FaUsers, 
  FaVideo, 
  FaClipboardCheck,
  FaChartLine,
  FaCheckCircle,
  FaExclamationTriangle,
  FaArrowRight,
  FaCalendarAlt
} from 'react-icons/fa';
import { getDashboardStats } from '../../services/recruiterDashboardService';
import Loading from '../../components/Loading';

const RecruiterDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await getDashboardStats();
      if (response.data && response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not scheduled';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        // Try parsing as separate date and time
        return dateString;
      }
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric', 
        minute: '2-digit' 
      });
    } catch (e) {
      return dateString;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Applied':
        return '#3b82f6'; // blue-500
      case 'Under Review':
        return '#4b5563'; // gray-600
      case 'Interview':
        return '#f97316'; // orange-500
      case 'Offer':
        return '#9333ea'; // purple-500
      case 'Rejected':
        return '#ef4444'; // red-500
      default:
        return '#6b7280'; // gray-500
    }
  };

  const getStatusColorClass = (status) => {
    switch (status) {
      case 'Applied':
        return 'bg-blue-500';
      case 'Under Review':
        return 'bg-gray-600';
      case 'Interview':
        return 'bg-orange-500';
      case 'Offer':
        return 'bg-purple-500';
      case 'Rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!stats) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <p className="text-gray-600">Unable to load dashboard data</p>
        </div>
      </div>
    );
  }

  const { metrics, applicationStatusCounts, recentApplications, upcomingInterviews, weeklyTrends, topJobs } = stats;

  // Calculate total for donut chart
  const totalApplicationsForChart = Object.values(applicationStatusCounts).reduce((sum, count) => sum + count, 0);
  const circumference = 2 * Math.PI * 40; // radius = 40

  // Calculate donut chart segments
  let currentOffset = 0;
  const chartSegments = Object.entries(applicationStatusCounts)
    .filter(([_, count]) => count > 0)
    .map(([status, count]) => {
      const percentage = count / totalApplicationsForChart;
      const dashArray = `${percentage * circumference} ${circumference}`;
      const dashOffset = -currentOffset;
      currentOffset += percentage * circumference;
      return { status, count, percentage, dashArray, dashOffset, color: getStatusColor(status) };
    });

  // Get max applications for bar chart scaling
  const maxApplications = Math.max(...weeklyTrends.map(day => day.applications), 1);

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <p className="text-gray-600 text-sm mt-0.5">Welcome back! Here's your recruitment activity summary</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Jobs */}
        <div className="bg-white rounded-xl shadow p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-blue-100 rounded-lg">
              <FaBriefcase className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs text-gray-500">Total</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-1">{metrics.totalJobs}</h3>
          <p className="text-gray-600 text-sm mb-1">Total Jobs Posted</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-green-600 text-xs font-medium">{metrics.activeJobs} active</span>
            <span className="text-blue-600 text-xs font-medium">+{metrics.jobsThisWeek} this week</span>
          </div>
        </div>

        {/* Total Applications */}
        <div className="bg-white rounded-xl shadow p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-green-100 rounded-lg">
              <FaUsers className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-xs text-gray-500">Total</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-1">{metrics.totalApplications}</h3>
          <p className="text-gray-600 text-sm mb-1">Total Applications</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-green-600 text-xs font-medium">+{metrics.applicationsThisWeek} this week</span>
            <span className="text-blue-600 text-xs font-medium">{metrics.applicationsThisMonth} this month</span>
          </div>
        </div>

        {/* Interviews */}
        <div className="bg-white rounded-xl shadow p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-orange-100 rounded-lg">
              <FaVideo className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-xs text-gray-500">Total</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-1">{metrics.totalInterviews}</h3>
          <p className="text-gray-600 text-sm mb-1">Interviews Scheduled</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-orange-600 text-xs font-medium">{metrics.upcomingInterviews} upcoming</span>
            <span className="text-gray-500 text-xs">{metrics.totalInterviews - metrics.upcomingInterviews} completed</span>
          </div>
        </div>

        {/* Test Statistics */}
        <div className="bg-white rounded-xl shadow p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-purple-100 rounded-lg">
              <FaClipboardCheck className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-xs text-gray-500">Pass Rate</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-1">{metrics.testPassRate}%</h3>
          <p className="text-gray-600 text-sm mb-1">Test Pass Rate</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-green-600 text-xs font-medium">{metrics.testsPassed} passed</span>
            <span className="text-gray-500 text-xs">Avg: {metrics.averageTestScore}%</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Application Status Distribution */}
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Application Status</h3>
          <p className="text-sm text-gray-600 mb-3">Distribution by stage</p>
          
          {totalApplicationsForChart > 0 ? (
            <>
              {/* Donut Chart */}
              <div className="flex items-center justify-center h-52 mb-3">
                <div className="relative w-48 h-48">
                  <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="10"
                    />
                    {/* Status segments */}
                    {chartSegments.map((segment, index) => (
                      <circle
                        key={index}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke={segment.color}
                        strokeWidth="10"
                        strokeDasharray={segment.dashArray}
                        strokeDashoffset={segment.dashOffset}
                        strokeLinecap="round"
                      />
                    ))}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-800">{totalApplicationsForChart}</div>
                      <div className="text-xs text-gray-500">Total</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-1.5">
                {Object.entries(applicationStatusCounts)
                  .filter(([_, count]) => count > 0)
                  .map(([status, count], index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-4 h-4 rounded ${getStatusColorClass(status)}`}></div>
                        <span className="text-sm text-gray-700">{status}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-800">{count}</span>
                    </div>
                  ))}
              </div>
            </>
          ) : (
            <div className="h-52 flex items-center justify-center text-gray-500">
              <p>No applications yet</p>
            </div>
          )}
        </div>

        {/* Weekly Application Trends */}
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Weekly Application Trends</h3>
          <p className="text-sm text-gray-600 mb-3">Applications received this week</p>
          
          {/* Bar Chart */}
          <div className="h-52 flex items-end justify-between space-x-1">
            {weeklyTrends.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center space-y-1">
                <div className="w-full flex flex-col items-end justify-end space-y-0.5" style={{ height: '140px' }}>
                  {day.applications > 0 && (
                    <div
                      className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                      style={{ 
                        height: `${(day.applications / maxApplications) * 100}%`, 
                        minHeight: day.applications > 0 ? '4px' : '0px'
                      }}
                      title={`${day.applications} applications`}
                    ></div>
                  )}
                </div>
                <span className="text-xs text-gray-600 mt-2">{day.day}</span>
                <span className="text-xs text-gray-500">{day.applications}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Applications */}
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaUsers className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Recent Applications</h3>
            </div>
            <button
              onClick={() => navigate('/recruiter/applications')}
              className="text-sm text-primary hover:text-primary-dark flex items-center space-x-1"
            >
              <span>View All</span>
              <FaArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {recentApplications && recentApplications.length > 0 ? (
              recentApplications.map((application, index) => (
                <div 
                  key={index} 
                  className="border-l-4 border-blue-500 pl-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  onClick={() => navigate(`/recruiter/applications/${application.id}`)}
                >
                  <p className="font-medium text-gray-800 text-sm">{application.candidateName || 'Candidate'}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{application.jobTitle || 'Job'}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      application.status === 'Applied' ? 'bg-blue-100 text-blue-700' :
                      application.status === 'Under Review' ? 'bg-gray-100 text-gray-700' :
                      application.status === 'Interview' ? 'bg-orange-100 text-orange-700' :
                      application.status === 'Offer' ? 'bg-purple-100 text-purple-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {application.status}
                    </span>
                    <span className="text-xs text-gray-500">{formatDate(application.appliedAt)}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No recent applications</p>
            )}
          </div>
        </div>

        {/* Upcoming Interviews */}
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FaCalendarAlt className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Upcoming Interviews</h3>
            </div>
            <button
              onClick={() => navigate('/recruiter/interviews')}
              className="text-sm text-primary hover:text-primary-dark flex items-center space-x-1"
            >
              <span>View All</span>
              <FaArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {upcomingInterviews && upcomingInterviews.length > 0 ? (
              upcomingInterviews.map((interview, index) => {
                let dateTimeStr = '';
                if (interview.scheduledDate) {
                  dateTimeStr = formatDateTime(interview.scheduledDate);
                } else if (interview.interviewDate && interview.interviewTime) {
                  dateTimeStr = `${formatDate(interview.interviewDate)} at ${interview.interviewTime}`;
                } else if (interview.interviewDate) {
                  dateTimeStr = formatDate(interview.interviewDate);
                }
                
                return (
                  <div 
                    key={index} 
                    className="border-l-4 border-orange-500 pl-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                    onClick={() => navigate(`/recruiter/interviews/${interview.id}`)}
                  >
                    <p className="font-medium text-gray-800 text-sm">{interview.candidateName || 'Candidate'}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{interview.jobTitle || 'Job'}</p>
                    {dateTimeStr && (
                      <p className="text-xs text-gray-500 mt-1">
                        {dateTimeStr}
                      </p>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No upcoming interviews</p>
            )}
          </div>
        </div>

        {/* Top Performing Jobs */}
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <FaChartLine className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Top Jobs</h3>
            </div>
            <button
              onClick={() => navigate('/recruiter/jobs')}
              className="text-sm text-primary hover:text-primary-dark flex items-center space-x-1"
            >
              <span>View All</span>
              <FaArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {topJobs && topJobs.length > 0 ? (
              topJobs.map((job, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                  onClick={() => navigate(`/recruiter/jobs/${job.id}`)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">{job.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{job.applicationCount} applications</p>
                  </div>
                  <FaArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No jobs posted yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;

