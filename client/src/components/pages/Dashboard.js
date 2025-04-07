import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Fab,
  Chip,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  useTheme,
  Paper,
  Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { format } from 'date-fns';

const Dashboard = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await axios.get('/api/cases');
        setCases(res.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching cases:', error);
        setLoading(false);
      }
    };

    fetchCases();
  }, []);

  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'open' ? 'closed' : 'open';
      const res = await axios.put(`/api/cases/${id}`, { status: newStatus });
      
      // Update the local state with the updated case
      setCases(cases.map(c => c._id === id ? res.data : c));
    } catch (err) {
      console.error('Error updating status:', err);
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

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          mb: 3, 
          borderRadius: 2,
          backgroundColor: 'transparent' 
        }}
      >
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{ 
            color: theme.palette.text.primary,
            fontWeight: 600
          }}
        >
          Support Cases
        </Typography>
      </Paper>
      
      {cases.length === 0 ? (
        <Paper 
          elevation={1} 
          sx={{ 
            p: 4, 
            borderRadius: 2,
            textAlign: 'center',
            backgroundColor: '#fff' 
          }}
        >
          <Typography variant="body1" color="textSecondary">
            No support cases found. Add a new case using the + button.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {cases.map((supportCase) => (
            <Grid item xs={12} key={supportCase._id}>
              <Card 
                elevation={1}
                sx={{ 
                  borderLeft: supportCase.status === 'open' 
                    ? `4px solid ${theme.palette.primary.main}` 
                    : `4px solid ${theme.palette.grey[400]}`,
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }
                }}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="h6" component="h2">
                      {supportCase.companyName}
                    </Typography>
                    <Chip
                      label={supportCase.status === 'open' ? 'Open' : 'Closed'}
                      color={supportCase.status === 'open' ? 'primary' : 'default'}
                      size="small"
                      sx={{ fontWeight: 500 }}
                    />
                  </Box>
                  <Typography color="textSecondary" gutterBottom>
                    Contact: {supportCase.person}
                  </Typography>
                  <Typography variant="body2">
                    {supportCase.topic}
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="caption" display="block" sx={{ color: theme.palette.text.secondary }}>
                    Opened: {format(new Date(supportCase.openedAt), 'PPp')}
                  </Typography>
                  {supportCase.closedAt && (
                    <Typography variant="caption" display="block" sx={{ color: theme.palette.text.secondary }}>
                      Closed: {format(new Date(supportCase.closedAt), 'PPp')}
                    </Typography>
                  )}
                </CardContent>
                <CardActions sx={{ display: 'flex', justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    component={RouterLink}
                    to={`/case/${supportCase._id}`}
                  >
                    View Details
                  </Button>
                  <Button
                    size="small"
                    variant={supportCase.status === 'open' ? 'contained' : 'outlined'}
                    color={supportCase.status === 'open' ? 'primary' : 'secondary'}
                    onClick={() => toggleStatus(supportCase._id, supportCase.status)}
                  >
                    {supportCase.status === 'open' ? 'Mark as Closed' : 'Reopen Case'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Fab
        color="primary"
        aria-label="add"
        component={RouterLink}
        to="/case/new"
        sx={{
          position: 'fixed',
          bottom: theme.spacing(4),
          right: theme.spacing(4),
          boxShadow: '0 4px 12px rgba(25, 118, 210, 0.5)'
        }}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
};

export default Dashboard; 