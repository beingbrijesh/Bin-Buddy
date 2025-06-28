import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Avatar as MuiAvatar,
  Card as MuiCard,
  CardContent,
  IconButton,
  Dialog as MuiDialog,
  DialogTitle as MuiDialogTitle,
  DialogContent as MuiDialogContent,
  DialogActions,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  useTheme,
  Badge as MuiBadge,
  Tooltip,
  Chip,
  Tabs,
  Tab,
  Stack,
  alpha,
  styled,
} from '@mui/material';
import {
  PhotoCamera as PhotoCameraIcon,
  Star as StarIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  LocalOffer as LocalOfferIcon,
  EmojiEvents as EmojiEventsIcon,
  Person as PersonIcon,
  History as HistoryIcon,
  EmojiEvents as TrophyIcon,
  CardGiftcard as RewardIcon,
  TrendingUp as TrendingUpIcon,
  BarChart as BarChartIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/axios';
import { toast as hotToast } from 'react-hot-toast';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tabs as ShadcnTabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  AlertTriangle,
  Award,
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  Phone,
  Star,
  Trash2,
  UserCog,
  Camera,
} from 'lucide-react';
import axios from '@/lib/axios';

const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'binbuddy_avatars';
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

// Styled Components
const StyledCard = styled(MuiCard)(({ theme }) => ({
  height: '100%',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const StatCard = styled(MuiCard)(({ theme, color }) => ({
  height: '100%',
  background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
  border: `1px solid ${alpha(color, 0.2)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  '& .MuiTab-root': {
    textTransform: 'none',
    fontWeight: 500,
    minWidth: 100,
    padding: '12px 16px',
  },
  '& .Mui-selected': {
    color: theme.palette.primary.main,
  },
}));

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`profile-tabpanel-${index}`}
    aria-labelledby={`profile-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

// Add this helper function at the top level
const formatDate = (dateString) => {
  try {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return format(date, 'MMM dd, yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

const formatDateTime = (dateString) => {
  try {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return format(date, 'MMM dd, yyyy HH:mm');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

const WorkerProfile = ({ open, onClose, workerId }) => {
  const theme = useTheme();
  const { user, logout, updateUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [stats, setStats] = useState({
    tasksCompleted: 0,
    binsPicked: 0,
    avgTimePerTask: 0,
    pointsEarned: 0,
  });
  const [badges, setBadges] = useState([]);
  const [activities, setActivities] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [worker, setWorker] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    if (workerId) {
      fetchWorkerDetails();
    }
  }, [workerId]);

  const fetchWorkerDetails = async () => {
    try {
      setLoading(true);
      
      // Try these API endpoints in sequence until one works
      const endpoints = [
        `/api/users/${workerId}`,
        `/users/${workerId}`,
        `/api/workers/${workerId}`,
        `/workers/${workerId}`
      ];
      
      let response = null;
      let error = null;
      
      for (let endpoint of endpoints) {
        try {
          console.log(`🔍 Trying to fetch worker details from: ${endpoint}`);
          response = await fetch(endpoint);
          if (response.ok) {
            console.log(`✅ Successfully fetched from ${endpoint}`);
            break;
          }
        } catch (err) {
          console.log(`❌ Failed to fetch from ${endpoint}:`, err.message);
          error = err;
        }
      }
      
      if (!response || !response.ok) {
        throw new Error(`Failed to fetch worker details: ${error?.message || 'Unknown error'}`);
      }

      const data = await response.json();

      // Process worker data to ensure all required fields exist
      const processedWorker = {
        ...data,
        workerStatus: data.workerStatus || data.status || 'active',
        workerType: data.workerType || (data.role === 'worker' ? 'collector' : data.role),
        performance: data.performance || data.workerDetails?.performance || {
          rating: data.rating || 0,
          tasksCompleted: data.tasksCompleted || 0,
          efficiency: data.efficiency || 0,
          binsCollected: data.binsCollected || 0,
          distanceCovered: data.distanceCovered || 0
        }
      };

      setWorker(processedWorker);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load worker details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading('Uploading image...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.secure_url) {
        await updateUser({ avatar: data.secure_url });
        toast.success('Profile photo updated successfully', { id: toastId });
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo', { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  if (!worker) return null;

  return (
    <Sheet open={open} onOpenChange={onClose} className="w-full sm:max-w-xl">
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Worker Profile</SheetTitle>
          <SheetDescription>View and manage worker details</SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : worker ? (
          <div className="space-y-6 py-4">
            {/* Profile Header */}
            <div className="relative">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar>
                    <img
                      src={worker.avatar || '/placeholder-avatar.png'}
                      alt={worker.name}
                      className="h-20 w-20 rounded-full object-cover"
                    />
                  </Avatar>
                  <div className="absolute bottom-0 right-0">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => document.getElementById('photo-upload').click()}
                    >
                      <Camera className="h-4 w-4" />
                      <input
                        id="photo-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                      />
                    </Button>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{worker.name}</h3>
                  <p className="text-sm text-muted-foreground">{worker.workerType}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleEdit(worker)}>
                <UserCog className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
              <Button variant="destructive" onClick={() => handleDelete(worker.id)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Worker
              </Button>
            </div>

            {/* Rest of the profile content */}
          </div>
        ) : (
          <div className="text-center py-8">
            <p>Worker not found</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default WorkerProfile; 