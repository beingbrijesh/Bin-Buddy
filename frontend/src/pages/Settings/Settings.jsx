import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Switch,
    FormControlLabel,
    Divider,
    Button,
    TextField,
    Grid,
    Alert,
    IconButton,
    Stack
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    Language as LanguageIcon,
    DarkMode as DarkModeIcon,
    VolumeUp as SoundIcon,
    Security as SecurityIcon,
    Save as SaveIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

const Settings = () => {
    const { user } = useAuth();
    const { refreshNotifications } = useNotifications();

    const [settings, setSettings] = useState({
        notifications: {
            email: true,
            push: true,
            taskUpdates: true,
            binAlerts: true,
            systemUpdates: true
        },
        preferences: {
            darkMode: false,
            language: 'English',
            sound: true
        },
        security: {
            twoFactorAuth: false,
            sessionTimeout: '30'
        }
    });

    const [password, setPassword] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    const [saveStatus, setSaveStatus] = useState({ show: false, success: false, message: '' });

    const handleNotificationChange = (key) => (event) => {
        setSettings(prev => ({
            ...prev,
            notifications: {
                ...prev.notifications,
                [key]: event.target.checked
            }
        }));
    };

    const handlePreferenceChange = (key) => (event) => {
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        setSettings(prev => ({
            ...prev,
            preferences: {
                ...prev.preferences,
                [key]: value
            }
        }));
    };

    const handleSecurityChange = (key) => (event) => {
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        setSettings(prev => ({
            ...prev,
            security: {
                ...prev.security,
                [key]: value
            }
        }));
    };

    const handlePasswordChange = (key) => (event) => {
        setPassword(prev => ({
            ...prev,
            [key]: event.target.value
        }));
    };

    const handleSave = async () => {
        try {
            // Here you would typically make an API call to save the settings
            // For now, we'll just simulate a successful save
            await new Promise(resolve => setTimeout(resolve, 1000));
            setSaveStatus({
                show: true,
                success: true,
                message: 'Settings saved successfully!'
            });
            setTimeout(() => setSaveStatus({ show: false, success: false, message: '' }), 3000);
        } catch (error) {
            setSaveStatus({
                show: true,
                success: false,
                message: 'Failed to save settings. Please try again.'
            });
        }
    };

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', py: 3 }}>
            <Typography variant="h4" gutterBottom>
                Settings
            </Typography>

            {saveStatus.show && (
                <Alert 
                    severity={saveStatus.success ? "success" : "error"}
                    sx={{ mb: 2 }}
                >
                    {saveStatus.message}
                </Alert>
            )}

            <Stack spacing={3}>
                {/* Notification Settings */}
                <Card>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <NotificationsIcon sx={{ mr: 1 }} />
                            <Typography variant="h6">Notification Settings</Typography>
                        </Box>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={settings.notifications.email}
                                            onChange={handleNotificationChange('email')}
                                        />
                                    }
                                    label="Email Notifications"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={settings.notifications.push}
                                            onChange={handleNotificationChange('push')}
                                        />
                                    }
                                    label="Push Notifications"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={settings.notifications.taskUpdates}
                                            onChange={handleNotificationChange('taskUpdates')}
                                        />
                                    }
                                    label="Task Updates"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={settings.notifications.binAlerts}
                                            onChange={handleNotificationChange('binAlerts')}
                                        />
                                    }
                                    label="Bin Alerts"
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* Preferences */}
                <Card>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <LanguageIcon sx={{ mr: 1 }} />
                            <Typography variant="h6">Preferences</Typography>
                        </Box>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={settings.preferences.darkMode}
                                            onChange={handlePreferenceChange('darkMode')}
                                        />
                                    }
                                    label="Dark Mode"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={settings.preferences.sound}
                                            onChange={handlePreferenceChange('sound')}
                                        />
                                    }
                                    label="Sound Effects"
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* Security Settings */}
                <Card>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <SecurityIcon sx={{ mr: 1 }} />
                            <Typography variant="h6">Security Settings</Typography>
                        </Box>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={settings.security.twoFactorAuth}
                                            onChange={handleSecurityChange('twoFactorAuth')}
                                        />
                                    }
                                    label="Two-Factor Authentication"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Change Password
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            type="password"
                                            label="Current Password"
                                            value={password.current}
                                            onChange={handlePasswordChange('current')}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            type="password"
                                            label="New Password"
                                            value={password.new}
                                            onChange={handlePasswordChange('new')}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            type="password"
                                            label="Confirm New Password"
                                            value={password.confirm}
                                            onChange={handlePasswordChange('confirm')}
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* Save Button */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<SaveIcon />}
                        onClick={handleSave}
                        size="large"
                    >
                        Save Changes
                    </Button>
                </Box>
            </Stack>
        </Box>
    );
};

export default Settings; 