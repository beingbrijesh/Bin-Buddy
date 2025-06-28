import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FileText,
  Award,
  MapPin,
  Bell,
  Calendar,
  Star,
  AlertCircle,
  Trash2,
  CheckCircle,
  Camera,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './UserDashboard.css';

const mockChartData = [
  { month: 'Jan', reports: 4 },
  { month: 'Feb', reports: 6 },
  { month: 'Mar', reports: 3 },
  { month: 'Apr', reports: 8 },
  { month: 'May', reports: 5 },
  { month: 'Jun', reports: 7 }
];

const UserDashboard = () => {
  const { user } = useAuth();
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  const quickStats = [
    { label: 'Reward Points', value: '450', icon: <Award />, route: '/rewards' },
    { label: 'Reports Made', value: '8', icon: <FileText />, route: '/reports' },
    { label: 'Areas Watched', value: '3', icon: <MapPin />, route: '/map-view' },
    { label: 'Impact Score', value: '320', icon: <Star />, route: '/impact' }
  ];

  const recentReports = [
    { id: 1, status: 'resolved', message: 'Bin #123 overflow reported', time: '2 days ago' },
    { id: 2, status: 'pending', message: 'Damaged bin in Sector 7', time: '3 days ago' },
    { id: 3, status: 'resolved', message: 'Missing bin reported', time: '5 days ago' }
  ];

  const upcomingEvents = [
    {
      title: 'Community Cleanup Drive',
      date: 'Saturday, 10:00 AM',
      location: 'Central Park',
      points: 100
    },
    {
      title: 'Waste Segregation Workshop',
      date: 'Sunday, 2:00 PM',
      location: 'Community Center',
      points: 50
    }
  ];

  const notifications = [
    { type: 'success', message: 'Your last report was resolved', time: '1h ago' },
    { type: 'info', message: 'New event in your area', time: '3h ago' },
    { type: 'warning', message: 'Bin #456 needs attention', time: '5h ago' }
  ];

  const handleRefresh = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLastUpdate(new Date());
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="user-dashboard">
      {/* Greeting Section */}
      <div className="greeting-card">
        <div className="greeting-header">
          <h1>Welcome, {user?.name || 'User'}! 👋</h1>
          <p className="role-badge">USER</p>
        </div>
        <p className="quick-tip">
          Help keep our community clean by reporting and tracking bins in your area.
          <button onClick={handleRefresh} className="refresh-btn" disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spinning' : ''} />
            Last updated: {lastUpdate.toLocaleTimeString()}
          </button>
        </p>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        {quickStats.map((stat, index) => (
          <Link to={stat.route} key={index} className="stat-card">
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-details">
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* Recent Reports */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2><FileText size={20} /> Recent Reports</h2>
            <Link to="/reports" className="view-all-link">View All</Link>
          </div>
          <div className="reports-list">
            {recentReports.map((report) => (
              <div key={report.id} className="report-item">
                <div className={`status-badge ${report.status}`}>
                  {report.status === 'resolved' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  {report.status}
                </div>
                <div className="report-content">
                  <p>{report.message}</p>
                  <span>{report.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2><Bell size={20} /> Notifications</h2>
          </div>
          <div className="notifications-list">
            {notifications.map((notification, index) => (
              <div key={index} className={`notification-item ${notification.type}`}>
                {notification.type === 'success' && <CheckCircle className="notification-icon" />}
                {notification.type === 'info' && <Bell className="notification-icon" />}
                {notification.type === 'warning' && <AlertCircle className="notification-icon" />}
                <div className="notification-content">
                  <p>{notification.message}</p>
                  <span>{notification.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Chart */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2><BarChart3 size={20} /> Reporting Activity</h2>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="reports" stroke="#4CAF50" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2><Calendar size={20} /> Upcoming Events</h2>
            <Link to="/events" className="view-all-link">View All</Link>
          </div>
          <div className="events-list">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="event-item">
                <div className="event-icon">
                  <Calendar size={24} />
                </div>
                <div className="event-details">
                  <h3>{event.title}</h3>
                  <p className="event-time">{event.date}</p>
                  <p className="event-location">{event.location}</p>
                </div>
                <div className="event-points">
                  <Star size={16} />
                  <span>{event.points} points</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-card full-width">
          <div className="card-header">
            <h2>Quick Actions</h2>
          </div>
          <div className="quick-actions-grid">
            <Link to="/report/new" className="quick-action-card">
              <FileText size={24} />
              <h3>Report Issue</h3>
              <p>Report a bin or waste-related issue</p>
            </Link>
            <Link to="/camera" className="quick-action-card">
              <Camera size={24} />
              <h3>Quick Capture</h3>
              <p>Take a photo to report an issue</p>
            </Link>
            <Link to="/map" className="quick-action-card">
              <MapPin size={24} />
              <h3>Find Nearby Bins</h3>
              <p>Locate bins in your area</p>
            </Link>
            <Link to="/rewards/redeem" className="quick-action-card">
              <Award size={24} />
              <h3>Redeem Points</h3>
              <p>Use your earned points for rewards</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard; 