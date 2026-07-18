import React from 'react';
import { 
  FaBriefcase, 
  FaClipboardList, 
  FaVideo, 
  FaTrophy,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';

const CandidateDashboard = () => {
  // Mock data - will be replaced with API calls later
  const metrics = {
    totalApplications: 12,
    applicationsThisWeek: 3,
    testsCompleted: 8,
    passRate: 85,
    interviews: 3,
    upcomingInterviews: 2,
    offersReceived: 1,
    offerStatus: 'Pending decision'
  };

  const applicationStatus = [
    { label: 'Applied', count: 5, color: 'bg-blue-500' },
    { label: 'Under Review', count: 2, color: 'bg-gray-600' },
    { label: 'Test Scheduled', count: 2, color: 'bg-green-500' },
    { label: 'Interview', count: 2, color: 'bg-orange-500' },
    { label: 'Offer', count: 1, color: 'bg-purple-500' }
  ];

  const weeklyActivity = [
    { day: 'Mon', applications: 1.75, responses: 0.75 },
    { day: 'Tue', applications: 0.75, responses: 0.25 },
    { day: 'Wed', applications: 2.75, responses: 1.75 },
    { day: 'Thu', applications: 1.25, responses: 0.75 },
    { day: 'Fri', applications: 1.75, responses: 0.75 },
    { day: 'Sat', applications: 0, responses: 0 },
    { day: 'Sun', applications: 1.25, responses: 0 }
  ];

  const upcomingEvents = [
    { title: 'Coding Test - Amazon', date: 'Jan 22, 2024', time: '10:00 AM' },
    { title: 'Technical Interview - Google', date: 'Jan 25, 2024', time: '2:00 PM' },
    { title: 'Offer Decision Deadline - Meta', date: 'Jan 30, 2024', time: '5:00 PM' }
  ];

  const recentActivity = [
    { action: 'Applied to Google - Senior Software Engineer', time: '2 hours ago', icon: FaBriefcase },
    { action: 'Completed coding test for Amazon', time: '1 day ago', icon: FaClipboardList },
    { action: 'Interview scheduled with Microsoft', time: '2 days ago', icon: FaVideo },
    { action: 'Offer received from Meta', time: '3 days ago', icon: FaTrophy },
    { action: 'Updated resume', time: '5 days ago', icon: FaClipboardList }
  ];

  const profileCompleteness = 85;
  const profileItems = [
    { label: 'Resume uploaded', completed: true },
    { label: 'Skills added', completed: true },
    { label: 'Add certifications', completed: false }
  ];

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <p className="text-gray-600 text-sm mt-0.5">Welcome back! Here's your activity summary</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Applications */}
        <div className="bg-white rounded-xl shadow p-5 flex flex-col items-center justify-center text-center">
          <div className="p-2.5 bg-blue-100 rounded-lg mb-3">
            <FaBriefcase className="w-7 h-7 text-blue-600" />
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-1">{metrics.totalApplications}</h3>
          <p className="text-gray-600 text-sm mb-1">Total Applications</p>
          <p className="text-green-600 text-sm font-medium">+{metrics.applicationsThisWeek} this week</p>
        </div>

        {/* Tests Completed */}
        <div className="bg-white rounded-xl shadow p-5 flex flex-col items-center justify-center text-center">
          <div className="p-2.5 bg-green-100 rounded-lg mb-3">
            <FaClipboardList className="w-7 h-7 text-green-600" />
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-1">{metrics.testsCompleted}</h3>
          <p className="text-gray-600 text-sm mb-1">Tests Completed</p>
          <p className="text-green-600 text-sm font-medium">{metrics.passRate}% pass rate</p>
        </div>

        {/* Interviews */}
        <div className="bg-white rounded-xl shadow p-5 flex flex-col items-center justify-center text-center">
          <div className="p-2.5 bg-orange-100 rounded-lg mb-3">
            <FaVideo className="w-7 h-7 text-orange-600" />
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-1">{metrics.interviews}</h3>
          <p className="text-gray-600 text-sm mb-1">Interviews</p>
          <p className="text-orange-600 text-sm font-medium">{metrics.upcomingInterviews} upcoming</p>
        </div>

        {/* Offers Received */}
        <div className="bg-white rounded-xl shadow p-5 flex flex-col items-center justify-center text-center">
          <div className="p-2.5 bg-purple-100 rounded-lg mb-3">
            <FaTrophy className="w-7 h-7 text-purple-600" />
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-1">{metrics.offersReceived}</h3>
          <p className="text-gray-600 text-sm mb-1">Offers Received</p>
          <p className="text-purple-600 text-sm font-medium">{metrics.offerStatus}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Application Status */}
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Application Status</h3>
          <p className="text-sm text-gray-600 mb-3">Distribution by stage</p>
          
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
                {/* Applied (5) - Blue */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="10"
                  strokeDasharray={`${(5/12) * 251.2} 251.2`}
                  strokeDashoffset="0"
                  strokeLinecap="round"
                />
                {/* Under Review (2) - Gray */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#4b5563"
                  strokeWidth="10"
                  strokeDasharray={`${(2/12) * 251.2} 251.2`}
                  strokeDashoffset={`-${(5/12) * 251.2}`}
                  strokeLinecap="round"
                />
                {/* Test Scheduled (2) - Green */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="10"
                  strokeDasharray={`${(2/12) * 251.2} 251.2`}
                  strokeDashoffset={`-${(7/12) * 251.2}`}
                  strokeLinecap="round"
                />
                {/* Interview (2) - Orange */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="10"
                  strokeDasharray={`${(2/12) * 251.2} 251.2`}
                  strokeDashoffset={`-${(9/12) * 251.2}`}
                  strokeLinecap="round"
                />
                {/* Offer (1) - Purple */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#9333ea"
                  strokeWidth="10"
                  strokeDasharray={`${(1/12) * 251.2} 251.2`}
                  strokeDashoffset={`-${(11/12) * 251.2}`}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-1.5">
            {applicationStatus.map((status, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-4 h-4 rounded ${status.color}`}></div>
                  <span className="text-sm text-gray-700">{status.label}</span>
                </div>
                <span className="text-sm font-semibold text-gray-800">{status.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Activity */}
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Weekly Activity</h3>
          <p className="text-sm text-gray-600 mb-3">Applications and responses this week</p>
          
          {/* Bar Chart */}
          <div className="h-52 flex items-end justify-between space-x-1">
            {weeklyActivity.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center space-y-1">
                <div className="w-full flex flex-col items-end justify-end space-y-0.5" style={{ height: '140px' }}>
                  {day.applications > 0 && (
                    <div
                      className="w-full bg-blue-500 rounded-t"
                      style={{ height: `${(day.applications / 3) * 100}%`, minHeight: '4px' }}
                    ></div>
                  )}
                  {day.responses > 0 && (
                    <div
                      className="w-full bg-green-500 rounded-t"
                      style={{ height: `${(day.responses / 2) * 100}%`, minHeight: '4px' }}
                    ></div>
                  )}
                </div>
                <span className="text-xs text-gray-600 mt-2">{day.day}</span>
              </div>
            ))}
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-center space-x-4 mt-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-sm text-gray-600">Applications</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-600">Responses</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Upcoming Events */}
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center space-x-2 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Upcoming Events</h3>
          </div>
          <div className="space-y-3">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-3">
                <p className="font-medium text-gray-800 text-sm">{event.title}</p>
                <p className="text-xs text-gray-600 mt-0.5">{event.date} • {event.time}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center space-x-2 mb-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
          </div>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div key={index} className="flex items-start space-x-2.5">
                  <Icon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800">{activity.action}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Profile Completeness */}
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center space-x-2 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Profile Completeness</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">Complete your profile to increase your chances</p>
          
          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Overall Progress</span>
              <span className="text-base font-bold text-gray-800">{profileCompleteness}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-purple-600 h-2.5 rounded-full transition-all"
                style={{ width: `${profileCompleteness}%` }}
              ></div>
            </div>
          </div>

          {/* Checklist */}
          <div className="space-y-2.5">
            {profileItems.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                {item.completed ? (
                  <FaCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                ) : (
                  <FaExclamationTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                )}
                <span className={`text-sm ${item.completed ? 'text-gray-700' : 'text-gray-600'}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;

