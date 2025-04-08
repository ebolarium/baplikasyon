const express = require('express');
const router = express.Router();
const User = require('../models/User');

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

module.exports = router; 