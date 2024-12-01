import express from 'express';
import {
  Register,
  VerifyOtp,
  ResendOtp,
  Login,
} from '../controller/authcontroller.js';
import {
  Addproduct,
  getproduct,
  updateproduct,
  Deleteproduct,
} from '../controller/productcontroller.js';
import { Addcustomer,getCustomers,updateCustomer,deleteCustomer} from '../controller/customercontroller.js';
import {addsalesentry,getsalesentries} from "../controller/salecontroller.js"
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

userroute.post('/register', Register);
userroute.post('/verify-otp', VerifyOtp);
userroute.post('/resend-otp', ResendOtp);
userroute.post('/login', Login);

// product part
userroute.post('/add-product', upload.single('image'), Addproduct);
userroute.get('/get-products', getproduct);
userroute.put('/products/:id', upload.single('image'), updateproduct);
userroute.delete('/delete-product/:id', Deleteproduct);

// Customer part
userroute.post('/add-customer', Addcustomer);
userroute.get('/get-customers',getCustomers)
userroute.put('/update-customer/:id',updateCustomer)
userroute.delete('/delete-customer/:id',deleteCustomer)

// Sales part
userroute.post('/add-salesentry',addsalesentry)
userroute.get('/get-salesentry',getsalesentries)
export default userroute;
