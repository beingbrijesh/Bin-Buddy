import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import TaskList from './TaskList';
import CreateTaskDialog from './CreateTaskDialog';
import TaskFilters from './TaskFilters';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/axios';

const TaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openFilters, setOpenFilters] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    worker: 'all',
    dateRange: {
      start: null,
      end: null,
    },
  });

  const { user } = useAuth();

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tasks', {
        params: {
          ...filters,
          status: filters.status === 'all' ? undefined : filters.status,
          priority: filters.priority === 'all' ? undefined : filters.priority,
          worker: filters.worker === 'all' ? undefined : filters.worker,
        },
      });
      setTasks(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  const handleCreateTask = async (taskData) => {
    try {
      const response = await api.post('/tasks', taskData);
      setTasks([...tasks, response.data]);
      setOpenCreateDialog(false);
    } catch (err) {
      console.error('Error creating task:', err);
      throw new Error(err.response?.data?.message || 'Failed to create task');
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      const response = await api.patch(`/tasks/${taskId}`, updates);
      setTasks(tasks.map(task => task._id === taskId ? response.data : task));
    } catch (err) {
      console.error('Error updating task:', err);
      throw new Error(err.response?.data?.message || 'Failed to update task');
    }
  };

  const handleVerifyTask = async (taskId, verificationData) => {
    try {
      const response = await api.post(`/tasks/${taskId}/verify`, verificationData);
      setTasks(tasks.map(task => task._id === taskId ? response.data : task));
    } catch (err) {
      console.error('Error verifying task:', err);
      throw new Error(err.response?.data?.message || 'Failed to verify task');
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    setFilters(prev => ({
      ...prev,
      status: ['all', 'pending', 'in_progress', 'completed', 'verified'][newValue],
    }));
  };

  if (!user || user.role !== 'ADMIN') {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          You don't have permission to access this page.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={2} sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
            Task Management
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Refresh tasks">
              <IconButton onClick={fetchTasks} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Filter tasks">
              <IconButton onClick={() => setOpenFilters(true)}>
                <FilterIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenCreateDialog(true)}
            >
              Create Task
            </Button>
          </Box>
        </Box>

        {/* Tabs */}
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
        >
          <Tab label="All" />
          <Tab label="Pending" />
          <Tab label="In Progress" />
          <Tab label="Completed" />
          <Tab label="Verified" />
        </Tabs>

        {/* Content */}
        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TaskList
            tasks={tasks}
            onUpdateTask={handleUpdateTask}
            onVerifyTask={handleVerifyTask}
          />
        )}
      </Paper>

      {/* Dialogs */}
      <CreateTaskDialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        onSubmit={handleCreateTask}
      />

      <TaskFilters
        open={openFilters}
        onClose={() => setOpenFilters(false)}
        filters={filters}
        onApplyFilters={setFilters}
      />
    </Box>
  );
};

export default TaskManagement; 