import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Edit2,
  X,
  MessageSquare,
  MoreVertical,
  Star,
  MapPin,
  Clock,
  Truck,
  Calendar,
  Mail,
  Phone,
  AlertCircle,
  CheckCircle,
  Map,
  Award,
  FileText,
  Activity,
  BarChart2,
  ClipboardList,
  FileCheck,
  Power,
  Printer,
  Download,
  ChevronRight,
  AlertTriangle,
  TrendingUp,
  Clock3,
  CheckSquare,
  XCircle,
  ThumbsUp,
  Upload,
  Trash2,
  Search,
  Filter,
  Calendar as CalendarIcon,
  PhoneCall,
  AlertOctagon,
  Send,
  Paperclip,
  Users,
  User,
  Radio,
  Bell,
  Wrench
} from 'lucide-react';
import { format, formatDistanceToNow, subMonths, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns';
import { toast } from 'react-hot-toast';
import {
  LineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import api from '../../utils/axios';
import './Management.css';

const WorkerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [activities, setActivities] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityPage, setActivityPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [performanceLoading, setPerformanceLoading] = useState(false);
  const [performanceTimeframe, setPerformanceTimeframe] = useState('month'); // week, month, year
  const [performanceData, setPerformanceData] = useState({
    weekly: {
      tasksCompleted: 0,
      targetAchievement: "0%",
      efficiencyRating: "0%",
      customerRating: "0/5.0"
    },
    monthly: {
      totalCollections: 0,
      binsServiced: 0,
      routesCompleted: 0,
      attendance: "0%"
    }
  });
  const [tasks, setTasks] = useState([]);
  const [taskLoading, setTaskLoading] = useState(false);
  const [taskFilter, setTaskFilter] = useState('all'); // all, pending, completed, overdue
  const [taskSort, setTaskSort] = useState('date-desc');
  const [documents, setDocuments] = useState([]);
  const [documentLoading, setDocumentLoading] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState('certification');
  const [zones, setZones] = useState([]);
  const [contactForm, setContactForm] = useState({
    method: 'email',
    priority: 'normal',
    subject: '',
    message: '',
    attachments: []
  });
  const [activityTimeframe, setActivityTimeframe] = useState('24h');
  const [activityFilters, setActivityFilters] = useState({
    type: 'all',
    dateRange: 'all',
    status: 'all'
  });
  const [activitySearch, setActivitySearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [locationUpdated, setLocationUpdated] = useState(null);
  
  // Extract tab data passed from navigation
  const tabData = location.state?.tabData || {
    tracking: { enabled: false },
    scheduling: { enabled: false },
    analytics: { enabled: false },
    communication: { enabled: false },
    compliance: { enabled: false }
  };

  // Check for missing ID and navigate in a separate effect with highest priority
  useEffect(() => {
    if (!id) {
      console.error('No worker ID provided in URL');
      toast.error('Worker ID is missing');
      navigate('/management/workers');
    }
  }, [id, navigate]);

  // Only proceed with data fetching if we have a valid ID
  useEffect(() => {
    if (id) {
      fetchZones();
    fetchWorkerDetails();
    
    // Add page title for better SEO and user experience
    document.title = 'Worker Profile | BinBuddy Admin';
    
    return () => {
      document.title = 'BinBuddy Admin';
    };
    }
  }, [id]);

  // Only fetch activities if we have a valid worker and ID
  useEffect(() => {
    if (id && worker && activeTab === 'recent-activity') {
      fetchRecentActivities();
    } else if (id && worker && activeTab === 'all-activity') {
      fetchAllActivities();
    }
  }, [activeTab, activityTimeframe, activityFilters, activitySearch, currentPage, id, worker]);

  // Only fetch performance data if we have a valid worker and ID
  useEffect(() => {
    if (id && worker && activeTab === 'performance') {
      fetchPerformanceData();
    }
  }, [activeTab, performanceTimeframe, id, worker]);

  // Only fetch tasks or documents if we have a valid worker and ID
  useEffect(() => {
    if (id && worker) {
    if (activeTab === 'tasks') {
      fetchTasks();
    } else if (activeTab === 'documents') {
      fetchDocuments();
    }
    }
  }, [activeTab, taskFilter, taskSort, id, worker]);

  const fetchZones = async () => {
    try {
      const response = await api.get('/api/zones');
      
      // Ensure we always set an array
      if (Array.isArray(response.data)) {
        setZones(response.data);
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        setZones(response.data.data);
      } else if (response.data?.zones && Array.isArray(response.data.zones)) {
        setZones(response.data.zones);
      } else {
        console.warn('Unexpected API response format for zones. Setting empty array.', response.data);
        setZones([]);
      }
    } catch (error) {
      console.error('Error fetching zones:', error);
      setZones([]);
    }
  };

  const fetchWorkerDetails = async () => {
    try {
      setLoading(true);
      
      // Validate ID before making API request
      if (!id) {
        throw new Error('Worker ID is missing');
      }
      
      // Try dedicated worker API first, then fall back to users API
      let response;
      try {
        console.log('Fetching worker details from worker API...');
        response = await api.get(`/api/workers/${id}`);
        console.log('Successfully fetched from worker API');
      } catch (workerApiError) {
        console.log('Worker API failed, trying users API:', workerApiError);
        response = await api.get(`/api/users/${id}`);
        console.log('Successfully fetched from users API');
      }
      
      const workerData = response.data;
      
      // Log the raw worker data to help with debugging
      console.log('Raw worker data:', workerData);
      
      // Normalize worker data with no mocks, ensuring all required fields are present
      const normalizedWorker = {
        _id: workerData._id,
        workerId: workerData.workerId || workerData.userId || workerData.workerDetails?.employeeId || 'N/A',
        name: workerData.name || 'Unnamed Worker',
        email: workerData.email || 'No Email',
        phone: workerData.phone || 'No Phone',
        address: workerData.address || '', // Default to empty string for better UX
        pincode: workerData.pincode || '', // Default to empty string for better UX
        avatar: workerData.avatar || '',
        workerType: workerData.workerType || 'collector',
        zone: workerData.zone || workerData.workerDetails?.zone || '', // Default to empty string
        workerStatus: workerData.workerStatus || workerData.status || 'inactive',
        shift: workerData.shift || workerData.workerDetails?.shift || 'morning',
        joinedDate: workerData.createdAt || new Date(),
        performance: {
          rating: workerData.performance?.rating || 0,
          efficiency: workerData.performance?.efficiency || 0,
          tasksCompleted: workerData.performance?.tasksCompleted || 0,
          binsCollected: workerData.performance?.binsCollected || 0,
          distanceCovered: workerData.performance?.distanceCovered || 0
        },
        lastLogin: workerData.lastLogin || null,
        workerDetails: workerData.workerDetails || {}
      };
      
      // Log the normalized worker data to help with debugging
      console.log('Normalized worker data:', normalizedWorker);
      
      setWorker(normalizedWorker);
      
      // Update page title with worker name
      document.title = `${normalizedWorker.name} | Worker Profile | BinBuddy Admin`;
      
      // Fetch additional data
      fetchRecentActivities();
      
    } catch (error) {
      console.error('Error fetching worker details:', error);
      toast.error('Failed to load worker details');
      navigate('/management/workers');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      if (!id) return; // Exit early if no ID
      
      setActivityLoading(true);
      
      // First try the workers API endpoint (correct one)
      try {
        const response = await api.get(`/api/workers/${id}/activities/recent`, {
        params: { timeframe: activityTimeframe }
      });
        
        // Validate response and ensure we have real data
        const activitiesData = response.data?.activities || [];
        
        if (Array.isArray(activitiesData)) {
          // Filter out any potential mock data by checking for required properties
          const validActivities = activitiesData.filter(activity => 
            activity && 
            typeof activity === 'object' &&
            (activity.id || activity._id) // Must have an ID
          );
          
          setActivities(validActivities);
        } else {
          setActivities([]);
        }
        
        return; // Exit if successful
      } catch (workerApiError) {
        console.log('Failed to fetch activities from worker API:', workerApiError);
        // Continue to fallback
      }
      
      // Try users API as fallback
      try {
        const usersResponse = await api.get(`/api/users/${id}/activities/recent`, {
          params: { timeframe: activityTimeframe }
        });
        
        // Validate response and ensure we have real data
        const activitiesData = usersResponse.data?.activities || [];
        
        if (Array.isArray(activitiesData)) {
          // Filter out any potential mock data
          const validActivities = activitiesData.filter(activity => 
            activity && 
            typeof activity === 'object' &&
            (activity.id || activity._id) // Must have an ID
          );
          
          setActivities(validActivities);
        } else {
          setActivities([]);
        }
      } catch (usersApiError) {
        console.error('Failed to fetch from users API too:', usersApiError);
        // Show empty activities rather than mock data
        setActivities([]);
      }
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      // Empty state instead of mock data
      setActivities([]);
    } finally {
      setActivityLoading(false);
    }
  };

  const fetchAllActivities = async () => {
    try {
      if (!id) return; // Exit early if no ID
      
      setActivityLoading(true);
      
      // Try worker API first, then users API
      try {
        const response = await api.get(`/api/workers/${id}/activities`, {
        params: {
          page: currentPage,
          ...activityFilters,
          search: activitySearch
        }
      });
        
        setActivities(response.data.activities || []);
        setTotalPages(response.data.totalPages || 1);
        return; // Exit if successful
      } catch (workerApiError) {
        console.log('Failed to fetch activities from worker API:', workerApiError);
        // Continue to fallback
      }
      
      // Try users API as fallback
      try {
        const usersResponse = await api.get(`/api/users/${id}/activities`, {
          params: {
            page: currentPage,
            ...activityFilters,
            search: activitySearch
          }
        });
        
        setActivities(usersResponse.data.activities || []);
        setTotalPages(usersResponse.data.totalPages || 1);
      } catch (usersApiError) {
        console.error('Failed to fetch from users API too:', usersApiError);
        // Show empty activities rather than mock data
        setActivities([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      setActivities([]);
      setTotalPages(1);
    } finally {
      setActivityLoading(false);
    }
  };

  const fetchPerformanceData = async () => {
    try {
      if (!id) return; // Exit early if no ID
      
      setPerformanceLoading(true);
      
      // Try worker API first, then users API
      try {
        const response = await api.get(`/api/workers/${id}/performance`, {
        params: { timeframe: performanceTimeframe }
      });
        
        // Update state with real data
        if (response.data) {
          setPerformanceData({
            weekly: {
              tasksCompleted: response.data.weekly?.tasksCompleted || 0,
              targetAchievement: response.data.weekly?.targetAchievement || "0%",
              efficiencyRating: response.data.weekly?.efficiencyRating || "0%",
              customerRating: response.data.weekly?.customerRating || "0/5.0"
            },
            monthly: {
              totalCollections: response.data.monthly?.totalCollections || 0,
              binsServiced: response.data.monthly?.binsServiced || 0,
              routesCompleted: response.data.monthly?.routesCompleted || 0,
              attendance: response.data.monthly?.attendance || "0%"
            }
          });
        }
        return;
      } catch (workerApiError) {
        console.log('Failed to fetch performance from worker API:', workerApiError);
      }
      
      // Try users API as fallback
      try {
        const usersResponse = await api.get(`/api/users/${id}/performance`, {
          params: { timeframe: performanceTimeframe }
        });
        
        if (usersResponse.data) {
          setPerformanceData({
            weekly: {
              tasksCompleted: usersResponse.data.weekly?.tasksCompleted || 0,
              targetAchievement: usersResponse.data.weekly?.targetAchievement || "0%",
              efficiencyRating: usersResponse.data.weekly?.efficiencyRating || "0%",
              customerRating: usersResponse.data.weekly?.customerRating || "0/5.0"
            },
            monthly: {
              totalCollections: usersResponse.data.monthly?.totalCollections || 0,
              binsServiced: usersResponse.data.monthly?.binsServiced || 0,
              routesCompleted: usersResponse.data.monthly?.routesCompleted || 0,
              attendance: usersResponse.data.monthly?.attendance || "0%"
            }
          });
        }
      } catch (usersApiError) {
        console.error('Failed to fetch performance from users API too:', usersApiError);
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
      // Keep the initialized empty performance data
    } finally {
      setPerformanceLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      if (!id) return; // Exit early if no ID
      
      setTaskLoading(true);
      
      // Try worker API first, then users API
      try {
        const response = await api.get(`/api/workers/${id}/tasks`, {
        params: { status: taskFilter, sort: taskSort }
      });
        
        setTasks(response.data || []);
        return;
      } catch (workerApiError) {
        console.log('Failed to fetch tasks from worker API:', workerApiError);
      }
      
      // Try users API as fallback
      try {
        const usersResponse = await api.get(`/api/users/${id}/tasks`, {
          params: { status: taskFilter, sort: taskSort }
        });
        
        setTasks(usersResponse.data || []);
      } catch (usersApiError) {
        console.error('Failed to fetch tasks from users API too:', usersApiError);
        setTasks([]);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    } finally {
      setTaskLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      if (!id) return; // Exit early if no ID
      
      setDocumentLoading(true);
      
      // Try worker API first, then users API
      try {
        const response = await api.get(`/api/workers/${id}/documents`);
        setDocuments(response.data || []);
        return;
      } catch (workerApiError) {
        console.log('Failed to fetch documents from worker API:', workerApiError);
      }
      
      // Try users API as fallback
      try {
        const usersResponse = await api.get(`/api/users/${id}/documents`);
        setDocuments(usersResponse.data || []);
      } catch (usersApiError) {
        console.error('Failed to fetch documents from users API too:', usersApiError);
        setDocuments([]);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      setDocuments([]);
    } finally {
      setDocumentLoading(false);
    }
  };

  const handleUploadDocument = async (file, type) => {
    try {
      setUploadingDocument(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      
      await api.post(`/users/${id}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Document uploaded successfully');
      fetchDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    } finally {
      setUploadingDocument(false);
    }
  };

  const getTaskStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'success';
      case 'in_progress': return 'info';
      case 'pending': return 'warning';
      case 'overdue': return 'danger';
      default: return 'neutral';
    }
  };

  const getDocumentTypeIcon = (type) => {
    switch (type) {
      case 'certification':
        return <Award size={20} />;
      case 'training':
        return <FileCheck size={20} />;
      case 'review':
        return <ClipboardList size={20} />;
      case 'contract':
        return <FileText size={20} />;
      default:
        return <FileText size={20} />;
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

  const getStatusColor = (status) => {
    if (!status) return 'neutral';
    
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'active': return 'success';
      case 'on leave': case 'on-leave': return 'warning';
      case 'off duty': case 'off-duty': return 'neutral';
      case 'pending': return 'pending';
      case 'inactive': return 'neutral';
      default: return 'neutral'; // Default to neutral for unknown statuses
    }
  };

  const handleContactModalOpen = () => {
    setShowContactModal(true);
  };

  const handleContactModalClose = () => {
    setShowContactModal(false);
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
      // await api.post(`/users/${worker._id}/contact`, contactForm);
      
      toast.success(`Message sent to ${worker?.name}`);
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

  // Additional tabs based on the features enabled
  const renderTabs = () => {
    const tabs = [
      { id: 'overview', label: 'Overview', icon: <User size={16} /> },
      { id: 'recent-activity', label: 'Recent Activities', icon: <Activity size={16} /> }
    ];
    
    if (tabData.tracking.enabled) {
      tabs.push({ id: 'tracking', label: 'Real-time Tracking', icon: <Map size={16} /> });
    }
    
    if (tabData.analytics.enabled) {
      tabs.push({ id: 'performance', label: 'Performance', icon: <Activity size={16} /> });
    }
    
    if (tabData.scheduling.enabled) {
      tabs.push({ id: 'schedule', label: 'Schedule', icon: <Calendar size={16} /> });
    }
    
    if (tabData.communication.enabled) {
      tabs.push({ id: 'messages', label: 'Communication', icon: <Mail size={16} /> });
    }
    
    if (tabData.compliance.enabled) {
      tabs.push({ id: 'compliance', label: 'Compliance', icon: <FileText size={16} /> });
    }
    
    return tabs;
  };

  // Real-time location tracking simulation
  useEffect(() => {
    if (activeTab === 'tracking') {
      // Only simulate location updates if the worker is active
      if (worker?.workerStatus === 'active') {
      const interval = setInterval(() => {
        // Simulate location updates
        const randomLat = (Math.random() * 0.01) - 0.005;
        const randomLng = (Math.random() * 0.01) - 0.005;
        
        setLocationUpdated({
          latitude: 37.7749 + randomLat,
          longitude: -122.4194 + randomLng,
          timestamp: new Date().toISOString(),
          accuracy: Math.floor(Math.random() * 20) + 5,
            speed: Math.floor(Math.random() * 30) + 5,
            isSimulated: true
        });
        }, 5000);
      
      return () => clearInterval(interval);
    }
    }
  }, [activeTab, worker?.workerStatus]);

  // Format joined date properly
  const formatJoinedDate = (dateValue) => {
    if (!dateValue) return 'Not available';
    
    try {
      const date = new Date(dateValue);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Not available';
      }
      return format(date, 'MMMM dd, yyyy');
    } catch (e) {
      return 'Not available';
    }
  };

  // Add a function to get zone name from ID
  const getZoneName = (zoneId) => {
    if (!zoneId) return 'Not Assigned';
    
    // Check if zones is an array before using .find method
    if (!Array.isArray(zones)) {
      console.error('zones is not an array:', zones);
      return zoneId; // Return the ID if zones is not an array
    }
    
    const zone = zones.find(z => z._id === zoneId || z.id === zoneId);
    if (zone) {
      return zone.name || zone.zoneName || zoneId;
    }
    
    // If direct match not found, try matching with substring
    if (typeof zoneId === 'string') {
      const partialMatch = zones.find(z => zoneId.includes(z._id) || (z.id && zoneId.includes(z.id)));
      if (partialMatch) {
        return partialMatch.name || partialMatch.zoneName || zoneId;
      }
    }
    
    return zoneId; // Return the ID if no zone name found
  };

  // If no ID is provided, show loading state until navigation occurs
  if (!id) {
    return (
      <div className="management-container">
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading worker profile...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="management-container">
      <div className="loading-state">
        <div className="spinner" />
        <p>Loading worker profile...</p>
        </div>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="management-container">
      <div className="empty-state">
          <AlertCircle size={48} />
        <h3>Worker Not Found</h3>
        <p>The worker profile you're looking for doesn't exist or has been removed.</p>
        <button className="action-btn" onClick={() => navigate('/management/workers')}>
          Return to Worker List
        </button>
        </div>
      </div>
    );
  }

  return (
    <div className="management-container">
    <div className="worker-profile">
      {/* Header Actions */}
      <div className="profile-header-actions">
        <button className="close-btn" onClick={() => navigate('/management/workers')}>
            <X size={20} />
        </button>
        <div className="action-buttons">
            <button 
              className="edit-profile-btn" 
              onClick={() => {
                // Go back to worker management page and trigger the edit modal
                navigate('/management/workers', { 
                  state: { 
                    editWorkerId: id,
                    openEditModal: true,
                    workerData: {
                      workerId: worker.workerId,
                      pincode: worker.pincode,
                      zone: worker.zone
                    }
                  } 
                });
              }}
            >
            <Edit2 size={18} />
              <span>Edit Profile</span>
              </button>
        </div>
      </div>

      {/* Worker Header */}
      <div className="profile-header">
        <div className="profile-avatar">
          {worker.avatar ? (
            <img src={worker.avatar} alt={worker.name} />
          ) : (
            <span className="initials">{getInitials(worker.name)}</span>
          )}
          <span className={`status-indicator ${getStatusColor(worker.workerStatus)}`} />
        </div>
        <div className="profile-info">
          <div className="name-section">
            <h1>{worker.name}</h1>
              <div className="status-role-container">
                <div className="status-badge" data-status={getStatusColor(worker.workerStatus)}>
                  {worker.workerStatus === 'active' ? 
                    <CheckCircle size={14} /> : 
                    worker.workerStatus === 'pending' ?
                    <Clock size={14} /> :
                    <AlertCircle size={14} />
                  }
                  <span>{worker.workerStatus || 'Inactive'}</span>
            </div>
                <div className="worker-role">{worker.workerType ? worker.workerType.charAt(0).toUpperCase() + worker.workerType.slice(1) : 'Worker'}</div>
                <div className="worker-rating">
                  <Star size={16} className="star-icon" />
                  <span>{worker.performance?.rating || '0'}</span>
          </div>
          </div>
            </div>
            <div className="worker-details">
              <div className="detail-item">
              <MapPin size={16} />
                <span>{worker.zone ? getZoneName(worker.zone) : 'Not Assigned'}</span>
            </div>
              <div className="detail-item">
                <Truck size={16} />
                <span>{worker.workerDetails?.vehicle || 'No Vehicle Assigned'}</span>
              </div>
              <div className="detail-item">
                <Clock size={16} />
                <span>
                  {worker.shift && (worker.shift === 'morning' 
                    ? 'Morning (6AM-2PM)'
                    : worker.shift === 'afternoon'
                      ? 'Afternoon (2PM-10PM)'
                      : worker.shift === 'evening'
                        ? 'Evening (2PM-10PM)'
                        : worker.shift === 'night'
                          ? 'Night (10PM-6AM)'
                          : worker.shift)}
                </span>
              </div>
              <div className="detail-item">
              <Calendar size={16} />
                <span>Joined: {formatJoinedDate(worker.joinedDate)}</span>
            </div>
          </div>
        </div>
      </div>

        {/* Tabs Navigation */}
      <div className="profile-tabs">
          {renderTabs().map(tab => (
        <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
        >
              {tab.icon}
              <span>{tab.label}</span>
        </button>
          ))}
      </div>

        {/* Tab Content */}
        <div className="profile-content full-width">
          {activeTab === 'overview' && (
            <div className="full-width-content">
          <div className="profile-grid">
            {/* Contact Information Card */}
            <div className="profile-card">
              <h3>Contact Information</h3>
                  <div className="contact-list">
                <div className="contact-item">
                  <Mail size={16} />
                  <div className="contact-detail">
                    <span className="contact-label"><strong>Email:</strong></span>
                  <a href={`mailto:${worker.email}`}>{worker.email}</a>
                  </div>
                </div>
                <div className="contact-item">
                  <Phone size={16} />
                  <div className="contact-detail">
                    <span className="contact-label"><strong>Phone:</strong></span>
                  <a href={`tel:${worker.phone}`}>{worker.phone}</a>
                  </div>
                </div>
                    <div className="contact-item">
                      <MapPin size={16} />
                      <div className="contact-detail">
                        <span className="contact-label"><strong>Address:</strong></span>
                      <span>{worker.address || 'No address provided'}</span>
                      </div>
                    </div>
                    <div className="contact-item">
                      <MapPin size={16} />
                      <div className="contact-detail">
                        <span className="contact-label"><strong>Pincode:</strong></span>
                        <span>{worker.pincode || '000000'}</span>
                      </div>
                    </div>
              </div>
            </div>

                {/* Work Information Card */}
            <div className="profile-card">
                  <h3>Work Information</h3>
                  <div className="info-list">
                    <div className="info-item">
                      <span className="info-label"><strong>Role:</strong></span>
                      <span className="info-value">{worker.workerType || 'Not assigned'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label"><strong>Employee ID:</strong></span>
                      <span className="info-value">
                        {worker.workerId || worker.workerDetails?.employeeId || 'Not assigned'}
                    </span>
                  </div>
                    <div className="info-item">
                      <span className="info-label"><strong>Zone:</strong></span>
                      <span className="info-value">{worker.zone ? getZoneName(worker.zone) : 'Not assigned'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label"><strong>Shift:</strong></span>
                      <span className="info-value">{worker.shift || worker.workerDetails?.shift || 'Not assigned'}</span>
                  </div>
                    <div className="info-item">
                      <span className="info-label"><strong>Joined:</strong></span>
                      <span className="info-value">
                        {formatJoinedDate(worker.joinedDate)}
                      </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics Card */}
              <div className="performance-metrics-card full-width">
                <h3>Performance Metrics</h3>
              <div className="metrics-grid">
                  <div className="metric-item">
                    <span className="metric-value blue">{worker.performance?.tasksCompleted !== undefined ? worker.performance.tasksCompleted : '0'}</span>
                    <span className="metric-label">Tasks Completed</span>
                </div>
                  <div className="metric-item">
                    <span className="metric-value green">{worker.performance?.binsCollected !== undefined ? worker.performance.binsCollected : '0'}</span>
                    <span className="metric-label">Bins Collected</span>
                </div>
                  <div className="metric-item">
                    <span className="metric-value purple">{worker.performance?.efficiency !== undefined ? `${worker.performance.efficiency}%` : '0%'}</span>
                    <span className="metric-label">Efficiency</span>
                </div>
                  <div className="metric-item">
                    <span className="metric-value orange">{worker.performance?.distanceCovered !== undefined ? `${worker.performance.distanceCovered}km` : '0km'}</span>
                    <span className="metric-label">Distance Covered</span>
                </div>
              </div>
            </div>

              {/* Certifications Section */}
              <div className="certifications-section full-width">
              <h3>Certifications</h3>
                <div className="certifications-content">
              {worker.certifications && worker.certifications.length > 0 ? (
                <div className="certifications-list">
                  {worker.certifications.map((cert, index) => (
                    <div key={index} className="certification-item">
                          <h4>{cert.name}</h4>
                          <p>Issued: {cert.issueDate || 'N/A'}</p>
                          <p>Expires: {cert.expiryDate || 'N/A'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                    <p>No certifications available</p>
              )}
            </div>
          </div>
        </div>
      )}

          {activeTab === 'recent-activity' && (
            <div className="activities-content full-width-content">
              <div className="section-header">
                <h3><Activity size={20} /> Recent Activities</h3>
                <div className="section-actions">
                  <div className="timeframe-selector">
                    <select 
                      value={activityTimeframe} 
                      onChange={(e) => setActivityTimeframe(e.target.value)}
                      className="timeframe-select"
                    >
                      <option value="24h">Last 24 Hours</option>
                      <option value="7d">Last 7 Days</option>
                      <option value="30d">Last 30 Days</option>
                      <option value="all">All Time</option>
                    </select>
                  </div>
                </div>
              </div>

              {activityLoading ? (
                <div className="loading-state">
                  <div className="spinner" />
                  <p>Loading activities...</p>
                </div>
              ) : activities.length === 0 ? (
                <div className="empty-state">
                  <AlertCircle size={48} />
                  <h3>No Activities Found</h3>
                  <p>No activities have been recorded in the selected timeframe.</p>
                </div>
              ) : (
                <div className="activities-list">
                  {activities.filter(activity => activity && (activity.id || activity._id)).map((activity) => (
                    <div key={activity.id || activity._id} className="activity-item">
                      <div className="activity-icon">
                        {activity.type === 'bin collection' ? (
                          <Truck size={20} />
                        ) : activity.type === 'maintenance' ? (
                          <Wrench size={20} />
                        ) : (
                          <Activity size={20} />
                        )}
                      </div>
                      <div className="activity-details">
                        <h4>{activity.title || 'Untitled Activity'}</h4>
                        <p>{activity.description || 'No description available for this activity'}</p>
                        <div className="activity-meta">
                          <span className="activity-location">
                            <MapPin size={14} /> {activity.location || 'No location data'}
                          </span>
                          <span className="activity-time">
                            <Clock size={14} /> {activity.timestamp ? formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true }) : 'No timestamp'}
                          </span>
                          <span className={`activity-status ${activity.status || 'unknown'}`}>
                            {activity.status === 'completed' ? (
                              <CheckCircle size={14} />
                            ) : activity.status === 'in_progress' ? (
                              <Clock size={14} />
                            ) : activity.status === 'pending' ? (
                              <Clock size={14} />
                            ) : (
                              <AlertCircle size={14} />
                            )}
                            {activity.status || 'Status unknown'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
        </div>
      )}

          {activeTab === 'tracking' && (
            <div className="tracking-content full-width-content">
              <div className="section-header">
                <h3><Map size={20} /> Real-time Location</h3>
                <div className="section-actions">
                  <span className={`status-badge ${worker?.workerStatus?.toLowerCase() === 'active' ? 'success' : 'neutral'}`}>
                    {worker?.workerStatus || 'Unknown'}
                  </span>
                  <span className="last-updated">
                    Last updated: {locationUpdated ? new Date(locationUpdated.timestamp).toLocaleTimeString() : 'N/A'}
                  </span>
            </div>
          </div>

              <div className="map-container">
                <div className="map-placeholder">
                  <Map size={48} />
                  <h3>Map Visualization</h3>
                  <p>Real-time location tracking {worker?.workerStatus === 'active' ? 'enabled' : 'disabled'} for this worker</p>
            </div>
                
                {locationUpdated ? (
                <div 
                  className={`worker-location-marker active`}
                  style={{ 
                    left: '50%', 
                    top: '50%'
                  }}
                >
                  <div className="location-popup">
                    <div className="location-popup-header">
                      <div className="location-popup-avatar">
                        {worker?.name ? worker.name.charAt(0) : 'W'}
              </div>
                      <div className="location-popup-name">{worker?.name}</div>
                        {locationUpdated.isSimulated && (
                          <span style={{ 
                            fontSize: '10px',
                            padding: '2px 6px',
                            backgroundColor: 'rgba(237, 137, 54, 0.2)',
                            color: '#c05621',
                            borderRadius: '10px',
                            marginLeft: '8px',
                            fontWeight: '600'
                          }}>
                            Simulated Data
                          </span>
                        )}
            </div>
                    <div className="location-popup-details">
                        <div>Speed: {locationUpdated.speed || 0} mph</div>
                        <div>Accuracy: {locationUpdated.accuracy || 0}m</div>
          </div>
                    <div className="location-popup-address">
                        {locationUpdated.address || 'Location data unavailable'}
            </div>
            </div>
              </div>
                ) : (
                  <div className="no-location-data">
                    <div className="empty-state-icon">
                      <AlertCircle size={32} />
                    </div>
                    <h4>No Location Data Available</h4>
                    <p>{worker?.workerStatus === 'active' 
                      ? 'Location tracking is enabled but no data has been received yet.'
                      : 'Location tracking is currently disabled for this worker because they are not active.'}</p>
                  </div>
                )}
                
                <div className="map-controls">
                  <button className="map-control-btn active" title="Show worker location">
                    <User size={16} />
              </button>
                  <button className="map-control-btn" title="Show geofence areas">
                    <Radio size={16} />
              </button>
                  <button className="map-control-btn" title="Show all workers">
                    <Users size={16} />
                  </button>
                  <button className="map-control-btn" title="Show route history">
                    <Activity size={16} />
              </button>
            </div>
          </div>

              {locationUpdated ? (
              <div className="location-details-grid">
                <div className="location-detail-card">
                  <div className="detail-card-header">
                    <h4>Current Location</h4>
                    <MapPin size={16} className="detail-card-icon" />
            </div>
                  <div className="detail-card-content">
                      <p className="detail-address">{locationUpdated.address || 'Retrieving location...'}</p>
                    <div className="detail-coordinates">
                        <span>Lat: {locationUpdated.latitude?.toFixed(6) || 'N/A'}</span>
                        <span>Lng: {locationUpdated.longitude?.toFixed(6) || 'N/A'}</span>
            </div>
        </div>
                </div>
                
                <div className="location-detail-card">
                  <div className="detail-card-header">
                    <h4>Movement</h4>
                    <Activity size={16} className="detail-card-icon" />
              </div>
                  <div className="detail-card-content">
                    <div className="movement-details">
                      <div className="movement-item">
                        <span className="movement-label">Speed</span>
                          <span className="movement-value">{locationUpdated.speed || 0} mph</span>
            </div>
                      <div className="movement-item">
                        <span className="movement-label">Heading</span>
                          <span className="movement-value">{locationUpdated.heading || 0}°</span>
          </div>
                      <div className="movement-item">
                        <span className="movement-label">Time Active</span>
                          <span className="movement-value">{locationUpdated.activeTime || 'Unknown'}</span>
            </div>
            </div>
                  </div>
                      </div>
                </div>
              ) : (
                <div className="empty-location-state">
                  <AlertCircle size={32} />
                  <h3>No Location Data</h3>
                  <p>Real-time location tracking data is not available for this worker</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="performance-content full-width-content">
              <h3><Activity size={20} /> Performance Analytics</h3>
              
              <div className="performance-header">
                <div className="performance-timeframe">
                  <label>Timeframe:</label>
                  <select 
                    value={performanceTimeframe}
                    onChange={(e) => setPerformanceTimeframe(e.target.value)}
                    className="timeframe-select"
                  >
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="quarter">This Quarter</option>
                    <option value="year">This Year</option>
                  </select>
                      </div>
                        </div>
              
              {performanceLoading ? (
                <div className="loading-state">
                  <div className="spinner" />
                  <p>Loading performance data...</p>
                    </div>
              ) : (
                <div className="analytics-grid">
                  <div className="analytics-card">
                    <div className="analytics-card-header">
                      <h4>Task Completion</h4>
                      <CheckSquare size={16} />
                        </div>
                    <div className="analytics-card-content">
                      <div className="big-stat">{performanceData.weekly?.tasksCompleted || '0'}</div>
                      <div className="stat-label">Tasks Completed</div>
                      <div className="stat-detail">
                        <span>Target Achievement:</span>
                        <span className="highlight">{performanceData.weekly?.targetAchievement || '0%'}</span>
                          </div>
                      </div>
                  </div>
                  
                  <div className="analytics-card">
                    <div className="analytics-card-header">
                      <h4>Collection Stats</h4>
                      <Truck size={16} />
                    </div>
                    <div className="analytics-card-content">
                      <div className="big-stat">{performanceData.monthly?.totalCollections || '0'}</div>
                      <div className="stat-label">Total Collections</div>
                      <div className="stat-detail">
                        <span>Bins Serviced:</span>
                        <span className="highlight">{performanceData.monthly?.binsServiced || '0'}</span>
                      </div>
                </div>
            </div>
                
                  <div className="analytics-card">
                    <div className="analytics-card-header">
                      <h4>Efficiency Rating</h4>
                      <TrendingUp size={16} />
            </div>
                    <div className="analytics-card-content">
                      <div className="big-stat">{performanceData.weekly?.efficiencyRating || '0%'}</div>
                      <div className="stat-label">Efficiency Rate</div>
                      <div className="stat-detail">
                        <span>Customer Rating:</span>
                        <span className="highlight">{performanceData.weekly?.customerRating || '0/5.0'}</span>
          </div>
            </div>
            </div>
                  
                  <div className="analytics-card">
                    <div className="analytics-card-header">
                      <h4>Route Stats</h4>
                      <Map size={16} />
                  </div>
                    <div className="analytics-card-content">
                      <div className="big-stat">{performanceData.monthly?.routesCompleted || '0'}</div>
                      <div className="stat-label">Routes Completed</div>
                      <div className="stat-detail">
                        <span>Attendance:</span>
                        <span className="highlight">{performanceData.monthly?.attendance || '0%'}</span>
                  </div>
                  </div>
                  </div>
                  
                  {worker.performance?.distanceCovered > 0 && (
                    <div className="analytics-card wide">
                      <div className="analytics-card-header">
                        <h4>Distance Covered</h4>
                        <Map size={16} />
                      </div>
                      <div className="analytics-card-content">
                        <div className="big-stat">{worker.performance?.distanceCovered || '0'}km</div>
                        <div className="stat-label">Total Distance</div>
                </div>
        </div>
      )}

                  {worker.performance?.rating > 0 && (
                    <div className="analytics-card wide">
                      <div className="analytics-card-header">
                        <h4>Overall Rating</h4>
                        <Star size={16} />
            </div>
                      <div className="analytics-card-content">
                        <div className="big-stat">{worker.performance?.rating || '0'}/5.0</div>
                        <div className="stat-label">Worker Rating</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
                </div>
          )}
          
          {activeTab === 'schedule' && (
            <div className="schedule-content full-width-content">
              <h3><Calendar size={20} /> Work Schedule</h3>
              <div className="empty-state">
                <CalendarIcon size={48} />
                <h3>No Schedule Data</h3>
                <p>There is no schedule data available for this worker.</p>
              </div>
                  </div>
          )}
          
          {activeTab === 'messages' && (
            <div className="messages-content full-width-content">
              <h3><Mail size={20} /> Communications</h3>
              <div className="empty-state">
                <Mail size={48} />
                <h3>No Communications</h3>
                <p>There are no communication records available for this worker.</p>
              </div>
                  </div>
                )}

          {activeTab === 'compliance' && (
            <div className="compliance-content full-width-content">
              <h3><FileText size={20} /> Compliance Documents</h3>
              <div className="empty-state">
                <FileText size={48} />
                <h3>No Documents</h3>
                <p>There are no compliance documents available for this worker.</p>
              </div>
                      </div>
                    )}
                  </div>
                </div>
    </div>
  );
};

export default WorkerProfile; 