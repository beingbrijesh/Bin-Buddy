import { GOOGLE_MAPS_LIBRARIES, GOOGLE_MAPS_OPTIONS } from './googleMapsConstants';

// Google Maps configuration
export const GOOGLE_MAPS_CONFIG = {
  apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID,
  version: 'beta',
  libraries: ['marker', 'places', 'geometry'],
  defaultCenter: {
    lat: 20.5937, // Center of India
    lng: 78.9629
  },
  defaultZoom: 5,
  mapOptions: {
    mapTypeControl: false,
    fullscreenControl: false,
    streetViewControl: false,
    zoomControl: true,
    styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      }
    ]
  }
}; 