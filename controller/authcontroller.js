import bcrypt from 'bcryptjs';
import userSchema from '../model/usermodel.js';
import { generatetoken } from '../service/token.js';
import { sendOtpVerificationMail } from '../service/otpservice.js';
import OtpSchema from '../model/otpModel.js';
import { token } from 'morgan';
import { sendforgetemail } from '../service/sendforgetemail.js';

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
    await OtpSchema.deleteOne({ email });

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
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }

    const user = await userSchema.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User does not exist' });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.is_Verified) {
      return res.status(403).json({ message: 'Please verify your account' });
    }

    const token = generatetoken({
      id: user._id,
      email: user.email,
    });

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      domain:'https://chrono-frontend.vercel.app'

    });
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

export const Userlogout = async (req, res) => {
  try {
    const token = req.cookies.jwt;

    if (token) {
      res.cookie('jwt', '', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      });
    }
    res.status(200).json({ message: 'logout successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during logout' });
  }
};
export const Forgetpassword = async (req, res) => {
  try {
    const { email } = req.body;
    console.log('the email for resetpassword', email);

    const user = await userSchema.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ message: "This email doesn't exist" });
    }

    if (user.is_Verified === true) {
      const token = generatetoken({ id: user._id, email });
      await userSchema.updateOne({ email: email }, { $set: { token: token } });

      await sendforgetemail(user.name, user.email, token);

      return res.status(200).json({
        message: 'Password reset link sent successfully',
      });
    } else {
      return res.status(400).json({
        message: 'User is not verified',
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Server error during reset password',
      error: error.message,
    });
  }
};
export const Updatepassword = async (req, res) => {
  const { newPassword, token } = req.body;
  console.log('the datas for updatepassword', req.body);

  try {
    if (!newPassword || !token) {
      return res.status(209).json({ message: 'Token or password is missing' });
    }

    const user = await userSchema.findOne({ token: token });

    if (!user) {
      return res
        .status(404)
        .json({ message: 'User not found or invalid token' });
    }

    const passwordhash = await bcrypt.hash(newPassword, 10);

    const updatepassword = await userSchema.findByIdAndUpdate(
      user._id,
      {
        $set: {
          password: passwordhash,
          token: null,
        },
      },
      { new: true }
    );

    if (!updatepassword) {
      return res.status(500).json({ message: 'Failed to update password' });
    }

    res.status(200).json({ message: 'Password successfully updated' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Server error during update password',
      error: error.message,
    });
  }
};
