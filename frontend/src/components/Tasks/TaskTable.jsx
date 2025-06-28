import React from 'react';
import { format } from 'date-fns';
import { CheckCircle, Clock, Truck, User, MapPin, Calendar, Copy } from 'lucide-react';
import api from '../../utils/axios';
import { toast } from 'react-hot-toast';

const statusConfig = {
  assigned: { label: 'Assigned', color: 'bg-blue-100 text-blue-800', icon: <Clock size={14} /> },
  inProgress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800', icon: <Truck size={14} /> },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: <CheckCircle size={14} /> },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: <CheckCircle size={14} /> },
};

const TaskTable = ({ tasks, onRefresh }) => {

  const handleVerify = async (taskId) => {
    if (!window.confirm('Are you sure you want to verify this task?')) return;

    try {
      await api.patch(`/api/tasks/${taskId}/verify`, { isVerified: true });
      toast.success('Task verified successfully!');
      onRefresh();
    } catch (error) {
      console.error('Error verifying task:', error);
      toast.error('Failed to verify task.');
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task Title</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {tasks.map((task) => (
            <tr key={task._id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="font-medium text-gray-900">{task.title}</div>
                <div className="text-sm text-gray-500 flex items-center gap-1">
                    <MapPin size={12} /> {task.zone?.name || 'N/A'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                    <User size={14} />
                    <div>
                        <div className="text-sm font-medium text-gray-900">{task.assignedTo?.name || 'Unassigned'}</div>
                        <div className="text-xs text-gray-500">{task.vehicle?.name || 'No vehicle'}</div>
                    </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    {task.schedule?.startTime ? format(new Date(task.schedule.startTime), 'MMM d, yyyy, h:mm a') : 'Not Scheduled'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex items-center">
                  <span className="truncate">{task._id}</span>
                  <button onClick={() => {
                    navigator.clipboard.writeText(task._id);
                    toast.success('ID Copied!');
                  }} className="ml-2 text-gray-400 hover:text-gray-600">
                    <Copy size={14} />
                  </button>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full ${statusConfig[task.status]?.color}`}>
                  {statusConfig[task.status]?.icon}
                  {statusConfig[task.status]?.label}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                {task.status === 'completed' && !task.verification?.isVerified && (
                  <button 
                    onClick={() => handleVerify(task._id)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Verify
                  </button>
                )}
                {task.verification?.isVerified && (
                    <span className='text-green-600 font-semibold'>Verified</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaskTable;
