import React, { useState, useEffect } from 'react';
import { XCircle, Save, Truck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../utils/axios';

const EditVehicleModal = ({ isOpen, onClose, onSuccess, vehicle }) => {
  // State for form data
  const [formData, setFormData] = useState({
    vehicleId: '',
    registrationNumber: '',
    type: 'truck',
    manufacturer: '',
    model: '',
    year: new Date().getFullYear(),
    capacity: {
      value: '',
      unit: 'tons'
    },
    fuelType: 'diesel',
    fuelCapacity: {
      value: '',
      unit: 'liters'
    },
    status: 'active',
    notes: ''
  });

  // State for form validation
  const [errors, setErrors] = useState({});
  
  // State for loading status
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Available options for select fields
  const vehicleTypes = ['truck', 'van', 'compactor', 'loader', 'cart', 'sweeper', 'tanker', 'utility'];
  const capacityUnits = ['tons', 'kg', 'cubic_meters', 'liters'];
  const fuelTypes = ['diesel', 'petrol', 'cng', 'electric', 'hybrid'];
  const statuses = ['active', 'maintenance', 'repair', 'inactive', 'breakdown', 'retired'];

  // Initialize form with vehicle data when component mounts or vehicle changes
  useEffect(() => {
    if (vehicle) {
      setFormData({
        vehicleId: vehicle.vehicleId || '',
        registrationNumber: vehicle.registrationNumber || '',
        type: vehicle.type || 'truck',
        manufacturer: vehicle.manufacturer || '',
        model: vehicle.model || '',
        year: vehicle.year || new Date().getFullYear(),
        capacity: {
          value: vehicle.capacity?.value || '',
          unit: vehicle.capacity?.unit || 'tons'
        },
        fuelType: vehicle.fuelType || 'diesel',
        fuelCapacity: {
          value: vehicle.fuelCapacity?.value || '',
          unit: vehicle.fuelCapacity?.unit || 'liters'
        },
        status: vehicle.status || 'active',
        notes: vehicle.notes || ''
      });
    }
  }, [vehicle]);
  
  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested properties (capacity, fuelCapacity)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear validation error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  // Validate form data
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    if (!formData.vehicleId) newErrors.vehicleId = 'Vehicle ID is required';
    if (!formData.registrationNumber) newErrors.registrationNumber = 'Registration number is required';
    if (!formData.manufacturer) newErrors.manufacturer = 'Manufacturer is required';
    if (!formData.model) newErrors.model = 'Model is required';
    
    // Numeric fields
    if (formData.year && (isNaN(formData.year) || formData.year < 1950 || formData.year > new Date().getFullYear() + 1)) {
      newErrors.year = 'Please enter a valid year';
    }
    
    if (!formData.capacity.value || isNaN(formData.capacity.value) || formData.capacity.value <= 0) {
      newErrors['capacity.value'] = 'Please enter a valid capacity value';
    }
    
    if (!formData.fuelCapacity.value || isNaN(formData.fuelCapacity.value) || formData.fuelCapacity.value <= 0) {
      newErrors['fuelCapacity.value'] = 'Please enter a valid fuel capacity value';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Convert numeric fields to numbers
      const payload = {
        ...formData,
        year: parseInt(formData.year),
        capacity: {
          ...formData.capacity,
          value: parseFloat(formData.capacity.value)
        },
        fuelCapacity: {
          ...formData.fuelCapacity,
          value: parseFloat(formData.fuelCapacity.value)
        }
      };
      
      // Submit data to API
      const response = await api.put(`/api/vehicles/${vehicle._id}`, payload);
      
      toast.success('Vehicle updated successfully!');
      onSuccess(response.data);
    } catch (error) {
      console.error('Error updating vehicle:', error);
      toast.error(error.response?.data?.message || 'Failed to update vehicle');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Close modal handler
  const handleClose = () => {
    onClose();
  };
  
  // If modal is closed or no vehicle data, don't render anything
  if (!isOpen || !vehicle) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        {/* Modal header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Edit Vehicle - {formData.vehicleId}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>
        
        {/* Modal body */}
        <div className="p-4 max-h-[70vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Vehicle ID */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Vehicle ID*</span>
                </label>
                <input
                  type="text"
                  name="vehicleId"
                  value={formData.vehicleId}
                  onChange={handleChange}
                  placeholder="e.g., TRK001"
                  className={`input input-bordered w-full ${errors.vehicleId ? 'input-error' : ''}`}
                />
                {errors.vehicleId && (
                  <p className="text-error text-sm mt-1">{errors.vehicleId}</p>
                )}
              </div>
              
              {/* Registration Number */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Registration Number*</span>
                </label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  placeholder="e.g., MH01AB1234"
                  className={`input input-bordered w-full ${errors.registrationNumber ? 'input-error' : ''}`}
                />
                {errors.registrationNumber && (
                  <p className="text-error text-sm mt-1">{errors.registrationNumber}</p>
                )}
              </div>
              
              {/* Vehicle Type */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Type*</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                >
                  {vehicleTypes.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Status */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Status*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Manufacturer */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Manufacturer*</span>
                </label>
                <input
                  type="text"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange}
                  placeholder="e.g., Tata"
                  className={`input input-bordered w-full ${errors.manufacturer ? 'input-error' : ''}`}
                />
                {errors.manufacturer && (
                  <p className="text-error text-sm mt-1">{errors.manufacturer}</p>
                )}
              </div>
              
              {/* Model */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Model*</span>
                </label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="e.g., Prima"
                  className={`input input-bordered w-full ${errors.model ? 'input-error' : ''}`}
                />
                {errors.model && (
                  <p className="text-error text-sm mt-1">{errors.model}</p>
                )}
              </div>
              
              {/* Year */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Year*</span>
                </label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  min="1950"
                  max={new Date().getFullYear() + 1}
                  className={`input input-bordered w-full ${errors.year ? 'input-error' : ''}`}
                />
                {errors.year && (
                  <p className="text-error text-sm mt-1">{errors.year}</p>
                )}
              </div>
              
              {/* Fuel Type */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Fuel Type*</span>
                </label>
                <select
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                >
                  {fuelTypes.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Capacity */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Capacity*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="capacity.value"
                    value={formData.capacity.value}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className={`input input-bordered w-2/3 ${errors['capacity.value'] ? 'input-error' : ''}`}
                  />
                  <select
                    name="capacity.unit"
                    value={formData.capacity.unit}
                    onChange={handleChange}
                    className="select select-bordered w-1/3"
                  >
                    {capacityUnits.map(unit => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
                {errors['capacity.value'] && (
                  <p className="text-error text-sm mt-1">{errors['capacity.value']}</p>
                )}
              </div>
              
              {/* Fuel Capacity */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Fuel Capacity*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="fuelCapacity.value"
                    value={formData.fuelCapacity.value}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className={`input input-bordered w-2/3 ${errors['fuelCapacity.value'] ? 'input-error' : ''}`}
                  />
                  <select
                    name="fuelCapacity.unit"
                    value={formData.fuelCapacity.unit}
                    onChange={handleChange}
                    className="select select-bordered w-1/3"
                  >
                    <option value="liters">Liters</option>
                    <option value="gallons">Gallons</option>
                    <option value="kWh">kWh</option>
                  </select>
                </div>
                {errors['fuelCapacity.value'] && (
                  <p className="text-error text-sm mt-1">{errors['fuelCapacity.value']}</p>
                )}
              </div>
            </div>
            
            {/* Notes */}
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Notes</span>
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="textarea textarea-bordered h-24"
                placeholder="Additional information about the vehicle..."
              />
            </div>
          </form>
        </div>
        
        {/* Modal footer */}
        <div className="flex justify-end gap-2 p-4 border-t">
          <button
            className="btn btn-outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary flex items-center gap-1"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            <Save size={16} />
            {isSubmitting ? 'Saving...' : 'Update Vehicle'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditVehicleModal; 