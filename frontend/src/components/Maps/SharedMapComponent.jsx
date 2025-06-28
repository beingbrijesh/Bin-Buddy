import React, { useState, useCallback } from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { Box, Paper, Typography, useTheme, useMediaQuery } from '@mui/material';

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 19.0760,
  lng: 72.8777 // Mumbai center
};

// Create a custom pin element
const createCustomPin = (type = 'bin', fillPercentage = 0) => {
  let pinSvg;
  
  switch (type) {
    case 'worker':
      pinSvg = `
        <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="16" fill="#4CAF50" />
          <circle cx="20" cy="20" r="12" fill="#81C784" />
          <path d="M15,15 L25,25 M25,15 L15,25" stroke="#FFF" stroke-width="2"/>
        </svg>
      `;
      break;
    case 'task':
      pinSvg = `
        <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
          <rect x="8" y="8" width="24" height="24" rx="4" fill="#2196F3" />
          <path d="M16,20 L19,23 L24,17" stroke="#FFF" stroke-width="2" fill="none"/>
        </svg>
      `;
      break;
    default: // bin
      pinSvg = `
        <svg width="40" height="60" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(0,5)">
            <rect x="10" y="15" width="20" height="25" fill="#2196F3" rx="2"/>
            <path d="M8,15 L32,15 L30,10 L10,10 Z" fill="#1976D2"/>
            <rect x="12" y="18" width="16" height="20" fill="#ffffff" opacity="0.3"/>
            <rect x="12" y="${38 - (20 * fillPercentage / 100)}" width="16" height="${20 * fillPercentage / 100}" fill="#4CAF50"/>
          </g>
        </svg>
      `;
  }

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(pinSvg)}`,
    scaledSize: { width: 40, height: type === 'bin' ? 60 : 40 },
    anchor: { x: 20, y: type === 'bin' ? 60 : 20 }
  };
};

const SharedMapComponent = ({
  markers = [],
  height = '400px',
  onMarkerClick,
  onMapClick,
  markerType = 'bin',
  showInfoWindow = true,
  defaultZoom = 13,
  isInteractive = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [map, setMap] = useState(null);

  const handleMarkerClick = useCallback((marker) => {
    setSelectedMarker(marker);
    if (onMarkerClick) {
      onMarkerClick(marker);
    }
  }, [onMarkerClick]);

  const handleMapClick = useCallback((e) => {
    if (onMapClick && isInteractive) {
      onMapClick({
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      });
    }
  }, [onMapClick, isInteractive]);

  const mapOptions = {
    zoomControl: true,
    mapTypeControl: true,
    scaleControl: true,
    streetViewControl: true,
    rotateControl: true,
    fullscreenControl: true,
    gestureHandling: isInteractive ? 'greedy' : 'none',
    mapId: import.meta.env.VITE_GOOGLE_MAP_ID
  };

  return (
    <Paper 
      sx={{ 
        height: isMobile ? '300px' : height,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={markers[0]?.position || defaultCenter}
        zoom={defaultZoom}
        onClick={handleMapClick}
        onLoad={setMap}
        options={mapOptions}
      >
        {markers.map((marker, index) => (
          <Marker
            key={marker.id || index}
            position={marker.position}
            icon={createCustomPin(markerType, marker.fillPercentage)}
            onClick={() => handleMarkerClick(marker)}
            draggable={isInteractive}
          />
        ))}

        {showInfoWindow && selectedMarker && (
          <InfoWindow
            position={selectedMarker.position}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <Box sx={{ p: 1, minWidth: 150 }}>
              <Typography variant="subtitle2" gutterBottom>
                {selectedMarker.title || 'Location Details'}
              </Typography>
              {selectedMarker.content && (
                <Typography variant="body2">
                  {selectedMarker.content}
                </Typography>
              )}
            </Box>
          </InfoWindow>
        )}
      </GoogleMap>
    </Paper>
  );
};

export default React.memo(SharedMapComponent); 