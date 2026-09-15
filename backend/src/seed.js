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
const Immunization = require('./models/Immunization');
const MaternalCheckup = require('./models/MaternalCheckup');

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
    Immunization.deleteMany({}),
    MaternalCheckup.deleteMany({}),
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
      maternalHealth: (pat.key === 'pat_test' || pat.key === 'pat_kamla') ? {
        isPregnant: true,
        weeksPregnant: 34,
        gravida: 2,
        para: 1,
        expectedDelivery: new Date('2026-10-28'),
        lastMenstrualPeriod: new Date('2026-01-20'),
      } : (prof.maternalHealth || undefined),
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

  // 9. Insert Immunization Records
  const immunizations = [
    { patientKey: 'pat_test', vaccineName: 'BCG (Bacillus Calmette-Guerin)', vaccineCode: 'BCG', doseNumber: 1, dateAdministered: new Date('2024-01-15'), facility: 'CHC Sitapur Central', administeredBy: 'Dr. Ananya Gupta', batchNumber: 'BCG-2024-001', status: 'completed', category: 'child', certificateId: 'VAX-100001' },
    { patientKey: 'pat_test', vaccineName: 'OPV (Oral Polio Vaccine)', vaccineCode: 'OPV-0', doseNumber: 0, dateAdministered: new Date('2024-01-15'), facility: 'CHC Sitapur Central', administeredBy: 'Dr. Ananya Gupta', batchNumber: 'OPV-2024-003', status: 'completed', category: 'child', certificateId: 'VAX-100002' },
    { patientKey: 'pat_test', vaccineName: 'Hepatitis B (HepB-0)', vaccineCode: 'HEPB-0', doseNumber: 0, dateAdministered: new Date('2024-01-15'), facility: 'CHC Sitapur Central', administeredBy: 'Dr. Ananya Gupta', batchNumber: 'HEPB-2024-005', status: 'completed', category: 'child', certificateId: 'VAX-100003' },
    { patientKey: 'pat_test', vaccineName: 'OPV (Oral Polio Vaccine)', vaccineCode: 'OPV-1', doseNumber: 1, dateAdministered: new Date('2024-03-15'), facility: 'Anganwadi Centre 3', administeredBy: 'ASHA Worker Sunita Devi', batchNumber: 'OPV-2024-008', status: 'completed', category: 'child', certificateId: 'VAX-100004' },
    { patientKey: 'pat_test', vaccineName: 'Pentavalent Vaccine (DPT-HepB-Hib)', vaccineCode: 'Penta-1', doseNumber: 1, dateAdministered: new Date('2024-03-15'), facility: 'Anganwadi Centre 3', administeredBy: 'ASHA Worker Sunita Devi', batchNumber: 'PENTA-2024-012', status: 'completed', category: 'child', certificateId: 'VAX-100005' },
    { patientKey: 'pat_test', vaccineName: 'Rotavirus Vaccine', vaccineCode: 'RVV-1', doseNumber: 1, dateAdministered: new Date('2024-03-15'), facility: 'Anganwadi Centre 3', administeredBy: 'ASHA Worker Sunita Devi', batchNumber: 'RVV-2024-007', status: 'completed', category: 'child', certificateId: 'VAX-100006' },
    { patientKey: 'pat_test', vaccineName: 'PCV (Pneumococcal Conjugate)', vaccineCode: 'PCV-1', doseNumber: 1, dateAdministered: new Date('2024-03-15'), facility: 'Anganwadi Centre 3', administeredBy: 'ASHA Worker Sunita Devi', batchNumber: 'PCV-2024-011', status: 'completed', category: 'child', certificateId: 'VAX-100007' },
    { patientKey: 'pat_test', vaccineName: 'OPV (Oral Polio Vaccine)', vaccineCode: 'OPV-2', doseNumber: 2, dateAdministered: new Date('2024-05-15'), facility: 'Anganwadi Centre 3', administeredBy: 'ASHA Worker Sunita Devi', batchNumber: 'OPV-2024-015', status: 'completed', category: 'child', certificateId: 'VAX-100008' },
    { patientKey: 'pat_test', vaccineName: 'Pentavalent Vaccine (DPT-HepB-Hib)', vaccineCode: 'Penta-2', doseNumber: 2, dateAdministered: new Date('2024-05-15'), facility: 'Anganwadi Centre 3', administeredBy: 'ASHA Worker Sunita Devi', batchNumber: 'PENTA-2024-019', status: 'completed', category: 'child', certificateId: 'VAX-100009' },
    { patientKey: 'pat_test', vaccineName: 'Rotavirus Vaccine', vaccineCode: 'RVV-2', doseNumber: 2, dateAdministered: new Date('2024-05-15'), facility: 'Anganwadi Centre 3', administeredBy: 'ASHA Worker Sunita Devi', batchNumber: 'RVV-2024-014', status: 'completed', category: 'child', certificateId: 'VAX-100010' },
    { patientKey: 'pat_test', vaccineName: 'PCV (Pneumococcal Conjugate)', vaccineCode: 'PCV-2', doseNumber: 2, dateAdministered: new Date('2024-05-15'), facility: 'Anganwadi Centre 3', administeredBy: 'ASHA Worker Sunita Devi', batchNumber: 'PCV-2024-018', status: 'completed', category: 'child', certificateId: 'VAX-100011' },
    { patientKey: 'pat_test', vaccineName: 'IPV (Inactivated Polio Vaccine)', vaccineCode: 'IPV-1', doseNumber: 1, dateAdministered: new Date('2024-07-15'), facility: 'CHC Sitapur Central', administeredBy: 'Dr. Rajesh Sharma', batchNumber: 'IPV-2024-022', status: 'completed', category: 'child', certificateId: 'VAX-100012' },
    { patientKey: 'pat_test', vaccineName: 'OPV (Oral Polio Vaccine)', vaccineCode: 'OPV-3', doseNumber: 3, dateAdministered: new Date('2024-07-15'), facility: 'Anganwadi Centre 3', administeredBy: 'ASHA Worker Sunita Devi', batchNumber: 'OPV-2024-025', status: 'completed', category: 'child', certificateId: 'VAX-100013' },
    { patientKey: 'pat_test', vaccineName: 'Pentavalent Vaccine (DPT-HepB-Hib)', vaccineCode: 'Penta-3', doseNumber: 3, dateAdministered: new Date('2024-07-15'), facility: 'Anganwadi Centre 3', administeredBy: 'ASHA Worker Sunita Devi', batchNumber: 'PENTA-2024-028', status: 'completed', category: 'child', certificateId: 'VAX-100014' },
    { patientKey: 'pat_test', vaccineName: 'Rotavirus Vaccine', vaccineCode: 'RVV-3', doseNumber: 3, dateAdministered: new Date('2024-07-15'), facility: 'Anganwadi Centre 3', administeredBy: 'ASHA Worker Sunita Devi', batchNumber: 'RVV-2024-021', status: 'completed', category: 'child', certificateId: 'VAX-100015' },
    { patientKey: 'pat_test', vaccineName: 'PCV Booster Dose', vaccineCode: 'PCV-B', doseNumber: 3, dateAdministered: new Date('2024-10-10'), facility: 'CHC Sitapur Central', administeredBy: 'Dr. Ananya Gupta', batchNumber: 'PCV-2024-033', status: 'completed', category: 'child', certificateId: 'VAX-100016' },
    { patientKey: 'pat_test', vaccineName: 'fIPV (Fractional IPV Dose 2)', vaccineCode: 'FIPV-2', doseNumber: 2, dateAdministered: new Date('2024-10-10'), facility: 'Anganwadi Centre 3', administeredBy: 'ASHA Worker Sunita Devi', batchNumber: 'IPV-2024-035', status: 'completed', category: 'child', certificateId: 'VAX-100017' },
    { patientKey: 'pat_test', vaccineName: 'Measles-Rubella (MR-1)', vaccineCode: 'MR-1', doseNumber: 1, dateAdministered: new Date('2024-10-15'), facility: 'Anganwadi Centre 3', administeredBy: 'ASHA Worker Sunita Devi', batchNumber: 'MR-2024-010', status: 'completed', category: 'child', certificateId: 'VAX-100018' },
    { patientKey: 'pat_test', vaccineName: 'Vitamin A (1st Dose - 1 Lakh IU)', vaccineCode: 'VITA-1', doseNumber: 1, dateAdministered: new Date('2024-10-15'), facility: 'Anganwadi Centre 3', administeredBy: 'ASHA Worker Sunita Devi', batchNumber: 'VITA-2024-004', status: 'completed', category: 'child', certificateId: 'VAX-100019' },
    { patientKey: 'pat_test', vaccineName: 'Japanese Encephalitis (JE-1)', vaccineCode: 'JE-1', doseNumber: 1, dateAdministered: new Date('2024-11-20'), facility: 'CHC Sitapur Central', administeredBy: 'Dr. Rajesh Sharma', batchNumber: 'JE-2024-002', status: 'completed', category: 'child', certificateId: 'VAX-100020' },
    { patientKey: 'pat_test', vaccineName: 'Vitamin A (2nd Dose - 2 Lakh IU)', vaccineCode: 'VITA-2', doseNumber: 2, dateAdministered: new Date('2025-04-15'), facility: 'Anganwadi Centre 3', administeredBy: 'ASHA Worker Sunita Devi', batchNumber: 'VITA-2025-001', status: 'completed', category: 'child', certificateId: 'VAX-100021' },
    { patientKey: 'pat_test', vaccineName: 'Measles-Rubella (MR-2)', vaccineCode: 'MR-2', doseNumber: 2, dateAdministered: new Date('2025-07-10'), facility: 'Anganwadi Centre 3', administeredBy: 'ASHA Worker Sunita Devi', batchNumber: 'MR-2025-006', status: 'completed', category: 'child', certificateId: 'VAX-100022' },
    { patientKey: 'pat_test', vaccineName: 'DPT Booster-1', vaccineCode: 'DPT-B1', doseNumber: 3, dateAdministered: new Date('2025-07-10'), facility: 'Anganwadi Centre 3', administeredBy: 'ASHA Worker Sunita Devi', batchNumber: 'DPT-2025-008', status: 'completed', category: 'child', certificateId: 'VAX-100023' },
    { patientKey: 'pat_test', vaccineName: 'OPV Booster Dose', vaccineCode: 'OPV-B', doseNumber: 3, dateAdministered: new Date('2025-07-10'), facility: 'Anganwadi Centre 3', administeredBy: 'ASHA Worker Sunita Devi', batchNumber: 'OPV-2025-012', status: 'completed', category: 'child', certificateId: 'VAX-100024' },
    { patientKey: 'pat_test', vaccineName: 'Japanese Encephalitis (JE-2)', vaccineCode: 'JE-2', doseNumber: 2, dateAdministered: new Date('2025-08-15'), facility: 'CHC Sitapur Central', administeredBy: 'Dr. Rajesh Sharma', batchNumber: 'JE-2025-005', status: 'completed', category: 'child', certificateId: 'VAX-100025' },
    { patientKey: 'pat_test', vaccineName: 'Vitamin A (3rd Dose - 2 Lakh IU)', vaccineCode: 'VITA-3', doseNumber: 3, dateAdministered: new Date('2025-10-15'), facility: 'Anganwadi Centre 3', administeredBy: 'ASHA Worker Sunita Devi', batchNumber: 'VITA-2025-009', status: 'completed', category: 'child', certificateId: 'VAX-100026' },
    { patientKey: 'pat_test', vaccineName: 'Vitamin A (4th Dose - 2 Lakh IU)', vaccineCode: 'VITA-4', doseNumber: 4, dateAdministered: new Date('2026-04-15'), facility: 'Anganwadi Centre 3', administeredBy: 'ASHA Worker Sunita Devi', batchNumber: 'VITA-2026-003', status: 'completed', category: 'child', certificateId: 'VAX-100027' },
    { patientKey: 'pat_test', vaccineName: 'Typhoid Polysaccharide Vaccine', vaccineCode: 'TYP-1', doseNumber: 1, dateAdministered: new Date('2026-05-10'), facility: 'CHC Sitapur Central', administeredBy: 'Dr. Ananya Gupta', batchNumber: 'TYP-2026-001', status: 'completed', category: 'child', certificateId: 'VAX-100028' },
    { patientKey: 'pat_test', vaccineName: 'DPT Booster-2 (5-6 Years)', vaccineCode: 'DPT-B2', doseNumber: 4, dateAdministered: new Date('2026-06-01'), facility: 'CHC Sitapur Central', administeredBy: 'Dr. Rajesh Sharma', batchNumber: 'DPT-2026-014', status: 'completed', category: 'child', certificateId: 'VAX-100029' },
    { patientKey: 'pat_test', vaccineName: 'Tetanus & Adult Diphtheria (Td-10)', vaccineCode: 'TD-10', doseNumber: 1, dateAdministered: new Date('2026-06-15'), facility: 'CHC Sitapur Central', administeredBy: 'Dr. Rajesh Sharma', batchNumber: 'TD-2026-008', status: 'completed', category: 'child', certificateId: 'VAX-100030' },
    { patientKey: 'pat_test', vaccineName: 'Influenza Seasonal (Quadrivalent)', vaccineCode: 'FLU-26', doseNumber: 1, dateAdministered: new Date('2026-07-01'), facility: 'District Hospital Sitapur', administeredBy: 'Dr. Vikram Malhotra', batchNumber: 'FLU-2026-005', status: 'completed', category: 'adult', certificateId: 'VAX-100031' },
    { patientKey: 'pat_test', vaccineName: 'Hepatitis B Adult Booster', vaccineCode: 'HEPB-B', doseNumber: 1, dateAdministered: new Date('2026-07-20'), facility: 'District Hospital Sitapur', administeredBy: 'Dr. Vikram Malhotra', batchNumber: 'HEPB-2026-012', status: 'completed', category: 'adult', certificateId: 'VAX-100032' },
    { patientKey: 'pat_test', vaccineName: 'COVID-19 Corbevax Primary (Dose 1)', vaccineCode: 'COV-1', doseNumber: 1, dateAdministered: new Date('2026-08-01'), facility: 'CHC Sitapur Central', administeredBy: 'Dr. Rajesh Sharma', batchNumber: 'COV-2026-018', status: 'completed', category: 'adult', certificateId: 'VAX-100033' },
    { patientKey: 'pat_test', vaccineName: 'COVID-19 Corbevax Primary (Dose 2)', vaccineCode: 'COV-2', doseNumber: 2, dateAdministered: new Date('2026-08-28'), facility: 'CHC Sitapur Central', administeredBy: 'Dr. Rajesh Sharma', batchNumber: 'COV-2026-024', status: 'completed', category: 'adult', certificateId: 'VAX-100034' },
    { patientKey: 'pat_test', vaccineName: 'COVID-19 Precautionary Booster', vaccineCode: 'COV-B', doseNumber: 3, dateAdministered: new Date('2026-09-05'), facility: 'CHC Sitapur Central', administeredBy: 'Dr. Rajesh Sharma', batchNumber: 'COV-2026-031', status: 'completed', category: 'adult', certificateId: 'VAX-100035' },
    { patientKey: 'pat_test', vaccineName: 'Measles-Rubella (MR-1)', vaccineCode: 'MR-1', doseNumber: 1, nextDueDate: new Date('2026-10-01'), facility: 'Anganwadi Centre 3', administeredBy: 'ASHA Worker Sunita Devi', status: 'scheduled', category: 'child', notes: 'Scheduled for Mission Indradhanush camp' },
    { patientKey: 'pat_test', vaccineName: 'DPT Booster-1', vaccineCode: 'DPT-B1', doseNumber: 3, nextDueDate: new Date('2026-10-15'), facility: 'Anganwadi Centre 3', administeredBy: 'ASHA Worker Sunita Devi', status: 'scheduled', category: 'child', notes: 'Due at Anganwadi camp this Thursday' },
    { patientKey: 'pat_test', vaccineName: 'OPV Booster', vaccineCode: 'OPV-B', doseNumber: 3, nextDueDate: new Date('2026-10-15'), facility: 'Anganwadi Centre 3', administeredBy: 'ASHA Worker Sunita Devi', status: 'scheduled', category: 'child', notes: 'Combined with DPT Booster dose' },
    { patientKey: 'pat_test', vaccineName: 'Typhoid Conjugate Vaccine', vaccineCode: 'TCV-1', doseNumber: 1, nextDueDate: new Date('2026-11-01'), facility: 'CHC Sitapur Central', administeredBy: 'Dr. Rajesh Sharma', status: 'scheduled', category: 'child', notes: 'New addition to Universal Immunization Programme' },
  ];

  for (const imm of immunizations) {
    await Immunization.create({
      patient: userMap[imm.patientKey],
      vaccineName: imm.vaccineName,
      vaccineCode: imm.vaccineCode,
      doseNumber: imm.doseNumber,
      dateAdministered: imm.dateAdministered || undefined,
      nextDueDate: imm.nextDueDate || undefined,
      facility: imm.facility,
      administeredBy: imm.administeredBy,
      batchNumber: imm.batchNumber,
      status: imm.status,
      category: imm.category,
      certificateId: imm.certificateId,
      notes: imm.notes,
    });
  }
  console.log(`Created ${immunizations.length} immunization records.`);

  // 10. Insert Maternal Checkup Records
  const maternalCheckups = [
    // Seeded for default test patient (patient@test.com)
    { patientKey: 'pat_test', visitType: 'ANC-1', visitNumber: 1, dateOfVisit: new Date('2026-06-10'), weeksPregnant: 12, vitals: { bloodPressure: '118/76', weight: 54, hemoglobin: 10.5, bloodSugar: 86 }, facility: 'CHC Sitapur Central', doctorName: 'Dr. Priya Verma', riskLevel: 'low', supplements: [{ name: 'Iron Folic Acid (IFA)', dosage: '1 tablet daily' }, { name: 'Calcium 500mg', dosage: 'Daily' }], testsOrdered: ['Blood Group', 'HIV', 'Hepatitis B', 'CBC'], diagnosis: 'Healthy early pregnancy. Routine IFA prescribed.', nextVisitDate: new Date('2026-07-10'), status: 'completed' },
    { patientKey: 'pat_test', visitType: 'ANC-2', visitNumber: 2, dateOfVisit: new Date('2026-07-12'), weeksPregnant: 20, vitals: { bloodPressure: '120/78', weight: 58, hemoglobin: 11.0, bloodSugar: 88, fundalHeight: 20, fetalHeartRate: 146 }, facility: 'CHC Sitapur Central', doctorName: 'Dr. Priya Verma', riskLevel: 'low', supplements: [{ name: 'Iron Folic Acid (IFA)', dosage: '1 tablet daily' }], testsOrdered: ['Level-2 Ultrasound (Anomaly Scan)', 'OGTT Sugar'], diagnosis: 'Normal fetal anatomy & amniotic fluid. Normal growth.', nextVisitDate: new Date('2026-08-15'), status: 'completed' },
    { patientKey: 'pat_test', visitType: 'ANC-3', visitNumber: 3, dateOfVisit: new Date('2026-08-18'), weeksPregnant: 28, vitals: { bloodPressure: '122/80', weight: 62, hemoglobin: 11.4, bloodSugar: 92, fundalHeight: 28, fetalHeartRate: 142 }, facility: 'CHC Sitapur Central', doctorName: 'Dr. Priya Verma', riskLevel: 'low', supplements: [{ name: 'Iron Folic Acid (IFA)', dosage: '1 tablet daily' }, { name: 'Calcium 500mg', dosage: 'Daily' }], testsOrdered: ['CBC Review', 'Urine Albumin'], diagnosis: 'Third trimester stable. Hemoglobin improved to 11.4.', nextVisitDate: new Date('2026-09-25'), status: 'completed' },
    { patientKey: 'pat_test', visitType: 'ANC-4', visitNumber: 4, dateOfVisit: new Date('2026-09-25'), weeksPregnant: 34, vitals: { bloodPressure: '124/82', weight: 64, hemoglobin: 11.4, bloodSugar: 90, fundalHeight: 34, fetalHeartRate: 140 }, facility: 'CHC Sitapur Central', doctorName: 'Dr. Priya Verma', riskLevel: 'low', supplements: [{ name: 'Iron Folic Acid (IFA)', dosage: '1 tablet daily' }], testsOrdered: ['Pre-Delivery Cardiotocography (CTG)', 'Blood Group Crossmatch'], diagnosis: 'Pre-delivery preparation, institutional birth plan created.', nextVisitDate: new Date('2026-10-10'), status: 'scheduled' },

    // Seeded for pat_kamla
    { patientKey: 'pat_kamla', visitType: 'ANC-1', visitNumber: 1, dateOfVisit: new Date('2026-06-10'), weeksPregnant: 12, vitals: { bloodPressure: '118/76', weight: 52, hemoglobin: 10.2, bloodSugar: 88 }, facility: 'CHC Sitapur Central', doctorName: 'Dr. Priya Verma', riskLevel: 'low', supplements: [{ name: 'Iron Folic Acid (IFA)', dosage: '1 tablet daily' }, { name: 'Calcium Supplement', dosage: '500mg twice daily' }], testsOrdered: ['Blood Group', 'HIV', 'Hepatitis B', 'Urinalysis'], diagnosis: 'Normal pregnancy, ANemic — prescribe IFA', nextVisitDate: new Date('2026-07-10'), status: 'completed' },
    { patientKey: 'pat_kamla', visitType: 'ANC-2', visitNumber: 2, dateOfVisit: new Date('2026-07-12'), weeksPregnant: 20, vitals: { bloodPressure: '122/78', weight: 55, hemoglobin: 10.8, bloodSugar: 85, fundalHeight: 20, fetalHeartRate: 148 }, facility: 'CHC Sitapur Central', doctorName: 'Dr. Priya Verma', riskLevel: 'low', supplements: [{ name: 'Iron Folic Acid (IFA)', dosage: '1 tablet daily' }], testsOrdered: ['Anomaly Scan', 'Glucose Tolerance Test'], diagnosis: 'Normal growth, anomaly scan normal, continue supplements', nextVisitDate: new Date('2026-08-15'), status: 'completed' },
    { patientKey: 'pat_kamla', visitType: 'ANC-3', visitNumber: 3, dateOfVisit: new Date('2026-08-18'), weeksPregnant: 28, vitals: { bloodPressure: '124/80', weight: 58, hemoglobin: 11.0, bloodSugar: 92, fundalHeight: 27, fetalHeartRate: 144 }, facility: 'CHC Sitapur Central', doctorName: 'Dr. Priya Verma', riskLevel: 'low', supplements: [{ name: 'Iron Folic Acid (IFA)', dosage: '1 tablet daily' }, { name: 'Calcium Supplement', dosage: '500mg twice daily' }], testsOrdered: ['CBC', 'Urinalysis', 'Blood Sugar Fasting'], diagnosis: 'Normal third trimester, Hb improved, continue care', nextVisitDate: new Date('2026-09-15'), status: 'completed' },
    { patientKey: 'pat_kamla', visitType: 'ANC-4', visitNumber: 4, dateOfVisit: new Date('2026-09-15'), weeksPregnant: 34, vitals: { bloodPressure: '126/82', weight: 60, hemoglobin: 11.2, bloodSugar: 90, fundalHeight: 33, fetalHeartRate: 142 }, facility: 'CHC Sitapur Central', doctorName: 'Dr. Priya Verma', riskLevel: 'low', supplements: [{ name: 'Iron Folic Acid (IFA)', dosage: '1 tablet daily' }], testsOrdered: ['CTG', 'Blood Group Crossmatch'], diagnosis: 'Normal progress, prepare birth plan, counsel on danger signs', nextVisitDate: new Date('2026-10-01'), status: 'scheduled' },
  ];

  for (const mc of maternalCheckups) {
    await MaternalCheckup.create({
      patient: userMap[mc.patientKey],
      visitType: mc.visitType,
      visitNumber: mc.visitNumber,
      dateOfVisit: mc.dateOfVisit,
      weeksPregnant: mc.weeksPregnant,
      vitals: mc.vitals,
      facility: mc.facility,
      doctorName: mc.doctorName,
      riskLevel: mc.riskLevel,
      supplements: mc.supplements,
      testsOrdered: mc.testsOrdered,
      diagnosis: mc.diagnosis,
      nextVisitDate: mc.nextVisitDate,
      status: mc.status,
    });
  }
  console.log(`Created ${maternalCheckups.length} maternal checkup records.`);

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
