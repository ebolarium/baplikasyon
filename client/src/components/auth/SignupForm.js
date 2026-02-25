import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Alert,
  InputAdornment,
  IconButton,
  Link,
  Typography
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { getCurrentUser } from '../../utils/auth';
import { AuthContext } from '../../App';

const SignupForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    inviteCode: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);
  
  useEffect(() => {
    // Check if user is already logged in
    const currentUser = getCurrentUser();
    if (currentUser) {
      // Redirect to dashboard if already authenticated
      navigate('/dashboard');
    }
  }, [navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      console.log('Submitting registration form with data:', formData);
      const res = await axios.post('/api/users', formData);
      console.log('Registration successful, server response:', res.data);
      
      // Store token if available
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }
      
      // Store user info in localStorage and update context
      const userData = res.data.user || res.data;
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      setLoading(false);
      navigate('/dashboard'); // Redirect to dashboard after successful signup
    } catch (err) {
      console.error('Registration error:', err.response || err);
      setError(
        err.response?.data?.msg || 
        'Failed to register. Please try again.'
      );
      setLoading(false);
    }
  };
  
  const formIsValid = 
    formData.name.trim() !== '' &&
    formData.email.trim() !== '' &&
    formData.password.trim() !== '' &&
    formData.password.length >= 6;
  
  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <TextField
        name="name"
        label="Full Name"
        value={formData.name}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
        variant="outlined"
        autoFocus
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <PersonIcon color="action" />
            </InputAdornment>
          )
        }}
      />
      
      <TextField
        name="email"
        label="Email Address"
        type="email"
        value={formData.email}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
        variant="outlined"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <EmailIcon color="action" />
            </InputAdornment>
          )
        }}
      />
      
      <TextField
        name="password"
        label="Password"
        type={showPassword ? "text" : "password"}
        value={formData.password}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
        variant="outlined"
        helperText="Password must be at least 6 characters"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LockIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={togglePasswordVisibility}
                edge="end"
              >
                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </InputAdornment>
          )
        }}
      />

      <TextField
        name="inviteCode"
        label="Invite Code (Optional)"
        value={formData.inviteCode}
        onChange={handleChange}
        fullWidth
        margin="normal"
        variant="outlined"
        helperText="If the server has invite mode enabled, this field is required."
      />
      
      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={loading || !formIsValid}
        sx={{ mt: 3, mb: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Create Account'}
      </Button>
      
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Already have an account?{' '}
          <Link component={RouterLink} to="/" variant="body2">
            Sign in
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default SignupForm; 
