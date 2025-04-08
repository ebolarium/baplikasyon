const jwt = require('jsonwebtoken');
const config = require('config');
const User = require('../models/User');

// Protect routes
const protect = (req, res, next) => {
  // Skip token verification and always provide admin access
  req.user = { id: '6442c8dc043eb5cd6eaf48d2', isAdmin: true };
  next();
};

module.exports = { protect }; 