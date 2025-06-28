import React from 'react';
import { Box, Container, useTheme, useMediaQuery } from '@mui/material';

const ResponsiveWrapper = ({ children, maxWidth = 'lg', padding = 4 }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Container maxWidth={maxWidth}>
      <Box
        sx={{
          padding: isMobile ? 2 : padding,
          width: '100%',
          minHeight: '100%',
          borderRadius: 2,
          backgroundColor: 'background.paper',
          boxShadow: theme.shadows[1],
          transition: 'all 0.3s ease-in-out',
        }}
      >
        {children}
      </Box>
    </Container>
  );
};

export default ResponsiveWrapper; 