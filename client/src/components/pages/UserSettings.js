import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  Switch, 
  FormControlLabel,
  Divider,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import { AuthContext } from '../../App';

const UserSettings = () => {
  const { user, setUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState({
    receiveWeeklyReports: user?.receiveWeeklyReports ?? true
  });

  // Reset success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleToggleChange = (event) => {
    setSettings({
      ...settings,
      [event.target.name]: event.target.checked
    });
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await axios.put('/api/users/settings', settings);
      
      // Update user in context
      if (response.data.user) {
        // Update local storage
        localStorage.setItem('user', JSON.stringify(response.data.user));
        // Update context
        setUser(response.data.user);
      }
      
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          User Settings
        </Typography>
        
        <Divider sx={{ my: 3 }} />
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Settings updated successfully!
          </Alert>
        )}
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Email Notifications
          </Typography>
          
          <FormControlLabel
            control={
              <Switch
                checked={settings.receiveWeeklyReports}
                onChange={handleToggleChange}
                name="receiveWeeklyReports"
                color="primary"
              />
            }
            label="Receive weekly report emails every Friday"
          />
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            When enabled, you will receive an email every Friday at 6:00 PM with a summary of support cases from the week.
          </Typography>
        </Box>
        
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveSettings}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            Save Settings
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default UserSettings; 