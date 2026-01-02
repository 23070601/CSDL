const cron = require('node-cron');
const { exec } = require('child_process');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Daily backup at 2:00 AM
const dailySchedule = process.env.BACKUP_CRON_SCHEDULE || '0 2 * * *';

console.log(`Backup scheduler started. Schedule: ${dailySchedule}`);

cron.schedule(dailySchedule, () => {
  console.log('Running scheduled backup...');
  const backupScript = path.join(__dirname, 'backup.js');
  exec(`node ${backupScript}`, (err, stdout, stderr) => {
    if (err) {
      console.error('Scheduled backup failed:', err.message);
      return;
    }
    if (stdout) console.log(stdout);
    if (stderr) console.warn(stderr);
  });
});

console.log('Backup scheduler is running. Press Ctrl+C to stop.');
