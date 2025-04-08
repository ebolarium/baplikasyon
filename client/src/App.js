import React, { useState, useEffect, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';

// Components
import Navbar from './components/layout/Navbar';
import Dashboard from './components/pages/Dashboard';
import CaseForm from './components/cases/CaseForm';
import CaseDetail from './components/cases/CaseDetail';
import Reports from './components/pages/Reports';
import NotFound from './components/pages/NotFound';
import Signup from './components/pages/Signup';
import Login from './components/pages/Login';
import PrivateRoute from './components/routing/PrivateRoute';

// Utils
import { getCurrentUser } from './utils/auth';

// Create Auth Context
export const AuthContext = createContext();

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f7fa',
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    }
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }
      }
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        }
      }
    }
  }
});

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app load
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  // Auth context value
  const authContextValue = {
    user,
    setUser,
    isAuthenticated: !!user,
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
            <Navbar />
            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                
                {/* Protected Routes */}
                <Route 
                  path="/dashboard" 
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/case/new" 
                  element={
                    <PrivateRoute>
                      <CaseForm />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/case/:id" 
                  element={
                    <PrivateRoute>
                      <CaseDetail />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/case/edit/:id" 
                  element={
                    <PrivateRoute>
                      <CaseForm />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/reports" 
                  element={
                    <PrivateRoute>
                      <Reports />
                    </PrivateRoute>
                  } 
                />
                
                {/* Fallback Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Box>
          </Box>
        </Router>
      </ThemeProvider>
    </AuthContext.Provider>
  );
}

export default App;
