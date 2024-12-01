import mongoose from 'mongoose';

const ProductModel = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    stock: {
      // Changed from quantity to stock to match your frontend
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['In Stock', 'Low Stock', 'Limited'],
      default: 'In Stock',
    },
    image: {
      type: String,
      required: true,
    },
    Userdata: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Product', ProductModel);
