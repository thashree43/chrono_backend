import mongoose from 'mongoose';

const UserModel = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    mobile: {
      type: Number,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    is_Admin: {
      type: Boolean,
      default: false,
    },
    is_Verified: {
      type: Boolean,
      default: false,
    },
    token: {
      type: String,
      default: '',
    },
    product: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    customers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
      },
    ],
    sales: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sales',
      },
    ],
  },

  { timestamps: true }
);
const userSchema = mongoose.model('user', UserModel);
export default userSchema;
