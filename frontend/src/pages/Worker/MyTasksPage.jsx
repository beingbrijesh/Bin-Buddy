import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/axios';
import { toast, Toaster } from 'react-hot-toast';
import { CheckCircle, Clock, Truck, MapPin, Calendar, Camera } from 'lucide-react';

const statusConfig = {
  assigned: { label: 'Assigned', color: 'text-blue-600', icon: <Clock size={16} /> },
  inProgress: { label: 'In Progress', color: 'text-yellow-600', icon: <Truck size={16} /> },
  completed: { label: 'Completed', color: 'text-green-600', icon: <CheckCircle size={16} /> },
  cancelled: { label: 'Cancelled', color: 'text-red-600', icon: <CheckCircle size={16} /> },
};

const WorkerTaskCard = ({ task, onUpdate }) => {
  const handleStatusUpdate = async (status, verificationImages = []) => {
    const confirmationText = status === 'inProgress' 
      ? 'Are you sure you want to start this task?' 
      : 'Are you sure you want to complete this task?';
      
    if (!window.confirm(confirmationText)) return;

    try {
      const payload = { status };
      if (status === 'completed') {
        // In a real app, you'd use a file input and upload logic.
        // For now, we'll simulate with placeholder image URLs.
        payload.verificationImages = ['image1.jpg', 'image2.jpg'];
        toast.loading('Completing task and uploading images...');
      } else {
        toast.loading('Updating task status...');
      }
      
      await api.patch(`/api/tasks/${task._id}/status`, payload);
      toast.dismiss();
      toast.success(`Task status updated to ${status}.`);
      onUpdate();
    } catch (error) {
      toast.dismiss();
      console.error('Error updating task status:', error);
      toast.error('Failed to update task.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-xl text-gray-800">{task.title}</h3>
        <div className={`flex items-center gap-2 font-semibold ${statusConfig[task.status]?.color}`}>
          {statusConfig[task.status]?.icon}
          <span>{statusConfig[task.status]?.label}</span>
        </div>
      </div>
      <p className="text-gray-600 mb-4">{task.description}</p>
      
      <div className="space-y-2 text-sm text-gray-700 mb-4">
        <div className="flex items-center gap-2"><MapPin size={14} /> <strong>Zone:</strong> {task.zone?.name}</div>
        <div className="flex items-center gap-2"><Calendar size={14} /> <strong>Time:</strong> {new Date(task.schedule.startTime).toLocaleString()}</div>
        <div className="flex items-center gap-2"><Truck size={14} /> <strong>Vehicle:</strong> {task.vehicle?.name || 'N/A'}</div>
      </div>
      
      <div className="border-t pt-4 flex justify-end gap-3">
        {task.status === 'assigned' && (
          <button onClick={() => handleStatusUpdate('inProgress')} className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold">Start Task</button>
        )}
        {task.status === 'inProgress' && (
          <button onClick={() => handleStatusUpdate('completed')} className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold flex items-center gap-2"><Camera size={16}/> Complete Task</button>
        )}
      </div>
    </div>
  );
};

const MyTasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchTasks = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await api.get(`/api/tasks/worker/${user.id}`);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to fetch your tasks.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Toaster position="top-center" />
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Assigned Tasks</h1>
      {loading ? (
        <p>Loading your tasks...</p>
      ) : tasks.length > 0 ? (
        <div className="space-y-6">
          {tasks.map(task => (
            <WorkerTaskCard key={task._id} task={task} onUpdate={fetchTasks} />
          ))}
        </div>
      ) : (
        <p>You have no assigned tasks.</p>
      )}
    </div>
  );
};

export default MyTasksPage;
