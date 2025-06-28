import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import api from '../../../utils/axios';

const MaintenanceLogModal = ({ isOpen, onClose, vehicle, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  
  const [formData, setFormData] = useState({
    vehicleId: '',
    maintenanceType: 'scheduled',
    description: '',
    serviceDate: '',
    completionDate: '',
    cost: '',
    partsUsed: '',
    serviceProvider: '',
    status: 'scheduled',
    priority: 'medium',
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        vehicleId: vehicle ? (vehicle.id || vehicle._id) : '',
        serviceDate: new Date().toISOString().split('T')[0]
      }));
      setError(null);
      setSuccess(false);
      
      // If no vehicle is selected, fetch all vehicles
      if (!vehicle) {
        fetchVehicles();
      }
    }
  }, [isOpen, vehicle]);
  
  const fetchVehicles = async () => {
    try {
      const response = await api.get('/api/vehicles');
      setVehicles(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
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
      const maintenanceData = {
        ...formData,
        cost: parseFloat(formData.cost) || 0
      };
      
      const response = await api.post('/api/vehicle-maintenance', maintenanceData);
      setSuccess(true);
      
      if (onSubmit) {
        onSubmit(response.data);
      }
      
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log maintenance');
      console.error('Error logging maintenance:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-semibold">Maintenance Log</Dialog.Title>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
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
                    Maintenance log created successfully!
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
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
              
              {!vehicle && (
                <div>
                  <label className="text-sm font-medium">Vehicle</label>
                  <Select
                    onValueChange={(value) => setFormData(prev => ({ ...prev, vehicleId: value }))}
                    value={formData.vehicleId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map(v => (
                        <SelectItem key={v._id} value={v._id}>
                          {v.registrationNumber} ({v.manufacturer} {v.model})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium">Maintenance Type</label>
                <Select
                  onValueChange={(value) => setFormData(prev => ({ ...prev, maintenanceType: value }))}
                  value={formData.maintenanceType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled Maintenance</SelectItem>
                    <SelectItem value="repair">Repair</SelectItem>
                    <SelectItem value="inspection">Inspection</SelectItem>
                    <SelectItem value="emergency">Emergency Repair</SelectItem>
                    <SelectItem value="accident">Accident Repair</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Priority</label>
                <Select
                  onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                  value={formData.priority}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Service Date</label>
                <Input
                  type="date"
                  name="serviceDate"
                  value={formData.serviceDate}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Completion Date (Optional)</label>
                <Input
                  type="date"
                  name="completionDate"
                  value={formData.completionDate}
                  onChange={handleChange}
                  min={formData.serviceDate}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Cost (₹)</label>
                <Input
                  type="number"
                  name="cost"
                  value={formData.cost}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                  value={formData.status}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Service Provider</label>
                <Input
                  type="text"
                  name="serviceProvider"
                  value={formData.serviceProvider}
                  onChange={handleChange}
                  placeholder="Enter service provider name"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Parts Used</label>
                <Input
                  type="text"
                  name="partsUsed"
                  value={formData.partsUsed}
                  onChange={handleChange}
                  placeholder="List parts used for this maintenance..."
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Additional Notes</label>
                <Input
                  type="text"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any additional information..."
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-[#279e0a] hover:bg-[#1c7307]"
                >
                  {loading ? 'Saving...' : 'Save Log'}
                </Button>
              </div>
            </form>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default MaintenanceLogModal;