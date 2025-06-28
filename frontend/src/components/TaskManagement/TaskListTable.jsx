import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, Truck, MapPin, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import AssignTaskForm from './AssignTaskForm';
import Modal from '../../components/Modal';
import { Checkbox } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/20/solid';

export default function TaskListTable({ tasks, onUpdate, onCreateClick, onViewClick, onAssignClick }) {
  const [assigningTask, setAssigningTask] = useState(null);

  const safeTasks = Array.isArray(tasks) ? tasks : [];

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'verified': return 'bg-green-700 text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAssignSuccess = () => {
    setAssigningTask(null);
    onUpdate();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Task Management</h2>
          <p className="text-sm text-gray-500 mt-1">View and manage all tasks</p>
        </div>
        <button 
          onClick={onCreateClick}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          + Create Task
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <Checkbox className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              </th>
              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  Task ID
                  <ChevronUpDownIcon className="ml-1 h-4 w-4 text-gray-400" />
                </div>
              </th>
              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  Type
                  <ChevronUpDownIcon className="ml-1 h-4 w-4 text-gray-400" />
                </div>
              </th>
              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  Zone
                  <ChevronUpDownIcon className="ml-1 h-4 w-4 text-gray-400" />
                </div>
              </th>
              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  Status
                  <ChevronUpDownIcon className="ml-1 h-4 w-4 text-gray-400" />
                </div>
              </th>
              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  Assigned To
                  <ChevronUpDownIcon className="ml-1 h-4 w-4 text-gray-400" />
                </div>
              </th>
              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  Schedule
                  <ChevronUpDownIcon className="ml-1 h-4 w-4 text-gray-400" />
                </div>
              </th>
              <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {safeTasks.map(task => (
              <tr key={task._id} className="hover:bg-gray-50">
                <td className="px-4 py-2 whitespace-nowrap">
                  <Checkbox className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{task.taskId}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 capitalize">{task.taskType}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{task.zone?.name || '-'}</td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  {task.assignedTo?.name || 'Unassigned'}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  {new Date(task.schedule?.startTime).toLocaleString()}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex gap-2 justify-end">
                    <button 
                      onClick={() => onViewClick(task)}
                      className="text-indigo-600 hover:text-indigo-900 text-xs px-3 py-1.5 border border-gray-300 rounded-md shadow-sm font-medium"
                    >
                      View
                    </button>
                    {['created', 'pending'].includes(task.status) && (
                      <button
                        onClick={() => onAssignClick(task)}
                        className="text-white bg-indigo-600 hover:bg-indigo-700 text-xs px-3 py-1.5 border border-transparent rounded-md shadow-sm font-medium"
                      >
                        Assign
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination would go here */}
    </div>
  );
}
