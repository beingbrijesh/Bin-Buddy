import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GoogleMap, LoadScript, Polygon } from '@react-google-maps/api';
import { createClusters, calculateOptimalRoute, isPointInGeofence } from '../../utils/geospatial';
import { GOOGLE_MAPS_CONFIG } from '../../config/maps';
import { GOOGLE_MAPS_LIBRARIES, GOOGLE_MAPS_EVENTS } from '../../config/googleMapsConstants';
import BinMarker from './BinMarker';
import GoogleMapsChecker from './GoogleMapsChecker';
import Loading from '../common/Loading';

const containerStyle = {
  width: '100%',
  height: '600px',
  borderRadius: '0.75rem',
};

// Polygon styles - moved outside component to prevent re-creation
const geofenceOptions = {
  fillOpacity: 0.1,
  strokeOpacity: 0.8,
  strokeWeight: 2,
};

const routeOptions = {
  strokeOpacity: 1,
  strokeWeight: 3,
  icons: [{
    icon: {
      path: 1, // Using numeric constant for SymbolPath.FORWARD_CLOSED_ARROW
    },
    offset: '100%',
    repeat: '100px'
  }]
};

const BinMap = ({ bins = [], geofences = [], onBinClick, showOptimalRoute = false }) => {
  const [map, setMap] = useState(null);
  const [clusters, setClusters] = useState([]);
  const [optimizedRoute, setOptimizedRoute] = useState([]);
  const [mapCenter, setMapCenter] = useState(GOOGLE_MAPS_CONFIG.defaultCenter);
  const [zoom, setZoom] = useState(GOOGLE_MAPS_CONFIG.defaultZoom);
  const [loadError, setLoadError] = useState(null);

  // Memoize map options with Map ID
  const mapOptions = useMemo(() => ({
    ...GOOGLE_MAPS_CONFIG.markerOptions,
    ...GOOGLE_MAPS_CONFIG.mapOptions,
    mapId: GOOGLE_MAPS_CONFIG.mapId, // Ensure Map ID is set for advanced markers
  }), []);

  // Create clusters when bins or zoom changes
  useEffect(() => {
    if (bins.length > 0) {
      const radius = Math.max(0.1, 2 / Math.pow(2, zoom)); // Adjust radius based on zoom level
      const newClusters = createClusters(bins, radius);
      setClusters(newClusters);
    }
  }, [bins, zoom]);

  // Calculate optimal route if enabled
  useEffect(() => {
    if (showOptimalRoute && bins.length > 0) {
      // Use the first bin as starting point or current location
      const startPoint = bins[0].location.coordinates;
      const route = calculateOptimalRoute(bins, startPoint);
      setOptimizedRoute(route);
    }
  }, [bins, showOptimalRoute]);

  const onLoad = useCallback((map) => {
    // Ensure Map ID is set after map loads
    if (map && GOOGLE_MAPS_CONFIG.mapId) {
      map.setMapId(GOOGLE_MAPS_CONFIG.mapId);
    }
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const onZoomChanged = useCallback(() => {
    if (map) {
      setZoom(map.getZoom());
    }
  }, [map]);

  // Handle cluster click
  const handleClusterClick = useCallback((cluster) => {
    setMapCenter({
      lat: cluster.center[1],
      lng: cluster.center[0]
    });
    setZoom((prevZoom) => prevZoom + 2);
  }, []);

  // Handle load error
  const handleLoadError = useCallback((error) => {
    console.error('Google Maps load error:', error);
    setLoadError(error);
  }, []);

  // Memoize cluster markers to prevent unnecessary re-renders
  const clusterMarkers = useMemo(() => (
    clusters.map((cluster, index) => (
      <BinMarker
        key={`cluster-${index}`}
        bin={cluster.bins[0]}
        position={{
          lat: cluster.center[1],
          lng: cluster.center[0]
        }}
        map={map}
        onClick={() => cluster.count === 1 ? onBinClick?.(cluster.bins[0]) : handleClusterClick(cluster)}
        isCluster={cluster.count > 1}
        clusterCount={cluster.count}
      />
    ))
  ), [clusters, map, onBinClick, handleClusterClick]);

  // Memoize geofence polygons
  const geofencePolygons = useMemo(() => (
    geofences.map((fence, index) => (
      <Polygon
        key={`fence-${index}`}
        paths={fence.coordinates.map(coord => ({
          lat: coord[1],
          lng: coord[0]
        }))}
        options={geofenceOptions}
      />
    ))
  ), [geofences]);

  // Memoize optimal route polygon
  const routePolygon = useMemo(() => {
    if (!showOptimalRoute || optimizedRoute.length <= 1) return null;

    return (
      <Polygon
        paths={optimizedRoute.map(bin => ({
          lat: bin.location.coordinates[1],
          lng: bin.location.coordinates[0]
        }))}
        options={routeOptions}
      />
    );
  }, [showOptimalRoute, optimizedRoute]);

  // Show configuration checker if there's a load error
  if (loadError) {
    return <GoogleMapsChecker />;
  }

  return (
    <LoadScript
      googleMapsApiKey={GOOGLE_MAPS_CONFIG.apiKey}
      libraries={GOOGLE_MAPS_LIBRARIES}
      loadingElement={<Loading fullScreen />}
      onError={handleLoadError}
    >
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onZoomChanged={onZoomChanged}
        options={mapOptions}
      >
        {clusterMarkers}
        {geofencePolygons}
        {routePolygon}
      </GoogleMap>
    </LoadScript>
  );
};

export default React.memo(BinMap); 