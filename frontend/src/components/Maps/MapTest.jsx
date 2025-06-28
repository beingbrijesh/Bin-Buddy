import React from 'react';
import { useLoadScript } from '@react-google-maps/api';

const MapTest = () => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  if (loadError) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h3>Google Maps Error</h3>
        <p>Error: {loadError.message}</p>
        <p>Please check your API key and make sure it's properly configured.</p>
      </div>
    );
  }

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px', color: 'green' }}>
      <h3>Google Maps API Test</h3>
      <p>✓ API key is valid and Google Maps loaded successfully!</p>
    </div>
  );
};

export default MapTest; 