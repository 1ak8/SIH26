const asyncHandler = require('express-async-handler');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const Referral = require('../models/Referral');
const TriageData = require('../models/TriageData');
const PatientProfile = require('../models/PatientProfile');

const getQueue = asyncHandler(async (req, res) => {
  const today = new Date(); today.setHours(0,0,0,0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const queue = await Appointment.find({
    doctor: req.user._id, date: { $gte: today, $lt: tomorrow },
    status: { $in: ['scheduled', 'in_queue', 'in_consultation'] },
  }).populate('patient', 'name phone gender dateOfBirth abhaId profileImage').sort('tokenNumber');
  res.json({ success: true, data: queue });
});

const updateQueueStatus = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) { res.status(404); throw new Error('Appointment not found'); }
  appointment.status = req.body.status;
  await appointment.save();
  const io = req.app.get('io');
  if (io) {
    io.to('patient').emit('queue:updated', { appointmentId: appointment._id, status: appointment.status });
  }
  res.json({ success: true, data: appointment });
});

const createPrescription = asyncHandler(async (req, res) => {
  const { patientId, appointmentId, diagnosis, icdCode, clinicalNotes, medicines, labTests, followUpDate, followUpInstructions } = req.body;
  if (!patientId || !diagnosis) { res.status(400); throw new Error('Patient and diagnosis required'); }
  const prescription = await Prescription.create({
    patient: patientId, doctor: req.user._id, appointment: appointmentId,
    diagnosis, icdCode, clinicalNotes, medicines: medicines || [], labTests: labTests || [],
    followUpDate, followUpInstructions, isDigitallySigned: true,
  });
  const io = req.app.get('io');
  if (io) {
    io.to('patient').emit('prescription:new', { prescription });
  }
  res.status(201).json({ success: true, data: prescription });
});

const createDoctorReferral = asyncHandler(async (req, res) => {
  const { patientId, toFacility, referredTo, specialty, reason, priority, notes } = req.body;
  const referral = await Referral.create({
    patient: patientId, referredBy: req.user._id, referredTo,
    toFacility, specialty, reason, priority: priority || 'medium', notes,
  });
  const io = req.app.get('io');
  if (io) {
    io.to('health_worker').emit('referral:new', { referral });
  }
  res.status(201).json({ success: true, data: referral });
});

const getPatientDetails = asyncHandler(async (req, res) => {
  const [profile, triages, prescriptions] = await Promise.all([
    PatientProfile.findOne({ user: req.params.id }).populate('user', 'name phone gender dateOfBirth abhaId'),
    TriageData.find({ patient: req.params.id }).sort('-createdAt').limit(5),
    Prescription.find({ patient: req.params.id }).sort('-createdAt').limit(5),
  ]);
  res.json({ success: true, data: { profile, recentTriages: triages, recentPrescriptions: prescriptions } });
});

const getDoctorDashboard = asyncHandler(async (req, res) => {
  const today = new Date(); today.setHours(0,0,0,0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const [queueCount, completedToday, pendingReferrals] = await Promise.all([
    Appointment.countDocuments({ doctor: req.user._id, date: { $gte: today, $lt: tomorrow }, status: { $in: ['scheduled', 'in_queue'] } }),
    Appointment.countDocuments({ doctor: req.user._id, date: { $gte: today, $lt: tomorrow }, status: 'completed' }),
    Referral.countDocuments({ referredBy: req.user._id, status: 'pending' }),
  ]);
  res.json({ success: true, data: { waitingPatients: queueCount, completedToday, pendingReferrals } });
});

module.exports = { getQueue, updateQueueStatus, createPrescription, createDoctorReferral, getPatientDetails, getDoctorDashboard };
