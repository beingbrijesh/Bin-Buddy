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
  useTheme,
  useMediaQuery,
  CircularProgress,
  Skeleton,
  Alert,
} from '@mui/material';
import {
  Image as ImageIcon,
  LocationOn as LocationIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Line } from 'react-chartjs-2';
import { ResponsiveWrapper } from '../layout';
import SharedMapComponent from '../Maps/SharedMapComponent';

const BinActivity = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { id } = useParams();
  const [bin, setBin] = useState(null);
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({
    totalCollections: 0,
    averageWastePerDay: 0,
    lastEmptied: null,
    fillRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [capacityHistory, setCapacityHistory] = useState({
    labels: [],
    datasets: [{
      label: 'Capacity %',
      data: [],
      fill: false,
      borderColor: theme.palette.primary.main,
      tension: 0.1,
    }],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        await Promise.all([
          fetchBinData(),
          fetchActivities(),
          fetchStats(),
        ]);
      } catch (error) {
        setError('Failed to load data. Please try again.');
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const fetchBinData = async () => {
    const response = await axios.get(`/api/bins/${id}`);
    setBin(response.data);
  };

  const fetchActivities = async () => {
    const response = await axios.get(`/api/bin-activity/bin/${id}`);
    setActivities(response.data);
    
    // Process capacity history data
    const historyData = response.data
      .filter(activity => activity.capacityReading !== undefined)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    setCapacityHistory({
      labels: historyData.map(item => new Date(item.timestamp).toLocaleDateString()),
      datasets: [{
        label: 'Capacity %',
        data: historyData.map(item => item.capacityReading),
        fill: false,
        borderColor: theme.palette.primary.main,
        tension: 0.1,
      }],
    });
  };

  const fetchStats = async () => {
    const response = await axios.get(`/api/bins/${id}/stats`);
    setStats(response.data);
  };

  const getActionColor = (actionType) => {
    const colors = {
      pickup: 'success',
      maintenance: 'warning',
      report: 'error',
      check: 'info',
    };
    return colors[actionType] || 'default';
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const StatCard = ({ title, value, subtitle, color }) => (
    <Card>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4" color={color || 'primary'} gutterBottom>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="textSecondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  const renderMobileActivity = (activity) => (
    <Card key={activity._id} sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Chip
            label={activity.actionType}
            color={getActionColor(activity.actionType)}
            size="small"
          />
          <Typography variant="caption" color="textSecondary">
            {formatDateTime(activity.timestamp)}
          </Typography>
        </Box>
        <Typography variant="subtitle2" gutterBottom>
          {activity.workerName}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <Chip
            label={activity.binStatus}
            size="small"
            color={activity.binStatus === 'empty' ? 'success' : 'warning'}
          />
          {activity.capacityReading !== undefined && (
            <Chip
              label={`${activity.capacityReading}%`}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
        </Box>
        {activity.notes && (
          <Typography variant="body2" color="textSecondary">
            {activity.notes}
          </Typography>
        )}
        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          {activity.photoURL && (
            <IconButton
              size="small"
              onClick={() => setSelectedImage(activity.photoURL)}
            >
              <ImageIcon fontSize="small" />
            </IconButton>
          )}
          {activity.location && (
            <IconButton
              size="small"
              onClick={() => setSelectedLocation(activity.location)}
            >
              <LocationIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </CardContent>
    </Card>
  );

  const LocationDialog = ({ location, onClose }) => {
    const markers = location ? [{
      id: 'activity-location',
      position: { lat: location.lat, lng: location.lng },
      title: 'Activity Location',
      content: 'This is where the activity took place'
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
              markerType="task"
            />
          </Box>
        </DialogContent>
      </Dialog>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ResponsiveWrapper>
      <Box sx={{ mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {bin && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <IconButton
                sx={{ mr: 2 }}
                onClick={() => window.history.back()}
              >
                <ArrowBackIcon />
              </IconButton>
              <Box>
                <Typography variant="h5" gutterBottom>
                  {bin.binId}
                </Typography>
                <Typography color="textSecondary">
                  {bin.address}
                </Typography>
              </Box>
            </Box>
            <Chip
              label={bin.status}
              color={bin.status === 'active' ? 'success' : 'warning'}
              size="small"
            />
          </Paper>
        )}

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Collections"
              value={stats.totalCollections}
              subtitle="All time"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Avg. Waste/Day"
              value={`${stats.averageWastePerDay.toFixed(1)}L`}
              subtitle="Last 30 days"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Fill Rate"
              value={`${stats.fillRate.toFixed(1)}%/day`}
              subtitle="Current rate"
              color={stats.fillRate > 30 ? 'error' : 'success'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Last Emptied"
              value={stats.lastEmptied ? new Date(stats.lastEmptied).toLocaleDateString() : 'Never'}
              subtitle="Collection date"
            />
          </Grid>
        </Grid>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Capacity History
          </Typography>
          <Box sx={{ height: isMobile ? '200px' : '300px' }}>
            <Line
              data={capacityHistory}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                  },
                },
                plugins: {
                  legend: {
                    display: false,
                  },
                },
              }}
            />
          </Box>
        </Paper>

        <Typography variant="h6" gutterBottom>
          Recent Activities
        </Typography>

        {isMobile ? (
          <Box>
            {activities.map(renderMobileActivity)}
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Worker</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Capacity</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Photo</TableCell>
                  <TableCell>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activities.map((activity) => (
                  <TableRow key={activity._id}>
                    <TableCell>{formatDateTime(activity.timestamp)}</TableCell>
                    <TableCell>
                      <Chip
                        label={activity.actionType}
                        color={getActionColor(activity.actionType)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{activity.workerName}</TableCell>
                    <TableCell>
                      <Chip
                        label={activity.binStatus}
                        size="small"
                        color={activity.binStatus === 'empty' ? 'success' : 'warning'}
                      />
                    </TableCell>
                    <TableCell>
                      {activity.capacityReading !== undefined ? `${activity.capacityReading}%` : '-'}
                    </TableCell>
                    <TableCell>
                      {activity.location && (
                        <IconButton
                          size="small"
                          onClick={() => setSelectedLocation(activity.location)}
                        >
                          <LocationIcon />
                        </IconButton>
                      )}
                    </TableCell>
                    <TableCell>
                      {activity.photoURL && (
                        <IconButton
                          size="small"
                          onClick={() => setSelectedImage(activity.photoURL)}
                        >
                          <ImageIcon />
                        </IconButton>
                      )}
                    </TableCell>
                    <TableCell>{activity.notes || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

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
        <LocationDialog location={selectedLocation} onClose={() => setSelectedLocation(null)} />
      </Box>
    </ResponsiveWrapper>
  );
};

export default BinActivity; 