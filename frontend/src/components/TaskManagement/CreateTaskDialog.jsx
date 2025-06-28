import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Autocomplete,
  Chip,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import api from '../../utils/axios';

const CreateTaskDialog = ({ open, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    bins: [],
    priority: 'medium',
    deadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    notes: '',
  });

  const [availableBins, setAvailableBins] = useState([]);
  const [availableWorkers, setAvailableWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [workerCapacityError, setWorkerCapacityError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [binsResponse, workersResponse] = await Promise.all([
          api.get('/bins'),
          api.get('/users', { params: { role: 'WORKER' } })
        ]);
        setAvailableBins(binsResponse.data);
        setAvailableWorkers(workersResponse.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load required data');
      }
    };

    if (open) {
      fetchData();
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setWorkerCapacityError(false);

    if (!formData.bins.length) {
      setError('Please select at least one bin');
      return;
    }

    if (!selectedWorker) {
      setError('Please select a worker');
      return;
    }

    try {
      setLoading(true);
      // Check worker capacity
      const capacityResponse = await api.get(`/users/${selectedWorker._id}/capacity`);
      if (!capacityResponse.data.hasCapacity) {
        setWorkerCapacityError(true);
        return;
      }

      const taskData = {
        ...formData,
        worker: selectedWorker._id,
        status: 'pending',
      };

      await onSubmit(taskData);
      handleClose();
    } catch (err) {
      console.error('Error creating task:', err);
      setError(err.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      bins: [],
      priority: 'medium',
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
      notes: '',
    });
    setSelectedWorker(null);
    setError(null);
    setWorkerCapacityError(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Create New Task</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {workerCapacityError && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Selected worker's bin capacity is full. Please choose another worker.
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Bin Selection */}
            <Autocomplete
              multiple
              options={availableBins}
              getOptionLabel={(bin) => `${bin.binId} - ${bin.address}`}
              value={formData.bins}
              onChange={(e, newValue) => setFormData({ ...formData, bins: newValue })}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Bins"
                  required
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((bin, index) => (
                  <Chip
                    label={bin.binId}
                    {...getTagProps({ index })}
                    color="primary"
                    variant="outlined"
                  />
                ))
              }
            />

            {/* Worker Selection */}
            <Autocomplete
              options={availableWorkers}
              getOptionLabel={(worker) => `${worker.name} (${worker.currentTasks || 0} tasks)`}
              value={selectedWorker}
              onChange={(e, newValue) => setSelectedWorker(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Assign Worker"
                  required
                />
              )}
            />

            {/* Priority */}
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                label="Priority"
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </Select>
            </FormControl>

            {/* Deadline */}
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Deadline"
                value={formData.deadline}
                onChange={(newValue) => setFormData({ ...formData, deadline: newValue })}
                minDateTime={new Date()}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>

            {/* Notes */}
            <TextField
              label="Notes"
              multiline
              rows={4}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any additional notes or instructions..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <LoadingButton
            type="submit"
            variant="contained"
            loading={loading}
          >
            Create Task
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateTaskDialog; 