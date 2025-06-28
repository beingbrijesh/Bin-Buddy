import React, { useState, useEffect, useCallback, useMemo, Suspense, lazy } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Edit2, X, MessageSquare, MoreVertical, Star, MapPin, Clock, Truck,
  Calendar, Mail, Phone, AlertCircle, CheckCircle, Map, Award, FileText,
  Activity, BarChart2, ClipboardList, FileCheck, Power, Printer, Download,
  ChevronRight, AlertTriangle, TrendingUp, Clock3, CheckSquare, XCircle,
  ThumbsUp, Search, Filter, CalendarIcon, PhoneCall, AlertOctagon,
  Send, Paperclip
} from 'lucide-react';
import { format, formatDistanceToNow, subDays, subMonths, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns';
import { toast } from 'react-hot-toast';

// Lazy load charts to improve initial load time
const ChartComponents = lazy(() => import('./components/ChartComponents'));

import api from '../../utils/axios';
import { API_ROUTES } from '../../constants';
import './Management.css';

// Memoized utility functions
const getInitials = (name) => {
  return name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || '';
};

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'active': return 'success';
    case 'on leave': return 'warning';
    case 'off duty': return 'neutral';
    case 'pending': return 'pending';
    default: return 'neutral';
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

const INITIAL_WORKER_STATE = {
  name: '',
  email: '',
  phone: '',
  role: '',
  status: 'pending',
  workerId: '',
  zone: '',
  shift: '',
  joinedDate: new Date(),
  rating: 0,
  totalRatings: 0,
};

const INITIAL_CONTACT_FORM = {
  method: 'email',
  priority: 'normal',
  subject: '',
  message: '',
  attachments: []
};

const ACTIVITY_TIMEFRAMES = {
  '24h': '24 Hours',
  '48h': '48 Hours',
  '72h': '72 Hours'
};

const WorkerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Worker data
  const [worker, setWorker] = useState(INITIAL_WORKER_STATE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // UI state
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  
  // Activity state
  const [activities, setActivities] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityTimeframe, setActivityTimeframe] = useState('24h');
  const [activityFilters, setActivityFilters] = useState({
    type: 'all',
    dateRange: 'all',
    status: 'all'
  });
  const [activitySearch, setActivitySearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Performance state
  const [performanceData, setPerformanceData] = useState(null);
  const [performanceLoading, setPerformanceLoading] = useState(false);
  const [performanceTimeframe, setPerformanceTimeframe] = useState('month');
  
  // Tasks state
  const [tasks, setTasks] = useState([]);
  const [taskLoading, setTaskLoading] = useState(false);
  const [taskFilter, setTaskFilter] = useState('all');
  const [taskSort, setTaskSort] = useState('date-desc');
  
  // Documents state
  const [documents, setDocuments] = useState([]);
  const [documentLoading, setDocumentLoading] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState('certification');
  
  // Contact form
  const [contactForm, setContactForm] = useState(INITIAL_CONTACT_FORM);

  // Optimized data fetching with error handling
  const fetchWorkerDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/users/${id}`);
      setWorker(response.data || INITIAL_WORKER_STATE);
    } catch (error) {
      console.error('Error fetching worker details:', error);
      setError('Failed to load worker details. Please try again.');
      toast.error('Failed to load worker details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchRecentActivities = useCallback(async () => {
    if (!id) return;
    
    try {
      setActivityLoading(true);
      const response = await api.get(`/users/${id}/activities/recent`, {
        params: { timeframe: activityTimeframe }
      });
      
      // Use fallback if API returns unexpected data
      const activityData = response.data?.activities || [];
      setActivities(activityData);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      toast.error('Failed to load recent activities');
      setActivities([]);
    } finally {
      setActivityLoading(false);
    }
  }, [id, activityTimeframe]);

  const fetchAllActivities = useCallback(async () => {
    if (!id) return;
    
    try {
      setActivityLoading(true);
      const response = await api.get(`/users/${id}/activities`, {
        params: {
          page: currentPage,
          limit: 10,
          ...activityFilters,
          search: activitySearch
        }
      });
      
      // Use fallback if API returns unexpected data
      const activityData = response.data?.activities || [];
      setActivities(activityData);
      setTotalPages(response.data?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast.error('Failed to load activities');
      setActivities([]);
    } finally {
      setActivityLoading(false);
    }
  }, [id, currentPage, activityFilters, activitySearch]);

  const fetchPerformanceData = useCallback(async () => {
    if (!id) return;
    
    try {
      setPerformanceLoading(true);
      const response = await api.get(`/users/${id}/performance`, {
        params: { timeframe: performanceTimeframe }
      });
      setPerformanceData(response.data);
    } catch (error) {
      console.error('Error fetching performance data:', error);
      toast.error('Failed to load performance data');
      setPerformanceData(null);
    } finally {
      setPerformanceLoading(false);
    }
  }, [id, performanceTimeframe]);

  const fetchTasks = useCallback(async () => {
    if (!id) return;
    
    try {
      setTaskLoading(true);
      const response = await api.get(`/users/${id}/tasks`, {
        params: { status: taskFilter, sort: taskSort }
      });
      setTasks(response.data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
      setTasks([]);
    } finally {
      setTaskLoading(false);
    }
  }, [id, taskFilter, taskSort]);

  const fetchDocuments = useCallback(async () => {
    if (!id) return;
    
    try {
      setDocumentLoading(true);
      const response = await api.get(`/users/${id}/documents`);
      setDocuments(response.data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
      setDocuments([]);
    } finally {
      setDocumentLoading(false);
    }
  }, [id]);

  // useEffect hooks for data fetching
  useEffect(() => {
    fetchWorkerDetails();
  }, [fetchWorkerDetails]);

  useEffect(() => {
    if (activeTab === 'recent-activity') {
      fetchRecentActivities();
    } else if (activeTab === 'all-activity') {
      fetchAllActivities();
    }
  }, [activeTab, fetchRecentActivities, fetchAllActivities]);

  useEffect(() => {
    if (activeTab === 'performance') {
      fetchPerformanceData();
    }
  }, [activeTab, fetchPerformanceData]);

  useEffect(() => {
    if (activeTab === 'tasks') {
      fetchTasks();
    } else if (activeTab === 'documents') {
      fetchDocuments();
    }
  }, [activeTab, fetchTasks, fetchDocuments]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activityFilters, activitySearch]);

  // Utility functions
  const getActivityIcon = useCallback((type) => {
    switch (type) {
      case 'task_completed':
      case 'task':
        return <CheckCircle size={16} className="activity-icon success" />;
      case 'task_assigned':
        return <ClipboardList size={16} className="activity-icon info" />;
      case 'location_update':
      case 'location':
        return <Map size={16} className="activity-icon neutral" />;
      case 'status_change':
      case 'status':
        return <AlertCircle size={16} className="activity-icon warning" />;
      case 'login':
        return <Power size={16} className="activity-icon info" />;
      case 'report':
        return <FileText size={16} className="activity-icon warning" />;
      case 'route':
        return <Truck size={16} className="activity-icon info" />;
      default:
        return <Activity size={16} className="activity-icon" />;
    }
  }, []);

  const getDocumentTypeIcon = useCallback((type) => {
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
  }, []);

  // Memoized derived values
  const formattedJoinedDate = useMemo(() => {
    try {
      return format(new Date(worker.joinedDate), 'MMM dd, yyyy');
    } catch (e) {
      return 'Unknown';
    }
  }, [worker.joinedDate]);

  const workerInitials = useMemo(() => getInitials(worker.name), [worker.name]);
  const statusColorClass = useMemo(() => getStatusColor(worker.status), [worker.status]);

  // Event handlers
  const handleDeactivate = async () => {
    if (!id) return;
    
    if (window.confirm('Are you sure you want to deactivate this worker?')) {
      try {
        await api.patch(`/users/${id}/deactivate`);
        toast.success('Worker deactivated successfully');
        fetchWorkerDetails();
      } catch (error) {
        console.error('Error deactivating worker:', error);
        toast.error('Failed to deactivate worker');
      }
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!id) return;
    
    try {
      const formData = new FormData();
      formData.append('method', contactForm.method);
      formData.append('priority', contactForm.priority);
      formData.append('subject', contactForm.subject);
      formData.append('message', contactForm.message);
      
      contactForm.attachments.forEach(file => {
        formData.append('attachments', file);
      });

      await api.post(`/users/${id}/contact`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success(`Message sent to ${worker.name}`);
      setShowContactModal(false);
      setContactForm(INITIAL_CONTACT_FORM);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleUploadDocument = async (file, type) => {
    if (!id || !file) return;
    
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

  const handleFileSelect = (e) => {
    if (e.target.files?.length) {
      setContactForm({
        ...contactForm,
        attachments: [...contactForm.attachments, ...Array.from(e.target.files)]
      });
    }
  };

  const removeAttachment = (index) => {
    const newAttachments = [...contactForm.attachments];
    newAttachments.splice(index, 1);
    setContactForm({ ...contactForm, attachments: newAttachments });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Activity item renderer
  const renderActivityItem = useCallback((activity) => (
    <div className="activity-item" key={activity._id || activity.id} onClick={() => console.log('Activity details:', activity)}>
      <div className="activity-icon">
        {getActivityIcon(activity.type)}
      </div>
      <div className="activity-content">
        <div className="activity-header">
          <h4>{activity.title}</h4>
          <span className={`activity-status ${(activity.status || 'completed').toLowerCase()}`}>
            {activity.status || 'Completed'}
          </span>
        </div>
        <p className="activity-description">{activity.description}</p>
        {activity.location && (
          <div className="activity-location">
            <MapPin size={14} />
            <span>{activity.location}</span>
          </div>
        )}
        <div className="activity-meta">
          <span className="activity-type">{activity.type?.replace('_', ' ') || 'Activity'}</span>
          <span className="activity-time">
            {formatDistanceToNow(new Date(activity.timestamp || Date.now()))} ago
          </span>
        </div>
      </div>
    </div>
  ), [getActivityIcon]);

  // Components that render each tab's content
  const renderOverviewTab = () => (
    <div className="profile-content">
      <div className="profile-grid">
        {/* Contact Information Card */}
        <div className="profile-card">
          <h3>Contact Information</h3>
          <div className="contact-details">
            <div className="contact-item">
              <Mail size={16} />
              <a href={`mailto:${worker.email}`}>{worker.email}</a>
            </div>
            <div className="contact-item">
              <Phone size={16} />
              <a href={`tel:${worker.phone}`}>{worker.phone}</a>
            </div>
            {worker.emergencyContactName && (
              <div className="emergency-contact">
                <h4>Emergency Contact</h4>
                <p>{worker.emergencyContactName}</p>
                <a href={`tel:${worker.emergencyContactPhone}`}>
                  {worker.emergencyContactPhone}
                </a>
              </div>
            )}
            {worker.address && (
              <div className="address">
                <h4>Address</h4>
                <p>{worker.address}</p>
              </div>
            )}
          </div>
        </div>

        {/* Current Status Card */}
        <div className="profile-card">
          <h3>Current Status & Activity</h3>
          <div className="status-details">
            {worker.currentTask ? (
              <div className="current-task">
                <h4>Current Task</h4>
                <div className="task-info">
                  <span className="task-name">{worker.currentTask.name}</span>
                  <button className="view-task" onClick={() => {}}>
                    View Details
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="no-task">
                <AlertCircle size={20} />
                <span>No current task assigned</span>
              </div>
            )}

            {worker.lastActivity && (
              <div className="last-activity">
                <h4>Last Activity</h4>
                <p>{worker.lastActivity.description}</p>
                <span className="timestamp">
                  {formatDistanceToNow(new Date(worker.lastActivity.timestamp))} ago
                </span>
              </div>
            )}

            {worker.currentLocation && (
              <div className="current-location">
                <h4>Current Location</h4>
                <div className="location-info">
                  <Map size={16} />
                  <span>{worker.currentLocation}</span>
                </div>
              </div>
            )}

            <div className="efficiency">
              <h4>Efficiency</h4>
              <div className="efficiency-stats">
                <div className="stat">
                  <span className="label">Today</span>
                  <span className="value">{worker.efficiencyToday || 0}%</span>
                </div>
                <div className="stat">
                  <span className="label">This Week</span>
                  <span className="value">{worker.efficiencyWeek || 0}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics Card */}
        <div className="profile-card">
          <h3>Key Performance Metrics</h3>
          <div className="metrics-grid">
            <div className="metric">
              <span className="label">Total Tasks Completed</span>
              <span className="value">{worker.totalTasksCompleted || 0}</span>
            </div>
            <div className="metric">
              <span className="label">Tasks This Month</span>
              <span className="value">{worker.tasksThisMonth || 0}</span>
            </div>
            <div className="metric">
              <span className="label">On-Time Completion Rate</span>
              <span className="value">{worker.onTimeCompletionRate || 0}%</span>
            </div>
            <div className="metric">
              <span className="label">Average Task Rating</span>
              <div className="rating-value">
                <Star size={16} className="star-icon" />
                <span>{worker.averageRating || '0.0'}</span>
                <span className="sub-text">from {worker.totalRatings || 0} ratings</span>
              </div>
            </div>
            <div className="metric">
              <span className="label">Absence Days (This Year)</span>
              <span className="value">{worker.absenceDays || 0} days</span>
            </div>
          </div>
        </div>

        {/* Certifications Card */}
        <div className="profile-card">
          <h3>Certifications</h3>
          {worker.certifications && worker.certifications.length > 0 ? (
            <div className="certifications-list">
              {worker.certifications.map((cert, index) => (
                <div key={index} className="certification-item">
                  <div className="cert-header">
                    <Award size={16} />
                    <span className="cert-name">{cert.name}</span>
                    {cert.referenceId && (
                      <span className="cert-id">#{cert.referenceId}</span>
                    )}
                  </div>
                  {cert.expiryDate && (
                    <div className="cert-expiry">
                      <Calendar size={14} />
                      <span className={`expiry-date ${
                        new Date(cert.expiryDate) < new Date() ? 'expired' : ''
                      }`}>
                        Expires: {format(new Date(cert.expiryDate), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  )}
                  {cert.documentUrl && (
                    <button className="view-doc" onClick={() => window.open(cert.documentUrl)}>
                      <FileText size={14} />
                      View Document
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-certifications">
              <AlertCircle size={24} />
              <p>No certifications on file</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderRecentActivityTab = () => (
    <div className="profile-content">
      <div className="activity-header">
        <h3>Recent Activities</h3>
        <div className="timeframe-selector">
          {Object.entries(ACTIVITY_TIMEFRAMES).map(([key, label]) => (
            <button
              key={key}
              className={`timeframe-btn ${activityTimeframe === key ? 'active' : ''}`}
              onClick={() => setActivityTimeframe(key)}
            >
              Last {label}
            </button>
          ))}
        </div>
      </div>

      {activityLoading ? (
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading recent activities...</p>
        </div>
      ) : activities.length === 0 ? (
        <div className="empty-state">
          <Activity size={48} />
          <h3>No Recent Activity</h3>
          <p>No activities have been recorded in the last {ACTIVITY_TIMEFRAMES[activityTimeframe]}.</p>
        </div>
      ) : (
        <div className="activity-timeline recent">
          {activities.map(renderActivityItem)}
        </div>
      )}
    </div>
  );

  const renderAllActivityTab = () => (
    <div className="profile-content">
      <div className="activity-header">
        <h3>Full Activity Log</h3>
        <div className="activity-controls">
          <div className="search-bar">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search activities..."
              value={activitySearch}
              onChange={(e) => setActivitySearch(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <select
              value={activityFilters.type}
              onChange={(e) => setActivityFilters({ ...activityFilters, type: e.target.value })}
            >
              <option value="all">All Types</option>
              <option value="task">Tasks</option>
              <option value="login">System Access</option>
              <option value="route">Routes</option>
              <option value="report">Reports</option>
            </select>
            <select
              value={activityFilters.dateRange}
              onChange={(e) => setActivityFilters({ ...activityFilters, dateRange: e.target.value })}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="custom">Custom Range</option>
            </select>
            <select
              value={activityFilters.status}
              onChange={(e) => setActivityFilters({ ...activityFilters, status: e.target.value })}
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
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
          <Activity size={48} />
          <h3>No Activities Found</h3>
          <p>No activities match your search criteria.</p>
        </div>
      ) : (
        <>
          <div className="activity-list">
            {activities.map(renderActivityItem)}
          </div>
          <div className="pagination">
            <button
              className="page-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            >
              Previous
            </button>
            <span className="page-info">
              Page {currentPage} of {totalPages || 1}
            </span>
            <button
              className="page-btn"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );

  const renderPerformanceTab = () => (
    <div className="profile-content">
      <div className="performance-header">
        <h3>Performance Overview</h3>
        <div className="timeframe-selector">
          <button
            className={`timeframe-btn ${performanceTimeframe === 'week' ? 'active' : ''}`}
            onClick={() => setPerformanceTimeframe('week')}
          >
            This Week
          </button>
          <button
            className={`timeframe-btn ${performanceTimeframe === 'month' ? 'active' : ''}`}
            onClick={() => setPerformanceTimeframe('month')}
          >
            This Month
          </button>
          <button
            className={`timeframe-btn ${performanceTimeframe === 'year' ? 'active' : ''}`}
            onClick={() => setPerformanceTimeframe('year')}
          >
            This Year
          </button>
        </div>
      </div>

      {performanceLoading ? (
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading performance data...</p>
        </div>
      ) : !performanceData ? (
        <div className="empty-state">
          <BarChart2 size={48} />
          <h3>No Performance Data</h3>
          <p>No performance data is available for the selected timeframe.</p>
        </div>
      ) : (
        <Suspense fallback={<div className="loading-state"><div className="spinner" /><p>Loading charts...</p></div>}>
          <ChartComponents 
            performanceData={performanceData} 
            timeframe={performanceTimeframe} 
          />
        </Suspense>
      )}
    </div>
  );

  const renderTasksTab = () => (
    <div className="profile-content">
      <div className="tasks-header">
        <h3>Tasks</h3>
        <div className="tasks-controls">
          <div className="filter-group">
            <select
              value={taskFilter}
              onChange={(e) => setTaskFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
            <select
              value={taskSort}
              onChange={(e) => setTaskSort(e.target.value)}
              className="filter-select"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="priority-high">Priority (High-Low)</option>
              <option value="priority-low">Priority (Low-High)</option>
            </select>
          </div>
        </div>
      </div>

      {taskLoading ? (
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <ClipboardList size={48} />
          <h3>No Tasks Found</h3>
          <p>No tasks match the selected filters.</p>
        </div>
      ) : (
        <div className="tasks-grid">
          {tasks.map(task => (
            <div key={task._id || task.id} className="task-card">
              <div className="task-card-header">
                <div className="task-type-badge">{task.type}</div>
                <span className={`status-badge ${getTaskStatusColor(task.status)}`}>
                  {task.status}
                </span>
              </div>
              <div className="task-card-content">
                <h4>{task.title}</h4>
                <p>{task.description}</p>
                <div className="task-details">
                  <div className="detail-item">
                    <MapPin size={16} />
                    <span>{task.location}</span>
                  </div>
                  <div className="detail-item">
                    <Calendar size={16} />
                    <span>
                      {format(new Date(task.dueDate || Date.now()), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  {task.estimatedDuration && (
                    <div className="detail-item">
                      <Clock size={16} />
                      <span>{task.estimatedDuration} mins</span>
                    </div>
                  )}
                </div>
                {task.status === 'completed' && task.completedAt && (
                  <div className="completion-info">
                    <div className="completion-time">
                      Completed: {formatDistanceToNow(new Date(task.completedAt))} ago
                    </div>
                    {task.rating && (
                      <div className="task-rating">
                        <Star size={16} className="star-icon" />
                        <span>{task.rating}/5.0</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderDocumentsTab = () => (
    <div className="profile-content">
      <div className="documents-header">
        <h3>Documents</h3>
        <div className="document-controls">
          <select
            value={selectedDocumentType}
            onChange={(e) => setSelectedDocumentType(e.target.value)}
            className="document-type-select"
          >
            <option value="certification">Certification</option>
            <option value="training">Training Record</option>
            <option value="review">Performance Review</option>
            <option value="contract">Contract</option>
            <option value="other">Other</option>
          </select>
          <label className="upload-btn">
            <input
              type="file"
              hidden
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleUploadDocument(e.target.files[0], selectedDocumentType);
                }
              }}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              disabled={uploadingDocument}
            />
            {uploadingDocument ? (
              <>
                <div className="spinner small" />
                Uploading...
              </>
            ) : (
              <>
                <FileText size={16} />
                Upload Document
              </>
            )}
          </label>
        </div>
      </div>

      {documentLoading ? (
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading documents...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="empty-state">
          <FileText size={48} />
          <h3>No Documents</h3>
          <p>No documents have been uploaded yet.</p>
        </div>
      ) : (
        <div className="documents-grid">
          {documents.map(doc => (
            <div key={doc._id || doc.id} className="document-card">
              <div className="document-icon">
                {getDocumentTypeIcon(doc.type)}
              </div>
              <div className="document-info">
                <h4>{doc.name}</h4>
                <span className="document-type">{doc.type}</span>
                <span className="upload-date">
                  Uploaded {formatDistanceToNow(new Date(doc.uploadedAt || Date.now()))} ago
                </span>
              </div>
              <div className="document-actions">
                <button 
                  className="action-btn" 
                  onClick={() => window.open(doc.url)}
                  disabled={!doc.url}
                >
                  <Download size={16} />
                  Download
                </button>
                <button 
                  className="action-btn danger"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this document?')) {
                      // Delete document logic
                      console.log('Delete document:', doc);
                    }
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Contact Worker Modal
  const renderContactModal = () => (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Contact: {worker.name}</h2>
          <button className="close-btn" onClick={() => setShowContactModal(false)}>
            <X size={24} />
          </button>
        </div>
        <div className="modal-content">
          <div className="contact-info-summary">
            <div className="info-row">
              <span className="label">Role:</span>
              <span>{worker.role}</span>
            </div>
            <div className="info-row">
              <span className="label">Phone:</span>
              <a href={`tel:${worker.phone}`}>{worker.phone}</a>
            </div>
            <div className="info-row">
              <span className="label">Email:</span>
              <a href={`mailto:${worker.email}`}>{worker.email}</a>
            </div>
          </div>

          <div className="quick-actions">
            <button
              className="action-btn success"
              onClick={() => window.location.href = `tel:${worker.phone}`}
            >
              <PhoneCall size={16} />
              Call Now
            </button>
            {worker.emergencyContactPhone && (
              <button
                className="action-btn warning"
                onClick={() => {
                  if (window.confirm(`Are you sure you want to call ${worker.emergencyContactName} for ${worker.name}?`)) {
                    window.location.href = `tel:${worker.emergencyContactPhone}`;
                  }
                }}
              >
                <AlertOctagon size={16} />
                Call Emergency Contact
              </button>
            )}
          </div>

          <form onSubmit={handleContactSubmit} className="contact-form">
            <div className="form-row">
              <div className="form-group">
                <label>Contact Method</label>
                <select
                  value={contactForm.method}
                  onChange={(e) => setContactForm({ ...contactForm, method: e.target.value })}
                >
                  <option value="email">Email</option>
                  <option value="sms">SMS/System Message</option>
                </select>
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select
                  value={contactForm.priority}
                  onChange={(e) => setContactForm({ ...contactForm, priority: e.target.value })}
                >
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            {contactForm.method === 'email' && (
              <div className="form-group">
                <label>Subject</label>
                <input
                  type="text"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  placeholder="Enter subject"
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>Message</label>
              <textarea
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                placeholder="Enter your message"
                rows={4}
                maxLength={contactForm.method === 'sms' ? 160 : undefined}
                required
              />
              {contactForm.method === 'sms' && (
                <span className="character-count">
                  {contactForm.message.length}/160 characters
                </span>
              )}
            </div>

            {contactForm.method === 'email' && (
              <div className="form-group">
                <label className="attachment-btn">
                  <input
                    type="file"
                    multiple
                    hidden
                    onChange={handleFileSelect}
                  />
                  <Paperclip size={16} />
                  Attach Files
                </label>
                {contactForm.attachments.length > 0 && (
                  <div className="attachment-list">
                    {contactForm.attachments.map((file, index) => (
                      <div key={index} className="attachment-item">
                        <span>{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="modal-actions">
              <button type="button" className="cancel-btn" onClick={() => setShowContactModal(false)}>
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
  );

  // Main render
  return (
    <div className="worker-profile">
      {/* Header Actions */}
      <div className="profile-header-actions">
        <button className="close-btn" onClick={() => navigate('/management/workers')}>
          <X size={24} />
        </button>
        <div className="action-buttons">
          <button className="action-btn" onClick={() => setShowContactModal(true)}>
            <MessageSquare size={18} />
            Contact Worker
          </button>
          <button className="action-btn primary" onClick={() => setShowEditModal(true)}>
            <Edit2 size={18} />
            Edit Profile
          </button>
          <div className="dropdown">
            <button className="action-btn">
              <MoreVertical size={18} />
            </button>
            <div className="dropdown-menu">
              <button onClick={handleDeactivate}>
                <Power size={16} />
                Deactivate Profile
              </button>
              <button onClick={() => window.print()}>
                <Printer size={16} />
                Print Profile
              </button>
              <button onClick={() => {}}>
                <Download size={16} />
                Export Activity Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && !loading && (
        <div className="error-state">
          <AlertTriangle size={48} />
          <h3>Error</h3>
          <p>{error}</p>
          <button className="action-btn" onClick={() => fetchWorkerDetails()}>
            Try Again
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading worker profile...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && !worker.name && (
        <div className="empty-state">
          <AlertTriangle size={48} />
          <h3>Worker Not Found</h3>
          <p>The worker profile you're looking for doesn't exist or has been removed.</p>
          <button className="action-btn" onClick={() => navigate('/management/workers')}>
            Return to Worker List
          </button>
        </div>
      )}

      {/* Worker Content */}
      {!loading && !error && worker.name && (
        <>
          {/* Worker Header */}
          <div className="profile-header">
            <div className="profile-avatar">
              {worker.avatar ? (
                <img src={worker.avatar} alt={worker.name} />
              ) : (
                <span className="initials">{workerInitials}</span>
              )}
              <span className={`status-indicator ${statusColorClass}`} />
            </div>
            <div className="profile-info">
              <div className="name-section">
                <h1>{worker.name}</h1>
                <span className="worker-id">ID: {worker.workerId}</span>
                <div className="badges">
                  <span className={`status-badge ${statusColorClass}`}>
                    {worker.status}
                  </span>
                  <span className="role-badge">{worker.role}</span>
                </div>
              </div>
              <div className="rating-section">
                <Star className="star-icon" size={20} />
                <span className="rating">{worker.rating || '0.0'} / 5.0</span>
                <span className="rating-info">Based on {worker.totalRatings || 0} tasks</span>
              </div>
              <div className="quick-info">
                <div className="info-item">
                  <MapPin size={16} />
                  <span>{worker.zone || 'No zone assigned'}</span>
                </div>
                <div className="info-item">
                  <Clock size={16} />
                  <span>{worker.shift || 'No shift assigned'}</span>
                </div>
                {worker.vehicle && (
                  <div className="info-item">
                    <Truck size={16} />
                    <span>{worker.vehicle}</span>
                  </div>
                )}
                <div className="info-item">
                  <Calendar size={16} />
                  <span>Joined: {formattedJoinedDate}</span>
                </div>
              </div>
              {worker.lastActive && (
                <div className="last-active">
                  Last active: {formatDistanceToNow(new Date(worker.lastActive))} ago
                  {worker.lastLocation && ` at ${worker.lastLocation}`}
                </div>
              )}
            </div>
          </div>

          {/* Sub-Navigation */}
          <div className="profile-tabs">
            <button
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => handleTabChange('overview')}
            >
              <FileText size={18} />
              Overview
            </button>
            <button
              className={`tab-btn ${activeTab === 'recent-activity' ? 'active' : ''}`}
              onClick={() => handleTabChange('recent-activity')}
            >
              <Activity size={18} />
              Recent Activity
            </button>
            <button
              className={`tab-btn ${activeTab === 'all-activity' ? 'active' : ''}`}
              onClick={() => handleTabChange('all-activity')}
            >
              <BarChart2 size={18} />
              All Activity
            </button>
            <button
              className={`tab-btn ${activeTab === 'performance' ? 'active' : ''}`}
              onClick={() => handleTabChange('performance')}
            >
              <Award size={18} />
              Performance
            </button>
            <button
              className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
              onClick={() => handleTabChange('tasks')}
            >
              <ClipboardList size={18} />
              Tasks
            </button>
            <button
              className={`tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
              onClick={() => handleTabChange('documents')}
            >
              <FileCheck size={18} />
              Documents
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'recent-activity' && renderRecentActivityTab()}
          {activeTab === 'all-activity' && renderAllActivityTab()}
          {activeTab === 'performance' && renderPerformanceTab()}
          {activeTab === 'tasks' && renderTasksTab()}
          {activeTab === 'documents' && renderDocumentsTab()}

          {/* Contact Modal */}
          {showContactModal && renderContactModal()}
        </>
      )}
    </div>
  );
};

export default WorkerProfile; 