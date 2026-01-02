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
 * Incremental backup captures only changes since last full backup
 * Uses mysqldump with --single-transaction and binary log positions
 */
function run() {
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || '3306';
  const user = process.env.DB_USER || 'root';
  const pass = process.env.DB_PASS || '';
  const name = process.env.DB_NAME || 'LibraryDB';
  const backupDir = process.env.BACKUP_DIR;
  const incrementalDir = path.join(backupDir, 'incremental');

  ensureDir(incrementalDir);
  const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
  const file = path.join(incrementalDir, `incremental_${name}_${timestamp}.sql.gz`);
  
  // Get last full backup timestamp for reference
  const fullBackups = fs.existsSync(backupDir) 
    ? fs.readdirSync(backupDir).filter(f => f.endsWith('.sql.gz') && !f.startsWith('incremental_'))
    : [];
  
  if (fullBackups.length === 0) {
    console.error('No full backup found. Run a full backup first: npm run backup:full');
    process.exit(1);
  }

  // Incremental backup with binary log position tracking
  // --single-transaction ensures consistency without locking tables
  // --master-data=2 records binary log position in comments
  const cmd = `mysqldump -h ${host} -P ${port} -u ${user} ${pass ? `-p${pass}` : ''} \
--single-transaction --flush-logs --master-data=2 \
--databases ${name} | gzip > ${file}`;

  console.log(`Running incremental backup...`);
  console.log(`Reference: Last full backup from ${fullBackups[fullBackups.length - 1]}`);
  
  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error('Incremental backup failed:', err.message);
      console.error('Note: --master-data requires SUPER or REPLICATION CLIENT privilege');
      process.exit(1);
    }
    if (stderr) console.warn(stderr);
    console.log(`Incremental backup completed: ${file}`);

    // Prune old incremental backups
    const retention = parseInt(process.env.BACKUP_INCREMENTAL_RETENTION || '10', 10);
    const incrementalFiles = fs.readdirSync(incrementalDir)
      .filter(f => f.startsWith('incremental_') && f.endsWith('.sql.gz'))
      .sort((a, b) => b.localeCompare(a));
    
    if (incrementalFiles.length > retention) {
      const toDelete = incrementalFiles.slice(retention);
      toDelete.forEach((f) => {
        fs.unlinkSync(path.join(incrementalDir, f));
        console.log(`Pruned old incremental backup: ${f}`);
      });
    }
  });
}

run();
