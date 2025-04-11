const mongoose = require('mongoose');

const SupportCaseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyName: {
    type: String,
    required: [true, 'Please add a company name'],
    trim: true
  },
  person: {
    type: String,
    required: [true, 'Please add a person name'],
    trim: true
  },
  topic: {
    type: String,
    required: [true, 'Please add a topic'],
    trim: true
  },
  details: {
    type: String,
    required: [true, 'Please add details'],
    trim: true
  },
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open'
  },
  contactMethod: {
    type: String,
    enum: ['phone', 'online'],
    default: 'online'
  },
  openedAt: {
    type: Date,
    default: Date.now
  },
  closedAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SupportCase', SupportCaseSchema); 