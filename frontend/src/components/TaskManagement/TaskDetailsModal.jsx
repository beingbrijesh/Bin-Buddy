import React from 'react';
import { X, Clock, Users, Truck, MapPin, CheckCircle, AlertCircle, Loader2, FileText, Calendar } from 'lucide-react';

export default function TaskDetailsModal({ task, onClose }) {
  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'in_progress': return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'verified': return <CheckCircle className="h-5 w-5 text-green-700" />;
      default: return null;
    }
  };

  const getTaskLabel = (task) => {
    if (task.taskType === 'custom') return task.customTaskLabel;
    if (task.taskType === 'event') return task.eventName;
    return task.taskType.replace('_', ' ');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{getTaskLabel(task)}</h2>
              <p className="text-sm text-gray-500 capitalize">{task.taskType}</p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Task Details</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-gray-400">
                    {getStatusIcon(task.status)}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 capitalize">Status: {task.status.replace('_', ' ')}</p>
                    {task.verifiedBy && (
                      <p className="text-xs text-gray-500 mt-1">Verified by: {task.verifiedBy.name}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-gray-400">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(task.startDate).toLocaleString()} - {new Date(task.endDate).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-gray-400">
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Assigned Roles:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {task.assignedRoles?.map(role => (
                        <span 
                          key={role} 
                          className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 capitalize"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {task.assignedTo?.length > 0 && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-gray-400">
                      <Users className="h-5 w-5" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Assigned To:</p>
                      <div className="mt-1 space-y-1">
                        {task.assignedTo.map(user => (
                          <p key={user._id} className="text-sm text-gray-700">
                            {user.name} ({user.workerType})
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {task.vehicle && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-gray-400">
                      <Truck className="h-5 w-5" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Vehicle:</p>
                      <p className="text-sm text-gray-700 mt-1">{task.vehicle.name}</p>
                    </div>
                  </div>
                )}

                {task.assignedZone && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-gray-400">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Zone:</p>
                      <p className="text-sm text-gray-700 mt-1">{task.assignedZone.name}</p>
                    </div>
                  </div>
                )}

                {task.assignedBins?.length > 0 && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-gray-400">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Assigned Bins:</p>
                      <div className="mt-1 space-y-1">
                        {task.assignedBins.map(bin => (
                          <p key={bin._id} className="text-sm text-gray-700">{bin.name}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Task History</h3>
              
              {task.history?.length > 0 ? (
                <div className="space-y-4">
                  {task.history.map((entry, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 text-gray-400">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 capitalize">
                          Status changed to {entry.status.replace('_', ' ')}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(entry.changedAt).toLocaleString()} by {entry.changedBy?.name || 'system'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No history available</p>
              )}

              <h3 className="text-lg font-medium text-gray-900 mt-6 mb-4">Notes</h3>
              {task.notes ? (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 whitespace-pre-line">{task.notes}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No notes available</p>
              )}

              {task.photos?.length > 0 && (
                <>
                  <h3 className="text-lg font-medium text-gray-900 mt-6 mb-4">Photos</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {task.photos.map((photo, index) => (
                      <div key={index} className="rounded-lg overflow-hidden">
                        <img 
                          src={photo.url} 
                          alt={photo.caption || `Task photo ${index + 1}`}
                          className="w-full h-auto object-cover"
                        />
                        {photo.caption && (
                          <p className="text-xs text-gray-500 mt-1">{photo.caption}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
