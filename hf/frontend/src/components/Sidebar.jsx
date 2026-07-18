import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaHome, 
  FaBriefcase, 
  FaSearch, 
  FaClipboardList, 
  FaVideo, 
  FaSignOutAlt,
  FaBell,
  FaFileAlt,
  FaUserEdit,
  FaChevronDown
} from 'react-icons/fa';
import { getCurrentUser, logout } from '../services/authService';
import { useState, useEffect, useRef } from 'react';

const Sidebar = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await getCurrentUser();
        if (response.success && response.data.user) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.error('Error loading user:', error);
      }
    };
    loadUser();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const getProfilePath = () => {
    return user?.role === 'recruiter' ? '/recruiter/profile' : '/profile';
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const userName = user?.candidateProfile?.fullName || user?.recruiterProfile?.fullName || user?.email || 'User';
  const userEmail = user?.email || '';
  const userRole = user?.role;

  // Candidate menu items
  const candidateMenuItems = [
    { path: '/dashboard', label: 'Overview', icon: FaHome },
    { path: '/applications', label: 'Applications', icon: FaBriefcase },
    { path: '/browse-jobs', label: 'Browse Jobs', icon: FaSearch },
    { path: '/interviews', label: 'Interviews', icon: FaVideo },
    { path: '/resume-parser', label: 'Resume Parser', icon: FaFileAlt },
  ];

  // Recruiter menu items
  const recruiterMenuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: FaHome },
    { path: '/recruiter/jobs', label: 'Jobs', icon: FaBriefcase },
    { path: '/recruiter/applications', label: 'Applications', icon: FaClipboardList },
    { path: '/recruiter/interviews', label: 'Interviews', icon: FaVideo },
    { path: '/recruiter/aptitude-tests', label: 'Aptitude Tests', icon: FaFileAlt },
  ];

  const menuItems = userRole === 'recruiter' ? recruiterMenuItems : candidateMenuItems;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        {/* User Profile Section with Dropdown */}
        <div className="bg-primary text-white" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center space-x-3 hover:opacity-90 transition-opacity p-6"
          >
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-lg font-semibold flex-shrink-0">
              {getInitials(userName)}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="font-semibold truncate text-sm">{userName}</p>
              <p className="text-xs text-white text-opacity-80 truncate">{userEmail}</p>
            </div>
            <FaChevronDown className={`w-4 h-4 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu with Animation */}
          <div 
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              showUserMenu ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="bg-white mx-2 mb-2 rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <Link
                to={getProfilePath()}
                onClick={() => setShowUserMenu(false)}
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <FaUserEdit className="w-4 h-4" />
                <span className="text-sm font-medium">Edit Profile</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
              >
                <FaSignOutAlt className="w-4 h-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm px-6 py-4 flex justify-end">
          <button className="relative p-2 text-gray-600 hover:text-gray-900">
            <FaBell className="w-6 h-6" />
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Sidebar;

