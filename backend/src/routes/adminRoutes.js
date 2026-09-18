const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { getAnalytics, getFacilities, getUsers, updateFacilityStock, broadcastDirective } = require('../controllers/adminController');

router.use(protect, authorize('admin'));
router.get('/analytics', getAnalytics);
router.get('/facilities', getFacilities);
router.get('/users', getUsers);
router.post('/facilities/:id/inventory', updateFacilityStock);
router.post('/directives', broadcastDirective);

module.exports = router;
