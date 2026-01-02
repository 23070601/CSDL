#!/usr/bin/env node

/**
 * Database initialization script
 * Creates the LibraryDB database and all tables from SQL schema
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function initializeDatabase() {
  let connection = null;

  try {
    console.log('📦 Initializing Database...\n');

    // Create initial connection (without database)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      waitForConnections: true,
      connectionLimit: 1,
    });

    console.log('✓ Connected to MySQL server');

    // Read and execute SQL file
    const sqlFile = path.join(__dirname, '../SQLQuery_1.sql');
    if (!fs.existsSync(sqlFile)) {
      console.error(`❌ SQL file not found: ${sqlFile}`);
      process.exit(1);
    }

    let sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    // Split by statements and execute each one
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (let i = 0; i < statements.length; i++) {
      try {
        await connection.query(statements[i]);
        if (statements[i].includes('CREATE TABLE') || statements[i].includes('CREATE DATABASE')) {
          const match = statements[i].match(/(?:CREATE TABLE|CREATE DATABASE)\s+(\w+)/i);
          if (match) {
            console.log(`  ✓ ${match[1]}`);
          }
        }
      } catch (err) {
        // Ignore some errors like "database already exists"
        if (!err.message.includes('already exists') && !err.sqlState === '42P05') {
          console.error(`  ⚠ Statement ${i}: ${err.message}`);
        }
      }
    }

    console.log('\n✅ Database initialization completed\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Database initialization failed:', err.message);
    console.error('Full error:', err);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initializeDatabase();
