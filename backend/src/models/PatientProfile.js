const mongoose = require('mongoose');

const patientProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  abhaId: { type: String, trim: true },
  ayushmanCardNumber: { type: String },
  ayushmanEligible: { type: Boolean, default: false },
  bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''] },
  allergies: [{ name: String, severity: { type: String, enum: ['mild', 'moderate', 'severe'] } }],
  chronicConditions: [{ condition: String, diagnosedDate: Date, status: { type: String, enum: ['active', 'managed', 'resolved'] } }],
  medicalHistory: [{ description: String, date: Date, facility: String }],
  currentMedications: [{ name: String, dosage: String, frequency: String, startDate: Date, endDate: Date }],
  vitals: {
    heartRate: Number, systolicBP: Number, diastolicBP: Number,
    spO2: Number, temperature: Number, bloodSugar: Number,
    weight: Number, height: Number, lastUpdated: Date,
  },
  maternalHealth: {
    isPregnant: Boolean, weeksPregnant: Number, expectedDelivery: Date,
    gravida: Number, para: Number, lastMenstrualPeriod: Date,
  },
  emergencyContact: { name: String, phone: String, relation: String },
  linkedFacilities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Facility' }],
}, { timestamps: true });

module.exports = mongoose.model('PatientProfile', patientProfileSchema);
