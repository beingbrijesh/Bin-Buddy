import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  InputAdornment,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import api from '../../utils/axios';
import ZoneForm from './ZoneForm';

const ZoneList = () => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      setLoading(true);
      const response = await api.get('/zones');
      if (response.data.status === 'success') {
        setZones(response.data.data || []);
      } else {
        throw new Error('Failed to fetch zones');
      }
    } catch (error) {
      console.error('Error fetching zones:', error);
      toast.error('Failed to fetch zones');
      // Set empty array to prevent undefined errors
      setZones([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleAddZone = () => {
    setSelectedZone(null);
    setOpenForm(true);
  };

  const handleEditZone = (zone) => {
    setSelectedZone(zone);
    setOpenForm(true);
  };

  const handleDeleteZone = async (zoneId) => {
    try {
      await api.delete(`/zones/${zoneId}`);
      toast.success('Zone deleted successfully');
      fetchZones();
    } catch (error) {
      console.error('Error deleting zone:', error);
      toast.error('Failed to delete zone');
    }
    setConfirmDelete(null);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedZone) {
        await api.patch(`/zones/${selectedZone._id}`, formData);
        toast.success('Zone updated successfully');
      } else {
        await api.post('/zones', formData);
        toast.success('Zone created successfully');
      }
      setOpenForm(false);
      fetchZones();
    } catch (error) {
      console.error('Error saving zone:', error);
      toast.error(selectedZone ? 'Failed to update zone' : 'Failed to create zone');
    }
  };

  const filteredZones = zones.filter(zone =>
    zone.name.toLowerCase().includes(search.toLowerCase()) ||
    zone.code.toLowerCase().includes(search.toLowerCase()) ||
    zone.area.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" component="h1">
          Zone Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddZone}
        >
          Add Zone
        </Button>
      </Box>

      {/* Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search zones by name, code or area"
            value={search}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      {/* Zones Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredZones.map((zone) => (
            <Grid item xs={12} sm={6} md={4} key={zone._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">
                      {zone.name}
                    </Typography>
                    <Chip
                      label={zone.status}
                      color={zone.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>

                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Code: {zone.code}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="textSecondary">
                      {zone.area}
                    </Typography>
                  </Box>

                  <Typography variant="body2" gutterBottom>
                    Workers: {zone.assignedWorkers?.length || 0}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    Bins: {zone.binCount || 0}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleEditZone(zone)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => setConfirmDelete(zone)}
                    >
                      Delete
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Zone Form Dialog */}
      <Dialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedZone ? 'Edit Zone' : 'Add New Zone'}
        </DialogTitle>
        <DialogContent>
          <ZoneForm
            zone={selectedZone}
            onSubmit={handleFormSubmit}
            onCancel={() => setOpenForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
      >
        <DialogTitle>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone.
          </Alert>
          <Typography>
            Are you sure you want to delete the zone "{confirmDelete?.name}"? This will also affect all associated workers and bins.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleDeleteZone(confirmDelete?._id)}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ZoneList; 