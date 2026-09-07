const asyncHandler = require('express-async-handler');
const TriageData = require('../models/TriageData');
const Referral = require('../models/Referral');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');

const submitTriage = asyncHandler(async (req, res) => {
  const { patientId, vitals, symptoms, riskLevel, notes, tags, requiresReferral, requiresAmbulance, followUpDate } = req.body;
  if (!patientId || !riskLevel) {
    res.status(400);
    throw new Error('Patient ID and risk level are required');
  }
  const triage = await TriageData.create({
    patient: patientId, assessedBy: req.user._id,
    vitals, symptoms, riskLevel, notes, tags, requiresReferral, requiresAmbulance, followUpDate,
  });
  if (vitals) {
    await PatientProfile.findOneAndUpdate({ user: patientId }, {
      'vitals.systolicBP': vitals.systolicBP, 'vitals.diastolicBP': vitals.diastolicBP,
      'vitals.heartRate': vitals.heartRate, 'vitals.spO2': vitals.spO2,
      'vitals.temperature': vitals.temperature, 'vitals.bloodSugar': vitals.bloodSugar,
      'vitals.weight': vitals.weight, 'vitals.lastUpdated': new Date(),
    });
  }
  const io = req.app.get('io');
  if (io) {
    io.to('doctor').emit('triage:new', { triage, riskLevel });
    io.to('admin').emit('triage:new', { riskLevel });
  }
  res.status(201).json({ success: true, data: triage });
});

const createReferral = asyncHandler(async (req, res) => {
  const { patientId, toFacility, specialty, reason, priority, notes } = req.body;
  if (!patientId || !reason) {
    res.status(400);
    throw new Error('Patient ID and reason required');
  }
  const referral = await Referral.create({
    patient: patientId, referredBy: req.user._id,
    toFacility, specialty, reason, priority: priority || 'medium', notes,
  });
  const io = req.app.get('io');
  if (io) {
    io.to('doctor').emit('referral:new', { referral });
    io.to('admin').emit('referral:new', { referral });
  }
  res.status(201).json({ success: true, data: referral });
});

const getAssignedPatients = asyncHandler(async (req, res) => {
  const triages = await TriageData.find({ assessedBy: req.user._id })
    .populate('patient', 'name phone gender dateOfBirth abhaId')
    .sort('-createdAt');
  const uniquePatients = {};
  triages.forEach(t => { if (t.patient) uniquePatients[t.patient._id] = t; });
  res.json({ success: true, data: Object.values(uniquePatients) });
});

const getHWDashboard = asyncHandler(async (req, res) => {
  const today = new Date(); today.setHours(0,0,0,0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const [todayTriages, pendingReferrals, highRiskAlerts] = await Promise.all([
    TriageData.countDocuments({ assessedBy: req.user._id, createdAt: { $gte: today, $lt: tomorrow } }),
    Referral.countDocuments({ referredBy: req.user._id, status: 'pending' }),
    TriageData.find({ assessedBy: req.user._id, riskLevel: { $in: ['high', 'emergency'] } })
      .populate('patient', 'name phone abhaId').sort('-createdAt').limit(5),
  ]);
  res.json({ success: true, data: { todayVisits: todayTriages, pendingReferrals, highRiskAlerts } });
});

const bookForPatient = asyncHandler(async (req, res) => {
  const { patientId, doctorId, date, timeSlot, type, reason } = req.body;
  const dayCount = await Appointment.countDocuments({ doctor: doctorId, date: { $gte: new Date(date).setHours(0,0,0,0), $lte: new Date(date).setHours(23,59,59,999) } });
  const appointment = await Appointment.create({
    patient: patientId, doctor: doctorId, date, timeSlot,
    type: type || 'teleconsultation', reason, tokenNumber: dayCount + 1, bookedBy: req.user._id,
  });
  const io = req.app.get('io');
  if (io) {
    io.to('doctor').emit('appointment:booked', { doctorId, patient: patientId, timeSlot });
  }
  res.status(201).json({ success: true, data: appointment });
});

module.exports = { submitTriage, createReferral, getAssignedPatients, getHWDashboard, bookForPatient };
