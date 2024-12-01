import Product from "../model/productModel.js"
import jwt from "jsonwebtoken"
import { SalesSchema } from "../model/salesModel.js";
import userSchema from "../model/usermodel.js";
import {sendSalesReportEmail} from "../service/reportservice.js"

export const addsalesentry = async (req, res) => {
    try {
      console.log("Received Sales Entries:", req.body);
      const token = req.cookies.jwt;

        if (!token) {
            return res.status(401).json({ message: 'Authentication token is required' });
        }
    
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_KEY);
        const userId = decoded.id;
      // Validate input
      if (!Array.isArray(req.body) || req.body.length === 0) {
        return res.status(400).json({ message: 'Invalid sales entries' });
      }
  
      // Process each sales entry
      const processedEntries = [];
      for (const entry of req.body) {
        // Validate individual entry
        if (!entry.productId || !entry.customerId) {
          return res.status(400).json({ message: 'Missing product or customer information' });
        }
  
        // Update product stock
        const product = await Product.findById(entry.productId);
        if (!product) {
          return res.status(404).json({ message: `Product not found: ${entry.productId}` });
        }
  
        if (product.stock < entry.quantity) {
          return res.status(400).json({ 
            message: `Insufficient stock for product: ${product.name}` 
          });
        }
  
        // Create sales entry
        const salesEntry = new SalesSchema({
          customerName: entry.customerName,
          customerMobile: entry.customerMobile,
          productName: entry.productName,
          price: entry.price,
          quantity: entry.quantity,
          total: entry.total,
          Date:Date.now(),
          user:[userId]
        });
  
        // Save sales entry
        const newsaleentry =await salesEntry.save();
  
        // Update product stock
        product.stock -= entry.quantity;
        await product.save();
        
        if (newsaleentry) {
            await userSchema.findByIdAndUpdate(userId,
             {$push:{sales:newsaleentry._id},
         },{new:true}
            ) 
         }
        processedEntries.push(salesEntry);
      }
  
      res.status(201).json({
        message: 'Sales entries recorded successfully',
        entries: processedEntries
      });
    } catch (error) {
      console.error('Error in addsalesentry:', error);
      res.status(500).json({ 
        message: 'Failed to record sales entries', 
        error: error.message 
      });
    }
  };
  export const getsalesentries = async (req,res)=>{
    try {
        const token = req.cookies.jwt;

        if (!token) {
            return res.status(401).json({ message: 'Authentication token is required' });
        }
    
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_KEY);
        const userId = decoded.id;
        const Salesentries = await SalesSchema.find({
            user: { $in: [userId] },
        });
  
        if (!Salesentries || Salesentries.length === 0) {
            return res.status(200).json({
                message: 'No Sales found for this user',
                Salesentries: [],
            });
        }
  
        res.status(200).json({
            message: 'Customers retrieved successfully',
            Salesentries: Salesentries,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            message: 'Internal server error', 
            error: error.message 
        }); 
    }
  }
  export const emailSalesReport = async(req,res)=>{
    try {
        const { reportData, email } = req.body;
    
    if (!reportData || !email) {
      return res.status(400).json({ message: 'Report data and email are required' });
    }

    await sendSalesReportEmail(reportData, email);
    
    res.status(200).json({ message: 'Sales report email sent successfully' });
  } catch (error) {
    console.error('Email sales report error:', error);
    res.status(500).json({ message: 'Failed to send sales report email', error: error.message });
  }
  }