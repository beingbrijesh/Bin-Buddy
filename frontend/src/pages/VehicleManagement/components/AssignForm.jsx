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

const AssignForm = ({ isOpen, onClose, vehicle, onSubmit }) => {
  console.log('AssignForm rendered. Vehicle prop:', vehicle);
  const [formData, setFormData] = useState({
    vehicleId: vehicle?.id || '',
    driverId: '',
    assignmentDate: new Date().toISOString().split('T')[0],
    notes: ''
  });
  
  const [drivers, setDrivers] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchDrivers = async () => {
      const zoneId = vehicle?.assignedZone?._id || vehicle?.assignedZone;
      console.log('Extracted zoneId:', zoneId);

      if (!zoneId) {
        setDrivers([]);
        console.log('No zoneId found. Aborting driver fetch.');
        return;
      }

      try {
        const params = { workerStatus: 'active', zone: zoneId };
        console.log('Fetching drivers with params:', params);
        const { data } = await api.get('/workers', { params });
        console.log('Received drivers data:', data);
        setDrivers(data.workers || []);
      } catch (error) {
        console.error('Failed to fetch drivers:', error);
        toast.error('Failed to fetch drivers for the specified zone.');
      }
    };

    if (isOpen) {
      fetchDrivers();
    }
  }, [isOpen, vehicle]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      setErrors(error.response?.data?.errors || {});
      toast.error(error.response?.data?.message || 'Failed to assign driver');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-semibold">Assign Driver</Dialog.Title>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Vehicle ID</label>
              <Input name="vehicleId" value={formData.vehicleId} disabled className="bg-gray-100" />
            </div>
            
            <div>
              <label className="text-sm font-medium">Driver</label>
              <Select
                onValueChange={(value) => setFormData(prev => ({ ...prev, driverId: value }))}
                value={formData.driverId}
                disabled={!vehicle?.assignedZone}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    !vehicle?.assignedZone 
                      ? "Vehicle must be assigned to a zone first" 
                      : "Select a driver"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {drivers.length > 0 ? (
                    drivers.map(driver => (
                      <SelectItem key={driver._id} value={driver._id}>
                        {driver.name} ({driver.licenseNumber})
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-4 text-sm text-gray-500">
                      No active drivers found for this zone.
                    </div>
                  )}
                </SelectContent>
              </Select>
              {errors.driverId && <p className="text-sm text-red-500">{errors.driverId}</p>}
            </div>
            
            <div>
              <label className="text-sm font-medium">Assignment Date</label>
              <Input 
                type="date" 
                name="assignmentDate" 
                value={formData.assignmentDate} 
                onChange={handleChange} 
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Notes</label>
              <Input 
                name="notes" 
                value={formData.notes} 
                onChange={handleChange} 
                placeholder="Optional notes" 
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="!bg-[#279e0a] !text-white hover:!bg-[#1c7307]"
                style={{
                  backgroundColor: '#279e0a !important',
                  color: 'white !important',
                  '&:hover': { backgroundColor: '#1c7307 !important' }
                }}
              >
                {isSubmitting ? 'Assigning...' : 'Assign Driver'}
              </Button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default AssignForm;
