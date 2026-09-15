const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('./models/User');
const PatientProfile = require('./models/PatientProfile');
const Facility = require('./models/Facility');
const Appointment = require('./models/Appointment');
const Prescription = require('./models/Prescription');
const Referral = require('./models/Referral');
const TriageData = require('./models/TriageData');
const VisitRequest = require('./models/VisitRequest');

async function seed() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sehatsaarthi';
  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri, { family: 4 });
  console.log('Connected to MongoDB successfully!');

  // Read demoData.json
  const rawData = fs.readFileSync(path.join(__dirname, 'demoData.json'), 'utf8');
  const demoData = JSON.parse(rawData);

  // Clear existing collections
  console.log('Clearing existing collections...');
  await Promise.all([
    User.deleteMany({}),
    PatientProfile.deleteMany({}),
    Facility.deleteMany({}),
    Appointment.deleteMany({}),
    Prescription.deleteMany({}),
    Referral.deleteMany({}),
    TriageData.deleteMany({}),
    VisitRequest.deleteMany({}),
  ]);
  console.log('Cleared existing data.');

  // 1. Insert Facilities
  const facilityMap = {};
  for (const fac of demoData.facilities) {
    const created = await Facility.create({
      name: fac.name,
      type: fac.type,
      address: fac.address,
      location: {
        type: 'Point',
        coordinates: [80.6779 + Math.random() * 0.05, 27.5684 + Math.random() * 0.05],
      },
      contactPhone: fac.contactPhone,
      capacity: fac.capacity || { beds: 20, opdRooms: 4, icuBeds: 2 },
      services: fac.services || [],
      medicineInventory: fac.medicineInventory || [],
      diagnosticServices: fac.diagnosticServices || [],
      isActive: true,
    });
    facilityMap[fac.key] = created._id;
  }
  console.log(`Created ${Object.keys(facilityMap).length} facilities.`);

  // 2. Default password for all users
  const defaultPassword = '123456';

  // 3. Insert Users
  const userMap = {};

  // Insert Doctors
  for (const doc of demoData.users.doctors) {
    const created = await User.create({
      name: doc.name,
      email: doc.email.toLowerCase(),
      password: defaultPassword,
      phone: doc.phone,
      role: 'doctor',
      gender: doc.gender,
      specialization: doc.specialization,
      registrationNumber: doc.registrationNumber,
      facility: facilityMap[doc.facilityKey] || null,
      isActive: true,
    });
    userMap[doc.key] = created._id;
  }

  // Insert Health Workers
  for (const hw of demoData.users.health_workers) {
    const created = await User.create({
      name: hw.name,
      email: hw.email.toLowerCase(),
      password: defaultPassword,
      phone: hw.phone,
      role: 'health_worker',
      gender: hw.gender,
      facility: facilityMap[hw.facilityKey] || null,
      address: hw.address,
      isActive: true,
    });
    userMap[hw.key] = created._id;
  }

  // Insert Admin
  const adminDoc = demoData.users.admin;
  const createdAdmin = await User.create({
    name: adminDoc.name,
    email: adminDoc.email.toLowerCase(),
    password: defaultPassword,
    phone: adminDoc.phone,
    role: 'admin',
    gender: adminDoc.gender,
    facility: facilityMap[adminDoc.facilityKey] || null,
    isActive: true,
  });
  userMap[adminDoc.key] = createdAdmin._id;

  // Insert Patients and their PatientProfiles
  for (const pat of demoData.users.patients) {
    const created = await User.create({
      name: pat.name,
      email: pat.email.toLowerCase(),
      password: defaultPassword,
      phone: pat.phone,
      role: 'patient',
      gender: pat.gender,
      dateOfBirth: pat.dateOfBirth ? new Date(pat.dateOfBirth) : new Date('1995-01-01'),
      abhaId: pat.abhaId,
      address: pat.address,
      isActive: true,
    });
    userMap[pat.key] = created._id;

    // Create PatientProfile
    const prof = pat.profile || {};
    await PatientProfile.create({
      user: created._id,
      abhaId: pat.abhaId,
      ayushmanCardNumber: prof.ayushmanCardNumber || `PMJAY-UP-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      ayushmanEligible: prof.ayushmanEligible !== false,
      bloodGroup: prof.bloodGroup || 'B+',
      allergies: prof.allergies || [],
      chronicConditions: prof.chronicConditions || [],
      vitals: prof.vitals || { systolicBP: 120, diastolicBP: 80, heartRate: 72, spO2: 98, temperature: 98.6, lastUpdated: new Date() },
      maternalHealth: prof.maternalHealth || undefined,
      linkedFacilities: [facilityMap['chc_sitapur'], facilityMap['sc_ward4']].filter(Boolean),
    });
  }

  // Insert Extra Accounts (@gmail.com aliases & personal accounts so login NEVER fails)
  const extraUsers = [
    { name: 'Patient Test', email: 'patient@gmail.com', phone: '9876543291', role: 'patient', gender: 'male', abhaId: '91-4820-1940-2810' },
    { name: 'Dr. Rajesh Sharma', email: 'doctor@gmail.com', phone: '9876543290', role: 'doctor', gender: 'male', specialization: 'General Medicine' },
    { name: 'Sunita Devi', email: 'asha@gmail.com', phone: '9876543292', role: 'health_worker', gender: 'female' },
    { name: 'Dr. Manoj Kumar Singh', email: 'admin@gmail.com', phone: '9876543293', role: 'admin', gender: 'male' },
    { name: 'Kunal Suryawanshi', email: 'kunalsuryawanshi2008@gmail.com', phone: '8839624792', role: 'patient', gender: 'male' },
    { name: 'Aditya Suryawanshi', email: 'adityasuryawanshi470@gmail.com', phone: '9343216496', role: 'doctor', gender: 'male' },
    { name: 'Aditya Suryawanshi', email: 'suryawanshiaditya915@gmail.com', phone: '9343216497', role: 'patient', gender: 'male' },
  ];
  for (const eu of extraUsers) {
    const created = await User.create({
      name: eu.name,
      email: eu.email.toLowerCase(),
      password: defaultPassword,
      phone: eu.phone,
      role: eu.role,
      gender: eu.gender,
      specialization: eu.specialization,
      abhaId: eu.abhaId,
      isActive: true,
    });
    if (eu.role === 'patient') {
      await PatientProfile.create({
        user: created._id,
        abhaId: eu.abhaId || '91-4820-1940-2810',
        ayushmanCardNumber: 'PMJAY-UP-9842-1049',
        ayushmanEligible: true,
        bloodGroup: 'B+',
        vitals: { systolicBP: 120, diastolicBP: 80, heartRate: 74, spO2: 98, temperature: 98.6 },
      });
    }
  }
  console.log(`Created ${Object.keys(userMap).length + extraUsers.length} total users with linked profiles.`);

  // 4. Insert Appointments
  const appointmentMap = {};
  for (let i = 0; i < demoData.appointments.length; i++) {
    const app = demoData.appointments[i];
    const appDate = new Date();
    appDate.setDate(appDate.getDate() + (app.dateOffsetDays || 0));
    appDate.setHours(10, 0, 0, 0);

    const created = await Appointment.create({
      patient: userMap[app.patientKey],
      doctor: userMap[app.doctorKey],
      facility: facilityMap[app.facilityKey] || facilityMap['chc_sitapur'],
      date: appDate,
      timeSlot: app.timeSlot,
      tokenNumber: app.tokenNumber || (i + 1),
      type: app.type || 'teleconsultation',
      status: app.status || 'scheduled',
      reason: app.reason,
      notes: app.notes || '',
      bookedBy: userMap[app.patientKey],
    });
    appointmentMap[i] = created._id;
  }
  console.log(`Created ${demoData.appointments.length} appointments.`);

  // 5. Insert Prescriptions
  for (const rx of demoData.prescriptions) {
    await Prescription.create({
      patient: userMap[rx.patientKey],
      doctor: userMap[rx.doctorKey],
      prescriptionId: rx.prescriptionId,
      diagnosis: rx.diagnosis,
      icdCode: rx.icdCode,
      clinicalNotes: rx.clinicalNotes,
      medicines: rx.medicines || [],
      labTests: rx.labTests || [],
      isDigitallySigned: rx.isDigitallySigned !== false,
      status: rx.status || 'active',
      followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      followUpInstructions: 'Return for review if symptoms persist after course completion.',
    });
  }
  console.log(`Created ${demoData.prescriptions.length} prescriptions.`);

  // 6. Insert Triage Data
  for (const tr of demoData.triageData) {
    await TriageData.create({
      patient: userMap[tr.patientKey],
      assessedBy: userMap[tr.assessedByKey] || userMap['asha_sunita'],
      riskLevel: tr.riskLevel || 'low',
      tags: tr.tags || [],
      symptoms: tr.symptoms || [],
      vitals: tr.vitals || {},
      notes: tr.notes || '',
      requiresReferral: !!tr.requiresReferral,
      requiresAmbulance: !!tr.requiresAmbulance,
      followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    });
  }
  console.log(`Created ${demoData.triageData.length} triage records.`);

  // 7. Insert Referrals
  for (const ref of demoData.referrals) {
    await Referral.create({
      patient: userMap[ref.patientKey],
      referredBy: userMap[ref.referredByKey],
      referredTo: userMap[ref.referredToKey],
      fromFacility: facilityMap[ref.fromFacilityKey],
      toFacility: facilityMap[ref.toFacilityKey],
      specialty: ref.specialty,
      reason: ref.reason,
      priority: ref.priority || 'medium',
      status: ref.status || 'pending',
      notes: ref.notes || '',
    });
  }
  console.log(`Created ${demoData.referrals.length} referrals.`);

  // 8. Insert Visit Requests
  for (const vr of demoData.visitRequests) {
    await VisitRequest.create({
      patient: userMap[vr.patientKey],
      patientName: vr.patientName,
      patientPhone: vr.patientPhone,
      patientAddress: vr.patientAddress,
      ashaWorker: userMap['asha_sunita'],
      ashaName: vr.ashaName || 'Sunita Devi',
      reason: vr.reason,
      urgency: vr.urgency || 'routine',
      preferredSlot: vr.preferredSlot,
      notes: vr.notes || '',
      status: vr.status || 'pending',
      scheduledTime: vr.scheduledTime || '',
      actionNotes: vr.actionNotes || '',
      requestId: vr.requestId,
    });
  }
  console.log(`Created ${demoData.visitRequests.length} visit requests.`);

  console.log('\n========================================');
  console.log('✅ ALL DEMO DATA SUCCESSFULLY CONNECTED!');
  console.log('========================================');
  console.log('Test Logins (Password: 123456 for all):');
  console.log('- Patient:      patient@test.com');
  console.log('- Doctor:       doctor@test.com');
  console.log('- ASHA Worker:  asha@test.com');
  console.log('- Admin:        admin@test.com');
  console.log('========================================\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed Error:', err);
  process.exit(1);
});
