import React, { useState, useEffect } from 'react';
import { PlusCircle, List, Grid, Filter, RefreshCw, Loader2, X, Search, DownloadIcon, FileText } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import api from '../../services/api';
import TaskListTable from '../../components/TaskManagement/TaskListTable';
import TaskCreateForm from '../../components/TaskManagement/TaskCreateForm';
import Modal from '../../components/Modal';

export default function TaskManagementPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [filters, setFilters] = useState({
    taskType: '',
    status: '',
    assignedRole: '',
    zone: '',
    vehicle: ''
  });

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) query.append(key, value);
      });
      
      const response = await api.get(`/api/tasks?${query.toString()}`);
      setTasks(response.data?.tasks || response.data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to fetch tasks');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  const handleTaskCreated = () => {
    setShowCreateForm(false);
    fetchTasks();
  };

  const getStats = () => {
    const taskArray = Array.isArray(tasks) ? tasks : [];
    return {
      total: taskArray.length,
      pending: taskArray.filter(t => t.status === 'pending').length,
      inProgress: taskArray.filter(t => t.status === 'in_progress').length,
      completed: taskArray.filter(t => t.status === 'completed').length,
      verified: taskArray.filter(t => t.status === 'verified').length
    };
  };

  const filteredTasks = Array.isArray(tasks) 
    ? tasks.filter(task => {
        const matchesStatus = statusFilter === '' || task.status === statusFilter;
        const matchesType = !filters.taskType || task.taskType === filters.taskType;
        const matchesRole = !filters.assignedRole || 
          (task.assignedRoles && task.assignedRoles.includes(filters.assignedRole));
        const matchesZone = !filters.zone || task.zone === filters.zone;
        const matchesVehicle = !filters.vehicle || task.vehicle === filters.vehicle;
        return matchesStatus && matchesType && matchesRole && matchesZone && matchesVehicle;
      })
    : [];

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header with Search */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Task Management</h1>
            <p className="text-xs md:text-sm text-gray-500 mt-0.5">View and manage all tasks across your zones</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Search tasks..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
            >
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Create Task</span>
            </button>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="bg-white p-0.5 rounded-lg shadow-sm border border-gray-200">
          <div className="flex overflow-x-auto">
            {['', 'pending', 'in_progress', 'completed', 'verified'].map((status) => (
              <button
                key={status || 'all'}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-xs sm:text-sm font-medium whitespace-nowrap ${statusFilter === status 
                  ? 'text-indigo-700 border-b-2 border-indigo-500' 
                  : 'text-gray-500 hover:bg-gray-50'}`}
              >
                {status === '' ? 'All Tasks' : status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Total Tasks', value: getStats().total, color: 'text-gray-800' },
            { label: 'Pending', value: getStats().pending, color: 'text-amber-600' },
            { label: 'In Progress', value: getStats().inProgress, color: 'text-blue-600' },
            { label: 'Completed', value: getStats().completed, color: 'text-emerald-600' },
            { label: 'Verified', value: getStats().verified, color: 'text-green-700' }
          ].map((stat) => (
            <div key={stat.label} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
              <p className="text-xs font-medium text-gray-500">{stat.label}</p>
              <p className={`text-xl font-semibold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters Section */}
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-gray-900">Filters</h3>
            <button className="text-xs text-indigo-600 hover:text-indigo-800">
              Clear All
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Task Type</label>
              <select
                value={filters.taskType}
                onChange={(e) => setFilters({...filters, taskType: e.target.value})}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md shadow-sm text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Types</option>
                <option value="collection">Collection</option>
                <option value="sweeping">Sweeping</option>
                <option value="bin_cleaning">Bin Cleaning</option>
                <option value="emergency">Emergency</option>
                <option value="festival">Festival</option>
                <option value="event">Event</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
              <select
                value={filters.assignedRole}
                onChange={(e) => setFilters({...filters, assignedRole: e.target.value})}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md shadow-sm text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Roles</option>
                <option value="collector">Collector</option>
                <option value="driver">Driver</option>
                <option value="supervisor">Supervisor</option>
                <option value="sweeper">Sweeper</option>
                <option value="cleaner">Cleaner</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Zone</label>
              <select
                value={filters.zone}
                onChange={(e) => setFilters({...filters, zone: e.target.value})}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md shadow-sm text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Zones</option>
                <option value="zone1">Zone 1</option>
                <option value="zone2">Zone 2</option>
                <option value="zone3">Zone 3</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Vehicle</label>
              <select
                value={filters.vehicle}
                onChange={(e) => setFilters({...filters, vehicle: e.target.value})}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md shadow-sm text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Vehicles</option>
                <option value="vehicle1">Vehicle 1</option>
                <option value="vehicle2">Vehicle 2</option>
                <option value="vehicle3">Vehicle 3</option>
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={fetchTasks}
                className="flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
              >
                <Filter className="h-3 w-3" />
                Apply
              </button>
              <button
                onClick={() => setFilters({
                  taskType: '',
                  assignedRole: '',
                  zone: '',
                  vehicle: ''
                })}
                className="px-3.5 py-2 border border-gray-300 rounded-lg shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions and Export */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
            <select className="text-xs border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
              <option>Bulk Actions</option>
              <option>Assign Selected</option>
              <option>Change Status</option>
              <option>Delete Selected</option>
            </select>
            <button className="text-xs px-2.5 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
              Apply
            </button>
          </div>
          <button className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
            <DownloadIcon className="h-3.5 w-3.5" />
            Export
          </button>
        </div>

        {/* Task List Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks found</h3>
              <p className="mt-1 text-xs text-gray-500">Create a new task to get started</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="mt-4 inline-flex items-center px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm"
              >
                <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
                New Task
              </button>
            </div>
          ) : (
            <TaskListTable 
              tasks={filteredTasks} 
              onUpdate={fetchTasks}
              onCreateClick={() => setShowCreateForm(true)}
              onViewClick={setSelectedTask}
              onAssignClick={setSelectedTask}
            />
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3">
          <div className="flex flex-1 items-center justify-between">
            <div>
              <p className="text-xs text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{' '}
                <span className="font-medium">{filteredTasks.length}</span> results
              </p>
            </div>
            <div className="flex gap-1">
              <button className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
                Previous
              </button>
              <button className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Create Task Modal */}
        {showCreateForm && (
          <Modal onClose={() => setShowCreateForm(false)} title="Create New Task" size="lg">
            <TaskCreateForm 
              onSuccess={handleTaskCreated} 
              onCancel={() => setShowCreateForm(false)}
            />
          </Modal>
        )}

        {/* Task Details/Assign Modal */}
        {selectedTask && (
          <Modal 
            onClose={() => setSelectedTask(null)} 
            title={selectedTask.status === 'created' ? 'Assign Task' : 'Task Details'}
            size="lg"
          >
            {/* Content would be rendered here based on task status */}
          </Modal>
        )}
      </div>
    </div>
  );
}
