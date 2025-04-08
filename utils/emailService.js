const nodemailer = require('nodemailer');
const config = require('config');

// Initialize mail transporter
let transporter = null;

/**
 * Initialize the email transporter with configuration
 */
const initTransporter = () => {
  // Only initialize once
  if (transporter) return;
  
  // Get mail settings from config or environment variables
  const mailSettings = {
    host: process.env.MAIL_HOST || config.get('mailSettings.host'),
    port: process.env.MAIL_PORT || config.get('mailSettings.port'),
    secure: process.env.MAIL_SECURE === 'true' || config.get('mailSettings.secure'),
    auth: {
      user: process.env.MAIL_USER || config.get('mailSettings.auth.user'),
      pass: process.env.MAIL_PASSWORD || config.get('mailSettings.auth.pass')
    }
  };
  
  // Create transporter with mail settings
  transporter = nodemailer.createTransport(mailSettings);
  
  // Verify connection
  transporter.verify((error) => {
    if (error) {
      console.error('Email service error:', error);
    } else {
      console.log('Email service is ready to send messages');
    }
  });
};

/**
 * Send an email with optional attachment
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text body
 * @param {string} options.html - HTML body (optional)
 * @param {Array} options.attachments - Array of attachment objects (optional)
 * @returns {Promise} - Promise that resolves with message info
 */
const sendEmail = async (options) => {
  try {
    // Initialize transporter if not already initialized
    if (!transporter) {
      initTransporter();
    }
    
    // Set default sender
    const from = process.env.MAIL_FROM || config.get('mailSettings.from') || 'noreply@odakkimya.com.tr';
    
    // Send email
    const info = await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments
    });
    
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = {
  initTransporter,
  sendEmail
}; 