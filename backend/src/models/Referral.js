const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  referralId: { type: String, unique: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referredTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fromFacility: { type: String, default: 'PHC Sitapur' },
  toFacility: { type: String, required: true },
  specialty: { type: String, default: 'General Medicine' },
  reason: { type: String, required: [true, 'Referral reason required'] },
  clinicalSummary: { type: String, default: '' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'emergency'], default: 'medium' },
  status: { type: String, enum: ['pending', 'accepted', 'in_transit', 'in_consultation', 'completed', 'rejected', 'cancelled'], default: 'pending' },
  statusHistory: [{
    status: String,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    note: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
  }],
  transportMode: { type: String, enum: ['ambulance', 'self', 'asha_escort', 'emergency'], default: 'self' },
  estimatedArrival: { type: String, default: '' },
  rejectionReason: { type: String, default: '' },
  completedAt: { type: Date },
  lastUpdated: { type: Date, default: Date.now },
}, { timestamps: true });

referralSchema.pre('save', function (next) {
  if (!this.referralId) {
    this.referralId = `REF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
  }
  this.lastUpdated = new Date();
  next();
});

module.exports = mongoose.model('Referral', referralSchema);
