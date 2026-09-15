const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getImmunizations,
  scheduleImmunization,
  completeImmunization,
  cancelImmunization,
  getMaternalCheckups,
  scheduleMaternalCheckup,
  completeMaternalCheckup,
} = require('../controllers/immunizationController');

router.get('/immunizations', protect, getImmunizations);
router.post('/immunizations', protect, scheduleImmunization);
router.patch('/immunizations/:id/complete', protect, completeImmunization);
router.patch('/immunizations/:id/cancel', protect, cancelImmunization);

router.get('/maternal-checkups', protect, getMaternalCheckups);
router.post('/maternal-checkups', protect, scheduleMaternalCheckup);
router.patch('/maternal-checkups/:id/complete', protect, completeMaternalCheckup);

module.exports = router;
