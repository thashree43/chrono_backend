import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';

const mongourl = process.env.DBURL;

console.log('MongoDB Connection URL:', mongourl.replace(/:[^:]*@/, ':****@'));

// 2. Add more detailed error logging
export const connectdb = async () => {
  try {
    await mongoose.connect(mongourl, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      // Add these additional options
      authSource: 'admin', // Explicitly specify the authentication database
      retryWrites: true,
      w: 'majority',
    });
    console.log('MongoDB has been connected successfully');
  } catch (error) {
    console.error('Error occurred while connecting to MongoDB:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
    });
  }
};
