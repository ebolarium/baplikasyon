const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { protect } = require('../middleware/auth');

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_SECRET is required');
}

const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '90d';

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

    // Primary path: hashed password check
    let isMatch = await bcrypt.compare(password, user.password);

    // Backward compatibility for old plaintext passwords:
    // if match, migrate to bcrypt hash on successful login.
    if (!isMatch && password === user.password) {
      isMatch = true;
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();
    }

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
      jwtSecret,
      { expiresIn: jwtExpiresIn },
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
