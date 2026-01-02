# Database Migration Fix - PasswordHash Column

## Issue
Registration endpoint (`POST /api/auth/register`) was returning a 500 error with the message:
```
Unknown column 'PasswordHash' in 'field list'
```

## Root Cause
The `MEMBER` table in the database was missing the `PasswordHash` column. The table was created from an older schema version that didn't include password support for members.

## Solution
Created and executed a migration script to add the missing `PasswordHash` column to the `MEMBER` table.

### Migration Script
Location: `backend/scripts/migrate-add-password-hash.js`

This script:
1. Checks if the `PasswordHash` column exists
2. Adds the column if missing: `PasswordHash VARCHAR(255) NULL`
3. Verifies the migration was successful

### Running the Migration
```bash
cd backend
node scripts/migrate-add-password-hash.js
```

## Result
✅ Account registration now works successfully  
✅ Members can register with email and password  
✅ Passwords are securely hashed using bcrypt  

## Testing
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!","fullName":"Test User","memberType":"Student"}'
```

Returns a JWT token and user object on success.

## Files Modified
1. `backend/scripts/migrate-add-password-hash.js` - Migration script (new)
2. `backend/src/controllers/authController.js` - Error logging cleanup
3. `backend/index.js` - Debug logging cleanup
4. `backend/src/routes/index.js` - Debug endpoint cleanup

## Database Schema
The `MEMBER` table now includes:
- MemberID
- FullName
- Email
- Phone
- Address
- MemberType
- **PasswordHash** ← Added by migration
- CardIssueDate
- Status
