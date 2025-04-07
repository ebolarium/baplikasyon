const mongoose = require('mongoose');

const SupportCaseSchema = new mongoose.Schema({
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