const asyncHandler = require('express-async-handler');
const Appointment = require('../models/Appointment');
const PatientProfile = require('../models/PatientProfile');
const Prescription = require('../models/Prescription');
const Referral = require('../models/Referral');
const User = require('../models/User');
const VisitRequest = require('../models/VisitRequest');

const getProfile = asyncHandler(async (req, res) => {
  let profile = await PatientProfile.findOne({ user: req.user._id }).populate('user', 'name email phone gender dateOfBirth address profileImage abhaId');
  if (!profile) {
    profile = await PatientProfile.create({ user: req.user._id });
    profile = await PatientProfile.findOne({ user: req.user._id }).populate('user', 'name email phone gender dateOfBirth address profileImage abhaId');
  }
  res.json({ success: true, data: profile });
});

const updateProfile = asyncHandler(async (req, res) => {
  const profile = await PatientProfile.findOneAndUpdate({ user: req.user._id }, req.body, { new: true, runValidators: true });
  const io = req.app.get('io');
  if (io) io.to('doctor').emit('patient:updated', { patientId: req.user._id });
  res.json({ success: true, data: profile });
});

const bookAppointment = asyncHandler(async (req, res) => {
  const { doctorId, date, timeSlot, type, reason } = req.body;
  if (!doctorId || !date || !timeSlot) {
    res.status(400);
    throw new Error('Doctor, date, and time slot are required');
  }
  const doctor = await User.findById(doctorId);
  if (!doctor || doctor.role !== 'doctor') {
    res.status(404);
    throw new Error('Doctor not found');
  }
  const dayAppointments = await Appointment.countDocuments({ doctor: doctorId, date: { $gte: new Date(date).setHours(0,0,0,0), $lte: new Date(date).setHours(23,59,59,999) } });
  const appointment = await Appointment.create({
    patient: req.user._id, doctor: doctorId, date, timeSlot,
    type: type || 'in_person', reason, tokenNumber: dayAppointments + 1,
    bookedBy: req.user._id,
  });
  const io = req.app.get('io');
  if (io) {
    io.to('doctor').emit('appointment:booked', { doctorId, patient: req.user.name, timeSlot });
    io.to('patient').emit('appointment:confirmed', { appointment });
  }
  res.status(201).json({ success: true, data: appointment });
});

const getAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({ patient: req.user._id })
    .populate('doctor', 'name specialization profileImage')
    .sort('-date');
  res.json({ success: true, data: appointments });
});

const getPrescriptions = asyncHandler(async (req, res) => {
  const prescriptions = await Prescription.find({ patient: req.user._id })
    .populate('doctor', 'name specialization')
    .sort('-createdAt');
  res.json({ success: true, data: prescriptions });
});

const getReferrals = asyncHandler(async (req, res) => {
  const referrals = await Referral.find({ patient: req.user._id })
    .populate('referredBy', 'name role')
    .populate('referredTo', 'name specialization')
    .sort('-createdAt');
  res.json({ success: true, data: referrals });
});

const getDashboard = asyncHandler(async (req, res) => {
  const [profile, appointments, prescriptions, referrals] = await Promise.all([
    PatientProfile.findOne({ user: req.user._id }),
    Appointment.find({ patient: req.user._id, status: { $in: ['scheduled', 'in_queue'] } }).populate('doctor', 'name specialization profileImage').sort('date').limit(3),
    Prescription.find({ patient: req.user._id, status: 'active' }).populate('doctor', 'name').sort('-createdAt').limit(5),
    Referral.find({ patient: req.user._id, status: { $in: ['pending', 'in_progress'] } }).populate('referredBy', 'name').limit(3),
  ]);
  res.json({ success: true, data: { profile, upcomingAppointments: appointments, activePrescriptions: prescriptions, activeReferrals: referrals } });
});

const requestVisit = asyncHandler(async (req, res) => {
  const { patientName, patientPhone, patientAddress, reason, urgency, preferredSlot, notes } = req.body;
  const visit = await VisitRequest.create({
    patient: req.user._id,
    patientName: patientName || req.user.name || 'Patient',
    patientPhone: patientPhone || req.user.phone || '9876543211',
    patientAddress: patientAddress || 'Sitapur Ward 4',
    ashaName: 'Sunita Devi',
    reason: reason || 'Routine Health Checkup',
    urgency: urgency || 'routine',
    preferredSlot: preferredSlot || 'Morning (9 AM - 12 PM)',
    notes: notes || '',
    status: 'pending',
  });
  const io = req.app.get('io');
  if (io) {
    io.to('health_worker').emit('visit:new', visit);
  }
  res.status(201).json({ success: true, data: visit });
});

const getPatientVisits = asyncHandler(async (req, res) => {
  const visits = await VisitRequest.find({ patient: req.user._id }).sort('-createdAt');
  res.json({ success: true, data: visits });
});

module.exports = { getProfile, updateProfile, bookAppointment, getAppointments, getPrescriptions, getReferrals, getDashboard, requestVisit, getPatientVisits };
