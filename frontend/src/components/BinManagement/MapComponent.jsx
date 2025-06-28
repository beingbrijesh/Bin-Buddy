import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, InfoWindow } from '@react-google-maps/api';
import { Box, Paper, Typography, IconButton, Tooltip, useTheme, useMediaQuery, Alert, Button, CircularProgress, LinearProgress, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText } from '@mui/material';
import { Info as InfoIcon, MyLocation as MyLocationIcon, Search as SearchIcon } from '@mui/icons-material';
import { useMaps } from '../Maps/MapsProvider';

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 19.0760,
  lng: 72.8777 // Mumbai center
};

// Create a custom pin element
const createCustomPin = (fillPercentage = 0) => {
  const pinSvg = `
    <svg width="40" height="60" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(0,5)">
        <!-- Bin body -->
        <rect x="10" y="15" width="20" height="25" fill="#2196F3" rx="2"/>
        <!-- Bin lid -->
        <path d="M8,15 L32,15 L30,10 L10,10 Z" fill="#1976D2"/>
        <!-- Fill level background -->
        <rect x="12" y="18" width="16" height="20" fill="#ffffff" opacity="0.3"/>
        <!-- Fill level indicator -->
        <rect x="12" y="${38 - (20 * fillPercentage / 100)}" width="16" height="${20 * fillPercentage / 100}" fill="#4CAF50"/>
      </g>
    </svg>
  `;

  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(pinSvg, 'image/svg+xml');
  const svgElement = svgDoc.documentElement;

  // Set the proper size and style
  svgElement.style.transform = 'scale(1)';
  svgElement.style.transformOrigin = 'center bottom';
  svgElement.style.cursor = 'pointer';

  return svgElement;
};

// Map Loading Component
const MapLoading = function MapLoading() {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        zIndex: 1000,
      }}
    >
      <CircularProgress />
    </Box>
  );
};

const MapComponent = function MapComponent({ 
  position, 
  setPosition, 
  fillPercentage = 75,
  onLocationSelect = () => {}
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [map, setMap] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showInfoWindow, setShowInfoWindow] = useState(false);
  const [locationDialog, setLocationDialog] = useState(null);
  const geocoder = useRef(null);
  const markerRef = useRef(null);
  const mapsConfig = useMaps();

  // Convert position array to Google Maps LatLng object
  const currentPosition = position ? { lat: position[0], lng: position[1] } : defaultCenter;

  const mapOptions = {
    ...mapsConfig.mapOptions,
    mapId: mapsConfig.mapId,
    center: currentPosition,
    zoom: 15,
    clickableIcons: false,
    disableDefaultUI: true,
    zoomControl: true,
    mapTypeControl: false,
    scaleControl: true,
    streetViewControl: false,
    rotateControl: false,
    fullscreenControl: false
  };

  const onLoad = useCallback((map) => {
    console.log('Map loaded with options:', {
      mapId: mapOptions.mapId,
      center: mapOptions.center,
      zoom: mapOptions.zoom
    });
    setMap(map);
    setIsLoading(false);
  }, [mapOptions]);

  const onUnmount = useCallback(() => {
    if (markerRef.current) {
      markerRef.current.map = null;
    }
    setMap(null);
  }, []);

  // Update or create marker
  useEffect(() => {
    const createMarker = async () => {
      if (!map || !position || !window.google) return;

      try {
        // Remove existing marker if any
        if (markerRef.current) {
          markerRef.current.map = null;
        }

        // Import the marker library
        const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
        
        // Create the marker
        const marker = new AdvancedMarkerElement({
          map,
          position: { lat: position[0], lng: position[1] },
          content: createCustomPin(fillPercentage),
          title: "Bin Location"
        });

        // Make marker draggable
        marker.draggable = true;

        // Add event listeners
        marker.addListener("dragend", () => {
          const pos = marker.position;
          setPosition([pos.lat, pos.lng]);
        });

        marker.addListener("click", () => {
          setShowInfoWindow(true);
        });

        markerRef.current = marker;
      } catch (error) {
        console.error('Error creating marker:', error);
      }
    };

    createMarker();

    return () => {
      if (markerRef.current) {
        markerRef.current.map = null;
      }
    };
  }, [map, position, fillPercentage, setPosition]);

  // Initialize geocoder
  useEffect(() => {
    if (window.google) {
      geocoder.current = new window.google.maps.Geocoder();
    }
  }, []);

  // Get address details from coordinates
  const getAddressDetails = useCallback(async (lat, lng) => {
    if (!geocoder.current) return null;

    try {
      const response = await new Promise((resolve, reject) => {
        geocoder.current.geocode(
          { location: { lat, lng } },
          (results, status) => {
            if (status === 'OK') {
              resolve(results[0]);
            } else {
              reject(new Error('Geocoding failed'));
            }
          }
        );
      });

      console.log('Got address details:', response);

      // Parse address components
      const addressData = {
        fullAddress: response.formatted_address,
        coordinates: [lat, lng],
        streetAddress: '',
        locality: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
        landmark: '',
        area: '',
      };

      // Map Google address components to our form fields
      response.address_components.forEach(component => {
        const types = component.types;
        
        if (types.includes('street_number')) {
          addressData.streetAddress = component.long_name + ' ';
        }
        if (types.includes('route')) {
          addressData.streetAddress += component.long_name;
        }
        if (types.includes('sublocality_level_1')) {
          addressData.locality = component.long_name;
        }
        if (types.includes('locality')) {
          addressData.city = component.long_name;
        }
        if (types.includes('administrative_area_level_1')) {
          addressData.state = component.long_name;
        }
        if (types.includes('country')) {
          addressData.country = component.long_name;
        }
        if (types.includes('postal_code')) {
          addressData.postalCode = component.long_name;
        }
        if (types.includes('neighborhood')) {
          addressData.area = component.long_name;
        }
        if (types.includes('point_of_interest')) {
          addressData.landmark = component.long_name;
        }
      });

      // If street address wasn't found in components, use the first line of formatted address
      if (!addressData.streetAddress) {
        const firstLine = response.formatted_address.split(',')[0];
        addressData.streetAddress = firstLine;
      }

      // If locality wasn't found, try to use neighborhood or sublocality
      if (!addressData.locality && addressData.area) {
        addressData.locality = addressData.area;
      }

      return addressData;
    } catch (error) {
      console.error('Error getting address details:', error);
      return null;
    }
  }, []);

  // Handle using current location
  const handleUseLocation = async () => {
    if (locationDialog) {
      try {
        const addressDetails = await getAddressDetails(
          locationDialog.coordinates[0],
          locationDialog.coordinates[1]
        );

        if (addressDetails) {
          onLocationSelect(addressDetails);
          setLocationDialog(null);
        } else {
          setError('Failed to get address details for this location');
        }
      } catch (error) {
        console.error('Error handling location:', error);
        setError('Failed to process location data');
      }
    }
  };

  // Handle current location with high accuracy
  const handleCurrentLocation = useCallback(() => {
    setIsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log('Got current location:', { latitude, longitude });
          
          // Get address details
          const addressData = await getAddressDetails(latitude, longitude);
          console.log('Got address details:', addressData);
          
          if (addressData) {
            setLocationDialog(addressData);
          } else {
            setError('Could not get address details for this location');
          }

          if (map) {
            map.panTo({ lat: latitude, lng: longitude });
            map.setZoom(18);
          }
          setIsLoading(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setError('Error getting current location. Please try again.');
          setIsLoading(false);
        },
        { 
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
      setIsLoading(false);
    }
  }, [map, getAddressDetails]);

  // Handle location search
  const handleSearch = useCallback(async () => {
    const address = prompt('Enter location (e.g., "Mumbai Central Station"):');
    if (!address) return;

    setIsLoading(true);
    try {
      const geocoder = new window.google.maps.Geocoder();
      const result = await new Promise((resolve, reject) => {
        geocoder.geocode({ address }, (results, status) => {
          if (status === 'OK') {
            resolve(results[0]);
          } else {
            reject(new Error('Location not found'));
          }
        });
      });

      const { lat, lng } = result.geometry.location;
      setPosition([lat(), lng()]);
      if (map) {
        map.panTo({ lat: lat(), lng: lng() });
        map.setZoom(16);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [map, setPosition]);

  if (error) {
    return (
      <Alert 
        severity="error" 
        action={
          <Button color="inherit" size="small" onClick={() => setError(null)}>
            Retry
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      {isLoading && <MapLoading />}
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={currentPosition}
        zoom={15}
          onLoad={onLoad}
          onUnmount={onUnmount}
        options={mapOptions}
          onClick={(e) => {
          if (!e.latLng) return;
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            setPosition([lat, lng]);
          getAddressDetails(lat, lng).then(addressData => {
            if (addressData) {
              onLocationSelect(addressData);
            }
          });
          }}
        >
          {position && showInfoWindow && (
            <InfoWindow
              position={{ lat: position[0], lng: position[1] }}
              onCloseClick={() => setShowInfoWindow(false)}
            >
              <Box sx={{ p: 1, minWidth: 150 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Bin Fill Level
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={fillPercentage} 
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: fillPercentage > 80 ? '#f44336' : fillPercentage > 50 ? '#ff9800' : '#4caf50',
                      borderRadius: 5,
                    }
                  }}
                />
                <Typography variant="caption" sx={{ mt: 1, display: 'block', textAlign: 'right' }}>
                  {fillPercentage}% Full
                </Typography>
              </Box>
            </InfoWindow>
          )}
        </GoogleMap>

        {/* Control Buttons */}
        <Button
          variant="contained"
          startIcon={isLoading ? <CircularProgress size={20} /> : <MyLocationIcon />}
          onClick={handleCurrentLocation}
          disabled={isLoading}
          sx={{
            position: 'absolute',
            top: 10,
            right: 140,
            zIndex: 1000,
            backgroundColor: 'white',
            color: 'black',
            '&:hover': {
              backgroundColor: '#f5f5f5',
            },
          }}
        >
          {isLoading ? 'Locating...' : 'My Location'}
        </Button>

        <Button
          variant="contained"
          startIcon={isLoading ? <CircularProgress size={20} /> : <SearchIcon />}
          onClick={handleSearch}
          disabled={isLoading}
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 1000,
            backgroundColor: 'white',
            color: 'black',
            '&:hover': {
              backgroundColor: '#f5f5f5',
            },
          }}
        >
          {isLoading ? 'Searching...' : 'Search'}
        </Button>

      {/* Location Confirmation Dialog */}
      <Dialog
        open={Boolean(locationDialog)}
        onClose={() => setLocationDialog(null)}
        aria-labelledby="location-dialog-title"
      >
        <DialogTitle id="location-dialog-title">
          Use This Location?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Would you like to use this location for the bin?
          </DialogContentText>
          <Typography variant="body2" sx={{ mt: 2, fontWeight: 'bold' }}>
            Address:
          </Typography>
          <Typography variant="body2">
            {locationDialog?.fullAddress}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLocationDialog(null)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleUseLocation} color="primary" variant="contained">
            Use This Location
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default React.memo(MapComponent); 