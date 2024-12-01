import mongoose from 'mongoose';

const OtpModel = new mongoose.Schema({
  email: String,

  otp: String,

  createdAt: Date,

  expiresAt: Date,
});

const OtpSchema = mongoose.model('Otp', OtpModel);
export default OtpSchema;
