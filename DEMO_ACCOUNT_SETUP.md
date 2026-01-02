# Demo Account Setup Guide

## Quick Start

To set up the demo accounts with proper password hashes, run:

```bash
cd backend
node scripts/setup-demo-accounts.js
```

This will update the database with bcrypt-hashed passwords for:

- **Admin**: `duchm@library.com` / `admin123`
- **Librarian**: `minhtv@library.com` / `librarian123`
- **Assistant**: `lanlt@library.com` / `assistant123`

## What It Does

The setup script:
1. Connects to your MySQL database
2. Generates secure bcrypt hashes for each demo password (salt rounds: 10)
3. Updates the STAFF table with the new password hashes
4. Confirms each account was updated successfully

## Why It's Needed

The database seed file (SQLQuery_1.sql) contains placeholder password hashes like `HASH_ST002`. These cannot be used for login authentication. This script replaces them with actual bcrypt-hashed passwords that the login system can verify.

## Password Requirements

- All demo accounts use simple passwords for testing purposes
- In production, enforce strong password requirements
- Change these passwords after deploying to production

## Manual Login Test

After running the setup script, you can test login:

1. Navigate to the login page
2. Select role: **Librarian**
3. Email: `minhtv@library.com`
4. Password: `librarian123`
5. Click Login

## Troubleshooting

**Error: "Connection failed"**
- Ensure MySQL server is running
- Check database credentials in `backend/.env`

**Error: "Account not found"**
- Verify the STAFF table has been populated from SQLQuery_1.sql
- Check that emails match exactly

**Login fails after setup**
- Clear browser cache/cookies
- Verify the database was actually updated:
  ```sql
  SELECT Email, PasswordHash FROM STAFF WHERE Role = 'Librarian';
  ```

## Reset Passwords

To reset demo passwords later, just run the setup script again. It will regenerate new hashes.
