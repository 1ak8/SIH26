const mongoose = require('mongoose');

const immunizationSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vaccineName: { type: String, required: true },
  vaccineCode: { type: String },
  doseNumber: { type: Number, default: 1 },
  dateAdministered: { type: Date },
  nextDueDate: { type: Date },
  facility: { type: String, default: 'Anganwadi Centre 3' },
  administeredBy: { type: String },
  batchNumber: { type: String },
  status: { type: String, default: 'scheduled' },
  sideEffects: { type: String },
  certificateId: { type: String },
  category: { type: String, default: 'child' },
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Immunization', immunizationSchema);
