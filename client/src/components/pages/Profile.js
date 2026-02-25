import React, { useState, useEffect, useContext, useCallback } from 'react';
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
  const [receiveDailyReports, setReceiveDailyReports] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      
      // The authorization header is automatically added by setAuthToken
      const res = await axios.get('/api/users/profile');
      
      // Update local state but keep the existing user in context
      if (res.data) {
        if (res.data.receiveWeeklyReports !== undefined) {
          setReceiveWeeklyReports(res.data.receiveWeeklyReports);
        }
        if (res.data.receiveDailyReports !== undefined) {
          setReceiveDailyReports(res.data.receiveDailyReports);
        }
        
        // Update user in context with new profile data
        setUser({ ...user, ...res.data });
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to load profile');
      setLoading(false);
    }
  }, [setUser, user]);

  useEffect(() => {
    if (user) {
      if (user.receiveWeeklyReports !== undefined) {
        setReceiveWeeklyReports(user.receiveWeeklyReports);
      }
      if (user.receiveDailyReports !== undefined) {
        setReceiveDailyReports(user.receiveDailyReports);
      }

      // If user info doesn't have report preferences, fetch it
      if (user.receiveWeeklyReports === undefined || user.receiveDailyReports === undefined) {
        fetchUserProfile();
      }
    }
  }, [fetchUserProfile, user]);

  const toggleWeeklyReports = async (event) => {
    const newValue = event.target.checked;
    setReceiveWeeklyReports(newValue);
    
    try {
      setLoading(true);
      setError('');
      setSuccess(false);

      // The authorization header is automatically added by setAuthToken
      const res = await axios.put('/api/users/profile', {
        receiveWeeklyReports: newValue,
        receiveDailyReports: receiveDailyReports
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

  const toggleDailyReports = async (event) => {
    const newValue = event.target.checked;
    setReceiveDailyReports(newValue);
    
    try {
      setLoading(true);
      setError('');
      setSuccess(false);

      // The authorization header is automatically added by setAuthToken
      const res = await axios.put('/api/users/profile', {
        receiveWeeklyReports: receiveWeeklyReports,
        receiveDailyReports: newValue
      });

      if (res.data) {
        // Update user in context with new preference
        setUser({ ...user, receiveDailyReports: newValue });
        setSuccess(true);
      }
      
      setLoading(false);
    } catch (err) {
      setError('Failed to update daily report preference');
      setLoading(false);
      // Revert the toggle if update fails
      setReceiveDailyReports(!newValue);
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
        
        <FormControlLabel
          control={
            <Switch
              checked={receiveDailyReports}
              onChange={toggleDailyReports}
              disabled={loading}
            />
          }
          label="Receive daily reports via email"
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
