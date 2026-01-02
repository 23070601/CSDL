# Backup System Configuration Guide

## Quick Start

### 1. Cron Schedule Configuration

The backup system uses `node-cron` for automated scheduling. Configure in `.env`:

```env
# Daily backup at 2:00 AM
BACKUP_CRON_SCHEDULE=0 2 * * *
```

#### Cron Format
```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of week (0 - 6) (Sunday=0)
│ │ │ │ │
* * * * *
```

#### Common Schedules
```env
# Every 6 hours
BACKUP_CRON_SCHEDULE=0 */6 * * *

# Daily at 3:30 AM
BACKUP_CRON_SCHEDULE=30 3 * * *

# Every Sunday at midnight
BACKUP_CRON_SCHEDULE=0 0 * * 0

# Every weekday at 1 AM
BACKUP_CRON_SCHEDULE=0 1 * * 1-5

# Twice daily (2 AM and 2 PM)
BACKUP_CRON_SCHEDULE=0 2,14 * * *
```

Start the scheduler:
```bash
cd backend
npm run backup:scheduler
```

For production, use PM2:
```bash
pm2 start npm --name "lms-backup-scheduler" -- run backup:scheduler
pm2 save
```

---

## 2. Full Backup Implementation

### Features
- ✅ Complete database dump with all data
- ✅ Gzip compression (~80% size reduction)
- ✅ Automatic retention policy
- ✅ Includes stored procedures, triggers, events
- ✅ Consistent snapshot with --single-transaction
- ✅ Backup logging to JSON

### Configuration
```env
BACKUP_DIR=./backups           # Backup storage location
BACKUP_RETENTION=5             # Keep last 5 full backups
```

### Usage
```bash
# Manual full backup
npm run backup:full

# Automated via scheduler
npm run backup:scheduler
```

### Output Structure
```
backups/
├── backup_logs.json
├── LibraryDB_20260102_020000.sql.gz  ← Latest
├── LibraryDB_20260101_020000.sql.gz
├── LibraryDB_20251231_020000.sql.gz
├── LibraryDB_20251230_020000.sql.gz
└── LibraryDB_20251229_020000.sql.gz
```

### Implementation Details
File: [backend/scripts/backup.js](backend/scripts/backup.js)

```javascript
// Key features:
// - mysqldump with --single-transaction (no table locking)
// - --routines --triggers --events (complete schema)
// - Gzip compression
// - Automatic old backup pruning
// - Success/failure logging
```

---

## 3. NPM Scripts

All backup operations available as npm scripts:

```json
{
  "scripts": {
    "backup:full": "node scripts/backup.js",
    "backup:incremental": "node scripts/backup-incremental.js",
    "backup:verify": "node scripts/verify-backup.js",
    "backup:restore": "node scripts/restore.js",
    "backup:restore:full": "node scripts/restore-full.js",
    "backup:scheduler": "node scripts/scheduler.js"
  }
}
```

### Command Reference

| Command | Description | Use When |
|---------|-------------|----------|
| `npm run backup:full` | Create full backup | Manual backup needed |
| `npm run backup:incremental` | Create incremental backup | Daily updates between full backups |
| `npm run backup:verify` | Test backup integrity | Before recovery or monthly tests |
| `npm run backup:restore` | Quick restore (latest) | Fast recovery needed |
| `npm run backup:restore:full` | Full recovery with safety checks | Production recovery |
| `npm run backup:scheduler` | Start automated backups | Production deployment |

---

## 4. 3-2-1 Strategy Configuration

The **3-2-1 backup rule** ensures data safety:
- **3** copies of data
- **2** different storage media
- **1** offsite backup

### Current Implementation (Level 1 & 2)

**Copy 1: Production Database**
```
MySQL Server → Live data
```

**Copy 2: Local Compressed Backups**
```env
BACKUP_DIR=./backups
BACKUP_RETENTION=5
```

### Recommended: Add Offsite Copy (Level 3)

#### Option A: AWS S3
```bash
# Install AWS CLI
brew install awscli  # macOS
apt-get install awscli  # Ubuntu

# Configure credentials
aws configure

# Sync backups to S3 (add to scheduler or cron)
aws s3 sync ./backups/archives/ s3://your-bucket/lms-backups/ --storage-class GLACIER
```

Create `scripts/backup-offsite.js`:
```javascript
const { exec } = require('child_process');

exec('aws s3 sync ./backups s3://your-bucket/lms-backups/', (err, stdout) => {
  if (err) console.error('Offsite backup failed:', err);
  else console.log('Offsite backup complete:', stdout);
});
```

#### Option B: rsync to Remote Server
```bash
# Setup SSH key authentication first
ssh-copy-id user@backup-server

# Add to crontab or scheduler
rsync -avz ./backups/ user@backup-server:/data/lms-backups/
```

#### Option C: Google Drive with rclone
```bash
# Install rclone
brew install rclone  # macOS

# Configure Google Drive
rclone config

# Sync backups
rclone sync ./backups gdrive:LMS-Backups
```

### Multi-Tier Retention Strategy
```env
# Local storage
BACKUP_RETENTION=5                    # Last 5 daily backups

# Incremental backups
BACKUP_INCREMENTAL_RETENTION=10       # Last 10 incremental backups

# Weekly archives (create manually or via scheduler)
# Keep 4 weeks of Sunday backups

# Monthly archives (first of month)
# Keep 12 months

# Yearly archives
# Keep 7 years for compliance
```

---

## 5. Incremental Backup (Captures Changes)

### Purpose
Incremental backups capture only changes since last full backup, reducing:
- Backup time (faster)
- Storage space (smaller files)
- Network bandwidth (for offsite sync)

### Configuration
```env
BACKUP_INCREMENTAL_RETENTION=10
```

### Usage
```bash
# Create incremental backup
npm run backup:incremental
```

### Requirements
- At least one full backup must exist first
- MySQL binary logging enabled (optional but recommended)
- SUPER or REPLICATION CLIENT privilege for --master-data

### Enable Binary Logging (Optional)
Edit MySQL config (`/etc/my.cnf` or `/etc/mysql/my.cnf`):
```ini
[mysqld]
log-bin=/var/log/mysql/mysql-bin.log
expire_logs_days=7
max_binlog_size=100M
```

Restart MySQL:
```bash
sudo systemctl restart mysql
```

### Output Structure
```
backups/
├── LibraryDB_20260102_020000.sql.gz        ← Full backup
└── incremental/
    ├── incremental_LibraryDB_20260102_080000.sql.gz
    ├── incremental_LibraryDB_20260102_140000.sql.gz
    └── incremental_LibraryDB_20260102_200000.sql.gz
```

### Scheduled Incremental Backups
Modify `scripts/scheduler.js`:
```javascript
// Full backup daily at 2 AM
cron.schedule('0 2 * * *', () => {
  exec('node scripts/backup.js', handleOutput);
});

// Incremental backup every 6 hours
cron.schedule('0 */6 * * *', () => {
  exec('node scripts/backup-incremental.js', handleOutput);
});
```

### Restore from Incremental
1. Restore latest full backup
2. Apply incremental backups in chronological order

```bash
# Restore base full backup
npm run backup:restore backups/LibraryDB_20260102_020000.sql.gz

# Apply incremental backups
gunzip -c backups/incremental/incremental_LibraryDB_20260102_080000.sql.gz | mysql LibraryDB
gunzip -c backups/incremental/incremental_LibraryDB_20260102_140000.sql.gz | mysql LibraryDB
```

---

## 6. Backup Verification (Before Recovery)

### Purpose
Validates backup integrity before attempting recovery to:
- Detect corrupted backups early
- Verify all critical tables present
- Test restore process without affecting production
- Ensure data consistency

### Usage
```bash
# Verify latest backup
npm run backup:verify

# Verify specific backup
npm run backup:verify backups/LibraryDB_20260102_020000.sql.gz
```

### Process
1. Creates temporary test database (`LibraryDB_verify_test`)
2. Restores backup to test database
3. Verifies table structure and row counts
4. Cleans up test database

### Output Example
```
Verifying backup: backups/LibraryDB_20260102_020000.sql.gz
Creating temporary database: LibraryDB_verify_test
Restoring backup to test database...
Checking table integrity...

✓ Backup Verification Results:
================================
TableName    RowCount
BOOK         1500
MEMBER       2345
LOAN         567
STAFF        45
RESERVATION  89

✓ Backup integrity check PASSED
✓ All critical tables present and accessible
✓ Backup file: LibraryDB_20260102_020000.sql.gz
✓ File size: 12.45 MB

✓ Test database removed
```

### Automated Monthly Verification
Add to scheduler:
```javascript
// Monthly backup verification (1st of month at 3 AM)
cron.schedule('0 3 1 * *', () => {
  exec('node scripts/verify-backup.js', (err, stdout) => {
    console.log(stdout);
    // Send email notification with results
  });
});
```

---

## 7. Full Recovery (Restore from Backup)

### Quick Restore (Simple)
For fast recovery with auto-detection:
```bash
npm run backup:restore
# Restores latest backup automatically
```

### Full Recovery (Recommended for Production)
For production recovery with safety features:
```bash
npm run backup:restore:full
```

### Safety Features
1. ✅ **Emergency Backup**: Creates pre-restore backup of current database
2. ✅ **Integrity Check**: Verifies backup file before restore
3. ✅ **Database Recreation**: Clean DROP/CREATE for fresh restore
4. ✅ **Verification**: Checks table counts after restore
5. ✅ **Automatic Rollback**: Reverts to emergency backup if restore fails

### Recovery Process Flow

```
[1] Create Emergency Backup
     ↓ (current database → backups/emergency/)
[2] Verify Backup File
     ↓ (gzip integrity test)
[3] Drop & Recreate Database
     ↓ (clean slate)
[4] Restore from Backup
     ↓ (decompress + import)
[5] Verify Restoration
     ↓ (table counts + structure)
[SUCCESS] ✓ Recovery Complete
   OR
[FAILURE] → Automatic Rollback
     ↓ (restore from emergency backup)
[ROLLBACK] ✓ Database restored to pre-recovery state
```

### Output Example
```
=== FULL DATABASE RECOVERY ===
Target backup: backups/LibraryDB_20260102_020000.sql.gz
Database: LibraryDB

Step 1: Creating emergency backup of current database...
✓ Emergency backup saved: backups/emergency/pre_restore_LibraryDB_20260102_153045.sql.gz

Step 2: Verifying backup file integrity...
✓ Backup file integrity verified

Step 3: Preparing database for restore...
✓ Database prepared

Step 4: Restoring database from backup...
This may take several minutes for large databases...

✓ Restore completed in 23.45 seconds

Step 5: Verifying database restoration...
✓ Database verification results:
================================
TableName    RowCount
BOOK         1500
MEMBER       2345
LOAN         567
STAFF        45
RESERVATION  89
FINE         123

=== RECOVERY SUCCESSFUL ===
Restored from: LibraryDB_20260102_020000.sql.gz
Recovery time: 23.45 seconds
Emergency backup available at: backups/emergency/pre_restore_LibraryDB_20260102_153045.sql.gz
```

### Restore Specific Backup
```bash
# Restore specific file
npm run backup:restore:full backups/LibraryDB_20251230_020000.sql.gz
```

### Disaster Recovery Checklist

**Before Recovery:**
- [ ] Identify failure type and last known good backup
- [ ] Notify stakeholders about downtime
- [ ] Stop application servers (`pm2 stop all`)
- [ ] Verify backup file exists and is recent

**During Recovery:**
```bash
cd backend
npm run backup:restore:full
```

**After Recovery:**
- [ ] Verify table counts and data integrity
- [ ] Test critical operations (login, search, loans)
- [ ] Check application connectivity
- [ ] Restart application servers (`pm2 restart all`)
- [ ] Monitor error logs for 24 hours
- [ ] Document incident and root cause

---

## Complete Backup Workflow

### Daily Operations
```bash
# Automated (runs via scheduler)
pm2 start npm --name backup-scheduler -- run backup:scheduler

# Manual backup if needed
npm run backup:full
```

### Weekly Tasks
```bash
# Verify backups are running
cat backups/backup_logs.json

# Test incremental backup
npm run backup:incremental
```

### Monthly Tasks
```bash
# Verify backup integrity
npm run backup:verify

# Test full recovery to staging
npm run backup:restore:full

# Archive monthly backup to offsite storage
cp backups/LibraryDB_20260101_020000.sql.gz /path/to/offsite/monthly/
```

### Quarterly Tasks
```bash
# Full disaster recovery drill
# 1. Stop application
pm2 stop all

# 2. Perform full recovery
npm run backup:restore:full

# 3. Verify all systems
# 4. Document results
# 5. Restart application
pm2 restart all
```

---

## Troubleshooting

### Backup Fails
```bash
# Check MySQL connection
mysql -u root -p -e "SELECT 1"

# Verify mysqldump is installed
which mysqldump

# Check disk space
df -h

# Review backup logs
cat backups/backup_logs.json
```

### Restore Fails
```bash
# Verify backup file integrity
gunzip -t backups/LibraryDB_20260102_020000.sql.gz

# Check MySQL privileges
mysql -u root -p -e "SHOW GRANTS"

# Test with verification first
npm run backup:verify
```

### Scheduler Not Running
```bash
# Check PM2 status
pm2 list

# View scheduler logs
pm2 logs backup-scheduler

# Restart scheduler
pm2 restart backup-scheduler
```

---

## Security Best Practices

1. **Encrypt Backups for Offsite Storage**
```bash
gpg --symmetric --cipher-algo AES256 backup.sql.gz
```

2. **Restrict File Permissions**
```bash
chmod 600 backups/*.sql.gz
chown mysql:mysql backups/
```

3. **Use Separate Backup User**
```sql
CREATE USER 'backup_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT SELECT, LOCK TABLES, SHOW VIEW, EVENT, TRIGGER ON LibraryDB.* TO 'backup_user'@'localhost';
FLUSH PRIVILEGES;
```

4. **Monitor Backup Success**
```javascript
// Add email notifications to backup.js
const nodemailer = require('nodemailer');

function sendAlert(success, details) {
  // Send email notification
}
```

---

## Environment Variables Reference

```env
# Database Connection
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=LibraryDB
DB_PORT=3306

# Backup Configuration
BACKUP_DIR=./backups                    # Local backup directory
BACKUP_RETENTION=5                       # Full backup retention count
BACKUP_INCREMENTAL_RETENTION=10          # Incremental backup retention
BACKUP_CRON_SCHEDULE=0 2 * * *          # Daily at 2:00 AM

# JWT Configuration
JWT_SECRET=change-me-to-secure-random-string
JWT_EXPIRES_IN=2h

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000              # 15 minutes
RATE_LIMIT_MAX=300                       # 300 requests per window
```

---

## Production Deployment

### Complete Setup
```bash
# 1. Install dependencies
cd backend
npm install

# 2. Configure environment
cp .env.example .env
nano .env  # Edit with production values

# 3. Test backup manually
npm run backup:full

# 4. Verify backup
npm run backup:verify

# 5. Start scheduler with PM2
pm2 start npm --name lms-backup-scheduler -- run backup:scheduler
pm2 save
pm2 startup  # Enable auto-start on boot

# 6. Setup offsite sync (choose one)
# AWS S3
aws s3 sync ./backups s3://your-bucket/lms-backups/

# Or rsync
rsync -avz ./backups/ user@backup-server:/data/lms-backups/
```

### Monitoring
```bash
# Check backup status
pm2 logs lms-backup-scheduler

# View backup history
cat backups/backup_logs.json | jq '.[-10:]'  # Last 10 backups

# Check backup sizes
du -sh backups/*.sql.gz

# Verify latest backup
npm run backup:verify
```

---

**Last Updated**: January 2, 2026  
**System**: Library Management System v1.0  
**Database**: MySQL 8.0+ (LibraryDB)
