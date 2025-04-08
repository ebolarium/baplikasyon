const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const fs = require('fs');

// OAuth2 configuration
const OAuth2 = google.auth.OAuth2;

// Gmail OAuth credentials - set these in environment variables
const GMAIL_CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const GMAIL_CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const GMAIL_REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;
const GMAIL_USER = process.env.GMAIL_USER || 'your-email@gmail.com';

// Transporter instance
let transporter = null;

/**
 * Create and authenticate a nodemailer transporter using Gmail OAuth2
 */
const createTransporter = async () => {
  try {
    // Create OAuth2 client
    const oauth2Client = new OAuth2(
      GMAIL_CLIENT_ID,
      GMAIL_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground'
    );

    // Set credentials
    oauth2Client.setCredentials({
      refresh_token: GMAIL_REFRESH_TOKEN
    });

    // Get access token
    const accessToken = await new Promise((resolve, reject) => {
      oauth2Client.getAccessToken((err, token) => {
        if (err) {
          console.error('Error getting access token:', err);
          reject(err);
        }
        resolve(token);
      });
    });

    // Create transporter
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: GMAIL_USER,
        clientId: GMAIL_CLIENT_ID,
        clientSecret: GMAIL_CLIENT_SECRET,
        refreshToken: GMAIL_REFRESH_TOKEN,
        accessToken: accessToken
      }
    });

    // Verify transporter
    await transporter.verify();
    console.log('Gmail OAuth transporter verified and ready');
    
    return transporter;
  } catch (error) {
    console.error('Error creating Gmail transporter:', error);
    throw error;
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
    console.log(`Attempting to send email to: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    
    // Create transporter if it doesn't exist
    if (!transporter) {
      console.log('Creating new Gmail transporter');
      await createTransporter();
    }
    
    // Format attachments if present
    let attachments = [];
    if (options.attachments && options.attachments.length > 0) {
      console.log(`Processing ${options.attachments.length} attachments`);
      
      attachments = options.attachments.map(attachment => {
        // If it has a path, return it directly
        if (attachment.path) {
          console.log(`Including attachment from path: ${attachment.path}`);
          return {
            filename: attachment.filename,
            path: attachment.path
          };
        }
        
        // If it has content, return it as a buffer
        if (attachment.content) {
          console.log(`Including attachment from buffer (${attachment.content.length} bytes)`);
          return {
            filename: attachment.filename,
            content: attachment.content
          };
        }
        
        return null;
      }).filter(att => att !== null);
    }
    
    // Send email
    const result = await transporter.sendMail({
      from: `"Odak Kimya Destek" <${GMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || undefined,
      attachments: attachments
    });
    
    console.log(`Email sent successfully to ${options.to}`, result);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = {
  sendEmail
}; 