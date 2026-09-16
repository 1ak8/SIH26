const mongoose = require('mongoose');

const ashaTaskSchema = new mongoose.Schema({
  taskId: {
    type: String,
    unique: true,
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignedByName: {
    type: String,
    default: 'Community Health Officer (CHO)',
  },
  ashaWorker: {
    name: { type: String, required: true },
    phone: { type: String, default: '9876543230' },
    ward: { type: String, default: 'Sitapur Ward 4' },
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  patientName: {
    type: String,
    required: true,
  },
  patientPhone: {
    type: String,
    default: '',
  },
  patientAddress: {
    type: String,
    default: '',
  },
  taskType: {
    type: String,
    enum: [
      'Home Visit & Vitals',
      'Antenatal Checkup (ANC)',
      'Infant Immunization Reminders',
      'Jan Aushadhi Medicine Refill',
      'Chronic NCD Follow-up',
      'Fever & Vector Surveillance',
    ],
    default: 'Home Visit & Vitals',
  },
  priority: {
    type: String,
    enum: ['routine', 'high', 'urgent'],
    default: 'routine',
  },
  scheduledDate: {
    type: String,
    default: 'Today',
  },
  scheduledTime: {
    type: String,
    default: 'Morning (10:00 AM)',
  },
  instructions: {
    type: String,
    default: 'Conduct routine checkup and record vitals using portable kit.',
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending',
  },
  outcomeNotes: {
    type: String,
    default: '',
  },
  completedAt: {
    type: Date,
  },
}, { timestamps: true });

ashaTaskSchema.pre('save', function (next) {
  if (!this.taskId) {
    this.taskId = 'TASK-' + Math.floor(100 + Math.random() * 900);
  }
  next();
});

module.exports = mongoose.model('AshaTask', ashaTaskSchema);
