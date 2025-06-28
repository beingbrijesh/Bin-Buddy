import React, { useEffect, useRef, useCallback } from 'react';
import { GOOGLE_MAPS_EVENTS } from '../../config/googleMapsConstants';

const BinMarker = ({ bin, position, map, onClick, isCluster, clusterCount }) => {
  const markerRef = useRef(null);
  const infoWindowRef = useRef(null);
  const markerContentRef = useRef(null);

  // Create marker content
  const createMarkerContent = useCallback(() => {
    const div = document.createElement('div');
    div.className = 'bin-marker';
    
    div.innerHTML = `
      <div class="marker-content" style="
        width: ${isCluster ? '30px' : '20px'};
        height: ${isCluster ? '30px' : '20px'};
        background-color: ${getBinStatusColor(bin.status)};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${isCluster ? '12px' : '10px'};
        color: white;
        font-weight: bold;
        transition: transform 0.2s ease-in-out;
      ">
        ${isCluster ? clusterCount : ''}
      </div>
    `;

    markerContentRef.current = div.querySelector('.marker-content');
    return div;
  }, [bin.status, isCluster, clusterCount]);

  // Create info window content
  const createInfoWindowContent = useCallback(() => {
    const content = document.createElement('div');
    content.className = 'bin-info-window';
    content.innerHTML = `
      <div class="info-window-content" style="
        padding: 12px;
        max-width: 200px;
      ">
        <h3 style="
          margin: 0 0 8px;
          font-size: 16px;
          font-weight: 600;
        ">Bin #${bin.binId}</h3>
        <div style="
          display: flex;
          align-items: center;
          margin-bottom: 4px;
        ">
          <span style="
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background-color: ${getBinStatusColor(bin.status)};
            margin-right: 8px;
          "></span>
          <span style="text-transform: capitalize;">${bin.status}</span>
        </div>
        <p style="
          margin: 4px 0;
          font-size: 14px;
        ">${bin.address}</p>
        <p style="
          margin: 4px 0;
          font-size: 14px;
        ">Capacity: ${bin.capacity}%</p>
      </div>
    `;
    return content;
  }, [bin]);

  // Handle hover events
  const handleHoverEvents = useCallback(() => {
    if (!markerContentRef.current) return;

    const handleMouseEnter = () => {
      if (markerContentRef.current) {
        markerContentRef.current.style.transform = 'scale(1.1)';
      }
    };

    const handleMouseLeave = () => {
      if (markerContentRef.current) {
        markerContentRef.current.style.transform = 'scale(1)';
      }
    };

    markerContentRef.current.addEventListener('mouseenter', handleMouseEnter);
    markerContentRef.current.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      if (markerContentRef.current) {
        markerContentRef.current.removeEventListener('mouseenter', handleMouseEnter);
        markerContentRef.current.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  useEffect(() => {
    if (!map || !position) return;

    // Create marker
    const marker = new google.maps.marker.AdvancedMarkerElement({
      position,
      map,
      content: createMarkerContent(),
      title: `Bin #${bin.binId}`,
      gmpClickable: true,
    });

    // Create info window
    const infoWindow = new google.maps.InfoWindow({
      content: createInfoWindowContent(),
      pixelOffset: new google.maps.Size(0, -10)
    });

    // Add click event listener
    const handleClick = () => {
      if (isCluster) {
        onClick?.();
      } else {
        // Close any open info windows first
        if (infoWindowRef.current) {
          infoWindowRef.current.close();
        }
        infoWindow.open({
          map,
          anchor: marker
        });
      }
    };

    marker.addEventListener(GOOGLE_MAPS_EVENTS.MARKER.CLICK, handleClick);

    // Set up hover events
    const cleanupHover = handleHoverEvents();

    // Store refs
    markerRef.current = marker;
    infoWindowRef.current = infoWindow;

    // Cleanup
    return () => {
      if (markerRef.current) {
        markerRef.current.removeEventListener(GOOGLE_MAPS_EVENTS.MARKER.CLICK, handleClick);
        markerRef.current.map = null;
      }
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }
      if (cleanupHover) {
        cleanupHover();
      }
    };
  }, [map, position, bin, isCluster, onClick, createMarkerContent, createInfoWindowContent, handleHoverEvents]);

  return null; // This is a wrapper component, no need to render anything
};

// Helper function to get marker color based on bin status
const getBinStatusColor = (status) => {
  switch (status) {
    case 'empty':
      return '#10B981'; // Green
    case 'partial':
      return '#F59E0B'; // Yellow
    case 'full':
      return '#EF4444'; // Red
    case 'maintenance':
      return '#6B7280'; // Gray
    default:
      return '#10B981';
  }
};

export default React.memo(BinMarker); 