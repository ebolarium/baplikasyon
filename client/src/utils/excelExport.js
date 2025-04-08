import * as XLSX from 'xlsx';
import { getUserEmail } from './auth';
import api from './api';

/**
 * Fetches user's cases and generates an Excel file
 * @param {string} emailTo - Email address to send the export to (defaults to logged-in user's email)
 */
export const exportUserCasesToExcel = async (emailTo = null) => {
  try {
    // Get the logged-in user's email or use provided email
    const userEmail = emailTo || getUserEmail();
    
    // Fetch user's cases
    const response = await api.get('/cases');
    const cases = response.data;
    
    // Return early if no cases found
    if (!cases || cases.length === 0) {
      alert('No cases found to export.');
      return false;
    }
    
    // Format and export the cases
    return exportCasesToExcel(cases, userEmail);
  } catch (error) {
    console.error('Error fetching cases for export:', error);
    alert('Failed to fetch cases for export. Please try again.');
    return false;
  }
};

/**
 * Generates an Excel file from cases data and downloads it with a Turkish message
 * @param {Array} cases - Array of case objects to export
 * @param {string} emailTo - Email address parameter kept for backward compatibility but not used
 */
export const exportCasesToExcel = async (cases, emailTo = null) => {
  try {
    // Prepare data for Excel
    const workbook = XLSX.utils.book_new();
    
    // Format cases data for export (flatten nested objects, format dates, etc.)
    const formattedCases = cases.map(c => ({
      'Case ID': c._id,
      'Company': c.companyName,
      'Contact Person': c.person,
      'Topic': c.topic,
      'Details': c.details,
      'Status': c.status,
      'Opened At': new Date(c.openedAt).toLocaleString(),
      'Closed At': c.closedAt ? new Date(c.closedAt).toLocaleString() : 'N/A'
    }));
    
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
    
    // Generate Excel file as binary string
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    
    // Convert to Blob for download
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Create a temporary URL for the file
    const url = URL.createObjectURL(blob);
    
    // Get current date for filename
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
    const filename = `SupportCases_${dateStr}.xlsx`;
    
    // Check if on mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // Create download link
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = filename;
    downloadLink.click();
    
    // Fun Turkish messages based on device type
    if (isMobile) {
      alert('Dosyanız indiriliyor! Hayırlı olsun, güle güle kullanın! 📱📊');
    } else {
      alert('Excel dosyanız hazır! Bol şanslar ve iyi çalışmalar! 🎉📊');
    }
    
    // Clean up the URL object
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
    
    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    alert('Dosya oluşturulamadı! Bir hata oluştu, tekrar deneyin. 😔');
    return false;
  }
};

/**
 * Exports cases as Excel file and sends it via email to the logged-in user
 * @returns {Promise<boolean>} Success status
 */
export const exportCasesToEmail = async () => {
  try {
    // Call the export-email endpoint to generate and send Excel via email
    const response = await api.post('/cases/export-email');
    
    // Show success message
    alert('Destek vakaları raporu e-posta adresinize gönderilmiştir. Lütfen e-posta kutunuzu kontrol ediniz.');
    
    return true;
  } catch (error) {
    console.error('Error exporting cases to email:', error);
    
    // Show appropriate error message
    if (error.response && error.response.status === 404) {
      alert('E-posta gönderilemedi. Dışa aktarılacak vaka bulunamadı.');
    } else {
      alert('E-posta gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
    
    return false;
  }
};

export default exportUserCasesToExcel; 