import React, { useContext, useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
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
import { exportUserCasesToExcel } from '../../utils/excelExport';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { AuthContext } from '../../App';

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);

  // Check if we're on an auth page (login or signup)
  const isAuthPage = location.pathname === '/' || 
                     location.pathname === '/login' || 
                     location.pathname === '/signup';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleExportExcel = async () => {
    try {
      setLoading(true);
      
      // Use the new export function that handles authenticated requests
      await exportUserCasesToExcel();
      
      setLoading(false);
    } catch (error) {
      console.error('Error exporting cases:', error);
      alert('Failed to export cases. Please try again.');
      setLoading(false);
    }
  };

  // Render auth buttons (login/signup or non-authed menu)
  const renderAuthButtons = () => {
    if (!user) {
      return (
        <>
          {isMobile ? (
            <>
              <IconButton
                color="inherit"
                component={RouterLink}
                to="/login"
                aria-label="login"
                size="large"
                sx={{ mr: 0.5 }}
              >
                <LoginIcon />
              </IconButton>
              <IconButton
                color="inherit"
                component={RouterLink}
                to="/signup"
                aria-label="sign up"
                size="large"
                sx={{ mr: 0.5 }}
              >
                <PersonAddIcon />
              </IconButton>
            </>
          ) : (
            <>
              <Button
                color="inherit"
                component={RouterLink}
                to="/login"
                startIcon={<LoginIcon />}
                sx={{ fontWeight: 'medium', mr: 0.5 }}
              >
                Login
              </Button>
              <Button
                color="inherit"
                component={RouterLink}
                to="/signup"
                startIcon={<PersonAddIcon />}
                sx={{ fontWeight: 'medium', mr: 0.5 }}
              >
                Sign Up
              </Button>
            </>
          )}
        </>
      );
    }
    return null;
  };

  return (
    !isAuthPage || user ? (
      <AppBar position="fixed" sx={{ boxShadow: 2, zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Box 
            component={RouterLink} 
            to={user ? "/dashboard" : "/"} 
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
          
          {!user && renderAuthButtons()}
          
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {/* Name */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccountCircleIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                <Typography variant="body2" sx={{ mr: 2 }}>
                  {user.name || user.email}
                </Typography>
              </Box>
              
              {/* Reports Button */}
              {isMobile ? (
                <IconButton
                  color="inherit"
                  component={RouterLink}
                  to="/reports"
                  aria-label="reports"
                  size="large"
                  sx={{ mr: 2 }}
                >
                  <AssessmentIcon />
                </IconButton>
              ) : (
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/reports"
                  startIcon={<AssessmentIcon />}
                  sx={{ fontWeight: 'medium', mr: 2 }}
                >
                  REPORTS
                </Button>
              )}
              
              {/* Export Button */}
              {isMobile ? (
                <IconButton
                  color="inherit"
                  onClick={handleExportExcel}
                  aria-label="export to excel"
                  size="large"
                  disabled={loading}
                  sx={{ mr: 2 }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : <TableViewIcon />}
                </IconButton>
              ) : (
                <Button
                  color="inherit"
                  onClick={handleExportExcel}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <TableViewIcon />}
                  disabled={loading}
                  sx={{ fontWeight: 'medium', mr: 2 }}
                >
                  EXPORT
                </Button>
              )}
              
              {/* Logout Button */}
              {isMobile ? (
                <IconButton
                  color="inherit"
                  onClick={handleLogout}
                  aria-label="logout"
                  size="large"
                >
                  <LogoutIcon />
                </IconButton>
              ) : (
                <Button
                  color="inherit"
                  onClick={handleLogout}
                  startIcon={<LogoutIcon />}
                  sx={{ fontWeight: 'medium' }}
                >
                  LOGOUT
                </Button>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>
    ) : null
  );
};

export default Navbar;
