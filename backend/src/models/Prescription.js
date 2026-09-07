const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  prescriptionId: { type: String, unique: true },
  diagnosis: { type: String, required: [true, 'Diagnosis required'] },
  icdCode: { type: String },
  clinicalNotes: { type: String },
  medicines: [{
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, required: true },
    duration: { type: String, required: true },
    instructions: { type: String },
    isGeneric: { type: Boolean, default: true },
  }],
  labTests: [{
    testName: String, urgency: { type: String, enum: ['routine', 'urgent'], default: 'routine' },
    status: { type: String, enum: ['ordered', 'sample_collected', 'processing', 'completed'], default: 'ordered' },
    result: String, reportUrl: String,
  }],
  followUpDate: { type: Date },
  followUpInstructions: { type: String },
  isDigitallySigned: { type: Boolean, default: false },
  status: { type: String, enum: ['draft', 'active', 'dispensed', 'expired'], default: 'active' },
}, { timestamps: true });

prescriptionSchema.pre('save', function (next) {
  if (!this.prescriptionId) {
    this.prescriptionId = 'AAR-' + Math.floor(Math.random() * 9000 + 1000);
  }
  next();
});

module.exports = mongoose.model('Prescription', prescriptionSchema);
