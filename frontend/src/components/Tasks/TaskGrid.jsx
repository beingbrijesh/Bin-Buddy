import React from 'react';
import { format } from 'date-fns';
import { CheckCircle, Clock, Truck, User, MapPin, Calendar, Copy, Hash } from 'lucide-react';
import api from '../../utils/axios';
import { toast } from 'react-hot-toast';

const statusConfig = {
  assigned: { label: 'Assigned', color: 'bg-blue-100 text-blue-800', icon: <Clock size={14} /> },
  inProgress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800', icon: <Truck size={14} /> },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: <CheckCircle size={14} /> },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: <CheckCircle size={14} /> },
};

const TaskCard = ({ task, onRefresh }) => {
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
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg text-gray-800">{task.title}</h3>
          <span className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full ${statusConfig[task.status]?.color}`}>
            {statusConfig[task.status]?.icon}
            {statusConfig[task.status]?.label}
          </span>
        </div>
        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
            <MapPin size={12} /> {task.zone?.name || 'N/A'}
        </p>
        <div className="mt-4 space-y-2 text-sm text-gray-700">
            <div className="flex items-center gap-2">
                <Hash size={14} />
                <span className="truncate">{task._id}</span>
                <button onClick={() => {
                    navigator.clipboard.writeText(task._id);
                    toast.success('ID Copied!');
                }} className="ml-auto text-gray-400 hover:text-gray-600">
                    <Copy size={14} />
                </button>
            </div>
            <div className="flex items-center gap-2">
                <User size={14} />
                <span>{task.assignedTo?.name || 'Unassigned'}</span>
            </div>
            <div className="flex items-center gap-2">
                <Calendar size={14} />
                <span>{task.schedule?.startTime ? format(new Date(task.schedule.startTime), 'MMM d, yyyy, h:mm a') : 'Not Scheduled'}</span>
            </div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
        {task.status === 'completed' && !task.verification?.isVerified && (
          <button 
            onClick={() => handleVerify(task._id)}
            className="text-indigo-600 hover:text-indigo-900 font-semibold"
          >
            Verify Task
          </button>
        )}
        {task.verification?.isVerified && (
            <span className='text-green-600 font-semibold flex items-center gap-1'><CheckCircle size={16}/> Verified</span>
        )}
      </div>
    </div>
  );
}

const TaskGrid = ({ tasks, onRefresh }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tasks.map((task) => (
        <TaskCard key={task._id} task={task} onRefresh={onRefresh} />
      ))}
    </div>
  );
};

export default TaskGrid;
