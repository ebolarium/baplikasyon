const SibApiV3Sdk = require('@getbrevo/brevo');
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

// Initialize Brevo client
let brevoClient = null;
let initialized = false;

/**
 * Initialize Brevo with API key
 */
const initTransporter = () => {
  // Only initialize once
  if (initialized) return;
  
  // Get API key from environment variables
  const apiKey = process.env.BREVO_API_KEY;
  
  console.log(`Brevo API Key available: ${apiKey ? 'Yes (length: ' + apiKey.length + ')' : 'No'}`);
  console.log(`BREVO_API_KEY env variable: ${process.env.BREVO_API_KEY ? 'Set' : 'Not set'}`);
  
  if (!apiKey) {
    console.error('Brevo API key not provided. Email service will not function.');
    return;
  }
  
  // Initialize Brevo client
  try {
    // Configure API key authorization
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    const apiKey1 = apiInstance.authentications['apiKey'];
    apiKey1.apiKey = apiKey;
    
    brevoClient = apiInstance;
    console.log('Brevo email service initialized successfully');
    initialized = true;
  } catch (error) {
    console.error('Error initializing Brevo client:', error);
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
    
    if (!initialized || !brevoClient) {
      console.error('Email service initialization failed. Cannot send email.');
      throw new Error('Email service not initialized. Cannot send email.');
    }
    
    // Log email attempt
    console.log(`Attempting to send email to: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Has attachments: ${options.attachments && options.attachments.length > 0 ? 'Yes' : 'No'}`);
    
    // Set default sender
    const from = {
      email: 'noreply@teknodak.com',
      name: 'Odak Kimya Destek'
    };
    
    console.log(`Sending from: ${from.email} (${from.name})`);
    
    // Format attachments for Brevo
    const attachments = [];
    if (options.attachments && options.attachments.length > 0) {
      for (const attachment of options.attachments) {
        let content;
        
        // If we have a path, read the file
        if (attachment.path) {
          try {
            content = fs.readFileSync(attachment.path);
            console.log(`Read attachment from path: ${attachment.path}, size: ${content.length} bytes`);
            
            // Convert to base64 for Brevo
            const base64Content = content.toString('base64');
            
            attachments.push(new SibApiV3Sdk.SendSmtpEmailAttachment(
              attachment.filename,
              base64Content
            ));
          } catch (error) {
            console.error(`Error reading attachment from path: ${attachment.path}`, error);
            throw error;
          }
        } else if (attachment.content) {
          // Already have content as Buffer, convert to base64 for Brevo
          try {
            // If content is already a string (base64), use it directly
            const base64Content = Buffer.isBuffer(attachment.content) 
              ? attachment.content.toString('base64')
              : attachment.content;
            
            console.log(`Prepared attachment from buffer, filename: ${attachment.filename}`);
            
            attachments.push(new SibApiV3Sdk.SendSmtpEmailAttachment(
              attachment.filename,
              base64Content
            ));
          } catch (error) {
            console.error('Error preparing attachment content', error);
            throw error;
          }
        }
      }
    }
    
    // Prepare email data for Brevo
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    
    sendSmtpEmail.sender = from;
    sendSmtpEmail.to = [{ email: options.to }];
    sendSmtpEmail.subject = options.subject;
    sendSmtpEmail.textContent = options.text;
    sendSmtpEmail.htmlContent = options.html || options.text;
    
    if (attachments.length > 0) {
      sendSmtpEmail.attachment = attachments;
    }
    
    // Send email with Brevo
    console.log(`Calling Brevo API...`);
    const result = await brevoClient.sendTransacEmail(sendSmtpEmail);
    
    console.log(`Email sent successfully to ${options.to}`, result);
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