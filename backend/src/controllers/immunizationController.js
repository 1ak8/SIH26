const asyncHandler = require('express-async-handler');
const Immunization = require('../models/Immunization');
const MaternalCheckup = require('../models/MaternalCheckup');
const PatientProfile = require('../models/PatientProfile');

const getImmunizations = asyncHandler(async (req, res) => {
  const immunizations = await Immunization.find({ patient: req.user._id }).sort('-dateAdministered');
  const upcoming = immunizations.filter(i => i.status === 'scheduled' || i.status === 'overdue');
  const completed = immunizations.filter(i => i.status === 'completed');
  const stats = {
    total: immunizations.length,
    completed: completed.length,
    scheduled: upcoming.length,
    overdue: immunizations.filter(i => i.status === 'overdue').length,
  };
  res.json({ success: true, data: { immunizations, stats, upcoming, completed } });
});

const scheduleImmunization = asyncHandler(async (req, res) => {
  const { vaccineName, vaccineCode, doseNumber, nextDueDate, facility, administeredBy, category, notes } = req.body;
  if (!vaccineName) {
    res.status(400);
    throw new Error('Vaccine name is required');
  }

  const parsedDate = (nextDueDate && !isNaN(new Date(nextDueDate).getTime())) 
    ? new Date(nextDueDate) 
    : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  const imm = await Immunization.create({
    patient: req.user._id,
    vaccineName,
    vaccineCode: vaccineCode || vaccineName.substring(0, 6).toUpperCase(),
    doseNumber: doseNumber ? Number(doseNumber) : 1,
    nextDueDate: parsedDate,
    facility: facility || 'Anganwadi Centre 3',
    administeredBy: administeredBy || 'ASHA Worker Sunita Devi',
    status: 'scheduled',
    category: category || 'child',
    notes: notes || '',
  });
  const io = req.app.get('io');
  if (io) io.to('health_worker').emit('immunization:scheduled', { patient: req.user.name, vaccine: vaccineName });
  res.status(201).json({ success: true, data: imm });
});

const completeImmunization = asyncHandler(async (req, res) => {
  const { batchNumber, sideEffects, certificateId } = req.body;
  const imm = await Immunization.findByIdAndUpdate(
    req.params.id,
    {
      status: 'completed',
      dateAdministered: new Date(),
      batchNumber,
      sideEffects,
      certificateId: certificateId || 'VAX-' + Math.floor(100000 + Math.random() * 900000),
    },
    { new: true }
  );
  if (!imm) {
    res.status(404);
    throw new Error('Immunization record not found');
  }
  res.json({ success: true, data: imm });
});

const cancelImmunization = asyncHandler(async (req, res) => {
  const imm = await Immunization.findByIdAndUpdate(
    req.params.id,
    { status: 'cancelled', notes: req.body.reason || 'Cancelled by patient' },
    { new: true }
  );
  if (!imm) {
    res.status(404);
    throw new Error('Immunization record not found');
  }
  res.json({ success: true, data: imm });
});

const getMaternalCheckups = asyncHandler(async (req, res) => {
  const checkups = await MaternalCheckup.find({ patient: req.user._id }).sort('dateOfVisit');
  const profile = await PatientProfile.findOne({ user: req.user._id });
  const upcoming = checkups.filter(c => c.status === 'scheduled');
  const completed = checkups.filter(c => c.status === 'completed');

  const maternalProfile = (profile?.maternalHealth?.isPregnant || checkups.length > 0)
    ? {
        isPregnant: true,
        weeksPregnant: profile?.maternalHealth?.weeksPregnant || checkups[0]?.weeksPregnant || 34,
        gravida: profile?.maternalHealth?.gravida || 2,
        para: profile?.maternalHealth?.para || 1,
        expectedDelivery: profile?.maternalHealth?.expectedDelivery || new Date(Date.now() + 42 * 24 * 60 * 60 * 1000),
      }
    : (profile?.maternalHealth || null);

  res.json({ success: true, data: { checkups, upcoming, completed, maternalProfile } });
});

const scheduleMaternalCheckup = asyncHandler(async (req, res) => {
  const { visitType, dateOfVisit, weeksPregnant, facility, doctorName, notes } = req.body;
  const checkupCount = await MaternalCheckup.countDocuments({ patient: req.user._id });
  
  const parsedDate = (dateOfVisit && !isNaN(new Date(dateOfVisit).getTime()))
    ? new Date(dateOfVisit)
    : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  const checkup = await MaternalCheckup.create({
    patient: req.user._id,
    visitType: visitType || 'ANC-4',
    visitNumber: checkupCount + 1,
    dateOfVisit: parsedDate,
    weeksPregnant: weeksPregnant ? Number(weeksPregnant) : 34,
    facility: facility || 'CHC Sitapur Central',
    doctorName: doctorName || 'Dr. Priya Verma (Gynecologist)',
    status: 'scheduled',
    notes: notes || '',
  });

  // Permanently activate maternal record in patient profile in DB
  await PatientProfile.findOneAndUpdate(
    { user: req.user._id },
    {
      $set: {
        'maternalHealth.isPregnant': true,
        'maternalHealth.weeksPregnant': weeksPregnant ? Number(weeksPregnant) : 34,
        'maternalHealth.gravida': 2,
        'maternalHealth.para': 1,
      }
    },
    { upsert: true }
  );

  const io = req.app.get('io');
  if (io) io.to('health_worker').emit('maternal:scheduled', { patient: req.user.name, visit: visitType });
  res.status(201).json({ success: true, data: checkup });
});

const completeMaternalCheckup = asyncHandler(async (req, res) => {
  const { vitals, supplements, testsOrdered, diagnosis, riskLevel, nextVisitDate, notes } = req.body;
  const checkup = await MaternalCheckup.findByIdAndUpdate(
    req.params.id,
    {
      status: 'completed',
      vitals,
      supplements,
      testsOrdered,
      diagnosis,
      riskLevel,
      nextVisitDate,
      notes,
    },
    { new: true }
  );
  if (!checkup) {
    res.status(404);
    throw new Error('Checkup record not found');
  }
  res.json({ success: true, data: checkup });
});

module.exports = {
  getImmunizations,
  scheduleImmunization,
  completeImmunization,
  cancelImmunization,
  getMaternalCheckups,
  scheduleMaternalCheckup,
  completeMaternalCheckup,
};
