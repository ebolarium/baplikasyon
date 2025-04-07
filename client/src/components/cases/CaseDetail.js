import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Paper,
  Chip,
  Button,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Card,
  CardContent,
  useTheme
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { format } from 'date-fns';

const CaseDetail = () => {
  const [supportCase, setSupportCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  
  useEffect(() => {
    const fetchCase = async () => {
      try {
        const res = await axios.get(`/api/cases/${id}`);
        setSupportCase(res.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch case details');
        setLoading(false);
      }
    };
    
    fetchCase();
  }, [id]);
  
  const handleDelete = async () => {
    try {
      await axios.delete(`/api/cases/${id}`);
      navigate('/');
    } catch (err) {
      setError('Failed to delete case');
      setOpenDialog(false);
    }
  };
  
  const toggleStatus = async () => {
    try {
      const newStatus = supportCase.status === 'open' ? 'closed' : 'open';
      const res = await axios.put(`/api/cases/${id}`, { status: newStatus });
      setSupportCase(res.data);
    } catch (err) {
      setError('Failed to update status');
    }
  };
  
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
        sx={{ mt: '64px' }}
      >
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ mt: '90px', px: 2 }}>
        <Container maxWidth="md">
          <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: '1px solid rgba(0, 0, 0, 0.08)' }}>
            <Typography color="error" align="center">
              {error}
            </Typography>
            <Box display="flex" justifyContent="center" mt={2}>
              <Button 
                variant="contained" 
                component={RouterLink} 
                to="/"
                startIcon={<ArrowBackIcon />}
              >
                Back to Dashboard
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    );
  }
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Spacer for fixed navbar */}
      <Box sx={{ height: '64px' }} />
      
      <Container maxWidth="md" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        {/* Back button */}
        <Button
          component={RouterLink}
          to="/"
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 3, fontWeight: 500 }}
        >
          Back to cases
        </Button>
        
        {/* Header section */}
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
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
                {supportCase.companyName}
              </Typography>
              <Chip
                label={supportCase.status === 'open' ? 'Open' : 'Closed'}
                color={supportCase.status === 'open' ? 'primary' : 'default'}
                sx={{ 
                  fontWeight: 500,
                  borderRadius: '20px',
                  fontSize: '0.875rem',
                  height: '28px'
                }}
              />
            </Box>
            
            <Typography variant="h6" color="textSecondary" gutterBottom>
              {supportCase.topic}
            </Typography>
          </CardContent>
        </Card>
        
        {/* Details section */}
        <Card 
          elevation={0} 
          sx={{ 
            mb: 3, 
            borderRadius: 2, 
            border: '1px solid rgba(0, 0, 0, 0.08)' 
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Case Details
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Contact Person
                </Typography>
                <Typography variant="body1" gutterBottom sx={{ fontWeight: 500 }}>
                  {supportCase.person}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Opened At
                </Typography>
                <Typography variant="body1" gutterBottom sx={{ fontWeight: 500 }}>
                  {format(new Date(supportCase.openedAt), 'PPpp')}
                </Typography>
              </Grid>
              
              {supportCase.closedAt && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Closed At
                  </Typography>
                  <Typography variant="body1" gutterBottom sx={{ fontWeight: 500 }}>
                    {format(new Date(supportCase.closedAt), 'PPpp')}
                  </Typography>
                </Grid>
              )}
              
              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary">
                  Details
                </Typography>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    mt: 1, 
                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                    borderColor: 'rgba(0, 0, 0, 0.08)'
                  }}
                >
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {supportCase.details}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        
        {/* Actions section */}
        <Card 
          elevation={0} 
          sx={{ 
            borderRadius: 2, 
            border: '1px solid rgba(0, 0, 0, 0.08)' 
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Button
                  variant="contained"
                  color={supportCase.status === 'open' ? 'primary' : 'secondary'}
                  onClick={toggleStatus}
                  sx={{ 
                    fontWeight: 500,
                    borderRadius: '50px',
                    px: 3
                  }}
                >
                  {supportCase.status === 'open' ? 'CLOSE CASE' : 'REOPEN CASE'}
                </Button>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<EditIcon />}
                  component={RouterLink}
                  to={`/case/edit/${id}`}
                  sx={{ 
                    borderRadius: '50px',
                    px: 3
                  }}
                >
                  EDIT
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setOpenDialog(true)}
                  sx={{ 
                    borderRadius: '50px',
                    px: 3
                  }}
                >
                  DELETE
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirm Delete"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this support case? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setOpenDialog(false)} 
            sx={{ borderRadius: '50px' }}
          >
            CANCEL
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            variant="contained"
            sx={{ borderRadius: '50px' }}
            autoFocus
          >
            DELETE
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CaseDetail; 