import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  CircularProgress,
  Paper,
  FormControlLabel,
  Switch,
  Alert,
  Card,
  CardContent,
  Divider,
  useTheme
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';

const initialState = {
  companyName: '',
  person: '',
  topic: '',
  details: '',
  status: 'open'
};

const CaseForm = () => {
  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  
  const navigate = useNavigate();
  const { id } = useParams();
  const theme = useTheme();
  
  useEffect(() => {
    if (id) {
      setIsEdit(true);
      setFetchLoading(true);
      
      const fetchCase = async () => {
        try {
          const res = await axios.get(`/api/cases/${id}`);
          const caseData = res.data;
          
          setFormData({
            companyName: caseData.companyName,
            person: caseData.person,
            topic: caseData.topic,
            details: caseData.details,
            status: caseData.status
          });
          
          setFetchLoading(false);
        } catch (err) {
          setError('Failed to fetch case details');
          setFetchLoading(false);
        }
      };
      
      fetchCase();
    }
  }, [id]);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSwitchChange = (e) => {
    setFormData({
      ...formData,
      status: e.target.checked ? 'closed' : 'open'
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isEdit) {
        await axios.put(`/api/cases/${id}`, formData);
      } else {
        await axios.post('/api/cases', formData);
      }
      
      setLoading(false);
      navigate('/');
    } catch (err) {
      setError('Failed to save case');
      setLoading(false);
    }
  };
  
  if (fetchLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{ paddingTop: '64px' }}
      >
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', paddingTop: '64px' }}>
      <Container maxWidth="md" sx={{ mt: 4, mb: 6, flexGrow: 1 }}>
        {/* Back button */}
        <Button
          component={RouterLink}
          to="/"
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 3, fontWeight: 500 }}
        >
          Back to dashboard
        </Button>
        
        {/* Form header */}
        <Card 
          elevation={0} 
          sx={{ 
            mb: 3, 
            borderRadius: 2, 
            border: '1px solid rgba(0, 0, 0, 0.08)',
            overflow: 'visible'
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography 
                variant="h5" 
                component="h1" 
                sx={{ fontWeight: 'bold' }}
              >
                {isEdit ? 'Edit Support Case' : 'New Support Case'}
              </Typography>
              {isEdit ? (
                <EditIcon color="primary" sx={{ fontSize: 28 }} />
              ) : (
                <AddIcon color="primary" sx={{ fontSize: 28 }} />
              )}
            </Box>
          </CardContent>
        </Card>
        
        {/* Form content */}
        <Card
          elevation={0}
          sx={{ 
            borderRadius: 2,
            border: '1px solid rgba(0, 0, 0, 0.08)'
          }}
        >
          <CardContent sx={{ p: 3 }}>
            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
            
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                name="companyName"
                label="Company Name"
                value={formData.companyName}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
                variant="outlined"
                sx={{ mb: 2 }}
              />
              
              <TextField
                name="person"
                label="Contact Person"
                value={formData.person}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
                variant="outlined"
                sx={{ mb: 2 }}
              />
              
              <TextField
                name="topic"
                label="Topic"
                value={formData.topic}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
                variant="outlined"
                sx={{ mb: 2 }}
              />
              
              <TextField
                name="details"
                label="Details"
                value={formData.details}
                onChange={handleChange}
                fullWidth
                margin="normal"
                multiline
                rows={4}
                required
                variant="outlined"
                sx={{ mb: 2 }}
              />
              
              {isEdit && (
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.status === 'closed'}
                      onChange={handleSwitchChange}
                      color="primary"
                    />
                  }
                  label="Mark as Closed"
                  sx={{ mt: 1, mb: 2 }}
                />
              )}
              
              <Divider sx={{ my: 3 }} />
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/')}
                  disabled={loading}
                  sx={{ 
                    borderRadius: '50px',
                    px: 3
                  }}
                >
                  CANCEL
                </Button>
                
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  sx={{ 
                    borderRadius: '50px',
                    px: 3
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : (
                    isEdit ? 'UPDATE CASE' : 'CREATE CASE'
                  )}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default CaseForm;