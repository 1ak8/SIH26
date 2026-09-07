const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { getAnalytics, getFacilities, getUsers } = require('../controllers/adminController');

router.use(protect, authorize('admin'));
router.get('/analytics', getAnalytics);
router.get('/facilities', getFacilities);
router.get('/users', getUsers);

module.exports = router;
