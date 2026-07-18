import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentUser } from '../services/authService';
import Loading from './Loading';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await getCurrentUser();
        if (response.success && response.data.user) {
          setIsAuthenticated(true);
          setUserRole(response.data.user.role);
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // Check if user role is allowed
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    // Redirect based on role
    if (userRole === 'candidate') {
      return <Navigate to="/questionnaire/candidate" replace />;
    } else if (userRole === 'recruiter') {
      return <Navigate to="/questionnaire/recruiter" replace />;
    }
    return <Navigate to="/signin" replace />;
  }

  return children;
};

export default ProtectedRoute;

