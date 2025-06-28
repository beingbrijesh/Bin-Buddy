import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Stack,
  IconButton,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ImageList,
  ImageListItem,
  Tooltip,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as CameraIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  History as HistoryIcon,
  Comment as CommentIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { toast } from 'react-hot-toast';
import MapComponent from './MapComponent';
import api from '../../utils/axios';

const BinEdit = () => {
  const { binId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bin, setBin] = useState(null);
  const [position, setPosition] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [showPhotoDialog, setShowPhotoDialog] = useState(false);
  const [showWorkerDialog, setShowWorkerDialog] = useState(false);

  useEffect(() => {
    fetchBinData();
    fetchWorkers();
  }, [binId]);

  const fetchBinData = async () => {
    try {
      setLoading(true);
      // Simulated API call
      const mockBin = {
        _id: binId,
        binId: 'BIN001',
        type: 'general',
        status: 'empty',
        currentCapacity: 30,
        location: {
          address: '123 Main St, Mumbai',
          coordinates: [19.0760, 72.8777],
        },
        zone: 'North',
        assignedWorker: {
          _id: 'w1',
          name: 'John Doe',
          avatar: 'https://i.pravatar.cc/150?img=1',
        },
        photos: [
          { url: 'photo1.jpg', date: new Date().toISOString() },
          { url: 'photo2.jpg', date: new Date().toISOString() },
        ],
        comments: [
          { 
            text: 'Regular maintenance done',
            date: new Date().toISOString(),
            user: {
              name: 'Admin',
              avatar: 'https://i.pravatar.cc/150?img=3',
            }
          }
        ],
        history: [
          {
            action: 'Status changed to Empty',
            date: new Date().toISOString(),
            user: 'Admin',
          }
        ],
      };

      setBin(mockBin);
      setPosition(mockBin.location.coordinates);
      setPhotos(mockBin.photos);
      setComments(mockBin.comments);
    } catch (error) {
      toast.error('Failed to fetch bin data');
      console.error('Error fetching bin:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkers = async () => {
    try {
      // Simulated API call
      const mockWorkers = [
        { _id: 'w1', name: 'John Doe', avatar: 'https://i.pravatar.cc/150?img=1' },
        { _id: 'w2', name: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?img=2' },
      ];
      setWorkers(mockWorkers);
    } catch (error) {
      toast.error('Failed to fetch workers');
      console.error('Error fetching workers:', error);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Bin updated successfully');
      navigate('/management/bins');
    } catch (error) {
      toast.error('Failed to update bin');
      console.error('Error updating bin:', error);
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files);
    // Handle photo upload logic
    const newPhotos = files.map(file => ({
      url: URL.createObjectURL(file),
      date: new Date().toISOString(),
    }));
    setPhotos([...photos, ...newPhotos]);
    setShowPhotoDialog(false);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const comment = {
      text: newComment,
      date: new Date().toISOString(),
      user: {
        name: 'Admin',
        avatar: 'https://i.pravatar.cc/150?img=3',
      }
    };
    setComments([comment, ...comments]);
    setNewComment('');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!bin) {
    return (
      <Alert severity="error">
        Bin not found
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={0} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">
            Edit Bin: {bin.binId}
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<CancelIcon />}
              onClick={() => navigate('/management/bins')}
            >
              Cancel
            </Button>
            <LoadingButton
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              loading={saving}
              onClick={handleSave}
            >
              Save Changes
            </LoadingButton>
          </Stack>
        </Box>

        <Grid container spacing={3}>
          {/* Map Section */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Location
                </Typography>
                <Box sx={{ height: 400, position: 'relative' }}>
                  <MapComponent
                    position={position}
                    setPosition={setPosition}
                    fillPercentage={bin.currentCapacity}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Details Section */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              {/* Status */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Status
                  </Typography>
                  <FormControl fullWidth>
                    <InputLabel>Current Status</InputLabel>
                    <Select
                      value={bin.status}
                      label="Current Status"
                      onChange={(e) => setBin({ ...bin, status: e.target.value })}
                    >
                      <MenuItem value="empty">Empty</MenuItem>
                      <MenuItem value="partial">Partial</MenuItem>
                      <MenuItem value="full">Full</MenuItem>
                      <MenuItem value="maintenance">Maintenance</MenuItem>
                    </Select>
                  </FormControl>
                </CardContent>
              </Card>

              {/* Worker Assignment */}
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      Assigned Worker
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<PersonIcon />}
                      onClick={() => setShowWorkerDialog(true)}
                    >
                      Change
                    </Button>
                  </Box>
                  {bin.assignedWorker ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar src={bin.assignedWorker.avatar} />
                      <Typography>{bin.assignedWorker.name}</Typography>
                    </Box>
                  ) : (
                    <Alert severity="warning">
                      No worker assigned
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Photos */}
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      Photos
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<CameraIcon />}
                      onClick={() => setShowPhotoDialog(true)}
                    >
                      Add Photo
                    </Button>
                  </Box>
                  <ImageList cols={3} gap={8}>
                    {photos.map((photo, index) => (
                      <ImageListItem key={index}>
                        <img
                          src={photo.url}
                          alt={`Bin photo ${index + 1}`}
                          loading="lazy"
                          style={{ borderRadius: 4 }}
                        />
                      </ImageListItem>
                    ))}
                  </ImageList>
                </CardContent>
              </Card>

              {/* Comments */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Comments
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      variant="outlined"
                      size="small"
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                      <Button
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                      >
                        Add Comment
                      </Button>
                    </Box>
                  </Box>
                  <List>
                    {comments.map((comment, index) => (
                      <ListItem key={index} alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar src={comment.user.avatar} />
                        </ListItemAvatar>
                        <ListItemText
                          primary={comment.user.name}
                          secondary={
                            <>
                              <Typography variant="body2" color="text.primary">
                                {comment.text}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(comment.date).toLocaleString()}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Photo Upload Dialog */}
      <Dialog open={showPhotoDialog} onClose={() => setShowPhotoDialog(false)}>
        <DialogTitle>Upload Photos</DialogTitle>
        <DialogContent>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoUpload}
            style={{ display: 'none' }}
            id="photo-upload"
          />
          <label htmlFor="photo-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<CameraIcon />}
              fullWidth
              sx={{ mt: 2 }}
            >
              Choose Photos
            </Button>
          </label>
        </DialogContent>
      </Dialog>

      {/* Worker Assignment Dialog */}
      <Dialog open={showWorkerDialog} onClose={() => setShowWorkerDialog(false)}>
        <DialogTitle>Assign Worker</DialogTitle>
        <DialogContent>
          <List>
            {workers.map((worker) => (
              <ListItem
                key={worker._id}
                button
                onClick={() => {
                  setBin({ ...bin, assignedWorker: worker });
                  setShowWorkerDialog(false);
                }}
              >
                <ListItemAvatar>
                  <Avatar src={worker.avatar} />
                </ListItemAvatar>
                <ListItemText primary={worker.name} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default BinEdit; 