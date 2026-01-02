#!/usr/bin/env node

/**
 * Setup script to create proper password hashes for demo accounts
 * Run: node scripts/setup-demo-accounts.js
 */

const bcrypt = require('bcrypt');
const { pool } = require('../src/config/db');

const SALT_ROUNDS = 10;

const demoAccounts = [
  {
    email: 'duchm@library.com',
    password: 'admin123',
    staffId: 'ST005',
    role: 'Admin',
  },
  {
    email: 'minhtv@library.com',
    password: 'librarian123',
    staffId: 'ST002',
    role: 'Librarian',
  },
  {
    email: 'lanlt@library.com',
    password: 'assistant123',
    staffId: 'ST003',
    role: 'Assistant',
  },
];

async function setupAccounts() {
  try {
    console.log('🔐 Setting up demo account passwords...\n');

    for (const account of demoAccounts) {
      try {
        const hash = await bcrypt.hash(account.password, SALT_ROUNDS);
        
        const [result] = await pool.execute(
          'UPDATE STAFF SET PasswordHash = ? WHERE Email = ? AND Role = ?',
          [hash, account.email, account.role]
        );

        if (result.affectedRows > 0) {
          console.log(`✓ ${account.role}: ${account.email}`);
          console.log(`  Password: ${account.password}\n`);
        } else {
          console.log(`✗ ${account.role}: ${account.email} - Account not found\n`);
        }
      } catch (error) {
        console.error(`✗ Error updating ${account.email}:`, error.message);
      }
    }

    console.log('\n✅ Demo account setup complete!');
    console.log('\nLogin with these credentials:');
    demoAccounts.forEach(account => {
      console.log(`${account.role}: ${account.email} / ${account.password}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

setupAccounts();
