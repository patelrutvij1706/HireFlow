import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../services/authService';
import Sidebar from '../components/Sidebar';
import CandidateDashboard from './candidate/CandidateDashboard';
import RecruiterDashboard from './recruiter/RecruiterDashboard';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await getCurrentUser();
        if (response.success && response.data.user) {
          setUser(response.data.user);
        } else {
          navigate('/signin');
        }
      } catch (error) {
        navigate('/signin');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Sidebar>
      {user?.role === 'candidate' ? (
        <CandidateDashboard />
      ) : (
        <RecruiterDashboard />
      )}
    </Sidebar>
  );
};

export default Dashboard;

