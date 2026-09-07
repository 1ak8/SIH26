const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  facility: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility' },
  date: { type: Date, required: [true, 'Appointment date required'] },
  timeSlot: { type: String, required: [true, 'Time slot required'] },
  tokenNumber: { type: Number },
  type: { type: String, enum: ['in_person', 'teleconsultation'], default: 'in_person' },
  status: { type: String, enum: ['scheduled', 'in_queue', 'in_consultation', 'completed', 'cancelled', 'no_show'], default: 'scheduled' },
  reason: { type: String },
  notes: { type: String },
  sessionPasscode: { type: String },
  queuePosition: { type: Number },
  bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

appointmentSchema.pre('save', function (next) {
  if (!this.tokenNumber) {
    this.tokenNumber = Math.floor(Math.random() * 9000) + 1000;
  }
  if (this.type === 'teleconsultation' && !this.sessionPasscode) {
    this.sessionPasscode = 'MED-' + Math.floor(Math.random() * 9000 + 1000);
  }
  next();
});

module.exports = mongoose.model('Appointment', appointmentSchema);
