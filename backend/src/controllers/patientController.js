const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const Appointment = require('../models/Appointment');
const PatientProfile = require('../models/PatientProfile');
const Prescription = require('../models/Prescription');
const Referral = require('../models/Referral');
const User = require('../models/User');
const VisitRequest = require('../models/VisitRequest');
const Facility = require('../models/Facility');

const getProfile = asyncHandler(async (req, res) => {
  let profile = await PatientProfile.findOne({ user: req.user._id }).populate('user', 'name email phone gender dateOfBirth address profileImage abhaId');
  if (!profile) {
    profile = await PatientProfile.create({ user: req.user._id });
    profile = await PatientProfile.findOne({ user: req.user._id }).populate('user', 'name email phone gender dateOfBirth address profileImage abhaId');
  }
  res.json({ success: true, data: profile });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, address, gender, dateOfBirth } = req.body;

  // Update User fields if provided
  const userUpdates = {};
  if (name) userUpdates.name = name;
  if (phone) userUpdates.phone = phone;
  if (address) userUpdates.address = address;
  if (gender) userUpdates.gender = gender;
  if (dateOfBirth) userUpdates.dateOfBirth = dateOfBirth;

  if (Object.keys(userUpdates).length > 0) {
    await User.findByIdAndUpdate(req.user._id, userUpdates, { new: true });
  }

  // Update PatientProfile fields
  const profileUpdates = { ...req.body };
  delete profileUpdates.name;
  delete profileUpdates.phone;
  delete profileUpdates.email;

  const profile = await PatientProfile.findOneAndUpdate(
    { user: req.user._id },
    profileUpdates,
    { new: true, upsert: true }
  ).populate('user', 'name email phone gender dateOfBirth address profileImage abhaId');

  const io = req.app.get('io');
  if (io) io.to('doctor').emit('patient:updated', { patientId: req.user._id });
  res.json({ success: true, data: profile });
});

const bookAppointment = asyncHandler(async (req, res) => {
  const { doctorId, date, timeSlot, type, reason } = req.body;
  if (!date || !timeSlot) {
    res.status(400);
    throw new Error('Date and time slot are required');
  }

  // Find doctor safely: by ID or fallback to active doctor in DB
  let doctor = null;
  if (doctorId && mongoose.Types.ObjectId.isValid(doctorId)) {
    doctor = await User.findById(doctorId);
  }
  if (!doctor || doctor.role !== 'doctor') {
    doctor = await User.findOne({ role: 'doctor' });
  }

  if (!doctor) {
    res.status(404);
    throw new Error('No active doctor found in system');
  }

  const apptDate = new Date(date);
  const dayAppointments = await Appointment.countDocuments({
    doctor: doctor._id,
    date: {
      $gte: new Date(apptDate).setHours(0, 0, 0, 0),
      $lte: new Date(apptDate).setHours(23, 59, 59, 999),
    },
  });

  const appointment = await Appointment.create({
    patient: req.user._id,
    doctor: doctor._id,
    date: apptDate,
    timeSlot,
    type: type || 'teleconsultation',
    reason: reason || 'General medical consultation',
    tokenNumber: dayAppointments + 1,
    bookedBy: req.user._id,
  });

  const io = req.app.get('io');
  if (io) {
    io.to('doctor').emit('appointment:booked', { doctorId: doctor._id, patient: req.user.name, timeSlot });
    io.to('patient').emit('appointment:confirmed', { appointment });
  }
  res.status(201).json({ success: true, data: appointment });
});
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

// Haversine formula to calculate distance in kilometers
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round((R * c) * 10) / 10;
}

// GET /api/patient/facilities - Find nearest PHCs, CHCs, Sub-Centres
const getFacilities = asyncHandler(async (req, res) => {
  const { search, pincode, type, lat, lng } = req.query;

  const query = { isActive: true };
  if (type && type !== 'ALL') {
    query.type = type;
  }
  if (pincode) {
    query['address.pincode'] = pincode;
  }
  if (search) {
    const searchRegex = new RegExp(search, 'i');
    query.$or = [
      { name: searchRegex },
      { 'address.line1': searchRegex },
      { 'address.city': searchRegex },
      { 'address.district': searchRegex },
      { 'address.pincode': searchRegex },
      { services: searchRegex },
    ];
  }

  const facilities = await Facility.find(query)
    .populate('doctors', 'name specialization')
    .populate('healthWorkers', 'name phone');

  // Default citizen coordinates: Sitapur center [lat: 27.5800, lng: 80.7100]
  const userLat = lat ? parseFloat(lat) : 27.5800;
  const userLng = lng ? parseFloat(lng) : 80.7100;

  const enrichedFacilities = facilities.map(fac => {
    const facLng = fac.location?.coordinates?.[0] || 80.7200;
    const facLat = fac.location?.coordinates?.[1] || 27.5890;
    const distanceKm = calculateDistance(userLat, userLng, facLat, facLng);

    return {
      _id: fac._id,
      name: fac.name,
      type: fac.type,
      address: fac.address,
      coordinates: [facLng, facLat],
      distanceKm,
      contactPhone: fac.contactPhone || '05862-242108',
      services: fac.services || [],
      capacity: fac.capacity || { beds: 10, opdRooms: 2, icuBeds: 0 },
      medicineInventory: fac.medicineInventory?.slice(0, 6) || [],
      diagnosticServices: fac.diagnosticServices || [],
      doctors: fac.doctors || [],
      healthWorkers: fac.healthWorkers || [],
      timing: fac.type === 'CHC' || fac.type === 'district_hospital' || fac.type === 'tertiary'
        ? '24x7 Emergency & In-Patient'
        : '9:00 AM – 4:00 PM (Mon-Sat)',
      mapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${facLat},${facLng}`,
    };
  });

  // Sort by distance ascending (nearest first)
  enrichedFacilities.sort((a, b) => a.distanceKm - b.distanceKm);

  res.json({
    success: true,
    count: enrichedFacilities.length,
    userLocation: { lat: userLat, lng: userLng },
    data: enrichedFacilities,
  });
});

module.exports = {
  getProfile,
  updateProfile,
  bookAppointment,
  getAppointments,
  getPrescriptions,
  getReferrals,
  getDashboard,
  requestVisit,
  getPatientVisits,
  getFacilities,
};
