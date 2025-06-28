import React, { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react';
import PropTypes from 'prop-types';
import { Eye, Edit2, Trash2, MoreVertical, Users, Wrench, FileText as DocumentIcon, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../utils/axios';

// Pure component for vehicle avatar with memoization
const VehicleAvatar = memo(({ photo, name, status }) => {
  const getInitials = useCallback((name) => {
    if (!name) return 'V';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }, []);

  const statusColorMap = {
    active: 'bg-green-500',
    maintenance: 'bg-yellow-500',
    inactive: 'bg-gray-500',
    default: 'bg-gray-400'
  };

  return (
    <div className="vehicle-avatar">
      {photo ? (
        <img 
          src={photo}
          alt={name}
          loading="lazy"
          decoding="async"
          className="w-10 h-10 rounded-full object-cover"
        />
      ) : (
        <span className="initials">{getInitials(name)}</span>
      )}
      <span className={`status-badge ${statusColorMap[status] || statusColorMap.default}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    </div>
  );
});

// Pure component for vehicle details
const VehicleDetails = memo(({ vehicle }) => (
  <div className="vehicle-card-body">
    <div className="vehicle-detail">
      <span>Type</span>
      <strong>{vehicle.type}</strong>
    </div>
    <div className="vehicle-detail">
      <span>Capacity</span>
      <strong>{vehicle.capacity?.value || '-'} {vehicle.capacity?.unit || ''}</strong>
    </div>
    <div className="vehicle-detail">
      <span>Zone</span>
      <strong>{vehicle.assignedZone?.name || 'Unassigned'}</strong>
    </div>
  </div>
));

// Pure component for vehicle actions
const VehicleActions = memo(({ 
  vehicle, 
  onViewDetails, 
  onEdit, 
  onDelete, 
  onAssign, 
  onMaintenance, 
  onDocument,
  activeDropdown,
  toggleDropdown
}) => {
  const dropdownRef = useRef(null);

  const handleAction = useCallback((handler) => {
    handler(vehicle);
    toggleDropdown(null);
  }, [vehicle, toggleDropdown]);

  return (
    <div className="dropdown-container" ref={dropdownRef}>
      <button 
        className="more-actions-btn" 
        onClick={() => toggleDropdown(vehicle._id)}
        aria-label="More actions"
      >
        <MoreVertical size={18} />
      </button>
      {activeDropdown === vehicle._id && (
        <div className="dropdown-menu">
          <button onClick={() => handleAction(onViewDetails)}><Eye size={16} /> View</button>
          <button onClick={() => handleAction(onEdit)}><Edit2 size={16} /> Edit</button>
          <button onClick={() => handleAction(onAssign)}><Users size={16} /> Assign</button>
          <button onClick={() => handleAction(onMaintenance)}><Wrench size={16} /> Maintenance</button>
          <button onClick={() => handleAction(onDocument)}><DocumentIcon size={16} /> Documents</button>
          <button onClick={() => handleAction(() => onDelete(vehicle._id))} className="delete"><Trash2 size={16} /> Delete</button>
        </div>
      )}
    </div>
  );
});

// Main VehicleCard component
const VehicleCard = memo(({ 
  vehicle, 
  onViewDetails, 
  onEdit, 
  onDelete, 
  onAssign, 
  onMaintenance, 
  onDocument,
  activeDropdown,
  toggleDropdown
}) => {
  const dropdownRef = useRef(null);

  const handleAction = (handler) => {
    handler();
    toggleDropdown(null);
  };

  
  // Theme colors using #279e0a as primary
  const themeColors = {
    primary: 'bg-[#279e0a]',        // Primary theme color
    primaryHover: 'bg-[#1e7d08]',  // Darker shade for hover
    primaryText: 'text-white',
    secondary: 'bg-[#e6f7e0]',     // Very light green background
    secondaryHover: 'bg-[#d0f0c5]',
    secondaryText: 'text-[#1e7d08]',
    accent: 'bg-[#3b82f6]',        // Blue accent for zones
    accentHover: 'bg-[#2563eb]',
    accentText: 'text-white',
    danger: 'bg-[#ef4444]',
    dangerHover: 'bg-[#dc2626]',
    dangerText: 'text-white'
  };

  const statusColors = {
    active: 'bg-green-100 text-green-800 border border-green-200',
    maintenance: 'bg-amber-100 text-amber-800 border border-amber-200',
    inactive: 'bg-gray-100 text-gray-800 border border-gray-200'
  };

  const getInitials = useCallback((name) => {
    if (!name) return 'V';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all w-full max-w-md flex flex-col">
      
      {/* Card Header */}
      <div className="p-5 pb-3 flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1 min-w-0">
          {vehicle.photoUrl ? (
            <img 
              src={vehicle.photoUrl} 
              alt={vehicle.name} 
              className="w-16 h-16 rounded-lg object-cover border-2 border-white shadow-sm flex-shrink-0"
              loading="lazy"
            />
          ) : (
            <div className={`w-16 h-16 rounded-lg ${themeColors.secondary} flex items-center justify-center border-2 border-white shadow-sm flex-shrink-0`}>
              <span className={`text-2xl ${themeColors.secondaryText} font-semibold`}>{getInitials(vehicle.name)}</span>
            </div>
          )}
          
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex justify-between items-start">
              <div className="min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate">{vehicle.name}</h3>
                <p className="text-sm text-gray-500 truncate">ID: {vehicle.vehicleId}</p>
                {vehicle.assignedZone && (
                  <p className="text-sm text-gray-500 truncate">Zone: {vehicle.assignedZone.name}</p>
                )}
              </div>
              
              {/* Action Dropdown */}
              <div className="relative flex-shrink-0 ml-2" ref={dropdownRef}>
                <button 
                  className={`p-2 rounded-lg ${themeColors.secondary} text-gray-600 hover:${themeColors.secondaryHover} transition-colors`}
                  onClick={() => toggleDropdown(vehicle._id)}
                  aria-label="More actions"
                >
                  <MoreVertical size={20} className="text-gray-600" />
                </button>
                
                {activeDropdown === vehicle._id && (
                  <div className="absolute right-0 mt-1 w-56 bg-white rounded-lg shadow-xl z-10 border border-gray-200 divide-y divide-gray-100">
                    <div className="py-1">
                      <button className={`w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center`} onClick={() => handleAction(() => onViewDetails(vehicle))}>
                        <Eye size={18} className="mr-3 text-gray-500" /> View Details
                      </button>
                      <button className={`w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center`} onClick={() => handleAction(() => onEdit(vehicle))}>
                        <Edit2 size={18} className="mr-3 text-gray-500" /> Edit Vehicle
                      </button>
                    </div>
                    <div className="py-1">
                      <button className={`w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center`} onClick={() => handleAction(() => onAssign(vehicle))}>
                        <Users size={18} className="mr-3 text-gray-500" /> Assign to Zone
                      </button>
                      <button className={`w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center`} onClick={() => handleAction(() => onMaintenance(vehicle))}>
                        <Wrench size={18} className="mr-3 text-gray-500" /> Maintenance
                      </button>
                      
                    </div>
                    <div className="py-1">
                      <button 
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center" 
                        onClick={() => handleAction(() => onDelete(vehicle._id))}
                      >
                        <Trash2 size={18} className="mr-3 text-red-500" /> Delete Vehicle
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Vehicle Type Badge */}
            <span className={`inline-block text-xs px-3 py-1 rounded-full ${themeColors.secondary} ${themeColors.secondaryText} font-medium`}>
              {vehicle.type || 'Vehicle'}
            </span>
            
            {/* Status & Zone */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className={`text-xs px-3 py-1 rounded-full ${statusColors[vehicle.status]}`}>
                {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Card Footer */}
      <div className={`px-5 py-4 ${themeColors.secondary} bg-opacity-30 border-t border-gray-100 mt-auto`}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</p>
            <p className="text-sm font-semibold text-gray-800 mt-1">
              {vehicle.capacity?.value || 'N/A'} {vehicle.capacity?.unit || ''}
            </p>
          </div>
          
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Last Service</p>
            <p className="text-sm font-semibold text-gray-800 mt-1">
              {vehicle.lastMaintenance || 'Not recorded'}
            </p>
          </div>
          
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Registration</p>
            <p className="text-sm font-semibold text-gray-800 mt-1">
              {vehicle.registrationNumber || 'N/A'}
            </p>
          </div>
          
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</p>
            <p className="text-sm font-semibold text-gray-800 mt-1">
              {(() => {
                  const driver = vehicle.assignedDriver || vehicle.assignedWorker;
                  if (!driver) return 'Unassigned';
                  if (typeof driver === 'string') return driver;
                  return driver.name || `${driver.firstName || ''} ${driver.lastName || ''}`.trim() || 'Unassigned';
                })()}
            </p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-4">
          <button 
            className={`px-4 py-2 rounded-lg ${themeColors.secondary} ${themeColors.secondaryText} hover:${themeColors.secondaryHover} flex items-center transition-colors font-medium text-sm`}
            onClick={() => onMaintenance(vehicle)}
          >
            <Wrench size={18} className="mr-2" /> Maintenance
          </button>
          <button 
            className={`px-4 py-2 rounded-lg ${themeColors.primary} ${themeColors.primaryText} hover:${themeColors.primaryHover} flex items-center transition-colors font-medium text-sm`}
            onClick={() => onAssign(vehicle)}
          >
            <Users size={18} className="mr-2" /> Assign
          </button>
        </div>
      </div>
    </div>
  );
});

VehicleCard.propTypes = {
  vehicle: PropTypes.object.isRequired,
  onViewDetails: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onAssign: PropTypes.func.isRequired,
  onMaintenance: PropTypes.func.isRequired,
  onDocument: PropTypes.func.isRequired,
  activeDropdown: PropTypes.string,
  toggleDropdown: PropTypes.func.isRequired
};

// Main VehicleTable component
const VehicleTable = memo(({ 
  vehicles = [], 
  onViewDetails, 
  onEdit, 
  onDelete, 
  onAssign, 
  onMaintenance, 
  onDocument, 
  viewMode = 'table' 
}) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  
  const toggleDropdown = useCallback((vehicleId) => {
    setActiveDropdown(prev => prev === vehicleId ? null : vehicleId);
  }, []);

  const memoizedVehicles = useMemo(() => vehicles, [vehicles]);

  if (viewMode === 'grid') {
    return (
      <div className="vehicle-grid">
        {memoizedVehicles.map(vehicle => (
          <VehicleCard
            key={vehicle._id}
            vehicle={vehicle}
            onViewDetails={onViewDetails}
            onEdit={onEdit}
            onDelete={onDelete}
            onAssign={onAssign}
            onMaintenance={onMaintenance}
            onDocument={onDocument}
            activeDropdown={activeDropdown}
            toggleDropdown={toggleDropdown}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="management-table">
        <thead>
          <tr>
            <th>Vehicle</th>
            <th>Type</th>
            <th>Capacity</th>
            <th>Zone</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {memoizedVehicles.map(vehicle => (
            <tr key={vehicle._id}>
              <td>
                <div className="worker-info-cell">
                  <VehicleAvatar photo={vehicle.photoUrl} name={vehicle.name} status={vehicle.status} />
                  <div className="worker-details">
                    <span className="worker-name">{vehicle.name}</span>
                    <span className="worker-id">{vehicle.vehicleId}</span>
                  </div>
                </div>
              </td>
              <td>{vehicle.type}</td>
              <td>{vehicle.capacity?.value} {vehicle.capacity?.unit}</td>
              <td>{vehicle.zone?.name || 'N/A'}</td>
              <td>
                <div className="status-dropdown-container">
                  <button className={`status-badge ${vehicle.status}`} onClick={() => toggleDropdown(vehicle._id)}>
                    {vehicle.status}
                    <ChevronDown size={16} />
                  </button>
                  {activeDropdown === vehicle._id && (
                    <div className="status-options">
                      <button onClick={() => onEdit(vehicle)}>Active</button>
                      <button onClick={() => onEdit(vehicle)}>Inactive</button>
                      <button onClick={() => onEdit(vehicle)}>Maintenance</button>
                    </div>
                  )}
                </div>
              </td>
              <td>
                <div className="actions-cell">
                  <button className="action-btn" onClick={() => onViewDetails(vehicle)} title="View Details">
                    <Eye size={18} />
                  </button>
                  <button className="action-btn" onClick={() => onEdit(vehicle)} title="Edit Vehicle">
                    <Edit2 size={18} />
                  </button>
                  <button className="action-btn delete" onClick={() => onDelete(vehicle._id)} title="Delete Vehicle">
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

// Prop type validations
VehicleTable.propTypes = {
  vehicles: PropTypes.arrayOf(PropTypes.object).isRequired,
  onViewDetails: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onAssign: PropTypes.func.isRequired,
  onMaintenance: PropTypes.func.isRequired,
  onDocument: PropTypes.func.isRequired,
  viewMode: PropTypes.string
};

export default VehicleTable;