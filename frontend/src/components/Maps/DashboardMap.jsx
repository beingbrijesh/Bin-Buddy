import React from 'react';
import { GoogleMap, useLoadScript } from '@react-google-maps/api';
import { MapPin } from 'lucide-react';
import './Maps.css';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '300px'
};

const defaultCenter = {
  lat: 28.6139,  // Delhi, India
  lng: 77.2090,
};

const options = {
  disableDefaultUI: true,
  zoomControl: true,
  mapId: import.meta.env.VITE_GOOGLE_MAP_ID
};

// Mock data for demonstration
const mockBins = [
  {
    id: 'BIN001',
    position: { lat: 28.6129, lng: 77.2295 },
    fillLevel: 85
  },
  {
    id: 'BIN002',
    position: { lat: 28.6219, lng: 77.2090 },
    fillLevel: 45
  },
  {
    id: 'BIN003',
    position: { lat: 28.6139, lng: 77.1990 },
    fillLevel: 95
  },
  {
    id: 'BIN004',
    position: { lat: 28.6039, lng: 77.2190 },
    fillLevel: 30
  }
];

const DashboardMap = () => {
  const [map, setMap] = React.useState(null);
  const [markers, setMarkers] = React.useState([]);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['marker'],
  });

  const getFillLevelColor = (level) => {
    if (level >= 90) return '#dc3545';  // Critical
    if (level >= 75) return '#ffc107';  // Warning
    if (level >= 50) return '#17a2b8';  // Moderate
    return '#4CAF50';  // Good
  };

  // Function to create marker content
  const createMarkerContent = (bin) => {
    const color = getFillLevelColor(bin.fillLevel);
    const div = document.createElement('div');
    div.innerHTML = `
      <div style="
        width: 16px;
        height: 16px;
        background-color: ${color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      "></div>
    `;
    return div;
  };

  // Function to create and add markers
  const createMarkers = React.useCallback(() => {
    if (!map || !window.google) return;

    // Clear existing markers
    markers.forEach(marker => marker.map = null);

    // Create new markers
    const newMarkers = mockBins.map(bin => {
      const marker = new window.google.maps.marker.AdvancedMarkerElement({
        map,
        position: bin.position,
        content: createMarkerContent(bin),
        title: bin.id,
      });

      return marker;
    });

    setMarkers(newMarkers);
  }, [map]);

  // Effect to create markers when map changes
  React.useEffect(() => {
    createMarkers();
  }, [map, createMarkers]);

  if (loadError) {
    return (
      <div className="map-error dashboard">
        <MapPin size={24} />
        <p>Error loading map</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="map-loading dashboard">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-map-container">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={13}
        center={defaultCenter}
        options={options}
        onLoad={setMap}
      />
      <div className="map-legend dashboard-legend">
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#4CAF50' }}></div>
          <span>Normal</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#17a2b8' }}></div>
          <span>Moderate</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#ffc107' }}></div>
          <span>Warning</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#dc3545' }}></div>
          <span>Critical</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardMap; 