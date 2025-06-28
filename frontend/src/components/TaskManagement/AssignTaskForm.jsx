import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const AssignTaskForm = ({ task, onSuccess, onCancel }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { user } = useAuth();
  
  const [workers, setWorkers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch workers matching the required roles
        const workersRes = await api.get('/workers', {
          params: { workerType: task.requiredRoles.join(',') }
        });
        
        // Fetch available vehicles and bins
        const [vehiclesRes, binsRes] = await Promise.all([
          api.get('/vehicles'),
          api.get('/bins')
        ]);
        
        setWorkers(workersRes.data);
        setVehicles(vehiclesRes.data);
        setBins(binsRes.data);
      } catch (error) {
        toast.error('Failed to load assignment data');
      }
    };
    
    if (task) fetchData();
  }, [task]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await api.put(`/tasks/${task._id}/assign`, data);
      toast.success('Task assigned successfully');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Worker Assignment */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Assign To Worker *</label>
          <select
            {...register('assignedTo', { required: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          >
            <option value="">Select worker</option>
            {workers.map(worker => (
              <option key={worker._id} value={worker._id}>
                {worker.name} ({worker.workerType})
              </option>
            ))}
          </select>
          {errors.assignedTo && (
            <p className="mt-1 text-sm text-red-600">Worker selection is required</p>
          )}
        </div>

        {/* Vehicle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
          <select
            {...register('vehicle')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          >
            <option value="">Select vehicle</option>
            {vehicles.map(vehicle => (
              <option key={vehicle._id} value={vehicle._id}>
                {vehicle.registrationNumber} ({vehicle.vehicleType})
              </option>
            ))}
          </select>
        </div>

        {/* Bins */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bins</label>
          <select
            multiple
            {...register('bins')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          >
            {bins.map(bin => (
              <option key={bin._id} value={bin._id}>
                {bin.binId} ({bin.location})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm"
        >
          {loading ? 'Assigning...' : 'Assign Task'}
        </button>
      </div>
    </div>
  );
};

export default AssignTaskForm;
