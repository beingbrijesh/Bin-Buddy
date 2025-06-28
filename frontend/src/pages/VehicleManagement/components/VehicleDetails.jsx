import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useMaps } from '../../../components/Maps/MapsProvider';
import api from '../../../utils/axios';

const Tab = ({ active, onClick, children }) => (
  <button
    className={`px-4 py-2 text-sm font-medium border-b-2 ${
      active
        ? 'border-indigo-500 text-indigo-600'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
    }`}
    onClick={onClick}
  >
    {children}
  </button>
);

const LocationMap = ({ locationHistory }) => {
  const mapRef = React.useRef(null);
  const mapInstanceRef = React.useRef(null);
  const markersRef = React.useRef([]);
  const pathRef = React.useRef(null);
  const mapsConfig = useMaps();

  useEffect(() => {
    if (!mapRef.current || !window.google || !locationHistory?.length) return;

    // Initialize map
    const map = new window.google.maps.Map(mapRef.current, {
      center: mapsConfig.defaultCenter,
      zoom: mapsConfig.defaultZoom,
      mapId: mapsConfig.mapId,
      ...mapsConfig.mapOptions
    });
    mapInstanceRef.current = map;

    // Clean up on unmount
    return () => {
      if (pathRef.current) {
        pathRef.current.setMap(null);
      }
      markersRef.current.forEach(marker => {
        if (marker) {
          marker.setMap(null);
        }
      });
      markersRef.current = [];
    };
  }, [mapsConfig]);

  useEffect(() => {
    if (!mapInstanceRef.current || !locationHistory?.length || !window.google) return;

    // Clear existing markers and path
    if (pathRef.current) {
      pathRef.current.setMap(null);
    }
    markersRef.current.forEach(marker => {
      if (marker) {
        marker.setMap(null);
      }
    });
    markersRef.current = [];

    // Create path coordinates
    const pathCoordinates = locationHistory.map(location => ({
      lat: location.coordinates[1],
      lng: location.coordinates[0]
    }));

    // Draw path
    pathRef.current = new window.google.maps.Polyline({
      path: pathCoordinates,
      geodesic: true,
      strokeColor: '#4F46E5',
      strokeOpacity: 1.0,
      strokeWeight: 2
    });
    pathRef.current.setMap(mapInstanceRef.current);

    // Add markers for each location
    locationHistory.forEach((location, index) => {
      const position = {
        lat: location.coordinates[1],
        lng: location.coordinates[0]
      };

      // Create marker element
      const markerElement = document.createElement('div');
      markerElement.className = 'location-marker';
      markerElement.innerHTML = `
        <div style="
          background-color: ${index === locationHistory.length - 1 ? '#4CAF50' : '#4F46E5'};
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>
      `;

      // Create marker
      const marker = new window.google.maps.marker.AdvancedMarkerElement({
        map: mapInstanceRef.current,
        position: position,
        content: markerElement,
        title: `Location at ${new Date(location.timestamp).toLocaleString()}`
      });

      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    const bounds = new window.google.maps.LatLngBounds();
    pathCoordinates.forEach(coord => bounds.extend(coord));
    mapInstanceRef.current.fitBounds(bounds);
  }, [locationHistory]);

  return (
    <div
      ref={mapRef}
      className="w-full h-full min-h-[400px] rounded-lg"
    />
  );
};

const VehicleDetails = ({ isOpen, onClose, vehicle }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [locationHistory, setLocationHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && vehicle?.id) {
      fetchLocationHistory();
    }
  }, [isOpen, vehicle?.id]);

  const fetchLocationHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/api/vehicles/${vehicle._id}/location`);
      setLocationHistory(response.data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching location history:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !vehicle) return null;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Vehicle ID</h3>
                <p className="mt-1 text-sm text-gray-900">{vehicle.vehicleId || vehicle.id}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Registration Number</h3>
                <p className="mt-1 text-sm text-gray-900">{vehicle.registrationNumber || vehicle.registrationNo}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Type</h3>
                <p className="mt-1 text-sm text-gray-900">{vehicle.type}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <p className="mt-1 text-sm text-gray-900">{vehicle.status}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Zone</h3>
                <p className="mt-1 text-sm text-gray-900">{vehicle.assignedZone?.name || 'Unassigned'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Capacity</h3>
                <p className="mt-1 text-sm text-gray-900">{vehicle.capacity ? `${vehicle.capacity.value ?? ''} ${vehicle.capacity.unit ?? ''}`.trim() : 'N/A'}</p>
              </div>
            </div>
          </div>
        );

      case 'driver': {
        const driver = vehicle.assignedDriver;
        // Determine display name based on data type
        const driverName = typeof driver === 'string'
          ? driver
          : (driver?.name || `${driver?.firstName || ''} ${driver?.lastName || ''}`.trim());
        const initial = driverName && typeof driverName === 'string' ? driverName.charAt(0) : '?';

        return (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900">Assigned Driver</h3>
              <div className="mt-4">
                {driverName ? (
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-lg font-medium text-gray-600">{initial}</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-medium text-gray-900">{driverName}</h4>
                      {typeof driver === 'object' && driver?.licenseNumber && (
                        <p className="text-sm text-gray-500">License: {driver.licenseNumber}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No driver assigned.</p>
                )}
              </div>
            </div>
          </div>
        );
      }

      case 'maintenance':
        return (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900">Maintenance History</h3>
              <div className="mt-4">
                <div className="flow-root">
                  <ul className="-mb-8">
                    {vehicle.maintenanceHistory?.map((record, index) => (
                      <li key={index}>
                        <div className="relative pb-8">
                          {index < vehicle.maintenanceHistory.length - 1 && (
                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" />
                          )}
                          <div className="relative flex space-x-3">
                            <div>
                              <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                                <span className="text-white text-sm">✓</span>
                              </span>
                            </div>
                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                              <div>
                                <p className="text-sm text-gray-500">
                                  {record.description}
                                </p>
                              </div>
                              <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                <time dateTime={record.date}>{new Date(record.date).toLocaleDateString()}</time>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 'location':
        return (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Location History</h3>
                <button
                  onClick={fetchLocationHistory}
                  className="text-sm text-indigo-600 hover:text-indigo-900"
                >
                  Refresh
                </button>
              </div>
              {loading ? (
                <div className="flex justify-center items-center h-96">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : error ? (
                <div className="text-center text-red-600 p-4">
                  Error: {error}
                </div>
              ) : locationHistory.length === 0 ? (
                <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No location history available</p>
                </div>
              ) : (
                <div className="h-96 bg-gray-100 rounded-lg overflow-hidden">
                  <LocationMap locationHistory={locationHistory} />
                </div>
              )}
            </div>
          </div>
        );

      case 'tasks':
        return (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900">Task Logs</h3>
              <div className="mt-4">
                <div className="flow-root">
                  <ul className="-mb-8">
                    {vehicle.taskLogs?.map((task, index) => (
                      <li key={index}>
                        <div className="relative pb-8">
                          {index < vehicle.taskLogs.length - 1 && (
                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" />
                          )}
                          <div className="relative flex space-x-3">
                            <div>
                              <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                                <span className="text-white text-sm">T</span>
                              </span>
                            </div>
                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                              <div>
                                <p className="text-sm text-gray-500">
                                  {task.description}
                                </p>
                              </div>
                              <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                <time dateTime={task.timestamp}>{new Date(task.timestamp).toLocaleString()}</time>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 'documents':
        return (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900">Documents</h3>
              <div className="mt-4">
                <p className="text-gray-500">Document management functionality will be here.</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Vehicle Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <Tab
              active={activeTab === 'overview'}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </Tab>
            <Tab
              active={activeTab === 'driver'}
              onClick={() => setActiveTab('driver')}
            >
              Assigned Driver
            </Tab>
            <Tab
              active={activeTab === 'maintenance'}
              onClick={() => setActiveTab('maintenance')}
            >
              Maintenance History
            </Tab>
            <Tab
              active={activeTab === 'location'}
              onClick={() => setActiveTab('location')}
            >
              Location History
            </Tab>
            <Tab
              active={activeTab === 'tasks'}
              onClick={() => setActiveTab('tasks')}
            >
              Task Logs
            </Tab>
            <Tab
              active={activeTab === 'documents'}
              onClick={() => setActiveTab('documents')}
            >
              Documents
            </Tab>
          </nav>
        </div>

        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default VehicleDetails; 