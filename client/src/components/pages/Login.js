import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';
import LoginForm from '../auth/LoginForm';

const Login = () => {
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
            Sign In
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
            Enter your credentials to access your account
          </Typography>
          <LoginForm />
        </Paper>
      </Container>
    </Box>
  );
};

export default Login; 