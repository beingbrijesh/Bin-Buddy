import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import AdminDashboard from '../../components/Dashboard/AdminDashboard';
import WorkerDashboard from '../../components/Dashboard/WorkerDashboard';
import VolunteerDashboard from '../../components/Dashboard/VolunteerDashboard';
import UserDashboard from '../../components/Dashboard/UserDashboard';
import { ROLES } from '../../constants/roles';
import { getDashboardRoute } from '../../utils/routes';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const isFirstVisit = !localStorage.getItem('hasVisitedDashboard');
    if (isFirstVisit) {
      setShowWelcome(true);
      localStorage.setItem('hasVisitedDashboard', 'true');
    }
  }, []);

  // Redirect to role-specific dashboard if on generic dashboard route
  useEffect(() => {
    if (user && location.pathname === '/dashboard') {
      const dashboardRoute = getDashboardRoute(user.role);
      navigate(dashboardRoute, { replace: true });
    }
  }, [user, location.pathname, navigate]);

  const handleCloseWelcome = () => {
    setShowWelcome(false);
  };

  const renderDashboard = () => {
    // If we're on the generic dashboard route, don't render anything as we'll redirect
    if (location.pathname === '/dashboard') {
      return null;
    }

    switch (user?.role) {
      case ROLES.ADMIN:
        return <AdminDashboard />;
      case ROLES.WORKER:
        return <WorkerDashboard />;
      case ROLES.VOLUNTEER:
        return <VolunteerDashboard />;
      case ROLES.USER:
        return <UserDashboard />;
      default:
        return (
          <div className="error-state">
            <h1>Welcome to BinBuddy</h1>
            <p>Please log in to access your dashboard.</p>
          </div>
        );
    }
  };

  return (
    <div className="dashboard-container">
      {showWelcome && (
        <div className="welcome-popup">
          <div className="welcome-content">
            <h2>Welcome to BinBuddy! 👋</h2>
            <p>We're excited to have you here. Let's make our community cleaner together!</p>
            <button onClick={handleCloseWelcome}>Get Started</button>
          </div>
        </div>
      )}
      {renderDashboard()}
    </div>
  );
};

export default Dashboard; 