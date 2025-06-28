import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  Card,
  CardContent,
} from '@mui/material';
import {
  Image as ImageIcon,
  LocationOn as LocationIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import SharedMapComponent from '../Maps/SharedMapComponent';

const LocationDialog = ({ location, onClose }) => {
  const markers = location ? [{
    id: 'activity-location',
    position: { lat: location.coordinates[1], lng: location.coordinates[0] },
    title: 'Activity Location',
    content: 'Worker was here'
  }] : [];

  return (
    <Dialog open={Boolean(location)} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Activity Location</DialogTitle>
      <DialogContent>
        <Box sx={{ height: 400, width: '100%' }}>
          <SharedMapComponent
            markers={markers}
            height="400px"
            defaultZoom={16}
            isInteractive={false}
            markerType="worker"
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

const WorkerActivity = () => {
  const { id } = useParams();
  const [worker, setWorker] = useState(null);
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    onTimePercentage: 0,
    averageRating: 0,
    totalWasteCollected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    fetchWorkerData();
    fetchActivities();
    fetchStats();
  }, [id]);

  const fetchWorkerData = async () => {
    try {
      const response = await axios.get(`/api/users/${id}`);
      setWorker(response.data);
    } catch (error) {
      toast.error('Failed to fetch worker data');
      console.error('Error fetching worker:', error);
    }
  };

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/bin-activity/worker/${id}`);
      setActivities(response.data);
    } catch (error) {
      toast.error('Failed to fetch activities');
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`/api/users/${id}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getActionColor = (actionType) => {
    const colors = {
      pickup: 'success',
      dispose: 'warning',
      report: 'error',
      maintenance: 'info'
    };
    return colors[actionType] || 'default';
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const StatCard = ({ title, value, icon, color }) => (
    <Card>
      <CardContent>
        <Box className="flex items-center gap-2 mb-2">
          {icon}
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" color={color}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box className="p-4">
      <Typography variant="h5" component="h2" className="mb-4">
        Worker Activity & Performance
      </Typography>

      {worker && (
        <Paper className="p-4 mb-4">
          <Typography variant="h6" gutterBottom>
            {worker.name}
          </Typography>
          <Typography color="textSecondary" gutterBottom>
            {worker.email} • {worker.phone}
          </Typography>
          <Chip
            label={worker.availability}
            color={worker.availability === 'available' ? 'success' : 'warning'}
            size="small"
          />
        </Paper>
      )}

      <Grid container spacing={3} className="mb-4">
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Tasks Completed"
            value={`${stats.completedTasks}/${stats.totalTasks}`}
            icon={<CheckCircleIcon color="success" />}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="On-Time Performance"
            value={`${stats.onTimePercentage}%`}
            icon={<WarningIcon color="warning" />}
            color="warning.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Average Rating"
            value={stats.averageRating.toFixed(1)}
            icon={<ErrorIcon color="error" />}
            color="error.main"
          />
        </Grid>
      </Grid>

      <Typography variant="h6" className="mb-2">
        Recent Activities
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date & Time</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Bin ID</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Waste Volume</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : activities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No activities found
                </TableCell>
              </TableRow>
            ) : (
              activities.map((activity) => (
                <TableRow key={activity._id}>
                  <TableCell>{formatDateTime(activity.timestamp)}</TableCell>
                  <TableCell>
                    <Chip
                      label={activity.actionType}
                      color={getActionColor(activity.actionType)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{activity.binId}</TableCell>
                  <TableCell>
                    <Chip
                      label={activity.binStatus}
                      color={activity.binStatus === 'empty' ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {activity.wasteVolume ? `${activity.wasteVolume} kg` : '-'}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {activity.location && (
                        <IconButton
                          size="small"
                          onClick={() => setSelectedLocation(activity.location)}
                        >
                          <LocationIcon fontSize="small" />
                        </IconButton>
                      )}
                      {activity.photoURL && (
                        <IconButton
                          size="small"
                          onClick={() => setSelectedImage(activity.photoURL)}
                        >
                          <ImageIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Image Dialog */}
      <Dialog
        open={Boolean(selectedImage)}
        onClose={() => setSelectedImage(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Activity Photo</DialogTitle>
        <DialogContent>
          <img
            src={selectedImage}
            alt="Activity"
            style={{ width: '100%', height: 'auto' }}
          />
        </DialogContent>
      </Dialog>

      {/* Location Dialog */}
      <LocationDialog
        location={selectedLocation}
        onClose={() => setSelectedLocation(null)}
      />
    </Box>
  );
};

export default WorkerActivity; 