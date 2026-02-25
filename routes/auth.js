const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { protect } = require('../middleware/auth');
const { sendEmail } = require('../utils/emailService');

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_SECRET is required');
}

const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '90d';
const resetPasswordExpiresMinutes = Number(process.env.RESET_PASSWORD_EXPIRES_MINUTES || 30);

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

// @desc    Send password reset email
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ msg: 'Email is required' });
    }

    const user = await User.findOne({ email });

    // Always return a generic success response to avoid user enumeration.
    const genericResponse = {
      msg: 'If this email exists, a password reset link has been sent.'
    };

    if (!user) {
      return res.json(genericResponse);
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpire = Date.now() + resetPasswordExpiresMinutes * 60 * 1000;
    await user.save();

    const forwardedProto = req.get('x-forwarded-proto');
    const protocol = forwardedProto ? forwardedProto.split(',')[0] : req.protocol;
    const host = req.get('host');
    const appBaseUrl = process.env.APP_BASE_URL || `${protocol}://${host}`;
    const resetUrl = `${appBaseUrl}/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: 'Sifre Sifirlama Baglantisi',
      text: `Sifre sifirlama baglantiniz: ${resetUrl}. Bu baglanti ${resetPasswordExpiresMinutes} dakika icinde sona erer.`,
      html: `<p>Sifre sifirlama baglantiniz:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Bu baglanti ${resetPasswordExpiresMinutes} dakika icinde sona erer.</p>`
    });

    return res.json(genericResponse);
  } catch (err) {
    console.error('Forgot password error:', err.message);
    return res.status(500).json({ msg: 'Server error' });
  }
});

// @desc    Reset password with token
// @route   POST /api/auth/reset-password/:token
// @access  Public
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ msg: 'Password must be at least 6 characters' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid or expired reset token' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return res.json({ msg: 'Password reset successful' });
  } catch (err) {
    console.error('Reset password error:', err.message);
    return res.status(500).json({ msg: 'Server error' });
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
