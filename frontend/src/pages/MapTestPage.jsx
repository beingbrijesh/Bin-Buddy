import React from 'react';
import MapTest from '../components/Maps/MapTest';
import DashboardMap from '../components/Maps/DashboardMap';

const MapTestPage = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Map Integration Test</h2>
      
      {/* Test component to verify API key */}
      <MapTest />
      
      {/* Test the actual map component */}
      <div style={{ height: '400px', marginTop: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <DashboardMap />
      </div>
    </div>
  );
};

export default MapTestPage; 