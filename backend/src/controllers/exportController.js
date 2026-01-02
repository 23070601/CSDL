const { pool } = require('../config/db');

function toCsv(rows) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(',')];
  for (const r of rows) {
    lines.push(headers.map((h) => (r[h] !== null && r[h] !== undefined ? String(r[h]).replace(/"/g, '""') : '')).join(','));
  }
  return lines.join('\n');
}

async function exportBooks(req, res) {
  const [rows] = await pool.execute('SELECT BookID, Title, ISBN, Publisher, PubYear FROM BOOK ORDER BY Title');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="books.csv"');
  res.send(toCsv(rows));
}

async function exportMembers(req, res) {
  const [rows] = await pool.execute('SELECT MemberID, FullName, Email, Phone, Address, MemberType, Status FROM MEMBER ORDER BY FullName');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="members.csv"');
  res.send(toCsv(rows));
}

module.exports = { exportBooks, exportMembers };
