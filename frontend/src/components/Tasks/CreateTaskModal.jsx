import React, { useState, useEffect } from 'react';
import api from '../../utils/axios';
import { toast } from 'react-hot-toast';

const CreateTaskModal = ({ isOpen, onClose, onTaskCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    zone: '',
    assignedTo: '',
    vehicle: '',
    bins: [],
    'schedule.startTime': '',
    'schedule.endTime': '',
    priority: 'medium',
    notes: '',
  });

  const [lookups, setLookups] = useState({
    workers: [],
    vehicles: [],
    zones: [],
    bins: [],
  });

  useEffect(() => {
    if (isOpen) {
      const fetchLookups = async () => {
        try {
          const [workersRes, vehiclesRes, zonesRes, binsRes] = await Promise.all([
            api.get('/api/users?role=worker'), // Assuming this endpoint exists
            api.get('/api/vehicles'),
            api.get('/api/zones'), 
            api.get('/api/bins'),
          ]);
          setLookups({
            workers: workersRes.data.users || [],
            vehicles: vehiclesRes.data.vehicles || [],
            zones: zonesRes.data.zones || [],
            bins: binsRes.data.bins || [],
          });
        } catch (error) {
          console.error('Error fetching lookup data:', error);
          toast.error('Failed to load data for form.');
        }
      };
      fetchLookups();
    }
  }, [isOpen]);

  const handleBinChange = (binId) => {
    setFormData(prev => {
      const bins = prev.bins.includes(binId)
        ? prev.bins.filter(id => id !== binId)
        : [...prev.bins, binId];
      return { ...prev, bins };
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const taskData = {
        ...formData,
        schedule: {
            startTime: formData['schedule.startTime'],
            endTime: formData['schedule.endTime']
        }
    };

    try {
      await api.post('/api/tasks', taskData);
      toast.success('Task created successfully!');
      onTaskCreated();
      onClose();
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error(error.response?.data?.message || 'Failed to create task.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-6">Create New Task</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="title" placeholder="Task Title" value={formData.title} onChange={handleChange} className="w-full p-2 border rounded" required />
          <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} className="w-full p-2 border rounded"></textarea>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select name="zone" value={formData.zone} onChange={handleChange} className="w-full p-2 border rounded" required>
              <option value="">Select Zone</option>
              {Array.isArray(lookups.zones) && lookups.zones.map(z => <option key={z._id} value={z._id}>{z.name}</option>)}
            </select>
            <select name="assignedTo" value={formData.assignedTo} onChange={handleChange} className="w-full p-2 border rounded" required>
              <option value="">Assign to Worker</option>
              {Array.isArray(lookups.workers) && lookups.workers.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
            </select>
            <select name="vehicle" value={formData.vehicle} onChange={handleChange} className="w-full p-2 border rounded">
              <option value="">Select Vehicle (Optional)</option>
              {Array.isArray(lookups.vehicles) && lookups.vehicles.map(v => <option key={v._id} value={v._id}>{v.name} - {v.licensePlate}</option>)}
            </select>
            <select name="priority" value={formData.priority} onChange={handleChange} className="w-full p-2 border rounded">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <input type="datetime-local" name="schedule.startTime" value={formData['schedule.startTime']} onChange={handleChange} className="w-full p-2 border rounded" />
            <input type="datetime-local" name="schedule.endTime" value={formData['schedule.endTime']} onChange={handleChange} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Bins</label>
            <div className="w-full p-2 border rounded h-32 overflow-y-auto">
              {Array.isArray(lookups.bins) && lookups.bins.length > 0 ? (
                lookups.bins.map(b => (
                  <div key={b._id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`bin-${b._id}`}
                      checked={formData.bins.includes(b._id)}
                      onChange={() => handleBinChange(b._id)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor={`bin-${b._id}`} className="ml-2 block text-sm text-gray-900">
                      {b.binId} - {b.location?.address || 'No address'}
                    </label>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No bins available.</p>
              )}
            </div>
          </div>
          <textarea name="notes" placeholder="Notes" value={formData.notes} onChange={handleChange} className="w-full p-2 border rounded"></textarea>
          <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">Create Task</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
