import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/axios';
import { getDashboardRoute } from '../utils/routes';
import { STORAGE_KEYS } from '../constants';

const AuthContext = createContext(null);

const DEBUG = true;

const debugLog = (...args) => {
  if (DEBUG) {
    console.log('[Auth Debug]', ...args);
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // List of public routes that don't require authentication
  const publicRoutes = ['/', '/about', '/contact', '/signin', '/signup'];

  // Function to validate token format
  const isValidToken = (token) => {
    if (!token) return false;
    try {
      // Check if token is a valid JWT format (xxx.yyy.zzz)
      const parts = token.split('.');
      return parts.length === 3 && parts.every(part => part.length > 0);
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      debugLog('Initializing auth state');
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      
      debugLog('Initial auth check:', {
        token: token ? 'exists' : 'null',
        tokenValid: isValidToken(token),
        storedUser: storedUser ? JSON.parse(storedUser) : 'null',
        currentPath: location.pathname
      });
      
      if (token && isValidToken(token)) {
        try {
          debugLog('Token found, validating with server');
          debugLog('Making auth check request with token:', token);
          
          // Try different auth endpoints with fallbacks
          let response = null;
          let error = null;
          
          const authEndpoints = [
            '/auth/me',
            '/api/auth/me'
          ];
          
          for (const endpoint of authEndpoints) {
            try {
              debugLog(`Trying auth check endpoint: ${endpoint}`);
              response = await api.get(endpoint);
              debugLog(`Success with endpoint: ${endpoint}`);
              break;
            } catch (err) {
              debugLog(`Failed with endpoint ${endpoint}:`, err);
              error = err;
            }
          }
          
          if (!response) {
            throw error || new Error('All authentication check endpoints failed');
          }
          
          debugLog('Server response:', response.data);
          
          if (response.data.status === 'success') {
            // Handle both response structures (direct user or nested in data)
            const userData = response.data.user || response.data.data?.user;
            
            if (userData) {
              debugLog('Setting user state:', userData);
              setUser(userData);
              
              // Only redirect to dashboard if we're on the signin/signup page
              if (location.pathname === '/signin' || location.pathname === '/signup') {
                const dashboardRoute = getDashboardRoute(userData.role);
                debugLog('Redirecting to dashboard:', dashboardRoute);
                navigate(dashboardRoute);
              }
            } else {
              debugLog('No user data in response:', response.data);
              handleLogout('Invalid user data');
            }
          } else {
            debugLog('Invalid server response:', response.data);
            handleLogout('Invalid server response');
          }
        } catch (error) {
          debugLog('Auth check error:', error.response || error);
          handleLogout('Token validation failed');
        }
      } else {
        debugLog('No valid token found');
        // Only redirect to signin if we're not on a public route
        const isPublicRoute = publicRoutes.some(route => location.pathname.startsWith(route));
        if (!isPublicRoute && !location.pathname.includes('/signin')) {
          debugLog('Redirecting to signin from:', location.pathname);
          navigate('/signin', { state: { from: location.pathname } });
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [navigate, location.pathname]);

  const handleLogout = (reason = '') => {
    debugLog('Logging out', reason);
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  };

  const login = async (email, password) => {
    try {
      debugLog('Attempting login for:', email);
      debugLog('Password length:', password ? password.length : 0);
      console.log('🔑 LOGIN ATTEMPT - Email:', email, ', Password:', password);
      
      // Try different auth endpoints with fallbacks
      let response = null;
      let error = null;
      
      const authEndpoints = [
        '/auth/login',
        '/api/auth/login'
      ];
      
      for (const endpoint of authEndpoints) {
        try {
          debugLog(`Trying auth endpoint: ${endpoint}`);
          response = await api.post(endpoint, { email, password });
          debugLog(`Success with endpoint: ${endpoint}`);
          break;
        } catch (err) {
          debugLog(`Failed with endpoint ${endpoint}:`, err);
          error = err;
        }
      }
      
      if (!response) {
        throw error || new Error('All authentication endpoints failed');
      }
      
      debugLog('Login response:', response.data);
      
      if (response.data.status === 'success' && response.data.token) {
        const { token } = response.data;
        const userData = response.data.data.user;
        
        debugLog('Validating token:', {
          token: token.substring(0, 20) + '...',
          parts: token.split('.').map(part => part.length),
          valid: isValidToken(token)
        });
        
        if (!isValidToken(token)) {
          throw new Error('Received invalid token format from server');
        }

        // Set auth state
        debugLog('Setting auth state:', { 
          userData, 
          token: token.substring(0, 10) + '...' // Only log part of the token
        });
        
        setUser(userData);
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
        
        toast.success('Logged in successfully!');
        
        // Navigate to the appropriate dashboard or the previous attempted route
        const intendedPath = location.state?.from;
        const dashboardRoute = getDashboardRoute(userData.role);
        debugLog('Navigating to:', intendedPath || dashboardRoute);
        navigate(intendedPath || dashboardRoute);
        
        return userData;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      debugLog('Login error:', error);
      console.error('🔴 LOGIN ERROR:', {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        data: error.response?.data,
        email
      });
      
      handleLogout('Login failed');
      const message = error.response?.data?.message || error.message;
      toast.error(message);
      throw error;
    }
  };

  const signup = async (formData) => {
    try {
      debugLog('Attempting signup:', formData);
      
      // If signing up as a worker, get a proper worker ID from the server
      let workerId = null;
      if (formData.role === 'worker') {
        try {
          // First try to get a worker ID directly from the server
          console.log('Requesting worker ID from server...');
          const response = await api.get('/users/next-employee-id');
          
          if (response.data?.employeeId) {
            workerId = response.data.employeeId;
            console.log('✅ Received worker ID from server:', workerId);
          } else if (response.data?.nextId) {
            // Format the ID ourselves if we only got a number
            const year = new Date().getFullYear().toString().slice(-2);
            workerId = `WRK-${year}-${response.data.nextId.toString().padStart(4, '0')}`;
            console.log('✅ Formatted worker ID from counter:', workerId);
          } else {
            throw new Error('Invalid response format from server');
          }
        } catch (error) {
          console.error('❌ Failed to get worker ID from server:', error);
          // Generate a fallback ID
          const year = new Date().getFullYear().toString().slice(-2);
          const randomId = Math.floor(1000 + Math.random() * 9000);
          workerId = `WRK-${year}-${randomId}`;
          console.log('⚠️ Using fallback worker ID:', workerId);
        }
      }
      
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role || 'user',
        phone: formData.phone,
        address: formData.address,
        // Always set worker status to pending
        status: formData.role === 'worker' ? 'pending' : 'active',
        // Include worker ID if we got one
        ...(workerId ? { workerId } : {})
      };

      // Add explicit workerDetails with status for workers
      if (formData.role === 'worker') {
        userData.workerDetails = {
          status: 'pending',
          employeeId: workerId
        };
      }

      debugLog('Sending signup data to server:', {...userData, password: '[REDACTED]'});
      
      // Try different auth endpoints with fallbacks
      let response = null;
      let error = null;
      
      const authEndpoints = [
        '/auth/register',
        '/api/auth/register'
      ];
      
      for (const endpoint of authEndpoints) {
        try {
          debugLog(`Trying signup endpoint: ${endpoint}`);
          response = await api.post(endpoint, userData);
          debugLog(`Success with endpoint: ${endpoint}`);
          break;
        } catch (err) {
          debugLog(`Failed with endpoint ${endpoint}:`, err);
          error = err;
        }
      }
      
      if (!response) {
        throw error || new Error('All signup endpoints failed');
      }
      
      debugLog('Signup response:', response.data);

      if (response.data.status === 'success') {
        handleLogout('New signup');
        
        // Show specific message for worker signups
        if (formData.role === 'worker') {
          toast.success('Worker account created! Your application is pending approval.');
        } else {
          toast.success('Account created successfully! Please sign in to continue.');
        }
        
        sessionStorage.setItem('lastSignupEmail', userData.email);
        navigate('/signin');
        return response.data.data.user;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      debugLog('Signup error:', error.response || error);
      const message = error.response?.data?.message || 'Failed to create account';
      toast.error(message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      debugLog('Manual logout initiated');
      handleLogout('User initiated');
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      debugLog('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  const updateUser = (updatedUserData) => {
    debugLog('Updating user data:', updatedUserData);
    setUser(updatedUserData);
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUserData));
  };

  const value = {
    user,
    loading,
    login,
    logout,
    signup,
    updateUser,
    isAuthenticated: !!user,
    role: user?.role,
  };

  debugLog('Auth state update:', {
    isAuthenticated: !!user,
    role: user?.role,
    loading,
    currentPath: location.pathname
  });

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 