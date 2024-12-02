import { transporter } from './otpservice.js';
import dotenv from 'dotenv';
dotenv.config();
export const sendforgetemail = async (name, email, token) => {
  try {
    const resetLink = `${process.env.CLIENT_URL}/updatepassword/${token}`;

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: 'Reset Your CHRONO Account Password',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <style>
            /* Your existing styles */
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>CHRONO - Password Reset</h1>
            </div>
            
            <div class="password-section">
              <p>Hello ${name},</p>
              <p>Click the link below to reset your password:</p>
              <div class="otp-code">
                <a href="${resetLink}">Reset Password</a>
              </div>
              <p>This link will expire in 1 hour. If you did not request a password reset, please ignore this email.</p>
            </div>
            
            <div class="quote">
              "Time is a companion that goes with us on a journey. It reminds us to cherish every moment." - CHRONO
            </div>
            
            <div class="footer">
              <p>© 2024 CHRONO Watches | Timeless Precision</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully');
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};
