import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, MapPin, Calendar, AlertCircle,
  ArrowLeft, Edit2, Trash2, Shield, Activity
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import './Management.css';

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const response = await fetch(`/api/users/${id}`);
      const data = await response.json();
      setUser(data);
    } catch (error) {
      toast.error('Failed to fetch user details');
      navigate('/management/users');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      // TODO: Replace with actual API call
      await fetch(`/api/users/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      toast.success('User status updated successfully');
      fetchUserDetails();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const handleDelete = async () => {
    try {
      // TODO: Replace with actual API call
      await fetch(`/api/users/${id}`, {
        method: 'DELETE'
      });
      toast.success('User deleted successfully');
      navigate('/management/users');
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner" />
        <p>Loading user details...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="error-state">
        <AlertCircle size={48} />
        <h3>User Not Found</h3>
        <p>The requested user could not be found</p>
        <button 
          className="action-btn"
          onClick={() => navigate('/management/users')}
        >
          <ArrowLeft size={16} />
          Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Header */}
      <div className="profile-header">
        <button 
          className="back-btn"
          onClick={() => navigate('/management/users')}
        >
          <ArrowLeft size={20} />
          Back to Users
        </button>
        <div className="header-actions">
          <button 
            className="action-btn danger"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 size={16} />
            Delete User
          </button>
          <button 
            className="action-btn primary"
            onClick={() => navigate(`/management/users/edit/${id}`)}
          >
            <Edit2 size={16} />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="profile-content">
        <div className="profile-main">
          {/* Basic Info */}
          <div className="profile-section">
            <div className="profile-avatar-large">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} />
              ) : (
                <span className="initials">{getInitials(user.name)}</span>
              )}
              <span 
                className={`status-indicator large ${getStatusColor(user.status)}`}
                title={user.status}
              />
            </div>
            <div className="profile-info">
              <h1>{user.name}</h1>
              <p className="user-id">{user.userId}</p>
              <div className="status-badge large" data-status={getStatusColor(user.status)}>
                {user.status}
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="info-section">
            <h2>Contact Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <Mail size={20} />
                <div className="info-content">
                  <label>Email</label>
                  <p>{user.email}</p>
                </div>
              </div>
              <div className="info-item">
                <Phone size={20} />
                <div className="info-content">
                  <label>Phone</label>
                  <p>{user.phone}</p>
                </div>
              </div>
              <div className="info-item">
                <MapPin size={20} />
                <div className="info-content">
                  <label>Zone</label>
                  <p>{user.zone || 'Unassigned'}</p>
                </div>
              </div>
              <div className="info-item">
                <Calendar size={20} />
                <div className="info-content">
                  <label>Joined</label>
                  <p>{new Date(user.registrationDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="info-section">
            <h2>Account Details</h2>
            <div className="info-grid">
              <div className="info-item">
                <Shield size={20} />
                <div className="info-content">
                  <label>Role</label>
                  <p>{user.role}</p>
                </div>
              </div>
              <div className="info-item">
                <Activity size={20} />
                <div className="info-content">
                  <label>Last Active</label>
                  <p>{new Date(user.lastActive).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="profile-sidebar">
          <div className="activity-section">
            <h2>Recent Activity</h2>
            <div className="timeline">
              {user.activityLog?.map((activity, index) => (
                <div key={index} className="timeline-item">
                  <div className="timeline-icon">
                    <Activity size={16} />
                  </div>
                  <div className="timeline-content">
                    <p className="activity-text">{activity.description}</p>
                    <span className="activity-date">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Delete User</h3>
            <p>Are you sure you want to delete this user? This action cannot be undone.</p>
            <div className="modal-actions">
              <button 
                className="action-btn"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button 
                className="action-btn danger"
                onClick={handleDelete}
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile; 