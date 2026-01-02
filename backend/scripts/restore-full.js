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
 * Full recovery process with pre-validation and backup of current state
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

  console.log('=== FULL DATABASE RECOVERY ===');
  console.log(`Target backup: ${targetFile}`);
  console.log(`Database: ${name}`);
  console.log('');
  
  // Step 1: Backup current database state (safety measure)
  const emergencyBackupDir = path.join(backupDir, 'emergency');
  if (!fs.existsSync(emergencyBackupDir)) {
    fs.mkdirSync(emergencyBackupDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
  const emergencyBackup = path.join(emergencyBackupDir, `pre_restore_${name}_${timestamp}.sql.gz`);
  
  console.log('Step 1: Creating emergency backup of current database...');
  const backupCmd = `mysqldump -h ${host} -P ${port} -u ${user} ${pass ? `-p${pass}` : ''} ${name} | gzip > ${emergencyBackup}`;
  
  exec(backupCmd, (err, stdout, stderr) => {
    if (err) {
      console.warn('Warning: Could not create emergency backup:', err.message);
      console.log('Continuing with restore anyway...\n');
      proceedWithRestore();
    } else {
      console.log(`✓ Emergency backup saved: ${emergencyBackup}\n`);
      proceedWithRestore();
    }
  });

  function proceedWithRestore() {
    // Step 2: Verify backup integrity
    console.log('Step 2: Verifying backup file integrity...');
    const isGz = targetFile.endsWith('.gz');
    
    if (isGz) {
      // Test gzip decompression
      exec(`gunzip -t ${targetFile}`, (err) => {
        if (err) {
          console.error('✗ Backup file is corrupted or invalid:', err.message);
          process.exit(1);
        }
        console.log('✓ Backup file integrity verified\n');
        executeRestore();
      });
    } else {
      console.log('✓ SQL file ready\n');
      executeRestore();
    }
  }

  function executeRestore() {
    // Step 3: Drop and recreate database
    console.log('Step 3: Preparing database for restore...');
    const recreateCmd = `mysql -h ${host} -P ${port} -u ${user} ${pass ? `-p${pass}` : ''} -e "\
      DROP DATABASE IF EXISTS ${name}; \
      CREATE DATABASE ${name} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"`;
    
    exec(recreateCmd, (err) => {
      if (err) {
        console.error('✗ Failed to recreate database:', err.message);
        process.exit(1);
      }
      console.log('✓ Database prepared\n');

      // Step 4: Restore from backup
      console.log('Step 4: Restoring database from backup...');
      console.log('This may take several minutes for large databases...\n');
      
      const isGz = targetFile.endsWith('.gz');
      const restoreCmd = isGz
        ? `gunzip -c ${targetFile} | mysql -h ${host} -P ${port} -u ${user} ${pass ? `-p${pass}` : ''} ${name}`
        : `mysql -h ${host} -P ${port} -u ${user} ${pass ? `-p${pass}` : ''} ${name} < ${targetFile}`;
      
      const startTime = Date.now();
      exec(restoreCmd, (err, stdout, stderr) => {
        if (err) {
          console.error('✗ Restore FAILED:', err.message);
          console.log('\nAttempting rollback from emergency backup...');
          rollback();
          return;
        }
        
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`✓ Restore completed in ${duration} seconds\n`);

        // Step 5: Verify restoration
        console.log('Step 5: Verifying database restoration...');
        const verifyCmd = `mysql -h ${host} -P ${port} -u ${user} ${pass ? `-p${pass}` : ''} ${name} -e "\
          SELECT 'BOOK' as TableName, COUNT(*) as RowCount FROM BOOK \
          UNION ALL SELECT 'MEMBER', COUNT(*) FROM MEMBER \
          UNION ALL SELECT 'LOAN', COUNT(*) FROM LOAN \
          UNION ALL SELECT 'STAFF', COUNT(*) FROM STAFF \
          UNION ALL SELECT 'RESERVATION', COUNT(*) FROM RESERVATION \
          UNION ALL SELECT 'FINE', COUNT(*) FROM FINE;"`;

        exec(verifyCmd, (err, stdout, stderr) => {
          if (err) {
            console.error('✗ Verification failed:', err.message);
            console.log('\nAttempting rollback from emergency backup...');
            rollback();
            return;
          }

          console.log('✓ Database verification results:');
          console.log('================================');
          console.log(stdout);
          console.log('\n=== RECOVERY SUCCESSFUL ===');
          console.log(`Restored from: ${path.basename(targetFile)}`);
          console.log(`Recovery time: ${duration} seconds`);
          console.log(`Emergency backup available at: ${emergencyBackup}`);
        });
      });
    });
  }

  function rollback() {
    if (!fs.existsSync(emergencyBackup)) {
      console.error('✗ No emergency backup available for rollback');
      process.exit(1);
    }

    console.log('Restoring from emergency backup...');
    const rollbackCmd = `gunzip -c ${emergencyBackup} | mysql -h ${host} -P ${port} -u ${user} ${pass ? `-p${pass}` : ''} ${name}`;
    
    exec(rollbackCmd, (err) => {
      if (err) {
        console.error('✗ CRITICAL: Rollback failed:', err.message);
        console.error('Manual intervention required');
        process.exit(1);
      }
      console.log('✓ Rollback successful - database restored to pre-recovery state');
      process.exit(1);
    });
  }
}

run();
