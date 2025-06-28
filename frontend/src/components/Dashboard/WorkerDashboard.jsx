import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Clock, 
  Award, 
  CheckCircle,
  TrendingUp,
  Star,
  RefreshCw,
  Trash2,
  MapPin,
  QrCode,
  Filter,
  Search,
  AlertTriangle,
  BarChart3,
  Calendar,
  Bell
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './WorkerDashboard.css';

const DEFAULT_STATS = {
  completed: 0,
  pending: 0,
  rating: 0.0,
  points: 0
};

const mockChartData = [
  { day: 'Mon', tasks: 8 },
  { day: 'Tue', tasks: 12 },
  { day: 'Wed', tasks: 10 },
  { day: 'Thu', tasks: 15 },
  { day: 'Fri', tasks: 11 },
  { day: 'Sat', tasks: 9 },
  { day: 'Sun', tasks: 7 }
];

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'bins', label: 'Bins' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'badges', label: 'Badges' },
  { id: 'analytics', label: 'Analytics', highlight: true }
];

const WorkerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [filters, setFilters] = useState({
    status: 'all',
    location: 'all',
    fillLevel: 'all'
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API calls
      setStats({
        completed: 128,
        pending: 5,
        rating: 4.8,
        points: 450
      });
      setSchedule([
        { id: 1, time: '09:00 AM', location: 'Sector 7', status: 'completed', binCount: 5 },
        { id: 2, time: '10:30 AM', location: 'Sector 4', status: 'in-progress', binCount: 8 },
        { id: 3, time: '02:00 PM', location: 'Sector 12', status: 'pending', binCount: 6 }
      ]);
      setLastUpdate(new Date());
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatRating = (rating) => rating.toFixed(1);

  const renderBins = () => {
    if (loading) {
      return <div className="empty-state">Loading bins...</div>;
    }

    if (error) {
      return <div className="empty-state error">Failed to load bins</div>;
    }

    return (
      <>
        <div className="filters-section">
          <div className="search-bar">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search bins..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-controls">
            <select 
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="all">All Status</option>
              <option value="empty">Empty</option>
              <option value="full">Full</option>
              <option value="maintenance">Maintenance</option>
            </select>
            <select
              value={filters.location}
              onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
            >
              <option value="all">All Locations</option>
              <option value="north">North Zone</option>
              <option value="south">South Zone</option>
              <option value="east">East Zone</option>
              <option value="west">West Zone</option>
            </select>
            <select
              value={filters.fillLevel}
              onChange={(e) => setFilters(prev => ({ ...prev, fillLevel: e.target.value }))}
            >
              <option value="all">All Fill Levels</option>
              <option value="low">Low (≤25%)</option>
              <option value="medium">Medium (26-75%)</option>
              <option value="high">High ({'>'}75%)</option>
            </select>
          </div>
        </div>
        <div className="bins-list">
          {/* Add your bins list content here */}
          <div className="coming-soon">Bins section coming soon...</div>
        </div>
      </>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <>
            {/* Quick Stats */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <CheckCircle />
                </div>
                <div className="stat-details">
                  <h3>{stats.completed}</h3>
                  <p>Tasks Completed</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <Clock />
                </div>
                <div className="stat-details">
                  <h3>{stats.pending}</h3>
                  <p>Pending Tasks</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <Star />
                </div>
                <div className="stat-details">
                  <h3>{formatRating(stats.rating)}</h3>
                  <p>Rating</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <Award />
                </div>
                <div className="stat-details">
                  <h3>{stats.points}</h3>
                  <p>Points Earned</p>
                </div>
              </div>
            </div>

            <div className="dashboard-grid">
              {/* Today's Schedule */}
              <div className="dashboard-card">
                <div className="card-header">
                  <h2><Calendar size={20} /> Today's Schedule</h2>
                  <Link to="/worker/schedule" className="view-all-link">View Full Schedule</Link>
                </div>
                <div className="schedule-list">
                  {schedule.map((task) => (
                    <div key={task.id} className={`schedule-item ${task.status}`}>
                      <div className="schedule-time">
                        <Clock size={16} />
                        <span>{task.time}</span>
                      </div>
                      <div className="schedule-details">
                        <h4>{task.location}</h4>
                        <p>{task.binCount} bins to collect</p>
                      </div>
                      <div className={`status-badge ${task.status}`}>
                        {task.status === 'completed' && <CheckCircle size={16} />}
                        {task.status === 'in-progress' && <Clock size={16} />}
                        {task.status === 'pending' && <AlertTriangle size={16} />}
                        {task.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Chart */}
              <div className="dashboard-card">
                <div className="card-header">
                  <h2><BarChart3 size={20} /> Weekly Performance</h2>
                </div>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={mockChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="tasks" stroke="#4CAF50" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="dashboard-card full-width">
                <div className="card-header">
                  <h2>Quick Actions</h2>
                </div>
                <div className="quick-actions-grid">
                  <Link to="/worker/scan" className="quick-action-card">
                    <QrCode size={24} />
                    <h3>Scan QR Code</h3>
                    <p>Scan bin QR codes to mark collections</p>
                  </Link>
                  <Link to="/worker/map" className="quick-action-card">
                    <MapPin size={24} />
                    <h3>View Map</h3>
                    <p>Check bin locations and routes</p>
                  </Link>
                  <Link to="/worker/reports" className="quick-action-card">
                    <AlertTriangle size={24} />
                    <h3>Report Issue</h3>
                    <p>Report problems with bins or routes</p>
                  </Link>
                  <Link to="/worker/history" className="quick-action-card">
                    <Clock size={24} />
                    <h3>View History</h3>
                    <p>Check your collection history</p>
                  </Link>
                </div>
              </div>
            </div>
          </>
        );
      case 'bins':
        return renderBins();
      case 'tasks':
        return <div className="coming-soon">Tasks section coming soon...</div>;
      case 'badges':
        return <div className="coming-soon">Badges section coming soon...</div>;
      case 'analytics':
        return <div className="coming-soon">Analytics section coming soon...</div>;
      default:
        return null;
    }
  };

  return (
    <div className="worker-dashboard">
      {/* Greeting Section */}
      <div className="greeting-card">
        <div className="greeting-header">
          <h1>Welcome back, {user?.name || 'Worker'}! 👋</h1>
          <p className="role-badge">WORKER</p>
        </div>
        <p className="quick-tip">
          Track your tasks, manage bin collections, and maintain your performance.
          <button onClick={fetchDashboardData} className="refresh-btn" disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spinning' : ''} />
            Last updated: {lastUpdate.toLocaleTimeString()}
          </button>
        </p>
      </div>

      {/* Navigation Tabs */}
      <nav className="dashboard-nav">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''} ${tab.highlight ? 'highlight' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Dashboard Content */}
      <div className="dashboard-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default WorkerDashboard; 