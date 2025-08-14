import nodemailer from 'nodemailer';
import 'dotenv/config';

/**
 * Email Service for sending notifications
 * Production-ready implementation with SMTP support
 */
console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
console.log(process.env.SMTP_HOST, process.env.SMTP_PORT, process.env.SMTP_USER, process.env.SMTP_PASS);

// Create SMTP transporter
const createTransporter = () => {
  

  // For production, use real SMTP service
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'mail.servicemitteilung.de',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

/**
 * Send welcome email with login credentials to new users
 */
export async function sendWelcomeEmailWithCredentials(userData) {
  const { name, email, loanAmount, loanType, leadId, password } = userData;
  
  console.log('📧 Sending welcome email with credentials...');
  console.log('To:', email);
  
  try {
    const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // TLS for port 465, false for 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
    
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'info@servicemitteilung.de',
      to: email,
      subject: 'Welcome! Your Loan Application & Account Details',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
            .credentials-box { background: #fff; border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .credentials-box h3 { color: #dc2626; margin-top: 0; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
            .highlight { background: #fef3c7; padding: 2px 6px; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to Financial Solutions!</h1>
              <p>Your loan application has been received</p>
            </div>
            
            <div class="content">
              <h2>Hello ${name},</h2>
              
              <p>Thank you for your loan application! We've received your request for a <strong>${loanType} loan of $${Number(loanAmount).toLocaleString()}</strong>.</p>
              
              <div class="credentials-box">
                <h3>🔐 Your Account Login Details</h3>
                <p>We've created an account for you to track your application progress:</p>
                <p><strong>Email:</strong> <span class="highlight">${email}</span></p>
                <p><strong>Password:</strong> <span class="highlight">${password}</span></p>
                <p><strong>Application ID:</strong> ${leadId}</p>
                
                <p style="color: #dc2626; font-weight: bold;">⚠️ Please save these credentials and change your password after first login for security.</p>
              </div>
              
              <h3>📋 Application Details:</h3>
              <ul>
                <li><strong>Loan Amount:</strong> $${Number(loanAmount).toLocaleString()}</li>
                <li><strong>Loan Type:</strong> ${loanType}</li>
                <li><strong>Status:</strong> Under Review</li>
                <li><strong>Application ID:</strong> ${leadId}</li>
              </ul>
              
              <h3>🚀 What's Next:</h3>
              <ol>
                <li>Our team will review your application within 2-3 business days</li>
                <li>You may receive a call from our loan specialists</li>
                <li>Log in to your account to track progress and upload documents</li>
                <li>We'll send updates to this email address</li>
              </ol>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="button" style="color: white;">
                  Login to Your Account
                </a>
              </div>
              
              <div style="background: #ecfdf5; border: 1px solid #10b981; border-radius: 6px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #065f46;">
                  <strong>🔒 Security Note:</strong> We use bank-level encryption to protect your information. 
                  Never share your login credentials with anyone.
                </p>
              </div>
            </div>
            
            <div class="footer">
              <p>If you have any questions, please contact us at support@financialsolutions.com</p>
              <p>© 2025 Financial Solutions. All rights reserved.</p>
              <p style="font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Welcome to Financial Solutions!
        
        Hello ${name},
        
        Thank you for your loan application! We've received your request for a ${loanType} loan of $${Number(loanAmount).toLocaleString()}.
        
        YOUR ACCOUNT LOGIN DETAILS:
        Email: ${email}
        Password: ${password}
        Application ID: ${leadId}
        
        ⚠️ Please save these credentials and change your password after first login for security.
        
        APPLICATION DETAILS:
        - Loan Amount: $${Number(loanAmount).toLocaleString()}
        - Loan Type: ${loanType}
        - Status: Under Review
        - Application ID: ${leadId}
        
        WHAT'S NEXT:
        1. Our team will review your application within 2-3 business days
        2. You may receive a call from our loan specialists
        3. Log in to your account to track progress and upload documents
        4. We'll send updates to this email address
        
        Login at: ${process.env.FRONTEND_URL || 'http://localhost:5173'}
        
        If you have any questions, please contact us at support@financialsolutions.com
        
        © 2025 Financial Solutions. All rights reserved.
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Welcome email sent successfully');
    console.log('Message ID:', info.messageId);
    
    // For development, show preview URL
    if (process.env.NODE_ENV !== 'production') {
      console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    return {
      success: true,
      messageId: info.messageId,
      recipient: email,
      previewUrl: process.env.NODE_ENV !== 'production' ? nodemailer.getTestMessageUrl(info) : null
    };
    
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error);
    throw new Error(`Email sending failed: ${error.message}`);
  }
}

/**
 * Send regular welcome email (for existing users)
 */
export async function sendWelcomeEmail(userData) {
  const { name, email, loanAmount, loanType, leadId } = userData;
  
  console.log('📧 Sending welcome email...');
  console.log('To:', email);
  
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@financialsolutions.com',
      to: email,
      subject: 'Loan Application Received - Thank You!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📋 Application Received!</h1>
              <p>Thank you for choosing Financial Solutions</p>
            </div>
            
            <div class="content">
              <h2>Hello ${name},</h2>
              
              <p>We've received your additional loan application for a <strong>${loanType} loan of $${Number(loanAmount).toLocaleString()}</strong>.</p>
              
              <h3>📋 Application Details:</h3>
              <ul>
                <li><strong>Loan Amount:</strong> $${Number(loanAmount).toLocaleString()}</li>
                <li><strong>Loan Type:</strong> ${loanType}</li>
                <li><strong>Status:</strong> Under Review</li>
                <li><strong>Application ID:</strong> ${leadId}</li>
              </ul>
              
              <h3>🚀 What's Next:</h3>
              <ol>
                <li>Our team will review your application within 2-3 business days</li>
                <li>You may receive a call from our loan specialists</li>
                <li>Log in to your account to track progress</li>
                <li>We'll send updates to this email address</li>
              </ol>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="button" style="color: white;">
                  Login to Your Account
                </a>
              </div>
            </div>
            
            <div class="footer">
              <p>If you have any questions, please contact us at support@financialsolutions.com</p>
              <p>© 2025 Financial Solutions. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Welcome email sent successfully');
    console.log('Message ID:', info.messageId);
    
    return {
      success: true,
      messageId: info.messageId,
      recipient: email
    };
    
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error);
    throw new Error(`Email sending failed: ${error.message}`);
  }
}

/**
 * Generate a secure random password
 */
export function generateRandomPassword(length = 8) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  // Ensure at least one of each type
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Uppercase
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Lowercase
  password += '0123456789'[Math.floor(Math.random() * 10)]; // Number
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // Special char
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Production setup instructions:
 * 
 * 1. Environment Variables:
 *    SMTP_HOST=smtp.gmail.com (or your SMTP provider)
 *    SMTP_PORT=587
 *    SMTP_USER=your-email@gmail.com
 *    SMTP_PASS=your-app-password
 *    FROM_EMAIL=noreply@yourcompany.com
 *    FRONTEND_URL=https://yourapp.com
 * 
 * 2. Gmail Setup (if using Gmail):
 *    - Enable 2-factor authentication
 *    - Generate App Password
 *    - Use App Password as SMTP_PASS
 * 
 * 3. Other SMTP Providers:
 *    - SendGrid: smtp.sendgrid.net
 *    - Mailgun: smtp.mailgun.org
 *    - AWS SES: email-smtp.region.amazonaws.com
 */