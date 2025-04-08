const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/auth');

// @desc    Authenticate user & get token
// @route   POST /api/auth
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // In a real app, you would verify the password with bcrypt
    // For now, simple comparison (this is NOT secure for production)
    const isMatch = password === user.password;
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Create JWT token
    const payload = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'defaultsecret', // In production, use a secure environment variable
      { expiresIn: '1d' },
      (err, token) => {
        if (err) throw err;
        
        // Return user info and token
        const userToReturn = {
          _id: user._id,
          name: user.name,
          email: user.email
        };
        
        res.json({
          token,
          user: userToReturn
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @desc    Get current user
// @route   GET /api/auth
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // Get user from database without password
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router; 