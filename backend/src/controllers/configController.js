async function getConfig(req, res) {
  res.json({
    loanPeriodDays: 14,
    finePerDay: 50000,
    maxActiveLoans: 5,
    maxRenewals: 2,
    holdHours: 48,
  });
}

module.exports = { getConfig };
