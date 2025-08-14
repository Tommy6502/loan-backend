import User from '../models/User.js';
import Account from '../models/Account.js';
import mongoose from 'mongoose';

/**
 * User Service - handles user-related business logic
 */

export const createUser = async (userData) => {
  try {
    const { name, email, phone, password, role = 'user' } = userData;
    
    console.log('👤 Creating user with Mongoose:', { email, role });
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      email: email.toLowerCase() 
    }).lean(); // Use lean() for better performance when we don't need the full document
    
    if (existingUser) {
      console.log('❌ User already exists:', email);
      throw new Error('User already exists with this email');
    }
    
    // Create new user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim(),
      password,
      role
    });
    
    await user.save();
    
    console.log('✅ User created successfully with Mongoose:', { 
      id: user._id, 
      email: user.email, 
      role: user.role 
    });
    
    return user;
    
  } catch (error) {
    if (error.code === 11000) {
      // MongoDB duplicate key error
      throw new Error('User already exists with this email');
    }
    console.error('❌ User creation failed:', error);
    throw error;
  }
};

export const authenticateUser = async (email, password) => {
  try {
    console.log('🔐 Authenticating user with Mongoose:', email);
    
    // Find user by email (include password for comparison)
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      isActive: true 
    }).select('+password');
    
    if (!user) {
      console.log('❌ User not found:', email);
      throw new Error('Invalid email or password');
    }
    
    console.log('👤 User found:', { 
      id: user._id, 
      email: user.email, 
      role: user.role,
      isActive: user.isActive,
      mongooseVersion: mongoose.version
    });
    
    // Compare password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      console.log('❌ Invalid password for:', email);
      throw new Error('Invalid email or password');
    }
    
    console.log('✅ Password validation successful for:', email);
    
    // Update last login
    try {
      await user.updateLastLogin();
      console.log('📅 Last login updated for:', email);
    } catch (loginUpdateError) {
      console.warn('⚠️ Failed to update last login:', loginUpdateError.message);
      // Don't fail authentication if login update fails
    }
    
    // Return user without password
    const userResponse = user.toJSON();
    
    console.log('✅ Authentication successful:', { 
      email: userResponse.email, 
      role: userResponse.role 
    });
    
    return userResponse;
    
  } catch (error) {
    console.error('❌ Authentication failed:', error);
    throw error;
  }
};

export const getUserById = async (userId) => {
  try {
    console.log('🔍 Finding user by ID with Mongoose:', userId);
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID format');
    }
    
    const user = await User.findById(userId)
      .select('-password')
      .lean();
      
    if (!user) {
      throw new Error('User not found');
    }
    
    console.log('✅ User found by ID:', { id: user._id, email: user.email });
    return user;
  } catch (error) {
    console.error('❌ Get user by ID failed:', error);
    throw error;
  }
};

export const getUserByEmail = async (email) => {
  try {
    console.log('🔍 Finding user by email with Mongoose:', email);
    const user = await User.findOne({ 
      email: email.toLowerCase() 
    }).lean();
    
    if (user) {
      console.log('✅ User found by email:', { id: user._id, email: user.email });
    } else {
      console.log('❌ No user found with email:', email);
    }
    
    return user;
  } catch (error) {
    console.error('❌ Get user by email failed:', error);
    throw error;
  }
};

export const updateUser = async (userId, updateData) => {
  try {
    const user = await User.findByIdAndUpdate(
      userId, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  } catch (error) {
    console.error('❌ Update user failed:', error);
    throw error;
  }
};

export const getAllUsers = async (filters = {}) => {
  try {
    console.log('📋 Getting all users with Mongoose, filters:', filters);
    
    const query = {};
    
    if (filters.role) {
      query.role = filters.role;
    }
    
    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }
    
    const users = await User.find(query, '-password') // Exclude password field
      .sort({ createdAt: -1 })
      .lean();
    
    console.log('✅ Found users:', users.length);
    return users;
  } catch (error) {
    console.error('❌ Get all users failed:', error);
    throw error;
  }
};

export const deactivateUser = async (userId) => {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    );
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  } catch (error) {
    console.error('❌ Deactivate user failed:', error);
    throw error;
  }
};