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
  Box,
  Typography,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  CardActions,
  Skeleton,
  CircularProgress,
  Divider,
  Tooltip,
  LinearProgress,
  Stack,
  Fade,
  InputAdornment,
  Avatar,
  Badge,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  QrCode as QRIcon,
  LocationOn as LocationIcon,
  History as HistoryIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Storage as StorageIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  DeleteSweep as ClearIcon,
  Person as PersonIcon,
  PhotoCamera as CameraIcon,
  Assignment as AssignmentIcon,
  Comment as CommentIcon,
} from '@mui/icons-material';
import api from '../../utils/axios';
import { toast } from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import { ResponsiveWrapper } from '../layout';

const BinList = ({ themeColor = {
  main: '#279e0a',
  light: '#e8f5e9',
  dark: '#1b7006',
  contrastText: '#ffffff',
} }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    type: '',
    assigned: '',
    zone: '',
  });
  const [selectedBin, setSelectedBin] = useState(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(!isMobile);

  useEffect(() => {
    fetchBins();
  }, [filters]);

  useEffect(() => {
    setShowFilters(!isMobile);
  }, [isMobile]);

  const fetchBins = async () => {
    try {
      setLoading(true);
      // Make the actual API call
      const response = await api.get('/bins', {
        params: Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== '')
        )
      });
      
      if (response.data) {
        setBins(response.data);
      } else {
        toast.error('No data received from server');
      }
    } catch (error) {
      toast.error('Failed to fetch bins');
      console.error('Error fetching bins:', error);
      // If API fails, use empty array instead of mock data
      setBins([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (binId) => {
    if (!window.confirm('Are you sure you want to delete this bin?')) return;
    
    try {
      // Make the actual API call to delete the bin
      await api.delete(`/bins/${binId}`);
      
      // Update local state only after successful API call
      setBins(prevBins => prevBins.filter(bin => bin._id !== binId));
      toast.success('Bin deleted successfully');
    } catch (error) {
      console.error('Error deleting bin:', error);
      toast.error(error.response?.data?.message || 'Failed to delete bin');
    }
  };

  const handleStatusChange = async (binId, newStatus) => {
    try {
      // Simulate API call
      setBins(prevBins => prevBins.map(bin => 
        bin._id === binId ? { ...bin, status: newStatus } : bin
      ));
      toast.success('Bin status updated');
      // await api.patch(`/bins/${binId}`, { status: newStatus });
      // fetchBins();
    } catch (error) {
      toast.error('Failed to update bin status');
      console.error('Error updating bin status:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'success',
      full: 'error',
      maintenance: 'warning',
      inactive: 'default',
    };
    return colors[status] || 'default';
  };

  const getCapacityColor = (capacity) => {
    if (capacity >= 90) return 'error';
    if (capacity >= 75) return 'warning';
    if (capacity >= 50) return 'info';
    return 'success';
  };

  const renderMobileCard = (bin) => (
    <Fade in={true}>
    <Card 
        elevation={2}
      sx={{ 
        mb: 2,
          position: 'relative',
        '&:hover': {
            boxShadow: 6,
          transform: 'translateY(-2px)',
            transition: 'all 0.2s ease-in-out',
        },
      }}
    >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            p: 1,
          }}
        >
          <Chip
            label={bin.status.toUpperCase()}
            color={getStatusColor(bin.status)}
            size="small"
            sx={{ fontWeight: 'bold' }}
          />
        </Box>
        <CardContent>
          <Stack spacing={2}>
          <Box>
              <Typography variant="h6" gutterBottom>
              {bin.binId}
            </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <LocationIcon fontSize="small" />
                {bin.address?.streetAddress}
                {bin.address?.locality && `, ${bin.address.locality}`}
            </Typography>
          </Box>
            
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Capacity
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
            <LinearProgress
              variant="determinate"
              value={bin.currentCapacity}
                    color={getCapacityColor(bin.currentCapacity)}
              sx={{
                      height: 10, 
                      borderRadius: 5,
                      backgroundColor: 'rgba(0,0,0,0.1)',
              }}
            />
          </Box>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ minWidth: 45 }}
                >
                  {bin.currentCapacity}%
                </Typography>
              </Box>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary">
                Type: {bin.type.charAt(0).toUpperCase() + bin.type.slice(1)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Zone: {bin.zone}
              </Typography>
        </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Assignment
              </Typography>
              {bin.assignedWorker ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar
                    src={bin.assignedWorker.avatar}
                    alt={bin.assignedWorker.name}
                    sx={{ width: 24, height: 24 }}
                  />
                  <Typography variant="body2">
                    {bin.assignedWorker.name}
                  </Typography>
                </Box>
              ) : (
          <Chip
                  label="Unassigned"
            size="small"
            variant="outlined"
                  color="warning"
          />
              )}
        </Box>
          </Stack>
      </CardContent>
        
      <Divider />
        
        <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
          <Stack direction="row" spacing={1}>
          <Tooltip title="Edit">
            <IconButton
              size="small"
                onClick={() => navigate(`/management/bins/edit/${bin._id}`)}
                color="primary"
            >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="View History">
              <IconButton 
                size="small"
                onClick={() => navigate(`/management/bins/${bin._id}/history`)}
                color="info"
              >
                <HistoryIcon />
            </IconButton>
          </Tooltip>
            <Tooltip title="Show QR Code">
            <IconButton
              size="small"
              onClick={() => {
                setSelectedBin(bin);
                setQrDialogOpen(true);
              }}
                color="secondary"
            >
                <QRIcon />
            </IconButton>
          </Tooltip>
          </Stack>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={() => handleDelete(bin._id)}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
      </CardActions>
    </Card>
    </Fade>
  );

  const renderDesktopTable = () => (
    <TableContainer 
      component={Paper}
      elevation={0}
      sx={{ 
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600, py: 2, bgcolor: themeColor.light }}>Bin ID</TableCell>
            <TableCell sx={{ fontWeight: 600, py: 2, bgcolor: themeColor.light }}>Location</TableCell>
            <TableCell sx={{ fontWeight: 600, py: 2, bgcolor: themeColor.light }}>Type</TableCell>
            <TableCell sx={{ fontWeight: 600, py: 2, bgcolor: themeColor.light }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 600, py: 2, bgcolor: themeColor.light }}>Capacity</TableCell>
            <TableCell sx={{ fontWeight: 600, py: 2, bgcolor: themeColor.light }}>Last Emptied</TableCell>
            <TableCell sx={{ fontWeight: 600, py: 2, bgcolor: themeColor.light }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                {Array.from({ length: 7 }).map((_, cellIndex) => (
                  <TableCell key={cellIndex}>
                    <Skeleton animation="wave" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : bins.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <StorageIcon sx={{ fontSize: 48, color: themeColor.main, mb: 2, opacity: 0.5 }} />
                  <Typography color="text.secondary" variant="h6" gutterBottom>
                    No bins found
                  </Typography>
                  <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
                    {filters.search || filters.status || filters.city || filters.zone || filters.type
                      ? 'Try adjusting your filters'
                      : 'Add your first bin to get started'}
                  </Typography>
                  {!filters.search && !filters.status && !filters.city && !filters.zone && !filters.type && (
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => navigate('/management/bins/new')}
                      sx={{ 
                        borderRadius: 1.5,
                        textTransform: 'none',
                        borderColor: themeColor.main,
                        color: themeColor.main,
                        '&:hover': {
                          borderColor: themeColor.dark,
                          bgcolor: themeColor.light,
                        },
                      }}
                    >
                      Add New Bin
                    </Button>
                  )}
                </Box>
              </TableCell>
            </TableRow>
          ) : (
            bins.map((bin) => (
              <TableRow 
                key={bin._id}
                sx={{ 
                  '&:hover': { 
                    bgcolor: themeColor.light,
                  },
                }}
              >
                <TableCell sx={{ py: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: themeColor.main }}>
                    {bin.binId}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                  <Box>
                    <Typography variant="body2">
                      {bin.address?.streetAddress}
                      {bin.address?.locality && `, ${bin.address.locality}`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {bin.address?.city}{bin.address?.state && `, ${bin.address.state}`}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                  <Chip
                    label={bin.type}
                    size="small"
                    variant="outlined"
                    sx={{ 
                      borderRadius: 1,
                      borderColor: themeColor.main,
                      color: themeColor.main,
                    }}
                  />
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                  <FormControl size="small">
                    <Select
                      value={bin.status}
                      onChange={(e) => handleStatusChange(bin._id, e.target.value)}
                      renderValue={(value) => (
                        <Chip
                          label={value}
                          size="small"
                          color={getStatusColor(value)}
                          sx={{ 
                            borderRadius: 1,
                            minWidth: 80,
                          }}
                        />
                      )}
                      sx={{
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: 'none',
                        },
                      }}
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="full">Full</MenuItem>
                      <MenuItem value="maintenance">Maintenance</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                  <Box>
                    <Chip
                      label={`${bin.currentCapacity}%`}
                      size="small"
                      color={getCapacityColor(bin.currentCapacity)}
                      sx={{ 
                        borderRadius: 1,
                        minWidth: 60,
                        mb: 1,
                      }}
                    />
                    <LinearProgress
                      variant="determinate"
                      value={bin.currentCapacity}
                      sx={{
                        height: 4,
                        borderRadius: 2,
                        bgcolor: theme.palette.grey[200],
                        '& .MuiLinearProgress-bar': {
                          bgcolor: getCapacityColor(bin.currentCapacity),
                        },
                      }}
                    />
                  </Box>
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                  <Typography variant="body2">
                    {bin.lastEmptied ? new Date(bin.lastEmptied).toLocaleString() : 'Never'}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/management/bins/edit/${bin._id}`)}
                        sx={{ 
                          color: themeColor.main,
                          '&:hover': {
                            bgcolor: themeColor.light,
                          },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="QR Code">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedBin(bin);
                          setQrDialogOpen(true);
                        }}
                        sx={{ 
                          color: themeColor.main,
                          '&:hover': {
                            bgcolor: themeColor.light,
                          },
                        }}
                      >
                        <QRIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View on Map">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/map?binId=${bin._id}`)}
                        sx={{ 
                          color: themeColor.main,
                          '&:hover': {
                            bgcolor: themeColor.light,
                          },
                        }}
                      >
                        <LocationIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="History">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/management/bins/${bin._id}/history`)}
                        sx={{ 
                          color: themeColor.main,
                          '&:hover': {
                            bgcolor: themeColor.light,
                          },
                        }}
                      >
                        <HistoryIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(bin._id)}
                        sx={{
                          '&:hover': {
                            bgcolor: theme.palette.error.light,
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderFilters = () => (
    <Card sx={{ mb: 3, p: 2 }}>
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              fullWidth
              size="small"
            placeholder="Search bins..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              }}
            />
              <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/management/bins/new')}
                sx={{
              whiteSpace: 'nowrap',
              bgcolor: themeColor.main,
              '&:hover': { bgcolor: themeColor.dark },
                }}
              >
            Add Bin
              </Button>
          </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={2.4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    label="Status"
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="full">Full</MenuItem>
                    <MenuItem value="maintenance">Maintenance</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={filters.type}
                    label="Type"
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="general">General</MenuItem>
                    <MenuItem value="recyclable">Recyclable</MenuItem>
                    <MenuItem value="organic">Organic</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <FormControl fullWidth size="small">
              <InputLabel>Assignment</InputLabel>
              <Select
                value={filters.assigned}
                label="Assignment"
                onChange={(e) => setFilters({ ...filters, assigned: e.target.value })}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="assigned">Assigned</MenuItem>
                <MenuItem value="unassigned">Unassigned</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <FormControl fullWidth size="small">
              <InputLabel>Zone</InputLabel>
              <Select
                value={filters.zone}
                label="Zone"
                onChange={(e) => setFilters({ ...filters, zone: e.target.value })}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="North">North</MenuItem>
                <MenuItem value="South">South</MenuItem>
                <MenuItem value="East">East</MenuItem>
                <MenuItem value="West">West</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Stack direction="row" spacing={1}>
              <Button
                fullWidth
                size="small"
                startIcon={<ClearIcon />}
                onClick={() => setFilters({
                  search: '',
                  status: '',
                  type: '',
                  assigned: '',
                  zone: '',
                })}
              >
                Clear
              </Button>
              <Button
                fullWidth
                size="small"
                startIcon={<RefreshIcon />}
                onClick={fetchBins}
              >
                Refresh
              </Button>
            </Stack>
          </Grid>
            </Grid>
      </Stack>
    </Card>
  );

  return (
    <Box>
      {/* Search and Filters */}
      <Box sx={{ mb: 3 }}>
        {renderFilters()}
      </Box>

      {/* Content */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress sx={{ color: themeColor.main }} />
        </Box>
      ) : (
        <>
          {isMobile ? (
            <Box>
              {bins.map(renderMobileCard)}
            </Box>
          ) : (
            renderDesktopTable()
          )}
        </>
      )}

      {/* QR Code Dialog */}
      <Dialog
        open={qrDialogOpen}
        onClose={() => setQrDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          elevation: 0,
          sx: {
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        <DialogTitle sx={{ px: 3, py: 2, color: themeColor.main }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            Bin QR Code - {selectedBin?.binId}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ px: 3, pb: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            p: 4,
            backgroundColor: themeColor.light,
            borderRadius: 2,
          }}>
            {selectedBin && (
              <>
              <QRCodeSVG
                  value={selectedBin.qrCodeURL}
                size={256}
                  level="M"
                  includeMargin={false}
                  style={{
                    width: '100%',
                    maxWidth: '256px',
                    height: 'auto'
                  }}
                />
                <Typography variant="subtitle2" sx={{ mt: 2, color: themeColor.main }}>
                  {selectedBin.binId}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                  {selectedBin.address?.streetAddress}
                  {selectedBin.address?.locality && `, ${selectedBin.address.locality}`}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
                  {selectedBin.address?.city}
                  {selectedBin.address?.state && `, ${selectedBin.address.state}`}
                </Typography>
              </>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
              Scan this QR code to view bin details
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default BinList; 