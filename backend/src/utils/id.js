function generateLogId() {
  const base = Math.random().toString(16).slice(2, 10).toUpperCase();
  return `AL${base}`.slice(0, 10);
}

function generateLoanId() {
  const base = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `LD${base}`.slice(0, 10);
}

function generateLostId() {
  const base = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `LR${base}`.slice(0, 10);
}

function generateStaffId() {
  const base = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ST${base}`.slice(0, 10);
}

function generateReservationId() {
  const base = Math.random().toString(36).slice(2, 9).toUpperCase();
  return `R${base}`.slice(0, 10);
}

module.exports = { generateLogId, generateLoanId, generateLostId, generateStaffId, generateReservationId };
