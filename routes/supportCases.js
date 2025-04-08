const express = require('express');
const router = express.Router();
const SupportCase = require('../models/SupportCase');
const { protect } = require('../middleware/auth');

// @desc    Get all support cases for logged in user
// @route   GET /api/cases
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // Only get cases for the logged-in user
    const supportCases = await SupportCase.find({ user: req.user.id }).sort({ openedAt: -1 });
    res.json(supportCases);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @desc    Get single support case
// @route   GET /api/cases/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const supportCase = await SupportCase.findById(req.params.id);
    
    if (!supportCase) {
      return res.status(404).json({ msg: 'Support case not found' });
    }
    
    // Make sure user owns the case
    if (supportCase.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized to access this case' });
    }
    
    res.json(supportCase);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Support case not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @desc    Create a support case
// @route   POST /api/cases
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const newCase = new SupportCase({
      user: req.user.id, // Associate case with user
      companyName: req.body.companyName,
      person: req.body.person,
      topic: req.body.topic,
      details: req.body.details,
      status: req.body.status || 'open'
    });

    // If status is closed, add closedAt timestamp
    if (req.body.status === 'closed') {
      newCase.closedAt = Date.now();
    }

    const supportCase = await newCase.save();
    res.json(supportCase);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @desc    Update support case
// @route   PUT /api/cases/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    let supportCase = await SupportCase.findById(req.params.id);
    
    if (!supportCase) {
      return res.status(404).json({ msg: 'Support case not found' });
    }
    
    // Make sure user owns the case
    if (supportCase.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized to update this case' });
    }

    const { companyName, person, topic, details, status } = req.body;
    
    // Build case object
    const caseFields = {};
    if (companyName) caseFields.companyName = companyName;
    if (person) caseFields.person = person;
    if (topic) caseFields.topic = topic;
    if (details) caseFields.details = details;
    if (status) {
      caseFields.status = status;
      // If status is being changed to closed, set closedAt
      if (status === 'closed' && supportCase.status !== 'closed') {
        caseFields.closedAt = Date.now();
      }
      // If status is being changed to open from closed, remove closedAt
      if (status === 'open' && supportCase.status === 'closed') {
        caseFields.closedAt = null;
      }
    }

    supportCase = await SupportCase.findByIdAndUpdate(
      req.params.id,
      { $set: caseFields },
      { new: true }
    );

    res.json(supportCase);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Support case not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @desc    Delete support case
// @route   DELETE /api/cases/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const supportCase = await SupportCase.findById(req.params.id);
    
    if (!supportCase) {
      return res.status(404).json({ msg: 'Support case not found' });
    }
    
    // Make sure user owns the case
    if (supportCase.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized to delete this case' });
    }

    await supportCase.deleteOne();
    
    res.json({ msg: 'Support case removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Support case not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router; 