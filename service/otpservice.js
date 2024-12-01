import nodemailer from 'nodemailer';
import Otp from '../model/otpModel.js';
import userSchema from '../model/usermodel.js';

const generateotp = (length = 4) => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
export const sendOtpVerificationMail = async ({ email }, res) => {
  try {
    const user = await userSchema.findOne({ email });

    if (!user) {
      res.status(400).json({ message: 'email is not correct' });
    }

    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    console.log('Generated OTP:', otp);

    // Hash OTP for security
    const saltRounds = 10;
    // const hashedOtp = await bcrypt.hash(otp, saltRounds);

    // Save hashed OTP in the database
    await Otp.updateOne(
      { email },
      {
        otp: otp,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 60000),
      },
      { upsert: true }
    );

    // Compose email options
    // Email template with improved design and messaging
    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: 'Verify Your CHRONO Account - Your Timeless Journey Begins',
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
            max-width: 600px;
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
          .header h1 {
            color: #1a1a1a;
            margin: 0;
            font-size: 24px;
          }
          .otp-section {
            text-align: center;
            margin: 20px 0;
          }
          .otp-code {
            background-color: #f0f0f0;
            padding: 15px;
            border-radius: 8px;
            font-size: 28px;
            letter-spacing: 5px;
            color: #333;
            font-weight: bold;
          }
          .quote {
            font-style: italic;
            text-align: center;
            color: #666;
            margin-top: 20px;
          }
          .footer {
            margin-top: 20px;
            text-align: center;
            color: #888;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>CHRONO - Watches for Every Occasion</h1>
          </div>
          
          <div class="otp-section">
            <p>Your Verification Code:</p>
            <div class="otp-code">${otp}</div>
            <p>This code will expire in 1 minute. Please do not share it with anyone.</p>
          </div>
          
          <div class="quote">
            "Time is a companion that goes with us on a journey. It reminds us to cherish every moment." - CHRONO
          </div>
          
          <div class="footer">
            <p>© 2024 CHRONO Watches | Timeless Precision</p>
            <p>If you did not request this verification, please ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log('OTP Email sent successfully');
    return otp;
  } catch (error) {
    // Handle errors
    console.log('Error sending OTP email:', error.message);
    res.status(500).json({ error: 'Error sending OTP email' });
  }
};
