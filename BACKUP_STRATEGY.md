# Backup and Recovery Strategy

## Overview
This document outlines the comprehensive backup and recovery strategy for the Library Management System database.

## Step 1: Automated Backups

### Implementation
The system includes automated backup capabilities:

1. **Manual Backup**: Execute on-demand backups
   ```bash
   cd backend
   npm run backup:full
   ```

2. **Scheduled Backup**: Run automated backups using cron scheduler
   ```bash
   cd backend
   npm run backup:scheduler
   ```
   - Default schedule: Daily at 2:00 AM
   - Configurable via `BACKUP_CRON_SCHEDULE` in `.env`
   - Cron format: `0 2 * * *` (minute hour day month weekday)

3. **Production Deployment**: Use PM2 or system service to keep scheduler running
   ```bash
   # Using PM2
   pm2 start npm --name "backup-scheduler" -- run backup:scheduler
   
   # Or create systemd service (Linux)
   sudo nano /etc/systemd/system/lms-backup.service
   ```

### Backup Configuration
Edit `backend/.env`:
```env
BACKUP_DIR=./backups           # Local backup directory
BACKUP_RETENTION=5             # Keep last 5 backups
BACKUP_CRON_SCHEDULE=0 2 * * * # Daily at 2 AM
```

## Step 2: Backup Strategy (3-2-1 Rule)

### Current Implementation
✅ **Level 1: Local Compressed Backups**
- Format: `.sql.gz` (gzip compression reduces storage by ~80%)
- Location: `backend/backups/archives/`
- Retention: 5 most recent backups (configurable)
- Naming: `backup_LibraryDB_YYYYMMDD_HHMMSS.sql.gz`

### Recommended Enhancements for Production

#### 3-2-1 Backup Principle
The industry-standard backup strategy requires:
- **3 copies** of your data
- **2 different media types**
- **1 offsite copy**

#### Implementation Roadmap

**Copy 1: Production Database**
- Live data in MySQL server

**Copy 2: Local Compressed Backups** (already implemented)
- Daily automated backups to local disk
- Gzip compression for space efficiency
- Automatic rotation (5 backups default)

**Copy 3: Offsite Storage** (recommended to add)
```bash
# Option A: AWS S3 sync
aws s3 sync ./backups/archives/ s3://your-bucket/lms-backups/

# Option B: rsync to remote server
rsync -avz ./backups/archives/ user@backup-server:/backups/lms/

# Option C: Cloud storage integration
# Use rclone for Google Drive, Dropbox, etc.
rclone sync ./backups/archives/ gdrive:lms-backups/
```

#### Backup Schedule Recommendations

| Backup Type | Frequency | Retention | Storage |
|-------------|-----------|-----------|---------|
| Full Backup | Daily at 2 AM | 7 days | Local + Offsite |
| Weekly Archive | Sunday | 4 weeks | Offsite only |
| Monthly Archive | 1st of month | 12 months | Offsite only |
| Yearly Archive | January 1st | 7 years | Offsite secure |

### Backup Verification
Implement monthly backup restore tests:
```bash
# Test restore to separate database
npm run backup:restore path/to/backup.sql.gz
```

## Step 3: Recovery Plan

### Quick Recovery Procedures

#### Scenario 1: Restore Latest Backup
```bash
cd backend
npm run backup:restore
# Auto-detects and restores most recent backup
```

#### Scenario 2: Restore Specific Backup
```bash
cd backend
npm run backup:restore backups/archives/backup_LibraryDB_20241215_020000.sql.gz
```

#### Scenario 3: Point-in-Time Recovery
For more granular recovery, enable MySQL binary logging:
```sql
-- Enable binary logs in MySQL config (my.cnf)
[mysqld]
log-bin=/var/log/mysql/mysql-bin.log
expire_logs_days=7
```

Then restore to specific point:
```bash
# Restore base backup
mysql LibraryDB < backup.sql

# Replay binary logs to specific time
mysqlbinlog --stop-datetime="2024-12-15 14:30:00" mysql-bin.000001 | mysql LibraryDB
```

### Disaster Recovery (DR) Plan

#### Recovery Time Objective (RTO)
- Target: **< 1 hour** for database restoration
- Critical operations resume within 1 hour of disaster

#### Recovery Point Objective (RPO)
- Target: **< 24 hours** of data loss
- Daily backups ensure maximum 24-hour data loss

#### DR Checklist

**Phase 1: Assessment (0-5 minutes)**
- [ ] Identify failure type (corruption, hardware, human error, security breach)
- [ ] Determine last known good state
- [ ] Notify stakeholders

**Phase 2: Backup Retrieval (5-15 minutes)**
- [ ] Access local backup directory
- [ ] If local storage failed, retrieve from offsite (S3/remote server)
- [ ] Verify backup file integrity (check file size, test decompression)

**Phase 3: Database Restoration (15-45 minutes)**
```bash
# 1. Stop application to prevent connections
pm2 stop all

# 2. Create backup of corrupted database (for forensics)
mysqldump LibraryDB > corrupted_$(date +%Y%m%d_%H%M%S).sql

# 3. Drop and recreate database
mysql -u root -p -e "DROP DATABASE LibraryDB; CREATE DATABASE LibraryDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 4. Restore from backup
cd backend
npm run backup:restore

# 5. Verify restoration
mysql -u root -p LibraryDB -e "SELECT COUNT(*) FROM BOOK; SELECT COUNT(*) FROM MEMBER;"

# 6. Restart application
pm2 restart all
```

**Phase 4: Validation (45-60 minutes)**
- [ ] Test database connectivity
- [ ] Verify critical tables (BOOK, MEMBER, LOAN, STAFF)
- [ ] Test key operations (login, search books, create loan)
- [ ] Check data integrity and counts

**Phase 5: Post-Recovery (After 1 hour)**
- [ ] Document incident and recovery steps
- [ ] Identify root cause
- [ ] Update recovery procedures if needed
- [ ] Perform full system audit

### Business Continuity

#### Backup Storage Requirements
- **Local Storage**: Minimum 10GB for 5 daily backups (~500MB each compressed)
- **Offsite Storage**: 50GB recommended (includes weekly/monthly archives)

#### Monitoring
Set up alerts for backup failures:
```javascript
// Add to backup.js
const nodemailer = require('nodemailer');

function sendBackupAlert(success, message) {
  // Send email/SMS notification on backup failure
  if (!success) {
    console.error('BACKUP FAILED:', message);
    // Implement notification logic
  }
}
```

#### Access Control
- Backup files contain sensitive data (member info, transactions)
- Encrypt backups for offsite storage:
  ```bash
  # Encrypt before uploading
  gpg --symmetric --cipher-algo AES256 backup.sql.gz
  
  # Decrypt for restore
  gpg --decrypt backup.sql.gz.gpg > backup.sql.gz
  ```

### Testing Schedule
- **Weekly**: Verify backup completion (check logs)
- **Monthly**: Full restore test to staging database
- **Quarterly**: DR drill with full team

## Current System Capabilities

### ✅ Implemented
- [x] Automated backup script with compression
- [x] Retention policy (configurable)
- [x] Manual backup command (`npm run backup:full`)
- [x] Restore script with auto-detection (`npm run backup:restore`)
- [x] Cron scheduler for daily backups
- [x] Environment-based configuration

### 📋 Recommended Additions
- [ ] Offsite backup sync (AWS S3, Google Drive, or remote server)
- [ ] Backup encryption for sensitive data
- [ ] Email/SMS notifications on backup failure
- [ ] Monthly restore testing automation
- [ ] MySQL binary logging for point-in-time recovery
- [ ] Backup verification script (test restore without overwriting)
- [ ] Weekly and monthly archive retention
- [ ] Backup monitoring dashboard

## Quick Reference

### Backup Commands
```bash
# One-time backup
npm run backup:full

# Start automated scheduler
npm run backup:scheduler

# Restore latest
npm run backup:restore

# Restore specific file
npm run backup:restore path/to/backup.sql.gz
```

### Backup Location
```
backend/backups/
├── backup_logs.json          # Backup execution logs
└── archives/
    ├── backup_LibraryDB_20241215_020000.sql.gz
    ├── backup_LibraryDB_20241214_020000.sql.gz
    ├── backup_LibraryDB_20241213_020000.sql.gz
    ├── backup_LibraryDB_20241212_020000.sql.gz
    └── backup_LibraryDB_20241211_020000.sql.gz
```

### Environment Variables
```env
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=LibraryDB
BACKUP_DIR=./backups
BACKUP_RETENTION=5
BACKUP_CRON_SCHEDULE=0 2 * * *
```

## Support and Troubleshooting

### Common Issues

**Backup fails with "mysqldump: command not found"**
- Install MySQL client tools: `brew install mysql` (macOS) or `apt-get install mysql-client` (Ubuntu)

**Restore fails with "Access denied"**
- Verify DB_USER has CREATE/DROP/INSERT privileges
- Check MySQL connection settings in `.env`

**Scheduler not running in background**
- Use PM2: `pm2 start npm --name backup-scheduler -- run backup:scheduler`
- Or run in tmux/screen session

**Backups consuming too much disk space**
- Reduce BACKUP_RETENTION value
- Move older backups to offsite storage
- Verify gzip compression is working (files should be ~20% of original SQL size)

## Compliance Notes
- Backup retention aligns with data protection regulations (GDPR: 7 years for financial records)
- Encrypted backups protect personal data (member emails, addresses)
- DR plan ensures < 24-hour RPO as per business continuity requirements

---
**Last Updated**: December 2024  
**Document Owner**: Database Administrator  
**Review Frequency**: Quarterly
