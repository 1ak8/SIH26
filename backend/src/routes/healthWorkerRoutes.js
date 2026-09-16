const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  submitTriage,
  createReferral,
  getAssignedPatients,
  getHWDashboard,
  bookForPatient,
  getVisitRequests,
  updateVisitStatus,
  getVillageImmunizations,
  logImmunizationDose,
  getAshaTasks,
  createAshaTask,
  updateAshaTaskStatus,
  registerCitizen,
} = require('../controllers/healthWorkerController');

router.use(protect, authorize('health_worker'));
router.get('/dashboard', getHWDashboard);
router.get('/patients', getAssignedPatients);
router.post('/triage', submitTriage);
router.post('/referrals', createReferral);
router.post('/book-for-patient', bookForPatient);
router.get('/visit-requests', getVisitRequests);
router.patch('/visit-requests/:id/status', updateVisitStatus);
router.get('/village-immunizations', getVillageImmunizations);
router.post('/immunizations/:id/complete', logImmunizationDose);
router.get('/tasks', getAshaTasks);
router.post('/tasks', createAshaTask);
router.patch('/tasks/:id/status', updateAshaTaskStatus);
router.post('/register-citizen', registerCitizen);

module.exports = router;
