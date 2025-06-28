import React from 'react';
import DashboardMapView from '../../components/Dashboard/DashboardMapView';
import './MapView.css';

const MapView = () => {
  return (
    <div className="map-view-page">
      <div className="map-view-header">
        <h1>Map View</h1>
        <p>View and monitor all bins and workers in real-time</p>
      </div>
      <div className="map-view-container">
        <DashboardMapView />
      </div>
    </div>
  );
};

export default MapView; 