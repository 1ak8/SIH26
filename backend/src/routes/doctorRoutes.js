const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  getQueue,
  updateQueueStatus,
  createPrescription,
  createDoctorReferral,
  getPatientDetails,
  getDoctorDashboard,
  getConsultationHistory,
  createWalkinPatient,
} = require('../controllers/doctorController');
const { getDoctorLabOrders, createLabOrder, updateLabOrderStatus, getPatientsList } = require('../controllers/labController');

router.use(protect, authorize('doctor'));
router.get('/dashboard', getDoctorDashboard);
router.get('/queue', getQueue);
router.put('/queue/:id/status', updateQueueStatus);
router.post('/prescriptions', createPrescription);
router.post('/referrals', createDoctorReferral);
router.get('/patient/:id', getPatientDetails);
router.get('/history', getConsultationHistory);
router.post('/walkin', createWalkinPatient);

// Diagnostic Lab Orders
router.get('/lab-orders', getDoctorLabOrders);
router.post('/lab-orders', createLabOrder);
router.put('/lab-orders/:id', updateLabOrderStatus);
router.get('/patients-list', getPatientsList);

module.exports = router;
