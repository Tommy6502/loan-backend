import jwt from 'jsonwebtoken';
import { createUser, authenticateUser, getUserById } from './services/userService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Register new user
export async function registerUser(userData) {
  try {
    const newUser = await createUser(userData);
    return newUser;
  } catch (error) {
    throw error;
  }
}

// Login user
export async function loginUser(email, password) {
  try {
    console.log('🔐 Attempting to authenticate user:', email);
    const user = await authenticateUser(email, password);
    console.log('✅ User authenticated successfully:', { id: user._id, email: user.email, role: user.role });
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    console.log('🎫 JWT token generated for user:', user.email);
    
    return {
      user,
      token
    };
    
  } catch (error) {
    throw error;
  }
}

// Verify JWT token
export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ Token verified for user:', decoded.email);
    return decoded;
  } catch (error) {
    console.log('❌ Token verification failed:', error.message);
    throw new Error('Invalid or expired token');
  }
}

// Middleware to authenticate requests
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }
  
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
}

// Middleware to check admin role
export function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
}