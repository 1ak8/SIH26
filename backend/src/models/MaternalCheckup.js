const mongoose = require('mongoose');

const maternalCheckupSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  visitType: { type: String, default: 'ANC-1' },
  visitNumber: { type: Number, default: 1 },
  dateOfVisit: { type: Date, required: true },
  weeksPregnant: { type: Number },
  vitals: {
    bloodPressure: { type: String },
    weight: { type: Number },
    hemoglobin: { type: Number },
    bloodSugar: { type: Number },
    fundalHeight: { type: Number },
    fetalHeartRate: { type: Number },
  },
  facility: { type: String, default: 'CHC Sitapur Central' },
  doctorName: { type: String },
  riskLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
  supplements: [{ name: String, dosage: String }],
  testsOrdered: [String],
  diagnosis: String,
  nextVisitDate: Date,
  status: { type: String, enum: ['completed', 'scheduled', 'overdue'], default: 'scheduled' },
  notes: String,
}, { timestamps: true });

module.exports = mongoose.model('MaternalCheckup', maternalCheckupSchema);
