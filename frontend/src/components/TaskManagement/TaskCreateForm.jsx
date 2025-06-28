import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const TaskCreateForm = ({ onSuccess, onCancel }) => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const { user } = useAuth();
  
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [requiredRoles, setRequiredRoles] = useState([]);
  
  const taskType = watch('taskType');

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const response = await api.get('/zones');
        setZones(response.data);
      } catch (error) {
        toast.error('Failed to load zones');
      }
    };
    
    fetchZones();
  }, []);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const response = await api.post('/tasks', {
        ...data,
        requiredRoles
      });
      toast.success('Task created successfully');
      onSuccess(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (e) => {
    const { value, checked } = e.target;
    setRequiredRoles(prev => 
      checked 
        ? [...prev, value]
        : prev.filter(role => role !== value)
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Task Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Task Type <span className="text-red-500">*</span></label>
          <select
            {...register('taskType', { required: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          >
            <option value="">-- Select --</option>
            {['collection', 'sweeping', 'bin_cleaning', 'emergency', 'festival', 'event', 'custom'].map(type => (
              <option key={type} value={type}>
                {type.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Zone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Zone</label>
          {Array.isArray(zones) ? (
            <select
              {...register('assignedZone')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            >
              <option value="">-- Select --</option>
              {zones.map(zone => (
                <option key={zone._id} value={zone._id}>
                  {zone.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-500">Loading zones...</div>
          )}
        </div>

        {/* Start Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Time <span className="text-red-500">*</span></label>
          <input
            type="datetime-local"
            {...register('schedule.startTime', { required: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          />
        </div>

        {/* End Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Time <span className="text-red-500">*</span></label>
          <input
            type="datetime-local"
            {...register('schedule.endTime', { required: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          />
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            {...register('priority')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          >
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {/* Required Roles */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Required Roles</label>
          <div className="grid grid-cols-2 gap-2">
            {['collector', 'driver', 'supervisor', 'sweeper', 'cleaner'].map(role => (
              <label key={role} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={role}
                  checked={requiredRoles.includes(role)}
                  onChange={handleRoleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700 capitalize">{role}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          {...register('description')}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Task'}
        </button>
      </div>
    </div>
  );
};

export default TaskCreateForm;
