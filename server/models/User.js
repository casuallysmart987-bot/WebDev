// server/models/User.js
import mongoose from 'mongoose';
import validator from 'validator';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,                  
      lowercase: true,         
      validate: {
        validator: (v) => validator.isEmail(v),
        message: 'Please enter a valid email address',
      },
    },

    passwordHash: {
      type: String,
      // optional for Google OAuth users
      default: null,
    },

    googleId: {
      type: String,
      default: null,               
    },

    isVerified: {
      type: Boolean,
      default: false,   
    },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);