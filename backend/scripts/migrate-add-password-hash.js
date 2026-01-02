#!/usr/bin/env node

/**
 * Migration script to add PasswordHash column to MEMBER table
 * Fixes: Unknown column 'PasswordHash' in 'field list'
 */

const { pool } = require('../src/config/db');
const dotenv = require('dotenv');

dotenv.config();

async function migrate() {
  try {
    console.log('🔄 Running migration: Adding PasswordHash to MEMBER table...\n');

    // Check if column already exists
    const [columns] = await pool.query('DESCRIBE MEMBER');
    const hasPasswordHash = columns.some(col => col.Field === 'PasswordHash');

    if (hasPasswordHash) {
      console.log('✓ PasswordHash column already exists');
      process.exit(0);
    }

    // Add the PasswordHash column
    await pool.query(`
      ALTER TABLE MEMBER 
      ADD COLUMN PasswordHash VARCHAR(255) NULL 
      AFTER MemberType
    `);

    console.log('✓ Added PasswordHash column to MEMBER table');

    // Verify the column was added
    const [updatedColumns] = await pool.query('DESCRIBE MEMBER');
    const fields = updatedColumns.map(col => col.Field);
    console.log('\nMEMBER table columns:', fields);

    console.log('\n✅ Migration completed successfully\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    console.error('Full error:', err);
    process.exit(1);
  }
}

migrate();
