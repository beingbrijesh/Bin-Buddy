import React, { useState, useEffect, useRef } from 'react';
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
import { uploadToCloudinary } from '../../../utils/cloudinary';

// Aligned with the backend VehicleSchema
const initialFormData = {
  vehicleId: '',
  registrationNumber: '',
  photoUrl: '',
  type: '',
  manufacturer: '',
  model: '',
  year: '',
  capacityValue: '',
  capacityUnit: 'tons',
  fuelType: 'diesel',
  status: 'inactive',
  assignedZone: '',
  insurance: {
    provider: '',
    policyNumber: '',
    expiryDate: '',
  },
};

const VehicleForm = ({ isOpen, onClose, onSuccess, vehicle }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [zones, setZones] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  const isEditing = !!vehicle;

  // Fetch Zones
  const hasFetchedId = useRef(false);

  useEffect(() => {
    const fetchNextVehicleId = async () => {
      try {
        const response = await api.get('/vehicles/next-id');
        setFormData(prev => ({ ...prev, vehicleId: response.data.vehicleId }));
      } catch (error) {
        console.error('Failed to fetch next vehicle ID:', error);
        toast.error('Could not generate new vehicle ID.');
      }
    };

    const fetchZones = async () => {
      try {
        const response = await api.get('/api/zones');
        setZones(response.data.data || []);
      } catch (error) {
        console.error('Failed to fetch zones:', error);
        toast.error('Could not load zones.');
        setZones([]);
      }
    };

    if (isOpen) {
      fetchZones();
      if (!isEditing && !hasFetchedId.current) {
        fetchNextVehicleId();
        hasFetchedId.current = true;
      }
    }

    // Reset the ref when the modal is closed
    if (!isOpen) {
      hasFetchedId.current = false;
    }
  }, [isOpen, isEditing]);

  // Populate form for editing
  useEffect(() => {
    if (isOpen) {
      if (isEditing && vehicle) {
        setFormData({
          vehicleId: vehicle.vehicleId || '',
          registrationNumber: vehicle.registrationNumber || '',
          numberPlate: vehicle.numberPlate || '',
          photoUrl: vehicle.photoUrl || '',
          type: vehicle.type || '',
          manufacturer: vehicle.manufacturer || '',
          model: vehicle.model || '',
          year: vehicle.year || '',
          capacityValue: vehicle.capacity?.value || '',
          capacityUnit: vehicle.capacity?.unit || 'tons',
          fuelType: vehicle.fuelType || 'diesel',
          status: vehicle.status || 'inactive',
          assignedZone: vehicle.assignedZone?._id || '',
          insurance: {
            provider: vehicle.insurance?.provider || '',
            policyNumber: vehicle.insurance?.policyNumber || '',
            expiryDate: vehicle.insurance?.expiryDate ? new Date(vehicle.insurance.expiryDate).toISOString().split('T')[0] : '',
          },
        });
        if (vehicle.photoUrl) {
          setImagePreview(vehicle.photoUrl);
        }
      } else {
        // Reset form for new entry
        setFormData(initialFormData);
        setImagePreview('');
      }
    }
  }, [isOpen, isEditing, vehicle]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const toastId = toast.loading('Uploading image...');
      try {
        const uploadedUrl = await uploadToCloudinary(file);
        setFormData({ ...formData, photoUrl: uploadedUrl });
        setImagePreview(uploadedUrl);
        toast.success('Image uploaded successfully!', { id: toastId });
      } catch (error) {
        toast.error('Image upload failed.', { id: toastId });
        console.error('Cloudinary upload error:', error);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.manufacturer) newErrors.manufacturer = 'Manufacturer is required';
    if (!formData.model) newErrors.model = 'Model is required';
    if (!formData.year) newErrors.year = 'Year is required';
    if (!formData.registrationNumber) newErrors.registrationNumber = 'Registration is required';
    if (!formData.numberPlate) newErrors.numberPlate = 'Number Plate is required';
    if (!formData.type) newErrors.type = 'Type is required';
    if (!formData.capacityValue) newErrors.capacityValue = 'Capacity is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fill all required fields.');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading(isEditing ? 'Updating vehicle...' : 'Adding vehicle...');

    const submissionData = {
      ...formData,
      capacity: { value: formData.capacityValue, unit: formData.capacityUnit },
    };
    // Clean up temporary fields from submission data
    delete submissionData.capacityValue;
    delete submissionData.capacityUnit;

    try {
      let response;
      // Remove empty assignedZone to avoid cast errors
      if (submissionData.assignedZone === '' || !submissionData.assignedZone) {
        delete submissionData.assignedZone;
      }

      if (isEditing) {
        response = await api.put(`/api/vehicles/${vehicle._id}`, submissionData);
      } else {
        response = await api.post('/api/vehicles', submissionData);
      }

      if (response.status === 200 || response.status === 201) {
        toast.success(`Vehicle ${isEditing ? 'updated' : 'added'} successfully!`, { id: toastId });
        const savedVehicle = response.data?.data || response.data;
        onSuccess(savedVehicle);
        onClose();
      } else {
        throw new Error(response.data.message || 'An unknown error occurred');
      }
    } catch (error) {
      console.error('Failed to save vehicle:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save vehicle.';
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-4xl rounded-lg bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-xl font-semibold">
              {isEditing ? 'Edit Vehicle' : 'Add New Vehicle'}
            </Dialog.Title>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 flex flex-col items-center">
              <div className="w-full h-48 border-2 border-dashed rounded-lg flex items-center justify-center mb-4 bg-gray-50">
                {imagePreview ? (
                  <img src={imagePreview} alt="Vehicle" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <span className="text-gray-500">Image Preview</span>
                )}
              </div>
              <input type="file" id="photo-upload" className="hidden" onChange={handleFileChange} />
              <Button type="button" onClick={() => document.getElementById('photo-upload').click()}>
                Upload Photo
              </Button>
            </div>

            <div className="md:col-span-2 space-y-4">
              <div className="p-4 border rounded-lg">
                <h3 className="text-lg font-medium mb-4">Vehicle Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Vehicle ID</label>
                    <Input name="vehicleId" value={formData.vehicleId || ''} disabled />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Manufacturer</label>
                    <Input name="manufacturer" value={formData.manufacturer} onChange={handleChange} placeholder="e.g. Ford, Tata" />
                    {errors.manufacturer && <p className="text-sm text-red-500">{errors.manufacturer}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Model</label>
                    <Input name="model" value={formData.model} onChange={handleChange} placeholder="e.g. Transit, Ace" />
                    {errors.model && <p className="text-sm text-red-500">{errors.model}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Year</label>
                    <Input type="number" name="year" value={formData.year} onChange={handleChange} placeholder="e.g. 2023" />
                    {errors.year && <p className="text-sm text-red-500">{errors.year}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Registration Number</label>
                    <Input name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} placeholder="e.g. MH12AB1234" />
                    {errors.registrationNumber && <p className="text-sm text-red-500">{errors.registrationNumber}</p>}
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="text-lg font-medium mb-4">Specifications & Assignment</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <Select name="type" onValueChange={(value) => handleSelectChange('type', value)} value={formData.type}>
                      <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="truck">Truck</SelectItem>
                        <SelectItem value="van">Van</SelectItem>
                        <SelectItem value="compactor">Compactor</SelectItem>
                        <SelectItem value="loader">Loader</SelectItem>
                        <SelectItem value="garbage-truck">Garbage Truck</SelectItem>
                        <SelectItem value="pickup">Pickup</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-grow">
                      <label className="text-sm font-medium">Capacity</label>
                      <Input type="number" name="capacityValue" value={formData.capacityValue} onChange={handleChange} placeholder="e.g. 5" />
                    </div>
                    <Select onValueChange={(value) => handleSelectChange('capacityUnit', value)} value={formData.capacityUnit}>
                      <SelectTrigger>
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tons">Tons</SelectItem>
                        <SelectItem value="kg">Kilograms</SelectItem>
                        <SelectItem value="cubic_meters">Cubic Meters</SelectItem>
                        <SelectItem value="liters">Liters</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                   {errors.capacityValue && <p className="text-sm text-red-500 -mt-3 col-span-2">{errors.capacityValue}</p>}
                  <div>
                    <label className="text-sm font-medium">Fuel Type</label>
                    <Select name="fuelType" onValueChange={(value) => handleSelectChange('fuelType', value)} value={formData.fuelType}>
                      <SelectTrigger><SelectValue placeholder="Select Fuel Type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="diesel">Diesel</SelectItem>
                        <SelectItem value="petrol">Petrol</SelectItem>
                        <SelectItem value="cng">CNG</SelectItem>
                        <SelectItem value="electric">Electric</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Select onValueChange={(value) => handleSelectChange('status', value)} value={formData.status}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="repair">Repair</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="breakdown">Breakdown</SelectItem>
                        <SelectItem value="retired">Retired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium">Assign Zone</label>
                    <Select name="assignedZone" onValueChange={(value) => handleSelectChange('assignedZone', value)} value={formData.assignedZone}>
                      <SelectTrigger><SelectValue placeholder="Select a zone" /></SelectTrigger>
                      <SelectContent>
                        {zones.map(zone => (
                          <SelectItem key={zone._id} value={zone._id}>{zone.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="text-lg font-medium mb-4">Insurance Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Provider</label>
                    <Input name="insurance.provider" value={formData.insurance.provider} onChange={handleChange} placeholder="e.g. State Farm" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Policy Number</label>
                    <Input name="insurance.policyNumber" value={formData.insurance.policyNumber} onChange={handleChange} placeholder="e.g. POL12345" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium">Expiry Date</label>
                    <Input type="date" name="insurance.expiryDate" value={formData.insurance.expiryDate} onChange={handleChange} />
                  </div>
                </div>
              </div>



              <div className="flex justify-end space-x-4 mt-6">
                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Add Vehicle')}
                </Button>
              </div>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default VehicleForm;