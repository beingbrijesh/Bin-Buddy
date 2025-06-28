import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [shouldRender, setShouldRender] = useState(true);
  
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please sign in to access this page');
      navigate('/signin', { state: { from: location }, replace: true });
      setShouldRender(false);
      return;
    }
    
    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
      toast.error('You do not have permission to access this page');
      navigate('/', { replace: true });
      setShouldRender(false);
      return;
    }
  }, [isAuthenticated, user, allowedRoles, navigate, location]);
  
  // Only render children if authentication checks pass
  return shouldRender ? children : null;
};

export default ProtectedRoute; 