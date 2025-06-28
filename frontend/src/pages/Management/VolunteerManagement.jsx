import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  UserPlus, Search, Filter, Grid as GridIcon, List as ListIcon,
  MoreVertical, Eye, Edit2, Bell, Mail, Phone, Star, MapPin,
  AlertCircle, CheckCircle, XCircle, Award, Calendar, Clock,
  FileText, Activity, RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import './Management.css';

const VolunteerManagement = () => {
  // State management
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [editingVolunteer, setEditingVolunteer] = useState(null);
  const [pendingVolunteers, setPendingVolunteers] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    skills: 'all',
    zone: 'all',
    availability: 'all',
    sortBy: 'name-asc'
  });

  // Filter options
  const filterOptions = useMemo(() => ({
    status: [
      { value: 'all', label: 'All Statuses' },
      { value: 'active', label: 'Active' },
      { value: 'on-leave', label: 'On Leave' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'pending', label: 'Pending Approval' }
    ],
    skills: [
      { value: 'all', label: 'All Skills' },
      { value: 'waste-sorting', label: 'Waste Sorting' },
      { value: 'recycling', label: 'Recycling' },
      { value: 'composting', label: 'Composting' },
      { value: 'education', label: 'Education' }
    ],
    availability: [
      { value: 'all', label: 'All Availability' },
      { value: 'weekdays', label: 'Weekdays' },
      { value: 'weekends', label: 'Weekends' },
      { value: 'flexible', label: 'Flexible' }
    ],
    sortBy: [
      { value: 'name-asc', label: 'Name (A-Z)' },
      { value: 'name-desc', label: 'Name (Z-A)' },
      { value: 'hours-high', label: 'Hours (High-Low)' },
      { value: 'hours-low', label: 'Hours (Low-High)' },
      { value: 'date-joined', label: 'Date Joined' }
    ]
  }), []);

  // Stats for overview cards
  const stats = [
    {
      title: 'Total Volunteers',
      value: volunteers.length,
      icon: <Award size={20} />,
      color: 'primary'
    },
    {
      title: 'Active Volunteers',
      value: volunteers.filter(v => v.status === 'active').length,
      icon: <CheckCircle size={20} />,
      color: 'success'
    },
    {
      title: 'Total Hours',
      value: volunteers.reduce((acc, v) => acc + (v.hoursLogged || 0), 0),
      icon: <Clock size={20} />,
      color: 'info'
    },
    {
      title: 'Pending Approval',
      value: pendingVolunteers.length,
      icon: <Bell size={20} />,
      color: 'warning'
    }
  ];

  // Fetch volunteers on component mount
  useEffect(() => {
    fetchVolunteers();
    fetchPendingVolunteers();
  }, []);

  // Fetch volunteers function
  const fetchVolunteers = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const response = await fetch('/api/volunteers');
      const data = await response.json();
      setVolunteers(data);
    } catch (error) {
      toast.error('Failed to fetch volunteers');
    } finally {
      setLoading(false);
    }
  };

  // Fetch pending volunteers
  const fetchPendingVolunteers = async () => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/volunteers/pending');
      const data = await response.json();
      setPendingVolunteers(data);
    } catch (error) {
      console.error('Failed to fetch pending volunteers:', error);
    }
  };

  // Handle volunteer actions
  const handleAddVolunteer = () => {
    setEditingVolunteer(null);
    setShowAddModal(true);
  };

  const handleEditVolunteer = (volunteer) => {
    setEditingVolunteer(volunteer);
    setShowAddModal(true);
  };

  const handleViewVolunteer = (volunteerId) => {
    // Navigate to volunteer profile page
    navigate(`/management/volunteers/${volunteerId}`);
  };

  const handleStatusChange = async (volunteerId, newStatus) => {
    try {
      // TODO: Replace with actual API call
      await fetch(`/api/volunteers/${volunteerId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      toast.success('Volunteer status updated successfully');
      fetchVolunteers();
    } catch (error) {
      toast.error('Failed to update volunteer status');
    }
  };

  // Render functions
  const renderStats = () => (
    <div className="stats-grid">
      {stats.map((stat, index) => (
        <div key={index} className="stat-card">
          <div className={`stat-icon ${stat.color}`}>{stat.icon}</div>
          <div className="stat-info">
            <h3>{stat.title}</h3>
            <div className="stat-value">{stat.value}</div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderFilters = () => (
    <div className="controls-section">
      <div className="search-filter-container">
        <div className="search-bar">
          <Search size={18} color="#666" />
          <input
            type="text"
            placeholder="Search volunteers by name, ID, or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              className="clear-search" 
              onClick={() => setSearchTerm('')}
              aria-label="Clear search"
            >
              <XCircle size={16} />
            </button>
          )}
        </div>

        <button 
          className="refresh-btn" 
          onClick={fetchVolunteers}
          aria-label="Refresh data"
          title="Refresh data"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="filters-wrapper">
        <h3 className="filters-title">
          <Filter size={16} />
          <span>Filter Volunteers</span>
        </h3>
        
        <div className="filters-group">
          {Object.entries(filterOptions).map(([key, options]) => (
            <div className="filter-select" key={key}>
              <label htmlFor={`${key}-filter`}>{key === 'sortBy' ? 'Sort By' : key.charAt(0).toUpperCase() + key.slice(1)}</label>
              <select
                id={`${key}-filter`}
                value={filters[key]}
                onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
              >
                {options.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
          
          <button 
            className="clear-filters-btn"
            onClick={() => {
              setSearchTerm('');
              setFilters({
                status: 'all',
                skills: 'all',
                zone: 'all',
                availability: 'all',
                sortBy: 'name-asc'
              });
            }}
            title="Clear all filters"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="management-container">
      <div className="management-content">
        {/* Page Header */}
        <div className="page-header">
          <div className="header-content">
            <h1>Volunteer Management</h1>
            <p className="subtitle">Manage volunteer activities and engagement</p>
          </div>
          <div className="header-actions">
            {pendingVolunteers.length > 0 && (
              <button 
                className="notification-btn" 
                onClick={() => setShowPendingModal(true)}
                title={`${pendingVolunteers.length} pending applications`}
              >
                <Bell size={20} className={pendingVolunteers.length > 0 ? "animate-bell" : ""} />
                <span className="notification-badge">{pendingVolunteers.length}</span>
              </button>
            )}
            <div className="view-toggle">
              <button 
                className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
                title="Grid view"
              >
                <GridIcon size={20} />
              </button>
              <button 
                className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
                aria-label="Table view"
                title="Table view"
              >
                <ListIcon size={20} />
              </button>
            </div>
            <button 
              className="add-worker-btn" 
              onClick={handleAddVolunteer}
            >
              <UserPlus size={18} />
              Add Volunteer
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        {renderStats()}

        {/* Filters and Search */}
        {renderFilters()}

        {/* Volunteer List */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>Loading volunteers...</p>
          </div>
        ) : volunteers.length === 0 ? (
          <div className="empty-state">
            <Award size={48} />
            <h3>No Volunteers Found</h3>
            <p>Start by adding new volunteers to the system</p>
            <button className="add-worker-btn" onClick={handleAddVolunteer}>
              <UserPlus size={18} />
              Add First Volunteer
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="workers-grid">
            {volunteers.map(volunteer => (
              <div 
                key={volunteer._id} 
                className="worker-card"
              >
                <div className="worker-card-header">
                  <div className="worker-avatar">
                    {volunteer.avatar ? (
                      <img src={volunteer.avatar} alt={volunteer.name} />
                    ) : (
                      <span className="initials">{getInitials(volunteer.name)}</span>
                    )}
                    <span 
                      className={`status-indicator ${getStatusColor(volunteer.status)}`} 
                      title={volunteer.status} 
                    />
                  </div>
                  <div className="worker-info">
                    <h3 title={volunteer.name}>{volunteer.name}</h3>
                    <p className="worker-id">{volunteer.volunteerId}</p>
                    <div className="status-badge" data-status={getStatusColor(volunteer.status)}>
                      {volunteer.status}
                    </div>
                  </div>
                  <div className="dropdown-container" ref={dropdownRef}>
                    <button 
                      className="more-actions-btn"
                      onClick={() => toggleDropdown(volunteer._id)}
                    >
                      <MoreVertical size={18} />
                    </button>
                    {activeDropdown === volunteer._id && (
                      <div className="dropdown-menu">
                        <button 
                          className="dropdown-item"
                          onClick={() => handleViewVolunteer(volunteer._id)}
                        >
                          <Eye size={16} />
                          <span>View Profile</span>
                        </button>
                        <button 
                          className="dropdown-item"
                          onClick={() => handleEditVolunteer(volunteer)}
                        >
                          <Edit2 size={16} />
                          <span>Edit Volunteer</span>
                        </button>
                        {/* Add more dropdown items as needed */}
                      </div>
                    )}
                  </div>
                </div>
                <div className="worker-card-body">
                  <div className="contact-info">
                    <a href={`mailto:${volunteer.email}`} className="contact-link">
                      <Mail size={16} />
                      <span className="contact-text">{volunteer.email}</span>
                    </a>
                    <a href={`tel:${volunteer.phone}`} className="contact-link">
                      <Phone size={16} />
                      <span className="contact-text">{volunteer.phone}</span>
                    </a>
                  </div>
                  <div className="work-info">
                    <div className="info-item">
                      <MapPin size={16} />
                      <span>{volunteer.zone || 'Unassigned'}</span>
                    </div>
                    <div className="info-item">
                      <Clock size={16} />
                      <span>{volunteer.hoursLogged || 0} Hours</span>
                    </div>
                    <div className="info-item">
                      <Calendar size={16} />
                      <span>{volunteer.availability || 'Flexible'}</span>
                    </div>
                  </div>
                </div>
                <div className="worker-card-footer">
                  <button 
                    className="action-btn"
                    onClick={() => handleViewVolunteer(volunteer._id)}
                  >
                    <Eye size={16} />
                    <span>View Profile</span>
                  </button>
                  <button 
                    className="action-btn primary"
                    onClick={() => handleEditVolunteer(volunteer)}
                  >
                    <Edit2 size={16} />
                    <span>Edit</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="table-container">
            <table className="management-table">
              <thead>
                <tr>
                  <th>Volunteer</th>
                  <th>Contact</th>
                  <th>Skills</th>
                  <th>Status</th>
                  <th>Hours Logged</th>
                  <th>Availability</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {volunteers.map(volunteer => (
                  <tr key={volunteer._id}>
                    <td>
                      <div className="worker-cell">
                        <div className="worker-avatar small">
                          {volunteer.avatar ? (
                            <img src={volunteer.avatar} alt={volunteer.name} />
                          ) : (
                            <span className="initials">{getInitials(volunteer.name)}</span>
                          )}
                          <span 
                            className={`status-indicator ${getStatusColor(volunteer.status)}`} 
                            title={volunteer.status} 
                          />
                        </div>
                        <div className="worker-basic-info">
                          <span className="name">{volunteer.name}</span>
                          <span className="id">{volunteer.volunteerId}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="contact-cell">
                        <a href={`mailto:${volunteer.email}`}>{volunteer.email}</a>
                        <a href={`tel:${volunteer.phone}`}>{volunteer.phone}</a>
                      </div>
                    </td>
                    <td>
                      <div className="skills-tags">
                        {volunteer.skills?.map(skill => (
                          <span key={skill} className="skill-tag">{skill}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="status-badge" data-status={getStatusColor(volunteer.status)}>
                        {volunteer.status}
                      </div>
                    </td>
                    <td>{volunteer.hoursLogged || 0} hours</td>
                    <td>{volunteer.availability || 'Flexible'}</td>
                    <td>
                      <div className="action-buttons">
                        <button onClick={() => handleViewVolunteer(volunteer._id)}>
                          <Eye size={16} />
                        </button>
                        <button onClick={() => handleEditVolunteer(volunteer)}>
                          <Edit2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default VolunteerManagement; 