import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Account name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'suspended'],
    default: 'active'
  },
  accountType: {
    type: String,
    enum: ['individual', 'business'],
    default: 'individual'
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Indexes for faster queries
accountSchema.index({ userId: 1 });
accountSchema.index({ email: 1 });
accountSchema.index({ status: 1 });

export default mongoose.model('Account', accountSchema);