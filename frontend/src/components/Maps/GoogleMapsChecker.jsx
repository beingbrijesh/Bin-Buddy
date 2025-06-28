import React, { useEffect, useState } from 'react';
import { GOOGLE_MAPS_CONFIG } from '../../config/maps';

const GoogleMapsChecker = () => {
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    const checkConfiguration = () => {
      const newErrors = [];

      // Check if API key is configured
      if (!GOOGLE_MAPS_CONFIG.apiKey) {
        newErrors.push({
          type: 'error',
          message: 'Google Maps API key is missing.',
          fix: `Add VITE_GOOGLE_MAPS_API_KEY to your .env file:
          VITE_GOOGLE_MAPS_API_KEY=your_api_key_here`
        });
      }

      // Check if the API key is valid (basic format check)
      if (GOOGLE_MAPS_CONFIG.apiKey && !GOOGLE_MAPS_CONFIG.apiKey.match(/^[A-Za-z0-9_-]+$/)) {
        newErrors.push({
          type: 'error',
          message: 'Google Maps API key format appears invalid.',
          fix: 'Ensure you\'ve copied the correct API key from Google Cloud Console.'
        });
      }

      setErrors(newErrors);
    };

    checkConfiguration();
  }, []);

  if (errors.length === 0) return null;

  return (
    <div className="google-maps-checker" style={{
      padding: '20px',
      margin: '20px',
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    }}>
      <h2 style={{
        color: '#DC2626',
        marginBottom: '16px',
        fontSize: '1.5rem',
        fontWeight: '600',
      }}>
        Google Maps Configuration Issues
      </h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '8px', fontWeight: '500' }}>Quick Fix Steps:</h3>
        <ol style={{ paddingLeft: '20px' }}>
          <li>Create a <code>.env</code> file in your frontend directory</li>
          <li>Add your Google Maps API configuration</li>
          <li>Restart your development server</li>
          <li>Enable required APIs in Google Cloud Console</li>
        </ol>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '8px', fontWeight: '500' }}>Required Environment Variables:</h3>
        <pre style={{
          backgroundColor: '#F3F4F6',
          padding: '12px',
          borderRadius: '4px',
          overflowX: 'auto',
        }}>
{`# .env file
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here`}
        </pre>
      </div>

      <div>
        <h3 style={{ marginBottom: '8px', fontWeight: '500' }}>Detected Issues:</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {errors.map((error, index) => (
            <li key={index} style={{
              marginBottom: '12px',
              padding: '12px',
              backgroundColor: error.type === 'error' ? '#FEE2E2' : '#FEF3C7',
              borderRadius: '4px',
            }}>
              <div style={{
                color: error.type === 'error' ? '#DC2626' : '#D97706',
                fontWeight: '500',
                marginBottom: '4px',
              }}>
                {error.message}
              </div>
              <div style={{
                fontFamily: 'monospace',
                backgroundColor: '#FFF',
                padding: '8px',
                borderRadius: '4px',
                marginTop: '8px',
              }}>
                {error.fix}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: '20px', fontSize: '0.875rem', color: '#6B7280' }}>
        <p>For more help, visit the <a
          href="https://console.cloud.google.com/google/maps-apis/credentials"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#2563EB', textDecoration: 'underline' }}
        >
          Google Cloud Console
        </a></p>
      </div>
    </div>
  );
};

export default GoogleMapsChecker; 