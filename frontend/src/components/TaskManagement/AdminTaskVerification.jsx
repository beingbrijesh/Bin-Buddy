import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import TaskAPI from '../../services/TaskAPI';
import './AdminTaskVerification.css';

const AdminTaskVerification = ({ task, onVerify }) => {
  const [verificationNote, setVerificationNote] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async (isApproved) => {
    try {
      if (!verificationNote && !isApproved) {
        setError('Please provide a reason for rejection');
        return;
      }

      setLoading(true);
      const verificationData = {
        taskId: task.id,
        isApproved,
        verificationNote,
        verifiedAt: new Date(),
      };

      const result = await TaskAPI.verifyTask(verificationData);
      onVerify?.(result);
      setError(null);
    } catch (err) {
      setError('Failed to verify task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-task-verification">
      <div className="task-header">
        <h2>Task Verification</h2>
        <div className="task-meta">
          <div className="meta-item">
            <span className="label">Bin ID:</span>
            <span className="value">{task.binId}</span>
          </div>
          <div className="meta-item">
            <span className="label">Worker:</span>
            <span className="value">{task.workerName}</span>
          </div>
          <div className="meta-item">
            <Clock size={16} />
            <span className="value">
              Duration: {Math.round((task.endTime - task.startTime) / (1000 * 60))} minutes
            </span>
          </div>
          <div className="meta-item">
            <span className="label">Status:</span>
            <span className="value status-text">{task.binStatus}</span>
          </div>
        </div>
      </div>

      <div className="task-images">
        <div className="image-container">
          <h3>Before Pickup</h3>
          <img src={task.pickupImage} alt="Before pickup" />
          <span className="timestamp">
            {new Date(task.startTime).toLocaleTimeString()}
          </span>
        </div>
        <div className="image-container">
          <h3>After Disposal</h3>
          <img src={task.disposalImage} alt="After disposal" />
          <span className="timestamp">
            {new Date(task.endTime).toLocaleTimeString()}
          </span>
        </div>
      </div>

      {task.notes && (
        <div className="worker-notes">
          <h3>Worker Notes</h3>
          <p>{task.notes}</p>
        </div>
      )}

      <div className="verification-form">
        <textarea
          className="verification-notes"
          placeholder="Add verification notes (required for rejection)..."
          value={verificationNote}
          onChange={(e) => setVerificationNote(e.target.value)}
          disabled={loading}
        />

        {error && (
          <div className="error-message">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        <div className="verification-actions">
          <button 
            className="approve-btn"
            onClick={() => handleVerify(true)}
            disabled={loading}
          >
            <CheckCircle size={20} />
            {loading ? 'Approving...' : 'Approve Task'}
          </button>
          <button 
            className="reject-btn"
            onClick={() => handleVerify(false)}
            disabled={loading}
          >
            <XCircle size={20} />
            {loading ? 'Rejecting...' : 'Reject Task'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminTaskVerification; 