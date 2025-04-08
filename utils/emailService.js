const { Resend } = require('resend');
const config = require('config');
const fs = require('fs');

// Initialize resend client
let resend = null;
let initialized = false;

/**
 * Initialize Resend with API key
 */
const initTransporter = () => {
  // Only initialize once
  if (initialized) return;
  
  // Get API key from environment variables or config
  const apiKey = process.env.RESEND_API_KEY || config.get('mailSettings.resendApiKey');
  
  if (!apiKey) {
    console.error('Resend API key not provided. Email service will not function.');
    return;
  }
  
  // Initialize Resend client
  resend = new Resend(apiKey);
  
  console.log('Resend email service initialized');
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
    
    if (!initialized || !resend) {
      throw new Error('Email service not initialized. Cannot send email.');
    }
    
    // Set default sender
    const from = process.env.MAIL_FROM || config.get('mailSettings.from') || 'onboarding@resend.dev';
    
    // Format attachments for Resend
    const attachments = options.attachments ? options.attachments.map(attachment => {
      let content;
      
      // If we have a path, read the file
      if (attachment.path) {
        content = fs.readFileSync(attachment.path);
      } else if (attachment.content) {
        // If it's base64 content, convert it to Buffer
        content = Buffer.from(attachment.content, 'base64');
      }
      
      return {
        filename: attachment.filename,
        content: content
      };
    }) : [];
    
    // Send email with Resend
    const result = await resend.emails.send({
      from: from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || undefined,
      attachments: attachments.length > 0 ? attachments : undefined
    });
    
    console.log(`Email sent to ${options.to}`);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = {
  initTransporter,
  sendEmail
}; 