import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../App';
import axios from 'axios';
import {
  Container,
  Paper,
  Typography,
  Box,
  Switch,
  FormControlLabel,
  Alert,
  Divider,
  CircularProgress
} from '@mui/material';

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  const [receiveWeeklyReports, setReceiveWeeklyReports] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && user.receiveWeeklyReports !== undefined) {
      setReceiveWeeklyReports(user.receiveWeeklyReports);
    }

    // If user info doesn't have receiveWeeklyReports property, fetch it
    if (user && user.receiveWeeklyReports === undefined) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      
      // The authorization header is automatically added by setAuthToken
      const res = await axios.get('/api/users/profile');
      
      // Update local state but keep the existing user in context
      if (res.data && res.data.receiveWeeklyReports !== undefined) {
        setReceiveWeeklyReports(res.data.receiveWeeklyReports);
        
        // Update user in context with new profile data
        setUser({ ...user, ...res.data });
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to load profile');
      setLoading(false);
    }
  };

  const toggleWeeklyReports = async (event) => {
    const newValue = event.target.checked;
    setReceiveWeeklyReports(newValue);
    
    try {
      setLoading(true);
      setError('');
      setSuccess(false);

      // The authorization header is automatically added by setAuthToken
      const res = await axios.put('/api/users/profile', {
        receiveWeeklyReports: newValue
      });

      if (res.data) {
        // Update user in context with new preference
        setUser({ ...user, receiveWeeklyReports: newValue });
        setSuccess(true);
      }
      
      setLoading(false);
    } catch (err) {
      setError('Failed to update weekly report preference');
      setLoading(false);
      // Revert the toggle if update fails
      setReceiveWeeklyReports(!newValue);
    }
  };

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" align="center">
            Please log in to view your profile
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          User Profile
        </Typography>
        
        <Divider sx={{ mb: 3 }} />
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" gutterBottom>
            <strong>Name:</strong> {user.name}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Email:</strong> {user.email}
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Typography variant="h6" gutterBottom>
          Notifications
        </Typography>
        
        <FormControlLabel
          control={
            <Switch
              checked={receiveWeeklyReports}
              onChange={toggleWeeklyReports}
              disabled={loading}
            />
          }
          label="Receive weekly reports via email"
        />
        
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Settings updated successfully
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>
    </Container>
  );
};

export default Profile; 