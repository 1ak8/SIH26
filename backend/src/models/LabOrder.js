const mongoose = require('mongoose');

const labOrderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  patientName: {
    type: String,
    required: true,
  },
  patientDetails: {
    type: String,
    default: 'Citizen Patient',
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  doctorName: {
    type: String,
    required: true,
  },
  facility: {
    type: String,
    default: 'CHC Sitapur Central Pathology Lab',
  },
  testName: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    default: 'General Pathology',
  },
  urgency: {
    type: String,
    enum: ['routine', 'urgent', 'stat'],
    default: 'routine',
  },
  status: {
    type: String,
    enum: ['pending', 'sample_collected', 'processing', 'completed'],
    default: 'pending',
  },
  fastingRequired: {
    type: Boolean,
    default: false,
  },
  clinicalNotes: {
    type: String,
    default: '',
  },
  dateOrdered: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
  results: [
    {
      parameter: { type: String, required: true },
      value: { type: String, required: true },
      unit: { type: String, default: '' },
      normalRange: { type: String, default: '' },
      flag: { type: String, enum: ['Normal', 'High', 'Low', 'Abnormal'], default: 'Normal' },
    },
  ],
  summary: {
    type: String,
    default: '',
  },
  verifiedBy: {
    type: String,
    default: 'Dr. Anjali Seth (MD Pathology, Reg: NABL-84920)',
  },
}, { timestamps: true });

labOrderSchema.pre('save', function (next) {
  if (!this.orderId) {
    this.orderId = 'LAB-' + Math.floor(1000 + Math.random() * 9000);
  }
  next();
});

module.exports = mongoose.model('LabOrder', labOrderSchema);
