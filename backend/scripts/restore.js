const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

typeof process.env.BACKUP_DIR === 'string' || (process.env.BACKUP_DIR = path.join(__dirname, '..', 'backups'));

function latestFile(dir) {
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql') || f.endsWith('.sql.gz'));
  if (!files.length) return null;
  const sorted = files.sort((a, b) => b.localeCompare(a));
  return path.join(dir, sorted[0]);
}

function run() {
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || '3306';
  const user = process.env.DB_USER || 'root';
  const pass = process.env.DB_PASS || '';
  const name = process.env.DB_NAME || 'LibraryDB';
  const backupDir = process.env.BACKUP_DIR;
  const targetFile = process.argv[2] ? path.resolve(process.argv[2]) : latestFile(backupDir);

  if (!targetFile || !fs.existsSync(targetFile)) {
    console.error('No backup file found. Provide a path or ensure backups exist.');
    process.exit(1);
  }

  const isGz = targetFile.endsWith('.gz');
  const cmd = isGz
    ? `gunzip -c ${targetFile} | mysql -h ${host} -P ${port} -u ${user} ${pass ? `-p${pass}` : ''} ${name}`
    : `mysql -h ${host} -P ${port} -u ${user} ${pass ? `-p${pass}` : ''} ${name} < ${targetFile}`;
  console.log(`Restoring from: ${targetFile}`);
  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error('Restore failed:', err.message);
      process.exit(1);
    }
    if (stderr) console.warn(stderr);
    console.log('Restore completed.');
  });
}

run();
