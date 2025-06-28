import React, { useState, useEffect } from 'react';
import { X, Edit, MapPin, Trash2, Tool, CheckCircle, Calendar, AlertCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../utils/axios';

const VehicleDetailsDrawer = ({ isOpen, onClose, vehicle, onEdit, onAssign, onDelete, onRefresh }) => {
  const [activeTab, setActiveTab] = useState('info');
  const [maintenanceHistory, setMaintenanceHistory] = useState([]);
  const [assignmentHistory, setAssignmentHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  // Fetch maintenance and assignment history when vehicle changes
  useEffect(() => {
    if (isOpen && vehicle) {
      fetchMaintenanceHistory();
      fetchAssignmentHistory();
    }
  }, [isOpen, vehicle]);
  
  // Fetch vehicle maintenance history
  const fetchMaintenanceHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await api.get(`/api/vehicles/${vehicle._id}/maintenance-history`);
      setMaintenanceHistory(response.data || []);
    } catch (error) {
      console.error('Error fetching maintenance history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };
  
  // Fetch vehicle assignment history
  const fetchAssignmentHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await api.get(`/api/vehicles/${vehicle._id}/assignment-history`);
      setAssignmentHistory(response.data || []);
    } catch (error) {
      console.error('Error fetching assignment history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd MMM yyyy, HH:mm');
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  // Get capacity text
  const getCapacityText = () => {
    if (!vehicle.capacity) return 'N/A';
    return `${vehicle.capacity.value} ${vehicle.capacity.unit}`;
  };
  
  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
      case 'repair':
        return 'bg-amber-100 text-amber-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'breakdown':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // If drawer is closed or no vehicle data, don't render anything
  if (!isOpen || !vehicle) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      
      <div className="absolute inset-y-0 right-0 max-w-xl w-full bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium">Vehicle Details</h3>
          <button
            className="p-1 rounded-full hover:bg-gray-100"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* Tabs */}
        <div className="border-b">
          <div className="flex">
            <button
              className={`px-4 py-2 border-b-2 ${
                activeTab === 'info' ? 'border-primary text-primary' : 'border-transparent'
              }`}
              onClick={() => setActiveTab('info')}
            >
              Basic Info
            </button>
            <button
              className={`px-4 py-2 border-b-2 ${
                activeTab === 'specs' ? 'border-primary text-primary' : 'border-transparent'
              }`}
              onClick={() => setActiveTab('specs')}
            >
              Specs
            </button>
            <button
              className={`px-4 py-2 border-b-2 ${
                activeTab === 'tracking' ? 'border-primary text-primary' : 'border-transparent'
              }`}
              onClick={() => setActiveTab('tracking')}
            >
              Tracking
            </button>
            <button
              className={`px-4 py-2 border-b-2 ${
                activeTab === 'maintenance' ? 'border-primary text-primary' : 'border-transparent'
              }`}
              onClick={() => setActiveTab('maintenance')}
            >
              Maintenance
            </button>
            <button
              className={`px-4 py-2 border-b-2 ${
                activeTab === 'assignments' ? 'border-primary text-primary' : 'border-transparent'
              }`}
              onClick={() => setActiveTab('assignments')}
            >
              Assignments
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {activeTab === 'info' && (
            <div>
              <div className="flex items-center mb-4">
                <div className="bg-gray-100 p-3 rounded-full mr-4">
                  <svg className="h-10 w-10 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9h8m-8 4h8m-8 4h8M4 5h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V7a2 2 0 012-2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xl font-semibold">{vehicle.vehicleId}</h4>
                  <p className="text-gray-600">{vehicle.registrationNumber}</p>
                  <div className="mt-1">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(vehicle.status)}`}>
                      {vehicle.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-medium capitalize">{vehicle.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Manufacturer</p>
                  <p className="font-medium">{vehicle.manufacturer}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Model</p>
                  <p className="font-medium">{vehicle.model}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Year</p>
                  <p className="font-medium">{vehicle.year}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Capacity</p>
                  <p className="font-medium">{getCapacityText()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fuel Type</p>
                  <p className="font-medium capitalize">{vehicle.fuelType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Assigned Driver</p>
                  <p className="font-medium">{vehicle.assignedDriver?.name || 'Not assigned'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Assigned Zone</p>
                  <p className="font-medium">{vehicle.assignedZone?.name || 'Not assigned'}</p>
                </div>
              </div>
              
              {vehicle.notes && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Notes</p>
                  <div className="bg-gray-50 p-3 rounded mt-1">
                    <p className="text-sm">{vehicle.notes}</p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'specs' && (
            <div>
              <h4 className="text-lg font-medium mb-4">Technical Specifications</h4>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Fuel Capacity</p>
                  <p className="font-medium">{vehicle.fuelCapacity?.value || 'N/A'} {vehicle.fuelCapacity?.unit || ''}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Current Fuel</p>
                  <p className="font-medium">{vehicle.currentFuelLevel?.value || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Length</p>
                  <p className="font-medium">{vehicle.specs?.length || 'N/A'} m</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Width</p>
                  <p className="font-medium">{vehicle.specs?.width || 'N/A'} m</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Height</p>
                  <p className="font-medium">{vehicle.specs?.height || 'N/A'} m</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Weight Capacity</p>
                  <p className="font-medium">{vehicle.specs?.weightCapacity ? `${vehicle.specs.weightCapacity} kg` : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fuel Efficiency</p>
                  <p className="font-medium">
                    {vehicle.specs?.fuelEfficiency ? 
                      `${vehicle.specs.fuelEfficiency.value} ${vehicle.specs.fuelEfficiency.unit}` : 'N/A'}
                  </p>
                </div>
              </div>
              
              {vehicle.specs?.features && vehicle.specs.features.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">Features</p>
                  <div className="flex flex-wrap gap-2">
                    {vehicle.specs.features.map((feature, index) => (
                      <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-6">
                <h5 className="text-md font-medium mb-2">Insurance & Documents</h5>
                
                {vehicle.insurance && (
                  <div className="mb-4 bg-gray-50 p-3 rounded">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-gray-500">Provider</p>
                        <p className="font-medium">{vehicle.insurance.provider || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Policy Number</p>
                        <p className="font-medium">{vehicle.insurance.policyNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Valid Until</p>
                        <p className="font-medium">{vehicle.insurance.validUntil ? formatDate(vehicle.insurance.validUntil) : 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {vehicle.documents && vehicle.documents.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Documents</p>
                    <div className="space-y-2">
                      {vehicle.documents.map((doc, index) => (
                        <a 
                          key={index} 
                          href={doc.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block bg-gray-50 hover:bg-gray-100 p-2 rounded flex items-center"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-xs text-gray-500">
                              {doc.type} • Expires: {doc.expiryDate ? formatDate(doc.expiryDate) : 'N/A'}
                            </p>
                          </div>
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'tracking' && (
            <div>
              <h4 className="text-lg font-medium mb-4">Tracking Information</h4>
              
              {vehicle.tracking?.currentLocation ? (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">Current Location</p>
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <p>{vehicle.tracking.currentLocation.address || 'No address available'}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Lat: {vehicle.tracking.currentLocation.lat}, Lng: {vehicle.tracking.currentLocation.lng}
                        </p>
                        <p className="text-xs text-gray-500">
                          Last Updated: {formatDate(vehicle.tracking.currentLocation.lastUpdated)}
                        </p>
                      </div>
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${vehicle.tracking.currentLocation.lat},${vehicle.tracking.currentLocation.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary text-sm flex items-center"
                      >
                        <span>View on Map</span>
                        <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No location data available</p>
              )}
              
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-gray-500">Availability Status</p>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    vehicle.tracking?.isAvailable
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {vehicle.tracking?.isAvailable ? 'Available' : 'In Use'}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Last Used: {vehicle.tracking?.lastUsed ? formatDate(vehicle.tracking.lastUsed) : 'N/A'}
                </p>
              </div>
              
              {vehicle.telemetry && (
                <div className="mt-6">
                  <h5 className="text-md font-medium mb-3">Telemetry Data</h5>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xs text-gray-500">Engine Temperature</p>
                          <p className="font-medium">{vehicle.telemetry.engineTemp?.value || 'N/A'} {vehicle.telemetry.engineTemp?.unit}</p>
                        </div>
                        <div className={
                          vehicle.telemetry.engineTemp?.value > 90 
                            ? 'text-red-500' 
                            : vehicle.telemetry.engineTemp?.value > 80
                              ? 'text-amber-500'
                              : 'text-green-500'
                        }>
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Updated: {vehicle.telemetry.engineTemp?.lastUpdated ? formatDate(vehicle.telemetry.engineTemp.lastUpdated) : 'N/A'}
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xs text-gray-500">Odometer</p>
                          <p className="font-medium">{vehicle.telemetry.odometer?.value || 'N/A'} {vehicle.telemetry.odometer?.unit}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Updated: {vehicle.telemetry.odometer?.lastUpdated ? formatDate(vehicle.telemetry.odometer.lastUpdated) : 'N/A'}
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xs text-gray-500">Battery Level</p>
                          <p className="font-medium">{vehicle.telemetry.batteryLevel?.value || 'N/A'}%</p>
                        </div>
                        <div className={
                          (vehicle.telemetry.batteryLevel?.value < 20)
                            ? 'text-red-500'
                            : (vehicle.telemetry.batteryLevel?.value < 50)
                              ? 'text-amber-500'
                              : 'text-green-500'
                        }>
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xs text-gray-500">Current Load</p>
                          <p className="font-medium">
                            {vehicle.telemetry.load?.current || 'N/A'} / {vehicle.telemetry.load?.max || 'N/A'} {vehicle.telemetry.load?.unit}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'maintenance' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium">Maintenance History</h4>
                <button
                  className="text-primary text-sm"
                  onClick={onRefresh}
                >
                  Refresh
                </button>
              </div>
              
              {loadingHistory ? (
                <div className="text-center py-8">
                  <div className="spinner"></div>
                  <p className="text-gray-500 mt-2">Loading maintenance history...</p>
                </div>
              ) : maintenanceHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Tool className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-gray-500">No maintenance records found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {maintenanceHistory.map((record, index) => (
                    <div key={index} className="border rounded-lg overflow-hidden">
                      <div className="flex justify-between items-center p-3 bg-gray-50">
                        <div className="flex items-center">
                          <div className={`p-2 rounded-full mr-2 ${
                            record.status === 'completed' ? 'bg-green-100' :
                            record.status === 'scheduled' ? 'bg-blue-100' :
                            record.status === 'in_progress' ? 'bg-amber-100' : 'bg-gray-100'
                          }`}>
                            <Tool className={`h-4 w-4 ${
                              record.status === 'completed' ? 'text-green-600' :
                              record.status === 'scheduled' ? 'text-blue-600' :
                              record.status === 'in_progress' ? 'text-amber-600' : 'text-gray-600'
                            }`} />
                          </div>
                          <div>
                            <p className="font-medium">{record.maintenanceType}</p>
                            <p className="text-xs text-gray-500">
                              {record.scheduledDate ? formatDate(record.scheduledDate) : 'No date'}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          record.status === 'completed' ? 'bg-green-100 text-green-800' :
                          record.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                          record.status === 'in_progress' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {record.status}
                        </span>
                      </div>
                      <div className="p-3">
                        <p className="text-sm">{record.description}</p>
                        {record.completionDate && (
                          <p className="text-xs text-gray-500 mt-1">
                            Completed: {formatDate(record.completionDate)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'assignments' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium">Assignment History</h4>
                <button
                  className="text-primary text-sm"
                  onClick={onRefresh}
                >
                  Refresh
                </button>
              </div>
              
              {loadingHistory ? (
                <div className="text-center py-8">
                  <div className="spinner"></div>
                  <p className="text-gray-500 mt-2">Loading assignment history...</p>
                </div>
              ) : assignmentHistory.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-gray-500">No assignment records found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {assignmentHistory.map((assignment, index) => (
                    <div key={index} className="border rounded-lg overflow-hidden">
                      <div className="flex justify-between items-center p-3 bg-gray-50">
                        <div className="flex items-center">
                          <div className={`p-2 rounded-full mr-2 ${
                            assignment.status === 'completed' ? 'bg-green-100' :
                            assignment.status === 'assigned' ? 'bg-blue-100' :
                            assignment.status === 'in_progress' ? 'bg-amber-100' : 'bg-gray-100'
                          }`}>
                            <MapPin className={`h-4 w-4 ${
                              assignment.status === 'completed' ? 'text-green-600' :
                              assignment.status === 'assigned' ? 'text-blue-600' :
                              assignment.status === 'in_progress' ? 'text-amber-600' : 'text-gray-600'
                            }`} />
                          </div>
                          <div>
                            <p className="font-medium">{assignment.driver?.name || 'Unknown Driver'}</p>
                            <p className="text-xs text-gray-500">
                              Started: {assignment.startTime ? formatDate(assignment.startTime) : 'N/A'}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          assignment.status === 'completed' ? 'bg-green-100 text-green-800' :
                          assignment.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                          assignment.status === 'in_progress' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {assignment.status}
                        </span>
                      </div>
                      <div className="p-3">
                        <p className="text-sm">{assignment.taskDetails?.type} - {assignment.taskDetails?.description || 'No description'}</p>
                        {assignment.endTime && (
                          <p className="text-xs text-gray-500 mt-1">
                            Completed: {formatDate(assignment.endTime)}
                          </p>
                        )}
                        {assignment.zone && (
                          <p className="text-xs text-gray-500 mt-1">
                            Zone: {assignment.zone.name || assignment.zone.zoneName || 'Unknown Zone'}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Action buttons */}
        <div className="border-t p-4">
          <div className="flex justify-end gap-2">
            <button
              className="btn btn-outline btn-sm flex items-center gap-1"
              onClick={() => onDelete(vehicle)}
            >
              <Trash2 size={14} />
              Delete
            </button>
            <button
              className="btn btn-outline btn-sm flex items-center gap-1"
              onClick={() => onEdit(vehicle)}
            >
              <Edit size={14} />
              Edit
            </button>
            <button
              className="btn btn-primary btn-sm flex items-center gap-1"
              onClick={() => onAssign(vehicle)}
              disabled={vehicle.status !== 'active'}
            >
              <MapPin size={14} />
              Assign
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailsDrawer; 