import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  Button,
  useTheme
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { format, parseISO, differenceInDays } from 'date-fns';

const Reports = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const theme = useTheme();

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await axios.get('/api/cases');
        setCases(res.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data');
        setLoading(false);
      }
    };

    fetchCases();
  }, []);

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

  // Calculate statistics
  const totalCases = cases.length;
  const openCases = cases.filter(c => c.status === 'open').length;
  const closedCases = cases.filter(c => c.status === 'closed').length;
  
  // Calculate average resolution time for closed cases
  const closedCasesWithTime = cases.filter(c => c.status === 'closed' && c.closedAt);
  let avgResolutionTime = 0;
  
  if (closedCasesWithTime.length > 0) {
    const totalDays = closedCasesWithTime.reduce((total, currentCase) => {
      const openDate = parseISO(currentCase.openedAt);
      const closeDate = parseISO(currentCase.closedAt);
      return total + differenceInDays(closeDate, openDate);
    }, 0);
    
    avgResolutionTime = totalDays / closedCasesWithTime.length;
  }

  // Prepare data for table
  const companyCounts = {};
  cases.forEach(c => {
    if (companyCounts[c.companyName]) {
      companyCounts[c.companyName]++;
    } else {
      companyCounts[c.companyName] = 1;
    }
  });

  const companyRows = Object.keys(companyCounts).map((company, index) => ({
    id: index,
    company,
    caseCount: companyCounts[company]
  }));

  const columns = [
    { field: 'company', headerName: 'Company', flex: 1 },
    { field: 'caseCount', headerName: 'Total Cases', width: 150 }
  ];

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Reports
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Cases
              </Typography>
              <Typography variant="h3" component="div">
                {totalCases}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Open Cases
              </Typography>
              <Typography variant="h3" component="div" color="primary">
                {openCases}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Closed Cases
              </Typography>
              <Typography variant="h3" component="div" color="textSecondary">
                {closedCases}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Average Resolution Time
        </Typography>
        <Typography variant="h4" color="textPrimary">
          {avgResolutionTime.toFixed(1)} days
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Based on {closedCasesWithTime.length} closed cases
        </Typography>
      </Paper>

      <Paper sx={{ p: 3, height: 400 }}>
        <Typography variant="h6" gutterBottom>
          Cases by Company
        </Typography>
        <DataGrid
          rows={companyRows}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          disableSelectionOnClick
        />
      </Paper>
    </Container>
  );
};

export default Reports; 