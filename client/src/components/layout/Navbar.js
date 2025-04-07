import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TableViewIcon from '@mui/icons-material/TableView';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import axios from 'axios';
import { exportCasesToExcel } from '../../utils/excelExport';

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(false);

  const handleExportExcel = async () => {
    try {
      setLoading(true);
      // Fetch all cases
      const response = await axios.get('/api/cases');
      
      // Export to Excel and open email
      await exportCasesToExcel(response.data);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cases for export:', error);
      alert('Failed to export cases. Please try again.');
      setLoading(false);
    }
  };

  return (
    <AppBar position="fixed" sx={{ boxShadow: 2, zIndex: theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Box 
          component={RouterLink} 
          to="/" 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            textDecoration: 'none',
            color: 'inherit',
            flexGrow: 1
          }}
        >
          <Typography
            variant="subtitle1"
            component="span"
            sx={{
              fontWeight: 'medium',
              display: 'flex',
              alignItems: 'center',
              fontSize: '0.95rem'
            }}
          >
            Baplikasyon
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 0, alignItems: 'center' }}>
          {isMobile ? (
            <>
              <IconButton
                color="inherit"
                component={RouterLink}
                to="/reports"
                aria-label="reports"
                size="large"
                sx={{ mr: 0.5 }}
              >
                <AssessmentIcon />
              </IconButton>
              <Box sx={{ 
                borderLeft: '1px solid rgba(255, 255, 255, 0.5)', 
                height: 24, 
                mx: 0.5 
              }} />
              <IconButton
                color="inherit"
                onClick={handleExportExcel}
                aria-label="export to excel"
                size="large"
                disabled={loading}
                sx={{ ml: 0.5 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : <TableViewIcon />}
              </IconButton>
            </>
          ) : (
            <>
              <Button
                color="inherit"
                component={RouterLink}
                to="/reports"
                startIcon={<AssessmentIcon />}
                sx={{ fontWeight: 'medium', mr: 0.5 }}
              >
                Reports
              </Button>
              <Box sx={{ 
                borderLeft: '1px solid rgba(255, 255, 255, 0.5)', 
                height: 24, 
                mx: 0.5 
              }} />
              <Button
                color="inherit"
                onClick={handleExportExcel}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <TableViewIcon />}
                disabled={loading}
                sx={{ fontWeight: 'medium', ml: 0.5 }}
              >
                Export
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
