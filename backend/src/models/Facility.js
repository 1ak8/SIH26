const mongoose = require('mongoose');

const facilitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['PHC', 'CHC', 'sub_centre', 'district_hospital', 'tertiary'], required: true },
  address: { line1: String, city: String, district: String, state: String, pincode: String },
  location: { type: { type: String, default: 'Point' }, coordinates: [Number] },
  contactPhone: String,
  services: [String],
  doctors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  healthWorkers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  medicineInventory: [{
    name: String, quantity: Number, unit: String,
    status: { type: String, enum: ['in_stock', 'low_stock', 'out_of_stock'], default: 'in_stock' },
  }],
  diagnosticServices: [{
    testName: String, available: { type: Boolean, default: true },
    equipmentStatus: { type: String, enum: ['operational', 'maintenance', 'non_functional'], default: 'operational' },
  }],
  capacity: { beds: Number, opdRooms: Number, icuBeds: Number },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

facilitySchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Facility', facilitySchema);
