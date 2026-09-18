const asyncHandler = require('express-async-handler');
const Referral = require('../models/Referral');
const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');

// POST /api/referrals — Create referral (health_worker or doctor)
const createReferral = asyncHandler(async (req, res) => {
  const { patientId, toFacility, specialty, reason, clinicalSummary, priority, notes, transportMode, estimatedArrival } = req.body;
  if (!patientId || !reason) {
    res.status(400);
    throw new Error('Patient ID and reason are required');
  }

  const patient = await User.findById(patientId).select('name phone abhaId address');
  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }

  const referral = await Referral.create({
    patient: patientId,
    referredBy: req.user._id,
    toFacility: toFacility || 'District Hospital Sitapur',
    specialty: specialty || 'General Medicine',
    reason,
    clinicalSummary: notes || '',
    priority: priority || 'medium',
    transportMode: transportMode || 'self',
    estimatedArrival: estimatedArrival || '',
    statusHistory: [{
      status: 'pending',
      updatedBy: req.user._id,
      note: `Referral created by ${req.user.name}`,
      timestamp: new Date(),
    }],
  });

  const io = req.app.get('io');
  if (io) {
    io.to('doctor').emit('referral:new', { referral, patient });
    io.to('admin').emit('referral:new', { referral, patient });
  }

  res.status(201).json({
    success: true,
    message: `Referral created for ${patient.name} → ${toFacility}`,
    data: { ...referral.toObject(), patientName: patient.name, patientPhone: patient.phone, patientAbha: patient.abhaId },
  });
});

// GET /api/referrals — List referrals (filtered by role)
const getReferrals = asyncHandler(async (req, res) => {
  const { status, priority, page = 1, limit = 50 } = req.query;
  const filter = {};

  if (req.user.role === 'patient') {
    filter.patient = req.user._id;
  } else if (req.user.role === 'health_worker') {
    filter.referredBy = req.user._id;
  }

  if (status) filter.status = status;
  if (priority) filter.priority = priority;

  const referrals = await Referral.find(filter)
    .populate('patient', 'name phone abhaId address gender')
    .populate('referredBy', 'name role')
    .populate('referredTo', 'name specialization')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Referral.countDocuments(filter);

  res.json({ success: true, count: referrals.length, total, data: referrals });
});

// GET /api/referrals/all — Admin: all referrals
const getAllReferrals = asyncHandler(async (req, res) => {
  const { status, priority, page = 1, limit = 50 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (priority) filter.priority = priority;

  const referrals = await Referral.find(filter)
    .populate('patient', 'name phone abhaId address gender')
    .populate('referredBy', 'name role')
    .populate('referredTo', 'name specialization')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Referral.countDocuments(filter);
  const stats = await Referral.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  res.json({ success: true, count: referrals.length, total, stats, data: referrals });
});

// GET /api/referrals/:id — Get single referral detail
const getReferralById = asyncHandler(async (req, res) => {
  const referral = await Referral.findById(req.params.id)
    .populate('patient', 'name phone abhaId address gender dateOfBirth')
    .populate('referredBy', 'name role')
    .populate('referredTo', 'name specialization')
    .populate('statusHistory.updatedBy', 'name role');

  if (!referral) {
    res.status(404);
    throw new Error('Referral not found');
  }

  res.json({ success: true, data: referral });
});

// PATCH /api/referrals/:id/status — Update referral status
const updateReferralStatus = asyncHandler(async (req, res) => {
  const { status, note, rejectionReason, estimatedArrival, transportMode } = req.body;
  const referral = await Referral.findById(req.params.id);

  if (!referral) {
    res.status(404);
    throw new Error('Referral not found');
  }

  if (status) referral.status = status;
  if (rejectionReason) referral.rejectionReason = rejectionReason;
  if (estimatedArrival) referral.estimatedArrival = estimatedArrival;
  if (transportMode) referral.transportMode = transportMode;
  if (status === 'completed') referral.completedAt = new Date();

  referral.statusHistory.push({
    status: status || referral.status,
    updatedBy: req.user._id,
    note: note || `Status updated to ${status} by ${req.user.name}`,
    timestamp: new Date(),
  });

  await referral.save();

  const io = req.app.get('io');
  if (io) {
    io.to('patient').emit('referral:updated', { referral });
    io.to('health_worker').emit('referral:updated', { referral });
    io.to('doctor').emit('referral:updated', { referral });
    io.to('admin').emit('referral:updated', { referral });
  }

  res.json({ success: true, message: `Referral status updated to ${status}`, data: referral });
});

// GET /api/referrals/stats — Stats for dashboard
const getReferralStats = asyncHandler(async (req, res) => {
  const matchFilter = {};
  if (req.user.role === 'health_worker') matchFilter.referredBy = req.user._id;
  if (req.user.role === 'patient') matchFilter.patient = req.user._id;

  const [total, pending, accepted, inTransit, completed, rejected, emergency] = await Promise.all([
    Referral.countDocuments(matchFilter),
    Referral.countDocuments({ ...matchFilter, status: 'pending' }),
    Referral.countDocuments({ ...matchFilter, status: 'accepted' }),
    Referral.countDocuments({ ...matchFilter, status: 'in_transit' }),
    Referral.countDocuments({ ...matchFilter, status: 'completed' }),
    Referral.countDocuments({ ...matchFilter, status: 'rejected' }),
    Referral.countDocuments({ ...matchFilter, priority: 'emergency' }),
  ]);

  res.json({
    success: true,
    data: { total, pending, accepted, inTransit, completed, rejected, emergency },
  });
});

module.exports = {
  createReferral,
  getReferrals,
  getAllReferrals,
  getReferralById,
  updateReferralStatus,
  getReferralStats,
};
