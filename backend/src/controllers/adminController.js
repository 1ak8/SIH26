const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Referral = require('../models/Referral');
const TriageData = require('../models/TriageData');
const Facility = require('../models/Facility');

// GET /api/admin/analytics
const getAnalytics = asyncHandler(async (req, res) => {
  const [totalPatients, totalDoctors, totalHealthWorkers, totalFacilities,
    totalAppointments, totalReferrals, pendingReferrals, completedReferrals,
    todayConsultations, highRiskCases] = await Promise.all([
    User.countDocuments({ role: 'patient' }),
    User.countDocuments({ role: 'doctor' }),
    User.countDocuments({ role: 'health_worker' }),
    Facility.countDocuments(),
    Appointment.countDocuments(),
    Referral.countDocuments(),
    Referral.countDocuments({ status: 'pending' }),
    Referral.countDocuments({ status: 'completed' }),
    (() => {
      const today = new Date(); today.setHours(0,0,0,0);
      const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
      return Appointment.countDocuments({ date: { $gte: today, $lt: tomorrow } });
    })(),
    TriageData.countDocuments({ riskLevel: { $in: ['high', 'emergency'] } }),
  ]);
  res.json({
    success: true,
    data: {
      totalPatients, totalDoctors, totalHealthWorkers, totalFacilities,
      totalAppointments, totalReferrals, pendingReferrals, completedReferrals,
      todayConsultations, highRiskCases,
      referralCompletionRate: totalReferrals > 0 ? Math.round((completedReferrals / totalReferrals) * 100) : 0,
    },
  });
});

// GET /api/admin/facilities
const getFacilities = asyncHandler(async (req, res) => {
  const facilities = await Facility.find().populate('doctors', 'name specialization').populate('healthWorkers', 'name');
  res.json({ success: true, data: facilities });
});

// GET /api/admin/users
const getUsers = asyncHandler(async (req, res) => {
  const { role } = req.query;
  const filter = role ? { role } : {};
  const users = await User.find(filter).select('-password').sort('-createdAt');
  res.json({ success: true, data: users });
});

// POST /api/admin/facilities/:id/inventory
const updateFacilityStock = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, quantity, unit, status } = req.body;

  const facility = await Facility.findById(id);
  if (!facility) {
    res.status(404);
    throw new Error('Facility not found');
  }

  const existingIndex = facility.medicineInventory.findIndex(m => m.name.toLowerCase() === (name || '').toLowerCase());
  if (existingIndex >= 0) {
    facility.medicineInventory[existingIndex].quantity = (facility.medicineInventory[existingIndex].quantity || 0) + Number(quantity || 1000);
    facility.medicineInventory[existingIndex].status = facility.medicineInventory[existingIndex].quantity < 2000 ? 'low_stock' : 'in_stock';
  } else {
    facility.medicineInventory.push({
      name: name || 'Generic Paracetamol 500mg',
      quantity: Number(quantity || 2500),
      unit: unit || 'units',
      status: status || 'in_stock',
    });
  }

  await facility.save();
  res.json({ success: true, message: `Stock replenished for ${name}!`, data: facility });
});

// POST /api/admin/directives
const broadcastDirective = asyncHandler(async (req, res) => {
  const { title, priority, message } = req.body;
  const directive = {
    id: `DIR-${Date.now()}`,
    title: title || 'Emergency Public Health Surveillance Alert',
    priority: priority || 'high',
    message: message || 'All sub-centres to expedite vector-borne fever screening.',
    issuedBy: req.user?.name || 'Mission Directorate',
    issuedAt: new Date(),
  };

  const io = req.app.get('io');
  if (io) {
    io.emit('state:directive', directive);
  }

  res.status(201).json({ success: true, message: 'Directive broadcasted across state tele-health network!', data: directive });
});

module.exports = { getAnalytics, getFacilities, getUsers, updateFacilityStock, broadcastDirective };
