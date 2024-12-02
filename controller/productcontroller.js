import Product from '../model/productModel.js';
import cookies from 'cookie';
import jwt from 'jsonwebtoken';
import userSchema from '../model/usermodel.js';
import { assign } from 'nodemailer/lib/shared/index.js';

export const Addproduct = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_KEY);
    const userId = decoded.id;

    const { name, description, price, stock, status } = req.body;

    // Validate input fields
    if (!name || !description || !price || !stock || !status) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    // Comprehensive uniqueness check
    const existingProduct = await Product.findOne({
      user: userId,
      $or: [
        { name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } },
        { description: { $regex: new RegExp(`^${description.trim()}$`, 'i') } },
      ],
    });

    // Detailed uniqueness validation
    if (existingProduct) {
      let errorMessage = '';
      if (existingProduct.name.toLowerCase() === name.toLowerCase().trim()) {
        errorMessage =
          'A product with this name already exists for your account';
      } else if (
        existingProduct.description.toLowerCase() ===
        description.toLowerCase().trim()
      ) {
        errorMessage =
          'A product with this description already exists for your account';
      }

      return res.status(409).json({
        success: false,
        message: errorMessage,
      });
    }

    // Validate and sanitize numeric inputs
    const sanitizedPrice = parseFloat(price);
    const sanitizedStock = parseInt(stock);

    // Validate numeric inputs
    if (isNaN(sanitizedPrice) || sanitizedPrice <= 0) {
      return res.status(400).json({ message: 'Invalid price' });
    }

    if (isNaN(sanitizedStock) || sanitizedStock < 0) {
      return res.status(400).json({ message: 'Invalid stock quantity' });
    }
    // Create new product with user association
    const newProduct = new Product({
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
      status,
      image: req.file.location, // S3 URL
      Userdata: [userId], // Ensure this is an array
    });

    // Save product to database
    const savedProduct = await newProduct.save();

    // Update user's products array
    await userSchema.findByIdAndUpdate(
      userId,
      { $push: { product: savedProduct._id } },
      { new: true }
    );

    res.status(201).json({
      message: 'Product added successfully',
      product: savedProduct,
    });
  } catch (error) {
    console.error('Product Add Error:', error);
    res.status(500).json({
      message: 'Error adding product',
      error: error.message,
    });
  }
};
export const getproduct = async (req, res) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res
        .status(401)
        .json({ message: 'Authentication token is required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_KEY);
    const userId = decoded.id;

    // Find products associated with the user
    const products = await Product.find({
      Userdata: { $in: [userId] },
    });

    if (!products || products.length === 0) {
      return res.status(404).json({
        message: 'No products found for this user',
        products: [],
      });
    }

    res.status(200).json({
      message: 'Products retrieved successfully',
      products: products,
    });
  } catch (error) {
    console.error('Error retrieving products:', error);
    res.status(500).json({
      message: 'Error retrieving products',
      error: error.message,
    });
  }
};
export const updateproduct = async (req, res) => {
  const { id } = req.params;

  try {
    // Prepare the update object
    const updateData = {
      name: req.body.name,
      description: req.body.description,
      price: parseFloat(req.body.price),
      stock: parseInt(req.body.stock),
      status: req.body.status,
    };

    // If a new image is uploaded, add the image URL
    if (req.file) {
      updateData.image = req.file.location; // Use the S3 URL from multer-s3
    }

    // Find and update the product
    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message,
    });
  }
};
export const Deleteproduct = async (req, res) => {
  console.log('to delete the product id is here', req.params.id);
  try {
    const productid = req.params.id;
    const token = req.cookies.jwt;

    if (!token) {
      return res
        .status(401)
        .json({ message: 'Authentication token is required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_KEY);
    const userId = decoded.id;

    await Product.findByIdAndDelete(productid);
    await userSchema.findByIdAndUpdate(
      userId,
      { $pull: { product: productid } },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message,
    });
  }
};
