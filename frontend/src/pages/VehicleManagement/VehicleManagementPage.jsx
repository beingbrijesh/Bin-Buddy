import React, { useState, useEffect, useMemo } from 'react';

// Enum lists mirrored from backend VehicleSchema
const VEHICLE_STATUS_ENUM = ['active', 'maintenance', 'repair', 'inactive', 'breakdown', 'retired'];
const VEHICLE_TYPE_ENUM = ['truck', 'van', 'compactor', 'loader', 'cart', 'sweeper', 'tanker', 'utility', 'garbage-truck', 'pickup'];
import { 
  Plus,
  LayoutGrid,
  List,
  Map,
  Wrench,
  BarChart2,
  ShieldCheck,
  MapPin
} from 'lucide-react';
import VehicleTable from './components/VehicleTable';
import VehicleForm from './components/VehicleForm';
import VehicleDetails from './components/VehicleDetails';
import OverviewCards from './components/OverviewCards';
import FilterSearchBar from './components/FilterSearchBar';
import VehicleMapView from './VehicleMapView';
import MaintenanceLogModal from './components/MaintenanceLogModal';
import DocumentUploadModal from './components/DocumentUploadModal';
import AssignVehicleModal from '../../components/Vehicle/AssignVehicleModal';
import { Toaster, toast } from 'react-hot-toast';
import './VehicleManagement.css';
import '../Management/Management.css';
import api from '../../utils/axios';

const VehicleManagementPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [allVehicles, setAllVehicles] = useState([]);
  const [zones, setZones] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [stats, setStats] = useState({ total: 0, active: 0, avgRating: 0, tasksToday: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [currentVehicle, setCurrentVehicle] = useState(null);
  const [workers, setWorkers] = useState([]); 
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    zone: 'all',
    sortBy: 'name-asc'
  });

  const fetchVehicles = async () => {
    try {
      const res = await api.get('/api/vehicles');
      setAllVehicles(res.data);
      setVehicles(res.data);
    } catch (err) {
      console.error('Failed to fetch vehicles', err);
    }
  };

  const fetchZones = async () => {
    try {
      const res = await api.get('/api/zones');
      // The backend sends { status: 'success', data: [...] }, so we need res.data.data
      const zonesData = res.data?.data || [];
      setZones(zonesData);
    } catch (err) {
      console.error('Failed to fetch zones', err);
      toast.error('Could not load zones for filtering.');
      setZones([]);
    }
  };

  const fetchWorkers = async () => {
    try {
      const res = await api.get('/api/workers');
      setWorkers(res.data?.workers || []);
    } catch (error) {
      console.error("Failed to fetch workers", error);
      toast.error('Could not load workers.');
    }
  };

  useEffect(() => {
    fetchVehicles();
    fetchZones();
    fetchWorkers(); 
  }, []);

  useEffect(() => {
    if (allVehicles.length > 0) {
      const total = allVehicles.length;
      const active = allVehicles.filter(v => v.status === 'active').length;
      const maintenance = allVehicles.filter(v => v.status === 'maintenance').length;
      const onRoute = allVehicles.filter(v => v.status === 'on-route').length; 
      setStats({ total, active, maintenance, onRoute });
    } else {
      setStats({ total: 0, active: 0, maintenance: 0, onRoute: 0 });
    }
  }, [allVehicles]);

  useEffect(() => {
    let filtered = [...allVehicles];

    if (searchTerm) {
      filtered = filtered.filter(v => 
        (v.name && v.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (v.vehicleId && v.vehicleId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (v.type && v.type.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(v => v.status === filters.status);
    }
    if (filters.type !== 'all') {
      filtered = filtered.filter(v => v.type === filters.type);
    }
    if (filters.zone !== 'all') {
      filtered = filtered.filter(v => v.assignedZone && v.assignedZone.toString() === filters.zone);
    }

    if (filters.sortBy === 'name-asc') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (filters.sortBy === 'name-desc') {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    }

    setVehicles(filtered);
  }, [searchTerm, filters, allVehicles]);

  const filterOptions = useMemo(() => {
    // build status/type from predefined enums (covers full set regardless of fetched data)
    const statusOptions = [{ value: 'all', label: 'All Statuses' }, ...VEHICLE_STATUS_ENUM.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))];
    const typeOptions = [{ value: 'all', label: 'All Types' }, ...VEHICLE_TYPE_ENUM.map(t => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }))];

    const zoneOptions = [{ value: 'all', label: 'All Zones' }, ...zones.map(z => ({ value: z._id?.toString?.() || z.id || z._id, label: z.name }))];
    
    

    
    
    

    return {
      status: statusOptions,
      type: typeOptions,
      zone: zoneOptions,
      sortBy: [
        { value: 'name-asc', label: 'Name (A-Z)' },
        { value: 'name-desc', label: 'Name (Z-A)' },
      ],
    };
  }, [allVehicles, zones]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilters({
      status: 'all',
      type: 'all',
      zone: 'all',
      sortBy: 'name-asc'
    });
  };

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'map', label: 'Map View', icon: Map },
    { key: 'maintenance', label: 'Maintenance', icon: Wrench },
    { key: 'analytics', label: 'Analytics', icon: BarChart2 },
  ];

  const handleAddVehicle = () => {
    setIsAddModalOpen(true);
  };

  const handleViewDetails = (vehicle) => {
    setCurrentVehicle(vehicle);
    setIsDetailsOpen(true);
  };

  const handleVehicleSelect = (vehicle) => {
    setCurrentVehicle(vehicle);
    setIsDetailsOpen(true);
  };

  const handleAssignVehicle = (vehicle) => {
    setCurrentVehicle(vehicle);
    setIsAssignModalOpen(true);
  };

  const handleMaintenanceLog = (vehicle = null) => {
    if (vehicle) {
      setCurrentVehicle(vehicle);
    }
    setIsMaintenanceModalOpen(true);
  };

  const handleDocumentUpload = (vehicle = null) => {
    if (vehicle) {
      setCurrentVehicle(vehicle);
    }
    setIsDocumentModalOpen(true);
  };

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);
    setIsAddModalOpen(true);
  };

  const handleSaveVehicle = async (vehicleData) => {
    try {
      const url = vehicleData._id 
        ? `/api/vehicles/${vehicleData._id}` 
        : '/api/vehicles';
      
      const method = vehicleData._id ? 'put' : 'post';
      
      const response = await api[method](url, vehicleData);
      
      // Handle both response formats (data.data or direct vehicle object)
      const savedVehicle = response.data?.data || response.data;
      
      if (vehicleData._id) {
        setVehicles(vehicles.map(v => 
          v._id === vehicleData._id ? savedVehicle : v
        ));
        toast.success('Vehicle updated successfully');
      } else {
        setVehicles([...vehicles, savedVehicle]);
        toast.success('Vehicle added successfully');
      }
      
      setIsAddModalOpen(false);
      return savedVehicle;
    } catch (error) {
      console.error('Failed to save vehicle:', error);
      toast.error(error.response?.data?.message || 'Failed to save vehicle');
      throw error;
    }
  };

  const handleStatusChange = async (vehicleId, status) => {
    try {
      await api.put(`/api/vehicles/${vehicleId}`, { status });
      toast.success('Vehicle status updated!');
      fetchVehicles();
    } catch (err) {
      console.error('Failed to update status', err);
      toast.error('Failed to update vehicle status.');
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await api.delete(`/api/vehicles/${vehicleId}`);
        toast.success('Vehicle deleted successfully');
        fetchVehicles();
      } catch (err) {
        console.error('Failed to delete vehicle', err);
        toast.error(err.response?.data?.message || 'Failed to delete vehicle.');
      } 
    }
  };

  const handleCloseForm = () => {
    setIsAddModalOpen(false);
    setEditingVehicle(null);
  };

  const handleAssignSubmit = async (assignmentData) => {
    try {
      const vehicleId = assignmentData.vehicleId;
      const payload = { driverId: assignmentData.driverId };
      await api.post(`/api/vehicles/${vehicleId}/assign-driver`, payload);
      toast.success('Vehicle assigned successfully!');
      fetchVehicles(); 
      setIsAssignModalOpen(false); 
    } catch (error) {
      console.error('Failed to assign vehicle', error);
      toast.error(error.response?.data?.message || 'Failed to assign vehicle.');
    }
  };

  const handleMaintenanceSubmit = async (vehicleId, logData) => {
    try {
      await api.post(`/api/vehicles/${vehicleId}/maintenance`, logData);
      toast.success('Maintenance log added!');
      fetchVehicles(); 
    } catch (error) {
      console.error('Failed to add maintenance log', error);
      toast.error(error.response?.data?.message || 'Failed to add log.');
    }
  };

  return (
    <div className="management-container">
      <div className="management-header">
        <div className="header-content">
          <h1>Vehicle Management</h1>
          <p className="subtitle">
            Manage your fleet performance and operational status
            <span className="admin-badge">Admin Access</span>
          </p>
        </div>
        
        <div className="header-actions">
          <div className="view-toggle">
            <button 
              className={viewMode === 'grid' ? 'active' : ''}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              className={viewMode === 'table' ? 'active' : ''}
              onClick={() => setViewMode('table')}
            >
              <List size={18} />
            </button>
          </div>
          
          <button 
            className="maintenance-button"
            onClick={() => setIsMaintenanceModalOpen(true)}
          >
            <Wrench size={18} /> Maintenance Log
          </button>
          
          <button 
            className="assign-button"
            onClick={() => setIsAssignModalOpen(true)}
          >
            <ShieldCheck size={18} /> Assign
          </button>
          
          <button 
            className="add-button"
            onClick={() => {
              setEditingVehicle(null);
              setIsAddModalOpen(true);
            }}
          >
            <Plus size={18} /> Add Vehicle
          </button>
        </div>
      </div>
      
      <div className="tab-container">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <BarChart2 size={16} /> Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'map' ? 'active' : ''}`}
          onClick={() => setActiveTab('map')}
        >
          <MapPin size={16} /> Map View
        </button>
        <button 
          className={`tab-btn ${activeTab === 'assignments' ? 'active' : ''}`}
          onClick={() => setActiveTab('assignments')}
        >
          <ShieldCheck size={16} /> Assignments
        </button>
        <button 
          className={`tab-btn ${activeTab === 'maintenance' ? 'active' : ''}`}
          onClick={() => setActiveTab('maintenance')}
        >
          <Wrench size={16} /> Maintenance
        </button>
      </div>
      
      <div className="stats-filters-container">
        <OverviewCards stats={stats} />
        
        <div className="filters-section">
          <FilterSearchBar 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filters={filters}
            onFilterChange={setFilters}
            filterOptions={filterOptions}
          />
        </div>
      </div>
      
      <div className="management-content">
        {activeTab === 'overview' && (
          <VehicleTable 
            vehicles={vehicles}
            onViewDetails={(vehicle) => {
              setCurrentVehicle(vehicle);
              setIsDetailsOpen(true);
            }}
            onEdit={(vehicle) => {
              setEditingVehicle(vehicle);
              setIsAddModalOpen(true);
            }}
            onDelete={handleDeleteVehicle}
            onAssign={(vehicle) => {
              setCurrentVehicle(vehicle);
              setIsAssignModalOpen(true);
            }}
            onMaintenance={(vehicle) => {
              setCurrentVehicle(vehicle);
              setIsMaintenanceModalOpen(true);
            }}
            onDocument={(vehicle) => {
              setCurrentVehicle(vehicle);
              setIsDocumentModalOpen(true);
            }}
            viewMode={viewMode}
          />
        )}
        {activeTab === 'map' && (
          <VehicleMapView 
            vehicles={vehicles}
            onViewDetails={(vehicle) => {
              setCurrentVehicle(vehicle);
              setIsDetailsOpen(true);
            }}
            onEdit={(vehicle) => {
              setEditingVehicle(vehicle);
              setIsAddModalOpen(true);
            }}
            onDelete={handleDeleteVehicle}
            onAssign={(vehicle) => {
              setCurrentVehicle(vehicle);
              setIsAssignModalOpen(true);
            }}
            onMaintenance={(vehicle) => {
              setCurrentVehicle(vehicle);
              setIsMaintenanceModalOpen(true);
            }}
            onDocument={(vehicle) => {
              setCurrentVehicle(vehicle);
              setIsDocumentModalOpen(true);
            }}
          />
        )}
        {activeTab === 'assignments' && (
          <div>
            Assignments
          </div>
        )}
        {activeTab === 'maintenance' && (
          <div>
            Maintenance
          </div>
        )}
      </div>

      {isAddModalOpen && (
        <VehicleForm
          isOpen={isAddModalOpen}
          onClose={handleCloseForm}
          onSuccess={(savedVehicle) => {
            if (savedVehicle) {
              // If editing update existing, else push
              setVehicles(prev => {
                const exists = prev.some(v => v._id === savedVehicle._id);
                return exists ? prev.map(v => v._id === savedVehicle._id ? savedVehicle : v) : [...prev, savedVehicle];
              });
            }
          }}
          vehicle={editingVehicle}
        />
      )}

      {isDetailsOpen && (
        <VehicleDetails
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          vehicle={currentVehicle}
        />
      )}
      
      {isAssignModalOpen && (
        <AssignVehicleModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          vehicle={currentVehicle}
          workers={workers}
          zones={zones}
          onAssign={handleAssignSubmit}
        />
      )}
      
      {isMaintenanceModalOpen && (
        <MaintenanceLogModal
          isOpen={isMaintenanceModalOpen}
          onClose={() => setIsMaintenanceModalOpen(false)}
          vehicle={currentVehicle}
          onSubmit={handleMaintenanceSubmit}
        />
      )}
      
      {isDocumentModalOpen && (
        <DocumentUploadModal
          isOpen={isDocumentModalOpen}
          onClose={() => setIsDocumentModalOpen(false)}
          vehicle={currentVehicle}
          onSubmit={handleDocumentSubmit}
        />
      )}
    </div>
  );
};

export default VehicleManagementPage;