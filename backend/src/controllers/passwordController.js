const { pool } = require('../config/db');
const { hashPassword, verifyPassword, createPasswordResetToken, verifyPasswordResetToken, validatePasswordStrength, generateTemporaryPassword } = require('../utils/password');

/**
 * Request password reset - generates reset token
 * POST /api/auth/password-reset/request
 */
async function requestPasswordReset(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    // Check if user exists (member or staff)
    const [members] = await pool.execute('SELECT MemberID, FullName FROM MEMBER WHERE Email = ?', [email]);
    const [staff] = await pool.execute('SELECT StaffID, FullName FROM STAFF WHERE Email = ?', [email]);

    const user = members.length ? { id: members[0].MemberID, name: members[0].FullName, type: 'MEMBER' }
                 : staff.length ? { id: staff[0].StaffID, name: staff[0].FullName, type: 'STAFF' }
                 : null;

    if (!user) {
      // Return generic message for security (don't reveal if email exists)
      return res.json({ message: 'If email exists, password reset link has been sent' });
    }

    // Generate reset token
    const { token, expiresAt } = createPasswordResetToken(user.id, 30); // 30 minutes expiry

    // Store reset token in database
    const table = user.type === 'MEMBER' ? 'MEMBER' : 'STAFF';
    const idCol = user.type === 'MEMBER' ? 'MemberID' : 'StaffID';
    
    const resetTokenHash = await hashPassword(token);
    await pool.execute(
      `UPDATE ${table} SET PasswordResetToken = ?, PasswordResetExpiry = ? WHERE ${idCol} = ?`,
      [resetTokenHash, expiresAt, user.id]
    );

    // In production, send email with reset link:
    // const resetLink = `https://yourapp.com/reset-password?token=${token}`;
    // await sendEmail(email, 'Password Reset Request', resetLink);

    console.log(`Password reset requested for: ${email}`);
    console.log(`Reset token: ${token}`);
    console.log(`Expires at: ${expiresAt}`);

    return res.json({ 
      message: 'If email exists, password reset link has been sent',
      // For testing only - remove in production:
      _testToken: token,
      _testExpiry: expiresAt
    });
  } catch (err) {
    console.error('Password reset request error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

/**
 * Reset password with token
 * POST /api/auth/password-reset/confirm
 */
async function confirmPasswordReset(req, res) {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Token and new password are required' });
  }

  // Validate new password strength
  const validation = validatePasswordStrength(newPassword);
  if (!validation.valid) {
    return res.status(400).json({ 
      message: 'Password does not meet requirements',
      errors: validation.errors 
    });
  }

  try {
    // Find user by reset token (check both members and staff)
    const [members] = await pool.execute('SELECT MemberID, PasswordResetToken, PasswordResetExpiry FROM MEMBER LIMIT 100');
    const [staff] = await pool.execute('SELECT StaffID, PasswordResetToken, PasswordResetExpiry FROM STAFF LIMIT 100');

    let user = null;
    let userType = null;

    // Check members
    for (const member of members) {
      if (member.PasswordResetToken) {
        const match = await verifyPassword(token, member.PasswordResetToken);
        if (match && new Date() <= new Date(member.PasswordResetExpiry)) {
          user = member;
          userType = 'MEMBER';
          break;
        }
      }
    }

    // Check staff if not found in members
    if (!user) {
      for (const staffMember of staff) {
        if (staffMember.PasswordResetToken) {
          const match = await verifyPassword(token, staffMember.PasswordResetToken);
          if (match && new Date() <= new Date(staffMember.PasswordResetExpiry)) {
            user = staffMember;
            userType = 'STAFF';
            break;
          }
        }
      }
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid or expired reset token' });
    }

    // Hash new password
    const newHash = await hashPassword(newPassword);
    const table = userType === 'MEMBER' ? 'MEMBER' : 'STAFF';
    const idCol = userType === 'MEMBER' ? 'MemberID' : 'StaffID';
    const userId = userType === 'MEMBER' ? user.MemberID : user.StaffID;

    // Update password and clear reset token
    await pool.execute(
      `UPDATE ${table} SET PasswordHash = ?, PasswordResetToken = NULL, PasswordResetExpiry = NULL WHERE ${idCol} = ?`,
      [newHash, userId]
    );

    return res.json({ message: 'Password reset successful. You can now login with your new password.' });
  } catch (err) {
    console.error('Password reset confirmation error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

/**
 * Change password for authenticated user
 * POST /api/auth/password-change
 * Requires: Authorization header with JWT token
 */
async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user?.sub; // From JWT middleware
  const userRole = req.user?.role; // From JWT middleware

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current and new passwords are required' });
  }

  if (currentPassword === newPassword) {
    return res.status(400).json({ message: 'New password must be different from current password' });
  }

  // Validate new password strength
  const validation = validatePasswordStrength(newPassword);
  if (!validation.valid) {
    return res.status(400).json({ 
      message: 'Password does not meet requirements',
      errors: validation.errors 
    });
  }

  try {
    // Get user record
    const table = userRole === 'Member' ? 'MEMBER' : 'STAFF';
    const idCol = userRole === 'Member' ? 'MemberID' : 'StaffID';
    
    const [rows] = await pool.execute(
      `SELECT PasswordHash FROM ${table} WHERE ${idCol} = ?`,
      [userId]
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = rows[0];

    // Verify current password
    const passwordMatch = await verifyPassword(currentPassword, user.PasswordHash);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const newHash = await hashPassword(newPassword);

    // Update password
    await pool.execute(
      `UPDATE ${table} SET PasswordHash = ? WHERE ${idCol} = ?`,
      [newHash, userId]
    );

    return res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  requestPasswordReset,
  confirmPasswordReset,
  changePassword
};
