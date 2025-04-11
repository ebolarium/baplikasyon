const express = require('express');
const router = express.Router();
const SupportCase = require('../models/SupportCase');
const { protect } = require('../middleware/auth');
const User = require('../models/User');

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
      status: req.body.status || 'open',
      contactMethod: req.body.contactMethod || 'online'
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

    const { companyName, person, topic, details, status, contactMethod } = req.body;
    
    // Build case object
    const caseFields = {};
    if (companyName) caseFields.companyName = companyName;
    if (person) caseFields.person = person;
    if (topic) caseFields.topic = topic;
    if (details) caseFields.details = details;
    if (contactMethod) caseFields.contactMethod = contactMethod;
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

// @route   POST /api/cases/export-email
// @desc    Export cases as Excel and send via email
// @access  Private
router.post('/export-email', protect, async (req, res) => {
  try {
    console.log('Received request to export cases to email');
    const userId = req.user.id;
    
    // Get user info for email
    console.log(`Finding user with ID: ${userId}`);
    const user = await User.findById(userId);
    if (!user) {
      console.error(`User not found for ID: ${userId}`);
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log(`User found: ${user.email}`);
    
    // Get cases for this user only (based on the user ownership in the model)
    console.log(`Finding cases for user: ${userId}`);
    const cases = await SupportCase.find({ user: userId }).sort({ openedAt: -1 }).lean();
    
    if (!cases || cases.length === 0) {
      console.log(`No cases found for user: ${userId}`);
      return res.status(404).json({ error: 'No cases found to export' });
    }
    
    console.log(`Found ${cases.length} cases to export`);
    
    // Format cases data for Excel export
    const formattedCases = cases.map(c => ({
      'Case ID': c._id.toString(),
      'Company': c.companyName,
      'Contact Person': c.person,
      'Topic': c.topic,
      'Details': c.details,
      'Status': c.status,
      'Opened At': new Date(c.openedAt).toLocaleString(),
      'Closed At': c.closedAt ? new Date(c.closedAt).toLocaleString() : 'N/A',
      'Last Updated': new Date(c.updatedAt).toLocaleString()
    }));
    
    // Create a workbook
    const XLSX = require('xlsx');
    const workbook = XLSX.utils.book_new();
    
    // Create worksheet from data
    const worksheet = XLSX.utils.json_to_sheet(formattedCases);
    
    // Set column widths for better readability
    const columnWidths = [
      { wch: 24 }, // Case ID
      { wch: 20 }, // Company
      { wch: 20 }, // Contact Person
      { wch: 30 }, // Topic
      { wch: 50 }, // Details
      { wch: 10 }, // Status
      { wch: 20 }, // Opened At
      { wch: 20 }, // Closed At
      { wch: 20 }, // Last Updated
    ];
    worksheet['!cols'] = columnWidths;
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Support Cases');
    
    // Get current date for filename
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
    const filename = `SupportCases_${dateStr}.xlsx`;
    
    // Create temporary directory if it doesn't exist
    const fs = require('fs');
    const path = require('path');
    const tempDir = path.join(__dirname, '..', 'temp');
    
    console.log(`Ensuring temp directory exists: ${tempDir}`);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
      console.log('Temp directory created');
    }
    
    const filePath = path.join(tempDir, filename);
    console.log(`Writing Excel file to: ${filePath}`);
    
    try {
      // Write file to disk
      XLSX.writeFile(workbook, filePath);
      console.log('Excel file written successfully');
    } catch (writeError) {
      console.error('Error writing Excel file:', writeError);
      return res.status(500).json({ error: 'Error generating Excel file' });
    }
    
    // Get file as buffer for email attachment
    console.log('Reading file for email attachment');
    let fileBuffer;
    try {
      fileBuffer = fs.readFileSync(filePath);
      console.log(`File read successfully, size: ${fileBuffer.length} bytes`);
    } catch (readError) {
      console.error('Error reading Excel file:', readError);
      return res.status(500).json({ error: 'Error reading generated Excel file' });
    }
    
    // Get email service
    console.log('Loading email service');
    const emailService = require('../utils/emailService');
    
    // Send email with attachment
    console.log(`Sending email to: ${user.email}`);
    try {
      await emailService.sendEmail({
        to: user.email,
        subject: `Destek Vakaları Raporu - ${dateStr}`,
        text: `Merhaba ${user.name || 'Değerli Kullanıcı'},\n\nTalep ettiğiniz destek vaka raporu ektedir. Bu rapor, sizin destek vakalarınızın bir özetini içerir.\n\nİyi çalışmalar dileriz,\nOdak Kimya Destek Ekibi`,
        html: `
          <h2>Destek Vakaları Raporu</h2>
          <p>Merhaba ${user.name || 'Değerli Kullanıcı'},</p>
          <p>Talep ettiğiniz destek vaka raporu ektedir. Bu rapor, sizin destek vakalarınızın bir özetini içerir.</p>
          <p>İyi çalışmalar dileriz,<br>Odak Kimya Destek Ekibi</p>
        `,
        attachments: [
          {
            filename,
            content: fileBuffer,
          }
        ]
      });
      console.log('Email sent successfully');
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      return res.status(500).json({ error: 'Error sending email' });
    }
    
    // Clean up temporary file
    console.log(`Cleaning up temporary file: ${filePath}`);
    try {
      fs.unlinkSync(filePath);
      console.log('Temporary file deleted');
    } catch (unlinkError) {
      console.error('Error deleting temporary file:', unlinkError);
      // Don't return an error here, as the email has been sent
    }
    
    res.json({ success: true, message: 'Excel report has been sent to your email' });
  } catch (error) {
    console.error('Error exporting cases to email:', error);
    res.status(500).json({ error: 'Server error when exporting cases' });
  }
});

module.exports = router; 