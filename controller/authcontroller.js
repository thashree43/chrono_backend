import bcrypt from 'bcryptjs';
import userSchema from '../model/usermodel.js';
import { generatetoken } from '../service/token.js';
import { sendOtpVerificationMail } from '../service/otpservice.js';
import OtpSchema from '../model/otpModel.js';
import { token } from 'morgan';

export const Register = async (req, res) => {
  console.log('the data while in register', req.body);

  const { username, email, mobile, password } = req.body;

  try {
    if (!username | !email | !mobile) {
      res.status(204).json({ message: 'please provide the datas' });
    }
    const existemail = await userSchema.findOne({ email });
    if (existemail) {
      res.status(409).json({ message: 'email already existed' });
    }
    const passwordhash = await bcrypt.hash(password, 10);

    const userdata = new userSchema({
      name: username,
      email: email,
      mobile: mobile,
      password: passwordhash,
    });
    await userdata.save();

    const otp = await sendOtpVerificationMail({ email }, res);

    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        username: userdata.name,
        email: userdata.email,
        mobile: userdata.mobile,
      },
    });
  } catch (error) {
    console.error(error);
  }
};
export const VerifyOtp = async (req, res) => {
  const { email, otp1, otp2, otp3, otp4 } = req.body;

  try {
    const enteredOtp = otp1 + otp2 + otp3 + otp4;

    const otpData = await OtpSchema.findOne({ email });

    if (!otpData) {
      return res.status(404).json({ message: 'OTP not found' });
    }

    if (otpData.expiresAt < Date.now()) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    if (enteredOtp === otpData.otp) {
      const userData = await userSchema.findOne({ email });
      await userSchema.findByIdAndUpdate(
        { _id: userData._id },
        { is_Verified: true }
      );

      await OtpSchema.deleteOne({ email });

      return res.status(200).json({ message: 'Account verified successfully' });
    } else {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: 'Server error during OTP verification' });
  }
};
export const ResendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    // Delete any existing OTP for this email
    await OtpSchema.deleteOne({ email });

    // Generate and send new OTP
    const otp = await sendOtpVerificationMail({ email }, res);

    return res.status(200).json({
      message: 'New OTP sent successfully',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error resending OTP' });
  }
};

export const Login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }

    // Find user by email
    const user = await userSchema.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User does not exist' });
    }

    // Check password using bcrypt
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is verified
    if (!user.is_Verified) {
      return res.status(403).json({ message: 'Please verify your account' });
    }

    // Generate token
    const token = generatetoken({
      id: user._id,
      email: user.email,
    });

    // Set cookie
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    // Respond with user info and token
    res.status(200).json({
      message: 'User successfully logged in',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login' });
  }
};
