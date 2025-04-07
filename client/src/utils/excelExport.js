import * as XLSX from 'xlsx';

/**
 * Generates an Excel file from cases data and opens email client with attachment
 * @param {Array} cases - Array of case objects to export
 * @param {string} emailTo - Email address to send the export to
 */
export const exportCasesToExcel = async (cases, emailTo = 'baris@odakkimya.com.tr') => {
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
    
    if (isMobile) {
      // On mobile, directly open mail app with attachment
      // Note: This has limitations based on browser and device,
      // but works on many mobile browsers
      
      // Create mail link with attachment
      // Since direct file attachment isn't fully supported across all devices,
      // we'll use a fallback approach:
      
      // First, try to use the Web Share API if available (modern approach)
      if (navigator.share && navigator.canShare) {
        try {
          const file = new File([blob], filename, {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          });
          
          await navigator.share({
            files: [file],
            title: 'Support Cases Export',
            text: 'Please find attached the export of support cases.'
          });
          
          return true;
        } catch (error) {
          console.error('Error sharing file:', error);
          // Fall back to other methods
        }
      }
      
      // Fallback: Attempt to use mailto with a download link
      // (this won't include the attachment directly but provides a link)
      const mailtoLink = `mailto:${emailTo}?subject=Support Cases Export&body=Please download the support cases export from the following link:%0D%0A${window.location.origin}/exports/${filename}`;
      
      window.location.href = mailtoLink;
      
      // Also provide a direct download link for the user
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = filename;
      downloadLink.click();
      
      alert('To email this file, please attach the downloaded Excel file manually to your email.');
    } else {
      // On desktop, download the file and provide instructions
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = filename;
      downloadLink.click();
      
      // Create a mailto link to open default email client
      const mailtoLink = `mailto:${emailTo}?subject=Support Cases Export&body=Please find attached the support cases export.`;
      
      // Open email client
      window.location.href = mailtoLink;
      
      alert('Please attach the downloaded Excel file to the email that opens.');
    }
    
    // Clean up the URL object
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
    
    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    alert('Failed to generate Excel export. Please try again.');
    return false;
  }
};

export default exportCasesToExcel; 