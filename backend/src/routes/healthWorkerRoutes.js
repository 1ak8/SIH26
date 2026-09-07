const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { submitTriage, createReferral, getAssignedPatients, getHWDashboard, bookForPatient } = require('../controllers/healthWorkerController');

router.use(protect, authorize('health_worker'));
router.get('/dashboard', getHWDashboard);
router.get('/patients', getAssignedPatients);
router.post('/triage', submitTriage);
router.post('/referrals', createReferral);
router.post('/book-for-patient', bookForPatient);

module.exports = router;
