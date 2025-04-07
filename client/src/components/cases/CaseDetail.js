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
  Grid
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';

const CaseDetail = () => {
  const [supportCase, setSupportCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  
  const { id } = useParams();
  const navigate = useNavigate();
  
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
      >
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Typography color="error" align="center">
          {error}
        </Typography>
        <Box display="flex" justifyContent="center" mt={2}>
          <Button variant="contained" component={RouterLink} to="/">
            Back to Dashboard
          </Button>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" component="h1" gutterBottom>
            Case Details
          </Typography>
          <Chip
            label={supportCase.status === 'open' ? 'Open' : 'Closed'}
            color={supportCase.status === 'open' ? 'primary' : 'default'}
          />
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="textSecondary">
              Company
            </Typography>
            <Typography variant="body1" gutterBottom>
              {supportCase.companyName}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="textSecondary">
              Contact Person
            </Typography>
            <Typography variant="body1" gutterBottom>
              {supportCase.person}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="textSecondary">
              Topic
            </Typography>
            <Typography variant="body1" gutterBottom>
              {supportCase.topic}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="textSecondary">
              Details
            </Typography>
            <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-wrap' }}>
              {supportCase.details}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="textSecondary">
              Opened At
            </Typography>
            <Typography variant="body2">
              {format(new Date(supportCase.openedAt), 'PPpp')}
            </Typography>
          </Grid>
          {supportCase.closedAt && (
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary">
                Closed At
              </Typography>
              <Typography variant="body2">
                {format(new Date(supportCase.closedAt), 'PPpp')}
              </Typography>
            </Grid>
          )}
        </Grid>
        
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={toggleStatus}
          >
            {supportCase.status === 'open' ? 'Mark as Closed' : 'Reopen Case'}
          </Button>
          
          <Box>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<EditIcon />}
              component={RouterLink}
              to={`/case/edit/${id}`}
              sx={{ mr: 1 }}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setOpenDialog(true)}
            >
              Delete
            </Button>
          </Box>
        </Box>
      </Paper>
      
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this support case? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CaseDetail; 