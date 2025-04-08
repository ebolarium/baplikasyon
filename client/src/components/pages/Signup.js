import React from 'react';
import { Container, Typography, Paper, Box, Button } from '@mui/material';
import SignupForm from '../auth/SignupForm';
import axios from 'axios';

const Signup = () => {
  // Function to test the API connection
  const testApi = async () => {
    try {
      const response = await axios.get('/api/health');
      console.log('API Health Check:', response.data);
      alert(`API is working! Response: ${JSON.stringify(response.data)}`);
    } catch (error) {
      console.error('API Error:', error);
      alert(`API error: ${error.message}`);
    }
  };

  return (
    <Box 
      sx={{ 
        height: '100vh',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: '#f5f7fa'
      }}
    >
      <Container maxWidth="sm" sx={{ py: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 'bold',
              color: '#1976d2'
            }}
          >
            Baplikasyon
          </Typography>
          
          {/* Hidden in production, only for debugging */}
          {process.env.NODE_ENV === 'development' && (
            <Button 
              variant="outlined" 
              size="small" 
              onClick={testApi} 
              sx={{ mt: 1 }}
            >
              Test API Connection
            </Button>
          )}
        </Box>
        
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            borderRadius: 2
          }}
        >
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Create Account
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
            Fill in your details to get started
          </Typography>
          <SignupForm />
        </Paper>
      </Container>
    </Box>
  );
};

export default Signup; 