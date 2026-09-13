const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { getProfile, updateProfile, bookAppointment, getAppointments, getPrescriptions, getReferrals, getDashboard, requestVisit, getPatientVisits } = require('../controllers/patientController');

router.use(protect, authorize('patient'));
router.get('/dashboard', getDashboard);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/appointments', bookAppointment);
router.get('/appointments', getAppointments);
router.get('/prescriptions', getPrescriptions);
router.get('/referrals', getReferrals);
router.post('/visit-request', requestVisit);
router.get('/visit-requests', getPatientVisits);

module.exports = router;
