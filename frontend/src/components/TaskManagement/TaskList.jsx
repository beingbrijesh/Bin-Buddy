import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  TextField,
  Box,
  Typography,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as VerifyIcon,
  LocationOn as LocationIcon,
  Image as ImageIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { DatePicker } from '@mui/x-date-pickers';
import SharedMapComponent from '../Maps/SharedMapComponent';
import { format } from 'date-fns';
import api from '../../utils/axios';

const LocationDialog = ({ location, onClose }) => {
  const markers = location ? [{
    id: 'task-location',
    position: { lat: location.coordinates[1], lng: location.coordinates[0] },
    title: 'Task Location',
    content: 'Pickup location for this task'
  }] : [];

  return (
    <Dialog open={Boolean(location)} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Task Location</DialogTitle>
      <DialogContent>
        <Box sx={{ height: 400, width: '100%' }}>
          <SharedMapComponent
            markers={markers}
            height="400px"
            defaultZoom={16}
            isInteractive={false}
            markerType="task"
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

const TaskList = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    workerId: '',
    startDate: null,
    endDate: null,
  });
  const [workers, setWorkers] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [verificationDialog, setVerificationDialog] = useState(false);
  const [verificationPhoto, setVerificationPhoto] = useState(null);
  const [verificationNotes, setVerificationNotes] = useState('');

  useEffect(() => {
    fetchWorkers();
    fetchTasks();
  }, [filters]);

  const fetchWorkers = async () => {
    try {
      const response = await api.get('/users', { params: { role: 'worker' } });
      setWorkers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching workers:', error);
      setWorkers([]);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      console.log('Fetching tasks with filters:', filters);
      
      const params = {
        ...filters,
        startDate: filters.startDate?.toISOString(),
        endDate: filters.endDate?.toISOString(),
      };
      
      // Only include non-empty filters
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== null && v !== '')
      );
      
      console.log('Request params:', cleanParams);
      
      // Make API request without params first to test basic connectivity
      const response = await api.get('/tasks');
      console.log('Tasks API response:', response.data);
      
      setTasks(Array.isArray(response.data) ? response.data : 
               (response.data?.data || []));
    } catch (error) {
      console.error('Error fetching tasks - full error:', error);
      console.error('Error response:', error.response);
      console.error('Error request:', error.request);
      console.error('Error message:', error.message);
      
      toast.error(`Failed to fetch tasks: ${error.message}`);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success('Task deleted successfully');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to delete task');
      console.error('Error deleting task:', error);
    }
  };

  const handleVerify = async (taskId) => {
    try {
      await api.post(`/tasks/${taskId}/verify`, {
        isApproved: true,
        verificationNote: 'Task verified by admin',
      });
      toast.success('Task verified successfully');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to verify task');
      console.error('Error verifying task:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      in_progress: 'info',
      completed: 'success',
      verified: 'success'
    };
    return colors[status] || 'default';
  };

  const getPriorityIcon = (priority) => {
    const count = {
      low: 1,
      medium: 2,
      high: 3,
      urgent: 4
    }[priority] || 1;

    return '!'.repeat(count);
  };

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}/status`, { status: newStatus });
      toast.success('Task status updated successfully');
      fetchTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleVerificationSubmit = async () => {
    if (!verificationPhoto) return;

    try {
      const formData = new FormData();
      formData.append('photo', verificationPhoto);
      formData.append('notes', verificationNotes);

      await api.post(`/tasks/${selectedTask._id}/verify`, formData);
      handleCloseVerification();
    } catch (error) {
      console.error('Error submitting verification:', error);
    }
  };

  const handleCloseVerification = () => {
    setVerificationDialog(false);
    setSelectedTask(null);
    setVerificationPhoto(null);
    setVerificationNotes('');
  };

  return (
    <div className="p-4">
      <Box className="mb-4 flex justify-between items-center">
        <Typography variant="h5" component="h2">
          Task Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/tasks/new')}
        >
          Assign New Task
        </Button>
      </Box>

      {/* Filters */}
      <Paper className="mb-4 p-4">
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="verified">Verified</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Worker</InputLabel>
              <Select
                value={filters.workerId}
                label="Worker"
                onChange={(e) => setFilters({ ...filters, workerId: e.target.value })}
              >
                <MenuItem value="">All</MenuItem>
                {workers.map((worker) => (
                  <MenuItem key={worker._id} value={worker._id}>
                    {worker.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <DatePicker
              label="Start Date"
              value={filters.startDate}
              onChange={(date) => setFilters({ ...filters, startDate: date })}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <DatePicker
              label="End Date"
              value={filters.endDate}
              onChange={(date) => setFilters({ ...filters, endDate: date })}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Worker</TableCell>
              <TableCell>Bin</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>End Time</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task._id}>
                <TableCell>{task.workerName}</TableCell>
                <TableCell>{task.binId}</TableCell>
                <TableCell>{format(new Date(task.startTime), 'PPp')}</TableCell>
                <TableCell>
                  {task.endTime ? format(new Date(task.endTime), 'PPp') : '-'}
                </TableCell>
                <TableCell>
                  <Chip
                    label={task.status.replace('_', ' ')}
                    color={getStatusColor(task.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={`Priority: ${getPriorityIcon(task.priority)}`}
                    color={task.priority === 'urgent' ? 'error' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {task.pickupLocation && (
                      <IconButton
                        size="small"
                        onClick={() => setSelectedLocation(task.pickupLocation)}
                      >
                        <LocationIcon fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/tasks/edit/${task._id}`)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    {task.status === 'completed' && (
                      <IconButton
                        size="small"
                        startIcon={<PhotoCameraIcon />}
                        onClick={() => {
                          setSelectedTask(task);
                          setVerificationDialog(true);
                        }}
                      >
                        Verify Task
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(task._id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <LocationDialog
        location={selectedLocation}
        onClose={() => setSelectedLocation(null)}
      />

      {/* Verification Dialog */}
      <Dialog
        open={verificationDialog}
        onClose={handleCloseVerification}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Verify Task Completion</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<PhotoCameraIcon />}
            >
              Upload Photo
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => setVerificationPhoto(e.target.files[0])}
              />
            </Button>
            
            {verificationPhoto && (
              <Typography variant="body2" color="success.main">
                Photo selected: {verificationPhoto.name}
              </Typography>
            )}

            <TextField
              label="Verification Notes"
              multiline
              rows={4}
              value={verificationNotes}
              onChange={(e) => setVerificationNotes(e.target.value)}
              placeholder="Add any notes about the task completion..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseVerification}>Cancel</Button>
          <Button
            onClick={handleVerificationSubmit}
            variant="contained"
            disabled={!verificationPhoto}
          >
            Submit Verification
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TaskList; 