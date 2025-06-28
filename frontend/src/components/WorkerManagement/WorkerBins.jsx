import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Delete as DeleteIcon,
  Map as MapIcon,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import api from '../../utils/axios';
import SharedMapComponent from '../Maps/SharedMapComponent';

const WorkerBins = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [worker, setWorker] = useState(null);
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [confirmUnassign, setConfirmUnassign] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [workerResponse, binsResponse] = await Promise.all([
        api.get(`/users/${id}`),
        api.get(`/bins?workerId=${id}`)
      ]);

      setWorker(workerResponse.data);
      setBins(binsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.response?.data?.message || 'Failed to fetch data');
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleUnassign = async (binId) => {
    try {
      await api.post(`/bins/${binId}/unassign-worker`);
      toast.success('Bin unassigned successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to unassign bin');
    }
    setConfirmUnassign(null);
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

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h5" component="h1">
          Assigned Bins - {worker?.name}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          startIcon={<MapIcon />}
          variant="outlined"
          onClick={() => setShowMap(true)}
        >
          View Map
        </Button>
      </Box>

      {/* Bins Grid */}
      <Grid container spacing={3}>
        {bins.map((bin) => (
          <Grid item xs={12} sm={6} md={4} key={bin._id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">
                    {bin.binId}
                  </Typography>
                  <Chip
                    label={bin.status}
                    color={bin.status === 'empty' ? 'success' : 'warning'}
                    size="small"
                  />
                </Box>

                <Typography variant="body2" color="textSecondary" gutterBottom>
                  <LocationIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                  {bin.address?.streetAddress}
                </Typography>

                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {bin.address?.city}, {bin.address?.state}
                </Typography>

                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Button
                    size="small"
                    onClick={() => navigate(`/management/bins/${bin._id}`)}
                  >
                    View Details
                  </Button>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => setConfirmUnassign(bin)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
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
              markers={bins.map(bin => ({
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

      {/* Unassign Confirmation Dialog */}
      <Dialog
        open={Boolean(confirmUnassign)}
        onClose={() => setConfirmUnassign(null)}
      >
        <DialogTitle>
          Confirm Unassign
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to unassign bin {confirmUnassign?.binId} from {worker?.name}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmUnassign(null)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleUnassign(confirmUnassign?._id)}
          >
            Unassign
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkerBins; 