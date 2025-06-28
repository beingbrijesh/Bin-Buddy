import React, { useState } from 'react';
import {
  Box,
  Button,
  Avatar,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  styled,
  keyframes,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Phone as PhoneIcon,
  Message as MessageIcon,
  Report as ReportIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Chat as ChatIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Animation for emergency button
const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
  100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
`;

const StyledEmergencyButton = styled(Button)(({ theme }) => ({
  animation: `${pulse} 2s infinite`,
  '&:hover': {
    animation: 'none',
    transform: 'scale(1.05)',
  },
  transition: 'all 0.3s ease',
  fontWeight: 600,
  letterSpacing: '0.5px',
  borderRadius: '8px',
  padding: '8px 16px',
  boxShadow: theme.shadows[2],
}));

const ProfileContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  cursor: 'pointer',
  padding: '8px 12px',
  borderRadius: '8px',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const WorkerHeader = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [emergencyDialog, setEmergencyDialog] = useState(false);
  
  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/signin');
  };

  const handleEmergencyAction = (action) => {
    // Implement emergency actions based on type
    switch (action) {
      case 'call':
        window.location.href = 'tel:+1234567890'; // Replace with actual admin number
        break;
      case 'sms':
        window.location.href = 'sms:+1234567890'; // Replace with actual admin number
        break;
      case 'report':
        // Implement injury report functionality
        break;
      case 'chat':
        // Implement live chat functionality
        break;
      default:
        break;
    }
    setEmergencyDialog(false);
  };

  return (
    <Box
      className="MuiBox-root css-3gcgdj"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        p: 2,
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[1],
        position: 'sticky',
        top: 0,
        zIndex: theme.zIndex.appBar,
      }}
    >
      {/* Emergency Help Button */}
      <StyledEmergencyButton
        variant="contained"
        color="error"
        startIcon={<WarningIcon />}
        onClick={() => setEmergencyDialog(true)}
        sx={{ 
          mr: 'auto',
          '& .MuiButton-startIcon': {
            marginRight: '6px'
          }
        }}
      >
        Emergency Help
      </StyledEmergencyButton>

      {/* Profile Section */}
      <ProfileContainer onClick={handleProfileClick}>
        <Avatar 
          src={user?.avatar}
          sx={{ 
            width: 40, 
            height: 40,
            border: `2px solid ${theme.palette.primary.main}` 
          }}
        >
          <PersonIcon />
        </Avatar>
        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
          <Typography variant="subtitle1" fontWeight={600}>
            {user?.name}
          </Typography>
          <Typography variant="body2" color="textSecondary" fontSize={12}>
            {user?.role} • Zone {user?.zone}
          </Typography>
        </Box>
      </ProfileContainer>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileClose}
        PaperProps={{
          sx: { 
            width: 220, 
            mt: 1,
            boxShadow: theme.shadows[3],
            '& .MuiMenuItem-root': {
              fontSize: '0.875rem',
              padding: '8px 16px'
            }
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => {
          handleProfileClose();
          navigate('/worker/profile');
        }}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>My Profile</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ color: 'error' }}>
            Sign Out
          </ListItemText>
        </MenuItem>
      </Menu>

      {/* Emergency Dialog */}
      <Dialog
        open={emergencyDialog}
        onClose={() => setEmergencyDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            bgcolor: 'error.main', 
            color: 'error.contrastText',
            py: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <WarningIcon />
          <span>Emergency Help</span>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <List disablePadding>
            <ListItem 
              button 
              onClick={() => handleEmergencyAction('call')}
              sx={{ '&:hover': { bgcolor: 'action.hover' } }}
            >
              <ListItemIcon>
                <PhoneIcon color="error" />
              </ListItemIcon>
              <ListItemText 
                primary="Call Admin" 
                secondary="Immediate voice assistance" 
              />
            </ListItem>
            <ListItem 
              button 
              onClick={() => handleEmergencyAction('sms')}
              sx={{ '&:hover': { bgcolor: 'action.hover' } }}
            >
              <ListItemIcon>
                <MessageIcon color="error" />
              </ListItemIcon>
              <ListItemText 
                primary="SMS Emergency" 
                secondary="Send urgent text message" 
              />
            </ListItem>
            <ListItem 
              button 
              onClick={() => handleEmergencyAction('report')}
              sx={{ '&:hover': { bgcolor: 'action.hover' } }}
            >
              <ListItemIcon>
                <ReportIcon color="error" />
              </ListItemIcon>
              <ListItemText 
                primary="Report Injury" 
                secondary="File an incident report" 
              />
            </ListItem>
            <ListItem 
              button 
              onClick={() => handleEmergencyAction('chat')}
              sx={{ '&:hover': { bgcolor: 'action.hover' } }}
            >
              <ListItemIcon>
                <ChatIcon color="error" />
              </ListItemIcon>
              <ListItemText 
                primary="Live Chat" 
                secondary="Chat with support team" 
              />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setEmergencyDialog(false)}
            variant="outlined"
            color="inherit"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkerHeader; 