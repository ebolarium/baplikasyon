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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BarChartIcon from '@mui/icons-material/BarChart';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BusinessIcon from '@mui/icons-material/Business';

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
        minHeight="100vh"
        sx={{ paddingTop: '64px' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ paddingTop: '64px', px: 2 }}>
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
    { 
      field: 'company', 
      headerName: 'Company', 
      flex: 1, 
      headerAlign: 'left',
      align: 'left'
    },
    { 
      field: 'caseCount', 
      headerName: 'Total Cases', 
      width: 150,
      headerAlign: 'center',
      align: 'center'
    }
  ];

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100vh', 
        paddingTop: '64px',
        overflow: 'hidden' // Container shouldn't scroll
      }}
    >
      <Box 
        sx={{ 
          flexGrow: 1, 
          overflow: 'auto', // This box will scroll
          paddingBottom: '24px' // Add padding at the bottom for better visibility
        }}
      >
        <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
          {/* Back button */}
          <Button
            component={RouterLink}
            to="/"
            startIcon={<ArrowBackIcon />}
            sx={{ mb: 3, fontWeight: 500 }}
          >
            Back to dashboard
          </Button>

          {/* Reports header */}
          <Card 
            elevation={0} 
            sx={{ 
              mb: 2,
              borderRadius: 2, 
              border: '1px solid rgba(0, 0, 0, 0.08)',
              overflow: 'visible'
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography 
                  variant="h6"
                  component="h1" 
                  sx={{ fontWeight: 'bold' }}
                >
                  Support Reports
                </Typography>
                <BarChartIcon color="primary" sx={{ fontSize: 24 }} />
              </Box>
            </CardContent>
          </Card>

          {/* Stats cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <Card
                elevation={0}
                sx={{ 
                  height: '100%',
                  borderRadius: 2,
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.08)'
                  }
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      Total Cases
                    </Typography>
                    <Box sx={{ 
                      backgroundColor: theme.palette.grey[100], 
                      borderRadius: '50%',
                      p: 0.75,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <BarChartIcon color="primary" sx={{ fontSize: 18 }} />
                    </Box>
                  </Box>
                  <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                    {totalCases}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card
                elevation={0}
                sx={{ 
                  height: '100%',
                  borderRadius: 2,
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.08)'
                  }
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      Open Cases
                    </Typography>
                    <Box sx={{ 
                      backgroundColor: theme.palette.primary.light, 
                      borderRadius: '50%',
                      p: 0.75,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <BarChartIcon color="primary" sx={{ fontSize: 18 }} />
                    </Box>
                  </Box>
                  <Typography variant="h5" component="div" color="primary" sx={{ fontWeight: 'bold' }}>
                    {openCases}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card
                elevation={0}
                sx={{ 
                  height: '100%',
                  borderRadius: 2,
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.08)'
                  }
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      Closed Cases
                    </Typography>
                    <Box sx={{ 
                      backgroundColor: theme.palette.grey[100], 
                      borderRadius: '50%',
                      p: 0.75,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <BarChartIcon color="primary" sx={{ fontSize: 18 }} />
                    </Box>
                  </Box>
                  <Typography variant="h5" component="div" color="textSecondary" sx={{ fontWeight: 'bold' }}>
                    {closedCases}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Average resolution time */}
          <Card 
            elevation={0}
            sx={{ 
              mb: 3,
              borderRadius: 2,
              border: '1px solid rgba(0, 0, 0, 0.08)',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.08)'
              }
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Average Resolution Time
                </Typography>
                <AccessTimeIcon color="primary" sx={{ fontSize: 20 }} />
              </Box>
              <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {avgResolutionTime.toFixed(1)} days
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Based on {closedCasesWithTime.length} closed cases
              </Typography>
            </CardContent>
          </Card>

          {/* Cases by company */}
          <Card 
            elevation={0}
            sx={{ 
              borderRadius: 2,
              border: '1px solid rgba(0, 0, 0, 0.08)'
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Cases by Company
                </Typography>
                <BusinessIcon color="primary" sx={{ fontSize: 20 }} />
              </Box>
              <Box sx={{ height: 350 }}>
                <DataGrid
                  rows={companyRows}
                  columns={columns}
                  pageSize={5}
                  rowsPerPageOptions={[5]}
                  disableSelectionOnClick
                  sx={{
                    border: 'none',
                    '& .MuiDataGrid-cell': {
                      borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                      fontSize: '0.875rem'
                    },
                    '& .MuiDataGrid-columnHeaders': {
                      backgroundColor: theme.palette.grey[50],
                      borderBottom: 'none'
                    },
                    '& .MuiDataGrid-columnHeader': {
                      fontWeight: 600,
                      fontSize: '0.875rem'
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </Box>
  );
};

export default Reports; 