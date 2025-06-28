import React, { useCallback, useState } from 'react';
import { GoogleMap, useLoadScript } from '@react-google-maps/api';
import { MapPin } from 'lucide-react';
import './Maps.css';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 28.6139,  // Default to Delhi, India - adjust as needed
  lng: 77.2090,
};

const options = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: true,
  streetViewControl: false,
  mapId: import.meta.env.VITE_GOOGLE_MAP_ID
};

const BinLocationMap = ({ bins }) => {
  const [selectedBin, setSelectedBin] = useState(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['marker'],
  });

  const onMapClick = useCallback(() => {
    setSelectedBin(null);
  }, []);

  const getFillLevelColor = (level) => {
    if (level >= 90) return '#dc3545';  // Critical
    if (level >= 75) return '#ffc107';  // Warning
    if (level >= 50) return '#17a2b8';  // Moderate
    return '#4CAF50';  // Good
  };

  // Function to create the marker content
  const createMarkerContent = (bin) => {
    const color = getFillLevelColor(bin.fillLevel);
    const div = document.createElement('div');
    div.innerHTML = `
      <div style="
        width: 20px;
        height: 20px;
        background-color: ${color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      "></div>
    `;
    return div;
  };

  // Function to create info window content
  const createInfoWindowContent = (bin) => {
    const div = document.createElement('div');
    div.className = 'bin-info';
    div.innerHTML = `
      <h3>${bin.id}</h3>
      <div class="info-row">
        <strong>Location:</strong>
        <span>${bin.location}</span>
      </div>
      <div class="info-row">
        <strong>Type:</strong>
        <span>${bin.type}</span>
      </div>
      <div class="info-row">
        <strong>Status:</strong>
        <span class="status-badge ${bin.status}">${bin.status}</span>
      </div>
      <div class="info-row">
        <strong>Fill Level:</strong>
        <div class="fill-level-indicator">
          <div class="fill-bar" style="width: ${bin.fillLevel}%; background-color: ${getFillLevelColor(bin.fillLevel)}"></div>
          <span>${bin.fillLevel}%</span>
        </div>
      </div>
      <div class="info-row">
        <strong>Last Emptied:</strong>
        <span>${bin.lastEmptied}</span>
      </div>
    `;
    return div;
  };

  // Function to create and add markers
  const createMarkers = useCallback(() => {
    if (!map || !window.google) return;

    // Clear existing markers
    markers.forEach(marker => marker.map = null);

    // Create new markers
    const newMarkers = bins.map(bin => {
      // In a real application, each bin would have lat/lng coordinates
      // For demo, we'll generate random positions around the center
      const position = {
        lat: defaultCenter.lat + (Math.random() - 0.5) * 0.1,
        lng: defaultCenter.lng + (Math.random() - 0.5) * 0.1,
      };

      const marker = new window.google.maps.marker.AdvancedMarkerElement({
        map,
        position,
        content: createMarkerContent(bin),
        title: bin.id,
      });

      marker.addListener('click', () => {
        // Close any existing info window
        if (selectedBin) {
          selectedBin.infoWindow?.close();
        }

        // Create and open new info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: createInfoWindowContent(bin),
        });
        infoWindow.open(map, marker);
        setSelectedBin({ ...bin, infoWindow });
      });

      return marker;
    });

    setMarkers(newMarkers);
  }, [map, bins, selectedBin]);

  // Effect to create markers when map or bins change
  React.useEffect(() => {
    createMarkers();
  }, [map, bins, createMarkers]);

  if (loadError) {
    return (
      <div className="map-error">
        <MapPin size={32} />
        <h3>Error loading map</h3>
        <p>Please check your internet connection and try again</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="map-loading">
        <div className="loading-spinner"></div>
        <p>Loading map...</p>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      zoom={12}
      center={defaultCenter}
      options={options}
      onClick={onMapClick}
      onLoad={setMap}
    />
  );
};

export default BinLocationMap; 