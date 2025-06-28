import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
  Tooltip,
  InputAdornment,
  CircularProgress,
  Menu,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignIcon,
  Visibility as ViewIcon,
  MoreVert as MoreVertIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Star,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import axios from '@/lib/axios';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Badge,
} from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Download,
  UserPlus,
  Users,
  MoreVertical,
} from 'lucide-react';
import WorkerForm from './WorkerForm';
import WorkerProfile from './WorkerProfile';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

const WorkerList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [zones, setZones] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    onLeave: 0,
    suspended: 0,
    collectors: 0,
    drivers: 0,
    supervisors: 0
  });
  
  const [filters, setFilters] = useState({
    status: 'all',
    workerType: 'all',
    zone: 'all',
    sortBy: 'name-asc',
    search: ''
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchZones();
    fetchWorkers();
  }, [filters, pagination.page, pagination.limit]);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching workers...');
      
      // Try multiple endpoints with priority on the dedicated worker API
      const endpoints = [
        '/api/workers',
        '/api/workers/all-workers',
        '/api/users?role=worker'
      ];
      
      let response = null;
      let error = null;
      
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`);
          response = await axios.get(endpoint);
          console.log(`Success with endpoint: ${endpoint}`);
          break;
        } catch (err) {
          console.error(`Failed with endpoint ${endpoint}:`, err);
          error = err;
        }
      }
      
      if (!response) {
        throw new Error(`All endpoints failed. Last error: ${error?.message}`);
      }
      
      // Handle different response formats
      let fetchedWorkers = [];
      if (Array.isArray(response.data)) {
        fetchedWorkers = response.data;
      } else if (response.data.workers && Array.isArray(response.data.workers)) {
        fetchedWorkers = response.data.workers;
      } else if (typeof response.data === 'object') {
        fetchedWorkers = [response.data];
      }
      
      console.log(`Fetched ${fetchedWorkers.length} workers`);
      
      // Apply client-side filtering
      let filteredWorkers = [...fetchedWorkers];
      
      // Filter by worker type
      if (filters.workerType !== 'all') {
        filteredWorkers = filteredWorkers.filter(worker => 
          worker.workerType === filters.workerType);
      }
      
      // Filter by status
      if (filters.status !== 'all') {
        filteredWorkers = filteredWorkers.filter(worker => 
          worker.workerStatus === filters.status || 
          worker.status === filters.status);
      }
      
      // Filter by zone
      if (filters.zone !== 'all') {
        filteredWorkers = filteredWorkers.filter(worker => 
          worker.zone === filters.zone || 
          worker.workerDetails?.zone === filters.zone);
      }
      
      // Filter by search term
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredWorkers = filteredWorkers.filter(worker => 
          worker.name?.toLowerCase().includes(searchTerm) ||
          worker.email?.toLowerCase().includes(searchTerm) ||
          worker.workerId?.toLowerCase().includes(searchTerm) ||
          worker.workerDetails?.employeeId?.toLowerCase().includes(searchTerm)
        );
      }
      
      // Sort workers
      if (filters.sortBy) {
        const [field, direction] = filters.sortBy.split('-');
        filteredWorkers.sort((a, b) => {
          if (field === 'name') {
            return direction === 'asc' 
              ? (a.name || '').localeCompare(b.name || '')
              : (b.name || '').localeCompare(a.name || '');
          } else if (field === 'rating') {
            const aRating = a.performance?.rating || a.rating || 0;
            const bRating = b.performance?.rating || b.rating || 0;
            return direction === 'asc' ? aRating - bRating : bRating - aRating;
          }
          return 0;
        });
      }
      
      // Normalize worker data
      const normalizedWorkers = filteredWorkers.map(worker => ({
        _id: worker._id,
        workerId: worker.workerId || worker.workerDetails?.employeeId || 'N/A',
        name: worker.name || 'Unnamed Worker',
        email: worker.email || 'No Email',
        phone: worker.phone || 'No Phone',
        avatar: worker.avatar || '',
        workerType: worker.workerType || 'collector',
        zone: worker.zone || worker.workerDetails?.zone || 'Unassigned',
        workerStatus: worker.workerStatus || worker.status || 'active',
        shift: worker.shift || worker.workerDetails?.shift || 'morning',
        performance: {
          rating: worker.performance?.rating || worker.rating || 0,
          efficiency: worker.performance?.efficiency || worker.efficiency || 0,
          tasksCompleted: worker.performance?.tasksCompleted || worker.tasksCompleted || 0,
          binsCollected: worker.performance?.binsCollected || worker.binsCollected || 0,
          distanceCovered: worker.performance?.distanceCovered || worker.distanceCovered || 0
        },
        lastLogin: worker.lastLogin || null,
        workerDetails: worker.workerDetails || {}
      }));
      
      setWorkers(normalizedWorkers);
      updateStats(normalizedWorkers);
      
      // Update pagination
      setPagination(prev => ({
        ...prev,
        total: filteredWorkers.length,
        pages: Math.ceil(filteredWorkers.length / prev.limit)
      }));
      
    } catch (error) {
      console.error('Error fetching workers:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch workers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchZones = async () => {
    try {
      const endpoints = [
        '/api/zones',
        '/zones',
        '/api/zones/all',
        '/zones/all'
      ];
      
      let response = null;
      
      for (const endpoint of endpoints) {
        try {
          response = await axios.get(endpoint);
          break;
        } catch (err) {
          console.error(`Failed to fetch zones from ${endpoint}:`, err);
        }
      }
      
      if (!response) {
        throw new Error('Failed to fetch zones from all endpoints');
      }
      
      let zoneData = [];
      if (Array.isArray(response.data)) {
        zoneData = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        zoneData = response.data.data;
      } else if (response.data.zones && Array.isArray(response.data.zones)) {
        zoneData = response.data.zones;
      }
      
      setZones(zoneData);
    } catch (error) {
      console.error('Error fetching zones:', error);
      toast({
        title: "Error",
        description: "Failed to fetch zones",
        variant: "destructive"
      });
    }
  };

  const updateStats = (workersList) => {
    const stats = workersList.reduce((acc, worker) => ({
      total: acc.total + 1,
      active: acc.active + (worker.workerStatus === 'active' ? 1 : 0),
      onLeave: acc.onLeave + (worker.workerStatus === 'onLeave' ? 1 : 0),
      suspended: acc.suspended + (worker.workerStatus === 'suspended' ? 1 : 0),
      collectors: acc.collectors + (worker.workerType === 'collector' ? 1 : 0),
      drivers: acc.drivers + (worker.workerType === 'driver' ? 1 : 0),
      supervisors: acc.supervisors + (worker.workerType === 'supervisor' ? 1 : 0)
    }), { 
      total: 0, 
      active: 0, 
      onLeave: 0, 
      suspended: 0,
      collectors: 0,
      drivers: 0,
      supervisors: 0
    });

    setStats(stats);
  };

  const handleExport = async (format = 'csv') => {
    try {
      const response = await axios.get(`/api/users/export`, {
        params: {
          role: 'worker',
          format
        },
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { 
        type: format === 'csv' ? 'text/csv' : 'application/json' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `workers-export.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export workers data",
        variant: "destructive"
      });
    }
  };

  const handleSearch = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on filter change
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Worker Management</h1>
          <p className="text-muted-foreground">Manage and monitor all workers</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => handleExport('csv')}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={() => setShowAddModal(true)} variant="default">
            <UserPlus className="mr-2 h-4 w-4" />
            Add Worker
        </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Workers</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Leave</CardTitle>
            <Users className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.onLeave}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspended</CardTitle>
            <Users className="h-4 w-4 text-red-500" />
          </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{stats.suspended}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search by name, ID or email..."
            value={filters.search}
                  onChange={handleSearch}
            className="w-full"
                />
        </div>

        <div className="w-[180px]">
                  <Select
                    value={filters.status}
            onValueChange={(value) => handleFilterChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="onLeave">On Leave</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-[180px]">
          <Select
            value={filters.workerType}
            onValueChange={(value) => handleFilterChange('workerType', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="collector">Collector</SelectItem>
              <SelectItem value="driver">Driver</SelectItem>
              <SelectItem value="supervisor">Supervisor</SelectItem>
              <SelectItem value="sweeper">Sweeper</SelectItem>
              <SelectItem value="cleaner">Cleaner</SelectItem>
            </SelectContent>
                  </Select>
        </div>

        <div className="w-[180px]">
                  <Select
                    value={filters.zone}
            onValueChange={(value) => handleFilterChange('zone', value)}
                  >
            <SelectTrigger>
              <SelectValue placeholder="Select Zone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Zones</SelectItem>
                    {zones.map((zone) => (
                <SelectItem key={zone._id} value={zone._id}>
                  {zone.name}
                </SelectItem>
                    ))}
            </SelectContent>
                  </Select>
        </div>
      </div>

      {/* Workers Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Worker ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Zone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Performance</TableHead>
              <TableHead>Tasks</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
      {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Loading workers...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : workers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  No workers found
                </TableCell>
              </TableRow>
            ) : (
              workers.map((worker) => (
                <TableRow key={worker._id}>
                  <TableCell>{worker.workerId}</TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {worker.avatar && (
                        <img 
                          src={worker.avatar} 
                          alt={worker.name} 
                          className="w-8 h-8 rounded-full"
                        />
                      )}
                      <div>
                        <div>{worker.name}</div>
                        <div className="text-sm text-muted-foreground">{worker.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {worker.workerType}
                    </Badge>
                  </TableCell>
                  <TableCell>{worker.zone}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        worker.workerStatus === 'active'
                          ? 'success'
                          : worker.workerStatus === 'onLeave'
                          ? 'warning'
                          : worker.workerStatus === 'suspended'
                          ? 'destructive'
                          : 'secondary'
                      }
                      className={
                        worker.workerStatus === 'active'
                          ? 'bg-green-100 text-green-800'
                          : worker.workerStatus === 'onLeave'
                          ? 'bg-yellow-100 text-yellow-800'
                          : worker.workerStatus === 'suspended'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }
                    >
                      {worker.workerStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span>{worker.performance.rating}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {worker.performance.efficiency}% efficiency
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{worker.performance.tasksCompleted} completed</div>
                      {worker.workerType === 'collector' && (
                        <div className="text-muted-foreground">
                          {worker.performance.binsCollected} bins
                        </div>
                      )}
                      {worker.workerType === 'driver' && (
                        <div className="text-muted-foreground">
                          {worker.performance.distanceCovered} km
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {worker.lastLogin ? format(new Date(worker.lastLogin), 'PPp') : 'Never'}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
          </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedWorker(worker);
                            setShowProfileDrawer(true);
                          }}
                        >
          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => navigate(`/admin/workers/${worker._id}/tasks`)}
                        >
                          Assign Task
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedWorker(worker);
                            setShowAddModal(true);
                          }}
                        >
                          Edit
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
          disabled={pagination.page === 1}
        >
          Previous
        </Button>
        <div className="text-sm text-muted-foreground">
          Page {pagination.page} of {pagination.pages || 1}
        </div>
                    <Button
          variant="outline"
          size="sm"
          onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
          disabled={pagination.page >= pagination.pages}
        >
          Next
          </Button>
      </div>

      {/* Modals */}
      <WorkerForm
        open={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setSelectedWorker(null);
        }}
        worker={selectedWorker}
        onSuccess={() => {
          fetchWorkers();
          setShowAddModal(false);
          setSelectedWorker(null);
        }}
      />

      <WorkerProfile
        open={showProfileDrawer}
        onClose={() => {
          setShowProfileDrawer(false);
          setSelectedWorker(null);
        }}
        workerId={selectedWorker?._id}
      />
    </div>
  );
};

export default WorkerList;