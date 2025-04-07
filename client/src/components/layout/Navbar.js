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
    <AppBar position="static">
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
          <img 
            src="/Baplikasyon_Logo.png" 
            alt="Baplikasyon Logo" 
            style={{ 
              height: '40px', 
              marginRight: '10px' 
            }} 
          />
          <Typography
            variant="h6"
            component="span"
            sx={{
              fontWeight: 'bold'
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
            >
              <AssessmentIcon />
            </IconButton>
          ) : (
            <Button
              color="inherit"
              component={RouterLink}
              to="/reports"
              startIcon={<AssessmentIcon />}
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
