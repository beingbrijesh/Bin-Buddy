import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Avatar,
  Button,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  useTheme,
  useMediaQuery,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Assignment as TaskIcon,
  Map as MapIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import api from '../../utils/axios';
import { toast } from 'react-hot-toast';
import SharedMapComponent from '../Maps/SharedMapComponent';

const WorkerDetail = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [assignedBins, setAssignedBins] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    fetchWorkerDetails();
  }, [id]);

  const fetchWorkerDetails = async () => {
    try {
      setLoading(true);
      const [workerResponse, tasksResponse, binsResponse] = await Promise.all([
        api.get(`/users/${id}`),
        api.get(`/tasks?workerId=${id}&limit=5`),
        api.get(`/bins?workerId=${id}`)
      ]);

      setWorker(workerResponse.data);
      setTasks(tasksResponse.data);
      setAssignedBins(binsResponse.data);
    } catch (error) {
      console.error('Error fetching worker details:', error);
      setError(error.response?.data?.message || 'Failed to fetch worker details');
      toast.error('Failed to load worker details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async () => {
    try {
      const newStatus = worker.status === 'active' ? 'inactive' : 'active';
      await api.patch(`/users/${id}`, { status: newStatus });
      setWorker({ ...worker, status: newStatus });
      toast.success(`Worker status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update worker status');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/users/${id}`);
      toast.success('Worker deleted successfully');
      navigate('/management/workers');
    } catch (error) {
      toast.error('Failed to delete worker');
    }
    setConfirmDelete(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!worker) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">Worker not found</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h5" component="h1">
          Worker Profile
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          startIcon={<EditIcon />}
          variant="outlined"
          onClick={() => navigate(`/management/workers/edit/${id}`)}
        >
          Edit
        </Button>
        <Button
          startIcon={<DeleteIcon />}
          variant="outlined"
          color="error"
          onClick={() => setConfirmDelete(true)}
        >
          Delete
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Main Info Card */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ p: 3, border: `1px solid ${theme.palette.divider}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar
                src={worker.avatar}
                sx={{ width: 80, height: 80 }}
              >
                <PersonIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">
                  {worker.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Worker ID: {worker._id}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={worker.status === 'active'}
                        onChange={handleStatusToggle}
                        color="success"
                      />
                    }
                    label={worker.status === 'active' ? 'Active' : 'Inactive'}
                  />
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Contact Information */}
            <Typography variant="subtitle2" gutterBottom color="textSecondary">
              Contact Information
            </Typography>
            <List>
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <EmailIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Email"
                  secondary={worker.email}
                />
              </ListItem>
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <PhoneIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Phone"
                  secondary={worker.phone}
                />
              </ListItem>
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <LocationIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Zone"
                  secondary={worker.zone || 'No zone assigned'}
                />
              </ListItem>
            </List>

            <Divider sx={{ my: 2 }} />

            {/* Performance Stats */}
            <Typography variant="subtitle2" gutterBottom color="textSecondary">
              Performance Statistics
            </Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="primary">
                      {assignedBins.length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Assigned Bins
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="primary">
                      {tasks.filter(t => t.status === 'completed').length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Completed Tasks
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="primary">
                      {worker.performanceScore || 0}%
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Performance Score
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Assigned Bins and Tasks */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            {/* Assigned Bins */}
            <Paper elevation={0} sx={{ p: 3, border: `1px solid ${theme.palette.divider}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">
                  Assigned Bins
                </Typography>
                <IconButton onClick={() => setShowMap(true)}>
                  <MapIcon />
                </IconButton>
              </Box>
              <List>
                {assignedBins.slice(0, 5).map((bin) => (
                  <ListItem
                    key={bin._id}
                    button
                    onClick={() => navigate(`/management/bins/${bin._id}`)}
                  >
                    <ListItemText
                      primary={bin.binId}
                      secondary={bin.address?.streetAddress}
                    />
                    <ListItemSecondaryAction>
                      <Chip
                        label={bin.status}
                        size="small"
                        color={bin.status === 'empty' ? 'success' : 'warning'}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
              {assignedBins.length > 5 && (
                <Button
                  fullWidth
                  variant="text"
                  onClick={() => navigate(`/management/workers/${id}/bins`)}
                >
                  View All ({assignedBins.length})
                </Button>
              )}
            </Paper>

            {/* Recent Tasks */}
            <Paper elevation={0} sx={{ p: 3, border: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="h6" gutterBottom>
                Recent Tasks
              </Typography>
              <List>
                {tasks.map((task) => (
                  <ListItem key={task._id}>
                    <ListItemAvatar>
                      <Avatar>
                        <TaskIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={task.type}
                      secondary={format(new Date(task.date), 'MMM dd, yyyy HH:mm')}
                    />
                    <ListItemSecondaryAction>
                      <Chip
                        label={task.status}
                        size="small"
                        color={task.status === 'completed' ? 'success' : 'warning'}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      {/* Map Dialog */}
      <Dialog
        open={showMap}
        onClose={() => setShowMap(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Assigned Bins Map
        </DialogTitle>
        <DialogContent>
          <Box sx={{ height: 400 }}>
            <SharedMapComponent
              markers={assignedBins.map(bin => ({
                id: bin._id,
                position: {
                  lat: bin.location.coordinates[1],
                  lng: bin.location.coordinates[0]
                },
                title: bin.binId,
                content: bin.address?.streetAddress
              }))}
              height="400px"
            />
          </Box>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
      >
        <DialogTitle>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this worker? This action cannot be undone.
          </Typography>
          <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default WorkerDetail; 