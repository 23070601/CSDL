const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { pool } = require('../config/db');
const { hashPassword, verifyPassword, validatePasswordStrength } = require('../utils/password');

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '2h';

async function login(req, res) {
  const { email, role, password } = req.body;
  if (!email || !role) {
    return res.status(400).json({ message: 'Email and role are required' });
  }

  try {
    let user = null;
    if (role === 'Admin' || role === 'Librarian' || role === 'Assistant') {
      const [rows] = await pool.execute(
        'SELECT StaffID AS id, FullName AS name, Email AS email, Role AS role, PasswordHash FROM STAFF WHERE Email = ? LIMIT 1',
        [email]
      );
      user = rows[0];
      if (!user || !user.PasswordHash) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const passwordMatch = await verifyPassword(password || '', user.PasswordHash);
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    } else if (role === 'Member') {
      const [rows] = await pool.execute(
        'SELECT MemberID AS id, FullName AS name, Email AS email, MemberType AS role, PasswordHash, Status FROM MEMBER WHERE Email = ? LIMIT 1',
        [email]
      );
      user = rows[0];
      if (!user || !user.PasswordHash || user.Status === 'Locked') {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const passwordMatch = await verifyPassword(password || '', user.PasswordHash);
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { sub: user.id, role: role, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({ token, user });
  } catch (err) {
    console.error('Login error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function registerMember(req, res) {
  const { email, password, fullName, phone, address, memberType } = req.body;
  if (!email || !password || !fullName || !memberType) {
    return res.status(400).json({ message: 'Email, password, fullName, memberType are required' });
  }

  // Validate password strength
  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.valid) {
    return res.status(400).json({ 
      message: 'Password does not meet requirements',
      errors: passwordValidation.errors 
    });
  }

  try {
    const [exists] = await pool.execute('SELECT MemberID FROM MEMBER WHERE Email = ? LIMIT 1', [email]);
    if (exists.length) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Hash password using utility function
    const hash = await hashPassword(password);
    // Simple MemberID generation: MB + timestamp slice
    const memberId = `MB${Date.now().toString().slice(-6)}`;
    await pool.execute(
      'INSERT INTO MEMBER (MemberID, FullName, Email, Phone, Address, MemberType, PasswordHash, Status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [memberId, fullName, email, phone || null, address || null, memberType, hash, 'Active']
    );

    const token = jwt.sign(
      { sub: memberId, role: 'Member', name: fullName, email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({ token, user: { id: memberId, name: fullName, email, role: 'Member' } });
  } catch (err) {
    console.error('Register error:', err.message, err.code, err.sqlMessage);
    console.error('Full error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

module.exports = { login, registerMember };
