const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true },
  email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, match: [/^\S+@\S+\.\S+$/, 'Invalid email'] },
  password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
  phone: { type: String, required: [true, 'Phone is required'], match: [/^[6-9]\d{9}$/, 'Invalid Indian mobile'] },
  role: { type: String, enum: ['patient', 'health_worker', 'doctor', 'admin'], default: 'patient', required: true },
  abhaId: { type: String, sparse: true, trim: true },
  profileImage: { type: String, default: '' },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  dateOfBirth: { type: Date },
  address: {
    line1: String, city: String, district: String, state: String, pincode: String,
  },
  facility: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility' },
  specialization: { type: String },
  registrationNumber: { type: String },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  resetPasswordOtp: { type: String },
  resetPasswordExpires: { type: Date },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 6);
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', userSchema);
