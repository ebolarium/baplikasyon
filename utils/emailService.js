const sgMail = require('@sendgrid/mail');
const config = require('config');

// Initialize flag
let initialized = false;

/**
 * Initialize SendGrid with API key
 */
const initTransporter = () => {
  // Only initialize once
  if (initialized) return;
  
  // Get API key from environment variables or config
  const apiKey = process.env.SENDGRID_API_KEY || config.get('mailSettings.sendgridApiKey');
  
  if (!apiKey) {
    console.error('SendGrid API key not provided. Email service will not function.');
    return;
  }
  
  // Set API key
  sgMail.setApiKey(apiKey);
  
  console.log('SendGrid email service initialized');
  initialized = true;
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
    // Initialize if not already initialized
    if (!initialized) {
      initTransporter();
    }
    
    if (!initialized) {
      throw new Error('Email service not initialized. Cannot send email.');
    }
    
    // Set default sender
    const from = process.env.MAIL_FROM || config.get('mailSettings.from') || 'noreply@odakkimya.com.tr';
    
    // Format attachments for SendGrid
    const attachments = options.attachments ? options.attachments.map(attachment => {
      // Convert file content to base64 if we have a path
      let content = attachment.content;
      
      if (attachment.path) {
        const fs = require('fs');
        content = fs.readFileSync(attachment.path).toString('base64');
      }
      
      return {
        content: content,
        filename: attachment.filename,
        type: attachment.contentType || 'application/octet-stream',
        disposition: 'attachment'
      };
    }) : [];
    
    // Prepare email
    const msg = {
      to: options.to,
      from: from,
      subject: options.subject,
      text: options.text,
      html: options.html || options.text,
      attachments: attachments
    };
    
    // Send email
    const result = await sgMail.send(msg);
    
    console.log(`Email sent to ${options.to}`);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    if (error.response) {
      console.error(error.response.body);
    }
    throw error;
  }
};

module.exports = {
  initTransporter,
  sendEmail
}; 