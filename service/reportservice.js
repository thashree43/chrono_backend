import nodemailer from 'nodemailer';
import { transporter } from './otpservice.js';

export const sendSalesReportEmail = async (reportData, recipientEmail) => {
  try {
    // Create HTML table for sales report
    const createSalesReportTable = (data) => {
      return `
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th style="border: 1px solid #ddd; padding: 8px;">Customer</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Product</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Quantity</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Total</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Date</th>
            </tr>
          </thead>
          <tbody>
            ${data
              .map(
                (sale) => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${sale.customerName}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${sale.productName}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${sale.quantity}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">₹${sale.total.toFixed(2)}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${new Date(sale.Date).toLocaleDateString()}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      `;
    };

    // Calculate total sales
    const totalSales = reportData.reduce(
      (total, sale) => total + sale.total,
      0
    );

    // Compose email options
    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: recipientEmail,
      subject: 'Sales Report - CHRONO Watches',
      html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #e0e0e0;
            padding-bottom: 20px;
          }
          .summary {
            text-align: center;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>CHRONO - Sales Report</h1>
            <p>Detailed Sales Overview</p>
          </div>
          
          <div class="summary">
            <h2>Sales Summary</h2>
            <p>Total Sales: ₹${totalSales.toFixed(2)}</p>
            <p>Report Generated: ${new Date().toLocaleString()}</p>
          </div>
          
          ${createSalesReportTable(reportData)}
          
          <div class="footer" style="text-align: center; margin-top: 20px; color: #888;">
            <p>© 2024 CHRONO Watches | Timeless Precision</p>
          </div>
        </div>
      </body>
      </html>
    `,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log('Sales Report Email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending sales report email:', error);
    throw new Error('Failed to send sales report email');
  }
};
