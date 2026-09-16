const asyncHandler = require('express-async-handler');
const TriageData = require('../models/TriageData');
const Referral = require('../models/Referral');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const VisitRequest = require('../models/VisitRequest');
const Immunization = require('../models/Immunization');
const MaternalCheckup = require('../models/MaternalCheckup');
const AshaTask = require('../models/AshaTask');

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
  const patients = await User.find({ role: 'patient' }).select('-password').sort('name');
  const patientIds = patients.map(p => p._id);
  
  const profiles = await PatientProfile.find({ user: { $in: patientIds } });
  const profileMap = {};
  profiles.forEach(pr => { profileMap[pr.user.toString()] = pr; });

  const latestTriages = await TriageData.find({ patient: { $in: patientIds } }).sort('-createdAt');
  const triageMap = {};
  latestTriages.forEach(tr => {
    if (!triageMap[tr.patient.toString()]) triageMap[tr.patient.toString()] = tr;
  });

  const enriched = patients.map(p => {
    const prof = profileMap[p._id.toString()];
    const triage = triageMap[p._id.toString()];
    return {
      _id: p._id,
      name: p.name,
      phone: p.phone,
      email: p.email,
      gender: p.gender || 'Not specified',
      dateOfBirth: p.dateOfBirth,
      abhaId: p.abhaId || '91-4820-1940-2810',
      address: p.address || 'Sitapur Ward 4',
      profile: prof || null,
      vitals: prof?.vitals || triage?.vitals || null,
      maternalHealth: prof?.maternalHealth || null,
      chronicConditions: prof?.chronicConditions || [],
      allergies: prof?.allergies || [],
      lastTriage: triage || null,
    };
  });

  res.json({ success: true, count: enriched.length, data: enriched });
});

// GET /api/health-worker/village-immunizations
const getVillageImmunizations = asyncHandler(async (req, res) => {
  const immunizations = await Immunization.find()
    .populate('patient', 'name phone abhaId')
    .sort('scheduledDate');
  const maternalCheckups = await MaternalCheckup.find()
    .populate('patient', 'name phone abhaId')
    .sort('dateOfVisit');

  res.json({
    success: true,
    data: {
      immunizations,
      maternalCheckups,
      dueCount: immunizations.filter(i => i.status === 'scheduled' || i.status === 'overdue').length,
      completedCount: immunizations.filter(i => i.status === 'completed').length,
    }
  });
});

// POST /api/health-worker/immunizations/:id/complete
const logImmunizationDose = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { batchNumber, facility, notes } = req.body;

  const imm = await Immunization.findById(id);
  if (!imm) {
    res.status(404);
    throw new Error('Immunization record not found');
  }

  imm.status = 'completed';
  imm.administeredDate = new Date();
  imm.administeredBy = req.user.name || 'Sunita Devi (ASHA)';
  if (batchNumber) imm.batchNumber = batchNumber;
  if (facility) imm.facility = facility;
  if (notes) imm.notes = notes;

  await imm.save();

  const io = req.app.get('io');
  if (io) {
    io.emit('immunization:completed', imm);
  }

  res.json({ success: true, message: 'Dose logged on U-WIN/ABDM Grid successfully!', data: imm });
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

const getVisitRequests = asyncHandler(async (req, res) => {
  const visits = await VisitRequest.find().sort('-createdAt');
  res.json({ success: true, data: visits });
});

const updateVisitStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, scheduledTime, actionNotes } = req.body;
  
  const updateData = { status };
  if (scheduledTime) updateData.scheduledTime = scheduledTime;
  if (actionNotes) updateData.actionNotes = actionNotes;

  const visit = await VisitRequest.findByIdAndUpdate(id, updateData, { new: true });
  if (!visit) {
    res.status(404);
    throw new Error('Visit request not found');
  }

  const io = req.app.get('io');
  if (io) {
    io.to('patient').emit('visit:status_updated', visit);
    io.to('health_worker').emit('visit:status_updated', visit);
  }
  res.json({ success: true, data: visit });
});

// GET /api/health-worker/tasks
const getAshaTasks = asyncHandler(async (req, res) => {
  const tasks = await AshaTask.find().sort('-createdAt');
  res.json({ success: true, count: tasks.length, data: tasks });
});

// POST /api/health-worker/tasks
const createAshaTask = asyncHandler(async (req, res) => {
  const {
    ashaWorker,
    patientId,
    patientName,
    patientPhone,
    patientAddress,
    taskType,
    priority,
    scheduledDate,
    scheduledTime,
    instructions,
  } = req.body;

  if (!ashaWorker || !patientName) {
    res.status(400);
    throw new Error('ASHA worker and patient details are required');
  }

  const task = await AshaTask.create({
    assignedBy: req.user._id,
    assignedByName: req.user.name || 'Community Health Worker (CHO)',
    ashaWorker: typeof ashaWorker === 'string' ? { name: ashaWorker, phone: '9876543230', ward: 'Sitapur Sector' } : ashaWorker,
    patient: patientId || undefined,
    patientName,
    patientPhone: patientPhone || '',
    patientAddress: patientAddress || '',
    taskType: taskType || 'Home Visit & Vitals',
    priority: priority || 'routine',
    scheduledDate: scheduledDate || 'Today',
    scheduledTime: scheduledTime || 'Morning (10:00 AM)',
    instructions: instructions || 'Conduct field checkup and report vitals.',
    status: 'pending',
  });

  const io = req.app.get('io');
  if (io) {
    io.emit('asha:task_assigned', task);
  }

  res.status(201).json({ success: true, message: 'Task assigned to ASHA successfully!', data: task });
});

// PATCH /api/health-worker/tasks/:id/status
const updateAshaTaskStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, outcomeNotes } = req.body;

  const task = await AshaTask.findById(id);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  if (status) task.status = status;
  if (outcomeNotes) task.outcomeNotes = outcomeNotes;
  if (status === 'completed') task.completedAt = new Date();

  await task.save();

  const io = req.app.get('io');
  if (io) {
    io.emit('asha:task_status_updated', task);
  }

  res.json({ success: true, message: 'Task status updated!', data: task });
});

// POST /api/health-worker/register-citizen
const registerCitizen = asyncHandler(async (req, res) => {
  const { name, phone, gender, village, condition, allergies } = req.body;
  if (!name) {
    res.status(400);
    throw new Error('Name is required');
  }

  const email = `citizen.${Date.now()}@sehatsaarthi.gov.in`;
  const randomAbha = `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;

  const user = await User.create({
    name,
    email,
    phone: phone || '9876543299',
    role: 'patient',
    gender: gender ? gender.toLowerCase() : 'female',
    address: village || 'Sitapur Ward 4',
    abhaId: randomAbha,
    password: 'password123',
  });

  await PatientProfile.create({
    user: user._id,
    abhaId: randomAbha,
    allergies: allergies ? [{ name: allergies, severity: 'mild' }] : [],
    chronicConditions: condition ? [{ condition, diagnosedDate: new Date(), status: 'active' }] : [],
    vitals: {
      systolicBP: 120,
      diastolicBP: 80,
      heartRate: 72,
      spO2: 98,
      temperature: 98.6,
      bloodSugar: 100,
      lastUpdated: new Date(),
    },
  });

  res.status(201).json({
    success: true,
    message: 'Citizen registered successfully!',
    data: {
      _id: user._id,
      name: user.name,
      phone: user.phone,
      abhaId: randomAbha,
      address: user.address,
      gender: user.gender,
    },
  });
});

module.exports = {
  submitTriage,
  createReferral,
  getAssignedPatients,
  getHWDashboard,
  bookForPatient,
  getVisitRequests,
  updateVisitStatus,
  getVillageImmunizations,
  logImmunizationDose,
  getAshaTasks,
  createAshaTask,
  updateAshaTaskStatus,
  registerCitizen,
};
