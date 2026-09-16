const asyncHandler = require('express-async-handler');
const LabOrder = require('../models/LabOrder');
const User = require('../models/User');

const TEST_TEMPLATES = {
  'Complete Blood Count (CBC)': {
    category: 'Hematology',
    summary: 'Hemogram parameters are within normal physiological reference ranges.',
    results: [
      { parameter: 'Hemoglobin (Hb)', value: '13.8', unit: 'g/dL', normalRange: '13.0 - 17.0', flag: 'Normal' },
      { parameter: 'Total Leukocyte Count (TLC)', value: '6,850', unit: '/cu.mm', normalRange: '4,000 - 11,000', flag: 'Normal' },
      { parameter: 'Platelet Count', value: '2.45', unit: 'Lakhs /cu.mm', normalRange: '1.50 - 4.50', flag: 'Normal' },
      { parameter: 'Packed Cell Volume (PCV)', value: '42.5', unit: '%', normalRange: '40.0 - 50.0', flag: 'Normal' },
      { parameter: 'Red Blood Cells (RBC)', value: '4.82', unit: 'mill/cu.mm', normalRange: '4.50 - 5.50', flag: 'Normal' },
      { parameter: 'Neutrophils', value: '62', unit: '%', normalRange: '40 - 75', flag: 'Normal' },
      { parameter: 'Lymphocytes', value: '30', unit: '%', normalRange: '20 - 45', flag: 'Normal' },
      { parameter: 'Eosinophils', value: '3', unit: '%', normalRange: '1 - 6', flag: 'Normal' },
    ],
  },
  'HbA1c & Fasting Sugar': {
    category: 'Biochemistry',
    summary: 'Glycemic control profile: Fasting blood glucose in optimal range.',
    results: [
      { parameter: 'Fasting Blood Sugar (FBS)', value: '96', unit: 'mg/dL', normalRange: '70 - 100', flag: 'Normal' },
      { parameter: 'Glycated Hemoglobin (HbA1c)', value: '5.6', unit: '%', normalRange: '< 5.7 Normal', flag: 'Normal' },
      { parameter: 'Estimated Average Glucose (eAG)', value: '114', unit: 'mg/dL', normalRange: '90 - 120', flag: 'Normal' },
    ],
  },
  'Lipid Profile': {
    category: 'Biochemistry',
    summary: 'Lipid panel indicates optimal cardioprotective balance with borderline LDL.',
    results: [
      { parameter: 'Total Cholesterol', value: '184', unit: 'mg/dL', normalRange: '< 200 Desirable', flag: 'Normal' },
      { parameter: 'Triglycerides', value: '142', unit: 'mg/dL', normalRange: '< 150 Normal', flag: 'Normal' },
      { parameter: 'HDL Cholesterol (Good)', value: '46', unit: 'mg/dL', normalRange: '> 40', flag: 'Normal' },
      { parameter: 'LDL Cholesterol (Bad)', value: '108', unit: 'mg/dL', normalRange: '< 100 Optimal', flag: 'High' },
      { parameter: 'VLDL Cholesterol', value: '28', unit: 'mg/dL', normalRange: '< 30', flag: 'Normal' },
      { parameter: 'Cholesterol / HDL Ratio', value: '4.0', unit: 'ratio', normalRange: '< 4.5', flag: 'Normal' },
    ],
  },
  'Thyroid Panel (T3, T4, TSH)': {
    category: 'Endocrinology',
    summary: 'Euthyroid profile. Thyroid stimulating hormone within normal limits.',
    results: [
      { parameter: 'Total T3 (Triiodothyronine)', value: '1.24', unit: 'ng/mL', normalRange: '0.80 - 2.00', flag: 'Normal' },
      { parameter: 'Total T4 (Thyroxine)', value: '8.6', unit: 'ug/dL', normalRange: '5.1 - 14.1', flag: 'Normal' },
      { parameter: 'TSH (Ultrasensitive)', value: '2.48', unit: 'uIU/mL', normalRange: '0.40 - 4.20', flag: 'Normal' },
    ],
  },
  'Liver Function Test (LFT)': {
    category: 'Biochemistry',
    summary: 'Hepatic enzymes and bilirubin clearance are within normal reference thresholds.',
    results: [
      { parameter: 'Serum Bilirubin Total', value: '0.75', unit: 'mg/dL', normalRange: '0.2 - 1.2', flag: 'Normal' },
      { parameter: 'Serum Bilirubin Direct', value: '0.22', unit: 'mg/dL', normalRange: '0.0 - 0.3', flag: 'Normal' },
      { parameter: 'SGOT / AST', value: '26', unit: 'U/L', normalRange: '5 - 40', flag: 'Normal' },
      { parameter: 'SGPT / ALT', value: '31', unit: 'U/L', normalRange: '7 - 56', flag: 'Normal' },
      { parameter: 'Alkaline Phosphatase (ALP)', value: '88', unit: 'U/L', normalRange: '44 - 147', flag: 'Normal' },
      { parameter: 'Total Serum Protein', value: '7.1', unit: 'g/dL', normalRange: '6.0 - 8.3', flag: 'Normal' },
      { parameter: 'Serum Albumin', value: '4.3', unit: 'g/dL', normalRange: '3.5 - 5.0', flag: 'Normal' },
    ],
  },
  'Kidney Function Test (KFT)': {
    category: 'Biochemistry',
    summary: 'Renal clearance and glomerular filtration parameters indicate normal renal function.',
    results: [
      { parameter: 'Serum Creatinine', value: '0.92', unit: 'mg/dL', normalRange: '0.70 - 1.30', flag: 'Normal' },
      { parameter: 'Blood Urea Nitrogen (BUN)', value: '13.8', unit: 'mg/dL', normalRange: '7.0 - 20.0', flag: 'Normal' },
      { parameter: 'Serum Uric Acid', value: '5.1', unit: 'mg/dL', normalRange: '3.5 - 7.2', flag: 'Normal' },
      { parameter: 'Serum Sodium (Na+)', value: '139', unit: 'mEq/L', normalRange: '135 - 145', flag: 'Normal' },
      { parameter: 'Serum Potassium (K+)', value: '4.3', unit: 'mEq/L', normalRange: '3.5 - 5.1', flag: 'Normal' },
    ],
  },
  'Dengue NS1 Antigen & Platelet': {
    category: 'Serology & Hematology',
    summary: 'Rapid immunochromatographic assay: Non-reactive for Dengue NS1 viral antigen.',
    results: [
      { parameter: 'Dengue NS1 Antigen (Rapid)', value: 'NEGATIVE', unit: '', normalRange: 'Negative / Non-Reactive', flag: 'Normal' },
      { parameter: 'Dengue IgM Antibody', value: 'NEGATIVE', unit: '', normalRange: 'Negative / Non-Reactive', flag: 'Normal' },
      { parameter: 'Dengue IgG Antibody', value: 'NEGATIVE', unit: '', normalRange: 'Negative / Non-Reactive', flag: 'Normal' },
      { parameter: 'Platelet Count', value: '2.15', unit: 'Lakhs /cu.mm', normalRange: '1.50 - 4.50', flag: 'Normal' },
    ],
  },
  'Urine Routine & Microscopic Examination': {
    category: 'Clinical Pathology',
    summary: 'Routine urinalysis: Clear, no pathological sediment or proteinuria detected.',
    results: [
      { parameter: 'Physical: Colour & Appearance', value: 'Pale Yellow, Clear', unit: '', normalRange: 'Pale Yellow, Clear', flag: 'Normal' },
      { parameter: 'Specific Gravity', value: '1.018', unit: '', normalRange: '1.005 - 1.030', flag: 'Normal' },
      { parameter: 'Reaction (pH)', value: '6.0', unit: '', normalRange: '4.8 - 7.5', flag: 'Normal' },
      { parameter: 'Chemical: Albumin / Protein', value: 'NIL', unit: '', normalRange: 'NIL', flag: 'Normal' },
      { parameter: 'Chemical: Glucose / Sugar', value: 'NIL', unit: '', normalRange: 'NIL', flag: 'Normal' },
      { parameter: 'Microscopic: Pus Cells (WBC)', value: '1-2', unit: '/HPF', normalRange: '0 - 5', flag: 'Normal' },
      { parameter: 'Microscopic: Red Blood Cells (RBC)', value: 'NIL', unit: '/HPF', normalRange: '0 - 2', flag: 'Normal' },
    ],
  },
};

// GET /api/doctor/lab-orders
const getDoctorLabOrders = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status && status !== 'All') {
    if (status === 'Completed') filter.status = 'completed';
    else if (status === 'Pending') filter.status = { $in: ['pending', 'sample_collected', 'processing'] };
  }

  const orders = await LabOrder.find(filter).sort('-createdAt').populate('patient', 'name email phone');
  res.json({ success: true, count: orders.length, data: orders });
});

// POST /api/doctor/lab-orders
const createLabOrder = asyncHandler(async (req, res) => {
  const {
    patientId,
    testName,
    category,
    urgency,
    facility,
    clinicalNotes,
    fastingRequired,
    status = 'pending',
  } = req.body;

  if (!patientId || !testName) {
    res.status(400);
    throw new Error('Patient and Test Name are required');
  }

  const patient = await User.findById(patientId);
  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }

  // Pre-load default template if matched
  const template = TEST_TEMPLATES[testName];
  const results = (status === 'completed' && template) ? template.results : [];
  const summary = (status === 'completed' && template) ? template.summary : '';

  const labOrder = await LabOrder.create({
    patient: patient._id,
    patientName: patient.name,
    patientDetails: `${patient.name} • Phone: ${patient.phone || 'N/A'}`,
    doctor: req.user._id,
    doctorName: req.user.name || 'Dr. Rajesh Sharma',
    facility: facility || 'CHC Sitapur Central Pathology Lab',
    testName,
    category: category || template?.category || 'General Pathology',
    urgency: urgency || 'routine',
    status: status || 'pending',
    fastingRequired: Boolean(fastingRequired),
    clinicalNotes: clinicalNotes || 'Routine diagnostic evaluation',
    results,
    summary,
    dateOrdered: new Date(),
    completedAt: status === 'completed' ? new Date() : null,
  });

  // Emit real-time notification to patient & doctor channels
  const io = req.app.get('io');
  if (io) {
    io.emit('lab:new_order', labOrder);
    io.to(patient._id.toString()).emit('lab:assigned', labOrder);
  }

  res.status(201).json({
    success: true,
    message: 'Diagnostic Lab Test assigned successfully!',
    data: labOrder,
  });
});

// PUT /api/doctor/lab-orders/:id
const updateLabOrderStatus = asyncHandler(async (req, res) => {
  const { status, clinicalNotes, summary, results } = req.body;
  const order = await LabOrder.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Lab Order not found');
  }

  if (status) order.status = status;
  if (clinicalNotes !== undefined) order.clinicalNotes = clinicalNotes;
  if (summary !== undefined) order.summary = summary;

  if (status === 'completed') {
    order.completedAt = new Date();
    if (!order.results || order.results.length === 0) {
      const template = TEST_TEMPLATES[order.testName] || TEST_TEMPLATES['Complete Blood Count (CBC)'];
      order.results = template.results;
      if (!order.summary) order.summary = template.summary;
    }
  }

  if (results && Array.isArray(results)) {
    order.results = results;
  }

  await order.save();

  const io = req.app.get('io');
  if (io) {
    io.emit('lab:status_updated', order);
  }

  res.json({ success: true, message: 'Lab order updated successfully', data: order });
});

// GET /api/patient/lab-reports
const getPatientLabReports = asyncHandler(async (req, res) => {
  // Find orders for this logged-in patient
  // Also if the patient is a test user, find records linked to their email or ID
  const testPatientEmails = ['patient@test.com', 'patient@gmail.com', 'kunalsuryawanshi2008@gmail.com', 'suryawanshiaditya915@gmail.com'];
  
  let patientIds = [req.user._id];
  if (testPatientEmails.includes(req.user.email)) {
    const relatedUsers = await User.find({ email: { $in: testPatientEmails } }).select('_id');
    patientIds = relatedUsers.map(u => u._id);
  }

  const reports = await LabOrder.find({
    patient: { $in: patientIds },
  }).sort('-dateOrdered');

  res.json({
    success: true,
    count: reports.length,
    data: reports,
  });
});

// GET /api/doctor/patients-list
const getPatientsList = asyncHandler(async (req, res) => {
  const patients = await User.find({ role: 'patient' }).select('_id name email phone').sort('name');
  res.json({ success: true, data: patients });
});

module.exports = {
  TEST_TEMPLATES,
  getDoctorLabOrders,
  createLabOrder,
  updateLabOrderStatus,
  getPatientLabReports,
  getPatientsList,
};
