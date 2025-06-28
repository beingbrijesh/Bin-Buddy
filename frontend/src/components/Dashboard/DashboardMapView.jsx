import React, { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMaps } from '../Maps/MapsProvider';
import api from '../../utils/axios';

const MapComponent = ({ bins, onMarkerClick }) => {
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
    if (!mapInstanceRef.current || !bins || !window.google) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      if (marker) {
        marker.setMap(null);
      }
    });
    markersRef.current = [];

    // Add new markers
    bins.forEach(bin => {
      if (!bin.location?.coordinates) return;

      const position = {
        lat: bin.location.coordinates[1],
        lng: bin.location.coordinates[0]
      };

      // Create marker element
      const markerElement = document.createElement('div');
      markerElement.className = 'custom-marker';
      markerElement.innerHTML = `
        <div style="
          background-color: ${getStatusColor(bin.status)};
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
          ${getStatusIcon(bin.status)}
          ${bin.status !== 'maintenance' ? `
            <div style="
              position: absolute;
              bottom: -20px;
              left: 50%;
              transform: translateX(-50%);
              background-color: ${getStatusColor(bin.status)};
              color: white;
              padding: 2px 6px;
              border-radius: 10px;
              font-size: 10px;
              white-space: nowrap;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            ">
              ${bin.currentCapacity}%
            </div>
          ` : ''}
        </div>
      `;

      try {
        // Create marker
        const marker = new window.google.maps.marker.AdvancedMarkerElement({
          map: mapInstanceRef.current,
          position: position,
          content: markerElement,
          title: `Bin ID: ${bin.binId}\nStatus: ${bin.status}\nType: ${bin.type}`
        });

        // Add click listener
        marker.addListener('click', () => {
          if (onMarkerClick) {
            onMarkerClick(bin);
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
  }, [bins, onMarkerClick]);

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
    empty: '#4CAF50',
    partial: '#FFA726',
    full: '#F44336',
    maintenance: '#9E9E9E'
  };
  return colors[status?.toLowerCase()] || colors.maintenance;
};

const getStatusIcon = (status) => {
  // Using UTF-8 icons for dustbin
  const icons = {
    empty: '🗑️',
    partial: '🗑️',
    full: '🗑️',
    maintenance: '⚠️'
  };
  return icons[status?.toLowerCase()] || '🗑️';
};

const DashboardMapView = () => {
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchBins = async () => {
      try {
        const response = await api.get('/bins');
        setBins(response.data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching bins:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBins();
  }, []);

  const handleMarkerClick = (bin) => {
    navigate(`/bins/${bin._id}`);
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
      <MapComponent bins={bins} onMarkerClick={handleMarkerClick} />
    </Paper>
  );
};

export default DashboardMapView; 