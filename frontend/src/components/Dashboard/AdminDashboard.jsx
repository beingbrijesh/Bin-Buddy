import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  Bell,
  BarChart3,
  MapPin,
  Users,
  Trash2,
  CheckCircle,
  Clock,
  AlertTriangle,
  Image,
  MessageSquare,
  Star,
  FileText
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();

  useEffect(() => {
    console.log('AdminDashboard mounted');
    console.log('Current user:', user);
  }, [user]);

  // Mock data - Replace with real data from your backend
  const mockChartData = [
    { day: 'Mon', tasks: 12 },
    { day: 'Tue', tasks: 19 },
    { day: 'Wed', tasks: 15 },
    { day: 'Thu', tasks: 22 },
    { day: 'Fri', tasks: 18 },
    { day: 'Sat', tasks: 14 },
    { day: 'Sun', tasks: 10 }
  ];

  const mockNotifications = [
    { type: 'report', message: 'New bin report from Sector 7', time: '5m ago' },
    { type: 'photo', message: 'Worker uploaded collection proof', time: '15m ago' },
    { type: 'complaint', message: 'Complaint: Bin overflow in Area 4', time: '1h ago' }
  ];

  const mockTopWorkers = [
    { name: 'John Doe', tasks: 45, rating: 4.8 },
    { name: 'Jane Smith', tasks: 42, rating: 4.7 },
    { name: 'Mike Johnson', tasks: 38, rating: 4.6 }
  ];

  const mockRecentActions = [
    { type: 'bin', message: 'New bin registered in Sector 9', time: '2h ago', route: '/bin-management' },
    { type: 'task', message: 'Task assigned to John Doe', time: '3h ago', route: '/task-management' },
    { type: 'scan', message: 'QR Code scanned at Location A', time: '4h ago', route: '/qr-scanner' }
  ];

  const quickStats = [
    { label: 'Total Bins', value: '245', icon: <Trash2 />, route: '/bin-management' },
    { label: 'Full Bins Today', value: '18', icon: <AlertTriangle />, route: '/bin-management' },
    { label: 'Active Tasks', value: '32', icon: <Clock />, route: '/task-management' },
    { label: 'Completed Tasks', value: '128', icon: <CheckCircle />, route: '/task-management' },
    { label: 'Active Workers', value: '12', icon: <Users />, route: '/worker-management' }
  ];

  console.log('Rendering AdminDashboard');

  return (
    <div className="admin-dashboard">
      {/* Greeting Card */}
      <div className="greeting-card">
        <div className="greeting-header">
          <h1>Welcome, {user?.name || 'Admin'}! 👋</h1>
          <p className="role-badge">ADMIN</p>
        </div>
        <p className="quick-tip">Monitor real-time bin status and worker performance through the dashboard.</p>
      </div>

      {/* Quick Stats Grid */}
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
        {/* Notifications Section */}
        <div className="dashboard-card notifications">
          <div className="card-header">
            <h2><Bell size={20} /> Recent Notifications</h2>
          </div>
          <div className="notification-list">
            {mockNotifications.map((notification, index) => (
              <div key={index} className="notification-item">
                {notification.type === 'report' && <AlertTriangle className="notification-icon report" />}
                {notification.type === 'photo' && <Image className="notification-icon photo" />}
                {notification.type === 'complaint' && <MessageSquare className="notification-icon complaint" />}
                <div className="notification-content">
                  <p>{notification.message}</p>
                  <span>{notification.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Graph Area */}
        <div className="dashboard-card graph">
          <div className="card-header">
            <h2><BarChart3 size={20} /> Tasks Timeline</h2>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="tasks" stroke="#279e0a" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Map */}
        <div className="dashboard-card map full-width">
          <div className="card-header">
            <h2><MapPin size={20} /> Live Map View</h2>
            <Link to="/map-view" className="view-all-link">
              View Full Map
            </Link>
          </div>
          <div className="map-container">
            {/* Map component will be integrated here */}
            <div className="map-placeholder">
              <p>Interactive India map with pin clusters will be displayed here</p>
            </div>
          </div>
        </div>

        {/* Top Workers */}
        <div className="dashboard-card workers">
          <div className="card-header">
            <h2><Users size={20} /> Top Workers</h2>
            <Link to="/worker-management" className="view-all-link">
              View All
            </Link>
          </div>
          <div className="workers-list">
            {mockTopWorkers.map((worker, index) => (
              <div key={index} className="worker-item">
                <div className="worker-info">
                  <h3>{worker.name}</h3>
                  <p>{worker.tasks} tasks completed</p>
                </div>
                <div className="worker-rating">
                  <Star className="star-icon" />
                  <span>{worker.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Actions */}
        <div className="dashboard-card actions">
          <div className="card-header">
            <h2><FileText size={20} /> Recent Actions</h2>
          </div>
          <div className="actions-list">
            {mockRecentActions.map((action, index) => (
              <Link to={action.route} key={index} className="action-item">
                {action.type === 'bin' && <Trash2 className="action-icon bin" />}
                {action.type === 'task' && <CheckCircle className="action-icon task" />}
                {action.type === 'scan' && <MapPin className="action-icon scan" />}
                <div className="action-content">
                  <p>{action.message}</p>
                  <span>{action.time}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 