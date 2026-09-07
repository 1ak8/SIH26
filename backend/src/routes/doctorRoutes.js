const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { getQueue, updateQueueStatus, createPrescription, createDoctorReferral, getPatientDetails, getDoctorDashboard } = require('../controllers/doctorController');

router.use(protect, authorize('doctor'));
router.get('/dashboard', getDoctorDashboard);
router.get('/queue', getQueue);
router.put('/queue/:id/status', updateQueueStatus);
router.post('/prescriptions', createPrescription);
router.post('/referrals', createDoctorReferral);
router.get('/patient/:id', getPatientDetails);

module.exports = router;
