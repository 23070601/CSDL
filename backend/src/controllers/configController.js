// In-memory config store (persisted per session)
let configStore = {
  loanPeriodDays: 14,
  finePerDay: 1.5,
  maxActiveLoans: 5,
  maxRenewals: 2,
  holdHours: 48,
  libraryName: 'City Public Library',
  maxBorrowDays: 14,
  maxBooksPerMember: 5,
  email: 'info@library.com',
  phone: '(555) 123-4567',
};

async function getConfig(req, res) {
  res.json(configStore);
}

async function updateConfig(req, res) {
  try {
    const newConfig = req.body;
    configStore = { ...configStore, ...newConfig };
    res.json({ message: 'Configuration updated successfully', config: configStore });
  } catch (error) {
    console.error('Error updating config:', error);
    res.status(500).json({ message: 'Error updating configuration', error: error.message });
  }
}

module.exports = { getConfig, updateConfig };
