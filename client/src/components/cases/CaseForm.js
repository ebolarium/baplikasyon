import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  Alert
} from '@mui/material';

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
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          {isEdit ? 'Edit Support Case' : 'New Support Case'}
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            name="companyName"
            label="Company Name"
            value={formData.companyName}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          
          <TextField
            name="person"
            label="Contact Person"
            value={formData.person}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          
          <TextField
            name="topic"
            label="Topic"
            value={formData.topic}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
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
              sx={{ mt: 2 }}
            />
          )}
          
          <Box sx={{ mt: 3, mb: 1, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/')}
              disabled={loading}
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                isEdit ? 'Update Case' : 'Create Case'
              )}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CaseForm;