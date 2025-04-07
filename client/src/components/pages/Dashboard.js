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
  useTheme
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
      <Typography variant="h4" component="h1" gutterBottom>
        Support Cases
      </Typography>
      
      {cases.length === 0 ? (
        <Typography variant="body1">
          No support cases found. Add a new case using the + button.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {cases.map((supportCase) => (
            <Grid item xs={12} key={supportCase._id}>
              <Card elevation={2}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="h6" component="h2">
                      {supportCase.companyName}
                    </Typography>
                    <Chip
                      label={supportCase.status === 'open' ? 'Open' : 'Closed'}
                      color={supportCase.status === 'open' ? 'primary' : 'default'}
                      size="small"
                    />
                  </Box>
                  <Typography color="textSecondary" gutterBottom>
                    Contact: {supportCase.person}
                  </Typography>
                  <Typography variant="body2">
                    {supportCase.topic}
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Opened: {format(new Date(supportCase.openedAt), 'PPp')}
                  </Typography>
                  {supportCase.closedAt && (
                    <Typography variant="caption" display="block">
                      Closed: {format(new Date(supportCase.closedAt), 'PPp')}
                    </Typography>
                  )}
                </CardContent>
                <CardActions sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Button
                    size="small"
                    component={RouterLink}
                    to={`/case/${supportCase._id}`}
                  >
                    View Details
                  </Button>
                  <Button
                    size="small"
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
        }}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
};

export default Dashboard; 