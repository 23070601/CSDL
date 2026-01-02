async function notify(req, res) {
  const { type, target, message } = req.body;
  // Stub: integrate email/SMS provider here
  console.log('Notification stub', { type, target, message });
  res.status(202).json({ status: 'queued', type, target });
}

module.exports = { notify };
