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
  Card,
  CardContent,
  Stack,
  LinearProgress,
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
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Person as PersonIcon,
  QrCode as QRIcon,
  History as HistoryIcon,
  Assignment as TaskIcon,
  LocationOn as LocationIcon,
  Image as ImageIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import api from '../../utils/axios';
import { toast } from 'react-hot-toast';

const BinDetail = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [bin, setBin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchBinDetails();
  }, [id]);

  const fetchBinDetails = async () => {
    try {
      setLoading(true);
      const [binResponse, historyResponse, tasksResponse] = await Promise.all([
        api.get(`/bins/${id}`),
        api.get(`/bins/${id}/history`),
        api.get(`/bins/${id}/tasks?limit=5`)
      ]);

      setBin(binResponse.data);
      setHistory(historyResponse.data);
      setTasks(tasksResponse.data);
    } catch (error) {
      console.error('Error fetching bin details:', error);
      setError(error.response?.data?.message || 'Failed to fetch bin details');
      toast.error('Failed to load bin details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      empty: 'success',
      partial: 'warning',
      full: 'error',
      maintenance: 'info'
    };
    return colors[status] || 'default';
  };

  const getCapacityColor = (capacity) => {
    if (capacity >= 90) return 'error';
    if (capacity >= 75) return 'warning';
    if (capacity >= 50) return 'info';
    return 'success';
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
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

  if (!bin) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">Bin not found</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate(-1)}>
          <BackIcon />
        </IconButton>
        <Typography variant="h5" component="h1">
          Bin Details - {bin.binId}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Main Info Card */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ p: 3, border: `1px solid ${theme.palette.divider}` }}>
            <Stack spacing={3}>
              {/* Status and Actions */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Chip
                  label={bin.status.toUpperCase()}
                  color={getStatusColor(bin.status)}
                  sx={{ fontWeight: 'bold' }}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    startIcon={<EditIcon />}
                    variant="outlined"
                    onClick={() => navigate(`/management/bins/edit/${bin._id}`)}
                  >
                    Edit
                  </Button>
                  <Button
                    startIcon={<QRIcon />}
                    variant="outlined"
                    onClick={() => setQrDialogOpen(true)}
                  >
                    View QR
                  </Button>
                </Box>
              </Box>

              <Divider />

              {/* Location Info */}
              <Box>
                <Typography variant="subtitle2" gutterBottom color="textSecondary">
                  Location
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body1">
                    {bin.address?.streetAddress}
                    {bin.address?.locality && `, ${bin.address.locality}`}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {bin.address?.city}
                    {bin.address?.state && `, ${bin.address.state}`}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Zone: {bin.zone}
                  </Typography>
                </Stack>
              </Box>

              {/* Capacity */}
              <Box>
                <Typography variant="subtitle2" gutterBottom color="textSecondary">
                  Capacity
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={bin.currentCapacity}
                      color={getCapacityColor(bin.currentCapacity)}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    {bin.currentCapacity}%
                  </Typography>
                </Box>
                <Typography variant="caption" color="textSecondary">
                  Total Capacity: {bin.capacity}L
                </Typography>
              </Box>

              {/* Assigned Worker */}
              <Box>
                <Typography variant="subtitle2" gutterBottom color="textSecondary">
                  Assigned Worker
                </Typography>
                {bin.assignedWorkerId ? (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 2,
                      bgcolor: theme.palette.background.default,
                      borderRadius: 1,
                      cursor: 'pointer',
                    }}
                    onClick={() => navigate(`/management/workers/${bin.assignedWorkerId._id}`)}
                  >
                    <Avatar src={bin.assignedWorkerId.avatar}>
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="body1">
                        {bin.assignedWorkerId.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {bin.assignedWorkerId.phone}
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Chip
                    label="No Worker Assigned"
                    variant="outlined"
                    color="warning"
                    size="small"
                  />
                )}
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* History and Tasks */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            {/* Recent Tasks */}
            <Paper elevation={0} sx={{ p: 3, border: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TaskIcon fontSize="small" />
                Recent Tasks
              </Typography>
              <List>
                {tasks.map((task) => (
                  <ListItem key={task._id} sx={{ px: 0 }}>
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

            {/* History Log */}
            <Paper elevation={0} sx={{ p: 3, border: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HistoryIcon fontSize="small" />
                History Log
              </Typography>
              <List>
                {history.map((log) => (
                  <ListItem key={log._id} sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar>
                        {log.type === 'pickup' ? <TaskIcon /> : 
                         log.type === 'report' ? <HistoryIcon /> : 
                         <ImageIcon />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={log.action}
                      secondary={format(new Date(log.date), 'MMM dd, yyyy HH:mm')}
                    />
                    {log.images?.length > 0 && (
                      <ListItemSecondaryAction>
                        <IconButton size="small" onClick={() => handleImageClick(log.images[0])}>
                          <ImageIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    )}
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      {/* QR Code Dialog */}
      <Dialog
        open={qrDialogOpen}
        onClose={() => setQrDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">QR Code - {bin.binId}</Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            p: 4,
            bgcolor: theme.palette.background.default,
            borderRadius: 1,
          }}>
            <QRCodeSVG
              value={bin.qrCodeURL}
              size={256}
              level="M"
              includeMargin={false}
              style={{
                width: '100%',
                maxWidth: '256px',
                height: 'auto'
              }}
            />
            <Typography variant="subtitle2" sx={{ mt: 2 }}>
              {bin.binId}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1, textAlign: 'center' }}>
              {bin.address?.streetAddress}
              {bin.address?.locality && `, ${bin.address.locality}`}
            </Typography>
            <Typography variant="caption" color="textSecondary" sx={{ textAlign: 'center' }}>
              {bin.address?.city}
              {bin.address?.state && `, ${bin.address.state}`}
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog
        open={Boolean(selectedImage)}
        onClose={() => setSelectedImage(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          <img
            src={selectedImage}
            alt="History Log Image"
            style={{ width: '100%', height: 'auto' }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default BinDetail; 