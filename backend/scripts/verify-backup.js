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

/**
 * Verifies backup integrity before recovery
 * Creates a temporary test database to validate the backup
 */
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

  const testDbName = `${name}_verify_test`;
  console.log(`Verifying backup: ${targetFile}`);
  console.log(`Creating temporary database: ${testDbName}`);

  // Step 1: Create test database
  const createDbCmd = `mysql -h ${host} -P ${port} -u ${user} ${pass ? `-p${pass}` : ''} -e "DROP DATABASE IF EXISTS ${testDbName}; CREATE DATABASE ${testDbName};"`;
  
  exec(createDbCmd, (err, stdout, stderr) => {
    if (err) {
      console.error('Failed to create test database:', err.message);
      process.exit(1);
    }

    // Step 2: Restore backup to test database
    const isGz = targetFile.endsWith('.gz');
    const restoreCmd = isGz
      ? `gunzip -c ${targetFile} | mysql -h ${host} -P ${port} -u ${user} ${pass ? `-p${pass}` : ''} ${testDbName}`
      : `mysql -h ${host} -P ${port} -u ${user} ${pass ? `-p${pass}` : ''} ${testDbName} < ${targetFile}`;

    console.log('Restoring backup to test database...');
    exec(restoreCmd, (err, stdout, stderr) => {
      if (err) {
        console.error('Backup verification FAILED - restore error:', err.message);
        cleanup();
        process.exit(1);
      }

      // Step 3: Verify table structure and data
      console.log('Checking table integrity...');
      const verifyCmd = `mysql -h ${host} -P ${port} -u ${user} ${pass ? `-p${pass}` : ''} ${testDbName} -e "\
        SELECT 'BOOK' as TableName, COUNT(*) as RowCount FROM BOOK \
        UNION ALL SELECT 'MEMBER', COUNT(*) FROM MEMBER \
        UNION ALL SELECT 'LOAN', COUNT(*) FROM LOAN \
        UNION ALL SELECT 'STAFF', COUNT(*) FROM STAFF \
        UNION ALL SELECT 'RESERVATION', COUNT(*) FROM RESERVATION;"`;

      exec(verifyCmd, (err, stdout, stderr) => {
        if (err) {
          console.error('Table verification FAILED:', err.message);
          cleanup();
          process.exit(1);
        }

        console.log('\n✓ Backup Verification Results:');
        console.log('================================');
        console.log(stdout);
        console.log('✓ Backup integrity check PASSED');
        console.log('✓ All critical tables present and accessible');
        console.log(`✓ Backup file: ${path.basename(targetFile)}`);
        console.log(`✓ File size: ${(fs.statSync(targetFile).size / 1024 / 1024).toFixed(2)} MB`);
        
        cleanup();
      });
    });
  });

  function cleanup() {
    console.log(`\nCleaning up test database: ${testDbName}`);
    const dropCmd = `mysql -h ${host} -P ${port} -u ${user} ${pass ? `-p${pass}` : ''} -e "DROP DATABASE IF EXISTS ${testDbName};"`;
    exec(dropCmd, (err) => {
      if (err) console.warn('Warning: Failed to cleanup test database:', err.message);
      else console.log('✓ Test database removed');
    });
  }
}

run();
