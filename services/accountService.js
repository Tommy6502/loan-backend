import Account from '../models/Account.js';
import User from '../models/User.js';

/**
 * Account Service - handles account-related business logic
 */

export const createAccount = async (accountData) => {
  try {
    const { name, email, phone, userId } = accountData;
    
    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Create new account
    const account = new Account({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      userId
    });
    
    await account.save();
    
    console.log('✅ Account created successfully:', { 
      id: account._id, 
      email: account.email,
      userId: account.userId 
    });
    
    return account;
    
  } catch (error) {
    console.error('❌ Account creation failed:', error);
    throw error;
  }
};

export const getAccountById = async (accountId) => {
  try {
    const account = await Account.findById(accountId)
      .populate('userId', 'name email role');
    
    if (!account) {
      throw new Error('Account not found');
    }
    
    return account;
  } catch (error) {
    console.error('❌ Get account by ID failed:', error);
    throw error;
  }
};

export const getAccountsByUserId = async (userId) => {
  try {
    const accounts = await Account.find({ userId })
      .sort({ createdAt: -1 });
    
    return accounts;
  } catch (error) {
    console.error('❌ Get accounts by user ID failed:', error);
    throw error;
  }
};

export const getAllAccounts = async (filters = {}) => {
  try {
    const query = {};
    
    if (filters.status) {
      query.status = filters.status;
    }
    
    if (filters.accountType) {
      query.accountType = filters.accountType;
    }
    
    if (filters.verificationStatus) {
      query.verificationStatus = filters.verificationStatus;
    }
    
    const accounts = await Account.find(query)
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 });
    
    return accounts;
  } catch (error) {
    console.error('❌ Get all accounts failed:', error);
    throw error;
  }
};

export const updateAccount = async (accountId, updateData) => {
  try {
    const account = await Account.findByIdAndUpdate(
      accountId,
      updateData,
      { new: true, runValidators: true }
    ).populate('userId', 'name email role');
    
    if (!account) {
      throw new Error('Account not found');
    }
    
    return account;
  } catch (error) {
    console.error('❌ Update account failed:', error);
    throw error;
  }
};

export const deleteAccount = async (accountId) => {
  try {
    const account = await Account.findByIdAndDelete(accountId);
    
    if (!account) {
      throw new Error('Account not found');
    }
    
    return account;
  } catch (error) {
    console.error('❌ Delete account failed:', error);
    throw error;
  }
};