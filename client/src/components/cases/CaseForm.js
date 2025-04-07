import React, { useState, useEffect, useRef } from 'react';
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
  useTheme,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  InputAdornment
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import SubjectIcon from '@mui/icons-material/Subject';
import DescriptionIcon from '@mui/icons-material/Description';
import ClearIcon from '@mui/icons-material/Clear';

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
  
  const companyInputRef = useRef(null);
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
    } else {
      // Focus on company name field when creating a new case
      setTimeout(() => {
        if (companyInputRef.current) {
          companyInputRef.current.focus();
        }
      }, 100);
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
  
  const handleClearField = (fieldName) => {
    setFormData({
      ...formData,
      [fieldName]: ''
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
  
  const formIsValid = 
    formData.companyName.trim() !== '' &&
    formData.person.trim() !== '' &&
    formData.topic.trim() !== '' &&
    formData.details.trim() !== '';
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh', 
        paddingTop: '64px',
        overflow: 'auto' // Make the entire page scrollable
      }}
    >
      <Container maxWidth="lg" sx={{ mt: 0, mb: 0, flexGrow: 1, py: 0 }}>
        {/* Back button directly attached to navbar */}
        <Button
          component={RouterLink}
          to="/"
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 0, fontWeight: 500, py: 1 }}
        >
          Back to dashboard
        </Button>
        
        <Grid container spacing={3} sx={{ mt: 0 }}>
          {/* Form column */}
          <Grid item xs={12} md={8}>
            <Card
              elevation={0}
              sx={{ 
                borderRadius: 2,
                border: '1px solid rgba(0, 0, 0, 0.08)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Form header merged with form content */}
              <CardContent sx={{ p: 3, pb: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
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
                
                <Divider sx={{ mt: 1, mb: 2 }} />
                
                {/* Form container - removed scroll */}
                <Box>
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
                      inputRef={companyInputRef}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <BusinessIcon color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: formData.companyName && (
                          <InputAdornment position="end">
                            <IconButton 
                              edge="end" 
                              onClick={() => handleClearField('companyName')}
                              size="small"
                            >
                              <ClearIcon fontSize="small" />
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
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
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: formData.person && (
                          <InputAdornment position="end">
                            <IconButton 
                              edge="end" 
                              onClick={() => handleClearField('person')}
                              size="small"
                            >
                              <ClearIcon fontSize="small" />
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
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
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SubjectIcon color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: formData.topic && (
                          <InputAdornment position="end">
                            <IconButton 
                              edge="end" 
                              onClick={() => handleClearField('topic')}
                              size="small"
                            >
                              <ClearIcon fontSize="small" />
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
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
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <DescriptionIcon color="action" />
                          </InputAdornment>
                        )
                      }}
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
                  </Box>
                </Box>
              </CardContent>
              
              {/* Footer with buttons */}
              <Box sx={{ mt: 'auto', p: 3, pt: 0 }}>
                <Divider sx={{ mb: 3 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
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
                    disabled={loading || !formIsValid}
                    onClick={handleSubmit}
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
            </Card>
          </Grid>
          
          {/* Preview column */}
          <Grid item xs={12} md={4}>
            <Card
              elevation={0}
              sx={{ 
                borderRadius: 2,
                border: '1px solid rgba(0, 0, 0, 0.08)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Typography 
                  variant="h6" 
                  component="h2" 
                  sx={{ 
                    fontWeight: 'bold',
                    mb: 2
                  }}
                >
                  Preview
                </Typography>
                
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    This is how your case will appear on the dashboard:
                  </Typography>
                </Box>
                
                {/* Preview container - removed scroll */}
                <Box sx={{ flexGrow: 1 }}>
                  {/* Case card preview */}
                  <Card 
                    elevation={0}
                    sx={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 2,
                      border: '1px solid rgba(0, 0, 0, 0.08)',
                      transition: 'all 0.2s ease-in-out',
                      backgroundColor: '#fff',
                      mt: 2
                    }}
                  >
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      px: 2,
                      pt: 1.5,
                      pb: 1
                    }}>
                      <Typography 
                        variant="h6" 
                        component="h2" 
                        sx={{ 
                          fontWeight: 'bold',
                          fontSize: '1.1rem',
                          color: theme.palette.text.primary
                        }}
                      >
                        {formData.companyName || 'Company Name'}
                      </Typography>
                      <Chip
                        label="Open"
                        color="primary"
                        size="small"
                        sx={{ 
                          fontWeight: 500,
                          borderRadius: '20px',
                          height: '24px'
                        }}
                      />
                    </Box>
                    
                    <CardContent sx={{ pt: 0, pb: 0 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: theme.palette.text.secondary,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          lineHeight: 1.2,
                          mt: 0.5
                        }}
                      >
                        {formData.topic || 'Case topic will appear here'}
                      </Typography>
                    </CardContent>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      px: 2,
                      py: 1.5,
                      mt: 'auto',
                      borderTop: '1px solid rgba(0, 0, 0, 0.06)'
                    }}>
                      <Button
                        size="small"
                        variant="text"
                        sx={{ 
                          fontWeight: 500, 
                          color: '#1976d2',
                          p: 0
                        }}
                      >
                        VIEW DETAILS
                      </Button>
                      
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        sx={{ 
                          fontWeight: 500,
                          borderRadius: '50px',
                          px: 2
                        }}
                      >
                        CLOSE CASE
                      </Button>
                    </Box>
                  </Card>
                </Box>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Fill in all required fields to create the support case.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default CaseForm;