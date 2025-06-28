import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, MapPin, Phone, Mail, Shield, Edit2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    address: user.address || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // TODO: Implement profile update API call
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const getRoleSpecificContent = () => {
    switch (user.role) {
      case 'admin':
        return (
          <div className="role-specific-section">
            <h3>Admin Dashboard</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <h4>Total Users</h4>
                <p>1,234</p>
              </div>
              <div className="stat-card">
                <h4>Active Workers</h4>
                <p>45</p>
              </div>
              <div className="stat-card">
                <h4>Volunteers</h4>
                <p>89</p>
              </div>
              <div className="stat-card">
                <h4>Total Bins</h4>
                <p>567</p>
              </div>
            </div>
          </div>
        );
      case 'worker':
        return (
          <div className="role-specific-section">
            <h3>Worker Dashboard</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <h4>Bins Collected</h4>
                <p>156</p>
              </div>
              <div className="stat-card">
                <h4>Routes Completed</h4>
                <p>23</p>
              </div>
              <div className="stat-card">
                <h4>Hours Worked</h4>
                <p>180</p>
              </div>
              <div className="stat-card">
                <h4>Rating</h4>
                <p>4.8/5</p>
              </div>
            </div>
          </div>
        );
      case 'volunteer':
        return (
          <div className="role-specific-section">
            <h3>Volunteer Dashboard</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <h4>Events Attended</h4>
                <p>12</p>
              </div>
              <div className="stat-card">
                <h4>Hours Contributed</h4>
                <p>48</p>
              </div>
              <div className="stat-card">
                <h4>Impact Score</h4>
                <p>750</p>
              </div>
              <div className="stat-card">
                <h4>Next Event</h4>
                <p>2 days</p>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="role-specific-section">
            <h3>User Dashboard</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <h4>Waste Reported</h4>
                <p>23</p>
              </div>
              <div className="stat-card">
                <h4>Points Earned</h4>
                <p>450</p>
              </div>
              <div className="stat-card">
                <h4>Reports Status</h4>
                <p>15 Resolved</p>
              </div>
              <div className="stat-card">
                <h4>Green Score</h4>
                <p>85/100</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <User size={40} />
        </div>
        <div className="profile-title">
          <h1>{user.name}</h1>
          <span className={`role-badge ${user.role}`}>{user.role}</span>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <div className="section-header">
            <h2>Personal Information</h2>
            <button 
              className="edit-button"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? (
                <>
                  <X size={16} />
                  Cancel
                </>
              ) : (
                <>
                  <Edit2 size={16} />
                  Edit Profile
                </>
              )}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="edit-form">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Address</label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                />
              </div>

              <button type="submit" className="save-button">
                <Save size={16} />
                Save Changes
              </button>
            </form>
          ) : (
            <div className="info-grid">
              <div className="info-item">
                <Mail className="info-icon" />
                <div>
                  <label>Email</label>
                  <p>{user.email}</p>
                </div>
              </div>
              <div className="info-item">
                <Phone className="info-icon" />
                <div>
                  <label>Phone</label>
                  <p>{user.phone || 'Not provided'}</p>
                </div>
              </div>
              <div className="info-item">
                <MapPin className="info-icon" />
                <div>
                  <label>Address</label>
                  <p>{user.address || 'Not provided'}</p>
                </div>
              </div>
              <div className="info-item">
                <Shield className="info-icon" />
                <div>
                  <label>Role</label>
                  <p className="capitalize">{user.role}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {getRoleSpecificContent()}

        <button onClick={logout} className="logout-button">
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default ProfilePage; 