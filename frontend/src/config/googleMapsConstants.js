// Google Maps Libraries
export const GOOGLE_MAPS_LIBRARIES = ['places', 'geometry', 'drawing', 'marker'];

// Google Maps Events
export const GOOGLE_MAPS_EVENTS = {
  MARKER: {
    CLICK: 'gmp-click',
    DRAG_START: 'gmp-dragstart',
    DRAG_END: 'gmp-dragend',
    POSITION_CHANGED: 'gmp-position_changed'
  },
  MAP: {
    CLICK: 'click',
    ZOOM_CHANGED: 'zoom_changed',
    CENTER_CHANGED: 'center_changed',
    BOUNDS_CHANGED: 'bounds_changed'
  }
};

// Google Maps Options
export const GOOGLE_MAPS_OPTIONS = {
  MARKER: {
    enableAdvancedMarkers: true,
    enableCollisionBehavior: true
  },
  MAP: {
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: true,
    scaleControl: true,
    streetViewControl: false,
    rotateControl: false,
    fullscreenControl: true,
    gestureHandling: 'cooperative'
  }
}; 