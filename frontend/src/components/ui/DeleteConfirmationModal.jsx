import React from 'react';
import { XCircle, AlertTriangle } from 'lucide-react';

const DeleteConfirmationModal = ({ 
  isOpen, 
  title = 'Confirm Delete', 
  message = 'Are you sure you want to delete this item? This action cannot be undone.',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel', 
  onConfirm,
  onCancel
}) => {
  // If modal is not open, don't render anything
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Modal header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-medium flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            {title}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>
        
        {/* Modal body */}
        <div className="p-4">
          <p className="text-gray-700">{message}</p>
        </div>
        
        {/* Modal footer */}
        <div className="flex justify-end gap-2 p-4 border-t">
          <button
            className="btn btn-outline btn-sm"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            className="btn btn-error btn-sm"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal; 