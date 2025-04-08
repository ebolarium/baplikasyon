const cron = require('node-cron');
const User = require('../models/User');
const SupportCase = require('../models/SupportCase');
const { exportCasesToExcel } = require('../client/src/utils/excelExport');
const emailService = require('./emailService');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

/**
 * Generate weekly report for a user and send via email
 * @param {Object} user - User object with email and other properties
 */
const generateAndSendWeeklyReport = async (user) => {
  try {
    console.log(`Generating weekly report for user: ${user.email}`);
    
    // Get cases data - adjust this query based on your requirements
    // For example, you might want to filter by date or status
    const cases = await SupportCase.find()
      .sort({ openedAt: -1 })
      .lean();
    
    if (!cases || cases.length === 0) {
      console.log(`No cases found for weekly report to ${user.email}`);
      return;
    }
    
    // Format cases data for Excel export
    const formattedCases = cases.map(c => ({
      'Case ID': c._id.toString(),
      'Company': c.companyName,
      'Contact Person': c.person,
      'Topic': c.topic,
      'Details': c.details,
      'Status': c.status,
      'Opened At': new Date(c.openedAt).toLocaleString(),
      'Closed At': c.closedAt ? new Date(c.closedAt).toLocaleString() : 'N/A'
    }));
    
    // Create a workbook
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
    ];
    worksheet['!cols'] = columnWidths;
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Support Cases');
    
    // Get current date for filename
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
    const filename = `SupportCases_${dateStr}.xlsx`;
    const filePath = path.join(__dirname, '..', 'temp', filename);
    
    // Ensure temp directory exists
    if (!fs.existsSync(path.join(__dirname, '..', 'temp'))) {
      fs.mkdirSync(path.join(__dirname, '..', 'temp'), { recursive: true });
    }
    
    // Write file to disk
    XLSX.writeFile(workbook, filePath);
    
    // Get file content as base64 for Resend (they accept Buffer)
    const fileBuffer = fs.readFileSync(filePath);
    
    // Send email with attachment
    await emailService.sendEmail({
      to: user.email,
      subject: `Haftalık Destek Raporu - ${dateStr}`,
      text: `Merhaba ${user.name || 'Değerli Kullanıcı'},\n\nHaftalık destek vaka raporunuz ektedir. Bu rapor, sistemdeki tüm destek vakalarının bir özetini içerir.\n\nİyi çalışmalar dileriz,\nOdak Kimya Destek Ekibi`,
      html: `
        <h2>Haftalık Destek Raporu</h2>
        <p>Merhaba ${user.name || 'Değerli Kullanıcı'},</p>
        <p>Haftalık destek vaka raporunuz ektedir. Bu rapor, sistemdeki tüm destek vakalarının bir özetini içerir.</p>
        <p>İyi çalışmalar dileriz,<br>Odak Kimya Destek Ekibi</p>
      `,
      attachments: [
        {
          filename,
          content: fileBuffer,
        }
      ]
    });
    
    console.log(`Weekly report sent to ${user.email}`);
    
    // Clean up temporary file
    fs.unlinkSync(filePath);
  } catch (error) {
    console.error(`Error sending weekly report to ${user.email}:`, error);
  }
};

/**
 * Send weekly reports to all users
 */
const sendWeeklyReports = async () => {
  try {
    console.log('Starting weekly report job...');
    
    // Get all active users who should receive reports
    const users = await User.find({ 
      active: true,
      receiveWeeklyReports: true 
    }).lean();
    
    if (!users || users.length === 0) {
      console.log('No active users found for weekly reports');
      return;
    }
    
    console.log(`Sending weekly reports to ${users.length} users`);
    
    // Process each user
    for (const user of users) {
      await generateAndSendWeeklyReport(user);
    }
    
    console.log('Weekly report job completed');
  } catch (error) {
    console.error('Error in weekly report job:', error);
  }
};

/**
 * Initialize all cron jobs
 */
const initCronJobs = () => {
  // Schedule weekly report job for Friday at 18:00
  // Cron syntax: minute hour day-of-month month day-of-week
  cron.schedule('0 18 * * 5', sendWeeklyReports, {
    timezone: 'Europe/Istanbul'
  });
  
  console.log('Cron jobs initialized');
};

module.exports = {
  initCronJobs,
  sendWeeklyReports // Export for manual execution if needed
}; 