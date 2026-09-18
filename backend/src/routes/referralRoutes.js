const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createReferral,
  getReferrals,
  getAllReferrals,
  getReferralById,
  updateReferralStatus,
  getReferralStats,
} = require('../controllers/referralController');

// Shared routes — any authenticated user
router.use(protect);
router.get('/stats', getReferralStats);
router.get('/:id', getReferralById);
router.patch('/:id/status', updateReferralStatus);

// Health worker & Doctor can create referrals
router.post('/', createReferral);

// List referrals (auto-filtered by role in controller)
router.get('/', getReferrals);

// Admin: all referrals
router.get('/admin/all', protect, (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin only' });
  next();
}, getAllReferrals);

module.exports = router;
