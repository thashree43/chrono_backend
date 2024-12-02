import express from 'express';
import {
  Register,
  VerifyOtp,
  ResendOtp,
  Login,
  Userlogout,
  Forgetpassword,
  Updatepassword,
} from '../controller/authcontroller.js';
import {
  Addproduct,
  getproduct,
  updateproduct,
  Deleteproduct,
} from '../controller/productcontroller.js';
import {
  Addcustomer,
  getCustomers,
  updateCustomer,
  deleteCustomer,
} from '../controller/customercontroller.js';
import {
  addsalesentry,
  getsalesentries,
  emailSalesReport,
  Dahboarddatas,
} from '../controller/salecontroller.js';
import {authsecure} from "../middleware/authmiddleware.js"
import multer from 'multer';
import path from 'path';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import { config } from 'dotenv';
config();

const s3Client = new S3Client({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: 'chronowatch',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + '-' + file.originalname);
    },
  }),
});
const userroute = express.Router();
// Authentication routes (no authentication required)
userroute.post('/register', Register);
userroute.post('/verify-otp', VerifyOtp);
userroute.post('/resend-otp', ResendOtp);
userroute.post('/login', Login);

// Routes that require authentication
userroute.post('/logout', authsecure, Userlogout);
userroute.post('/reset-password', authsecure, Forgetpassword);
userroute.patch('/updatepassword', authsecure, Updatepassword);

// Product routes with authentication
userroute.post('/add-product', authsecure, upload.single('image'), Addproduct);
userroute.get('/get-products', authsecure, getproduct);
userroute.put('/products/:id', authsecure, upload.single('image'), updateproduct);
userroute.delete('/delete-product/:id', authsecure, Deleteproduct);

// Customer routes with authentication
userroute.post('/add-customer', authsecure, Addcustomer);
userroute.get('/get-customers', authsecure, getCustomers);
userroute.put('/update-customer/:id', authsecure, updateCustomer);
userroute.delete('/delete-customer/:id', authsecure, deleteCustomer);

// Sales routes with authentication
userroute.post('/add-salesentry', authsecure, addsalesentry);
userroute.get('/get-salesentry', authsecure, getsalesentries);
userroute.post('/sales/email-report', authsecure, emailSalesReport);
userroute.get('/dashboard',authsecure,Dahboarddatas)
export default userroute;
