/**
 * Mock Salesforce API integration
 * This file simulates real Salesforce REST API calls for lead creation and account management.
 * In production, replace these functions with actual Salesforce API calls using jsforce or axios.
 */

// Simulate Salesforce authentication token (in production, handle OAuth flow)
const MOCK_SF_TOKEN = 'mock_salesforce_session_token';

/**
 * Mock function to submit lead to Salesforce
 * In production, this would make a POST request to: 
 * https://yourinstance.salesforce.com/services/data/v57.0/sobjects/Lead/
 */
export async function submitLeadToSalesforce(leadData) {
  console.log('📝 [MOCK] Submitting lead to Salesforce...');
  console.log('Lead Data:', leadData);

  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Mock Salesforce Lead object creation
  const mockLeadId = `00Q${Math.random().toString(36).substr(2, 15)}`;
  
  const salesforcePayload = {
    FirstName: leadData.name.split(' ')[0],
    LastName: leadData.name.split(' ').slice(1).join(' ') || 'Unknown',
    Email: leadData.email,
    Phone: leadData.phone,
    Company: 'Financial Services Lead', // Required field in Salesforce
    LeadSource: 'Website Form',
    Status: 'New',
    // Custom fields for loan information
    Loan_Amount__c: parseFloat(leadData.loanAmount),
    Loan_Type__c: leadData.loanType,
    Interest_Level__c: 'High',
    Lead_Score__c: calculateLeadScore(leadData)
  };

  console.log('📤 [MOCK] Salesforce API Request:', {
    endpoint: 'https://yourinstance.salesforce.com/services/data/v57.0/sobjects/Lead/',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${MOCK_SF_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: salesforcePayload
  });

  // Simulate successful response
  const mockResponse = {
    id: mockLeadId,
    success: true,
    created: true,
    errors: []
  };

  console.log('✅ [MOCK] Salesforce Lead Created:', mockResponse);
  return mockResponse;
}

/**
 * Mock function to create account in system
 * In production, this might create a record in your application database
 * or trigger additional workflows in Salesforce
 */
export async function createAccount(userData) {
  console.log('👤 [MOCK] Creating account...');
  
  // Simulate account creation delay
  await new Promise(resolve => setTimeout(resolve, 600));

  const mockAccountId = `acc_${Math.random().toString(36).substr(2, 12)}`;
  
  const accountData = {
    id: mockAccountId,
    name: userData.name,
    email: userData.email,
    phone: userData.phone,
    status: 'pending_verification',
    createdAt: new Date().toISOString(),
    leadDetails: {
      loanAmount: userData.loanAmount,
      loanType: userData.loanType,
      estimatedRate: calculateEstimatedRate(userData.loanType, userData.loanAmount)
    }
  };

  console.log('✅ [MOCK] Account Created:', accountData);
  
  // In production, you might also:
  // - Send welcome email
  // - Create entry in your database
  // - Set up user authentication
  // - Trigger additional workflows

  return accountData;
}

/**
 * Calculate lead score based on loan details
 * Higher amounts and certain loan types get higher scores
 */
function calculateLeadScore(leadData) {
  let score = 50; // Base score
  
  const amount = parseFloat(leadData.loanAmount);
  
  // Score based on loan amount
  if (amount >= 100000) score += 30;
  else if (amount >= 50000) score += 20;
  else if (amount >= 25000) score += 10;
  
  // Score based on loan type
  switch (leadData.loanType) {
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
  
  return Math.min(score, 100); // Cap at 100
}

/**
 * Calculate estimated interest rate based on loan type and amount
 * This is a simplified calculation for demo purposes
 */
function calculateEstimatedRate(loanType, loanAmount) {
  const amount = parseFloat(loanAmount);
  let baseRate;
  
  switch (loanType) {
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
  if (amount >= 100000) baseRate -= 1.0;
  else if (amount >= 50000) baseRate -= 0.5;
  
  return `${baseRate.toFixed(2)}%`;
}

/**
 * Production implementation notes:
 * 
 * 1. Replace mock functions with real Salesforce API calls:
 *    - Install jsforce: npm install jsforce
 *    - Set up OAuth authentication
 *    - Use proper Salesforce REST API endpoints
 * 
 * 2. Handle authentication securely:
 *    - Store credentials in environment variables
 *    - Implement token refresh logic
 *    - Use Salesforce Connected Apps for OAuth
 * 
 * 3. Add proper error handling:
 *    - Network timeouts
 *    - Salesforce API limits
 *    - Duplicate lead detection
 * 
 * 4. Consider using Salesforce webhooks for real-time updates
 * 
 * Example real implementation:
 * 
 * import jsforce from 'jsforce';
 * 
 * const conn = new jsforce.Connection({
 *   oauth2: {
 *     clientId: process.env.SF_CLIENT_ID,
 *     clientSecret: process.env.SF_CLIENT_SECRET,
 *     redirectUri: process.env.SF_REDIRECT_URI
 *   }
 * });
 * 
 * await conn.login(process.env.SF_USERNAME, process.env.SF_PASSWORD + process.env.SF_SECURITY_TOKEN);
 * const result = await conn.sobject("Lead").create(leadData);
 */