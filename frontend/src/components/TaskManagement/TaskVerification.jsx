import React, { useState, useRef } from 'react';
import { Camera, Upload, CheckCircle, AlertCircle, Clock, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import QRScanner from '../QRScanner/QRScanner';
import TaskAPI from '../../services/TaskAPI';
import './TaskVerification.css';

const TaskVerification = ({ onComplete }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState('scan');
  const [taskData, setTaskData] = useState({
    startTime: null,
    endTime: null,
    pickupImage: null,
    disposalImage: null,
    notes: '',
    status: 'pending',
    binId: null,
    binStatus: null,
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const steps = [
    { id: 'scan', label: 'Scan QR' },
    { id: 'pickup', label: 'Pickup' },
    { id: 'disposal', label: 'Disposal' },
    { id: 'complete', label: 'Complete' },
  ];

  const handleScanComplete = async (binData) => {
    try {
      setLoading(true);
      const binDetails = await TaskAPI.getBinDetails(binData.id);
      setTaskData({
        ...taskData,
        binId: binData.id,
        binStatus: binDetails.status,
      });
      setError(null);
    } catch (err) {
      setError('Failed to fetch bin details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartPickup = () => {
    setTaskData({
      ...taskData,
      startTime: new Date(),
      status: 'in-progress',
    });
    setCurrentStep('pickup');
  };

  const handleImageUpload = async (type, file) => {
    try {
      setLoading(true);
      const imageUrl = await TaskAPI.uploadImage(file);
      setTaskData({
        ...taskData,
        [type === 'pickup' ? 'pickupImage' : 'disposalImage']: imageUrl,
      });
      setError(null);
    } catch (err) {
      setError('Failed to upload image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCaptureImage = async (type) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Here you would implement the camera capture UI
      // For now, we'll just use file upload
      fileInputRef.current?.click();
    } catch (err) {
      setError('Failed to access camera. Please try uploading an image instead.');
    }
  };

  const handleCompleteTask = async () => {
    try {
      setLoading(true);
      const completedTask = {
        ...taskData,
        endTime: new Date(),
        status: 'completed',
        workerId: user.id,
        workerName: user.name,
      };

      const result = await TaskAPI.completeTask(completedTask);
      setTaskData(result);
      setCurrentStep('complete');
      onComplete?.(result);
      setError(null);
    } catch (err) {
      setError('Failed to complete task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'scan':
        return (
          <div className="step-content">
            <h3>Scan Bin QR Code</h3>
            <div className="qr-scanner-area">
              <QRScanner
                onScan={handleScanComplete}
                onError={(err) => setError(err.message)}
              />
            </div>
            <button 
              className="primary-btn"
              onClick={handleStartPickup}
              disabled={!taskData.binId || loading}
            >
              {loading ? 'Loading...' : 'Start Pickup'}
            </button>
          </div>
        );

      case 'pickup':
        return (
          <div className="step-content">
            <h3>Pickup Verification</h3>
            <div className="bin-status">
              <h4>Bin #{taskData.binId}</h4>
              <p>Current Status: {taskData.binStatus}</p>
            </div>
            <div className="image-upload-area">
              {taskData.pickupImage ? (
                <div className="image-preview">
                  <img src={taskData.pickupImage} alt="Pickup" />
                  <button 
                    className="retake-btn"
                    onClick={() => handleCaptureImage('pickup')}
                    disabled={loading}
                  >
                    Retake Photo
                  </button>
                </div>
              ) : (
                <div className="upload-buttons">
                  <button 
                    className="camera-btn"
                    onClick={() => handleCaptureImage('pickup')}
                    disabled={loading}
                  >
                    <Camera size={24} />
                    Take Photo
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={(e) => handleImageUpload('pickup', e.target.files[0])}
                    style={{ display: 'none' }}
                  />
                  <button 
                    className="upload-btn"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                  >
                    <Upload size={24} />
                    Upload Photo
                  </button>
                </div>
              )}
            </div>
            <textarea
              className="notes-input"
              placeholder="Add notes about bin condition or location..."
              value={taskData.notes}
              onChange={(e) => setTaskData({ ...taskData, notes: e.target.value })}
              disabled={loading}
            />
            <button 
              className="primary-btn"
              disabled={!taskData.pickupImage || loading}
              onClick={() => setCurrentStep('disposal')}
            >
              {loading ? 'Loading...' : 'Confirm Pickup'}
            </button>
          </div>
        );

      case 'disposal':
        return (
          <div className="step-content">
            <h3>Disposal Verification</h3>
            <div className="image-upload-area">
              {taskData.disposalImage ? (
                <div className="image-preview">
                  <img src={taskData.disposalImage} alt="Disposal" />
                  <button 
                    className="retake-btn"
                    onClick={() => handleCaptureImage('disposal')}
                    disabled={loading}
                  >
                    Retake Photo
                  </button>
                </div>
              ) : (
                <div className="upload-buttons">
                  <button 
                    className="camera-btn"
                    onClick={() => handleCaptureImage('disposal')}
                    disabled={loading}
                  >
                    <Camera size={24} />
                    Take Photo
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={(e) => handleImageUpload('disposal', e.target.files[0])}
                    style={{ display: 'none' }}
                  />
                  <button 
                    className="upload-btn"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                  >
                    <Upload size={24} />
                    Upload Photo
                  </button>
                </div>
              )}
            </div>
            <button 
              className="primary-btn"
              disabled={!taskData.disposalImage || loading}
              onClick={handleCompleteTask}
            >
              {loading ? 'Loading...' : 'Complete Task'}
            </button>
          </div>
        );

      case 'complete':
        return (
          <div className="step-content">
            <div className="completion-message">
              <CheckCircle size={48} color="#4CAF50" />
              <h3>Task Completed Successfully</h3>
              <p>Your task has been submitted for verification.</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="task-verification">
      <div className="progress-steps">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`step ${currentStep === step.id ? 'active' : ''} ${
              steps.findIndex(s => s.id === currentStep) > steps.findIndex(s => s.id === step.id)
                ? 'completed'
                : ''
            }`}
          >
            <div className="step-icon">
              {steps.findIndex(s => s.id === currentStep) > steps.findIndex(s => s.id === step.id) ? (
                <CheckCircle size={20} />
              ) : (
                <span>{steps.findIndex(s => s.id === step.id) + 1}</span>
              )}
            </div>
            <span className="step-label">{step.label}</span>
          </div>
        ))}
      </div>

      {error && (
        <div className="error-message">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {renderStepContent()}

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner" />
        </div>
      )}
    </div>
  );
};

export default TaskVerification; 