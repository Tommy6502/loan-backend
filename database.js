export const getUserByEmail = () => { throw new Error('Use userService.getUserByEmail instead'); };
export const getUserById = () => { throw new Error('Use userService.getUserById instead'); };
export const getAllAccounts = () => { throw new Error('Use accountService.getAllAccounts instead'); };
export const getAllLeads = () => { throw new Error('Use leadService.getAllLeads instead'); };
export const createLead = () => { throw new Error('Use leadService.createLead instead'); };
export const createAccount = () => { throw new Error('Use accountService.createAccount instead'); };
export const db = null;
// Legacy exports for backward compatibility (will be removed)

console.log('⚠️ This database.js file is deprecated. Using MongoDB with Mongoose models instead.');

//  **/
//  * This file is kept for reference but is no longer used.
//  * 
//  * - server/services/ - Business logic services
//  * - server/models/ - Mongoose models
//  * - server/config/database.js - MongoDB connection
//  * The database functionality is now handled by:
//  * This file has been replaced by MongoDB models and services.
// /**