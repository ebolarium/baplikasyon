const { Resend } = require('resend');
const fs = require('fs');

// Try to load config but have fallbacks
let config;
try {
  config = require('config');
} catch (error) {
  console.warn('Config module not found, using environment variables only');
  config = {
    get: (path) => {
      // Simple fallback implementation
      if (path === 'mailSettings.from') return process.env.MAIL_FROM;
      if (path === 'mailSettings.resendApiKey') return process.env.RESEND_API_KEY;
      return undefined;
    }
  };
}

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
  const apiKey = process.env.RESEND_API_KEY || 
    (config ? config.get('mailSettings.resendApiKey') : undefined);
  
  console.log(`API Key available: ${apiKey ? 'Yes (length: ' + apiKey.length + ')' : 'No'}`);
  console.log(`RESEND_API_KEY env variable: ${process.env.RESEND_API_KEY ? 'Set' : 'Not set'}`);
  
  if (!apiKey) {
    console.error('Resend API key not provided. Email service will not function.');
    return;
  }
  
  // Initialize Resend client
  try {
    resend = new Resend(apiKey);
    console.log('Resend email service initialized successfully');
    initialized = true;
  } catch (error) {
    console.error('Error initializing Resend client:', error);
  }
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
      console.log('Email service not initialized, attempting to initialize now...');
      initTransporter();
    }
    
    if (!initialized || !resend) {
      console.error('Email service initialization failed. Cannot send email.');
      throw new Error('Email service not initialized. Cannot send email.');
    }
    
    // Log email attempt
    console.log(`Attempting to send email to: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Has attachments: ${options.attachments && options.attachments.length > 0 ? 'Yes' : 'No'}`);
    
    // Set default sender
    const from = process.env.MAIL_FROM || 
      (config ? config.get('mailSettings.from') : undefined) || 
      'onboarding@resend.dev';
    
    console.log(`Sending from: ${from}`);
    
    // Format attachments for Resend
    const attachments = options.attachments ? options.attachments.map(attachment => {
      let content;
      
      // If we have a path, read the file
      if (attachment.path) {
        try {
          content = fs.readFileSync(attachment.path);
          console.log(`Read attachment from path: ${attachment.path}, size: ${content.length} bytes`);
        } catch (error) {
          console.error(`Error reading attachment from path: ${attachment.path}`, error);
          throw error;
        }
      } else if (attachment.content) {
        // If it's base64 content, convert it to Buffer
        try {
          content = Buffer.from(attachment.content, 'base64');
          console.log(`Converted base64 attachment to buffer, size: ${content.length} bytes`);
        } catch (error) {
          console.error('Error converting attachment content to Buffer', error);
          throw error;
        }
      }
      
      return {
        filename: attachment.filename,
        content: content
      };
    }) : [];
    
    // Send email with Resend
    console.log('Calling Resend API...');
    const result = await resend.emails.send({
      from: from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || undefined,
      attachments: attachments.length > 0 ? attachments : undefined
    });
    
    console.log(`Email sent successfully to ${options.to}`, result);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    if (error.response) {
      console.error('Resend API error response:', error.response);
    }
    throw error;
  }
};

module.exports = {
  initTransporter,
  sendEmail
}; 