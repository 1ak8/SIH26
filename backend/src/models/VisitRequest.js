const mongoose = require('mongoose');

const visitRequestSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  patientName: { type: String, required: true },
  patientPhone: { type: String, required: true },
  patientAddress: { type: String, default: 'Sitapur Ward 4' },
  ashaWorker: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ashaName: { type: String, default: 'Sunita Devi' },
  reason: { type: String, required: true },
  urgency: { type: String, enum: ['routine', 'urgent', 'emergency'], default: 'routine' },
  preferredSlot: { type: String, default: 'Morning (9 AM - 12 PM)' },
  notes: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'scheduled', 'in_progress', 'completed', 'cancelled'], default: 'pending' },
  scheduledTime: { type: String, default: '' },
  actionNotes: { type: String, default: '' },
  requestId: { type: String },
}, { timestamps: true });

visitRequestSchema.pre('save', function (next) {
  if (!this.requestId) {
    this.requestId = 'VISIT-' + Math.floor(1000 + Math.random() * 9000);
  }
  next();
});

module.exports = mongoose.model('VisitRequest', visitRequestSchema);
