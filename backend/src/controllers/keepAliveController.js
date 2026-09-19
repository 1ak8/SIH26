const asyncHandler = require('express-async-handler');

// GET /api/keepalive — ping to prevent Render free tier sleep
const keepAlive = asyncHandler(async (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

module.exports = { keepAlive };
