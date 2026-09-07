const mongoose = require('mongoose');

const triageSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assessedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vitals: {
    systolicBP: Number, diastolicBP: Number, heartRate: Number,
    spO2: Number, temperature: Number, bloodSugar: Number,
    hemoglobin: Number, weight: Number, muac: Number,
  },
  symptoms: [{ type: String }],
  riskLevel: { type: String, enum: ['low', 'medium', 'high', 'emergency'], required: true },
  tags: [{ type: String }],
  notes: { type: String },
  requiresReferral: { type: Boolean, default: false },
  requiresAmbulance: { type: Boolean, default: false },
  followUpDate: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('TriageData', triageSchema);
