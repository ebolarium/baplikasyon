import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import api from '../../utils/api';
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
          const res = await api.get(`/cases/${id}`);
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
    console.log('Switch changed:', e.target.checked ? 'closed' : 'open');
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
  
  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    
    // Log the form data being submitted
    console.log('Submitting form data:', formData);
    
    try {
      if (isEdit) {
        await api.put(`/cases/${id}`, formData);
      } else {
        await api.post('/cases', formData);
        
        // Set a flag in localStorage if creating a case with closed status
        if (formData.status === 'closed') {
          localStorage.setItem('newClosedCase', 'true');
        }
      }
      
      setLoading(false);
      navigate('/');
    } catch (err) {
      console.error('Error submitting form:', err);
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
        height: '100vh',
        paddingTop: '64px',
        overflow: 'auto'
      }}
    >
      <Container maxWidth="lg" sx={{ my: 0, py: 0, pb: 10 }}>
        {/* Back button directly attached to navbar */}
        <Button
          component={RouterLink}
          to="/"
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 0, fontWeight: 500 }}
        >
          Back to dashboard
        </Button>
        
        <Grid container spacing={0} sx={{ mt: 0 }}>
          {/* Form column */}
          <Grid item xs={12}>
            <Card
              elevation={0}
              sx={{ 
                borderRadius: 2,
                border: '1px solid rgba(0, 0, 0, 0.08)',
                mb: 4,
                mt: 0
              }}
            >
              <CardContent sx={{ p: 3, pb: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
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
                
                <Divider sx={{ mt: 0.5, mb: 1 }} />
                
                {/* Form container */}
                <Box>
                  {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
                  
                  <Box component="form" onSubmit={(e) => { 
                    e.preventDefault(); 
                    handleSubmit(); 
                  }}>
                    <TextField
                      name="companyName"
                      label="Company Name"
                      value={formData.companyName}
                      onChange={handleChange}
                      fullWidth
                      margin="normal"
                      required
                      variant="outlined"
                      sx={{ mb: 1 }}
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
                      sx={{ mb: 1 }}
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
                      sx={{ mb: 1 }}
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
                      sx={{ mb: 1 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <DescriptionIcon color="action" />
                          </InputAdornment>
                        )
                      }}
                    />
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.status === 'closed'}
                          onChange={handleSwitchChange}
                          color="primary"
                        />
                      }
                      label={formData.status === 'closed' ? 'Case is Closed' : 'Mark as Closed'}
                      sx={{ mt: 0, mb: 0 }}
                    />
                    
                    {/* Move buttons inside the form */}
                    <Divider sx={{ my: 0.5 }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0, mt: 0.5 }}>
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