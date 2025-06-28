import React, { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, Typography, Paper } from '@mui/material';
import { useMaps } from '../../components/Maps/MapsProvider';
import api from '../../utils/axios';

const VehicleMapComponent = ({ vehicles, onMarkerClick }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const mapsConfig = useMaps();

  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    // Initialize map
    const map = new window.google.maps.Map(mapRef.current, {
      center: mapsConfig.defaultCenter,
      zoom: mapsConfig.defaultZoom,
      mapId: mapsConfig.mapId,
      ...mapsConfig.mapOptions
    });
    mapInstanceRef.current = map;

    // Clean up markers on unmount
    return () => {
      markersRef.current.forEach(marker => {
        if (marker) {
          marker.setMap(null);
        }
      });
      markersRef.current = [];
    };
  }, [mapsConfig]);

  useEffect(() => {
    if (!mapInstanceRef.current || !vehicles || !window.google) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      if (marker) {
        marker.setMap(null);
      }
    });
    markersRef.current = [];

    // Add new markers
    vehicles.forEach(vehicle => {
      if (!vehicle.locationHistory?.length) return;

      const latestLocation = vehicle.locationHistory[vehicle.locationHistory.length - 1];
      const position = {
        lat: latestLocation.coordinates[1],
        lng: latestLocation.coordinates[0]
      };

      // Create marker element
      const markerElement = document.createElement('div');
      markerElement.className = 'vehicle-marker';
      markerElement.innerHTML = `
        <div style="
          background-color: ${getStatusColor(vehicle.status)};
          width: 40px;
          height: 40px;
          border-radius: 8px;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 20px;
          position: relative;
        ">
          ${getVehicleIcon(vehicle.type)}
          <div style="
            position: absolute;
            bottom: -20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: ${getStatusColor(vehicle.status)};
            color: white;
            padding: 2px 6px;
            border-radius: 10px;
            font-size: 10px;
            white-space: nowrap;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          ">
            ${vehicle.registrationNumber}
          </div>
        </div>
      `;

      try {
        // Create marker
        const marker = new window.google.maps.marker.AdvancedMarkerElement({
          map: mapInstanceRef.current,
          position: position,
          content: markerElement,
          title: `Vehicle: ${vehicle.registrationNumber}\nStatus: ${vehicle.status}\nType: ${vehicle.type}`
        });

        // Add click listener
        marker.addListener('click', () => {
          if (onMarkerClick) {
            onMarkerClick(vehicle);
          }
        });

        markersRef.current.push(marker);
      } catch (error) {
        console.error('Error creating marker:', error);
      }
    });

    // Fit bounds if there are markers
    if (markersRef.current.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      markersRef.current.forEach(marker => {
        bounds.extend(marker.position);
      });
      mapInstanceRef.current.fitBounds(bounds);
    }
  }, [vehicles, onMarkerClick]);

  return (
    <Box
      ref={mapRef}
      sx={{
        width: '100%',
        height: '100%',
        minHeight: '500px',
        borderRadius: 1,
        overflow: 'hidden'
      }}
    />
  );
};

const getStatusColor = (status) => {
  const colors = {
    active: '#4CAF50',
    maintenance: '#FFA726',
    inactive: '#9E9E9E',
    assigned: '#2196F3'
  };
  return colors[status?.toLowerCase()] || colors.inactive;
};

const getVehicleIcon = (type) => {
  const icons = {
    truck: '🚛',
    van: '🚐',
    car: '🚗',
    motorcycle: '🏍️'
  };
  return icons[type?.toLowerCase()] || '🚗';
};

const VehicleMapView = ({ onVehicleSelect }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        console.log('Fetching vehicles for map...');
        const response = await api.get('/api/vehicles');
        console.log('Map API Response:', response);
        
        // Handle different response structures
        let vehicleData = [];
        
        if (Array.isArray(response.data)) {
          // Direct array response
          vehicleData = response.data;
        } else if (response.data && response.data.vehicles && Array.isArray(response.data.vehicles)) {
          // Nested vehicles in response
          vehicleData = response.data.vehicles;
        } else {
          console.error('Unexpected API response format for map:', response.data);
          vehicleData = [];
        }
        
        setVehicles(vehicleData);
      } catch (err) {
        setError(err.message || 'Failed to fetch vehicles for map');
        console.error('Error fetching vehicles for map:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();

    // Set up real-time updates
    const interval = setInterval(fetchVehicles, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleMarkerClick = (vehicle) => {
    if (onVehicleSelect) {
      onVehicleSelect(vehicle);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Error: {error}</Typography>
      </Box>
    );
  }

  return (
    <Paper elevation={2} sx={{ height: '100%', width: '100%', overflow: 'hidden', borderRadius: 2 }}>
      <VehicleMapComponent vehicles={vehicles} onMarkerClick={handleMarkerClick} />
    </Paper>
  );
};

export default VehicleMapView; 