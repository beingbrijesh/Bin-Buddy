import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  UserPlus, 
  Edit2, 
  Trash2, 
  Search, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Users,
  Star,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Truck,
  Clock,
  MoreVertical,
  MessageSquare,
  Eye,
  Filter,
  RefreshCw,
  Grid as GridIcon,
  List as ListIcon,
  ArrowUp,
  ArrowDown,
  AlertOctagon,
  Paperclip,
  Send,
  Map,
  Radio,
  Activity,
  Clipboard,
  PieChart,
  BarChart2,
  Calendar as CalendarIcon,
  Bell,
  UserCheck,
  UserX,
  Shield,
  User as UserIcon
} from 'lucide-react';
import './Management.css';
import { toast } from 'react-hot-toast';
import api from '../../utils/axios';
import { format } from 'date-fns';
import { useNavigate, useLocation } from 'react-router-dom';
import SkeletonLoader from '../../components/SkeletonLoader';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

// Define additional styles for the dropdown submenu
const additionalStyles = `
.dropdown-submenu {
  position: relative;
  cursor: pointer;
  width: 100%;
}

.dropdown-submenu-content {
  display: none;
  position: absolute;
  left: 100%;
  top: 0;
  min-width: 160px;
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  z-index: 11;
}

.dropdown-submenu:hover .dropdown-submenu-content {
  display: block;
}

/* Ensure the dropdown content is visible when the parent is hovered */
.dropdown-submenu:hover > .dropdown-submenu-content,
.dropdown-submenu-content:hover {
  display: block;
}

.status-option {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  width: 100%;
  text-align: left;
  border: none;
  background: none;
  cursor: pointer;
}

.status-option:hover {
  background-color: #f5f5f5;
}

/* Status badge styles */
.status-badge[data-status="available"] {
  background-color: #8bd6a8;
  color: #0c5e26;
}

/* Fix for dropdown position in some browsers */
.dropdown-container {
  position: relative;
}

/* Direct button style override for status buttons */
.status-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid #e2e8f0;
  background-color: white;
  margin-top: 6px;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}

.status-action-btn:hover {
  background-color: #f7fafc;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.status-action-btn:active {
  transform: translateY(0);
}

.status-action-btn.available {
  border-color: #68d391;
  color: #2f855a;
}

.status-action-btn.available:hover {
  background-color: #f0fff4;
}

.status-action-btn.pending {
  border-color: #90cdf4;
  color: #3182ce;
}

.status-action-btn.pending:hover {
  background-color: #ebf8ff;
}

/* Loading state for status buttons */
.status-action-btn.loading::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, #68d391, #90cdf4, #68d391);
  background-size: 200% 100%;
  animation: loading-animation 1.5s infinite;
}

@keyframes loading-animation {
  0% { background-position: 0% 0; }
  100% { background-position: 200% 0; }
}

.status-actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.zone-assign-btn {
  font-size: 11px;
  padding: 2px 6px;
  background: #e2e8f0;
  color: #4a5568;
  border-radius: 100px;
  white-space: nowrap;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.zone-assign-btn:hover {
  background: #cbd5e0;
}

/* Role hierarchy styles */
.role-hierarchy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.main-role {
  font-size: 12px;
  font-weight: 500;
  color: #4a5568;
  background-color: #e2e8f0;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.worker-type {
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
  text-transform: capitalize;
}

/* For grid view cards */
.worker-card .role-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  margin-bottom: 8px;
}

.worker-card .main-role {
  font-size: 10px;
  padding: 1px 4px;
}

.worker-card .worker-type {
  font-size: 13px;
}

/* Disabled input styling */
.disabled-input {
  background-color: #f7fafc;
  color: #4a5568;
  cursor: not-allowed;
  border: 1px solid #e2e8f0;
}

/* Field note styling */
.field-note {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #718096;
  margin-top: 4px;
}

.field-note svg {
  color: #e53e3e;
}

/* Admin badge styling */
.admin-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background-color: #4c1d95;
  color: white;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  margin-left: 10px;
}

.admin-required {
  font-size: 10px;
  background-color: #fed7d7;
  color: #e53e3e;
  padding: 2px 4px;
  border-radius: 4px;
  margin-left: 4px;
  white-space: nowrap;
}

/* Form validation styles */
.error-input {
  border: 1px solid #e53e3e !important;
  background-color: #fff5f5 !important;
}

.error-message {
  color: #e53e3e;
  font-size: 12px;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.error-message::before {
  content: "⚠️";
  font-size: 10px;
}

/* Required field indicator */
.required-field {
  color: #e53e3e;
  margin-left: 2px;
}

/* Validation summary styling */
.form-validation-summary {
  background-color: #FFF5F5;
  border: 1px solid #FEB2B2;
  border-radius: 4px;
  padding: 12px 16px;
  margin-bottom: 20px;
}

.validation-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #E53E3E;
  font-weight: 500;
  margin-bottom: 8px;
}

.validation-errors-list {
  margin: 0;
  padding-left: 24px;
  color: #E53E3E;
  font-size: 13px;
}

.validation-errors-list li {
  margin-bottom: 4px;
}
`;

const WorkerManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth(); // Get the current user from auth context
  const [isAdmin, setIsAdmin] = useState(false);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    role: 'all',
    zone: 'all',
    sortBy: 'name-asc'
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    workerId: '',
    dateOfBirth: '',
    role: 'worker', // Main role is always 'worker'
    workerType: 'collector', // Default worker type
    zone: '', // Start with empty zone so user must select one
    shift: 'morning', // Default shift
    joinedDate: format(new Date(), 'yyyy-MM-dd'),
    emergencyContactName: '',
    emergencyContactPhone: '',
    certifications: [],
    workerStatus: 'pending' // Default status is pending
  });
  const [formErrors, setFormErrors] = useState({});
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [contactForm, setContactForm] = useState({
    method: 'email',
    priority: 'normal',
    subject: '',
    message: '',
    attachments: []
  });
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);
  const [zones, setZones] = useState([]);
  const [pendingWorkers, setPendingWorkers] = useState([]);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [allWorkers, setAllWorkers] = useState([]);
  const [activeStatusUpdate, setActiveStatusUpdate] = useState(null);
  const [filteredWorkers, setFilteredWorkers] = useState([]);

  // Inject additional styles
  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.textContent = additionalStyles;
    document.head.appendChild(styleEl);
    
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  // Filter options for the dropdown menus
  const filterOptions = useMemo(() => ({
    status: [
      { value: 'all', label: 'All Statuses' },
      { value: 'active', label: 'Active' },
      { value: 'available', label: 'Available' },
      { value: 'onLeave', label: 'On Leave' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'suspended', label: 'Suspended' },
      { value: 'pending', label: 'Pending' }
    ],
    role: [
      { value: 'all', label: 'All Types' },
      { value: 'collector', label: 'Collector' },
      { value: 'driver', label: 'Driver' },
      { value: 'supervisor', label: 'Supervisor' },
      { value: 'sweeper', label: 'Sweeper' },
      { value: 'cleaner', label: 'Cleaner' }
    ],
    zone: [
      { value: 'all', label: 'All Zones' },
      ...(Array.isArray(zones) ? zones.map(zone => ({ value: zone._id, label: zone.name })) : [
        { value: 'north', label: 'North Zone' },
        { value: 'south', label: 'South Zone' },
        { value: 'east', label: 'East Zone' },
        { value: 'west', label: 'West Zone' },
        { value: 'central', label: 'Central Zone' }
      ])
    ],
    sortBy: [
      { value: 'name-asc', label: 'Name (A-Z)' },
      { value: 'name-desc', label: 'Name (Z-A)' },
      { value: 'rating-high', label: 'Rating (High-Low)' },
      { value: 'rating-low', label: 'Rating (Low-High)' },
      { value: 'tasks-high', label: 'Tasks Today (High-Low)' },
      { value: 'last-active', label: 'Last Active' }
    ]
  }), [zones]);

  // Add a useEffect to check for pending workers periodically
  useEffect(() => {
    // Check for pending workers on component mount
    fetchPendingWorkers();
    
    // Set up an interval to check for pending workers every minute
    const pendingWorkersInterval = setInterval(() => {
      fetchPendingWorkers();
    }, 60000); // 60000 ms = 1 minute
    
    // Clean up the interval when component unmounts
    return () => {
      clearInterval(pendingWorkersInterval);
    };
  }, []);

  // Add a ref to track if zones have been loaded
  const zonesLoadedRef = useRef(false);

  // Check if user is admin
  useEffect(() => {
    if (user) {
      // Check if user has admin role
      const userIsAdmin = user.role === 'admin' || user.permissions?.includes('manage_workers');
      setIsAdmin(userIsAdmin);
      
      console.log('User role check:', {
        role: user.role,
        isAdmin: userIsAdmin,
        permissions: user.permissions || []
      });
      
      // If not admin, show a notification
      if (!userIsAdmin) {
        toast('Some worker management features require admin privileges', {
          icon: 'ℹ️',
          duration: 4000
        });
      }
    }
  }, [user]);

  // Original useEffect for document title remains
  useEffect(() => {
    // Check if server is running first
    const checkServerAndFetch = async () => {
      try {
        const serverStatus = await api.checkServer();
        if (serverStatus.online) {
          console.log('✅ Server is online, fetching data...');
    fetchWorkers();
          
          // Only fetch zones if they haven't been loaded yet
          if (!zonesLoadedRef.current) {
          fetchZones();
            zonesLoadedRef.current = true;
          }
          
          fetchPendingWorkers();
        } else {
          console.error('❌ Server appears to be offline');
          toast.error('Cannot connect to server. Please check if the backend is running.');
          setLoading(false);
          setWorkers([]);
          setAllWorkers([]);
        }
      } catch (error) {
        console.error('❌ Error checking server status:', error);
        toast.error('Could not verify server status. Attempting to fetch data anyway.');
        
        // Proceed with fetching anyway
        fetchWorkers();
        
        // Only fetch zones if they haven't been loaded yet
        if (!zonesLoadedRef.current) {
        fetchZones();
          zonesLoadedRef.current = true;
        }
        
        fetchPendingWorkers();
      }
    };
    
    checkServerAndFetch();
    document.title = 'Worker Management | BinBuddy Admin';
    
    return () => {
      document.title = 'BinBuddy Admin';
    };
  }, []);
  
  // Helper function to normalize role values for consistent comparison
  const normalizeRole = (role) => {
    if (!role) return '';
    
    // Convert to lowercase for case-insensitive comparison
    const lowerRole = typeof role === 'string' ? role.toLowerCase() : '';
    
    // Map between backend and frontend role terminology
    const roleMap = {
      // Backend main roles
      'worker': 'worker',
      'admin': 'admin',
      'user': 'user',
      'volunteer': 'volunteer',
      
      // Worker types (used in workerDetails.workerType)
      'collector': 'collector',
      'maintenance': 'maintenance',
      'supervisor': 'supervisor',
      'installation': 'installation'
    };
    
    return roleMap[lowerRole] || lowerRole;
  };
  
  // Helper function to get the appropriate worker type based on role
  const getWorkerTypeFromRole = useMemo(() => {
    return (role) => {
    if (!role) return 'collector';
    
    const lowerRole = typeof role === 'string' ? role.toLowerCase() : '';
    
    // Map frontend roles to worker types
    switch (lowerRole) {
      case 'collector': return 'collector';
      case 'maintenance': return 'maintenance';
      case 'supervisor': return 'supervisor';
      case 'installation': return 'installation';
      default: return 'collector';
    }
  };
  }, []);
  
  // Apply filters to workers data with improved dependency tracking
  useEffect(() => {
    if (allWorkers && allWorkers.length > 0) {
      // Start loading state explicitly
      setLoading(true);
      
      // Use a small timeout to allow the UI to update with loading state
      const filterTimeout = setTimeout(() => {
        try {
          console.log('🔍 Applying filters:', filters);
          
          let filteredWorkers = [...allWorkers];
          
          // Filter by status - make sure to handle case insensitively
          if (filters.status !== 'all') {
            filteredWorkers = filteredWorkers.filter(worker => {
              // Get the worker status in a safe way, defaulting to empty string if undefined
              const workerStatus = (worker.workerStatus || worker.status || '').toLowerCase();
              const filterStatus = filters.status.toLowerCase();
              
              return workerStatus === filterStatus;
            });
          }
          
          // Filter by role - make sure to handle case insensitively
          if (filters.role !== 'all') {
            console.log('🔍 Filtering by role:', filters.role);
            
            filteredWorkers = filteredWorkers.filter(worker => {
              // Get the worker type from either workerType or workerDetails.workerType
              const workerType = (
                worker.workerType || 
                worker.workerDetails?.workerType || 
                                getWorkerTypeFromRole(worker.role) || 
                'collector'
              ).toLowerCase();
              
              // Normalize the filter role to a worker type
              const filterWorkerType = filters.role.toLowerCase();
              
              // Debug log to see what we're comparing
              console.log(`Comparing worker type: "${workerType}" with filter type: "${filterWorkerType}" for worker: ${worker.name}`);
              
              // Check if they match
              return workerType === filterWorkerType;
            });
            
            console.log(`🔍 After role filtering, ${filteredWorkers.length} workers remain`);
          }
          
          // Filter by zone - check both ID and name
          if (filters.zone !== 'all') {
            filteredWorkers = filteredWorkers.filter(worker => {
              const workerZone = worker.zone || worker.workerDetails?.zone || '';
              const workerZoneName = worker.zoneName || worker.workerDetails?.zoneName || '';
              
              return workerZone === filters.zone || workerZoneName === filters.zone;
            });
          }
          
          // Apply search term if it exists
          if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filteredWorkers = filteredWorkers.filter(worker => {
              // Check all relevant fields, defaulting to empty string if undefined
              const name = (worker.name || '').toLowerCase();
              const workerId = (worker.workerId || worker.workerDetails?.employeeId || '').toLowerCase();
              const workerType = (worker.workerType || worker.workerDetails?.workerType || '').toLowerCase();
              const email = (worker.email || '').toLowerCase();
              const phone = (worker.phone || '').toLowerCase();
              
              return name.includes(searchLower) || 
                     workerId.includes(searchLower) || 
                     workerType.includes(searchLower) || 
                     email.includes(searchLower) ||
                     phone.includes(searchLower);
            });
          }
          
          // Sort workers
          if (filters.sortBy) {
            switch(filters.sortBy) {
              case 'name-asc':
                filteredWorkers.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                break;
              case 'name-desc':
                filteredWorkers.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
                break;
              case 'rating-high':
                filteredWorkers.sort((a, b) => {
                  const ratingA = a.performance?.rating || a.rating || a.workerDetails?.rating || 0;
                  const ratingB = b.performance?.rating || b.rating || b.workerDetails?.rating || 0;
                  return ratingB - ratingA;
                });
                break;
              case 'rating-low':
                filteredWorkers.sort((a, b) => {
                  const ratingA = a.performance?.rating || a.rating || a.workerDetails?.rating || 0;
                  const ratingB = b.performance?.rating || b.rating || b.workerDetails?.rating || 0;
                  return ratingA - ratingB;
                });
                break;
              case 'tasks-high':
                filteredWorkers.sort((a, b) => {
                  const tasksA = a.performance?.tasksCompleted || a.tasksCompleted || a.workerDetails?.tasksCompleted || 0;
                  const tasksB = b.performance?.tasksCompleted || b.tasksCompleted || b.workerDetails?.tasksCompleted || 0;
                  return tasksB - tasksA;
                });
                break;
              case 'last-active':
                filteredWorkers.sort((a, b) => {
                  const dateA = a.lastLogin ? new Date(a.lastLogin) : new Date(0);
                  const dateB = b.lastLogin ? new Date(b.lastLogin) : new Date(0);
                  return dateB - dateA;
                });
                break;
              default:
                // Default sort by name
                filteredWorkers.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            }
          }
          
          console.log(`✅ Filters applied, showing ${filteredWorkers.length} of ${allWorkers.length} workers`);
          setWorkers(filteredWorkers);
        } catch (error) {
          console.error('❌ Error applying filters:', error);
          console.error('Filter error details:', error.message);
          
          // As a fallback, show all workers if filtering fails
          setWorkers([...allWorkers]);
        } finally {
          // Always end loading state
          setLoading(false);
        }
      }, 50); // Short timeout to let UI update
      
      // Safety timeout to ensure loading state doesn't get stuck
      const safetyTimeout = setTimeout(() => {
        setLoading(false);
      }, 3000); // 3 second safety timeout
      
      // Clean up both timeouts
      return () => {
        clearTimeout(filterTimeout);
        clearTimeout(safetyTimeout);
      };
    } else if (allWorkers && allWorkers.length === 0) {
      // If we have an empty array, just show empty results
      setWorkers([]);
      setLoading(false);
    }
  }, [filters, allWorkers, searchTerm]); // Remove getWorkerTypeFromRole from dependencies
  
  // Update the useEffect for handling edit modal opening
  useEffect(() => {
    // Check if we have edit worker state from navigation
    if (location.state?.editWorkerId && location.state?.openEditModal) {
      console.log('Opening edit modal for worker:', location.state.editWorkerId);
      
      // Find the worker by ID
      const workerToEdit = workers.find(w => 
        w._id === location.state.editWorkerId || 
        w.id === location.state.editWorkerId
      );
      
      if (workerToEdit) {
        // If we have workerData from profile page, ensure required fields are set
        if (location.state.workerData) {
          workerToEdit.workerId = location.state.workerData.workerId || workerToEdit.workerId;
          workerToEdit.zone = location.state.workerData.zone || workerToEdit.zone || '';
        }
        handleEditWorker(workerToEdit);
      } else {
        // If worker not found in current state, try to fetch it
        const fetchWorkerForEdit = async () => {
          try {
            console.log('🔍 Fetching individual worker data for editing...');
            
            // Add a retry mechanism with delay
            let retries = 0;
            const maxRetries = 3;
            let success = false;
            let response;
            
            while (retries < maxRetries && !success) {
              try {
                // Add exponential backoff delay for retries
                if (retries > 0) {
                  const delay = Math.pow(2, retries) * 1000; // 2s, 4s, 8s
                  console.log(`⏱️ Retry ${retries}/${maxRetries}: waiting ${delay}ms before next attempt...`);
                  await new Promise(resolve => setTimeout(resolve, delay));
                }
                
                // Try to fetch the worker data
                try {
                  console.log('Trying worker API endpoint first...');
                  response = await api.get(`/api/workers/${location.state.editWorkerId}`);
                  console.log('Successfully fetched from worker API');
                success = true;
                } catch (workerApiError) {
                  console.log('Worker API failed, trying users API:', workerApiError);
                  response = await api.get(`/api/users/${location.state.editWorkerId}`);
                  console.log('Successfully fetched from users API');
                  success = true;
                }
                
              } catch (err) {
                retries++;
                console.error(`❌ Attempt ${retries}/${maxRetries} failed:`, err.message);
                
                // Check if rate limited
                if (err.response && err.response.status === 429) {
                  console.log('⚠️ Rate limited! Adding longer delay...');
                  // Add extra delay for rate limit errors
                  await new Promise(resolve => setTimeout(resolve, 3000));
                }
                
                if (retries >= maxRetries) {
                  throw err; // Re-throw if we've exhausted retries
                }
              }
            }
            
            if (response && response.data) {
              console.log('✅ Successfully fetched worker data for editing');
              
              // If we have workerData from profile page, ensure required fields are set
              if (location.state.workerData) {
                response.data.workerId = location.state.workerData.workerId || response.data.workerId || response.data.userId;
                response.data.zone = location.state.workerData.zone || response.data.zone || '';
              }
              
              handleEditWorker(response.data);
            } else {
              throw new Error('Failed to retrieve worker data');
            }
          } catch (error) {
            console.error('Failed to fetch worker for editing:', error);
            toast.error('Could not load worker data for editing. Please try again later.');
            
            // If we can't fetch the specific worker, refresh the entire list after delay
            setTimeout(() => {
              fetchWorkers();
            }, 2000);
          }
        };
        
        fetchWorkerForEdit();
      }
      
      // Clear the navigation state to prevent reopening on refresh
      window.history.replaceState({}, document.title);
    }
  }, [workers, location.state]);
  
  // Fetch workers and then apply filters
  const fetchWorkers = async () => {
    try {
      setLoading(true);
      console.log('Fetching workers with filters:', filters);
      
      // Define endpoints to try in priority order - ONLY using workers collection endpoints
      const endpoints = [
        '/api/workers/all-workers',  // Unprotected workers endpoint
        '/api/workers',              // Protected workers endpoint (admin)
      ];
      
      let response = null;
      let error = null;
      
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`);
          response = await api.get(endpoint);
          console.log(`Success with endpoint: ${endpoint}`);
          break;
        } catch (err) {
          error = err;
          console.error(`Failed with endpoint ${endpoint}:`, err.message);
          
          // If this is an authorization error, try the next endpoint
          if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            console.log(`Authorization error with ${endpoint}, trying next endpoint...`);
            continue;
          }
          
          // For other errors, also continue to the next endpoint
          console.log(`Error with ${endpoint}, trying next endpoint...`);
        }
      }
      
      if (!response) {
        console.error('All API endpoints failed:', error);
        toast.error('Could not fetch worker data from server. Please check your connection or permissions.');
        setLoading(false);
        return;
      }
      
      // Handle different response formats
      let fetchedWorkers = [];
      if (Array.isArray(response.data)) {
        fetchedWorkers = response.data;
      } else if (response.data.workers && Array.isArray(response.data.workers)) {
        fetchedWorkers = response.data.workers;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        fetchedWorkers = response.data.data;
      } else if (typeof response.data === 'object') {
        fetchedWorkers = [response.data];
      }
      
      console.log(`Fetched ${fetchedWorkers.length} workers`);
      
      // Normalize worker data based on the worker schema
      const normalizedWorkers = fetchedWorkers.map(worker => {
        // Extract worker ID
        const workerId = worker.workerId || 'N/A';
        
        // Extract worker type
        const workerType = worker.workerType || 'collector';
        
        // Extract worker status
        const workerStatus = worker.workerStatus || 'active';
        
        // Extract zone
        const zone = worker.zone || 'Unassigned';
        
        // Extract shift
        const shift = worker.shift || 'morning';
        
        // Extract performance metrics
        const performance = {
          rating: worker.performance?.rating || 0,
          efficiency: worker.performance?.efficiency || 0,
          tasksCompleted: worker.performance?.tasksCompleted || 0,
          binsCollected: worker.performance?.binsCollected || 0,
          distanceCovered: worker.performance?.distanceCovered || 0
        };
        
        return {
          _id: worker._id,
          workerId: workerId,
          name: worker.name || 'Unnamed Worker',
          email: worker.email || 'No Email',
          phone: worker.phone || 'No Phone',
          avatar: worker.avatar || '',
          workerType: workerType,
          zone: zone,
          workerStatus: workerStatus,
          shift: shift,
          performance: performance,
          lastLogin: worker.lastLogin || null,
          workerDetails: worker.workerDetails || {},
          attendance: worker.attendance || {},
          assignedTasks: worker.assignedTasks || [],
          assignedBins: worker.assignedBins || [],
          badges: worker.badges || []
        };
      });
      
      setWorkers(normalizedWorkers);
      setAllWorkers(normalizedWorkers);
      
      // The filtering will be handled by the useEffect that watches allWorkers
    } catch (error) {
      console.error('Error fetching workers:', error);
      toast.error('Failed to load workers. Please try again later.');
      setWorkers([]);
      setAllWorkers([]);
      setFilteredWorkers([]);
    } finally {
      setLoading(false);
    }
  };

  // Add a dedicated function to fetch zones with multiple fallbacks
  const fetchZonesWithFallbacks = async () => {
    console.log('🔍 Attempting to fetch zones with multiple fallbacks...');
    
    // Try multiple sources with fallbacks
    try {
      // 1. First try the standard API endpoint
      try {
        const response = await api.get('/api/zones');
        if (response.data) {
          const zonesData = response.data.data || response.data;
          if (Array.isArray(zonesData) && zonesData.length > 0) {
            console.log('✅ Successfully fetched zones from primary endpoint:', zonesData);
            return zonesData;
          }
        }
      } catch (error) {
        console.log('Primary zones endpoint failed:', error.message);
        
        // Check if this is an authorization error
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          console.log('⚠️ Authorization error detected. Trying public endpoints...');
        }
      }
      
      // 2. Try public zones endpoint (no auth required)
      try {
        const response = await api.get('/api/public/zones');
        if (response.data) {
          const zonesData = response.data.data || response.data;
          if (Array.isArray(zonesData) && zonesData.length > 0) {
            console.log('✅ Successfully fetched zones from public endpoint:', zonesData);
            return zonesData;
          }
        }
      } catch (error) {
        console.log('Public zones endpoint failed:', error.message);
      }
      
      // 3. Try alternate endpoint
      try {
        const response = await api.get('/zones');
        if (response.data) {
          const zonesData = response.data.data || response.data;
          if (Array.isArray(zonesData) && zonesData.length > 0) {
            console.log('✅ Successfully fetched zones from alternate endpoint:', zonesData);
            return zonesData;
          }
        }
      } catch (error) {
        console.log('Alternate zones endpoint failed:', error.message);
      }
      
      // 4. Try direct axios call
      try {
        const response = await axios.get('http://localhost:5000/api/zones');
        if (response.data) {
          const zonesData = response.data.data || response.data;
          if (Array.isArray(zonesData) && zonesData.length > 0) {
            console.log('✅ Successfully fetched zones from direct call:', zonesData);
            return zonesData;
          }
        }
      } catch (error) {
        console.log('Direct zones call failed:', error.message);
      }
      
      // 5. Try mock data endpoint
      try {
        const response = await api.get('/api/mock/zones');
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          console.log('✅ Using mock zones data:', response.data);
          return response.data;
        }
      } catch (error) {
        console.log('Mock zones endpoint failed:', error.message);
      }
      
      // 6. If all else fails, return default zones
      console.log('⚠️ All zone fetching attempts failed, using default zones');
      return [
        { _id: 'north', name: 'North Zone', code: 'NZ' },
        { _id: 'south', name: 'South Zone', code: 'SZ' },
        { _id: 'east', name: 'East Zone', code: 'EZ' },
        { _id: 'west', name: 'West Zone', code: 'WZ' },
        { _id: 'central', name: 'Central Zone', code: 'CZ' }
      ];
    } catch (error) {
      console.error('❌ All zone fetching attempts failed:', error);
      return [
        { _id: 'north', name: 'North Zone', code: 'NZ' },
        { _id: 'south', name: 'South Zone', code: 'SZ' },
        { _id: 'east', name: 'East Zone', code: 'EZ' },
        { _id: 'west', name: 'West Zone', code: 'WZ' },
        { _id: 'central', name: 'Central Zone', code: 'CZ' }
      ];
    }
  };

  // Update the fetchZones function to use the new fetchZonesWithFallbacks function
  const fetchZones = async () => {
    try {
      console.log('Fetching zones data...');
      
      const fetchedZones = await fetchZonesWithFallbacks();
      
      // Normalize zone data
      const normalizedZones = fetchedZones.map(zone => ({
          _id: zone._id || zone.id || `zone-${Math.random().toString(36).substring(2, 9)}`,
          name: zone.name || zone.zoneName || 'Unknown Zone',
          ...zone
        }));
        
      console.log('Normalized zones:', normalizedZones);
      setZones(normalizedZones);
    } catch (error) {
      console.error('Error fetching zones:', error);
      // Set default zones if all fails
      const defaultZones = [
        { _id: 'north', name: 'North Zone' },
        { _id: 'south', name: 'South Zone' },
        { _id: 'east', name: 'East Zone' },
        { _id: 'west', name: 'West Zone' },
        { _id: 'central', name: 'Central Zone' }
      ];
      console.log('Using default zones due to error:', defaultZones);
      setZones(defaultZones);
    }
  };

  const fetchPendingWorkers = async () => {
    try {
      console.log('🔍 Fetching pending workers...');
      
      // Only attempt to fetch pending workers if user is admin
      if (!isAdmin) {
        console.log('User is not admin, skipping pending workers fetch');
        setPendingWorkers([]);
        return;
      }
      
      let retries = 0;
      const maxRetries = 3;
      let success = false;
      
      while (retries < maxRetries && !success) {
        try {
          // Add exponential backoff delay for retries
          if (retries > 0) {
            const delay = Math.pow(2, retries) * 1000; // 2s, 4s, 8s
            console.log(`⏱️ Retry ${retries}/${maxRetries}: waiting ${delay}ms before next attempt...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          
          // Try endpoint with workerStatus filter - ONLY using workers collection
          console.log('Trying to fetch pending workers with workerStatus=pending filter');
          const response = await api.get('/api/workers?workerStatus=pending');
          
          // Process response data
          const pendingData = Array.isArray(response.data) ? response.data : 
                            (response.data?.workers || response.data?.data || []);
          
          setPendingWorkers(pendingData);
          console.log(`Found ${pendingData.length} pending workers`);
          success = true;
          
        } catch (err) {
          retries++;
          console.error(`❌ Attempt ${retries}/${maxRetries} to fetch pending workers failed:`, err.message);
          
          // Check if rate limited
          if (err.response && err.response.status === 429) {
            console.log('⚠️ Rate limited! Adding longer delay...');
            // Add extra delay for rate limit errors
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
          
          if (retries >= maxRetries) {
            // If all retries failed, set empty array
            setPendingWorkers([]);
            throw err; // Re-throw if we've exhausted retries
          }
        }
      }
    } catch (error) {
      console.error('Error fetching pending workers:', error);
      setPendingWorkers([]);
      // Don't show toast for this error as it's not critical to the UI
    }
  };

  const generateUniqueEmployeeId = async () => {
    try {
      // All worker types use WRK prefix regardless of specific role
      const rolePrefix = 'WRK';
      const year = new Date().getFullYear().toString().slice(-2);
      
      // Direct API call to get the next ID from the database counter
      try {
        console.log('🔍 Requesting employee ID from server...');
        const response = await api.get('/users/next-employee-id');
        
        if (response.data?.employeeId) {
          console.log('✅ Received employee ID from server:', response.data.employeeId);
          return response.data.employeeId;
        }
        
        if (response.data?.nextId) {
          const formattedId = `${rolePrefix}-${year}-${response.data.nextId.toString().padStart(4, '0')}`;
          console.log('✅ Formatted ID from server counter:', formattedId);
          return formattedId;
        }
      } catch (error) {
        console.error('❌ Failed to get ID from server:', error.message);
      }
      
      // Fallback: Generate a random ID
      const randomId = Math.floor(1000 + Math.random() * 9000).toString().padStart(4, '0');
      const localId = `${rolePrefix}-${year}-${randomId}`;
      console.log('⚠️ Using locally generated ID:', localId);
      return localId;
    } catch (error) {
      console.error('❌ Error generating employee ID:', error);
      const randomId = Math.floor(1000 + Math.random() * 9000).toString().padStart(4, '0');
      const finalId = `WRK-${year}-${randomId}`;
      console.log('⚠️ Using emergency fallback ID:', finalId);
      return finalId;
    }
  };

  const handleAddWorker = async () => {
    const workerId = await generateUniqueEmployeeId();
    
    setFormData({
      name: '',
      email: '',
      phone: '',
      workerId: workerId,
      dateOfBirth: '',
      role: 'worker',
      workerType: 'collector',
      zone: '', // Start with empty zone so user must select one
      shift: 'morning',
      joinedDate: format(new Date(), 'yyyy-MM-dd'),
      emergencyContactName: '',
      emergencyContactPhone: '',
      certifications: [],
      workerStatus: 'pending' // Use workerStatus instead of status
    });
    setShowAddModal(true);
  };

  const handleEditWorker = (worker) => {
    // Extract all personal information from possible locations
    const personalInfo = worker.personalInfo || worker.workerDetails || {};
    
    // Emergency contact extraction
    const emergencyContact = personalInfo.emergencyContact || {};
    const emergencyContactName = emergencyContact.name || worker.emergencyContactName || '';
    const emergencyContactPhone = emergencyContact.phone || worker.emergencyContactPhone || '';
    const emergencyContactRelationship = emergencyContact.relationship || worker.emergencyContactRelationship || '';
    
    // Date of birth extraction and formatting
    let dateOfBirth = '';
    const dobSources = [
      personalInfo.dateOfBirth,
      worker.dateOfBirth,
      worker.workerDetails?.dateOfBirth
    ];
    
    for (const dob of dobSources) {
      if (dob) {
        try {
          const dobDate = new Date(dob);
          if (!isNaN(dobDate.getTime())) {
            dateOfBirth = format(dobDate, 'yyyy-MM-dd');
            break;
          }
        } catch (e) {
          console.error('Error parsing DOB:', e);
        }
      }
    }
    
    // Gender extraction
    const gender = personalInfo.gender || worker.gender || '';
    
    // Education extraction
    const education = personalInfo.education || worker.education || '';
    
    // Ensure shift is in the correct format for the form
    const formattedShift = worker.shift || 'morning';
    
    // Extract worker type
    const workerType = worker.workerType || 'collector';
    
    // Extract zone
    const zone = worker.zone || '';
    
    // Extract pincode - check all possible locations
    const pincode = worker.pincode || personalInfo.pincode || '';
    
    // Extract address - check all possible locations
    const address = worker.address || personalInfo.address || '';
    
    // Extract status
    const workerStatus = worker.workerStatus || worker.status || 'active';
    
    // Use workerId consistently
    const workerId = worker.workerId || worker._id || '';
    
    console.log('Setting data for editing:', { 
      workerId,
      emergencyContactName, 
      emergencyContactPhone,
      emergencyContactRelationship,
      dateOfBirth,
      address,
      pincode,
      workerType,
      workerStatus,
      zone,
      formattedShift
    });
    
    // Find zone object if we have zones loaded
    let zoneObject = null;
    if (zones && zones.length > 0 && zone) {
      zoneObject = zones.find(z => z._id === zone || z.name === zone);
      console.log('Found zone object:', zoneObject);
    }
    
    setFormData({
      ...worker,
      workerId: workerId, // Use workerId consistently
      workerType: workerType,
      shift: formattedShift,
      zone: zone,
      zoneName: zoneObject ? zoneObject.name : zone,
      dateOfBirth: dateOfBirth,
      joinedDate: worker.workerDetails?.joinedDate ? format(new Date(worker.workerDetails.joinedDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelationship,
      workerStatus: workerStatus, // Use workerStatus consistently instead of status
      status: workerStatus, // Include status for backward compatibility
      userId: workerId // Set userId = workerId for backward compatibility
    });
    setEditingWorker(worker);
    setShowAddModal(true);
    
    // Focus the zone dropdown when modal opens
    setTimeout(() => {
      const zoneSelect = document.getElementById('zone');
      if (zoneSelect) {
        zoneSelect.focus();
      }
    }, 300);
  };

  const handleDeleteWorker = async (workerId) => {
    if (window.confirm('Are you sure you want to delete this worker?')) {
      try {
        console.log(`🗑️ Attempting to delete worker with ID: ${workerId}`);
        
        // Set loading state or indicator if needed
        setLoading(true);
        
        // Try multiple endpoints for deleting
        let deleteSuccess = false;
        let lastError = null;
        
        // Define endpoints to try in order
        const endpoints = [
          `/api/workers/${workerId}`,
          `/api/users/${workerId}`,
          `/workers/${workerId}`
        ];
        
        // Try each endpoint until one succeeds
        for (const endpoint of endpoints) {
          try {
            console.log(`Attempting to delete worker using endpoint: ${endpoint}`);
            await api.delete(endpoint);
            console.log(`✅ Worker deleted successfully using endpoint: ${endpoint}`);
            deleteSuccess = true;
            break;
          } catch (error) {
            lastError = error;
            console.error(`Failed with endpoint ${endpoint}:`, error.message);
            
            // If this is NOT a 404 error, it might be a different issue worth stopping for
            if (error.response && error.response.status !== 404) {
              console.error(`Non-404 error with ${endpoint}:`, error.response.status, error.response.data);
              break;
            }
            
            // Otherwise continue to the next endpoint
            console.log(`404 Not Found with ${endpoint}, trying next endpoint...`);
          }
        }
        
        if (deleteSuccess) {
        toast.success('Worker deleted successfully');
          
          // Update local state to remove the worker
          setWorkers(prevWorkers => prevWorkers.filter(worker => worker._id !== workerId));
          setAllWorkers(prevWorkers => prevWorkers.filter(worker => worker._id !== workerId));
          
          // Refresh worker list
        fetchWorkers();
        } else {
          // If all endpoints failed
          console.error('All delete endpoints failed:', lastError);
          
          if (lastError?.response?.data?.message) {
            toast.error(`Failed to delete worker: ${lastError.response.data.message}`);
          } else {
            toast.error('Failed to delete worker. The worker may not exist or you may not have permission.');
          }
        }
      } catch (error) {
        console.error('Error deleting worker:', error);
        
        // More detailed error reporting
        if (error.response) {
          console.error('Error response:', {
            status: error.response.status,
            data: error.response.data,
            headers: error.response.headers
          });
          
          if (error.response.status === 403 || error.response.status === 401) {
            toast.error('You do not have permission to delete this worker');
          } else if (error.response.status === 404) {
            toast.error('Worker not found. It may have been already deleted.');
          } else {
            toast.error(`Failed to delete worker: ${error.response.data?.message || error.message}`);
          }
        } else {
          toast.error('Failed to delete worker. Please check your connection.');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  // Function to update a worker in the local state
  const updateWorkerInState = (updatedWorker) => {
    if (!updatedWorker || !updatedWorker._id) {
      console.error('Cannot update worker in state: Invalid worker data', updatedWorker);
      return;
    }
    
    console.log('🔄 Updating worker in local state:', updatedWorker._id);
    console.log('Worker status:', updatedWorker.workerStatus);
    
    // Check if this is a newly created worker (within the last 5 minutes)
    const isNewWorker = updatedWorker.createdAt && 
      (new Date().getTime() - new Date(updatedWorker.createdAt).getTime() < 5 * 60 * 1000);
    
    // For new workers, always enforce pending status
    const finalStatus = isNewWorker ? 'pending' : updatedWorker.workerStatus;
    
    if (isNewWorker) {
      console.log(`Worker ${updatedWorker.name || updatedWorker._id} is new, enforcing pending status`);
    }
    
    // Update the worker in the workers array
    setWorkers(prevWorkers => 
      prevWorkers.map(worker => 
        worker._id === updatedWorker._id ? { 
          ...worker, 
          ...updatedWorker,
          // Ensure status is preserved correctly
          workerStatus: finalStatus || worker.workerStatus || 'pending'
        } : worker
      )
    );
    
    // Also update in allWorkers to keep filters consistent
    setAllWorkers(prevWorkers => 
      prevWorkers.map(worker => 
        worker._id === updatedWorker._id ? { 
          ...worker, 
          ...updatedWorker,
          // Ensure status is preserved correctly
          workerStatus: finalStatus || worker.workerStatus || 'pending'
        } : worker
      )
    );
    
    console.log('✅ Worker updated in local state with status:', finalStatus);
  };

  const logWorkerUpdate = (worker, action) => {
    console.log(`🔄 ${action} worker:`, {
      id: worker._id,
      name: worker.name,
      email: worker.email,
      role: worker.role,
      normalizedRole: worker.normalizedRole,
      status: worker.status,
      timestamp: new Date().toISOString()
    });
  };

  // Add form validation function to validate required fields and formats
  const validateForm = () => {
    const errors = {};
    
    // Required fields based on UserSchema
    if (!formData.name) errors.name = "Name is required";
    if (!formData.email) errors.email = "Email is required";
    if (!formData.phone) errors.phone = "Phone number is required";
    if (!formData.zone) errors.zone = "Zone assignment is required";
    
    // Email format validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
    
    // Phone format validation
    if (formData.phone && !/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(formData.phone)) {
      errors.phone = "Please enter a valid phone number";
    }
    
    // Update form errors state
    setFormErrors(errors);
    
    // Log validation results
    if (Object.keys(errors).length > 0) {
      console.log('❌ Form validation failed:', errors);
    } else {
      console.log('✅ Form validation passed');
    }
    
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    try {
    e.preventDefault();
    
      console.log('🔍 Starting form validation...');
      
      // Validate form before proceeding
      if (!validateForm()) {
        console.log('Form validation failed, displaying errors to user:', formErrors);
        
        // Display specific error messages for each field
        Object.entries(formErrors).forEach(([field, message]) => {
          toast.error(`${field}: ${message}`);
        });
        
        // Also show a general error message
        toast.error('Please fix the form errors before submitting');
        return;
      }
      
      console.log('✅ Form validation passed, proceeding with submission');
      
      // Continue with form submission since validation passed
        const prepareFormData = () => {
            // Check if we're editing an existing worker
            const isEditMode = editingWorker !== null;
            
            // Make sure we have a valid workerId
            const workerId = formData.workerId || `WRK-${new Date().getFullYear().toString().slice(-2)}-${Math.floor(1000 + Math.random() * 9000)}`;
            
            // Map shift values to backend-compatible ones
            let normalizedShift = formData.shift;
            if (formData.shift === 'Morning (6AM-2PM)') normalizedShift = 'morning';
            if (formData.shift === 'Afternoon (2PM-10PM)') normalizedShift = 'afternoon';
            if (formData.shift === 'Night (10PM-6AM)') normalizedShift = 'night';
            
            // Process the dateOfBirth to ensure it's a valid date
            let dateOfBirth = null;
            if (formData.dateOfBirth) {
                try {
                    dateOfBirth = new Date(formData.dateOfBirth);
                    if (isNaN(dateOfBirth.getTime())) {
                        dateOfBirth = null;
                    }
                } catch (e) {
                    console.error('Error parsing date of birth:', e);
                    dateOfBirth = null;
                }
            }
            
            // Create a data object that exactly matches what the backend expects
            const data = {
                // Required fields for User schema
                workerId: workerId, // PRIMARY ID FIELD - use this consistently instead of userId
                name: formData.name,
                email: formData.email,
                phone: formData.phone || '',
                role: 'worker',
                
                // Worker-specific fields
                workerType: formData.workerType || 'collector',
                shift: normalizedShift || 'morning',
                joinedDate: formData.joinedDate || format(new Date(), 'yyyy-MM-dd'),
                
                // Status fields - set both for compatibility
                workerStatus: isEditMode ? formData.workerStatus || formData.status || 'active' : 'pending',
                status: isEditMode ? formData.workerStatus || formData.status || 'active' : 'pending',
                
                // Include default password for new workers
                password: !isEditMode ? 'worker@12345' : undefined,
                
                // Compatibility field - setting userId to workerId for backward compatibility
                userId: workerId,
                
                // Properly structure personal information
                personalInfo: {
                    dateOfBirth: dateOfBirth,
                    emergencyContact: {
                        name: formData.emergencyContactName || '',
                        phone: formData.emergencyContactPhone || '',
                        relationship: formData.emergencyContactRelationship || ''
                    },
                    education: formData.education || ''
                },
                
                // Also include worker details for backward compatibility
                workerDetails: {
                    dateOfBirth: dateOfBirth,
                    emergencyContact: {
                        name: formData.emergencyContactName || '',
                        phone: formData.emergencyContactPhone || '',
                        relationship: formData.emergencyContactRelationship || ''
                    },
                    // Include any other fields that might be needed
                    employeeId: workerId,
                    zone: formData.zone || ''
                },
                
                // Include flat fields for backward compatibility
                dateOfBirth: dateOfBirth,
                emergencyContactName: formData.emergencyContactName || '',
                emergencyContactPhone: formData.emergencyContactPhone || '',
                emergencyContactRelationship: formData.emergencyContactRelationship || ''
            };
            
            // Debug zone data before validation
            console.log('Zone debug - formData.zone:', formData.zone);
            console.log('Zone debug - typeof formData.zone:', typeof formData.zone);
            
            // Additional validation to ensure required fields are filled properly
            const errors = {};
            
            // Get zone value from formData (not data object)
            let zoneValue = '';
            if (formData.zone) {
              if (typeof formData.zone === 'object') {
                zoneValue = formData.zone._id || formData.zone.id || formData.zone;
              } else {
                zoneValue = formData.zone;
              }
            }
            
            // Ensure zone is included in the data object for submission
            data.zone = zoneValue;
            data.workerDetails.zone = zoneValue;
            
            if (!zoneValue || String(zoneValue).trim() === '') {
              errors.zone = 'Zone is required';
              console.error('Zone validation failed - value:', zoneValue);
            }
            
            if (Object.keys(errors).length > 0) {
                console.error('Missing required fields:', errors);
                // Set form errors
                setFormErrors(prev => ({ ...prev, ...errors }));
                // Update the global toast notification
                Object.entries(errors).forEach(([field, message]) => {
                    toast.error(`${field}: ${message}`);
                });
                throw new Error('Required fields missing');
            }
            
            console.log('📤 Prepared form data:', {
              workerId: data.workerId,
              zone: data.zone,
              isEditMode: isEditMode
            });
            
            return data;
        };
        
        // Debug log
        console.log('⏱️ Starting worker creation/update process...');
        console.log('📋 Raw form data:', formData);
        
        if (editingWorker) {
            // Update existing worker
            console.log('🔄 Updating existing worker...');
            
            try {
                const updateData = prepareFormData();

                console.log('📤 Sending update request:', {
                    workerId: editingWorker._id,
                    data: updateData
                });
                
                // Try worker endpoint first, then fall back to user endpoint if needed
                let response = null;
                let error = null;
                
                // Try worker endpoint first
                try {
                    response = await api.patch(`/api/workers/${editingWorker._id}`, updateData);
                } catch (workerError) {
                    error = workerError;
                    console.log('Worker update endpoint failed, trying user endpoint:', workerError.message);
                    
                    // Try user endpoint as fallback
                    try {
                        response = await api.patch(`/api/users/${editingWorker._id}`, updateData);
                    } catch (userError) {
                        error = userError;
                        console.error('User update endpoint also failed:', userError.message);
                    }
                }
                
                // Check if any of the update attempts succeeded
                if (response && (response.status === 200 || response.status === 201)) {
                    console.log('✅ Worker updated successfully:', response.data);
                    
                    // Close the modal and refresh the list
                    setShowAddModal(false);
                    setEditingWorker(null);
                    fetchWorkers();
                    
                    toast.success('Worker updated successfully');
                } else {
                    throw updateError || new Error('Failed to update worker');
                }
            } catch (updateError) {
                console.error('❌ Update failed:', updateError);
                console.error('Error response:', updateError.response?.data);
                console.error('Full error details:', {
                    status: updateError.response?.status,
                    statusText: updateError.response?.statusText,
                    data: updateError.response?.data,
                    message: updateError.message,
                    config: {
                        url: updateError.config?.url,
                        method: updateError.config?.method,
                        data: JSON.parse(updateError.config?.data || '{}')
                    }
                });
                
                // Show validation errors if available
                if (updateError.response?.data?.errors) {
                    const validationErrors = updateError.response.data.errors;
                    const errorMessages = Object.keys(validationErrors)
                        .map(key => `${key}: ${validationErrors[key]}`)
                        .join(', ');
                    
                    toast.error(`Validation errors: ${errorMessages}`);
                } else {
                    toast.error(`Failed to update worker: ${updateError.response?.data?.message || updateError.message}`);
                }
                
                throw updateError;
            }
        } else {
            // Create new worker
            console.log('🔄 Creating new worker...');
            
            try {
                const createData = prepareFormData();
                
                // Double check critical fields are present
                if (!createData.workerId) {
                    console.error('Missing required field: workerId');
                    toast.error('Missing required field: workerId');
                    return;
                }
                
                if (!createData.zone) {
                    console.error('Missing required field: zone');
                    toast.error('Missing required field: zone');
                    return;
                }
                
                // Log the final payload
                console.log('🔍 FINAL CREATE PAYLOAD:', createData);
                
                // Try worker endpoint first, then fall back to user endpoint if needed
                let response = null;
                let error = null;
                
                try {
                    // Send the request to the workers endpoint first
                    response = await api.post('/api/workers', createData);
                    console.log('✅ Worker created successfully via /api/workers endpoint');
                } catch (workerError) {
                    error = workerError;
                    console.error('❌ Failed to create worker via /api/workers:', workerError.message);
                    
                    // Check if this is a validation error (400 Bad Request)
                    if (workerError.response && workerError.response.status === 400) {
                        const errorData = workerError.response.data;
                        console.error('Validation errors:', errorData);
                        
                        // Show specific validation errors
                        if (errorData.errors) {
                            const formattedErrors = Object.entries(errorData.errors)
                                .map(([field, message]) => `${field}: ${message}`)
                                .join('\n');
                            toast.error(`Please fix the following errors:\n${formattedErrors}`, { duration: 5000 });
                            return;
                        }
                    }
                    
                    // If not a validation error or no specific errors provided, try users endpoint as fallback
                    try {
                        response = await api.post('/api/users', createData);
                        console.log('✅ Worker created successfully via /api/users endpoint');
                    } catch (userError) {
                        error = userError;
                        console.error('❌ Failed to create worker via /api/users too:', userError.message);
                        throw userError; // Re-throw to be caught by outer try-catch
                    }
                }
                
                if (response && (response.status === 200 || response.status === 201)) {
                    // Close the modal
                    setShowAddModal(false);
                    setEditingWorker(null);
                    
                    // Show success message
                    toast.success('Worker added successfully');
                    
                    // Refresh the worker list after a short delay
                setTimeout(() => {
                    fetchWorkers();
                }, 2000);
                }
            } catch (error) {
                console.error('❌ Worker creation failed:', error);
                
                // Log detailed error information
                if (error.response) {
                    console.error('Error response:', {
                        status: error.response.status,
                        data: error.response.data,
                        headers: error.response.headers
                    });
                    
                    // Show validation errors if available
                    if (error.response.data?.errors) {
                        const validationErrors = error.response.data.errors;
                        const errorMessages = Object.keys(validationErrors)
                            .map(key => `${key}: ${validationErrors[key]}`)
                            .join(', ');
                        
                        toast.error(`Validation errors: ${errorMessages}`);
                        
                        // Update form errors state with backend validation errors
                        const backendErrors = {};
                        Object.keys(validationErrors).forEach(key => {
                            backendErrors[key] = validationErrors[key];
                        });
                        setFormErrors(backendErrors);
                    } else if (error.response.data?.message) {
                        toast.error(`Error: ${error.response.data.message}`);
                    } else {
                        toast.error(`Error: ${error.message}`);
                    }
                } else {
                    toast.error(`Error: ${error.message}`);
                }
            }
        }
        
        fetchPendingWorkers(); // Refresh pending workers to update notification count
    } catch (error) {
        console.error('❌ Complete worker creation process failed:', error);
        console.error('Full error details:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message,
            config: error.config
        });
        
        const errorMessage = error.response?.data?.message || error.message || 'Failed to save worker';
        
        // Show validation errors if available
        if (error.response?.data?.errors) {
            const validationErrors = error.response.data.errors;
            const errorMessages = Object.keys(validationErrors)
                .map(key => `${key}: ${validationErrors[key]}`)
                .join(', ');
            
            toast.error(`Validation errors: ${errorMessages}`);
        } else {
            toast.error(errorMessage);
        }
    }
};

  const handleAcceptWorker = async (workerId) => {
    try {
      // Only allow admins to approve workers
      if (!isAdmin) {
        toast.error('Admin privileges required to approve workers');
        return;
      }
      
      // Use only workers collection endpoint
      console.log(`Approving worker with ID: ${workerId}`);
      const response = await api.patch(`/api/workers/${workerId}`, {
        workerStatus: 'inactive' // Set to inactive when approved
      });
      
      console.log('✅ Worker approved successfully');
      toast.success('Worker approved successfully. Worker status set to inactive.');
      fetchPendingWorkers();
      fetchWorkers(); // Refresh the main worker list too
    } catch (error) {
      console.error('Failed to approve worker:', error);
      toast.error('Failed to approve worker');
    }
  };

  const handleRejectWorker = async (workerId) => {
    try {
      // Only allow admins to reject workers
      if (!isAdmin) {
        toast.error('Admin privileges required to reject workers');
        return;
      }
      
      // Use only workers collection endpoint
      console.log(`Rejecting worker with ID: ${workerId}`);
      const response = await api.patch(`/api/workers/${workerId}`, {
        workerStatus: 'rejected'
      });
      
      console.log('✅ Worker rejected successfully');
      toast.success('Worker application rejected');
      fetchPendingWorkers();
      fetchWorkers(); // Refresh the main worker list too
    } catch (error) {
      console.error('Failed to reject worker:', error);
      toast.error('Failed to reject worker');
    }
  };

  const getWorkerStats = () => {
    const totalWorkers = workers.length;
    const activeWorkers = workers.filter(w => w.status === 'active').length;
    const avgRating = workers.length ? 
      (workers.reduce((sum, w) => sum + (w.rating || 0), 0) / totalWorkers).toFixed(1) : 
      '0.0';
    const tasksToday = workers.reduce((sum, w) => sum + (w.tasksToday || 0), 0);

    return {
      totalWorkers,
      activeWorkers,
      avgRating,
      tasksToday
    };
  };

  const getStatusColor = (status) => {
    if (!status) return 'neutral';
    
    switch (status.toLowerCase()) {
      case 'active': return 'success';
      case 'available': return 'available';
      case 'onLeave': case 'on-leave': return 'warning';
      case 'inactive': case 'off-duty': return 'neutral';
      case 'pending': return 'pending';
      case 'suspended': return 'danger';
      case 'rejected': return 'danger';
      default: return 'neutral';
    }
  };

  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const handleContactModalOpen = (worker) => {
    setSelectedWorker(worker);
    setShowContactModal(true);
  };

  const handleContactModalClose = () => {
    setShowContactModal(false);
    setSelectedWorker(null);
    setContactForm({
      method: 'email',
      priority: 'normal',
      subject: '',
      message: '',
      attachments: []
    });
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    
    if (!contactForm.subject.trim() || !contactForm.message.trim()) {
      toast.error('Please provide both subject and message');
      return;
    }
    
    try {
      // Mock API call - replace with actual API integration
      // await api.post(`/users/${selectedWorker._id}/contact`, contactForm);
      
      toast.success(`Message sent to ${selectedWorker?.name}`);
      handleContactModalClose();
    } catch (error) {
      toast.error('Failed to send message');
      console.error('Error sending message:', error);
    }
  };

  const handleAttachmentAdd = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // For UI demo purposes, just use the file names
      setContactForm({
        ...contactForm,
        attachments: [...contactForm.attachments, ...files.map(file => file.name)]
      });
    }
    // Reset the input
    e.target.value = '';
  };

  const handleAttachmentRemove = (index) => {
    const newAttachments = [...contactForm.attachments];
    newAttachments.splice(index, 1);
    setContactForm({
      ...contactForm,
      attachments: newAttachments
    });
  };

  // Simplified dropdown toggle with timeout
  const toggleDropdown = (workerId) => {
    if (activeDropdown === workerId) {
      setActiveDropdown(null);
    } else {
      setTimeout(() => {
        setActiveDropdown(workerId);
      }, 10);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      // If click is outside dropdown and not on the toggle button
      if (activeDropdown && 
          !event.target.closest('.dropdown-menu') && 
          !event.target.closest('.more-actions-btn')) {
        setActiveDropdown(null);
      }
    }

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Cleanup the event listener
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown]);

  const handleViewWorker = (workerId) => {
    navigate(`/management/workers/${workerId}`, { 
      state: { 
        showTabs: true,
        tabData: {
          tracking: {
            enabled: true,
            realTimeLocation: true,
            geofencing: true
          },
          scheduling: {
            enabled: true,
            shifts: true,
            calendar: true
          },
          analytics: {
            enabled: true,
            performance: true,
            comparison: true
          },
          communication: {
            enabled: true,
            messaging: true,
            announcements: true
          },
          compliance: {
            enabled: true,
            certifications: true,
            training: true
          }
        }
      } 
    });
  };

  // Format shift values for display
  const formatShiftForDisplay = (shift) => {
    switch(shift?.toLowerCase()) {
      case 'morning': return 'Morning (6AM-2PM)';
      case 'afternoon': return 'Afternoon (2PM-10PM)';
      case 'night': return 'Night (10PM-6AM)';
      default: return shift || 'Unassigned';
    }
  };

  // Add a helper function to update worker status consistently across the app
  const updateWorkerStatusInState = (workerId, newStatus) => {
    // Helper function to consistently update a worker object
    const updateWorker = (worker) => {
      if ((worker._id === workerId) || (worker.id === workerId)) {
        return {
          ...worker,
          // Update status directly in the workerStatus field
          workerStatus: newStatus
        };
      }
      return worker;
    };
    
    // Update workers list
    setWorkers(prevWorkers => prevWorkers.map(updateWorker));
    
    // Update allWorkers list to maintain filter consistency
    setAllWorkers(prevWorkers => prevWorkers.map(updateWorker));
  };

  // Improved handleQuickStatusChange function
  const handleQuickStatusChange = async (worker, newStatus) => {
    try {
      // Set active status update for UI feedback
      setActiveStatusUpdate(`${worker._id}-${newStatus}`);
      
      if (newStatus === 'approved') {
        // Set approved workers to inactive status by default
        await handleAcceptWorker(worker._id);
        // Update local state to inactive
        updateWorkerStatusInState(worker._id, 'inactive');
      } else if (newStatus === 'rejected') {
        await handleRejectWorker(worker._id);
      } else {
        // For regular status updates
        const updateData = {
          workerStatus: newStatus
        };
        
        // Use only workers collection endpoint
        console.log(`Updating worker status to ${newStatus}`);
        await api.patch(`/api/workers/${worker._id}`, updateData);
        
        // Update local state
        updateWorkerStatusInState(worker._id, newStatus);
        
        toast.success(`Worker status updated to ${newStatus}`);
      }
      
      // Clear status update indicator after a delay
      setTimeout(() => {
        setActiveStatusUpdate(null);
      }, 1000);
      
      // Refresh worker list
      fetchWorkers();
    } catch (error) {
      console.error('Error updating worker status:', error);
      toast.error('Failed to update worker status');
      setActiveStatusUpdate(null);
    }
  };

  // Add function to handle zone assignment
  const handleZoneAssignment = async (worker) => {
    // Fetch zones if we don't have any yet
    if (!zones || zones.length === 0) {
      console.log('No zones loaded, fetching zones first...');
      await fetchZones();
    }
    
    // Pre-populate with worker's current zone
    setFormData({
      ...worker,
      zone: worker.zone || '',
      zoneName: worker.zoneName || ''
    });
    
    // Open edit modal with zone tab focused
    setEditingWorker(worker);
    setShowAddModal(true);
    
    // Focus the zone dropdown when modal opens
    setTimeout(() => {
      const zoneSelect = document.getElementById('zone');
      if (zoneSelect) {
        zoneSelect.focus();
      }
    }, 300);
  };

  // Update handleSearch to work with the new filtering approach
  const handleSearch = (e) => {
    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Update the search term
    setSearchTerm(e.target.value);
    
    // The filtering will happen automatically in the useEffect hook
    // that watches searchTerm as a dependency
  };

  // Add a ref for debouncing search
  const searchTimeoutRef = useRef(null);

  return (
    <div className="management-container">
      <div className="management-content">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>Worker Management</h1>
            <p className="subtitle">
              Manage your workforce performance and operational status
              {isAdmin && (
                <span className="admin-badge">
                  <Shield size={14} />
                  <span>Admin Access</span>
                </span>
              )}
            </p>
        </div>
        <div className="header-actions">
            {pendingWorkers.length > 0 && (
              <button 
                className="notification-btn" 
                onClick={() => setShowPendingModal(true)}
                title={`${pendingWorkers.length} pending worker applications`}
              >
                <Bell size={20} className={pendingWorkers.length > 0 ? "animate-bell" : ""} />
                <span className="notification-badge">{pendingWorkers.length}</span>
              </button>
            )}
            
            {/* Debug buttons for development only */}
            {isAdmin && process.env.NODE_ENV !== 'production' && (
              <button 
                className="refresh-btn" 
                onClick={async () => {
                  try {
                    toast.loading('Fixing worker passwords...');
                    const result = await api.fixWorkerPasswords();
                    toast.dismiss();
                    
                    if (result.success) {
                      toast.success(`${result.message}`);
                    } else {
                      toast.error(`Failed: ${result.message}`);
                    }
                  } catch (error) {
                    toast.dismiss();
                    toast.error('Error running password fix utility');
                    console.error(error);
                  }
                }}
                aria-label="Fix Worker Passwords"
                title="Fix Worker Passwords - Development Tool"
                style={{ backgroundColor: '#fff0f0', marginRight: '8px' }}
              >
                <Shield size={16} />
              </button>
            )}
            
          <div className="view-toggle">
            <button 
              className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
                aria-label="Grid view"
                title="Grid view"
            >
              <GridIcon size={20} />
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
                aria-label="Table view"
                title="Table view"
            >
              <ListIcon size={20} />
            </button>
          </div>
            <button 
              className="add-worker-btn" 
              onClick={handleAddWorker}
              disabled={!isAdmin && workers.length > 0}
              title={!isAdmin && workers.length > 0 ? "Admin privileges required to add workers" : "Add new worker"}
            >
              <UserPlus size={18} />
              Add Worker
              {!isAdmin && workers.length > 0 && <span className="admin-required">Admin Only</span>}
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="stats-grid">
          {loading ? (
            <SkeletonLoader type="stat" count={4} />
          ) : (
            <>
        <div className="stat-card">
          <div className="stat-icon">
                  <Users size={20} />
          </div>
          <div className="stat-info">
            <p className="stat-value">{workers.length}</p>
            <h3>Total Workers</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
                  <CheckCircle size={20} />
          </div>
          <div className="stat-info">
            <p className="stat-value">{workers.filter(w => w.workerStatus === 'active').length}</p>
            <h3>Active Now</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
                  <Star size={20} />
          </div>
          <div className="stat-info">
            <p className="stat-value">{workers.length ? 
              (workers.reduce((sum, w) => sum + (w.performance?.rating || w.rating || w.workerDetails?.rating || 0), 0) / workers.length).toFixed(1) : 
              '0.0'}/5.0</p>
            <h3>Avg. Rating</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
                  <Calendar size={20} />
          </div>
          <div className="stat-info">
            <p className="stat-value">{workers.reduce((sum, w) => sum + (w.tasksToday || 0), 0)}</p>
            <h3>Tasks Today</h3>
          </div>
        </div>
            </>
          )}
      </div>

      {/* Search and Filters */}
      <div className="controls-section">
          <div className="search-filter-container">
        <div className="search-bar">
              <Search size={18} color="#666" />
          <input
            type="text"
                placeholder="Search workers by name, ID, or role..."
            value={searchTerm}
            onChange={handleSearch}
          />
              {searchTerm && (
                <button 
                  className="clear-search" 
                  onClick={() => { 
                    setSearchTerm(''); 
                    fetchWorkers(); 
                  }}
                  aria-label="Clear search"
                >
                  <XCircle size={16} />
                </button>
              )}
          </div>

            <button 
              className="refresh-btn" 
              onClick={fetchWorkers}
              aria-label="Refresh data"
              title="Refresh data"
            >
              <RefreshCw size={16} />
            </button>
            
            <button 
              className="refresh-btn" 
              onClick={() => {
                fetchZones();
                setTimeout(() => {
                  alert(`Zones loaded: ${zones.length}\n${zones.map(z => `${z._id}: ${z.name}`).join('\n')}`);
                }, 1000);
              }}
              aria-label="Debug Zones"
              title="Debug Zones"
              style={{ backgroundColor: '#f0f4ff', marginLeft: '4px' }}
            >
              <MapPin size={16} />
            </button>
          </div>

          <div className="filters-wrapper">
            <h3 className="filters-title">
              <Filter size={16} />
              <span>Filter Workers</span>
            </h3>
            
            <div className="filters-group">
              {Object.entries(filterOptions).map(([key, options]) => (
                <div className="filter-select" key={key}>
                  <label htmlFor={`${key}-filter`}>{key === 'sortBy' ? 'Sort By' : key.charAt(0).toUpperCase() + key.slice(1)}</label>
            <select
                    id={`${key}-filter`}
                    value={filters[key]}
                    onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
                  >
                    {options.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
            </select>
          </div>
              ))}
              
              <button 
                className="clear-filters-btn"
                onClick={() => {
                  // Reset all filters to default values
                  const defaultFilters = {
                    status: 'all',
                    role: 'all',
                    zone: 'all',
                    sortBy: 'name-asc'
                  };
                  
                  // Clear search term if there is one
                  setSearchTerm('');
                  
                  // Set the filters back to default
                  setFilters(defaultFilters);
                  
                  // Show all workers immediately without waiting for the filter effect
                  if (allWorkers && allWorkers.length > 0) {
                    setWorkers([...allWorkers]);
                  } else {
                    // If allWorkers is empty, try to fetch them again
                    fetchWorkers();
                  }
                }}
                title="Clear all filters"
              >
                Clear Filters
              </button>
          </div>
        </div>
      </div>

      {/* Workers List/Grid */}
      {loading ? (
          viewMode === 'grid' ? (
            <div className="workers-grid">
              <SkeletonLoader type="card" count={4} />
        </div>
          ) : (
            <div className="table-container">
              <table className="management-table">
                <thead>
                  <tr>
                    <th>Worker</th>
                    <th>Contact</th>
                    <th>Zone</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Tasks</th>
                    <th>Rating</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <SkeletonLoader type="table-row" count={5} />
                </tbody>
              </table>
            </div>
          )
      ) : workers.length === 0 ? (
        <div className="empty-state">
            <Users size={40} />
          <h3>No workers found</h3>
          <p>Try adjusting your filters or add a new worker</p>
          <button className="add-worker-btn" onClick={handleAddWorker}>
              <UserPlus size={18} />
              Add Worker
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="workers-grid">
          {workers.map(worker => (
              <div 
                key={worker._id || worker.id} 
                className="worker-card shadow-md rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
                data-worker-id={worker._id || worker.id}
              >
              <div className="worker-card-header bg-gradient-to-r from-blue-50 to-gray-50 p-3 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="worker-avatar relative">
                  {worker.avatar ? (
                      <img 
                        src={worker.avatar} 
                        alt={worker.name} 
                        className="h-12 w-12 rounded-full object-cover border-2 border-white"
                      />
                    ) : (
                      <span className="initials flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-700 font-medium text-lg border-2 border-white">
                        {getInitials(worker.name)}
                      </span>
                  )}
                    <span 
                      className={`status-indicator absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${getStatusColor(worker.workerStatus)}`} 
                      title={worker.workerStatus || 'Status unknown'} 
                    />
                </div>
                <div className="worker-info">
                    <h3 className="text-lg font-medium text-gray-900" title={worker.name}>{worker.name}</h3>
                    <p className="worker-id text-sm text-gray-500">
                      {worker.workerId || <span className="placeholder-text italic">ID Pending</span>}
                    </p>
                    <div className={`status-badge inline-flex items-center px-2 py-0.5 mt-1 rounded-full text-xs font-medium ${
                      worker.workerStatus === 'active' ? 'bg-green-100 text-green-800' :
                      worker.workerStatus === 'inactive' ? 'bg-gray-100 text-gray-800' :
                      worker.workerStatus === 'onLeave' ? 'bg-yellow-100 text-yellow-800' :
                      worker.workerStatus === 'suspended' ? 'bg-red-100 text-red-800' :
                      worker.workerStatus === 'pending' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {worker.workerStatus || 'Unknown'}
                    </div>
                  </div>
                </div>
                  <div className="dropdown-container" ref={dropdownRef}>
                    <button 
                    className="more-actions-btn p-1 rounded-full hover:bg-gray-200" 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDropdown(worker._id || worker.id);
                      }}
                    >
                      <MoreVertical size={18} />
                </button>

                    {activeDropdown === (worker._id || worker.id) && (
                    <div className="dropdown-menu absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                      <div className="py-1">
                        <button 
                          className="dropdown-item flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => {
                            handleViewWorker(worker._id || worker.id);
                            setActiveDropdown(null);
                          }}
                        >
                          <Eye size={16} className="mr-2" />
                          <span>View Profile</span>
                        </button>
                        <button 
                          className="dropdown-item flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => {
                            handleEditWorker(worker);
                            setActiveDropdown(null);
                          }}
                        >
                          <Edit2 size={16} className="mr-2" />
                          <span>Edit Worker</span>
                        </button>
                        
                            <button 
                          className="dropdown-item flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => {
                            handleContactModalOpen(worker);
                            setActiveDropdown(null);
                          }}
                        >
                          <Mail size={16} className="mr-2" />
                          <span>Send Email</span>
                        </button>
                        <button 
                          className="dropdown-item flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => {
                            window.open(`tel:${worker.phone}`);
                            setActiveDropdown(null);
                          }}
                        >
                          <Phone size={16} className="mr-2" />
                          <span>Call Worker</span>
                        </button>
                        <button 
                          className="dropdown-item flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete ${worker.name}?`)) {
                              handleDeleteWorker(worker._id || worker.id);
                            }
                            setActiveDropdown(null);
                          }}
                        >
                          <Trash2 size={16} className="mr-2" />
                          <span>Delete Worker</span>
                </button>
                      </div>
                      </div>
                    )}
                  </div>
              </div>

              <div className="worker-card-body p-3 space-y-3">
                <div className="contact-info space-y-1.5">
                  <a href={`mailto:${worker.email}`} className="contact-link flex items-center text-sm text-gray-600 hover:text-blue-600" title="Send email">
                    <Mail size={14} className="mr-2" />
                    <span className="contact-text truncate">{worker.email}</span>
                  </a>
                  <a href={`tel:${worker.phone}`} className="contact-link flex items-center text-sm text-gray-600 hover:text-blue-600" title="Call">
                    <Phone size={14} className="mr-2" />
                      <span className="contact-text">{worker.phone}</span>
                  </a>
                </div>

                <div className="work-info space-y-1.5 border-t border-gray-100 pt-2">
                  <div className="info-item flex items-center text-sm">
                    <UserIcon size={14} className="mr-2 text-gray-500" />
                    <div>
                      <span className="font-medium text-gray-700">
                        {worker.workerType ? worker.workerType.charAt(0).toUpperCase() + worker.workerType.slice(1) : 'Collector'}
                    </span>
                  </div>
                  </div>
                  <div className="info-item flex items-center text-sm">
                    <MapPin size={14} className="mr-2 text-gray-500" />
                      <span>
                      {worker.zone ? (
                        <span className="text-gray-700">
                          {zones.find(z => z._id === worker.zone || z.name === worker.zone)?.name || 'Not Assigned'}
                        </span>
                      ) : (
                        <span className="text-gray-500 italic">Not Assigned</span>
                        )}
                      </span>
                  </div>
                  <div className="info-item flex items-center text-sm">
                    <Clock size={14} className="mr-2 text-gray-500" />
                    <span className="text-gray-700">
                        {formatShiftForDisplay(worker.shift)}
                      </span>
                  </div>
                </div>

                {/* Status action buttons for pending workers */}
                {worker.workerStatus === 'pending' && isAdmin && (
                  <div className="status-actions flex gap-2 border-t border-gray-100 pt-2">
                      <button 
                      className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 py-1.5 px-3 rounded-md text-sm font-medium flex items-center justify-center"
                      onClick={() => handleQuickStatusChange(worker, 'approved')}
                    >
                      <CheckCircle size={14} className="mr-1.5" />
                        <span>Approve</span>
                      </button>
                      <button 
                      className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 py-1.5 px-3 rounded-md text-sm font-medium flex items-center justify-center"
                      onClick={() => handleQuickStatusChange(worker, 'rejected')}
                    >
                      <XCircle size={14} className="mr-1.5" />
                        <span>Reject</span>
                      </button>
                </div>
                )}
                
                {/* Action buttons at the bottom */}
                <div className="worker-card-footer border-t border-gray-100 pt-2 mt-2 flex items-center justify-between">
                  <button 
                    className="action-btn flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium py-1 px-2" 
                    onClick={() => handleViewWorker(worker._id || worker.id)}
                    title="View profile"
                  >
                    <Eye size={14} className="mr-1" />
                    <span>View</span>
                </button>
                  <button 
                    className="action-btn flex items-center text-sm text-gray-600 hover:text-gray-800 font-medium py-1 px-2" 
                    onClick={() => handleEditWorker(worker)}
                    title="Edit worker"
                  >
                    <Edit2 size={14} className="mr-1" />
                    <span>Edit</span>
                </button>
                  <button 
                    className="action-btn flex items-center text-sm text-gray-600 hover:text-gray-800 font-medium py-1 px-2" 
                    onClick={() => handleContactModalOpen(worker)}
                    title="Contact worker"
                  >
                    <MessageSquare size={14} className="mr-1" />
                    <span>Contact</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="table-container">
          <table className="management-table">
            <thead>
              <tr>
                <th>Worker</th>
                <th>Contact</th>
                <th>Zone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Tasks</th>
                <th>Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {workers.map(worker => (
                  <tr key={worker._id || worker.id}>
                  <td>
                    <div className="worker-cell">
                      <div className="worker-avatar small">
                        {worker.avatar ? (
                          <img src={worker.avatar} alt={worker.name} />
                        ) : (
                          <span>{getInitials(worker.name)}</span>
                        )}
                          <span 
                          className={`status-indicator ${getStatusColor(worker.workerStatus)}`} 
                          title={worker.workerStatus || 'Status unknown'} 
                          />
                      </div>
                      <div className="worker-basic-info">
                        <span className="name">{worker.name}</span>
                          <span className="id">{worker.workerId || 'ID Pending'}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="contact-cell">
                      <a href={`mailto:${worker.email}`}>{worker.email}</a>
                      <a href={`tel:${worker.phone}`}>{worker.phone}</a>
                    </div>
                  </td>
                  <td>
                    {worker.zone ? (
                      <span>{worker.zone}</span>
                    ) : (
                      <button 
                        className="zone-assign-btn"
                        onClick={() => handleZoneAssignment(worker)}
                        title="Click to assign a zone"
                      >
                        Assign Zone
                      </button>
                    )}
                  </td>
                  <td>
                      <div className="role-hierarchy">
                        <span className="main-role">Worker</span>
                        <span className="worker-type">{worker.workerType || 'Collector'}</span>
                      </div>
                  </td>
                  <td>
                    <div className="status-badge" data-status={getStatusColor(worker.workerStatus)}>
                      {worker.workerStatus || 'Unknown'}
                    </div>
                  </td>
                  <td>
                    <div className="tasks-cell">
                        <span className="tasks-count">
                          {worker.tasksCompleted || 0}/{worker.tasksTotal || 0}
                        </span>
                      <div className="progress-bar">
                        <div 
                          className="progress" 
                          style={{ 
                              width: `${worker.tasksCompleted && worker.tasksTotal ? 
                                Math.min(100, (worker.tasksCompleted / worker.tasksTotal) * 100) : 0}%` 
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="rating-cell">
                        <Star size={14} className="star-icon" />
                        <span>{worker.rating || '0.0'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                          className="action-btn primary" 
                          onClick={() => handleViewWorker(worker._id || worker.id)}
                          title="View profile"
                        >
                          <Eye size={14} />
                          <span>View</span>
                      </button>
                      <button 
                        className="action-btn"
                        onClick={() => handleEditWorker(worker)}
                          title="Edit worker"
                      >
                          <Edit2 size={14} />
                      </button>
                      <button 
                        className="action-btn danger"
                          onClick={() => handleDeleteWorker(worker._id || worker.id)}
                          title="Delete worker"
                      >
                          <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
      
      {/* Pending Workers Modal */}
      {showPendingModal && (
        <div className="modal-overlay">
          <div className="modal large">
            <div className="modal-header">
              <h2>Pending Worker Applications</h2>
              <button className="close-btn" onClick={() => setShowPendingModal(false)}>×</button>
            </div>
            <div className="pending-workers-container">
              {pendingWorkers.length === 0 ? (
                <div className="empty-state">
                  <CheckCircle size={40} />
                  <h3>No pending applications</h3>
                  <p>All worker applications have been processed</p>
                </div>
              ) : (
                <div className="pending-workers-list">
                  {pendingWorkers.map(worker => (
                    <div className="pending-worker-card" key={worker._id}>
                      <div className="pending-worker-info">
                        <div className="pending-worker-avatar">
                          {worker.avatar ? (
                            <img src={worker.avatar} alt={worker.name} />
                          ) : (
                            <span className="initials">{getInitials(worker.name)}</span>
                          )}
                        </div>
                        <div className="pending-worker-details">
                          <h3>{worker.name}</h3>
                          <p className="worker-email">{worker.email}</p>
                          <p className="worker-phone">{worker.phone}</p>
                          <p className="signup-date">Applied: {format(new Date(worker.createdAt), 'PPP')}</p>
                        </div>
                      </div>
                      <div className="pending-worker-actions">
                        <button 
                          className="accept-btn" 
                          onClick={() => handleAcceptWorker(worker._id)}
                        >
                          <UserCheck size={16} />
                          <span>Accept</span>
                        </button>
                        <button 
                          className="reject-btn"
                          onClick={() => handleRejectWorker(worker._id)}
                        >
                          <UserX size={16} />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Worker Modal */}
      <WorkerModal
        show={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingWorker(null);
          setFormErrors({});  // Clear form errors when closing modal
        }}
        worker={editingWorker}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        zones={zones}
        formErrors={formErrors}
        setFormErrors={setFormErrors}
      />
      
      {/* Contact Worker Modal */}
      {showContactModal && selectedWorker && (
        <div className="modal-overlay">
          <div className="modal large contact-modal">
            <div className="modal-header contact-header">
              <h2><MessageSquare size={20} className="contact-icon" /> Contact Worker</h2>
              <button className="close-btn" onClick={handleContactModalClose}>×</button>
            </div>
            <div className="contact-modal-content">
              <div className="recipient-card">
                <div className="recipient-avatar">
                  {selectedWorker.avatar ? (
                    <img src={selectedWorker.avatar} alt={selectedWorker.name} />
                  ) : (
                    <span>{getInitials(selectedWorker.name)}</span>
                  )}
                  <span className={`status-indicator ${getStatusColor(selectedWorker.workerStatus || selectedWorker.status)}`} />
                </div>
                <div className="recipient-details">
                  <h3>{selectedWorker.name}</h3>
                  <p className="recipient-id">{selectedWorker.workerId || 'ID Pending'}</p>
                  <div className="recipient-badges">
                    <span className="role-badge">{selectedWorker.role || 'Worker'}</span>
                  </div>
                </div>
                <div className="recipient-contact-info">
                  <a href={`mailto:${selectedWorker.email}`} className="contact-link">
                    <Mail size={14} />
                    <span>{selectedWorker.email}</span>
                  </a>
                  <a href={`tel:${selectedWorker.phone}`} className="contact-link">
                    <Phone size={14} />
                    <span>{selectedWorker.phone}</span>
                  </a>
                </div>
              </div>
              
              <form className="contact-form" onSubmit={handleContactSubmit}>
                <div className="form-section">
                  <h3 className="form-section-title">Message Details</h3>
                  <div className="form-row-split">
                    <div className="form-group message-type">
                      <label>Contact Method</label>
                      <div className="option-buttons">
                        <button 
                          type="button"
                          className={`option-btn ${contactForm.method === 'email' ? 'active' : ''}`}
                          onClick={() => setContactForm({...contactForm, method: 'email'})}
                        >
                          <Mail size={16} />
                          <span>Email</span>
                        </button>
                        <button 
                          type="button"
                          className={`option-btn ${contactForm.method === 'sms' ? 'active' : ''}`}
                          onClick={() => setContactForm({...contactForm, method: 'sms'})}
                        >
                          <MessageSquare size={16} />
                          <span>SMS</span>
                        </button>
                        <button 
                          type="button"
                          className={`option-btn ${contactForm.method === 'app' ? 'active' : ''}`}
                          onClick={() => setContactForm({...contactForm, method: 'app'})}
                        >
                          <AlertOctagon size={16} />
                          <span>App Alert</span>
                        </button>
                      </div>
                    </div>
                    
                    <div className="form-group message-priority">
                      <label>Priority</label>
                      <div className="option-buttons">
                        <button 
                          type="button"
                          className={`option-btn ${contactForm.priority === 'normal' ? 'active' : ''}`}
                          data-priority="normal"
                          onClick={() => setContactForm({...contactForm, priority: 'normal'})}
                        >
                          <span>Normal</span>
                        </button>
                        <button 
                          type="button"
                          className={`option-btn ${contactForm.priority === 'important' ? 'active' : ''}`}
                          data-priority="important"
                          onClick={() => setContactForm({...contactForm, priority: 'important'})}
                        >
                          <span>Important</span>
                        </button>
                        <button 
                          type="button"
                          className={`option-btn ${contactForm.priority === 'urgent' ? 'active' : ''}`}
                          data-priority="urgent"
                          onClick={() => setContactForm({...contactForm, priority: 'urgent'})}
                        >
                          <span>Urgent</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="subject">Subject</label>
                    <input
                      type="text"
                      id="subject"
                      className="message-input"
                      placeholder="Enter subject..."
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="message">Message</label>
                    <textarea
                      id="message"
                      className="message-input"
                      placeholder="Type your message here..."
                      value={contactForm.message}
                      onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                      required
                    ></textarea>
                    <div className={`character-count ${contactForm.message.length > 500 ? 'warning' : ''}`}>
                      {contactForm.message.length}/500 characters
                    </div>
                  </div>
                </div>
                
                <div className="form-section attachment-section">
                  <h3 className="form-section-title">Attachments</h3>
                  <div className="attachment-controls">
                    <label className="attachment-btn">
                      <Paperclip size={16} />
                      <span>Add Attachment</span>
                      <input 
                        type="file" 
                        style={{ display: 'none' }} 
                        onChange={handleAttachmentAdd}
                        multiple
                      />
                    </label>
                    <span className="attachment-count">
                      {contactForm.attachments.length} {contactForm.attachments.length === 1 ? 'file' : 'files'} attached
                    </span>
                  </div>
                  
                  {contactForm.attachments.length > 0 && (
                    <div className="attachment-list">
                      {contactForm.attachments.map((file, index) => (
                        <div key={index} className="attachment-item">
                          <Paperclip size={14} />
                          <span className="attachment-name">{file}</span>
                          <button 
                            type="button" 
                            className="remove-attachment"
                            onClick={() => handleAttachmentRemove(index)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={handleContactModalClose}>
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn">
                    <Send size={16} />
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Add this modal component below the main component
// Worker Add/Edit Modal
const WorkerModal = ({ show, onClose, worker, formData, setFormData, onSubmit, zones, formErrors, setFormErrors }) => {
  if (!show) return null;
  
  const isEditing = Boolean(worker);
  
  // This validateForm function just calls the parent component's validateForm function
  // which is called via onSubmit
  const validateForm = () => {
    const errors = {};
    
    // Required fields based on UserSchema
    if (!formData.name) errors.name = "Name is required";
    if (!formData.email) errors.email = "Email is required";
    if (!formData.phone) errors.phone = "Phone number is required";
    if (!formData.zone) errors.zone = "Zone assignment is required";
    
    // Email format validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
    
    // Phone format validation
    if (formData.phone && !/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(formData.phone)) {
      errors.phone = "Please enter a valid phone number";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmitWithValidation = (e) => {
    e.preventDefault();
    // Directly call the parent's onSubmit which includes validation
    onSubmit(e);
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for workerStatus field - always keep as 'pending' for new workers
    if (name === 'workerStatus' && !isEditing) {
      return; // Don't allow status changes for new workers
    }
    
    // Special handling for zone selection
    if (name === 'zone') {
      console.log('Zone selected:', value);
      
      // Find the selected zone object
      const selectedZone = zones.find(z => z._id === value || z.name === value);
      console.log('Selected zone object:', selectedZone);
      
      setFormData({ 
        ...formData, 
        [name]: value,
        // Store zone name for display purposes
        zoneName: selectedZone ? selectedZone.name : value
      });
      
      // Clear any error for this field
      if (formErrors[name]) {
        setFormErrors({
          ...formErrors,
          [name]: undefined
        });
      }
      
      return;
    }
    
    // Allow empty address and pincode to be saved
    // This fixes the issue where typing over defaults resets back to default values
    setFormData({ ...formData, [name]: value });
    
    // Clear any error for this field when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: undefined
      });
    }
  };
  
  // Ensure zones is always an array
  const safeZones = Array.isArray(zones) ? zones : [];
  
  // Ensure all form values are defined to prevent controlled/uncontrolled input warnings
  // But DON'T set default values that will override user input
  const safeFormData = {
    name: formData.name || '',
    email: formData.email || '',
    phone: formData.phone || '',
    workerId: formData.workerId || '',
    dateOfBirth: formData.dateOfBirth || '',
    role: formData.role || 'worker',
    workerType: formData.workerType || 'collector',
    zone: formData.zone || '', // Don't set default zone that overrides user selection
    shift: formData.shift || 'morning',
    joinedDate: formData.joinedDate || format(new Date(), 'yyyy-MM-dd'),
    emergencyContactName: formData.emergencyContactName || '',
    emergencyContactPhone: formData.emergencyContactPhone || '',
    // Use workerStatus consistently instead of status
    workerStatus: isEditing ? (formData.workerStatus || formData.status || 'active') : 'pending'
  };
  
  // Map worker types to display names
  const workerTypeOptions = [
    { value: 'collector', label: 'Collector' },
    { value: 'driver', label: 'Driver' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'sweeper', label: 'Sweeper' },
    { value: 'cleaner', label: 'Cleaner' }
  ];
  
  // Map shift values to display names
  const shiftOptions = [
    { value: 'morning', label: 'Morning (6AM-2PM)' },
    { value: 'afternoon', label: 'Afternoon (2PM-10PM)' },
    { value: 'night', label: 'Night (10PM-6AM)' }
  ];
  
  // Map status values to display names
  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'active', label: 'Active' },
    { value: 'available', label: 'Available' },
    { value: 'onLeave', label: 'On Leave' },
    { value: 'off-duty', label: 'Off Duty' },
    { value: 'suspended', label: 'Suspended' }
  ];
  
  return (
        <div className="modal-overlay">
          <div className="modal large">
            <div className="modal-header">
          <h2>{isEditing ? 'Edit Worker' : 'Add New Worker'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
            </div>
        <form className="worker-form" onSubmit={handleSubmitWithValidation}>
          {Object.keys(formErrors).length > 0 && (
            <div className="form-validation-summary">
              <div className="validation-header">
                <AlertCircle size={16} />
                <span>Please fix the following errors:</span>
              </div>
              <ul className="validation-errors-list">
                {Object.entries(formErrors).map(([field, message]) => (
                  <li key={field}>{field}: {message}</li>
                ))}
              </ul>
            </div>
          )}
              <div className="form-sections">
                <div className="form-section">
                  <h3>Personal Information</h3>
                  <div className="form-row">
                    <div className="form-group">
                  <label htmlFor="name">Full Name <span className="required-field">*</span></label>
                      <input
                        type="text"
                    id="name"
                    name="name"
                        value={safeFormData.name}
                    onChange={handleChange}
                        required
                      className={formErrors.name ? 'error-input' : ''}
                      />
                    {formErrors.name && <div className="error-message">{formErrors.name}</div>}
                    </div>
                    <div className="form-group">
                  <label htmlFor="workerId">Worker ID</label>
                      <input
                        type="text"
                    id="workerId"
                    name="workerId"
                        value={safeFormData.workerId}
                    onChange={handleChange}
                        required
                    readOnly
                    title="Worker ID is auto-generated and cannot be modified"
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                  <label htmlFor="email">Email <span className="required-field">*</span></label>
                      <input
                        type="email"
                    id="email"
                    name="email"
                        value={safeFormData.email}
                    onChange={handleChange}
                        required
                      className={formErrors.email ? 'error-input' : ''}
                      />
                    {formErrors.email && <div className="error-message">{formErrors.email}</div>}
                    </div>
                    <div className="form-group">
                  <label htmlFor="phone">Phone <span className="required-field">*</span></label>
                      <input
                        type="tel"
                    id="phone"
                    name="phone"
                        value={safeFormData.phone}
                    onChange={handleChange}
                        required
                      className={formErrors.phone ? 'error-input' : ''}
                      />
                    {formErrors.phone && <div className="error-message">{formErrors.phone}</div>}
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                  <label htmlFor="dateOfBirth">Date of Birth</label>
                      <input
                        type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                        value={safeFormData.dateOfBirth}
                    onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
              <h3>Work Information</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="workerType">Worker Type</label>
                      <select
                        id="workerType"
                        name="workerType"
                        value={safeFormData.workerType}
                        onChange={handleChange}
                        required
                      >
                    {workerTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                      </select>
                    </div>
                    <div className="form-group">
                      {/* This div is intentionally left empty to balance the form layout */}
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                  <label htmlFor="zone">Zone <span className="required-field">*</span></label>
                      <select
                    id="zone"
                    name="zone"
                        value={safeFormData.zone}
                    onChange={handleChange}
                        required
                        className={formErrors.zone ? 'error-input' : ''}
                      >
                        <option value="">Select Zone</option>
                    {safeZones.length > 0 ? (
                      safeZones.map(zone => (
                        <option 
                          key={zone._id || `zone-${Math.random()}`} 
                          value={zone._id || zone.name}
                        >
                          {zone.name}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="north">North Zone</option>
                        <option value="south">South Zone</option>
                        <option value="east">East Zone</option>
                        <option value="west">West Zone</option>
                        <option value="central">Central Zone</option>
                      </>
                    )}
                      </select>
                      {formErrors.zone && <div className="error-message">{formErrors.zone}</div>}
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                  <label htmlFor="shift">Shift</label>
                  <select
                    id="shift"
                    name="shift"
                        value={safeFormData.shift}
                    onChange={handleChange}
                  >
                    <option value="">Select Shift</option>
                    {shiftOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                    </div>
                    <div className="form-group">
                  <label htmlFor="joinedDate">Joined Date</label>
                      <input
                        type="date"
                    id="joinedDate"
                    name="joinedDate"
                        value={safeFormData.joinedDate}
                    onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="workerStatus">Status</label>
                      <select
                        id="workerStatus"
                        name="workerStatus"
                        value={safeFormData.workerStatus}
                        onChange={handleChange}
                        required
                        disabled={!isEditing} // Disable for new workers
                        title={isEditing ? "Change worker status" : "New workers are always set to pending status"}
                        className={!isEditing ? "disabled-input" : ""}
                      >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                      </select>
                      {!isEditing && (
                        <div className="field-note">
                          <AlertCircle size={12} />
                          <span>New workers must start with pending status</span>
                        </div>
                      )}
                    </div>
                    <div className="form-group">
                      {/* This div is intentionally left empty to balance the form layout */}
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Emergency Contact</h3>
                  <div className="form-row">
                    <div className="form-group">
                  <label htmlFor="emergencyContactName">Name</label>
                      <input
                        type="text"
                    id="emergencyContactName"
                    name="emergencyContactName"
                        value={safeFormData.emergencyContactName}
                    onChange={handleChange}
                      />
                    </div>
                    <div className="form-group">
                  <label htmlFor="emergencyContactPhone">Phone</label>
                      <input
                        type="tel"
                    id="emergencyContactPhone"
                    name="emergencyContactPhone"
                        value={safeFormData.emergencyContactPhone}
                    onChange={handleChange}
                      />
                </div>
                    </div>
                  </div>
                </div>

          <div className="form-note">
            <AlertCircle size={16} />
            <span>
              {isEditing 
                ? "Worker will be notified of any changes to their profile." 
                : "Worker will be created with pending status and default password: worker@12345. An admin must approve or change status before they can work."}
            </span>
              </div>

              <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
              {isEditing ? 'Update Worker' : 'Add Worker'}
                </button>
              </div>
            </form>
          </div>
    </div>
  );
};

export default WorkerManagement; 