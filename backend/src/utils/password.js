const bcrypt = require('bcrypt');

/**
 * Password utility module for secure password management
 * Handles hashing, verification, and validation
 */

const SALT_ROUNDS = 10; // bcrypt salt rounds for security

/**
 * Hash a plain text password
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
async function hashPassword(password) {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string');
  }
  
  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  return hash;
}

/**
 * Verify a plain text password against a hash
 * @param {string} password - Plain text password to verify
 * @param {string} hash - Stored password hash
 * @returns {Promise<boolean>} True if password matches
 */
async function verifyPassword(password, hash) {
  if (!password || !hash) {
    return false;
  }
  
  try {
    return await bcrypt.compare(password, hash);
  } catch (err) {
    console.error('Password verification error:', err);
    return false;
  }
}

/**
 * Validate password strength
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character (!@#$%^&*)
 * @param {string} password - Password to validate
 * @returns {object} { valid: boolean, errors: string[] }
 */
function validatePasswordStrength(password) {
  const errors = [];
  
  if (!password || typeof password !== 'string') {
    return { valid: false, errors: ['Password must be a non-empty string'] };
  }
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Check if password has expired (optional feature)
 * @param {Date} lastChanged - Last password change date
 * @param {number} maxAgeDays - Maximum password age in days (default: 90)
 * @returns {boolean} True if password has expired
 */
function isPasswordExpired(lastChanged, maxAgeDays = 90) {
  if (!lastChanged) return true;
  
  const now = new Date();
  const daysSinceChange = (now - new Date(lastChanged)) / (1000 * 60 * 60 * 24);
  
  return daysSinceChange > maxAgeDays;
}

/**
 * Generate a temporary password for password reset
 * @param {number} length - Length of temporary password (default: 12)
 * @returns {string} Temporary password
 */
function generateTemporaryPassword(length = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return password;
}

/**
 * Create password reset token with expiry
 * @param {string} userId - User ID
 * @param {number} expiryMinutes - Token expiry time in minutes (default: 30)
 * @returns {object} { token: string, expiresAt: Date }
 */
function createPasswordResetToken(userId, expiryMinutes = 30) {
  const token = Buffer.from(`${userId}:${Date.now()}`).toString('base64');
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
  
  return { token, expiresAt };
}

/**
 * Verify password reset token
 * @param {string} token - Reset token
 * @param {Date} expiresAt - Token expiry date
 * @returns {boolean} True if token is valid and not expired
 */
function verifyPasswordResetToken(token, expiresAt) {
  if (!token || !expiresAt) return false;
  
  return new Date() <= new Date(expiresAt);
}

module.exports = {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
  isPasswordExpired,
  generateTemporaryPassword,
  createPasswordResetToken,
  verifyPasswordResetToken
};
