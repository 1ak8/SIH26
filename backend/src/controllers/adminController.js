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

module.exports = { getAnalytics, getFacilities, getUsers };
