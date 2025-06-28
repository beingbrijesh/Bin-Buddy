import React from 'react';
import './TabFilters.css';

const FilterSelect = ({ label, value, onChange, children }) => (
  <div className="filter-select">
    {label && <label>{label}</label>}
    <select value={value} onChange={onChange}>
      {children}
    </select>
  </div>
);

const OverviewFilters = ({ filters, onFilterChange, zones }) => (
  <div className="tab-filters">
    <FilterSelect 
      label="Status"
      value={filters.status}
      onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
    >
      <option value="all">All Statuses</option>
      <option value="active">Active</option>
      <option value="inactive">Inactive</option>
      <option value="maintenance">In Maintenance</option>
    </FilterSelect>

    <FilterSelect
      label="Type"
      value={filters.type}
      onChange={(e) => onFilterChange({ ...filters, type: e.target.value })}
    >
      <option value="all">All Types</option>
      <option value="truck">Trucks</option>
      <option value="van">Vans</option>
      <option value="car">Cars</option>
    </FilterSelect>

    {zones && (
      <FilterSelect
        label="Zone"
        value={filters.zone}
        onChange={(e) => onFilterChange({ ...filters, zone: e.target.value })}
      >
        <option value="all">All Zones</option>
        {zones.map(zone => (
          <option key={zone._id} value={zone._id}>{zone.name}</option>
        ))}
      </FilterSelect>
    )}
  </div>
);

const MapFilters = ({ filters, onFilterChange, zones }) => (
  <div className="tab-filters">
    <FilterSelect 
      label="Status"
      value={filters.status}
      onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
    >
      <option value="active">Active Only</option>
      <option value="all">All Vehicles</option>
    </FilterSelect>

    {zones && (
      <FilterSelect
        label="Zone"
        value={filters.zone}
        onChange={(e) => onFilterChange({ ...filters, zone: e.target.value })}
      >
        <option value="all">All Zones</option>
        {zones.map(zone => (
          <option key={zone._id} value={zone._id}>{zone.name}</option>
        ))}
      </FilterSelect>
    )}
  </div>
);

const AssignmentsFilters = ({ filters, onFilterChange, workers }) => (
  <div className="tab-filters">
    <FilterSelect 
      label="Assignment"
      value={filters.assigned}
      onChange={(e) => onFilterChange({ ...filters, assigned: e.target.value })}
    >
      <option value="all">All Assignments</option>
      <option value="assigned">Assigned Only</option>
      <option value="unassigned">Unassigned Only</option>
    </FilterSelect>

    {workers && (
      <FilterSelect
        label="Driver"
        value={filters.driver}
        onChange={(e) => onFilterChange({ ...filters, driver: e.target.value })}
      >
        <option value="all">All Drivers</option>
        {workers.filter(w => w.workerType === 'driver').map(driver => (
          <option key={driver._id} value={driver._id}>{driver.name}</option>
        ))}
      </FilterSelect>
    )}
  </div>
);

const MaintenanceFilters = ({ filters, onFilterChange }) => (
  <div className="tab-filters">
    <FilterSelect 
      label="Status"
      value={filters.status}
      onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
    >
      <option value="all">All Statuses</option>
      <option value="due">Due for Maintenance</option>
      <option value="overdue">Overdue</option>
      <option value="in-progress">In Progress</option>
    </FilterSelect>

    <FilterSelect
      label="Last Maintained"
      value={filters.lastMaintained}
      onChange={(e) => onFilterChange({ ...filters, lastMaintained: e.target.value })}
    >
      <option value="30days">Last 30 Days</option>
      <option value="60days">Last 60 Days</option>
      <option value="90days">Last 90 Days</option>
      <option value="all">All Time</option>
    </FilterSelect>
  </div>
);

export { OverviewFilters, MapFilters, AssignmentsFilters, MaintenanceFilters };
