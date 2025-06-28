import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
  Slider,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import {
  MyLocation as MyLocationIcon,
  Info as InfoIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  Settings as SettingsIcon,
  QrCode as QrCodeIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import QRCode from 'qrcode';
import api from '../../utils/axios';
import { toast } from 'react-hot-toast';
import { ResponsiveWrapper } from '../layout';
import MapComponent from './MapComponent';

const CurrentLocationButton = ({ setPosition }) => {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPosition([position.coords.latitude, position.coords.longitude]);
        setLoading(false);
      },
      (error) => {
        toast.error('Failed to get current location');
        setLoading(false);
      }
    );
  };

  return (
    <Tooltip title="Use current location">
      <IconButton
        onClick={handleClick}
        disabled={loading}
        sx={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 1000,
          bgcolor: 'background.paper',
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
      >
        {loading ? <CircularProgress size={24} /> : <MyLocationIcon />}
      </IconButton>
    </Tooltip>
  );
};

const BinForm = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState(null);
  const [formData, setFormData] = useState({
    binId: '',
    type: 'general',
    status: 'empty',
    capacity: 100,
    currentCapacity: 0,
    zone: '',
    qrCodeURL: '',
    address: {
      streetAddress: '',
      locality: '',
      city: '',
      state: '',
      country: 'India',
      postalCode: '',
      landmark: '',
      area: ''
    },
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [generatedQRUrl, setGeneratedQRUrl] = useState('');

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('binbuddy_token');
    console.log('[BinForm Debug] Auth Check:', {
      hasUser: !!user,
      hasToken: !!token,
      userRole: user?.role
    });

    if (!user || !token) {
      console.log('[BinForm Debug] No auth, redirecting to signin');
      navigate('/signin', { 
        state: { from: location.pathname },
        replace: true 
      });
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    if (isEdit) {
      fetchBinData();
    }
  }, [id]);

  const fetchBinData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/bins/${id}`);
      const bin = response.data;
      setFormData({
        binId: bin.binId,
        type: bin.type,
        status: bin.status.toUpperCase(),
        capacity: bin.capacity,
        currentCapacity: bin.currentCapacity,
        zone: bin.zone || '',
        qrCodeURL: bin.qrCodeURL || '',
        address: {
          streetAddress: bin.address?.streetAddress || '',
          locality: bin.address?.locality || '',
          city: bin.address?.city || '',
          state: bin.address?.state || '',
          country: bin.address?.country || '',
          postalCode: bin.address?.postalCode || '',
          landmark: bin.address?.landmark || '',
          area: bin.address?.area || ''
        },
        notes: bin.notes || ''
      });
      if (bin.location?.coordinates) {
        setPosition([bin.location.coordinates[1], bin.location.coordinates[0]]);
      }
    } catch (error) {
      console.error('Error fetching bin:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch bin data';
      toast.error(errorMessage);
      setApiError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.binId.trim()) {
      newErrors.binId = 'Bin ID is required';
    }
    if (!formData.zone.trim()) {
      newErrors.zone = 'Zone is required';
    }
    if (!formData.address.streetAddress.trim()) {
      newErrors.streetAddress = 'Street Address is required';
    }
    if (!formData.address.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!position) {
      newErrors.location = 'Please select a location on the map';
    }
    if (formData.capacity <= 0) {
      newErrors.capacity = 'Capacity must be greater than 0';
    }
    if (!['empty', 'partial', 'full', 'maintenance'].includes(formData.status)) {
      newErrors.status = 'Invalid status value';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
      setLoading(true);
      setApiError('');

    try {
      if (!validateForm()) {
        setLoading(false);
        return;
      }

      // Prepare bin data
      const binData = {
        binId: formData.binId,
        qrCodeURL: formData.qrCodeURL,
        type: formData.type,
        status: formData.status.toLowerCase(),
        capacity: Number(formData.capacity),
        currentCapacity: Number(formData.currentCapacity),
        zone: formData.zone,
        address: {
          streetAddress: formData.address.streetAddress || '',
          locality: formData.address.locality || '',
          city: formData.address.city || '',
          state: formData.address.state || '',
          country: formData.address.country || 'India',
          postalCode: formData.address.postalCode || '',
          landmark: formData.address.landmark || '',
          area: formData.address.area || ''
        },
        city: formData.address.city, // Required by the model
        location: {
          type: 'Point',
          coordinates: position ? [position[1], position[0]] : [0, 0]
        },
        notes: formData.notes || ''
      };

      console.log('Submitting bin data:', binData);

      let response;
        if (isEdit) {
        response = await api.put(`/bins/${id}`, binData);
        toast.success('Bin updated successfully!');
        } else {
        response = await api.post('/bins', binData);
        toast.success('Bin created successfully!');
      }

      navigate('/management/bins');
      } catch (error) {
      console.error('Error submitting bin:', error.response?.data || error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to save bin';
      if (error.response?.data?.errors) {
        // Handle validation errors
        Object.entries(error.response.data.errors).forEach(([field, message]) => {
          toast.error(`${field}: ${message}`);
          });
        } else {
          toast.error(errorMessage);
        }
      setApiError(errorMessage);
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

  const handleLocationSelect = async (addressData) => {
    console.log('Setting address data:', addressData);
    
    try {
      // First update the form with location data
      setPosition(addressData.coordinates);
      setFormData(prev => ({
        ...prev,
        address: {
          streetAddress: addressData.streetAddress || '',
          locality: addressData.locality || '',
          city: addressData.city || '',
          state: addressData.state || '',
          country: addressData.country || 'India',
          postalCode: addressData.postalCode || '',
          landmark: addressData.landmark || '',
          area: addressData.area || ''
        }
      }));

      // Generate QR code and get bin ID
      const response = await api.post('/bins/generate-qr', {
        location: {
          type: 'Point',
          coordinates: [addressData.coordinates[1], addressData.coordinates[0]],
          address: {
            streetAddress: addressData.streetAddress || '',
            locality: addressData.locality || '',
          city: addressData.city || '',
          state: addressData.state || '',
            country: addressData.country || 'India',
            postalCode: addressData.postalCode || '',
            landmark: addressData.landmark || '',
            area: addressData.area || ''
          }
        }
      });

      console.log('QR code generation response:', response.data);

      const { binId, qrCodeURL, signedUrl } = response.data;

      // Update form with generated data
      setFormData(prev => ({
        ...prev,
        binId: binId,
        qrCodeURL: qrCodeURL
      }));

      setGeneratedQRUrl(signedUrl);
      toast.success('QR Code generated successfully!');
    } catch (error) {
      console.error('Error generating QR code:', error.response?.data || error);
      toast.error(error.response?.data?.error || 'Failed to generate QR code');
    }
  };

  const QRDialog = () => {
    const [qrImageUrl, setQrImageUrl] = useState('');
    const [qrError, setQrError] = useState(false);

    useEffect(() => {
      generateQRCode();
    }, []);

    const generateQRCode = async () => {
      try {
        if (!formData.binId || !generatedQRUrl) {
      setQrError(true);
          return;
        }

        // Use the signed URL from the server for QR code generation
        const qrDataUrl = await QRCode.toDataURL(generatedQRUrl, {
          width: 512,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#ffffff'
          },
          errorCorrectionLevel: 'H'
        });
        setQrImageUrl(qrDataUrl);
      setQrError(false);
      } catch (error) {
        console.error('Error generating QR code:', error);
        setQrError(true);
      }
    };

    return (
      <Dialog
        open={qrDialogOpen}
        onClose={() => setQrDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">QR Code for {formData.binId}</Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ p: 3, textAlign: 'center' }}>
            {qrError ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                Failed to generate QR code
              </Alert>
            ) : qrImageUrl ? (
              <>
                <Box
                  component="img"
                  src={qrImageUrl}
                  alt={`QR Code for ${formData.binId}`}
                  sx={{
                  width: '100%',
                    maxWidth: 300,
                  height: 'auto',
                    mb: 2
                  }}
                />
                  <Button
                    variant="contained"
                  startIcon={<DownloadIcon />}
                    onClick={() => {
                      const link = document.createElement('a');
                    link.download = `qr-${formData.binId}.png`;
                    link.href = qrImageUrl;
                      link.click();
                    }}
                  >
                    Download QR Code
                  </Button>
              </>
            ) : (
              <CircularProgress />
            )}
          </Box>
        </DialogContent>
      </Dialog>
    );
  };

  const QRCodeSection = () => (
    <Box sx={{ 
      border: '1px dashed #ccc',
      borderRadius: 1,
      p: 2,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 1,
      height: '100%',
      justifyContent: 'center'
    }}>
      {!position ? (
        <>
          <QrCodeIcon color="disabled" sx={{ fontSize: 48, opacity: 0.5 }} />
          <Typography variant="subtitle2" align="center" color="textSecondary">
            Select location on map to generate QR code
          </Typography>
        </>
      ) : !formData.qrCodeURL ? (
        <CircularProgress size={32} />
      ) : (
        <>
          <QrCodeIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="subtitle2" align="center" color="primary">
            QR Code Generated
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<QrCodeIcon />}
            onClick={() => setQrDialogOpen(true)}
          >
            View QR Code
          </Button>
        </>
      )}
    </Box>
  );

  if (loading && isEdit) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ResponsiveWrapper>
      <Box sx={{ p: 4, maxWidth: '1200px', margin: '0 auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
            {isEdit ? 'Edit Bin' : 'Add New Bin'}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<DeleteIcon />}
            onClick={() => navigate('/bins')}
            color="error"
          >
            Cancel
          </Button>
        </Box>

        {apiError && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {apiError}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <SettingsIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Basic Information</Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Bin ID"
                  name="binId"
                  value={formData.binId}
                  disabled
                  variant="outlined"
                  helperText="Auto-generated based on location"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    label="Type"
                  >
                    <MenuItem value="general">General Waste</MenuItem>
                    <MenuItem value="recyclable">Recyclable</MenuItem>
                    <MenuItem value="organic">Organic</MenuItem>
                    <MenuItem value="hazardous">Hazardous</MenuItem>
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
                  >
                    <MenuItem value="empty">Empty</MenuItem>
                    <MenuItem value="partial">Partially Full</MenuItem>
                    <MenuItem value="full">Full</MenuItem>
                    <MenuItem value="maintenance">Maintenance</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Capacity (L)"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  error={Boolean(errors.capacity)}
                  helperText={errors.capacity}
                  required
                  InputProps={{
                    endAdornment: <Typography variant="caption">Liters</Typography>,
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Current Fill Level
                </Typography>
                <Slider
                  name="currentCapacity"
                  value={formData.currentCapacity}
                  onChange={(e, value) => handleChange({ target: { name: 'currentCapacity', value } })}
                  valueLabelDisplay="auto"
                  step={1}
                  marks={[
                    { value: 0, label: '0%' },
                    { value: 25, label: '25%' },
                    { value: 50, label: '50%' },
                    { value: 75, label: '75%' },
                    { value: 100, label: '100%' },
                  ]}
                  min={0}
                  max={100}
                  sx={{
                    '& .MuiSlider-markLabel': {
                      fontSize: '0.875rem',
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Zone"
                  name="zone"
                  value={formData.zone}
                  onChange={handleChange}
                  error={Boolean(errors.zone)}
                  helperText={errors.zone}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <QRCodeSection />
              </Grid>
            </Grid>
          </Paper>

          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Address Details</Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Street Address"
                  name="address.streetAddress"
                  value={formData.address.streetAddress}
                  onChange={handleChange}
                  error={Boolean(errors.streetAddress)}
                  helperText={errors.streetAddress}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Locality"
                  name="address.locality"
                  value={formData.address.locality}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Area"
                  name="address.area"
                  value={formData.address.area}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  error={Boolean(errors.city)}
                  helperText={errors.city}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="State"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Postal Code"
                  name="address.postalCode"
                  value={formData.address.postalCode}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Landmark"
                  name="address.landmark"
                  value={formData.address.landmark}
                  onChange={handleChange}
                />
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
                  placeholder="Add any additional notes about this bin location..."
                />
              </Grid>
            </Grid>
          </Paper>

          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Map Location</Typography>
              <Tooltip title="Click on the map to set the bin's location">
                <IconButton size="small" sx={{ ml: 1 }}>
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Divider sx={{ mb: 3 }} />

            <Box sx={{ height: 400, position: 'relative' }}>
              <MapComponent
                position={position}
                setPosition={setPosition}
                fillPercentage={formData.currentCapacity}
                onLocationSelect={handleLocationSelect}
              />
              <CurrentLocationButton setPosition={setPosition} />
            </Box>

            {errors.location && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {errors.location}
              </Alert>
            )}
          </Paper>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <LoadingButton
              type="submit"
              variant="contained"
              loading={loading}
              size="large"
              sx={{ minWidth: 150 }}
            >
              {isEdit ? 'Update Bin' : 'Create Bin'}
            </LoadingButton>
          </Box>
        </form>
      </Box>

      <QRDialog />
    </ResponsiveWrapper>
  );
};

export default BinForm; 