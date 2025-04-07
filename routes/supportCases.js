const express = require('express');
const router = express.Router();
const SupportCase = require('../models/SupportCase');

// @desc    Get all support cases
// @route   GET /api/cases
// @access  Public
router.get('/', async (req, res) => {
  try {
    const supportCases = await SupportCase.find().sort({ openedAt: -1 });
    res.json(supportCases);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @desc    Get single support case
// @route   GET /api/cases/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const supportCase = await SupportCase.findById(req.params.id);
    
    if (!supportCase) {
      return res.status(404).json({ msg: 'Support case not found' });
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
// @access  Public
router.post('/', async (req, res) => {
  try {
    const newCase = new SupportCase({
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
// @access  Public
router.put('/:id', async (req, res) => {
  try {
    let supportCase = await SupportCase.findById(req.params.id);
    
    if (!supportCase) {
      return res.status(404).json({ msg: 'Support case not found' });
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
// @access  Public
router.delete('/:id', async (req, res) => {
  try {
    const supportCase = await SupportCase.findById(req.params.id);
    
    if (!supportCase) {
      return res.status(404).json({ msg: 'Support case not found' });
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