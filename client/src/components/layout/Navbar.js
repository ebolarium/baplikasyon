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
import EmailIcon from '@mui/icons-material/Email';
import CircularProgress from '@mui/material/CircularProgress';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DownloadIcon from '@mui/icons-material/Download';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { exportUserCasesToExcel, exportCasesToEmail } from '../../utils/excelExport';
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
  
  // For export menu
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  // Check if we're on an auth page (login or signup)
  const isAuthPage = location.pathname === '/' || 
                     location.pathname === '/login' || 
                     location.pathname === '/signup' ||
                     location.pathname === '/forgot-password' ||
                     location.pathname.startsWith('/reset-password/');

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  // Handle export menu open
  const handleExportClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  // Handle export menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleExportExcel = async () => {
    try {
      setLoading(true);
      handleMenuClose();
      
      // Use the export function that handles authenticated requests
      await exportUserCasesToExcel();
      
      setLoading(false);
    } catch (error) {
      console.error('Error exporting cases:', error);
      alert('Failed to export cases. Please try again.');
      setLoading(false);
    }
  };
  
  const handleEmailExport = async () => {
    try {
      setLoading(true);
      handleMenuClose();
      
      // Use the new email export function
      await exportCasesToEmail();
      
      setLoading(false);
    } catch (error) {
      console.error('Error emailing cases:', error);
      alert('Failed to email cases. Please try again.');
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
  
  // Render export options
  const renderExportOptions = () => {
    if (isMobile) {
      return (
        <>
          <IconButton
            color="inherit"
            onClick={handleExportClick}
            aria-label="export options"
            size="large"
            disabled={loading}
            sx={{ mr: 2 }}
          >
            {loading ? 
              <CircularProgress size={24} color="inherit" /> : 
              <TableViewIcon />
            }
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleExportExcel} disabled={loading}>
              <ListItemIcon>
                <DownloadIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>İndir</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleEmailExport} disabled={loading}>
              <ListItemIcon>
                <EmailIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>E-posta Gönder</ListItemText>
            </MenuItem>
          </Menu>
        </>
      );
    } else {
      return (
        <>
          <Button
            color="inherit"
            onClick={handleExportClick}
            startIcon={loading ? 
              <CircularProgress size={20} color="inherit" /> : 
              <TableViewIcon />
            }
            disabled={loading}
            sx={{ fontWeight: 'medium', mr: 2 }}
          >
            EXPORT
          </Button>
          
          <Menu
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleExportExcel} disabled={loading}>
              <ListItemIcon>
                <DownloadIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>İndir</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleEmailExport} disabled={loading}>
              <ListItemIcon>
                <EmailIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>E-posta Gönder</ListItemText>
            </MenuItem>
          </Menu>
        </>
      );
    }
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
              {/* Name with link to profile */}
              <Box 
                component={RouterLink} 
                to="/profile"
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  textDecoration: 'none',
                  color: 'inherit'
                }}
              >
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
              
              {/* Export Options */}
              {renderExportOptions()}
              
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
