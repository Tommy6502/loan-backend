import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import connectDB, { createDefaultAdmin } from './config/database.js';
import { registerUser, loginUser, authenticateToken, requireAdmin } from './authRoutes.js';
import { submitLeadToSalesforce, createAccount } from './salesforceMock.js';
import { createAccount as createAccountService } from './services/accountService.js';
import { getAccountsByUserId } from './services/accountService.js';
import { updateAccount } from './services/accountService.js';
import { createLead } from './services/leadService.js';
import { getUserByEmail, getAllUsers } from './services/userService.js';
import { getAllAccounts } from './services/accountService.js';
import { getAllLeads, getLeadStats } from './services/leadService.js';
import { sendWelcomeEmail, sendWelcomeEmailWithCredentials, generateRandomPassword } from './emailService.js';

const app = express();
const PORT = 8000;

console.log('🚀 Starting Financial Lead Capture API...');
console.log('📦 Using Mongoose version:', mongoose.version);

// Connect to MongoDB
try {
  await connectDB();
  console.log('✅ Database connection established');
} catch (error) {
  console.error('❌ Failed to connect to database:', error);
  process.exit(1);
}

// Create default admin user
try {
  await createDefaultAdmin();
  console.log('✅ Default admin setup completed');
} catch (error) {
  console.error('❌ Failed to create default admin:', error);
}

// Middleware
app.use(cors());
app.use(express.json());

// Auth endpoints
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }
    
    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }
    
    const user = await registerUser({ name, email, phone, password });
    
    res.json({
      success: true,
      message: 'User registered successfully',
      data: { user }
    });
    
  } catch (error) {
    console.error('❌ Registration error:', error);
    
    // Handle duplicate email error
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed'
    });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    const result = await loginUser(email, password);
    
    res.json({
      success: true,
      message: 'Login successful',
      data: result
    });
    
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(401).json({
      success: false,
      message: error.message || 'Login failed'
    });
  }
});

// Verify token endpoint
app.get('/api/verify-token', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: { user: req.user }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Financial Lead Capture API is running' });
});

// Lead submission endpoint
app.post('/api/submit-lead', async (req, res) => {
  try {
    const { loanAmount, loanType, name, email, phone, userId } = req.body;

    // Validate required fields
    if (!loanAmount || !loanType || !name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
        errors: {
          loanAmount: !loanAmount ? 'Loan amount is required' : null,
          loanType: !loanType ? 'Loan type is required' : null,
          name: !name ? 'Name is required' : null,
          email: !email ? 'Email is required' : null,
          phone: !phone ? 'Phone is required' : null,
        }
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
        errors: { email: 'Please enter a valid email address' }
      });
    }

    // Validate loan amount
    if (isNaN(loanAmount) || loanAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid loan amount',
        errors: { loanAmount: 'Please enter a valid loan amount' }
      });
    }

    // Check if user exists and handle first-time vs returning users
    let user = null;
    let isFirstTimeUser = false;
    let generatedPassword = null;
    
    if (userId) {
      // User is logged in
      console.log('🔐 Processing loan for logged-in user:', userId);
      const existingUser = await getUserByEmail(email);
      if (!existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User not found'
        });
      }
      user = existingUser;
      console.log('✅ Existing logged-in user found:', user.email);
    } else {
      // Check if user exists by email
      console.log('🔍 Checking if user exists for email:', email);
      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        // Existing user submitting another loan
        user = existingUser;
        console.log('✅ Existing user found, processing additional loan application');
      } else {
        // First-time user - auto-register with generated password
        console.log('🆕 First-time user detected, creating account...');
        isFirstTimeUser = true;
        generatedPassword = generateRandomPassword(10);
        
        user = await registerUser({
          name,
          email,
          phone,
          password: generatedPassword,
          role: 'user'
        });
        
        console.log('✅ New user auto-registered:', {
          id: user._id,
          email: user.email,
          hasGeneratedPassword: !!generatedPassword
        });
      }
    }

    // Simulate processing delay (realistic API response time)
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Submit to Salesforce (mocked)
    const salesforceResult = await submitLeadToSalesforce({
      loanAmount,
      loanType,
      name,
      email,
      phone
    });

    // Create or update account
    // Check if account already exists for this user
    let accountResult = await getAccountsByUserId(user._id);
    if (accountResult.length === 0) {
      // Create new account if none exists
      console.log('📋 Creating new account for user:', user._id);
      accountResult = await createAccountService({
        name,
        email,
        phone,
        userId: user._id
      });
    } else {
      // Use existing account
      accountResult = accountResult[0];
      console.log('📋 Using existing account:', accountResult._id);
    }

    // Update account with latest information if needed
    if (accountResult.name !== name || accountResult.email !== email || accountResult.phone !== phone) {
      console.log('📝 Updating account information...');
      accountResult = await updateAccount(accountResult._id, {
        name,
        email,
        phone
      });
    }


    // Create lead record
    const leadResult = await createLead({
      accountId: accountResult._id,
      userId: user._id,
      loanAmount,
      loanType,
      status: 'new'
    });

    // Send appropriate welcome email
    try {
      if (isFirstTimeUser && generatedPassword) {
        // Send welcome email with login credentials for new users
        console.log('📧 Sending welcome email with credentials to new user');
        await sendWelcomeEmailWithCredentials({
          name,
          email,
          loanAmount,
          loanType,
          leadId: leadResult._id,
          password: generatedPassword
        });
      } else {
        // Send regular welcome email for existing users
        // console.log('📧 Sending regular welcome email to existing user');
        // await sendWelcomeEmail({
        //   name,
        //   email,
        //   loanAmount,
        //   loanType,
        //   leadId: leadResult._id
        // });
      }
    } catch (emailError) {
      console.error('❌ Failed to send welcome email:', emailError);
      // Don't fail the entire request if email fails
    }

    console.log('✅ Lead processed successfully:', {
      salesforceId: salesforceResult.id,
      accountId: accountResult._id,
      leadId: leadResult._id,
      userId: user._id,
      isFirstTimeUser,
      emailSent: true,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: isFirstTimeUser 
        ? 'Application submitted! Check your email for login credentials.'
        : 'Lead submitted successfully',
      data: {
        leadId: salesforceResult.id,
        accountId: accountResult._id,
        userId: user._id,
        isFirstTimeUser,
        nextStepUrl: '/loan-application-process', // Mock next step URL
        estimatedProcessingTime: '2-3 business days'
      }
    });

  } catch (error) {
    console.error('❌ Error processing lead:', error);
    
    res.status(500).json({
      success: false,
      message: 'An error occurred while processing your application. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Protected admin routes
app.use('/api/admin', authenticateToken, requireAdmin);

// Admin endpoints
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

app.get('/api/admin/accounts', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const accounts = await getAllAccounts();
    res.json({
      success: true,
      data: accounts
    });
  } catch (error) {
    console.error('❌ Error fetching accounts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch accounts'
    });
  }
});

app.get('/api/admin/leads', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const leads = await getAllLeads();
    res.json({
      success: true,
      data: leads
    });
  } catch (error) {
    console.error('❌ Error fetching leads:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leads'
    });
  }
});

app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await getLeadStats();
    const totalUsers = await getAllUsers();
    
    res.json({
      success: true,
      data: {
        ...stats,
        totalUsers: totalUsers.length
      }
    });
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Financial Lead Capture API running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🗄️ Database: MongoDB with Mongoose ${mongoose.version}`);
  console.log(`🔗 Connection state: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
});