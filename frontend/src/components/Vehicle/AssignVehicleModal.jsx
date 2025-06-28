import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, UserIcon, MapPinIcon, CalendarIcon, ClockIcon, TruckIcon } from '@heroicons/react/24/outline';
import api from '../../utils/axios';

const AssignVehicleModal = ({ isOpen, onClose, vehicle, onAssign }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [drivers, setDrivers] = useState([]);
  const [zones, setZones] = useState([]);
  const [tasks, setTasks] = useState([]);
  
  const [formData, setFormData] = useState({
    driverId: '',
    zoneId: '',
    taskId: '',
    startDate: '',
    endDate: '',
    
    notes: '',
    vehicleId: vehicle?.id || vehicle?._id || ''
  });

  useEffect(() => {
    // Reset form when modal opens
    if (isOpen) {
      setFormData({
        driverId: '',
        zoneId: '',
        taskId: '',
        startDate: '',
        endDate: '',
        
        notes: '',
        vehicleId: vehicle?.id || vehicle?._id || ''
      });
      setError(null);
      setSuccess(false);
      setDrivers([]); // Clear drivers list on open
      
      // Fetch initial data that doesn't depend on user input
      fetchZones();
      fetchTasks();
    }
  }, [isOpen, vehicle]);

  // Effect to fetch drivers only when a zone is selected
  useEffect(() => {
    const fetchDriversForZone = async () => {
      if (!formData.zoneId) {
        setDrivers([]);
        return;
      }
      try {
        const params = {
          workerStatus: 'active',
          workerType: 'driver',
          zone: formData.zoneId
        };
        const { data } = await api.get('/api/workers', { params });
        // Backend may respond with { workers: [] } or []
        const list = Array.isArray(data) ? data : data.workers || [];
        setDrivers(list);
      } catch (err) {
        console.error('Error fetching drivers for zone:', err);
        setDrivers([]);
      }
    };

    if (isOpen) {
      fetchDriversForZone();
    }
  }, [formData.zoneId, isOpen]);

  const fetchZones = async () => {
    try {
      const response = await api.get('/api/zones');
      let zoneData = [];
      
      // Handle different response structures
      if (Array.isArray(response.data)) {
        zoneData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        zoneData = response.data.data;
      } else if (response.data?.zones && Array.isArray(response.data.zones)) {
        zoneData = response.data.zones;
      } else {
        console.error('Unexpected zones API response format:', response.data);
        zoneData = [];
      }
      
      setZones(zoneData);
    } catch (err) {
      console.error('Error fetching zones:', err);
      setZones([]); // Set empty array to prevent map errors
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await api.get('/api/tasks?status=pending');
      setTasks(response.data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Format the assignment data
      const assignmentData = {
        vehicleId: vehicle?.id || vehicle?._id || formData.vehicleId,
        driverId: formData.driverId,
        zoneId: formData.zoneId,
        taskId: formData.taskId || null,
        schedule: {
          startDate: formData.startDate,
          endDate: formData.endDate || formData.startDate,
        },
        notes: formData.notes
      };

      const payload = { driverId: formData.driverId };
      const response = await api.post(`/api/vehicles/${formData.vehicleId}/assign-driver`, payload);
      setSuccess(true);
      
      // Notify parent component
      if (onAssign) {
        onAssign(assignmentData);
      }
      
      // Close modal after delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign vehicle');
      console.error('Error assigning vehicle:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={() => !loading && onClose()}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full rounded-lg bg-white p-6 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-medium text-gray-900">
              {vehicle ? `Assign Vehicle: ${vehicle.registrationNo || vehicle.registrationNumber || vehicle.vehicleId}` : 'Assign Vehicle'}
            </Dialog.Title>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-500"
              onClick={onClose}
              disabled={loading}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          {success ? (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    Vehicle assigned successfully!
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Vehicle ID (if no vehicle is provided) */}
                {!vehicle && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <div className="flex items-center">
                        <TruckIcon className="h-4 w-4 mr-1" />
                        <span>Vehicle ID</span>
                      </div>
                    </label>
                    <input
                      type="text"
                      name="vehicleId"
                      value={formData.vehicleId}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      required
                    />
                  </div>
                )}
                
                {/* Driver */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center">
                      <UserIcon className="h-4 w-4 mr-1" />
                      <span>Assign Driver</span>
                    </div>
                  </label>
                  <select
                    name="driverId"
                    value={formData.driverId}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm disabled:bg-gray-100"
                    disabled={!formData.zoneId}
                    required
                  >
                    <option value="">
                      {!formData.zoneId ? 'Select a zone first' : 'Select a driver'}
                    </option>
                    {drivers.length > 0 && 
                      drivers.map(driver => (
                        <option key={driver._id} value={driver._id}>
                          {driver.name} ({driver.workerDetails?.employeeId || 'N/A'})
                        </option>
                    ))}
                  </select>
                  {!formData.zoneId && (
                    <p className="mt-1 text-xs text-gray-500">The driver list will populate once a zone is selected.</p>
                  )}
                  {formData.zoneId && drivers.length === 0 && (
                    <p className="mt-1 text-xs text-yellow-600">No active drivers found for this zone.</p>
                  )}
                </div>
                
                {/* Zone Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      <span>Zone</span>
                    </div>
                  </label>
                  <select
                    name="zoneId"
                    value={formData.zoneId}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    required
                  >
                    <option value="">Select Zone</option>
                    {zones.map(zone => (
                      <option key={zone._id || zone.id} value={zone._id || zone.id}>
                        {zone.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Task Selection (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task (Optional)
                  </label>
                  <select
                    name="taskId"
                    value={formData.taskId}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  >
                    <option value="">Select Task</option>
                    {tasks.map(task => (
                      <option key={task._id || task.id} value={task._id || task.id}>
                        {task.title || task.description}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      <span>Start Date</span>
                    </div>
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    required
                  />
                </div>
                
                {/* End Date (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    min={formData.startDate}
                  />
                </div>
                
                
              </div>
              
              {/* Notes */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  placeholder="Add any additional information about this assignment..."
                />
              </div>
              
              {/* Assignment Conflict Warning */}
              {formData.driverId && formData.startDate && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        System will check for schedule conflicts before confirming assignment.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  disabled={loading}
                >
                  {loading ? 'Assigning...' : 'Assign Vehicle'}
                </button>
              </div>
            </form>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default AssignVehicleModal; 