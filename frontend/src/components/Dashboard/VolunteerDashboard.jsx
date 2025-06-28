import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FileText,
  Calendar,
  Award,
  CheckCircle,
  Users,
  ClipboardList,
  Star,
  MapPin
} from 'lucide-react';
import './VolunteerDashboard.css';

const VolunteerDashboard = () => {
  const { user } = useAuth();

  useEffect(() => {
    console.log('VolunteerDashboard mounted');
    console.log('Current user:', user);
  }, [user]);

  const quickStats = [
    { label: 'Events Attended', value: '5', icon: <Calendar />, route: '/events' },
    { label: 'Reports Made', value: '15', icon: <FileText />, route: '/reports' },
    { label: 'Areas Covered', value: '3', icon: <MapPin />, route: '/map-view' },
    { label: 'Impact Points', value: '450', icon: <Star />, route: '/impact' }
  ];

  console.log('Rendering VolunteerDashboard');

  return (
    <div className="volunteer-dashboard">
      {/* Greeting Card */}
      <div className="greeting-card">
        <div className="greeting-header">
          <h1>Welcome, {user?.name || 'Volunteer'}! 👋</h1>
          <div className="volunteer-rank">
            <Star size={20} className="rank-icon" />
            <span>Silver Volunteer</span>
          </div>
        </div>
        <p className="quick-tip">Thank you for making our community cleaner and greener!</p>
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
        {/* Quick Actions */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Quick Actions</h2>
          </div>
          <div className="action-buttons">
            <Link to="/submit-report" className="action-button">
              <FileText size={24} />
              <span>Submit Bin Report</span>
            </Link>
            <Link to="/events" className="action-button">
              <Calendar size={24} />
              <span>View Events</span>
            </Link>
            <Link to="/forms" className="action-button">
              <ClipboardList size={24} />
              <span>Community Forms</span>
            </Link>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2><Calendar size={20} /> Upcoming Events</h2>
            <Link to="/events" className="view-all-link">
              View All
            </Link>
          </div>
          <div className="events-list">
            <div className="event-item">
              <div className="event-info">
                <h3>Community Cleanup Drive</h3>
                <p>Saturday, 10:00 AM</p>
                <span className="event-location">Central Park</span>
              </div>
              <button className="join-btn">Join</button>
            </div>
            <div className="event-item">
              <div className="event-info">
                <h3>Waste Segregation Workshop</h3>
                <p>Sunday, 2:00 PM</p>
                <span className="event-location">Community Center</span>
              </div>
              <button className="join-btn">Join</button>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2><Users size={20} /> Volunteer Leaderboard</h2>
            <span className="rank-badge">Rank #5</span>
          </div>
          <div className="leaderboard">
            <div className="leaderboard-item top">
              <span className="position">1</span>
              <span className="name">Michael S.</span>
              <span className="points">2,450 pts</span>
            </div>
            <div className="leaderboard-item">
              <span className="position">2</span>
              <span className="name">Emma R.</span>
              <span className="points">2,120 pts</span>
            </div>
            <div className="leaderboard-item">
              <span className="position">3</span>
              <span className="name">David M.</span>
              <span className="points">1,890 pts</span>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2><Award size={20} /> Recent Achievements</h2>
          </div>
          <div className="achievements">
            <div className="achievement">
              <Award size={24} className="achievement-icon" />
              <div className="achievement-info">
                <h3>Cleanup Champion</h3>
                <p>Participated in 5 cleanup events</p>
              </div>
            </div>
            <div className="achievement">
              <Star size={24} className="achievement-icon" />
              <div className="achievement-info">
                <h3>Report Star</h3>
                <p>Submitted 10 accurate bin reports</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard; 