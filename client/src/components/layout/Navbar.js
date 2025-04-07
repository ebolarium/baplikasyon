import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
            variant="h6"
            component="span"
            sx={{
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            Baplikasyon
          </Typography>
        </Box>
        <Box>
          {isMobile ? (
            <IconButton
              color="inherit"
              component={RouterLink}
              to="/reports"
              aria-label="reports"
              size="large"
            >
              <AssessmentIcon />
            </IconButton>
          ) : (
            <Button
              color="inherit"
              component={RouterLink}
              to="/reports"
              startIcon={<AssessmentIcon />}
              sx={{ fontWeight: 'medium' }}
            >
              Reports
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
