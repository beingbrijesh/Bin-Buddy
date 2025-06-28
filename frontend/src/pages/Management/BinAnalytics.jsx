import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  TimelineOutlined,
  BarChartOutlined,
  PieChartOutlined,
  ShowChartOutlined,
} from '@mui/icons-material';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import axios from 'axios';
import { ResponsiveWrapper } from '../../components/layout';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const BinAnalytics = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analytics, setAnalytics] = useState({
    totalBins: 0,
    activeBins: 0,
    totalCollections: 0,
    averageFillRate: 0,
    collectionHistory: [],
    binTypes: [],
    zoneDistribution: [],
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      // Temporary mock data for testing
      setAnalytics({
        totalBins: 150,
        activeBins: 132,
        totalCollections: 1250,
        averageFillRate: 68,
        collectionHistory: [
          { date: '2024-01', count: 200 },
          { date: '2024-02', count: 250 },
          { date: '2024-03', count: 280 },
          { date: '2024-04', count: 220 },
          { date: '2024-05', count: 300 },
        ],
        binTypes: [
          { type: 'General Waste', count: 60 },
          { type: 'Recyclables', count: 45 },
          { type: 'Organic', count: 30 },
          { type: 'Hazardous', count: 15 },
        ],
        zoneDistribution: [
          { zone: 'North', count: 40 },
          { zone: 'South', count: 35 },
          { zone: 'East', count: 45 },
          { zone: 'West', count: 30 },
        ],
      });
      // Comment out the actual API call for now
      // const response = await axios.get('/api/bins/analytics');
      // setAnalytics(response.data);
    } catch (error) {
      setError('Failed to load analytics data');
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {React.cloneElement(icon, { sx: { color, mr: 1 } })}
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" color={color}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  const collectionHistoryData = {
    labels: analytics.collectionHistory.map(item => item.date),
    datasets: [
      {
        label: 'Collections',
        data: analytics.collectionHistory.map(item => item.count),
        borderColor: theme.palette.primary.main,
        tension: 0.4,
      },
    ],
  };

  const binTypesData = {
    labels: analytics.binTypes.map(item => item.type),
    datasets: [
      {
        data: analytics.binTypes.map(item => item.count),
        backgroundColor: [
          theme.palette.primary.main,
          theme.palette.secondary.main,
          theme.palette.success.main,
          theme.palette.warning.main,
        ],
      },
    ],
  };

  const zoneDistributionData = {
    labels: analytics.zoneDistribution.map(item => item.zone),
    datasets: [
      {
        label: 'Bins per Zone',
        data: analytics.zoneDistribution.map(item => item.count),
        backgroundColor: theme.palette.primary.main,
      },
    ],
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <ResponsiveWrapper>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Bin Analytics
        </Typography>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Bins"
              value={analytics.totalBins}
              icon={<BarChartOutlined />}
              color={theme.palette.primary.main}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Bins"
              value={analytics.activeBins}
              icon={<TimelineOutlined />}
              color={theme.palette.success.main}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Collections"
              value={analytics.totalCollections}
              icon={<ShowChartOutlined />}
              color={theme.palette.info.main}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Avg. Fill Rate"
              value={`${analytics.averageFillRate}%`}
              icon={<PieChartOutlined />}
              color={theme.palette.warning.main}
            />
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Collection History
                </Typography>
                <Box sx={{ height: isMobile ? '200px' : '300px' }}>
                  <Line
                    data={collectionHistoryData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Bin Types Distribution
                </Typography>
                <Box sx={{ height: isMobile ? '200px' : '300px' }}>
                  <Pie
                    data={binTypesData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Zone Distribution
                </Typography>
                <Box sx={{ height: isMobile ? '200px' : '300px' }}>
                  <Bar
                    data={zoneDistributionData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </ResponsiveWrapper>
  );
};

export default BinAnalytics; 