const fs = require('fs');
const { Resend } = require('resend');

// Initialize Resend client
let resendClient = null;
let initialized = false;

/**
 * Initialize Resend client
 */
const initTransporter = async () => {
  // Only initialize once
  if (initialized) return;
  
  try {
    console.log('Setting up Resend client...');

    const resendApiKey = process.env.RESEND_API_KEY;
    const resendFrom = process.env.RESEND_FROM;

    if (!resendApiKey || !resendFrom) {
      throw new Error('RESEND_API_KEY and RESEND_FROM are required');
    }

    resendClient = new Resend(resendApiKey);
    console.log('Resend client initialized successfully');
    initialized = true;
  } catch (error) {
    console.error('Error initializing Resend client:', error);
    initialized = false;
    resendClient = null;
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
      await initTransporter();
    }
    
    if (!initialized || !resendClient) {
      console.error('Email service initialization failed. Cannot send email.');
      throw new Error('Email service not initialized. Cannot send email.');
    }
    
    // Log email attempt
    console.log(`Attempting to send email to: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Has attachments: ${options.attachments && options.attachments.length > 0 ? 'Yes' : 'No'}`);
    
    // Format attachments for Resend if needed
    const attachments = [];
    if (options.attachments && options.attachments.length > 0) {
      for (const attachment of options.attachments) {
        if (!attachment || !attachment.filename) {
          continue;
        }

        if (attachment.content) {
          console.log(`Including attachment from buffer, filename: ${attachment.filename}`);
          attachments.push({
            filename: attachment.filename,
            content: Buffer.isBuffer(attachment.content)
              ? attachment.content.toString('base64')
              : Buffer.from(attachment.content).toString('base64')
          });
        } else if (attachment.path) {
          console.log(`Including attachment from path: ${attachment.path}`);
          const fileBuffer = fs.readFileSync(attachment.path);
          attachments.push({
            filename: attachment.filename,
            content: fileBuffer.toString('base64')
          });
        }
      }
    }
    
    const mailOptions = {
      from: process.env.RESEND_FROM,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || undefined
    };
    
    // Add attachments if any
    if (attachments.length > 0) {
      mailOptions.attachments = attachments;
    }
    
    console.log('Sending email via Resend...');
    const info = await resendClient.emails.send(mailOptions);

    if (info && info.error) {
      throw new Error(info.error.message || 'Resend email send failed');
    }
    
    console.log(`Email sent successfully to ${options.to}`, info);
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
