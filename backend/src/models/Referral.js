const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referredTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fromFacility: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility' },
  toFacility: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility' },
  specialty: { type: String },
  reason: { type: String, required: [true, 'Referral reason required'] },
  priority: { type: String, enum: ['low', 'medium', 'high', 'emergency'], default: 'medium' },
  status: { type: String, enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'], default: 'pending' },
  notes: { type: String },
  completedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Referral', referralSchema);
