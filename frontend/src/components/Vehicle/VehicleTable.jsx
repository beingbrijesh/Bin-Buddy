import React, { useState, useEffect } from 'react';
import {
  TruckIcon,
  UserGroupIcon,
  MapPinIcon,
  ClockIcon,
  EyeIcon,
  PencilIcon,
  PhoneIcon,
  EnvelopeIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
import { Menu } from '@headlessui/react';
import axios from '../../lib/axios';
import { Toaster, toast } from 'react-hot-toast';

const VehicleTable = ({ onViewDetails, viewMode = 'grid' }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await axios.get('/api/vehicles');
      setVehicles(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch vehicles');
      setLoading(false);
      toast.error('Failed to fetch vehicles');
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <TruckIcon className="h-12 w-12 spinner" />
        <p>Loading vehicles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <p>{error}</p>
        <button onClick={fetchVehicles} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="empty-state">
        <TruckIcon className="h-12 w-12" />
        <h3>No Vehicles Found</h3>
        <p>Add your first vehicle to get started</p>
      </div>
    );
  }

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'status-badge active';
      case 'inactive':
        return 'status-badge inactive';
      case 'maintenance':
        return 'status-badge maintenance';
      default:
        return 'status-badge';
    }
  };

  const renderGridView = () => (
    <div className="vehicle-grid">
      {vehicles.map((vehicle) => (
        <div key={vehicle._id} className="vehicle-card">
          <div className="vehicle-header">
            <div className="vehicle-info">
              <h3 className="vehicle-name">{vehicle.name}</h3>
              <span className="vehicle-id">{vehicle.vehicleId}</span>
            </div>
            <span className={getStatusBadgeClass(vehicle.status)}>
              {vehicle.status}
            </span>
          </div>

          <div className="vehicle-details">
            <div className="detail-item">
              <TruckIcon className="h-5 w-5" />
              <span>{vehicle.type}</span>
            </div>
            <div className="detail-item">
              <MapPinIcon className="h-5 w-5" />
              <span>{vehicle.zone || 'No Zone Assigned'}</span>
            </div>
            <div className="detail-item">
              <UserGroupIcon className="h-5 w-5" />
              <span>{vehicle.driver?.name || 'No Driver Assigned'}</span>
            </div>
            <div className="detail-item">
              <ClockIcon className="h-5 w-5" />
              <span>{vehicle.shift || 'No Shift Assigned'}</span>
            </div>
          </div>

          <div className="vehicle-actions">
            <button
              onClick={() => onViewDetails(vehicle)}
              className="action-btn"
            >
              <EyeIcon className="h-4 w-4" />
              View
            </button>
            <button className="action-btn">
              <PencilIcon className="h-4 w-4" />
              Edit
            </button>
            <Menu as="div" className="relative">
              <Menu.Button className="action-btn">
                <EllipsisVerticalIcon className="h-4 w-4" />
              </Menu.Button>
              <Menu.Items className="dropdown-menu">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`dropdown-item ${active ? 'active' : ''}`}
                      onClick={() => {/* Handle maintenance */}}
                    >
                      Log Maintenance
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`dropdown-item ${active ? 'active' : ''}`}
                      onClick={() => {/* Handle assignment */}}
                    >
                      Assign Vehicle
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`dropdown-item ${active ? 'active' : ''}`}
                      onClick={() => {/* Handle tracking */}}
                    >
                      Track Location
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Menu>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTableView = () => (
    <div className="table-container">
      <table className="management-table">
        <thead>
          <tr>
            <th>Vehicle Info</th>
            <th>Type</th>
            <th>Zone</th>
            <th>Driver</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((vehicle) => (
            <tr key={vehicle._id}>
              <td>
                <div className="vehicle-cell">
                  <div className="vehicle-icon">
                    <TruckIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="vehicle-name">{vehicle.name}</div>
                    <div className="vehicle-id">{vehicle.vehicleId}</div>
                  </div>
                </div>
              </td>
              <td>{vehicle.type}</td>
              <td>{vehicle.zone || 'No Zone'}</td>
              <td>
                {vehicle.driver ? (
                  <div className="driver-info">
                    <span>{vehicle.driver.name}</span>
                    <div className="driver-contact">
                      <PhoneIcon className="h-4 w-4" />
                      <EnvelopeIcon className="h-4 w-4" />
                    </div>
                  </div>
                ) : (
                  'No Driver'
                )}
              </td>
              <td>
                <span className={getStatusBadgeClass(vehicle.status)}>
                  {vehicle.status}
                </span>
              </td>
              <td>
                <div className="table-actions">
                  <button
                    onClick={() => onViewDetails(vehicle)}
                    className="action-btn"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button className="action-btn">
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <Menu as="div" className="relative">
                    <Menu.Button className="action-btn">
                      <EllipsisVerticalIcon className="h-4 w-4" />
                    </Menu.Button>
                    <Menu.Items className="dropdown-menu">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            className={`dropdown-item ${active ? 'active' : ''}`}
                            onClick={() => {/* Handle maintenance */}}
                          >
                            Log Maintenance
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            className={`dropdown-item ${active ? 'active' : ''}`}
                            onClick={() => {/* Handle assignment */}}
                          >
                            Assign Vehicle
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            className={`dropdown-item ${active ? 'active' : ''}`}
                            onClick={() => {/* Handle tracking */}}
                          >
                            Track Location
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Menu>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      <Toaster position="top-right" />
      {viewMode === 'grid' ? renderGridView() : renderTableView()}
    </>
  );
};

export default VehicleTable; 