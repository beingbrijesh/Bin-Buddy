import React, { createContext, useContext } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { Wrapper } from '@googlemaps/react-wrapper';
import { GOOGLE_MAPS_CONFIG } from '../../config/maps';

const MapsContext = createContext(null);

const render = (status) => {
  if (status === 'LOADING') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }
  if (status === 'FAILURE') {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Error loading Google Maps</Typography>
      </Box>
    );
  }
  return null;
};

export const MapsProvider = ({ children }) => {
  return (
    <Wrapper
      apiKey={GOOGLE_MAPS_CONFIG.apiKey}
      version={GOOGLE_MAPS_CONFIG.version}
      libraries={GOOGLE_MAPS_CONFIG.libraries}
      render={render}
    >
      <MapsContext.Provider value={GOOGLE_MAPS_CONFIG}>
        {children}
      </MapsContext.Provider>
    </Wrapper>
  );
};

export const useMaps = () => {
  const context = useContext(MapsContext);
  if (context === null) {
    throw new Error('useMaps must be used within a MapsProvider');
  }
  return context;
};

export default MapsProvider; 