import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, DocumentIcon, CalendarIcon, ArrowUpTrayIcon, TruckIcon } from '@heroicons/react/24/outline';
import api from '../../../utils/axios';

const DocumentUploadModal = ({ isOpen, onClose, vehicle, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  
  const [formData, setFormData] = useState({
    vehicleId: '',
    documentType: 'registration',
    documentNumber: '',
    issueDate: '',
    expiryDate: '',
    issuingAuthority: '',
    notes: '',
    file: null
  });

  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        vehicleId: vehicle ? (vehicle.id || vehicle._id) : '',
        issueDate: new Date().toISOString().split('T')[0]
      }));
      setError(null);
      setSuccess(false);
      setPreviewUrl(null);
      
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        file
      }));
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const formDataToSend = new FormData();
      
      // Append text fields
      Object.keys(formData).forEach(key => {
        if (key !== 'file') {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // Append file if exists
      if (formData.file) {
        formDataToSend.append('document', formData.file);
      }
      
      const response = await api.post('/api/vehicle-documents', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSuccess(true);
      
      if (onSubmit) {
        onSubmit(response.data);
      }
      
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload document');
      console.error('Error uploading document:', err);
    } finally {
      setLoading(false);
    }
  };

  const documentTypes = [
    { value: 'registration', label: 'Registration Certificate (RC)' },
    { value: 'insurance', label: 'Insurance Policy' },
    { value: 'pollution', label: 'Pollution Under Control (PUC)' },
    { value: 'fitness', label: 'Fitness Certificate' },
    { value: 'permit', label: 'Vehicle Permit' },
    { value: 'tax', label: 'Road Tax Receipt' },
    { value: 'other', label: 'Other Document' }
  ];

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
            <Dialog.Title className="text-lg font-medium text-gray-900 flex items-center">
              <DocumentIcon className="h-5 w-5 mr-2 text-blue-600" />
              {vehicle ? `Upload Document for ${vehicle.registrationNo || vehicle.registrationNumber || vehicle.vehicleId}` : 'Upload Vehicle Document'}
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
                    Document uploaded successfully!
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
                {/* Vehicle Selection (if no vehicle is provided) */}
                {!vehicle && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <div className="flex items-center">
                        <TruckIcon className="h-4 w-4 mr-1" />
                        <span>Vehicle</span>
                      </div>
                    </label>
                    <select
                      name="vehicleId"
                      value={formData.vehicleId}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      required
                    >
                      <option value="">Select Vehicle</option>
                      {vehicles.map(v => (
                        <option key={v._id || v.id} value={v._id || v.id}>
                          {v.registrationNumber || v.registrationNo || v.vehicleId}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                {/* Document Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center">
                      <DocumentIcon className="h-4 w-4 mr-1" />
                      <span>Document Type</span>
                    </div>
                  </label>
                  <select
                    name="documentType"
                    value={formData.documentType}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    required
                  >
                    {documentTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Document Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document Number
                  </label>
                  <input
                    type="text"
                    name="documentNumber"
                    value={formData.documentNumber}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    placeholder="Enter document number"
                    required
                  />
                </div>
                
                {/* Issue Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      <span>Issue Date</span>
                    </div>
                  </label>
                  <input
                    type="date"
                    name="issueDate"
                    value={formData.issueDate}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    required
                  />
                </div>
                
                {/* Expiry Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      <span>Expiry Date</span>
                    </div>
                  </label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    min={formData.issueDate}
                    required
                  />
                </div>
                
                {/* Issuing Authority */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Issuing Authority
                  </label>
                  <input
                    type="text"
                    name="issuingAuthority"
                    value={formData.issuingAuthority}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    placeholder="Enter issuing authority name"
                    required
                  />
                </div>
              </div>
              
              {/* Notes */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={2}
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  placeholder="Any additional information..."
                />
              </div>
              
              {/* File Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Document
                </label>
                <div 
                  className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${formData.file ? 'border-indigo-300' : 'border-gray-300'} border-dashed rounded-md`}
                >
                  <div className="space-y-1 text-center">
                    {previewUrl ? (
                      <div className="mb-3">
                        {formData.file.type.startsWith('image/') ? (
                          <img 
                            src={previewUrl} 
                            alt="Document preview" 
                            className="mx-auto h-32 w-auto object-contain"
                          />
                        ) : (
                          <div className="flex items-center justify-center">
                            <DocumentIcon className="h-16 w-16 text-indigo-500" />
                          </div>
                        )}
                        <p className="text-sm text-gray-500 mt-2">{formData.file.name}</p>
                      </div>
                    ) : (
                      <>
                        <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600 justify-center">
                          <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                            <span>Upload a file</span>
                            <input 
                              id="file-upload" 
                              name="file-upload" 
                              type="file" 
                              className="sr-only"
                              onChange={handleFileChange}
                              accept=".pdf,.jpg,.jpeg,.png"
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PDF, JPG, PNG up to 10MB
                        </p>
                      </>
                    )}
                  </div>
                </div>
                {formData.file && (
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      className="text-sm text-red-600 hover:text-red-800"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, file: null }));
                        setPreviewUrl(null);
                      }}
                    >
                      Remove file
                    </button>
                  </div>
                )}
              </div>
              
              {/* Document Expiry Warning */}
              {formData.expiryDate && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        System will send notifications before document expiry.
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
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={loading || !formData.file}
                >
                  {loading ? 'Uploading...' : 'Upload Document'}
                </button>
              </div>
            </form>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default DocumentUploadModal; 