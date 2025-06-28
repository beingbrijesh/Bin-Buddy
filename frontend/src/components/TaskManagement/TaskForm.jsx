import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
  Grid,
  TextField,
  FormHelperText,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { DateTimePicker } from '@mui/x-date-pickers';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import SharedMapComponent from '../Maps/SharedMapComponent';

const TaskForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [workers, setWorkers] = useState([]);
  const [bins, setBins] = useState([]);
  const [position, setPosition] = useState(null);
  const [formData, setFormData] = useState({
    workerId: '',
    binId: '',
    startTime: new Date(),
    endTime: null,
    notes: '',
    priority: 'normal',
    status: 'pending',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchWorkers();
    fetchBins();
    if (isEdit) {
      fetchTaskData();
    }
  }, [id]);

  const fetchWorkers = async () => {
    try {
      const response = await axios.get('/api/users', { params: { role: 'worker', availability: 'available' } });
      setWorkers(response.data);
    } catch (error) {
      console.error('Error fetching workers:', error);
    }
  };

  const fetchBins = async () => {
    try {
      const response = await axios.get('/api/bins');
      setBins(response.data);
    } catch (error) {
      console.error('Error fetching bins:', error);
    }
  };

  const fetchTaskData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/tasks/${id}`);
      const task = response.data;
      setFormData({
        workerId: task.workerId,
        binId: task.binId,
        startTime: new Date(task.startTime),
        endTime: task.endTime ? new Date(task.endTime) : null,
        notes: task.notes || '',
        priority: task.priority,
        status: task.status,
      });
      if (task.pickupLocation?.coordinates) {
        setPosition([task.pickupLocation.coordinates[1], task.pickupLocation.coordinates[0]]);
      }
    } catch (error) {
      toast.error('Failed to fetch task data');
      console.error('Error fetching task:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.workerId) {
      newErrors.workerId = 'Worker is required';
    }
    if (!formData.binId) {
      newErrors.binId = 'Bin is required';
    }
    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }
    if (formData.endTime && formData.endTime < formData.startTime) {
      newErrors.endTime = 'End time must be after start time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const taskData = {
      ...formData,
      pickupLocation: position ? {
        type: 'Point',
        coordinates: [position[1], position[0]], // [longitude, latitude]
      } : undefined,
    };

    try {
      setLoading(true);
      if (isEdit) {
        await axios.patch(`/api/tasks/${id}`, taskData);
        toast.success('Task updated successfully');
      } else {
        await axios.post('/api/tasks', taskData);
        toast.success('Task created successfully');
      }
      navigate('/tasks');
    } catch (error) {
      toast.error(isEdit ? 'Failed to update task' : 'Failed to create task');
      console.error('Error saving task:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleMapClick = (location) => {
    setPosition([location.lat, location.lng]);
  };

  const markers = position ? [{
    id: 'task-location',
    position: { lat: position[0], lng: position[1] },
    title: 'Task Location',
    content: 'Click anywhere on the map to change location'
  }] : [];

  return (
    <Box className="p-4">
      <Typography variant="h5" component="h2" className="mb-4">
        {isEdit ? 'Edit Task' : 'Assign New Task'}
      </Typography>

      <form onSubmit={handleSubmit}>
        <Paper className="p-4 mb-4">
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={Boolean(errors.workerId)}>
                <InputLabel>Worker</InputLabel>
                <Select
                  name="workerId"
                  value={formData.workerId}
                  onChange={handleChange}
                  label="Worker"
                  required
                >
                  {workers.map((worker) => (
                    <MenuItem key={worker._id} value={worker._id}>
                      {worker.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.workerId && (
                  <FormHelperText>{errors.workerId}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={Boolean(errors.binId)}>
                <InputLabel>Bin</InputLabel>
                <Select
                  name="binId"
                  value={formData.binId}
                  onChange={handleChange}
                  label="Bin"
                  required
                >
                  {bins.map((bin) => (
                    <MenuItem key={bin._id} value={bin._id}>
                      {bin.binId} - {bin.address}
                    </MenuItem>
                  ))}
                </Select>
                {errors.binId && (
                  <FormHelperText>{errors.binId}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <DateTimePicker
                label="Start Time"
                value={formData.startTime}
                onChange={(date) => {
                  setFormData((prev) => ({ ...prev, startTime: date }));
                  if (errors.startTime) {
                    setErrors((prev) => ({ ...prev, startTime: undefined }));
                  }
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    error: Boolean(errors.startTime),
                    helperText: errors.startTime,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DateTimePicker
                label="End Time"
                value={formData.endTime}
                onChange={(date) => {
                  setFormData((prev) => ({ ...prev, endTime: date }));
                  if (errors.endTime) {
                    setErrors((prev) => ({ ...prev, endTime: undefined }));
                  }
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: Boolean(errors.endTime),
                    helperText: errors.endTime,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  label="Priority"
                  required
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="normal">Normal</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                  required
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="inProgress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Select Task Location
              </Typography>
              <Box sx={{ height: 400, width: '100%', mb: 2 }}>
                <SharedMapComponent
                  markers={markers}
                  height="400px"
                  onMapClick={handleMapClick}
                  markerType="task"
                  defaultZoom={13}
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/tasks')}
                >
                  Cancel
                </Button>
                <LoadingButton
                  type="submit"
                  variant="contained"
                  loading={loading}
                >
                  {isEdit ? 'Update Task' : 'Create Task'}
                </LoadingButton>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </form>
    </Box>
  );
};

export default TaskForm; 