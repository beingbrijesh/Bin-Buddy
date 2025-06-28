import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Truck,
  Clock,
  Calendar,
  Star,
  Activity,
  BarChart2,
  FileText,
  CheckCircle,
  AlertCircle,
  Edit2,
  Download,
  Award,
  FileCheck,
  Map,
  ClipboardList,
  Upload,
  UserCog,
  PlusCircle,
  Save,
  X,
  Trash2,
  Camera,
  Power,
  Check
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';
import api from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';
import { uploadToCloudinary } from '../../utils/cloudinary';
import './Worker.css';

// Helper function to monitor and enforce worker status
const useWorkerStatusMonitor = (worker, forceUpdateFunction) => {
  React.useEffect(() => {
    // Don't run if we don't have worker data yet
    if (!worker || !worker._id) return;
    
    console.log('🕵️ Setting up worker status monitor');
    
    // Get stored status
    const storedStatus = localStorage.getItem('workerStatus');
    const statusUpdatedAt = localStorage.getItem('workerStatusUpdatedAt');
    const storedWorkerId = localStorage.getItem('workerId');
    
    // Check if we have a stored status for this worker
    if (!storedStatus || storedWorkerId !== worker._id) {
      console.log('No stored status for this worker, not monitoring');
      return; // Nothing to monitor
    }
    
    // Verify status matches immediately
    if (worker.workerStatus !== storedStatus) {
      console.log(`⚠️ Initial status mismatch: DB=${worker.workerStatus}, Local=${storedStatus}`);
      forceUpdateFunction(storedStatus);
    }
    
    // Set up an interval to check status
    const intervalId = setInterval(async () => {
      try {
        // Fetch current worker data from server
        console.log('🔍 Status monitor checking worker status...');
        const response = await api.get(`/api/workers/${worker._id}`);
        
        if (response.status === 200) {
          const serverWorker = response.data;
          const currentStatus = serverWorker.workerStatus || serverWorker.status;
          
          // Check if server status matches what we expect
          if (currentStatus !== storedStatus) {
            console.log(`⚠️ Status monitor detected mismatch: Server=${currentStatus}, Expected=${storedStatus}`);
            
            // Force update on server
            await forceUpdateFunction(storedStatus);
          } else {
            console.log(`✅ Status monitor: Server status matches expected status: ${currentStatus}`);
          }
        }
      } catch (error) {
        console.error('Status monitor error:', error);
      }
    }, 60000); // Check every minute
    
    // Clean up on unmount
    return () => {
      clearInterval(intervalId);
      console.log('🧹 Status monitor cleaned up');
    };
  }, [worker?._id, forceUpdateFunction]); // Only re-run if worker ID changes
};

const WorkerOwnProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [activities, setActivities] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const defaultPerformanceData = {
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
    },
    yearly: {
      totalTasks: 0,
      averageEfficiency: "0%",
      totalDistance: "0 km",
      yearlyRating: "0/5.0"
    }
  };
  const [performanceData, setPerformanceData] = useState(defaultPerformanceData);
  const [tasks, setTasks] = useState([]);
  const [taskLoading, setTaskLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [documentLoading, setDocumentLoading] = useState(false);
  const [zones, setZones] = useState([]);
  const [activityTimeframe, setActivityTimeframe] = useState('24h');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [documentForm, setDocumentForm] = useState({
    name: '',
    type: 'aadhar',
    file: null
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showStatusToggle, setShowStatusToggle] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const fileInputRef = useRef(null);
  const avatarInputRef = useRef(null);
  const [performanceLoading, setPerformanceLoading] = useState(false);
  const [performanceTimeframe, setPerformanceTimeframe] = useState('weekly');

  useEffect(() => {
    // First, check if we have a saved status we want to enforce
    const storedStatus = localStorage.getItem('workerStatus');
    const statusUpdatedAt = localStorage.getItem('workerStatusUpdatedAt');
    const storedWorkerId = localStorage.getItem('workerId');
    
    console.log('🔍 Worker profile mounted, checking stored status:', {
      storedStatus,
      storedWorkerId,
      updateTime: statusUpdatedAt ? new Date(statusUpdatedAt).toLocaleString() : 'none'
    });
    
    // Only consider the stored status if it's recent (within the last 24 hours)
    const shouldEnforceStoredStatus = storedStatus && statusUpdatedAt && 
      ((new Date() - new Date(statusUpdatedAt)) < 24 * 60 * 60 * 1000);
    
    // If we should enforce a stored status, set a flag to check as soon as worker data loads
    if (shouldEnforceStoredStatus) {
      console.log('⚠️ Found recent status that should be enforced:', storedStatus);
      localStorage.setItem('enforceStatusOnLoad', 'true');
    }

    // Now proceed with regular data fetching
    fetchWorkerDetails();
    fetchZones();
    
    // Set page title
    document.title = 'My Profile | BinBuddy Worker';
    
    return () => {
      document.title = 'BinBuddy Worker';
    };
  }, []);

  useEffect(() => {
    if (worker && activeTab === 'activities') {
      fetchRecentActivities();
    } else if (worker && activeTab === 'performance') {
      fetchPerformanceData();
    } else if (worker && activeTab === 'tasks') {
      fetchTasks();
    } else if (worker && activeTab === 'documents') {
      fetchDocuments();
    }
  }, [activeTab, worker, activityTimeframe]);

  // Add an effect to make sure the worker status is consistent with localStorage
  useEffect(() => {
    // Don't run this effect when the worker is first loading
    if (!worker || loading) return;
    
    const storedStatus = localStorage.getItem('workerStatus');
    const storedWorkerId = localStorage.getItem('workerId');
    
    // Only use the stored status if it's for the current worker
    if (storedStatus && storedWorkerId === worker._id) {
      console.log(`Ensuring worker status is consistent with localStorage: ${storedStatus}`);
      
      // Update the worker status if needed
      if (worker.workerStatus !== storedStatus) {
        console.log(`⚠️ Status mismatch! Setting status to ${storedStatus} from localStorage`);
        setWorker(prev => ({
          ...prev,
          workerStatus: storedStatus,
          status: storedStatus
        }));
      }
    }
  }, [worker, loading]);

  // Add a direct function to force update the worker status if needed
  const forceUpdateWorkerStatus = async (desiredStatus) => {
    if (!worker || !worker._id) return;
    
    try {
      console.log(`🔄 Force updating worker status to: ${desiredStatus}`);
      
      // First try the dedicated status endpoint
      let success = false;
      let response;
      
      try {
        // Make a direct API call to update the status using the dedicated endpoint
        console.log(`📤 Using dedicated status endpoint for force update`);
        response = await api.patch(`/api/workers/${worker._id}/status`, {
          status: desiredStatus
        });
        
        if (response.status === 200) {
          console.log('✅ Force update successful via dedicated endpoint:', response.data);
          success = true;
        }
      } catch (dedicatedEndpointError) {
        console.error('❌ Force update failed with dedicated endpoint:', dedicatedEndpointError);
        // Continue to fallback approach
      }
      
      // Fall back to the regular approach if dedicated endpoint failed
      if (!success) {
        console.log(`📤 Falling back to regular endpoint for force update`);
        response = await api.patch(`/api/workers/${worker._id}`, {
          workerStatus: desiredStatus,
          status: desiredStatus,
          forcedUpdate: true // Flag to indicate this is a forced update
        });
        
        if (response.status === 200) {
          console.log('✅ Force update response via fallback:', response.data);
          success = true;
        }
      }
      
      if (success) {
        // Update local state
        setWorker({
          ...worker,
          workerStatus: desiredStatus,
          status: desiredStatus
        });
        
        // Update localStorage
        localStorage.setItem('workerStatus', desiredStatus);
        localStorage.setItem('workerStatusUpdatedAt', new Date().toISOString());
        localStorage.setItem('workerId', worker._id);
        localStorage.setItem('statusForceUpdated', 'true');
        
        return true;
      } else {
        throw new Error('Both update attempts failed');
      }
    } catch (error) {
      console.error('Error in force update:', error);
      return false;
    }
  };
  
  // Add an effect that runs specifically to check and force update status if needed
  useEffect(() => {
    if (!worker || loading) return;
    
    // Check localStorage for desired status
    const storedStatus = localStorage.getItem('workerStatus');
    const storedWorkerId = localStorage.getItem('workerId');
    const forceUpdated = localStorage.getItem('statusForceUpdated');
    
    // Only proceed if we have a stored status for this worker and haven't force updated yet
    if (storedStatus && storedWorkerId === worker._id && forceUpdated !== 'true') {
      // If the current status doesn't match what we want
      if (worker.workerStatus !== storedStatus) {
        console.log(`⚠️ Status mismatch detected! DB: ${worker.workerStatus}, Desired: ${storedStatus}`);
        
        // Force update the status to match what we want
        forceUpdateWorkerStatus(storedStatus);
      }
    }
  }, [worker]);

  // Use the status monitor
  useWorkerStatusMonitor(worker, forceUpdateWorkerStatus);

  const fetchZones = async () => {
    try {
      const response = await api.get('/api/zones');
      
      if (Array.isArray(response.data)) {
        setZones(response.data);
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        setZones(response.data.data);
      } else if (response.data?.zones && Array.isArray(response.data.zones)) {
        setZones(response.data.zones);
      } else {
        setZones([]);
      }
    } catch (error) {
      console.error('Error fetching zones:', error);
      setZones([]);
    }
  };

  const fetchWorkerDetails = async (preserveStatus = false) => {
    try {
      setLoading(true);
      
      // Check if we should enforce a stored status
      const enforceStatusOnLoad = localStorage.getItem('enforceStatusOnLoad') === 'true';
      const storedStatus = localStorage.getItem('workerStatus');
      const storedWorkerId = localStorage.getItem('workerId');
      
      // Store current workerStatus if we're preserving it
      const currentStatus = preserveStatus && worker ? worker.workerStatus : null;
      console.log('💡 fetchWorkerDetails called with preserveStatus:', preserveStatus, 'currentStatus:', currentStatus);
      
      if (!user || !user._id) {
        toast.error('User information not available');
        return;
      }
      
      // Try to get worker details using the logged-in user's ID
      let response;
      try {
        response = await api.get(`/api/workers/${user._id}`);
        console.log('✅ Fetched worker data from /api/workers endpoint:', response.data);
      } catch (workerApiError) {
        console.log('Worker API failed, trying users API:', workerApiError);
        response = await api.get(`/api/users/${user._id}`);
        console.log('✅ Fetched worker data from /api/users endpoint:', response.data);
      }
      
      const workerData = response.data;
      
      // Determine which status to use
      let statusToUse;
      
      if (enforceStatusOnLoad && storedStatus && storedWorkerId === user._id) {
        // If enforcing stored status, use that
        statusToUse = storedStatus;
        console.log('⚠️ Enforcing stored status:', statusToUse);
        
        // Clear the flag so we don't enforce again
        localStorage.removeItem('enforceStatusOnLoad');
      } else if (preserveStatus && currentStatus) {
        // If preserving current status, use that
        statusToUse = currentStatus;
        console.log('⚠️ Preserving current status:', statusToUse);
      } else {
        // Otherwise use what we got from server
        statusToUse = workerData.workerStatus || workerData.status || 'inactive';
        console.log('ℹ️ Using server status:', statusToUse);
      }
      
      // Normalize worker data
      const normalizedWorker = {
        _id: workerData._id,
        workerId: workerData.workerId || workerData.workerDetails?.employeeId || 'N/A',
        name: workerData.name || 'Unnamed Worker',
        email: workerData.email || 'No Email',
        phone: workerData.phone || 'No Phone',
        address: workerData.address || '',
        pincode: workerData.pincode || '',
        avatar: workerData.avatar || '',
        workerType: workerData.workerType || 'collector',
        zone: workerData.zone || workerData.workerDetails?.zone || null,
        workerStatus: statusToUse,
        shift: workerData.shift || workerData.workerDetails?.shift || 'morning',
        joinedDate: workerData.createdAt || new Date(),
        performance: {
          rating: parseFloat(workerData.performance?.rating || 0),
          efficiency: parseFloat(workerData.performance?.efficiency || 0),
          tasksCompleted: parseInt(workerData.performance?.tasksCompleted || 0, 10),
          binsCollected: parseInt(workerData.performance?.binsCollected || 0, 10),
          distanceCovered: parseFloat(workerData.performance?.distanceCovered || 0)
        },
        lastLogin: workerData.lastLogin || null,
        workerDetails: workerData.workerDetails || {},
        documents: workerData.documents || [],
        activities: workerData.activities || [],
        personalInfo: {
          dateOfBirth: workerData.personalInfo?.dateOfBirth ? new Date(workerData.personalInfo.dateOfBirth) : '',
          gender: workerData.personalInfo?.gender || '',
          emergencyContact: {
            name: workerData.personalInfo?.emergencyContact?.name || '',
            phone: workerData.personalInfo?.emergencyContact?.phone || '',
            relationship: workerData.personalInfo?.emergencyContact?.relationship || ''
          },
          education: workerData.personalInfo?.education || '',
          skills: workerData.personalInfo?.skills || [],
          languages: workerData.personalInfo?.languages || []
        }
      };
      
      console.log('✅ Normalized worker with status:', normalizedWorker.workerStatus);
      
      setWorker(normalizedWorker);
      document.title = `${normalizedWorker.name} | My Profile | BinBuddy Worker`;
      
      // If we're enforcing a status and it's different from what the server has,
      // force update the server to match our desired status
      if ((enforceStatusOnLoad || preserveStatus) && 
          statusToUse !== workerData.workerStatus) {
        console.log('⚠️ Status enforcement needed - calling forceUpdateWorkerStatus');
        // We need to wait for the component to fully render with the worker data
        setTimeout(() => forceUpdateWorkerStatus(statusToUse), 1000);
      }
      
      // Update performance data based on worker stats
      setPerformanceData(prev => ({
        ...prev,
        weekly: {
          ...prev.weekly,
          tasksCompleted: normalizedWorker.performance.tasksCompleted
        },
        monthly: {
          ...prev.monthly,
          binsServiced: normalizedWorker.performance.binsCollected
        }
      }));
      
    } catch (error) {
      console.error('Error fetching worker details:', error);
      toast.error('Failed to load your profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      setActivityLoading(true);
      
      if (!worker?._id) return;
      
      // First try to get activities from worker object itself
      if (worker.activities && worker.activities.length > 0) {
        // Filter activities based on timeframe
        let timeCutoff = new Date();
        switch (activityTimeframe) {
          case '7d':
            timeCutoff.setDate(timeCutoff.getDate() - 7);
            break;
          case '30d':
            timeCutoff.setDate(timeCutoff.getDate() - 30);
            break;
          case 'all':
            timeCutoff = new Date(0); // Beginning of time
            break;
          default: // 24h
            timeCutoff.setDate(timeCutoff.getDate() - 1);
        }
        
        // Filter activities by date
        const filteredActivities = worker.activities.filter(activity => {
          return new Date(activity.timestamp) >= timeCutoff;
        });
        
        // Sort by timestamp descending
        filteredActivities.sort((a, b) => {
          return new Date(b.timestamp) - new Date(a.timestamp);
        });
        
        setActivities(filteredActivities);
      } else {
        // If no activities in worker object, try API endpoint
        const response = await api.get(`/api/workers/${worker._id}/activities/recent`, {
          params: { timeframe: activityTimeframe }
        });
        
        const activitiesData = response.data?.activities || [];
        setActivities(Array.isArray(activitiesData) ? activitiesData : []);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      setActivities([]);
    } finally {
      setActivityLoading(false);
    }
  };

  const fetchPerformanceData = async () => {
    try {
      if (!worker?._id) return;
      
      const timeframes = ['weekly', 'monthly', 'yearly'];
      const allData = {};
      
      // Show loading state
      setPerformanceLoading(true);
      
      // Fetch data for all timeframes
      for (const timeframe of timeframes) {
        try {
          const response = await api.get(`/api/workers/${worker._id}/performance`, {
            params: { timeframe }
          });
          
          if (response.data) {
            allData[timeframe] = response.data;
          }
        } catch (error) {
          console.error(`Error fetching ${timeframe} performance data:`, error);
        }
      }
      
      // If we have no data at all, use worker stats to populate at least something
      const hasPerformanceData = Object.keys(allData).length > 0;
      
      if (!hasPerformanceData) {
        // Use worker's performance stats
        const performanceUpdate = {
          weekly: {
            tasksCompleted: worker.performance?.tasksCompleted || 0,
            targetAchievement: `${worker.performance?.efficiency || 0}%`,
            efficiencyRating: `${worker.performance?.efficiency || 0}%`,
            customerRating: `${worker.performance?.rating || 0}/5.0`
          },
          monthly: {
            totalCollections: worker.performance?.binsCollected || 0,
            binsServiced: worker.performance?.binsCollected || 0,
            routesCompleted: Math.round(worker.performance?.tasksCompleted / 3) || 0,
            attendance: "100%"
          },
          yearly: {
            totalTasks: worker.performance?.tasksCompleted || 0,
            averageEfficiency: `${worker.performance?.efficiency || 0}%`,
            totalDistance: `${worker.performance?.distanceCovered || 0} km`,
            yearlyRating: `${worker.performance?.rating || 0}/5.0`
          }
        };
        
        setPerformanceData(performanceUpdate);
      } else {
        // Set combined performance data from API
        setPerformanceData({
          weekly: {
            tasksCompleted: allData.weekly?.tasksCompleted || 0,
            targetAchievement: allData.weekly?.targetAchievement || "0%",
            efficiencyRating: allData.weekly?.efficiencyRating || "0%",
            customerRating: allData.weekly?.customerRating || "0/5.0"
          },
          monthly: {
            totalCollections: allData.monthly?.totalCollections || 0,
            binsServiced: allData.monthly?.binsServiced || 0,
            routesCompleted: allData.monthly?.routesCompleted || 0,
            attendance: allData.monthly?.attendance || "0%"
          },
          yearly: {
            totalTasks: allData.yearly?.totalTasks || 0,
            averageEfficiency: allData.yearly?.averageEfficiency || "0%",
            totalDistance: allData.yearly?.totalDistance || "0 km",
            yearlyRating: allData.yearly?.yearlyRating || "0/5.0"
          }
        });
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
    } finally {
      setPerformanceLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      setTaskLoading(true);
      
      if (!worker?._id) return;
      
      const response = await api.get(`/api/workers/${worker._id}/tasks`);
      setTasks(response.data || []);
      
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    } finally {
      setTaskLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      setDocumentLoading(true);
      
      if (!worker?._id) return;
      
      const response = await api.get(`/api/workers/${worker._id}/documents`);
      setDocuments(response.data || []);
      
    } catch (error) {
      console.error('Error fetching documents:', error);
      setDocuments([]);
    } finally {
      setDocumentLoading(false);
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
      default: return 'neutral';
    }
  };

  const formatJoinedDate = (dateValue) => {
    if (!dateValue) return 'Not available';
    
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) {
        return 'Not available';
      }
      return format(date, 'MMMM dd, yyyy');
    } catch (e) {
      return 'Not available';
    }
  };

  const getZoneName = (zoneId) => {
    if (!zoneId) return 'Not Assigned';
    
    if (!Array.isArray(zones)) {
      return zoneId;
    }
    
    const zone = zones.find(z => z._id === zoneId || z.id === zoneId);
    if (zone) {
      return zone.name || zone.zoneName || zoneId;
    }
    
    return zoneId;
  };

  const getDocumentTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'aadhar':
        return <FileCheck size={24} color="#4299e1" />;
      case 'pan':
        return <FileCheck size={24} color="#f6ad55" />;
      case 'drivinglicense':
      case 'driving_license':
      case 'driving-license':
        return <Truck size={24} color="#48bb78" />;
      case 'certification':
        return <Award size={24} color="#9f7aea" />;
      case 'training':
        return <CheckCircle size={24} color="#38b2ac" />; 
      case 'contract':
        return <FileText size={24} color="#ed8936" />;
      default:
        return <FileText size={24} />;
    }
  };



  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value
      }
    }));
  };

  const handleProfileUpdate = async () => {
    try {
      console.log('Updating profile with:', editForm);
      
      const updateData = {
        name: editForm.name,
        phone: editForm.phone,
        workerDetails: {
          address: editForm.address, // Send the nested address object
          emergencyContact: {
            name: editForm.emergencyContactName,
            phone: editForm.emergencyContactPhone,
            relationship: editForm.emergencyContactRelationship
          },
          education: editForm.education,
          dateOfBirth: editForm.dateOfBirth ? new Date(editForm.dateOfBirth) : undefined,
          gender: editForm.gender,
        }
      };
      
      const loadingToast = toast.loading('Updating profile...');
      
      const response = await api.patch(`/api/workers/${worker._id}`, { workerDetails: updateData.workerDetails, name: updateData.name, phone: updateData.phone });
      
      if (response.status === 200) {
        toast.dismiss(loadingToast);
        toast.success('Profile updated successfully');
        setModalOpen(false);
        fetchWorkerDetails();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleDocumentChange = (e) => {
    if (e.target.name === 'file') {
      setDocumentForm({
        ...documentForm,
        file: e.target.files[0],
        name: e.target.files[0]?.name || documentForm.name
      });
    } else {
      setDocumentForm({
        ...documentForm,
        [e.target.name]: e.target.value
      });
    }
  };

  const handleDocumentUpload = async (e) => {
    e.preventDefault();
    
    if (!documentForm.file) {
      toast.error('Please select a file to upload');
      return;
    }
    
    try {
      setIsUploading(true);
      
      // Create form data
      const formData = new FormData();
      formData.append('document', documentForm.file);
      formData.append('type', documentForm.type);
      formData.append('name', documentForm.name);
      
      // Upload file to /api/upload/worker/:workerId/document
      const uploadResponse = await api.post(`/api/upload/worker/${worker._id}/document`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (uploadResponse.status === 201) {
        // Add document to worker's documents array
        const documentResponse = await api.post(`/api/workers/${worker._id}/documents`, {
          name: documentForm.name,
          type: documentForm.type,
          url: uploadResponse.data.document.url
        });
        
        if (documentResponse.status === 201) {
          toast.success('Document uploaded successfully');
          
          // Reset form
          setDocumentForm({
            name: '',
            type: 'aadhar',
            file: null
          });
          
          // Clear file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          
          // Refresh documents
          fetchDocuments();
        }
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDocumentDelete = async (documentId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        const response = await api.delete(`/api/workers/${worker._id}/documents/${documentId}`);
        
        if (response.status === 200) {
          toast.success('Document deleted successfully');
          fetchDocuments();
        }
      } catch (error) {
        console.error('Error deleting document:', error);
        toast.error('Failed to delete document');
      }
    }
  };

  // Handle avatar file selection
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!validTypes.includes(file.type)) {
        toast.error('Please select a valid image file (JPG or PNG)');
        return;
      }
      
      if (file.size > maxSize) {
        toast.error('Image size should not exceed 5MB');
        return;
      }
      
      setAvatarFile(file);
      
      // Show preview
      const reader = new FileReader();
      reader.onload = (event) => {
        document.querySelector('.profile-avatar img').src = event.target.result;
      };
      reader.readAsDataURL(file);
      
      // Upload automatically
      handleAvatarUpload(file);
    }
  };
  
  // Handle avatar upload
  const handleAvatarUpload = async (file) => {
    if (!file) return;
    
    try {
      setIsUploading(true);
      
      // Upload to Cloudinary
      const response = await uploadToCloudinary(file, {
        folder: 'worker_avatars',
        onProgress: (progress) => {
          setUploadProgress(progress);
        }
      });
      
      if (response && response.secure_url) {
        // Update worker profile with new avatar URL
        await api.patch(`/api/workers/${worker._id}`, {
          avatar: response.secure_url
        });
        
        // Update local state
        setWorker({
          ...worker,
          avatar: response.secure_url
        });
        
        toast.success('Profile photo updated successfully');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload profile photo');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setAvatarFile(null);
    }
  };

  // Toggle worker status (active/inactive)
  const handleStatusToggle = async () => {
    try {
      // Get the desired new status
      const newStatus = worker.workerStatus === 'active' ? 'inactive' : 'active';
      console.log('🔄 Toggling worker status from', worker.workerStatus, 'to', newStatus);
      
      // Clear the force updated flag to allow future force updates
      localStorage.removeItem('statusForceUpdated');
      
      // Immediately update local state for better UX
      setWorker(prevWorker => ({
        ...prevWorker,
        workerStatus: newStatus,
        status: newStatus 
      }));
      
      // Persist to localStorage immediately
      localStorage.setItem('workerStatus', newStatus);
      localStorage.setItem('workerStatusUpdatedAt', new Date().toISOString());
      localStorage.setItem('workerId', worker._id);
      
      // Close the dropdown
      setShowStatusToggle(false);
      
      // Show loading toast
      const loadingToast = toast.loading(`Setting status to ${newStatus}...`);
      
      // First try the dedicated status update endpoint - it should handle both collections
      let success = false;
      let response;
      
      // Try the dedicated status update endpoint
      try {
        console.log(`📤 Using dedicated status update endpoint /api/workers/${worker._id}/status`);
        response = await api.patch(`/api/workers/${worker._id}/status`, { status: newStatus });
        
        if (response.status === 200) {
          console.log('✅ Status update successful using dedicated endpoint:', response.data);
          success = true;
        }
      } catch (dedicatedEndpointError) {
        console.error('❌ Dedicated endpoint failed:', dedicatedEndpointError);
        // Continue to fallback
      }
      
      // If the dedicated endpoint failed, fall back to regular patch
      if (!success) {
        console.log('⚠️ Falling back to regular patch endpoint');
        
        // Make multiple attempts to update the status (retry logic)
        for (let attempt = 1; attempt <= 3 && !success; attempt++) {
          try {
            // Update status on server
            console.log(`📤 Attempt ${attempt}: Sending status update to server`);
            response = await api.patch(`/api/workers/${worker._id}`, {
              workerStatus: newStatus,
              status: newStatus
            });
            
            console.log(`✅ Attempt ${attempt}: Status update successful`);
            success = true;
          } catch (attemptError) {
            console.error(`❌ Attempt ${attempt} failed:`, attemptError);
            
            // Wait before retrying (exponential backoff)
            if (attempt < 3) {
              const delay = Math.pow(2, attempt) * 500; // 1s, 2s, 4s
              console.log(`⏱️ Waiting ${delay}ms before retry ${attempt + 1}...`);
              await new Promise(resolve => setTimeout(resolve, delay));
            }
          }
        }
      }
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      if (success) {
        // Show success message
        toast.success(`Status changed to ${newStatus}`);
        
        // Verify the status was actually updated correctly
        setTimeout(() => {
          forceUpdateWorkerStatus(newStatus);
        }, 2000);
        
        // Diagnostic - log current status from server after changing
        setTimeout(async () => {
          try {
            console.log('🔍 Verifying worker status after update...');
            const verifyResponse = await api.get(`/api/workers/${worker._id}`);
            if (verifyResponse.status === 200) {
              const serverWorker = verifyResponse.data;
              console.log(`📊 Server status check: workerStatus=${serverWorker.workerStatus}, status=${serverWorker.status}`);
              
              // If status is still inconsistent, try force update
              if (serverWorker.workerStatus !== newStatus || serverWorker.status !== newStatus) {
                console.warn('⚠️ Status mismatch detected after update! Running force update...');
                await forceUpdateWorkerStatus(newStatus);
              }
            }
          } catch (verifyError) {
            console.error('❌ Failed to verify server status:', verifyError);
          }
        }, 5000);
      } else {
        // Show error message but don't revert the UI
        toast.error('Failed to update status on server, but your status is set locally.');
      }
    } catch (error) {
      console.error('Error changing status:', error);
      toast.error('Failed to change status. Please try again.');
    }
  };
  
  // Handle opening the edit profile modal
  const handleOpenEditModal = () => {
    const address = worker.workerDetails?.address || {};
    setEditForm({
      name: worker.name || '',
      email: worker.email || '',
      phone: worker.phone || '',
      address: {
        street: address.street || '',
        city: address.city || '',
        state: address.state || '',
        pincode: address.pincode || '',
        country: address.country || ''
      },
      dateOfBirth: worker.workerDetails?.dateOfBirth ? format(new Date(worker.workerDetails.dateOfBirth), 'yyyy-MM-dd') : '',
      gender: worker.workerDetails?.gender || '',
      emergencyContactName: worker.workerDetails?.emergencyContact?.name || '',
      emergencyContactPhone: worker.workerDetails?.emergencyContact?.phone || '',
      emergencyContactRelationship: worker.workerDetails?.emergencyContact?.relationship || '',
      education: worker.workerDetails?.education || '',
    });
    
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className="worker-own-profile-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="worker-own-profile-container">
        <div className="error-state">
          <AlertCircle size={48} />
          <h3>Profile Not Found</h3>
          <p>We couldn't load your profile information. Please try again later.</p>
          <button className="refresh-btn" onClick={fetchWorkerDetails}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="worker-own-profile-container">
      {/* Profile Header */}
      <div className="worker-profile-header">
        <div className="profile-avatar-section">
          <div className="profile-avatar">
            {worker.avatar ? (
              <img src={worker.avatar} alt={worker.name} />
            ) : (
              <span className="initials">{getInitials(worker.name)}</span>
            )}
            <span className={`status-indicator ${getStatusColor(worker.workerStatus)}`}></span>
            
            {/* Photo upload button */}
            <div className="avatar-upload">
              <input 
                type="file" 
                id="avatar-input" 
                ref={avatarInputRef}
                onChange={handleAvatarChange}
                accept="image/png, image/jpeg, image/jpg"
                style={{ display: 'none' }}
              />
              <button 
                className="avatar-edit-btn"
                onClick={() => avatarInputRef.current.click()}
                title="Change profile photo"
              >
                <Camera size={16} />
              </button>
              {isUploading && (
                <div className="upload-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="profile-name-section">
            <h1>{worker.name}</h1>
            <div className="worker-badges">
              <div 
                className={`status-badge ${getStatusColor(worker.workerStatus)}`}
                onClick={() => setShowStatusToggle(!showStatusToggle)}
                style={{ cursor: 'pointer' }}
              >
                {worker.workerStatus === 'active' ? 
                  <CheckCircle size={14} /> : 
                  <AlertCircle size={14} />
                }
                <span>{worker.workerStatus || 'Inactive'}</span>
                
                {/* Status toggle dropdown */}
                {showStatusToggle && (
                  <div className="status-toggle-dropdown">
                    <button 
                      className={`status-option ${worker.workerStatus === 'active' ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (worker.workerStatus !== 'active') handleStatusToggle();
                      }}
                    >
                      <Check size={14} />
                      <span>Active</span>
                    </button>
                    <button 
                      className={`status-option ${worker.workerStatus === 'inactive' ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (worker.workerStatus !== 'inactive') handleStatusToggle();
                      }}
                    >
                      <Power size={14} />
                      <span>Inactive</span>
                    </button>
                  </div>
                )}
              </div>
              <div className="worker-type-badge">
                {worker.workerType ? worker.workerType.charAt(0).toUpperCase() + worker.workerType.slice(1) : 'Worker'}
              </div>
              {worker.performance?.rating > 0 && (
                <div className="rating-badge">
                  <Star size={14} />
                  <span>{worker.performance.rating}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="profile-info-section">
          <div className="info-item">
            <MapPin size={16} />
            <span>{worker.zone ? getZoneName(worker.zone) : 'Not Assigned'}</span>
          </div>
          <div className="info-item">
            <Truck size={16} />
            <span>{worker.workerDetails?.vehicle || 'No Vehicle Assigned'}</span>
          </div>
          <div className="info-item">
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
          <div className="info-item">
            <Calendar size={16} />
            <span>Joined: {formatJoinedDate(worker.joinedDate)}</span>
          </div>
        </div>
      </div>

      {/* Profile Navigation */}
      <div className="worker-profile-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <User size={18} />
          <span>Overview</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'activities' ? 'active' : ''}`}
          onClick={() => setActiveTab('activities')}
        >
          <Activity size={18} />
          <span>Activities</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'performance' ? 'active' : ''}`}
          onClick={() => setActiveTab('performance')}
        >
          <BarChart2 size={18} />
          <span>Performance</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          <ClipboardList size={18} />
          <span>Tasks</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          <FileText size={18} />
          <span>Documents</span>
        </button>
      </div>

      {/* Profile Content */}
      <div className="worker-profile-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="profile-header-actions">
              <button 
                className="edit-profile-btn"
                onClick={handleOpenEditModal}
                title="Edit your profile"
              >
                <UserCog size={16} />
                <span>Edit Profile</span>
              </button>
            </div>
            
            <div className="profile-section">
              <h2>Personal Information</h2>
              <div className="personal-info-cards">
                <div className="personal-info-card">
                  <div className="info-icon">
                    <Mail size={20} color="#279e0a" />
                  </div>
                  <div className="info-content">
                    <span className="info-label">Email</span>
                    <span className="info-value">{worker.email}</span>
                  </div>
                </div>
                
                <div className="personal-info-card">
                  <div className="info-icon">
                    <Phone size={20} color="#279e0a" />
                  </div>
                  <div className="info-content">
                    <span className="info-label">Phone</span>
                    <span className="info-value">{worker.phone || 'Not provided'}</span>
                  </div>
                </div>
                
                <div className="personal-info-card">
                  <div className="info-icon">
                    <MapPin size={20} color="#279e0a" />
                  </div>
                  <div className="info-content">
                    <span className="info-label">Address</span>
                    <span className="info-value">{worker.address || 'Not provided'}</span>
                  </div>
                </div>
                
                <div className="personal-info-card">
                  <div className="info-icon">
                    <MapPin size={20} color="#279e0a" />
                  </div>
                  <div className="info-content">
                    <span className="info-label">Pincode</span>
                    <span className="info-value">{worker.pincode || 'Not provided'}</span>
                  </div>
                </div>
                
                <div className="personal-info-card">
                  <div className="info-icon">
                    <Calendar size={20} color="#279e0a" />
                  </div>
                  <div className="info-content">
                    <span className="info-label">Date of Birth</span>
                    <span className="info-value">
                      {worker.personalInfo?.dateOfBirth ? 
                        (worker.personalInfo.dateOfBirth instanceof Date && !isNaN(worker.personalInfo.dateOfBirth)) ? 
                          format(worker.personalInfo.dateOfBirth, 'MMMM dd, yyyy') : 
                          typeof worker.personalInfo.dateOfBirth === 'string' ? 
                            worker.personalInfo.dateOfBirth : 'Not provided' : 
                          'Not provided'}
                    </span>
                  </div>
                </div>
                
                {worker.personalInfo?.emergencyContact?.name && (
                  <div className="personal-info-card">
                    <div className="info-icon">
                      <User size={20} color="#279e0a" />
                    </div>
                    <div className="info-content">
                      <span className="info-label">Emergency Contact</span>
                      <span className="info-value">
                        {worker.personalInfo.emergencyContact.name} 
                        {worker.personalInfo.emergencyContact.phone && ` (${worker.personalInfo.emergencyContact.phone})`}
                        {worker.personalInfo.emergencyContact.relationship && ` - ${worker.personalInfo.emergencyContact.relationship}`}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="profile-section">
              <h2>Work Information</h2>
              <div className="personal-info-cards">
                <div className="personal-info-card">
                  <div className="info-icon">
                    <User size={20} color="#279e0a" />
                  </div>
                  <div className="info-content">
                    <span className="info-label">Employee ID</span>
                    <span className="info-value">{worker.workerId}</span>
                  </div>
                </div>
                <div className="personal-info-card">
                  <div className="info-icon">
                    <MapPin size={20} color="#279e0a" />
                  </div>
                  <div className="info-content">
                    <span className="info-label">Zone</span>
                    <span className="info-value">{worker.zone ? getZoneName(worker.zone) : 'Not Assigned'}</span>
                  </div>
                </div>
                <div className="personal-info-card">
                  <div className="info-icon">
                    <Truck size={20} color="#279e0a" />
                  </div>
                  <div className="info-content">
                    <span className="info-label">Role</span>
                    <span className="info-value">{worker.workerType ? worker.workerType.charAt(0).toUpperCase() + worker.workerType.slice(1) : 'Not assigned'}</span>
                  </div>
                </div>
                <div className="personal-info-card">
                  <div className="info-icon">
                    <Clock size={20} color="#279e0a" />
                  </div>
                  <div className="info-content">
                    <span className="info-label">Shift</span>
                    <span className="info-value">{worker.shift || 'Not assigned'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-section">
              <h2>Performance Summary</h2>
              <div className="performance-summary">
                <div className="metric-card">
                  <div className="metric-value">{worker.performance?.tasksCompleted || 0}</div>
                  <div className="metric-label">Tasks Completed</div>
                </div>
                <div className="metric-card">
                  <div className="metric-value">{worker.performance?.binsCollected || 0}</div>
                  <div className="metric-label">Bins Collected</div>
                </div>
                <div className="metric-card">
                  <div className="metric-value">{worker.performance?.efficiency ? `${worker.performance.efficiency}%` : '0%'}</div>
                  <div className="metric-label">Efficiency</div>
                </div>
                <div className="metric-card">
                  <div className="metric-value">{worker.performance?.distanceCovered || 0}km</div>
                  <div className="metric-label">Distance Covered</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activities' && (
          <div className="activities-tab">
            <div className="section-header">
              <h2>Recent Activities</h2>
              <div className="timeframe-selector">
                <select 
                  value={activityTimeframe} 
                  onChange={(e) => setActivityTimeframe(e.target.value)}
                >
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="all">All Time</option>
                </select>
              </div>
            </div>

            {activityLoading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading activities...</p>
              </div>
            ) : activities.length === 0 ? (
              <div className="empty-state">
                <Activity size={48} />
                <h3>No Activities</h3>
                <p>You don't have any recorded activities in the selected timeframe.</p>
              </div>
            ) : (
              <div className="activities-list">
                {activities.map((activity) => (
                  <div key={activity.id || activity._id} className="activity-card">
                    <div className="activity-icon">
                      <Activity size={20} />
                    </div>
                    <div className="activity-content">
                      <h3>{activity.title || 'Activity'}</h3>
                      <p>{activity.description || 'No description'}</p>
                      <div className="activity-meta">
                        <span className="activity-time">
                          {activity.timestamp ? formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true }) : 'No timestamp'}
                        </span>
                        <span className={`activity-status ${activity.status || 'unknown'}`}>
                          {activity.status || 'Unknown status'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="performance-tab">
            <h2>Performance Analytics</h2>
            <div className="timeframe-selector">
              <label>Timeframe:</label>
              <select value={performanceTimeframe} onChange={(e) => setPerformanceTimeframe(e.target.value)}>
                <option value="weekly">This Week</option>
                <option value="monthly">This Month</option>
                <option value="quarterly">Last 3 Months</option>
                <option value="yearly">This Year</option>
              </select>
            </div>
            
            {performanceLoading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading performance data...</p>
              </div>
            ) : (
              <>
                <div className="performance-cards">
                  <div className="performance-card">
                    <h3>
                      <ClipboardList size={18} />
                      Task Completion
                    </h3>
                    <div className="performance-stats">
                      <div className="stat-item">
                        <span className="stat-label">Tasks Completed</span>
                        <span className="stat-value">{performanceData.weekly.tasksCompleted}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Target Achievement</span>
                        <span className="stat-value">{performanceData.weekly.targetAchievement}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Completion Rate</span>
                        <span className="stat-value">{performanceData.weekly.efficiencyRating}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="performance-card">
                    <h3>
                      <Truck size={18} />
                      Collection Stats
                    </h3>
                    <div className="performance-stats">
                      <div className="stat-item">
                        <span className="stat-label">Total Collections</span>
                        <span className="stat-value">{performanceData.monthly.totalCollections}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Bins Serviced</span>
                        <span className="stat-value">{performanceData.monthly.binsServiced}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Average Per Day</span>
                        <span className="stat-value">
                          {Math.round(performanceData.monthly.binsServiced / 
                            (performanceTimeframe === 'weekly' ? 7 : 
                             performanceTimeframe === 'monthly' ? 30 : 90))}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="performance-card">
                    <h3>
                      <BarChart2 size={18} />
                      Efficiency Rating
                    </h3>
                    <div className="performance-stats">
                      <div className="stat-item">
                        <span className="stat-label">Efficiency Rate</span>
                        <span className="stat-value">{performanceData.weekly.efficiencyRating}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Customer Rating</span>
                        <span className="stat-value">{performanceData.weekly.customerRating}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">On-time Completion</span>
                        <span className="stat-value">{performanceData.weekly.efficiencyRating}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="performance-card">
                    <h3>
                      <Map size={18} />
                      Route Stats
                    </h3>
                    <div className="performance-stats">
                      <div className="stat-item">
                        <span className="stat-label">Routes Completed</span>
                        <span className="stat-value">{performanceData.monthly.routesCompleted}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Attendance</span>
                        <span className="stat-value">{performanceData.monthly.attendance}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Distance Covered</span>
                        <span className="stat-value">{worker.performance?.distanceCovered || 0} km</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="performance-summary-card">
                  <h3>
                    <Activity size={18} />
                    Overall Statistics
                  </h3>
                  <div className="overall-stats">
                    <div className="stat-item large">
                      <span className="stat-value">{worker.performance?.distanceCovered || 0} km</span>
                      <span className="stat-label">Total Distance Covered</span>
                    </div>
                    <div className="stat-item large">
                      <span className="stat-value">{worker.performance?.rating || 0}/5</span>
                      <span className="stat-label">Overall Rating</span>
                    </div>
                    <div className="stat-item large">
                      <span className="stat-value">{worker.performance?.efficiency || 0}%</span>
                      <span className="stat-label">Efficiency Rate</span>
                    </div>
                    <div className="stat-item large">
                      <span className="stat-value">{worker.performance?.tasksCompleted || 0}</span>
                      <span className="stat-label">Total Tasks Completed</span>
                    </div>
                    <div className="stat-item large">
                      <span className="stat-value">{worker.performance?.binsCollected || 0}</span>
                      <span className="stat-label">Total Bins Collected</span>
                    </div>
                    <div className="stat-item large">
                      <span className="stat-value">{formatJoinedDate(worker.joinedDate)}</span>
                      <span className="stat-label">Working Since</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="tasks-tab">
            <h2>My Tasks</h2>
            
            {taskLoading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading tasks...</p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="empty-state">
                <ClipboardList size={48} />
                <h3>No Tasks</h3>
                <p>You don't have any assigned tasks at the moment.</p>
              </div>
            ) : (
              <div className="tasks-list">
                {tasks.map((task) => (
                  <div key={task.id || task._id} className="task-card">
                    <div className={`task-status ${task.status || 'pending'}`}>
                      {task.status === 'completed' ? (
                        <CheckCircle size={16} />
                      ) : (
                        <Clock size={16} />
                      )}
                    </div>
                    <div className="task-content">
                      <h3>{task.title || 'Task'}</h3>
                      <p>{task.description || 'No description'}</p>
                      <div className="task-meta">
                        <span className="task-deadline">
                          Due: {task.deadline ? format(new Date(task.deadline), 'MMM dd, yyyy') : 'No deadline'}
                        </span>
                        <span className="task-priority">
                          Priority: {task.priority || 'Normal'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="documents-tab">
            <div className="section-header">
              <h2>My Documents</h2>
              <button 
                className="add-document-btn"
                onClick={() => setIsUploading(!isUploading)}
              >
                <PlusCircle size={16} />
                <span>{isUploading ? 'Cancel Upload' : 'Upload Document'}</span>
              </button>
            </div>
            
            {isUploading && (
              <div className="upload-form">
                <h3>Upload New Document</h3>
                <form onSubmit={handleDocumentUpload}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Document Type</label>
                      <select 
                        name="type" 
                        value={documentForm.type}
                        onChange={handleDocumentChange}
                        required
                      >
                        <option value="aadhar">Aadhar Card</option>
                        <option value="pan">PAN Card</option>
                        <option value="drivingLicense">Driving License</option>
                        <option value="certification">Certification</option>
                        <option value="training">Training</option>
                        <option value="contract">Contract</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Document Name</label>
                      <input 
                        type="text" 
                        name="name"
                        placeholder="E.g., My Aadhar Card"
                        value={documentForm.name}
                        onChange={handleDocumentChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>File</label>
                    <div className="file-input-container">
                      <input 
                        type="file" 
                        name="file"
                        ref={fileInputRef}
                        onChange={handleDocumentChange}
                        accept=".jpg,.jpeg,.png,.pdf"
                        required
                      />
                      <div className="file-input-button">
                        <Upload size={16} />
                        <span>Choose File</span>
                      </div>
                      {documentForm.file && (
                        <div className="file-name">
                          {documentForm.file.name}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="cancel-btn"
                      onClick={() => {
                        setIsUploading(false);
                        setDocumentForm({
                          name: '',
                          type: 'aadhar',
                          file: null
                        });
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="upload-btn"
                      disabled={!documentForm.file}
                    >
                      <Upload size={16} />
                      Upload Document
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {documentLoading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading documents...</p>
              </div>
            ) : documents.length === 0 ? (
              <div className="empty-state">
                <FileText size={48} />
                <h3>No Documents</h3>
                <p>You don't have any documents in your profile.</p>
                <button 
                  className="upload-document-btn"
                  onClick={() => setIsUploading(true)}
                >
                  <Upload size={16} />
                  Upload Document
                </button>
              </div>
            ) : (
              <div className="documents-list">
                {documents.map((doc) => (
                  <div key={doc.id || doc._id} className="document-card">
                    <div className="document-icon">
                      {getDocumentTypeIcon(doc.type)}
                    </div>
                    <div className="document-content">
                      <h3>{doc.name || 'Document'}</h3>
                      <div className="document-meta">
                        <span className="document-type">
                          {doc.type ? doc.type.charAt(0).toUpperCase() + doc.type.slice(1) : 'Document'}
                        </span>
                        <span className="document-date">
                          Uploaded: {doc.uploadDate ? format(new Date(doc.uploadDate), 'MMM dd, yyyy') : 'Unknown'}
                        </span>
                        {doc.expiryDate && (
                          <span className="document-expiry">
                            Expires: {format(new Date(doc.expiryDate), 'MMM dd, yyyy')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="document-actions">
                      <a href={doc.url} className="document-action download" download target="_blank" rel="noopener noreferrer">
                        <Download size={16} />
                      </a>
                      <button 
                        className="document-action delete" 
                        onClick={() => handleDocumentDelete(doc.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="edit-profile-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Profile</h2>
              <button className="close-btn" onClick={() => setModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-content">
              <form onSubmit={(e) => {
                e.preventDefault();
                handleProfileUpdate();
                setModalOpen(false);
              }}>
                <div className="form-section">
                  <h3>Personal Information</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input 
                        type="text" 
                        name="name"
                        value={editForm.name}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input 
                        type="email" 
                        name="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                        disabled
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Phone</label>
                      <input 
                        type="text" 
                        name="phone"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Date of Birth</label>
                      <input 
                        type="date" 
                        name="dateOfBirth"
                        value={editForm.dateOfBirth}
                        onChange={(e) => setEditForm({...editForm, dateOfBirth: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Gender</label>
                      <select 
                        name="gender"
                        value={editForm.gender}
                        onChange={(e) => setEditForm({...editForm, gender: e.target.value})}
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="form-section">
                  <h3>Contact Information</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Street Address</label>
                      <input 
                        type="text" 
                        name="street"
                        value={editForm.address.street}
                        onChange={handleAddressChange}
                        placeholder="Enter street address"
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>City</label>
                      <input 
                        type="text" 
                        name="city"
                        value={editForm.address.city}
                        onChange={handleAddressChange}
                        placeholder="Enter city"
                      />
                    </div>
                    <div className="form-group">
                      <label>State</label>
                      <input 
                        type="text" 
                        name="state"
                        value={editForm.address.state}
                        onChange={handleAddressChange}
                        placeholder="Enter state"
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Pincode</label>
                      <input 
                        type="text" 
                        name="pincode"
                        value={editForm.address.pincode}
                        onChange={handleAddressChange}
                        placeholder="Enter pincode"
                      />
                    </div>
                    <div className="form-group">
                      <label>Country</label>
                      <input 
                        type="text" 
                        name="country"
                        value={editForm.address.country}
                        onChange={handleAddressChange}
                        placeholder="Enter country"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="form-section">
                  <h3>Emergency Contact</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Contact Name</label>
                      <input 
                        type="text" 
                        name="emergencyContactName"
                        value={editForm.emergencyContactName}
                        onChange={(e) => setEditForm({...editForm, emergencyContactName: e.target.value})}
                        placeholder="Enter emergency contact name"
                      />
                    </div>
                    <div className="form-group">
                      <label>Contact Phone</label>
                      <input 
                        type="text" 
                        name="emergencyContactPhone"
                        value={editForm.emergencyContactPhone}
                        onChange={(e) => setEditForm({...editForm, emergencyContactPhone: e.target.value})}
                        placeholder="Enter emergency contact phone"
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Relationship</label>
                      <input 
                        type="text" 
                        name="emergencyContactRelationship"
                        value={editForm.emergencyContactRelationship}
                        onChange={(e) => setEditForm({...editForm, emergencyContactRelationship: e.target.value})}
                        placeholder="E.g., Parent, Spouse, Sibling"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="form-section">
                  <h3>Additional Information</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Education</label>
                      <input 
                        type="text" 
                        name="education"
                        value={editForm.education}
                        onChange={(e) => setEditForm({...editForm, education: e.target.value})}
                        placeholder="Highest education level"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={() => setModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="save-btn">
                    <Save size={16} />
                    Save Changes
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

export default WorkerOwnProfile; 