const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

// Load env vars
dotenv.config();

// Log that we're starting the server
console.log('Starting server.js...');
console.log(`Node environment: ${process.env.NODE_ENV}`);
console.log(`MongoDB URI exists: ${!!process.env.MONGO_URI}`);

// Connect to database
const connectDB = require('./config/db');
let dbConnected = false;

try {
  // Attempt to connect to the database
  connectDB()
    .then(() => {
      dbConnected = true;
      console.log('MongoDB connected successfully');
      
      // Initialize email service and cron jobs after database connection
      if (process.env.NODE_ENV === 'production') {
        // Use SMTP service for email delivery
        (async () => {
          try {
            // Initialize email transporter
            const { initTransporter } = require('./utils/emailService');
            await initTransporter();
            console.log('SMTP email service initialized');
            
            // Initialize cron jobs after email is set up
            try {
              const { initCronJobs } = require('./utils/cronJobs');
              initCronJobs();
              console.log('Cron jobs initialized');
            } catch (error) {
              console.error('Error initializing cron jobs:', error);
            }
          } catch (error) {
            console.error('Error initializing email service:', error);
          }
        })();
      }
    })
    .catch(err => {
      console.error('MongoDB connection error:', err.message);
    });
} catch (error) {
  console.error('Error in database connection setup:', error);
}

// Route files
const supportCases = require('./routes/supportCases');
const users = require('./routes/users');
const auth = require('./routes/auth');

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Add a simple health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    env: process.env.NODE_ENV,
    dbConnected
  });
});

// Manual trigger for sending weekly reports (protected, admin only)
app.post('/api/admin/send-weekly-reports', auth, async (req, res) => {
  try {
    // Ensure user is admin (implement your own admin check)
    const user = req.user;
    if (!user.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }
    
    // Trigger weekly reports
    const { sendWeeklyReports } = require('./utils/cronJobs');
    await sendWeeklyReports();
    
    res.json({ success: true, message: 'Weekly reports job triggered' });
  } catch (error) {
    console.error('Error triggering weekly reports:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  // Basic request logging in production
  app.use(morgan('combined'));
}

// Mount routers
app.use('/api/cases', supportCases);
app.use('/api/users', users);
app.use('/api/auth', auth);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  console.log('Serving static files from client/build');
  
  // Set static folder
  app.use(express.static(path.join(__dirname, 'client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

// Error handling for the server startup
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
}).on('error', (err) => {
  console.error('Error starting server:', err.message);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Keep the server running despite the error
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  // Keep the server running despite the error
}); 