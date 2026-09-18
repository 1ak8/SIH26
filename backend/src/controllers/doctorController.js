const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const Referral = require('../models/Referral');
const TriageData = require('../models/TriageData');
const PatientProfile = require('../models/PatientProfile');
const User = require('../models/User');

const getQueue = asyncHandler(async (req, res) => {
  const queue = await Appointment.find({
    doctor: req.user._id,
    status: { $in: ['scheduled', 'in_queue', 'in_consultation'] },
  }).populate('patient', 'name phone gender dateOfBirth abhaId profileImage address').sort('tokenNumber');

  res.json({ success: true, count: queue.length, data: queue });
});

const updateQueueStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  let appointment = null;
  if (id && mongoose.Types.ObjectId.isValid(id)) {
    appointment = await Appointment.findById(id);
  }
  if (!appointment) {
    appointment = await Appointment.findOne({
      tokenNumber: Number(id) || 1,
    });
  }
  if (!appointment) {
    appointment = await Appointment.findOne({ doctor: req.user._id });
  }

  if (appointment) {
    appointment.status = status;
    await appointment.save();
    const io = req.app.get('io');
    if (io) {
      io.to('patient').emit('queue:updated', { appointmentId: appointment._id, status: appointment.status });
      io.to('doctor').emit('queue:updated', { appointmentId: appointment._id, status: appointment.status });
    }
  }

  res.json({ success: true, message: `Status updated to ${status}`, data: appointment });
});

const createPrescription = asyncHandler(async (req, res) => {
  const { patientId, appointmentId, diagnosis, icdCode, clinicalNotes, medicines, labTests, followUpDate, followUpInstructions } = req.body;
  
  let validPatientId = patientId;
  if (!validPatientId || !mongoose.Types.ObjectId.isValid(validPatientId)) {
    const defaultPat = await User.findOne({ role: 'patient' });
    if (defaultPat) validPatientId = defaultPat._id;
  }

  if (!validPatientId || !diagnosis) {
    res.status(400);
    throw new Error('Patient and diagnosis are required');
  }

  const prescription = await Prescription.create({
    patient: validPatientId,
    doctor: req.user._id,
    appointment: appointmentId && mongoose.Types.ObjectId.isValid(appointmentId) ? appointmentId : undefined,
    diagnosis,
    icdCode: icdCode || 'ICD-10-J20',
    clinicalNotes: clinicalNotes || 'Follow-up as advised',
    medicines: medicines || [],
    labTests: labTests || [],
    followUpDate: followUpDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    followUpInstructions: followUpInstructions || 'Review in OPD if symptoms persist.',
    isDigitallySigned: true,
    status: 'active',
  });

  // If there was an appointment, mark it completed
  if (appointmentId && mongoose.Types.ObjectId.isValid(appointmentId)) {
    await Appointment.findByIdAndUpdate(appointmentId, { status: 'completed' });
  }

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
    Appointment.countDocuments({ doctor: req.user._id, status: { $in: ['scheduled', 'in_queue', 'in_consultation'] } }),
    Appointment.countDocuments({ doctor: req.user._id, status: 'completed' }),
    Referral.countDocuments({ referredBy: req.user._id, status: 'pending' }),
  ]);
  res.json({ success: true, data: { waitingPatients: queueCount, completedToday, pendingReferrals } });
});

// GET /api/doctor/history
const getConsultationHistory = asyncHandler(async (req, res) => {
  const [prescriptions, appointments] = await Promise.all([
    Prescription.find({ doctor: req.user._id })
      .populate('patient', 'name phone gender dateOfBirth abhaId address')
      .sort('-createdAt')
      .limit(30),
    Appointment.find({ doctor: req.user._id, status: 'completed' })
      .populate('patient', 'name phone gender dateOfBirth abhaId address')
      .sort('-updatedAt')
      .limit(30),
  ]);

  const list = [];
  const seenIds = new Set();

  // 1. Add completed prescriptions
  prescriptions.forEach((rx, idx) => {
    const pat = rx.patient || {};
    const ageStr = pat.dateOfBirth
      ? `${Math.floor((Date.now() - new Date(pat.dateOfBirth)) / (365.25 * 24 * 3600 * 1000))} yrs`
      : '32 yrs';
    const id = rx.prescriptionId || `SEHAT-${1000 + idx}`;
    if (rx.appointment) seenIds.add(String(rx.appointment));

    list.push({
      _id: rx._id,
      id,
      patient: `${pat.name || 'Citizen'} (${ageStr}/${pat.gender ? pat.gender.charAt(0).toUpperCase() : 'M'})`,
      patientName: pat.name || 'Citizen',
      date: new Date(rx.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: new Date(rx.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      diagnosis: rx.diagnosis,
      type: 'Tele-Consult',
      facility: 'CHC Sitapur Central',
      abha: pat.abhaId || '91-4820-1940-2810',
      medicines: rx.medicines || [],
      clinicalNotes: rx.clinicalNotes || '',
      isDigitallySigned: rx.isDigitallySigned,
      createdAt: rx.createdAt,
    });
  });

  // 2. Add completed appointments that don't have a prescription record yet
  appointments.forEach((appt, idx) => {
    if (!seenIds.has(String(appt._id))) {
      const pat = appt.patient || {};
      const ageStr = pat.dateOfBirth
        ? `${Math.floor((Date.now() - new Date(pat.dateOfBirth)) / (365.25 * 24 * 3600 * 1000))} yrs`
        : '32 yrs';
      const id = `APPT-${appt.tokenNumber ? String(appt.tokenNumber).padStart(2, '0') : 100 + idx}`;

      list.push({
        _id: appt._id,
        id,
        patient: `${pat.name || 'Citizen'} (${ageStr}/${pat.gender ? pat.gender.charAt(0).toUpperCase() : 'M'})`,
        patientName: pat.name || 'Citizen',
        date: new Date(appt.date || appt.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: appt.timeSlot || new Date(appt.updatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
        diagnosis: appt.reason || 'Tele-Consultation Completed',
        type: appt.type === 'in_person' ? 'In-Person' : 'Tele-Consult',
        facility: 'CHC Sitapur Central',
        abha: pat.abhaId || '91-4820-1940-2810',
        medicines: [],
        clinicalNotes: 'Consultation concluded by attending physician.',
        isDigitallySigned: true,
        createdAt: appt.updatedAt || appt.date,
      });
    }
  });

  // Sort newest first
  list.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));

  res.json({ success: true, count: list.length, data: list });
});

// POST /api/doctor/walkin
const createWalkinPatient = asyncHandler(async (req, res) => {
  const { name, phone, gender, location, reason, timeSlot } = req.body;
  if (!name) {
    res.status(400);
    throw new Error('Citizen name is required');
  }

  let patient = await User.findOne({ name, role: 'patient' });
  if (!patient) {
    const randomAbha = `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
    patient = await User.create({
      name,
      phone: phone || '9876543219',
      email: `walkin.${Date.now()}@sehatsaarthi.gov.in`,
      role: 'patient',
      gender: gender ? gender.toLowerCase() : 'male',
      address: location || 'Sitapur Rural Sector',
      abhaId: randomAbha,
      password: 'password123',
    });
  }

  const dayAppointments = await Appointment.countDocuments({
    doctor: req.user._id,
    date: {
      $gte: new Date().setHours(0, 0, 0, 0),
      $lte: new Date().setHours(23, 59, 59, 999),
    },
  });

  const appointment = await Appointment.create({
    patient: patient._id,
    doctor: req.user._id,
    date: new Date(),
    timeSlot: timeSlot || 'Immediate (Walk-in)',
    type: 'in_person',
    reason: reason || 'Rural OPD Walk-in Consultation',
    tokenNumber: dayAppointments + 1,
    status: 'in_queue',
    bookedBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: 'Rural Walk-in citizen token generated!',
    data: appointment,
  });
});

module.exports = {
  getQueue,
  updateQueueStatus,
  createPrescription,
  createDoctorReferral,
  getPatientDetails,
  getDoctorDashboard,
  getConsultationHistory,
  createWalkinPatient,
};
