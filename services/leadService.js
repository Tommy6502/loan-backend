import Lead from '../models/Lead.js';
import Account from '../models/Account.js';
import User from '../models/User.js';

/**
 * Lead Service - handles lead-related business logic
 */

export const createLead = async (leadData) => {
  try {
    const { accountId, userId, loanAmount, loanType, status = 'new' } = leadData;
    
    // Verify account and user exist
    const [account, user] = await Promise.all([
      Account.findById(accountId),
      User.findById(userId)
    ]);
    
    if (!account) {
      throw new Error('Account not found');
    }
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Create new lead
    const lead = new Lead({
      accountId,
      userId,
      loanAmount,
      loanType,
      status
    });
    
    // Calculate lead score and estimated rate
    lead.calculateLeadScore();
    lead.getEstimatedRate();
    
    await lead.save();
    
    console.log('✅ Lead created successfully:', { 
      id: lead._id, 
      loanAmount: lead.loanAmount,
      loanType: lead.loanType,
      leadScore: lead.leadScore,
      estimatedRate: lead.estimatedRate
    });
    
    return lead;
    
  } catch (error) {
    console.error('❌ Lead creation failed:', error);
    throw error;
  }
};

export const getLeadById = async (leadId) => {
  try {
    const lead = await Lead.findById(leadId)
      .populate('accountId', 'name email phone')
      .populate('userId', 'name email role')
      .populate('assignedTo', 'name email');
    
    if (!lead) {
      throw new Error('Lead not found');
    }
    
    return lead;
  } catch (error) {
    console.error('❌ Get lead by ID failed:', error);
    throw error;
  }
};

export const getLeadsByUserId = async (userId) => {
  try {
    const leads = await Lead.find({ userId })
      .populate('accountId', 'name email phone')
      .sort({ createdAt: -1 });
    
    return leads;
  } catch (error) {
    console.error('❌ Get leads by user ID failed:', error);
    throw error;
  }
};

export const getAllLeads = async (filters = {}) => {
  try {
    const query = {};
    
    if (filters.status) {
      query.status = filters.status;
    }
    
    if (filters.loanType) {
      query.loanType = filters.loanType;
    }
    
    if (filters.minAmount) {
      query.loanAmount = { ...query.loanAmount, $gte: filters.minAmount };
    }
    
    if (filters.maxAmount) {
      query.loanAmount = { ...query.loanAmount, $lte: filters.maxAmount };
    }
    
    if (filters.minScore) {
      query.leadScore = { ...query.leadScore, $gte: filters.minScore };
    }
    
    if (filters.assignedTo) {
      query.assignedTo = filters.assignedTo;
    }
    
    const leads = await Lead.find(query)
      .populate('accountId', 'name email phone')
      .populate('userId', 'name email role')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    
    return leads;
  } catch (error) {
    console.error('❌ Get all leads failed:', error);
    throw error;
  }
};

export const updateLead = async (leadId, updateData) => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      leadId,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('accountId', 'name email phone')
    .populate('userId', 'name email role')
    .populate('assignedTo', 'name email');
    
    if (!lead) {
      throw new Error('Lead not found');
    }
    
    return lead;
  } catch (error) {
    console.error('❌ Update lead failed:', error);
    throw error;
  }
};

export const addLeadNote = async (leadId, note, addedBy) => {
  try {
    const lead = await Lead.findById(leadId);
    
    if (!lead) {
      throw new Error('Lead not found');
    }
    
    lead.processingNotes.push({
      note,
      addedBy,
      addedAt: new Date()
    });
    
    await lead.save();
    
    return lead;
  } catch (error) {
    console.error('❌ Add lead note failed:', error);
    throw error;
  }
};

export const assignLead = async (leadId, assignedTo) => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      leadId,
      { assignedTo },
      { new: true }
    )
    .populate('assignedTo', 'name email');
    
    if (!lead) {
      throw new Error('Lead not found');
    }
    
    return lead;
  } catch (error) {
    console.error('❌ Assign lead failed:', error);
    throw error;
  }
};

export const getLeadStats = async () => {
  try {
    const stats = await Lead.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$loanAmount' },
          avgScore: { $avg: '$leadScore' }
        }
      }
    ]);
    
    const totalLeads = await Lead.countDocuments();
    const avgLoanAmount = await Lead.aggregate([
      { $group: { _id: null, avg: { $avg: '$loanAmount' } } }
    ]);
    
    return {
      totalLeads,
      avgLoanAmount: avgLoanAmount[0]?.avg || 0,
      statusBreakdown: stats
    };
  } catch (error) {
    console.error('❌ Get lead stats failed:', error);
    throw error;
  }
};