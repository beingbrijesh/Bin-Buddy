import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Container,
  Paper,
  Divider,
  LinearProgress,
  Stack,
  CardHeader,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Map as MapIcon,
  QrCode as QrCodeIcon,
  Assessment as StatsIcon,
  Dashboard as DashboardIcon,
  Storage as StorageIcon,
  LocationOn as LocationIcon,
  Timeline as TimelineIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Build as BuildIcon,
  Block as BlockIcon,
  Delete as DeleteIcon,
  Update as UpdateIcon,
  NotificationsActive as AlertIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { BinList } from '../../components/BinManagement';
import { ResponsiveWrapper } from '../../components/layout';

// Custom theme color
const themeColor = {
  main: '#279e0a',
  light: '#e8f5e9',
  dark: '#1b7006',
  contrastText: '#ffffff',
};

const BinManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalBins: 150,
    activeBins: 132,
    fullBins: 8,
    maintenanceBins: 6,
    inactiveBins: 4,
    avgFillRate: 68,
    activeZones: 4,
  });

  const [binsByStatus, setBinsByStatus] = useState({
    active: [],
    full: [],
    maintenance: [],
    inactive: [],
  });

  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      type: 'alert',
      binId: 'BIN004',
      message: 'Bin capacity reached 90%',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    },
    {
      id: 2,
      type: 'maintenance',
      binId: 'BIN006',
      message: 'Scheduled maintenance completed',
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    },
    {
      id: 3,
      type: 'update',
      binId: 'BIN002',
      message: 'Bin location updated',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    },
    {
      id: 4,
      type: 'empty',
      binId: 'BIN001',
      message: 'Bin emptied by collection team',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
    },
  ]);

  useEffect(() => {
    // Mock data for demonstration
    setBinsByStatus({
      active: [
        { id: 1, binId: 'BIN001', location: 'North Zone', fillLevel: 65 },
        { id: 2, binId: 'BIN002', location: 'South Zone', fillLevel: 45 },
        { id: 3, binId: 'BIN003', location: 'East Zone', fillLevel: 55 },
      ],
      full: [
        { id: 4, binId: 'BIN004', location: 'West Zone', fillLevel: 95 },
        { id: 5, binId: 'BIN005', location: 'Central Zone', fillLevel: 90 },
      ],
      maintenance: [
        { id: 6, binId: 'BIN006', location: 'North Zone', issue: 'Sensor malfunction' },
      ],
      inactive: [
        { id: 7, binId: 'BIN007', location: 'South Zone', reason: 'Scheduled removal' },
      ],
    });
  }, []);

  const StatCard = ({ title, value, icon, color = themeColor.main, subtitle, onClick, sx }) => (
    <Card 
      elevation={0}
      sx={{
        height: '100%',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[4],
        },
        ...sx,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: color + '15',
              color: color,
              width: 48,
              height: 48,
              mr: 2,
            }}
          >
            {icon}
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
              {value}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              {title}
            </Typography>
          </Box>
        </Box>
        {subtitle && (
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  const getActivityIcon = (type) => {
    switch (type) {
      case 'alert':
        return <AlertIcon sx={{ color: theme.palette.error.main }} />;
      case 'maintenance':
        return <BuildIcon sx={{ color: theme.palette.warning.main }} />;
      case 'update':
        return <UpdateIcon sx={{ color: themeColor.main }} />;
      case 'empty':
        return <RefreshIcon sx={{ color: theme.palette.success.main }} />;
      default:
        return <NotificationsActive sx={{ color: themeColor.main }} />;
    }
  };

  const formatTimeAgo = (timestamp) => {
    const minutes = Math.floor((Date.now() - new Date(timestamp)) / (1000 * 60));
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const BinStatusSection = ({ title, bins, icon, color, emptyMessage }) => (
    <Card 
      elevation={0}
      sx={{ 
        height: '100%',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 4px 20px 0 ${color}15`,
        },
      }}
    >
      <CardHeader
        avatar={
          <Avatar 
            sx={{ 
              bgcolor: color + '15', 
              color: color,
              width: 40,
              height: 40,
            }}
          >
            {icon}
          </Avatar>
        }
        title={
          <Typography variant="h6" sx={{ fontWeight: 600, color: color }}>
            {title}
          </Typography>
        }
        sx={{ 
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: color + '05',
          py: 2,
        }}
      />
      <CardContent sx={{ p: 0, height: 'calc(100% - 73px)' }}>
        {bins.length === 0 ? (
          <Box sx={{ 
            p: 3, 
            textAlign: 'center',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            bgcolor: color + '02',
          }}>
            <Typography color="text.secondary" sx={{ mb: 1 }}>
              {emptyMessage}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              sx={{ 
                color: color,
                borderColor: color,
                '&:hover': {
                  borderColor: color,
                  bgcolor: color + '10',
                },
              }}
            >
              View All
            </Button>
          </Box>
        ) : (
          <Stack 
            divider={<Divider />} 
            sx={{ 
              maxHeight: 400,
              overflowY: 'auto',
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                bgcolor: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: color + '20',
                borderRadius: 4,
              },
            }}
          >
            {bins.map((bin) => (
              <Box
                key={bin.id}
                sx={{
                  p: 2,
                  '&:hover': {
                    bgcolor: color + '05',
                  },
                  transition: 'background-color 0.2s ease',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: color }}>
                    {bin.binId}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {bin.location}
                  </Typography>
                </Box>
                {bin.fillLevel !== undefined && (
                  <Box sx={{ mt: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Fill Level
                      </Typography>
                      <Typography variant="body2" sx={{ color }}>
                        {bin.fillLevel}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={bin.fillLevel}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: theme.palette.grey[200],
                        '& .MuiLinearProgress-bar': {
                          bgcolor: color,
                        },
                      }}
                    />
                  </Box>
                )}
                {bin.issue && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <WarningIcon sx={{ color: theme.palette.warning.main, fontSize: 20, mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {bin.issue}
                    </Typography>
                  </Box>
                )}
                {bin.reason && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <BlockIcon sx={{ color: theme.palette.text.disabled, fontSize: 20, mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {bin.reason}
                    </Typography>
                  </Box>
                )}
              </Box>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );

  const getFillLevelColor = (level) => {
    if (level >= 90) return theme.palette.error.main;
    if (level >= 75) return theme.palette.warning.main;
    return themeColor.main;
  };

  return (
    <ResponsiveWrapper>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 2,
            mb: 4,
          }}>
            <Box>
              <Typography 
                variant="h3" 
                component="h1" 
                sx={{ 
                  fontWeight: 700,
                  mb: 1,
                  background: `linear-gradient(45deg, ${theme.palette.grey[900]}, ${theme.palette.grey[700]})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Bin Management
              </Typography>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  color: theme.palette.text.secondary,
                  maxWidth: 480,
                }}
              >
                Monitor and manage your smart waste bins across all locations
              </Typography>
            </Box>
            <Box sx={{ 
              display: 'flex', 
              gap: 2,
              flexWrap: 'wrap',
            }}>
              <Button
                variant="outlined"
                startIcon={<MapIcon />}
                onClick={() => navigate('/map-view')}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  px: 3,
                  py: 1,
                  borderColor: themeColor.main,
                  color: themeColor.main,
                  '&:hover': {
                    borderColor: themeColor.dark,
                    bgcolor: themeColor.light,
                  },
                }}
              >
                View Map
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/management/bins/new')}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  px: 3,
                  py: 1,
                  bgcolor: themeColor.main,
                  '&:hover': {
                    bgcolor: themeColor.dark,
                  },
                }}
              >
                Add New Bin
              </Button>
            </Box>
          </Box>

          {/* Stats Overview */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Bins"
                value={stats.totalBins}
                icon={<StorageIcon />}
                color={themeColor.main}
                onClick={() => navigate('/management/bins')}
                sx={{ cursor: 'pointer' }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Active Bins"
                value={stats.activeBins}
                icon={<CheckCircleIcon />}
                color={themeColor.main}
                onClick={() => navigate('/management/bins?status=active')}
                sx={{ cursor: 'pointer' }}
                subtitle={`${((stats.activeBins / stats.totalBins) * 100).toFixed(1)}% of total bins`}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Average Fill Rate"
                value={`${stats.avgFillRate}%`}
                icon={<TimelineIcon />}
                color={getFillLevelColor(stats.avgFillRate)}
                onClick={() => navigate('/management/analytics')}
                sx={{ cursor: 'pointer' }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Active Zones"
                value={stats.activeZones}
                icon={<LocationIcon />}
                color={themeColor.main}
                onClick={() => navigate('/management/bins')}
                sx={{ cursor: 'pointer' }}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Main Content Grid */}
        <Grid container spacing={3}>
          {/* Bin Status Sections */}
          <Grid item xs={12} lg={8}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <BinStatusSection
                  title="Active Bins"
                  bins={binsByStatus.active}
                  icon={<CheckCircleIcon />}
                  color={themeColor.main}
                  emptyMessage="No active bins"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <BinStatusSection
                  title="Full Bins"
                  bins={binsByStatus.full}
                  icon={<ErrorIcon />}
                  color={theme.palette.error.main}
                  emptyMessage="No full bins"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <BinStatusSection
                  title="Under Maintenance"
                  bins={binsByStatus.maintenance}
                  icon={<BuildIcon />}
                  color={theme.palette.warning.main}
                  emptyMessage="No bins under maintenance"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <BinStatusSection
                  title="Inactive Bins"
                  bins={binsByStatus.inactive}
                  icon={<BlockIcon />}
                  color={theme.palette.text.disabled}
                  emptyMessage="No inactive bins"
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12} lg={4}>
            <Card
              elevation={0}
              sx={{ 
                height: '100%',
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
              }}
            >
              <CardHeader
                title={
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Recent Activity
                  </Typography>
                }
                sx={{ 
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  bgcolor: themeColor.light,
                }}
              />
              <List sx={{ p: 0 }}>
                {recentActivity.map((activity) => (
                  <ListItem
                    key={activity.id}
                    sx={{
                      py: 2,
                      px: 3,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      '&:last-child': {
                        borderBottom: 'none',
                      },
                      '&:hover': {
                        bgcolor: themeColor.light,
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'transparent' }}>
                        {getActivityIcon(activity.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {activity.binId}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatTimeAgo(activity.timestamp)}
                          </Typography>
                        </Box>
                      }
                      secondary={activity.message}
                    />
                  </ListItem>
                ))}
              </List>
            </Card>
          </Grid>
        </Grid>

        {/* Bin List */}
        <Box sx={{ mb: 4 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              overflow: 'hidden',
            }}
          >
            <BinList />
          </Paper>
        </Box>
      </Container>
    </ResponsiveWrapper>
  );
};

export default BinManagement; 