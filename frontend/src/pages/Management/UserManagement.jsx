import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  UserPlus, Search, Filter, Grid as GridIcon, List as ListIcon,
  MoreVertical, Eye, Edit2, Bell, Mail, Phone, Star, MapPin,
  AlertCircle, CheckCircle, XCircle, Users, RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../utils/axios';
import './Management.css';

// Utility functions
const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();
};

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'success';
    case 'inactive':
      return 'warning';
    case 'banned':
      return 'danger';
    case 'pending':
      return 'pending';
    default:
      return 'neutral';
  }
};

const UserManagement = () => {
  // State management
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    role: 'all',
    zone: 'all',
    sortBy: 'name-asc'
  });

  // Filter options
  const filterOptions = useMemo(() => ({
    status: [
      { value: 'all', label: 'All Statuses' },
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'banned', label: 'Banned' },
      { value: 'pending', label: 'Pending Verification' }
    ],
    role: [
      { value: 'all', label: 'All Roles' },
      { value: 'user', label: 'Regular User' },
      { value: 'premium', label: 'Premium User' },
      { value: 'business', label: 'Business User' }
    ],
    sortBy: [
      { value: 'name-asc', label: 'Name (A-Z)' },
      { value: 'name-desc', label: 'Name (Z-A)' },
      { value: 'date-new', label: 'Newest First' },
      { value: 'date-old', label: 'Oldest First' },
      { value: 'status', label: 'Status' }
    ]
  }), []);

  // Stats for overview cards
  const stats = [
    {
      title: 'Total Users',
      value: users.length,
      icon: <Users size={20} />,
      color: 'primary'
    },
    {
      title: 'Active Users',
      value: users.filter(user => user.status === 'active').length,
      icon: <CheckCircle size={20} />,
      color: 'success'
    },
    {
      title: 'Inactive Users',
      value: users.filter(user => user.status === 'inactive').length,
      icon: <AlertCircle size={20} />,
      color: 'warning'
    },
    {
      title: 'Pending Verification',
      value: pendingUsers.length,
      icon: <Bell size={20} />,
      color: 'info'
    }
  ];

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
    fetchPendingUsers();
  }, []);

  // Fetch users function
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch pending users
  const fetchPendingUsers = async () => {
    try {
      console.log('Fetching pending users...');
      const token = localStorage.getItem('binbuddy_token');
      
      if (!token) {
        console.warn('No auth token found');
        setPendingUsers([]);
        return;
      }
      
      const response = await api.get('/users/pending-users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Pending users response:', response.data);
      setPendingUsers(response.data || []);
    } catch (error) {
      console.error('Failed to fetch pending users:', error);
      setPendingUsers([]); // Set empty array on error
      // Don't show toast for this error as it's not critical
    }
  };

  // Handle user actions
  const handleAddUser = () => {
    setEditingUser(null);
    setShowAddModal(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowAddModal(true);
  };

  const handleViewUser = (userId) => {
    // Navigate to user profile page
    navigate(`/management/users/${userId}`);
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await api.put(`/users/${userId}/status`, { status: newStatus });
      toast.success('User status updated successfully');
      fetchUsers();
    } catch (error) {
      console.error('Failed to update user status:', error);
      toast.error('Failed to update user status');
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
            placeholder="Search users by name, ID, or role..."
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
          onClick={fetchUsers}
          aria-label="Refresh data"
          title="Refresh data"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="filters-wrapper">
        <h3 className="filters-title">
          <Filter size={16} />
          <span>Filter Users</span>
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
                role: 'all',
                zone: 'all',
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
            <h1>User Management</h1>
            <p className="subtitle">Manage user accounts and access control</p>
          </div>
          <div className="header-actions">
            {pendingUsers.length > 0 && (
              <button 
                className="notification-btn" 
                onClick={() => setShowPendingModal(true)}
                title={`${pendingUsers.length} pending verifications`}
              >
                <Bell size={20} className={pendingUsers.length > 0 ? "animate-bell" : ""} />
                <span className="notification-badge">{pendingUsers.length}</span>
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
              onClick={handleAddUser}
            >
              <UserPlus size={18} />
              Add User
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        {renderStats()}

        {/* Filters and Search */}
        {renderFilters()}

        {/* User List */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <Users size={48} />
            <h3>No Users Found</h3>
            <p>Start by adding new users to the system</p>
            <button className="add-worker-btn" onClick={handleAddUser}>
              <UserPlus size={18} />
              Add First User
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="workers-grid">
            {users.map(user => (
              <div 
                key={user._id} 
                className="worker-card"
              >
                <div className="worker-card-header">
                  <div className="worker-avatar">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} />
                    ) : (
                      <span className="initials">{getInitials(user.name)}</span>
                    )}
                    <span 
                      className={`status-indicator ${getStatusColor(user.status)}`} 
                      title={user.status} 
                    />
                  </div>
                  <div className="worker-info">
                    <h3 title={user.name}>{user.name}</h3>
                    <p className="worker-id">{user.userId}</p>
                    <div className="status-badge" data-status={getStatusColor(user.status)}>
                      {user.status}
                    </div>
                  </div>
                  <div className="dropdown-container" ref={dropdownRef}>
                    <button 
                      className="more-actions-btn"
                      onClick={() => toggleDropdown(user._id)}
                    >
                      <MoreVertical size={18} />
                    </button>
                    {activeDropdown === user._id && (
                      <div className="dropdown-menu">
                        <button 
                          className="dropdown-item"
                          onClick={() => handleViewUser(user._id)}
                        >
                          <Eye size={16} />
                          <span>View Profile</span>
                        </button>
                        <button 
                          className="dropdown-item"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit2 size={16} />
                          <span>Edit User</span>
                        </button>
                        {/* Add more dropdown items as needed */}
                      </div>
                    )}
                  </div>
                </div>
                <div className="worker-card-body">
                  <div className="contact-info">
                    <a href={`mailto:${user.email}`} className="contact-link">
                      <Mail size={16} />
                      <span className="contact-text">{user.email}</span>
                    </a>
                    <a href={`tel:${user.phone}`} className="contact-link">
                      <Phone size={16} />
                      <span className="contact-text">{user.phone}</span>
                    </a>
                  </div>
                  <div className="work-info">
                    <div className="info-item">
                      <MapPin size={16} />
                      <span>{user.zone || 'Unassigned'}</span>
                    </div>
                  </div>
                </div>
                <div className="worker-card-footer">
                  <button 
                    className="action-btn"
                    onClick={() => handleViewUser(user._id)}
                  >
                    <Eye size={16} />
                    <span>View Profile</span>
                  </button>
                  <button 
                    className="action-btn primary"
                    onClick={() => handleEditUser(user)}
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
                  <th>User</th>
                  <th>Contact</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Registration Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>
                      <div className="worker-cell">
                        <div className="worker-avatar small">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} />
                          ) : (
                            <span className="initials">{getInitials(user.name)}</span>
                          )}
                          <span 
                            className={`status-indicator ${getStatusColor(user.status)}`} 
                            title={user.status} 
                          />
                        </div>
                        <div className="worker-basic-info">
                          <span className="name">{user.name}</span>
                          <span className="id">{user.userId}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="contact-cell">
                        <a href={`mailto:${user.email}`}>{user.email}</a>
                        <a href={`tel:${user.phone}`}>{user.phone}</a>
                      </div>
                    </td>
                    <td>
                      <span className="role-tag">{user.role}</span>
                    </td>
                    <td>
                      <div className="status-badge" data-status={getStatusColor(user.status)}>
                        {user.status}
                      </div>
                    </td>
                    <td>{new Date(user.registrationDate).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button onClick={() => handleViewUser(user._id)}>
                          <Eye size={16} />
                        </button>
                        <button onClick={() => handleEditUser(user)}>
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

export default UserManagement; 