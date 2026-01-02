const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

typeof process.env.BACKUP_DIR === 'string' || (process.env.BACKUP_DIR = path.join(__dirname, '..', 'backups'));

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Full backup implementation with compression and retention
 * Captures complete database state for disaster recovery
 */
function run() {
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || '3306';
  const user = process.env.DB_USER || 'root';
  const pass = process.env.DB_PASS || '';
  const name = process.env.DB_NAME || 'LibraryDB';
  const backupDir = process.env.BACKUP_DIR;

  ensureDir(backupDir);
  const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
  const file = path.join(backupDir, `${name}_${timestamp}.sql.gz`);

  console.log('=== FULL BACKUP STARTED ===');
  console.log(`Database: ${name}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Output: ${file}\n`);

  // Use mysqldump with --single-transaction for consistent backup without locking tables
  // Pipes to gzip for compression (reduces size by ~80%)
  const cmd = `mysqldump -h ${host} -P ${port} -u ${user} ${pass ? `-p${pass}` : ''} \
--single-transaction --routines --triggers --events \
${name} | gzip > ${file}`;
  
  const startTime = Date.now();
  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error('✗ Backup FAILED:', err.message);
      logBackup(file, false, err.message);
      process.exit(1);
    }
    if (stderr) console.warn('Warning:', stderr);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    const fileSize = (fs.statSync(file).size / 1024 / 1024).toFixed(2);
    
    console.log('✓ Backup completed successfully');
    console.log(`  File: ${path.basename(file)}`);
    console.log(`  Size: ${fileSize} MB`);
    console.log(`  Duration: ${duration} seconds\n`);

    // Prune old backups beyond retention
    const retention = parseInt(process.env.BACKUP_RETENTION || '5', 10);
    const files = fs.readdirSync(backupDir)
      .filter((f) => f.endsWith('.sql.gz') && f.startsWith(name))
      .sort((a, b) => b.localeCompare(a));
    
    if (files.length > retention) {
      const toDelete = files.slice(retention);
      console.log(`Retention policy: ${retention} backups`);
      toDelete.forEach((f) => {
        fs.unlinkSync(path.join(backupDir, f));
        console.log(`  Pruned: ${f}`);
      });
    }
    
    logBackup(file, true, `${fileSize}MB in ${duration}s`);
    console.log('\n=== BACKUP COMPLETE ===');
  });
}

function logBackup(file, success, details) {
  const logFile = path.join(process.env.BACKUP_DIR || './backups', 'backup_logs.json');
  let logs = [];
  
  if (fs.existsSync(logFile)) {
    try {
      logs = JSON.parse(fs.readFileSync(logFile, 'utf8'));
    } catch (e) {
      console.warn('Could not read backup logs');
    }
  }
  
  logs.push({
    timestamp: new Date().toISOString(),
    file: path.basename(file),
    success,
    details
  });
  
  // Keep last 50 log entries
  if (logs.length > 50) logs = logs.slice(-50);
  
  fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
}

run();
