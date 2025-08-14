import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  loanAmount: {
    type: Number,
    required: [true, 'Loan amount is required'],
    min: [1000, 'Minimum loan amount is $1,000'],
    max: [10000000, 'Maximum loan amount is $10,000,000']
  },
  loanType: {
    type: String,
    required: [true, 'Loan type is required'],
    enum: ['Personal', 'Business', 'Mortgage']
  },
  status: {
    type: String,
    enum: ['new', 'in_review', 'approved', 'rejected', 'pending_documents', 'funded'],
    default: 'new'
  },
  leadScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  salesforceId: {
    type: String,
    trim: true
  },
  estimatedRate: {
    type: String,
    trim: true
  },
  processingNotes: [{
    note: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  documents: [{
    name: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  followUpDate: {
    type: Date
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for faster queries
leadSchema.index({ userId: 1 });
leadSchema.index({ accountId: 1 });
leadSchema.index({ status: 1 });
leadSchema.index({ loanType: 1 });
leadSchema.index({ leadScore: -1 });
leadSchema.index({ createdAt: -1 });

// Calculate lead score based on loan details
leadSchema.methods.calculateLeadScore = function() {
  let score = 50; // Base score
  
  // Score based on loan amount
  if (this.loanAmount >= 100000) score += 30;
  else if (this.loanAmount >= 50000) score += 20;
  else if (this.loanAmount >= 25000) score += 10;
  
  // Score based on loan type
  switch (this.loanType) {
    case 'Mortgage':
      score += 25;
      break;
    case 'Business':
      score += 20;
      break;
    case 'Personal':
      score += 10;
      break;
  }
  
  this.leadScore = Math.min(score, 100);
  return this.leadScore;
};

// Get estimated interest rate
leadSchema.methods.getEstimatedRate = function() {
  let baseRate;
  
  switch (this.loanType) {
    case 'Mortgage':
      baseRate = 6.5;
      break;
    case 'Business':
      baseRate = 8.5;
      break;
    case 'Personal':
      baseRate = 12.5;
      break;
    default:
      baseRate = 10.0;
  }
  
  // Adjust rate based on amount (larger amounts get better rates)
  if (this.loanAmount >= 100000) baseRate -= 1.0;
  else if (this.loanAmount >= 50000) baseRate -= 0.5;
  
  this.estimatedRate = `${baseRate.toFixed(2)}%`;
  return this.estimatedRate;
};

export default mongoose.model('Lead', leadSchema);