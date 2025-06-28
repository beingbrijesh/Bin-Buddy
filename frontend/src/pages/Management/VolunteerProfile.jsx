import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, MapPin, Calendar, AlertCircle,
  ArrowLeft, Edit2, Trash2, Clock, Activity, Award,
  BookOpen, Star, CheckCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import './Management.css';

const VolunteerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [volunteer, setVolunteer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchVolunteerDetails();
  }, [id]);

  const fetchVolunteerDetails = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const response = await fetch(`/api/volunteers/${id}`);
      const data = await response.json();
      setVolunteer(data);
    } catch (error) {
      toast.error('Failed to fetch volunteer details');
      navigate('/management/volunteers');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      // TODO: Replace with actual API call
      await fetch(`/api/volunteers/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      toast.success('Volunteer status updated successfully');
      fetchVolunteerDetails();
    } catch (error) {
      toast.error('Failed to update volunteer status');
    }
  };

  const handleDelete = async () => {
    try {
      // TODO: Replace with actual API call
      await fetch(`/api/volunteers/${id}`, {
        method: 'DELETE'
      });
      toast.success('Volunteer deleted successfully');
      navigate('/management/volunteers');
    } catch (error) {
      toast.error('Failed to delete volunteer');
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner" />
        <p>Loading volunteer details...</p>
      </div>
    );
  }

  if (!volunteer) {
    return (
      <div className="error-state">
        <AlertCircle size={48} />
        <h3>Volunteer Not Found</h3>
        <p>The requested volunteer could not be found</p>
        <button 
          className="action-btn"
          onClick={() => navigate('/management/volunteers')}
        >
          <ArrowLeft size={16} />
          Back to Volunteers
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
          onClick={() => navigate('/management/volunteers')}
        >
          <ArrowLeft size={20} />
          Back to Volunteers
        </button>
        <div className="header-actions">
          <button 
            className="action-btn danger"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 size={16} />
            Delete Volunteer
          </button>
          <button 
            className="action-btn primary"
            onClick={() => navigate(`/management/volunteers/edit/${id}`)}
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
              {volunteer.avatar ? (
                <img src={volunteer.avatar} alt={volunteer.name} />
              ) : (
                <span className="initials">{getInitials(volunteer.name)}</span>
              )}
              <span 
                className={`status-indicator large ${getStatusColor(volunteer.status)}`}
                title={volunteer.status}
              />
            </div>
            <div className="profile-info">
              <h1>{volunteer.name}</h1>
              <p className="volunteer-id">{volunteer.volunteerId}</p>
              <div className="status-badge large" data-status={getStatusColor(volunteer.status)}>
                {volunteer.status}
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
                  <p>{volunteer.email}</p>
                </div>
              </div>
              <div className="info-item">
                <Phone size={20} />
                <div className="info-content">
                  <label>Phone</label>
                  <p>{volunteer.phone}</p>
                </div>
              </div>
              <div className="info-item">
                <MapPin size={20} />
                <div className="info-content">
                  <label>Zone</label>
                  <p>{volunteer.zone || 'Unassigned'}</p>
                </div>
              </div>
              <div className="info-item">
                <Calendar size={20} />
                <div className="info-content">
                  <label>Joined</label>
                  <p>{new Date(volunteer.registrationDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Volunteer Details */}
          <div className="info-section">
            <h2>Volunteer Details</h2>
            <div className="info-grid">
              <div className="info-item">
                <Clock size={20} />
                <div className="info-content">
                  <label>Hours Logged</label>
                  <p>{volunteer.hoursLogged || 0} hours</p>
                </div>
              </div>
              <div className="info-item">
                <Calendar size={20} />
                <div className="info-content">
                  <label>Availability</label>
                  <p>{volunteer.availability || 'Flexible'}</p>
                </div>
              </div>
              <div className="info-item">
                <Award size={20} />
                <div className="info-content">
                  <label>Impact Score</label>
                  <p>{volunteer.impactScore || 0} points</p>
                </div>
              </div>
              <div className="info-item">
                <Star size={20} />
                <div className="info-content">
                  <label>Rating</label>
                  <p>{volunteer.rating || 'Not rated'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Skills & Certifications */}
          <div className="info-section">
            <h2>Skills & Certifications</h2>
            <div className="skills-grid">
              {volunteer.skills?.map((skill, index) => (
                <div key={index} className="skill-tag">
                  <CheckCircle size={16} />
                  <span>{skill}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="profile-sidebar">
          <div className="activity-section">
            <h2>Recent Activity</h2>
            <div className="timeline">
              {volunteer.activityLog?.map((activity, index) => (
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

          {/* Achievements */}
          <div className="achievements-section">
            <h2>Achievements</h2>
            <div className="achievements-grid">
              {volunteer.achievements?.map((achievement, index) => (
                <div key={index} className="achievement-card">
                  <Award size={24} className="achievement-icon" />
                  <div className="achievement-info">
                    <h3>{achievement.title}</h3>
                    <p>{achievement.description}</p>
                    <span className="achievement-date">
                      {new Date(achievement.earnedDate).toLocaleDateString()}
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
            <h3>Delete Volunteer</h3>
            <p>Are you sure you want to delete this volunteer? This action cannot be undone.</p>
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
                Delete Volunteer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VolunteerProfile; 