import React, { useState } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import Sidebar from '../Sidebar/Sidebar';
import './Layout.css';

const Layout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(isMobile);

  const handleSidebarCollapse = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };

  return (
    <Box className="layout">
      <Sidebar onCollapse={handleSidebarCollapse} isCollapsed={isSidebarCollapsed} />
      <Box 
        component="main" 
        className={`main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}
        sx={{
          backgroundColor: 'background.default',
          minHeight: '100vh',
          width: {
            xs: '100%',
            md: `calc(100% - ${isSidebarCollapsed ? '80px' : '250px'})`,
          },
          marginLeft: {
            xs: 0,
            md: isSidebarCollapsed ? '80px' : '250px',
          },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          p: {
            xs: 2,
            sm: 3,
          },
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout; 