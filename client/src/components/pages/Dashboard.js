import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { loadSlim } from "tsparticles-slim";

const Dashboard = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  
  // Function to fire confetti using tsParticles
  const fireConfetti = useCallback(() => {
    // Clear existing particles if any
    const existingContainer = document.getElementById("tsparticles");
    if (existingContainer) {
      existingContainer.innerHTML = "";
    }
    
    // Load new confetti particles with the provided configuration
    loadSlim("tsparticles", {
      "fullScreen": {
        "zIndex": 1
      },
      "emitters": {
        "position": {
          "x": 50,
          "y": 100
        },
        "rate": {
          "quantity": 5,
          "delay": 0.15
        }
      },
      "particles": {
        "color": {
          "value": [
            "#1E00FF",
            "#FF0061",
            "#E1FF00",
            "#00FF9E"
          ]
        },
        "move": {
          "decay": 0.05,
          "direction": "top",
          "enable": true,
          "gravity": {
            "enable": true
          },
          "outModes": {
            "top": "none",
            "default": "destroy"
          },
          "speed": {
            "min": 50,
            "max": 100
          }
        },
        "number": {
          "value": 0
        },
        "opacity": {
          "value": 1
        },
        "rotate": {
          "value": {
            "min": 0,
            "max": 360
          },
          "direction": "random",
          "animation": {
            "enable": true,
            "speed": 30
          }
        },
        "tilt": {
          "direction": "random",
          "enable": true,
          "value": {
            "min": 0,
            "max": 360
          },
          "animation": {
            "enable": true,
            "speed": 30
          }
        },
        "size": {
          "value": 3,
          "animation": {
            "enable": true,
            "startValue": "min",
            "count": 1,
            "speed": 16,
            "sync": true
          }
        },
        "roll": {
          "darken": {
            "enable": true,
            "value": 25
          },
          "enlighten": {
            "enable": true,
            "value": 25
          },
          "enable": true,
          "speed": {
            "min": 5,
            "max": 15
          }
        },
        "wobble": {
          "distance": 30,
          "enable": true,
          "speed": {
            "min": -7,
            "max": 7
          }
        },
        "shape": {
          "type": [
            "circle",
            "square"
          ],
          "options": {}
        }
      },
      "responsive": [
        {
          "maxWidth": 1024,
          "options": {
            "particles": {
              "move": {
                "speed": {
                  "min": 33,
                  "max": 66
                }
              }
            }
          }
        }
      ]
    });
    
    // Auto-cleanup after 5 seconds
    setTimeout(() => {
      const container = document.getElementById("tsparticles");
      if (container) {
        container.innerHTML = "";
      }
    }, 5000);
  }, []);

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
    
    // Setup particles container if it doesn't exist
    if (!document.getElementById("tsparticles")) {
      const particlesContainer = document.createElement('div');
      particlesContainer.id = 'tsparticles';
      particlesContainer.style.position = 'fixed';
      particlesContainer.style.top = '0';
      particlesContainer.style.left = '0';
      particlesContainer.style.width = '100%';
      particlesContainer.style.height = '100%';
      particlesContainer.style.pointerEvents = 'none';
      particlesContainer.style.zIndex = '9999';
      document.body.appendChild(particlesContainer);
    }
    
    // Cleanup function
    return () => {
      const container = document.getElementById("tsparticles");
      if (container) {
        document.body.removeChild(container);
      }
    };
  }, []);

  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'open' ? 'closed' : 'open';
      const res = await axios.put(`/api/cases/${id}`, { status: newStatus });
      
      // Update the local state with the updated case
      setCases(cases.map(c => c._id === id ? res.data : c));
      
      // Fire confetti when a case is closed
      if (newStatus === 'closed') {
        console.log('Triggering confetti with tsParticles!');
        fireConfetti();
      }
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
        sx={{ mt: '64px' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Fixed header section with toolbar height offset */}
      <Box sx={{ height: '64px' }} /> {/* Spacer for navbar */}
      
      {/* Fixed upper half with add button */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          pt: 4,
          pb: 4,
          position: 'sticky',
          top: 64, // Height of navbar
          zIndex: 10,
          backgroundColor: theme.palette.background.default,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Fab
          color="primary"
          aria-label="add new case"
          component={RouterLink}
          to="/case/new"
          sx={{
            width: 96,
            height: 96,
            boxShadow: '0 8px 24px rgba(25, 118, 210, 0.5)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: '0 12px 28px rgba(25, 118, 210, 0.6)',
            }
          }}
        >
          <AddIcon sx={{ fontSize: 40 }} />
        </Fab>
        
        <Typography 
          variant="body1" 
          color="textSecondary" 
          sx={{ mt: 3, textAlign: 'center' }}
        >
          Tap to create a new support case
        </Typography>
      </Box>
      
      {/* Scrollable lower half with cases list */}
      <Box 
        sx={{ 
          flexGrow: 1, 
          overflow: 'auto',
          p: 2,
          pt: 4,
          pb: 4
        }}
      >
        <Container maxWidth="md">
          <Divider sx={{ mb: 4 }} />
          
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
                No support cases found. Use the + button above to add a new case.
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {/* Sort cases - open first, then closed */}
              {cases
                .sort((a, b) => {
                  // First sort by status (open cases first)
                  if (a.status === 'open' && b.status !== 'open') return -1;
                  if (a.status !== 'open' && b.status === 'open') return 1;
                  
                  // For cases with the same status, sort by date (newest first)
                  return new Date(b.openedAt) - new Date(a.openedAt);
                })
                .map((supportCase) => (
                <Grid item xs={12} sm={6} md={6} key={supportCase._id}>
                  <Card 
                    elevation={0}
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 2,
                      border: '1px solid rgba(0, 0, 0, 0.08)',
                      transition: 'all 0.2s ease-in-out',
                      backgroundColor: supportCase.status === 'open' ? '#fff' : '#f9f9f9', // Lighter background for closed cases
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.08)'
                      }
                    }}
                  >
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      px: 2,
                      pt: 1.5,
                      pb: 1
                    }}>
                      <Typography 
                        variant="h6" 
                        component="h2" 
                        sx={{ 
                          fontWeight: 'bold',
                          fontSize: '1.1rem',
                          color: theme.palette.text.primary
                        }}
                      >
                        {supportCase.companyName}
                      </Typography>
                      <Chip
                        label={supportCase.status === 'open' ? 'Open' : 'Closed'}
                        color={supportCase.status === 'open' ? 'primary' : 'default'}
                        size="small"
                        sx={{ 
                          fontWeight: 500,
                          borderRadius: '20px',
                          height: '24px'
                        }}
                      />
                    </Box>
                    
                    <CardContent sx={{ pt: 0, pb: 0 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: theme.palette.text.secondary,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          lineHeight: 1.2,
                          mt: 0.5
                        }}
                      >
                        {supportCase.topic}
                      </Typography>
                    </CardContent>
                    
                    <CardActions sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      px: 2,
                      py: 1.5,
                      mt: 'auto',
                      borderTop: '1px solid rgba(0, 0, 0, 0.06)'
                    }}>
                      <Button
                        size="small"
                        variant="text"
                        component={RouterLink}
                        to={`/case/${supportCase._id}`}
                        sx={{ 
                          fontWeight: 500, 
                          color: '#1976d2',
                          p: 0
                        }}
                      >
                        VIEW DETAILS
                      </Button>
                      
                      {supportCase.status === 'open' ? (
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          onClick={() => toggleStatus(supportCase._id, supportCase.status)}
                          sx={{ 
                            fontWeight: 500,
                            borderRadius: '50px',
                            px: 2
                          }}
                        >
                          CLOSE CASE
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          variant="outlined"
                          color="secondary"
                          onClick={() => toggleStatus(supportCase._id, supportCase.status)}
                          sx={{ 
                            fontWeight: 500,
                            borderRadius: '50px',
                            px: 2
                          }}
                        >
                          REOPEN
                        </Button>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default Dashboard; 