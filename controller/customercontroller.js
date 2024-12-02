import { CustomerSchema } from '../model/customerModel.js';
import jwt from 'jsonwebtoken';
import Cookie from 'cookie';
import userSchema from '../model/usermodel.js';

export const Addcustomer = async (req, res) => {
  console.log('the customers data', req.body);

  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res
        .status(401)
        .json({ message: 'Authentication token is required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_KEY);
    const userId = decoded.id;
    const { name, address, mobile } = req.body;

    if (!name || !address || !mobile) {
      return res.status(400).json({
        message: 'Missing required fields',
      });
    }
    const existingCustomer = await CustomerSchema.findOne({
      $or: [
        { name: { $regex: new RegExp(`^${name}$`, 'i') } },
        { mobile: mobile },
      ],
      user: userId,
    });

    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message:
          existingCustomer.name.toLowerCase() === name.toLowerCase()
            ? 'A customer with this name already exists'
            : 'A customer with this mobile number already exists',
      });
    }

    const newcustomer = new CustomerSchema({
      name: name,
      address: address,
      mobile: mobile,
      user: [userId],
    });
    const customerData = await newcustomer.save();
    if (newcustomer) {
      await userSchema.findByIdAndUpdate(
        userId,
        { $push: { customers: newcustomer._id } },
        { new: true }
      );
    }
    res.status(201).json({
      message: 'Customer added successfully',
      customer: customerData,
    });
  } catch (error) {
    console.error(error);
  }
};

export const getCustomers = async (req, res) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res
        .status(401)
        .json({ message: 'Authentication token is required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_KEY);
    const userId = decoded.id;

    const Customers = await CustomerSchema.find({
      user: { $in: [userId] },
    });

    if (!Customers || Customers.length === 0) {
      return res.status(200).json({
        message: 'No Customers found for this user',
        Customers: [],
      });
    }

    res.status(200).json({
      message: 'Customers retrieved successfully',
      Customers: Customers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
};
export const updateCustomer = async (req, res) => {
  console.log(req.params.id);
  try {
    let id = req.params.id;
    const { name, address, mobile } = req.body;

    if (!name | !address | !mobile) {
      res.status(209).json({ message: 'tthe field doesnt updated' });
    }

    const updatedata = {
      name: name,
      address: address,
      mobile: mobile,
    };

    const updateddatas = await CustomerSchema.findByIdAndUpdate(
      id,
      updatedata,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updateddatas) {
      return res.status(404).json({
        success: false,
        message: 'customer not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Customerdata updated successfully',
      product: updateddatas,
    });
  } catch (error) {
    console.error(error);
  }
};
export const deleteCustomer = async (req, res) => {
  try {
    const id = req.params.id;
    const token = req.cookies.jwt;

    if (!token) {
      return res
        .status(401)
        .json({ message: 'Authentication token is required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_KEY);
    const userId = decoded.id;

    await CustomerSchema.findByIdAndDelete(id);
    await userSchema.findByIdAndUpdate(
      userId,
      { $pull: { customers: id } },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: 'Customer deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete customer',
      error: error.message,
    });
  }
};
