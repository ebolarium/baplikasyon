const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @desc    Register a user
// @route   POST /api/users
// @access  Public
router.post('/', async (req, res) => {
  try {
    console.log('Registration attempt:', req.body);
    const { name, email, password } = req.body;

    // Check if all required fields are present
    if (!name || !email || !password) {
      console.log('Missing required fields:', { name: !!name, email: !!email, password: !!password });
      return res.status(400).json({ msg: 'Please provide name, email and password' });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      console.log('User already exists with email:', email);
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create new user
    user = new User({
      name,
      email,
      password // In a real app, you would hash this password
    });

    console.log('Attempting to save user to database');
    await user.save();
    console.log('User saved successfully with ID:', user._id);

    // Return user without password
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    };

    res.json(userResponse);
  } catch (err) {
    console.error('Error in user registration:');
    console.error(err);
    
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      console.log('Validation error:', messages);
      return res.status(400).json({ msg: messages.join(', ') });
    }
    
    if (err.code === 11000) {
      console.log('Duplicate key error');
      return res.status(400).json({ msg: 'Email already in use' });
    }
    
    res.status(500).json({ 
      msg: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// @route   GET /api/users/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/users/settings
// @desc    Update user settings
// @access  Private
router.put('/settings', protect, async (req, res) => {
  try {
    const { receiveWeeklyReports } = req.body;
    
    // Find the user
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Update only the specified settings
    if (receiveWeeklyReports !== undefined) {
      user.receiveWeeklyReports = receiveWeeklyReports;
    }
    
    // Save the updated user
    await user.save();
    
    // Return the updated user object without password
    const updatedUser = await User.findById(req.user.id).select('-password');
    
    // Update the user in localStorage via the response
    res.json({
      user: updatedUser,
      msg: 'Settings updated successfully'
    });
  } catch (err) {
    console.error('Error updating user settings:', err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router; 