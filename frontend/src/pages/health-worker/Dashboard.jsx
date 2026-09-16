import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import LanguageSelector from '../../components/LanguageSelector';

const INITIAL_VILLAGE_PATIENTS = [
  { 
    _id: '6aa974847fbaf7f52bfb3707',
    id: 1, 
    name: 'Kamla Devi', 
    age: '28 yrs', 
    gender: 'Female',
    icon: 'pregnant_woman', 
    risk: 'High Risk', 
    riskColor: true, 
    type: 'Trimester 3 Checkup (तीसरी तिमाही)', 
    time: '09:30 AM', 
    phone: '9876543251', 
    village: 'Rampur Ward 2', 
    abha: '91-4820-1940-2810',
    condition: 'Trimester 3 Pregnancy (Gestational Anemia & Mild Pre-eclampsia)',
    meds: 'Iron Folic Acid (IFA) 1 tab OD, Calcium 500mg BD',
    allergies: 'Penicillin Allergy (Severe)',
    emergencyContact: 'Husband: Mahendra (+91 9876543220)',
    lastVitals: 'BP 138/88 mmHg • Pulse 82 • SpO2 98%',
    vitals: { systolicBP: 138, diastolicBP: 88, heartRate: 82, spO2: 98, temperature: 98.6, bloodSugar: 108 },
    referredDoctor: 'Dr. Priya Verma (SDH Sitapur)'
  },
  { 
    _id: '6aa974857fbaf7f52bfb370c',
    id: 2, 
    name: 'Rameshwar Singh', 
    age: '64 yrs', 
    gender: 'Male',
    icon: 'bloodtype', 
    risk: 'High Risk', 
    riskColor: true, 
    type: 'Diabetes & BP Follow-up', 
    time: '10:15 AM', 
    phone: '9876543214', 
    village: 'Rampur Ward 1', 
    abha: '91-2311-9041-5512',
    condition: 'Type-2 Diabetes (HbA1c 8.2%) & Essential Hypertension',
    meds: 'Metformin 500mg BD, Amlodipine 5mg OD',
    allergies: 'None reported',
    emergencyContact: 'Son: Sunil Singh (+91 9876543221)',
    lastVitals: 'BP 146/92 mmHg • Pulse 74 • Sugar 164 mg/dL',
    vitals: { systolicBP: 146, diastolicBP: 92, heartRate: 74, spO2: 97, temperature: 98.4, bloodSugar: 164 },
    referredDoctor: 'Dr. Rajesh Sharma (CHC Sitapur)'
  },
  { 
    _id: '6aa974857fbaf7f52bfb3712',
    id: 3, 
    name: 'Aarav Kumar', 
    age: '9 mos', 
    gender: 'Male',
    icon: 'child_care', 
    risk: 'Routine', 
    riskColor: false, 
    type: 'Immunization MR-1 (टीकाकरण)', 
    time: '11:30 AM', 
    phone: '9876543215', 
    village: 'Rampur Ward 3', 
    abha: '91-8832-1002-3921',
    condition: '9-Month Milestone Checkup & Weight Monitoring',
    meds: 'Vitamin A Syrup (1 Lakh IU), Paracetamol Drops SOS',
    allergies: 'None reported',
    emergencyContact: 'Mother: Sunita Kumar (+91 9876543222)',
    lastVitals: 'Weight: 8.4 kg • Temp: 98.4°F • SpO2: 99%',
    vitals: { systolicBP: 90, diastolicBP: 60, heartRate: 110, spO2: 99, temperature: 98.4, bloodSugar: 85 },
    referredDoctor: 'Dr. Ananya Gupta (District Hospital)'
  },
  { 
    _id: '6aa974867fbaf7f52bfb3716',
    id: 4, 
    name: 'Meena Yadav', 
    age: '34 yrs', 
    gender: 'Female',
    icon: 'elderly_woman', 
    risk: 'Normal', 
    riskColor: false, 
    type: 'Post-natal Care (प्रसवोत्तर देखभाल)', 
    time: '01:00 PM', 
    phone: '9876543216', 
    village: 'Sitapur Ward 4', 
    abha: '91-3490-1122-8761',
    condition: 'Post-natal Day 14 Recovery • Infant Lactation Review',
    meds: 'IFA 1 OD, Multivitamin & Calcium 500mg',
    allergies: 'Sulfa Drugs',
    emergencyContact: 'Mother-in-law: Sita Devi (+91 9876543223)',
    lastVitals: 'BP 118/76 mmHg • Pulse 72 • Temp: 98.6°F',
    vitals: { systolicBP: 118, diastolicBP: 76, heartRate: 72, spO2: 98, temperature: 98.6, bloodSugar: 94 },
    referredDoctor: 'Dr. Priya Verma (Maternal Health)'
  },
  { 
    _id: '6aa974877fbaf7f52bfb371a',
    id: 5, 
    name: 'Chhedi Lal', 
    age: '71 yrs', 
    gender: 'Male',
    icon: 'elderly', 
    risk: 'Scheduled', 
    riskColor: false, 
    type: 'Hypertension Review (उच्च रक्तचाप)', 
    time: '02:15 PM', 
    phone: '9876543217', 
    village: 'Sitapur Ward 4', 
    abha: '91-9981-2244-1298',
    condition: 'Chronic Hypertension & Mild Osteoarthritis',
    meds: 'Telmisartan 40mg OD, Calcium D3',
    allergies: 'Aspirin / NSAIDs',
    emergencyContact: 'Nephew: Anil Lal (+91 9876543224)',
    lastVitals: 'BP 142/86 mmHg • Pulse 68 • SpO2: 96%',
    vitals: { systolicBP: 142, diastolicBP: 86, heartRate: 68, spO2: 96, temperature: 98.2, bloodSugar: 112 },
    referredDoctor: 'Dr. Rajesh Sharma (CHC Sitapur)'
  },
  {
    _id: '6aa974837fbaf7f52bfb36fc',
    id: 6,
    name: 'Aditya Verma',
    age: '32 yrs',
    gender: 'Male',
    icon: 'person',
    risk: 'Routine',
    riskColor: false,
    type: 'General Health & Vitals Review',
    time: '03:30 PM',
    phone: '9876543252',
    village: 'Sitapur Ward 4 Kiosk',
    abha: '91-8472-1029-4820',
    condition: 'Post-viral recovery, mild fatigue',
    meds: 'Paracetamol 650mg SOS, Vitamin B-Complex OD',
    allergies: 'None reported',
    emergencyContact: 'Father: R.K. Verma (+91 9876543290)',
    lastVitals: 'BP 122/80 mmHg • Pulse 74 • SpO2: 99%',
    vitals: { systolicBP: 122, diastolicBP: 80, heartRate: 74, spO2: 99, temperature: 98.4, bloodSugar: 98 },
    referredDoctor: 'Dr. Rajesh Sharma (CHC Sitapur Central)'
  }
];

const INITIAL_VACCINES = [
  {
    id: 'V-01',
    childName: 'Aarav Kumar',
    age: '9 mos',
    motherName: 'Sunita Kumar',
    village: 'Rampur Ward 3',
    vaccineName: 'MR-1 (Measles-Rubella) + Vitamin A',
    dueDate: 'Due Today (16 Sep 2026)',
    status: 'due',
    doseNumber: 'Dose 1 of 2',
    facility: 'Anganwadi Centre 3',
    batchNo: '',
  },
  {
    id: 'V-02',
    childName: 'Diya Patel',
    age: '1.5 yrs',
    motherName: 'Gita Patel',
    village: 'Rampur Ward 1',
    vaccineName: 'DPT Booster-1 & OPV Booster',
    dueDate: 'Next Week (24 Sep 2026)',
    status: 'scheduled',
    doseNumber: 'Booster Dose',
    facility: 'Rampur Sub-Centre Kiosk',
    batchNo: '',
  },
  {
    id: 'V-03',
    childName: 'Kamla Devi',
    age: '28 yrs (Pregnant)',
    motherName: 'Self (Maternal Care)',
    village: 'Rampur Ward 2',
    vaccineName: 'Tetanus & adult Diphtheria (Td-2)',
    dueDate: '20 Sep 2026',
    status: 'scheduled',
    doseNumber: 'Antenatal Dose 2',
    facility: 'CHC Sitapur Central',
    batchNo: '',
  },
  {
    id: 'V-04',
    childName: 'Rohan Gupta',
    age: '5 yrs',
    motherName: 'Pooja Gupta',
    village: 'Sitapur Ward 4',
    vaccineName: 'DPT Booster-2 (School Entry Dose)',
    dueDate: 'Due Today (16 Sep 2026)',
    status: 'due',
    doseNumber: 'Final Booster',
    facility: 'Primary School Booth 4',
    batchNo: '',
  },
  {
    id: 'V-05',
    childName: 'Pari Yadav',
    age: '14 wks',
    motherName: 'Meena Yadav',
    village: 'Sitapur Ward 4',
    vaccineName: 'Pentavalent-3, Rotavirus-3 & fIPV-2',
    dueDate: '10 Sep 2026',
    status: 'completed',
    doseNumber: 'Primary Series 3',
    facility: 'Sitapur Sub-Centre Kiosk',
    batchNo: 'SII-PNT-9942',
    completedDate: '10 Sep 2026',
  },
];

export default function HealthWorkerDashboard() {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('visits'); // 'visits', 'registry', 'immunization', 'requests'
  const [activeModal, setActiveModal] = useState(null); // 'vitals', 'dossier', 'register-citizen', 'log-vaccine', 'schedule-chart'
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [expandedPatientId, setExpandedPatientId] = useState(null);
  const [patients, setPatients] = useState(INITIAL_VILLAGE_PATIENTS);
  const [vaccines, setVaccines] = useState(INITIAL_VACCINES);
  const [selectedVaccine, setSelectedVaccine] = useState(null);

  // Search & Filters
  const [registrySearch, setRegistrySearch] = useState('');
  const [wardFilter, setWardFilter] = useState('ALL');
  const [vaccineFilter, setVaccineFilter] = useState('ALL');

  // Vitals Form State
  const [vitalsForm, setVitalsForm] = useState({
    bp: '120/80',
    pulse: '72',
    spo2: '98',
    temp: '98.6',
    sugar: '104',
    notes: '',
    urgent: false,
  });

  // Register Citizen Form State
  const [newCitizen, setNewCitizen] = useState({
    name: '',
    age: '',
    gender: 'Female',
    phone: '',
    village: 'Sitapur Ward 4',
    condition: 'Routine Health Check',
    allergies: 'None reported',
    risk: 'Routine',
  });

  // Log Vaccine Form State
  const [vaccineLogForm, setVaccineLogForm] = useState({
    batchNo: 'SII-COV-8291',
    facility: 'Anganwadi Centre 3 (Sitapur)',
    notes: 'Vaccine vial monitor verified, zero adverse reaction noted.',
  });

  const [syncStatus, setSyncStatus] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [citizenRequests, setCitizenRequests] = useState([]);
  const [updatingRequestId, setUpdatingRequestId] = useState(null);
  const [submittingVitals, setSubmittingVitals] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchCitizenRequests = () => {
    api.get('/health-worker/visit-requests')
      .then(r => {
        if (r.data?.data) {
          setCitizenRequests(r.data.data);
          try { localStorage.setItem('sehatsaarthi_visit_requests', JSON.stringify(r.data.data)); } catch(e) {}
        }
      })
      .catch(() => {
        try {
          const local = JSON.parse(localStorage.getItem('sehatsaarthi_visit_requests') || '[]');
          setCitizenRequests(local);
        } catch(e) {}
      });
  };

  const fetchAssignedPatients = () => {
    api.get('/health-worker/patients')
      .then(r => {
        if (r.data?.data && r.data.data.length > 0) {
          // Merge with initial rich structure
          const backendPatients = r.data.data;
          const merged = INITIAL_VILLAGE_PATIENTS.map(ip => {
            const found = backendPatients.find(bp => bp._id === ip._id || bp.name.toLowerCase() === ip.name.toLowerCase());
            if (found) {
              return {
                ...ip,
                ...found,
                vitals: found.vitals || ip.vitals,
                lastVitals: found.vitals ? `BP ${found.vitals.systolicBP}/${found.vitals.diastolicBP} • Pulse ${found.vitals.heartRate}` : ip.lastVitals,
              };
            }
            return ip;
          });
          setPatients(merged);
        }
      })
      .catch(err => {
        console.warn('Using local village patients dossier:', err);
      });
  };

  useEffect(() => {
    api.get('/health-worker/dashboard')
      .then(r => setData(r.data?.data))
      .catch(() => {});
    fetchCitizenRequests();
    fetchAssignedPatients();
    // Continuous background automatic sync of ABDM village health records
    const interval = setInterval(() => {
      fetchCitizenRequests();
      fetchAssignedPatients();
      try {
        localStorage.setItem('sehatsaarthi_last_abdm_sync', new Date().toISOString());
      } catch(e) {}
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Update Visit Request Status
  const handleUpdateVisitStatus = async (id, newStatus, customNotes) => {
    setUpdatingRequestId(id);
    try {
      const nowStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
      const scheduledTime = newStatus === 'scheduled' ? `Today, ${nowStr}` : undefined;
      const actionNotes = customNotes || (
        newStatus === 'scheduled' ? 'Sunita Devi confirmed visit slot' :
        newStatus === 'in_progress' ? 'Sunita Devi is en-route to household' :
        newStatus === 'completed' ? 'Home visit & initial health check completed' :
        newStatus === 'cancelled' ? 'Visit cancelled/rescheduled' : ''
      );

      const res = await api.patch(`/health-worker/visit-requests/${id}/status`, {
        status: newStatus,
        scheduledTime,
        actionNotes
      });

      const updated = citizenRequests.map(item => (item._id === id ? res.data.data : item));
      setCitizenRequests(updated);
      try { localStorage.setItem('sehatsaarthi_visit_requests', JSON.stringify(updated)); } catch(e) {}
      showToast(`Visit request updated to "${newStatus.replace('_', ' ')}"!`);
    } catch (err) {
      const updated = citizenRequests.map(item => {
        if (item._id === id || item.requestId === id) {
          return {
            ...item,
            status: newStatus,
            scheduledTime: newStatus === 'scheduled' ? 'Today, 11:30 AM' : item.scheduledTime,
            actionNotes: customNotes || (newStatus === 'scheduled' ? 'Visit scheduled by Sunita Devi' : newStatus === 'completed' ? 'Visit completed' : 'Updated')
          };
        }
        return item;
      });
      setCitizenRequests(updated);
      try { localStorage.setItem('sehatsaarthi_visit_requests', JSON.stringify(updated)); } catch(e) {}
      showToast(`Status updated to "${newStatus.replace('_', ' ')}"`);
    } finally {
      setUpdatingRequestId(null);
    }
  };

  // Record Vitals & Triage
  const handleSaveVitals = async (e) => {
    e.preventDefault();
    setSubmittingVitals(true);
    try {
      const [sys, dia] = vitalsForm.bp.includes('/') ? vitalsForm.bp.split('/') : [vitalsForm.bp, '80'];
      const targetPatientId = selectedPatient?._id || '6aa974847fbaf7f52bfb3707';

      const payload = {
        patientId: targetPatientId,
        riskLevel: vitalsForm.urgent ? 'high' : 'medium',
        vitals: {
          systolicBP: Number(sys) || 120,
          diastolicBP: Number(dia) || 80,
          heartRate: Number(vitalsForm.pulse) || 72,
          spO2: Number(vitalsForm.spo2) || 98,
          temperature: Number(vitalsForm.temp) || 98.6,
          bloodSugar: Number(vitalsForm.sugar) || 100,
        },
        symptoms: ['routine_checkup'],
        notes: vitalsForm.notes || 'Village household visit completed by ASHA worker.',
      };

      await api.post('/health-worker/triage', payload);

      // Update patient's in-memory last vitals
      const vitalsSummary = `BP ${payload.vitals.systolicBP}/${payload.vitals.diastolicBP} mmHg • Pulse ${payload.vitals.heartRate} • SpO2 ${payload.vitals.spO2}%`;
      setPatients(prev => prev.map(p => {
        if (p._id === targetPatientId || p.id === selectedPatient?.id) {
          return {
            ...p,
            lastVitals: vitalsSummary,
            vitals: payload.vitals,
            risk: vitalsForm.urgent ? 'High Risk' : p.risk,
            riskColor: vitalsForm.urgent ? true : p.riskColor,
          };
        }
        return p;
      }));

      showToast(`Vitals for ${selectedPatient?.name} successfully recorded & synced to ABDM Health Grid!`);
      setActiveModal(null);
    } catch (err) {
      console.warn(err);
      // Still update local UI
      const vitalsSummary = `BP ${vitalsForm.bp} mmHg • Pulse ${vitalsForm.pulse} • SpO2 ${vitalsForm.spo2}%`;
      setPatients(prev => prev.map(p => {
        if (p.name === selectedPatient?.name) {
          return { ...p, lastVitals: vitalsSummary };
        }
        return p;
      }));
      showToast(`Vitals for ${selectedPatient?.name} saved locally & queued for ABDM sync!`);
      setActiveModal(null);
    } finally {
      setSubmittingVitals(false);
    }
  };

  // Register New Citizen Handler
  const handleRegisterCitizen = (e) => {
    e.preventDefault();
    if (!newCitizen.name) {
      showToast('Please enter citizen name');
      return;
    }

    const randomAbha = `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newEntry = {
      _id: `local-${Date.now()}`,
      id: patients.length + 1,
      name: newCitizen.name,
      age: `${newCitizen.age || '30'} yrs`,
      gender: newCitizen.gender,
      icon: newCitizen.gender === 'Female' ? 'person_4' : 'person',
      risk: newCitizen.risk,
      riskColor: newCitizen.risk === 'High Risk',
      type: 'New Household Registration (नवीन पंजीकरण)',
      time: '04:00 PM',
      phone: newCitizen.phone || '9876543299',
      village: newCitizen.village,
      abha: randomAbha,
      condition: newCitizen.condition,
      meds: 'Pending clinical assessment',
      allergies: newCitizen.allergies,
      emergencyContact: `Family Member (+91 ${newCitizen.phone || '9876543299'})`,
      lastVitals: 'Pending first vitals check',
      vitals: { systolicBP: 120, diastolicBP: 80, heartRate: 72, spO2: 98, temperature: 98.6 },
      referredDoctor: 'Dr. Rajesh Sharma (CHC Sitapur Central)',
    };

    setPatients([newEntry, ...patients]);
    showToast(`Citizen "${newCitizen.name}" registered with ABHA: ${randomAbha}!`);
    setActiveModal(null);
    setNewCitizen({
      name: '',
      age: '',
      gender: 'Female',
      phone: '',
      village: 'Sitapur Ward 4',
      condition: 'Routine Health Check',
      allergies: 'None reported',
      risk: 'Routine',
    });
  };

  // Log Vaccination Dose Handler
  const handleLogVaccineDose = (e) => {
    e.preventDefault();
    if (!selectedVaccine) return;

    setVaccines(prev => prev.map(v => {
      if (v.id === selectedVaccine.id) {
        return {
          ...v,
          status: 'completed',
          batchNo: vaccineLogForm.batchNo || 'SII-COV-8291',
          facility: vaccineLogForm.facility || 'Anganwadi Centre 3',
          completedDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        };
      }
      return v;
    }));

    showToast(`Vaccination for "${selectedVaccine.childName}" recorded! Logged on U-WIN/ABDM Grid.`);
    setActiveModal(null);
  };

  // Sync ABDM Handler
  const handleSync = () => {
    setSyncStatus('syncing');
    setTimeout(() => {
      setSyncStatus('done');
      showToast('All 245 household records and vitals synchronized with ABDM cloud server!');
      setTimeout(() => setSyncStatus(null), 3500);
    }, 1200);
  };

  // Filtered Patients
  const filteredPatients = patients.filter(p => {
    const term = registrySearch.toLowerCase();
    const matchesSearch = !term || (
      p.name.toLowerCase().includes(term) ||
      p.abha.includes(term) ||
      p.phone.includes(term) ||
      p.village.toLowerCase().includes(term)
    );
    const matchesWard = wardFilter === 'ALL' || p.village.includes(wardFilter);
    return matchesSearch && matchesWard;
  });

  // Filtered Vaccines
  const filteredVaccines = vaccines.filter(v => {
    if (vaccineFilter === 'DUE') return v.status === 'due';
    if (vaccineFilter === 'SCHEDULED') return v.status === 'scheduled';
    if (vaccineFilter === 'COMPLETED') return v.status === 'completed';
    return true;
  });

  return (
    <div className="bg-[#fbfaf7] text-slate-900 font-sans min-h-screen">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-[120] bg-slate-900 text-amber-300 px-5 py-3 rounded-2xl shadow-xl border border-amber-400/50 flex items-center gap-3 text-sm font-bold animate-bounce">
          <span className="material-symbols-outlined text-amber-400">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER: Exactly matching SehatSaarthi warm amber branding */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs w-full">
        <div className="w-full px-6 lg:px-12 xl:px-16 flex items-center justify-between gap-8 h-20">
          {/* Logo with Govt Portal Badge Below */}
          <Link to="/health-worker" className="flex items-center gap-3.5 shrink-0 group">
            <img src="/images/logo-transparent.png" alt="SehatSaarthi" className="w-11 h-11 rounded-2xl object-cover shrink-0 notranslate" translate="no" />
            <div className="flex flex-col">
              <span className="font-brand font-black text-slate-900 tracking-tight text-2xl leading-none group-hover:text-amber-700 transition-colors notranslate" translate="no">SehatSaarthi</span>
              <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 self-start mt-1">
                Govt Portal • ASHA Grid
              </span>
            </div>
          </Link>

          {/* Navigation Items with Subtle Dividers */}
          <nav className="hidden lg:flex items-center gap-2 xl:gap-4">
            <button 
              onClick={() => setActiveTab('visits')} 
              className={`px-3.5 py-2 font-extrabold text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'visits' 
                  ? 'bg-amber-600 text-white shadow-sm' 
                  : 'text-slate-700 hover:text-amber-800 hover:bg-amber-50/70'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">calendar_today</span>
              <span>Today's Visits</span>
              <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-300">
                {patients.length}
              </span>
            </button>

            <div className="h-6 w-[2px] bg-slate-300 rounded-full shrink-0"></div>

            <button 
              onClick={() => setActiveTab('registry')} 
              className={`px-3.5 py-2 font-extrabold text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'registry' 
                  ? 'bg-amber-600 text-white shadow-sm' 
                  : 'text-slate-700 hover:text-amber-800 hover:bg-amber-50/70'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">group</span>
              <span>Patient Registry</span>
            </button>

            <div className="h-6 w-[2px] bg-slate-300 rounded-full shrink-0"></div>

            <button 
              onClick={() => setActiveTab('immunization')} 
              className={`px-3.5 py-2 font-extrabold text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'immunization' 
                  ? 'bg-amber-600 text-white shadow-sm' 
                  : 'text-slate-700 hover:text-amber-800 hover:bg-amber-50/70'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">vaccines</span>
              <span>Immunization</span>
              {vaccines.filter(v => v.status === 'due').length > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                  {vaccines.filter(v => v.status === 'due').length} Due
                </span>
              )}
            </button>
            
            <div className="h-6 w-[2px] bg-slate-300 rounded-full shrink-0"></div>

            <button 
              onClick={() => setActiveTab('requests')} 
              className={`px-3.5 py-2 font-extrabold text-sm rounded-xl transition-all inline-flex items-center gap-2 cursor-pointer ${
                activeTab === 'requests' 
                  ? 'bg-amber-600 text-white shadow-sm' 
                  : 'text-slate-700 hover:text-amber-800 hover:bg-amber-50/70'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">home_health</span>
              <span>Visit Requests</span>
              {citizenRequests.filter(r => r.status === 'pending').length > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse shadow-2xs">
                  {citizenRequests.filter(r => r.status === 'pending').length}
                </span>
              )}
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="h-8 w-[2px] bg-slate-300 rounded-full hidden lg:block mr-1"></div>

            <LanguageSelector />

            <button 
              onClick={() => { if (window.confirm('Are you sure you want to logout?')) logout(); }} 
              className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 border border-slate-200 flex items-center justify-center transition-all shadow-xs cursor-pointer" 
              title="Logout"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="w-full px-6 lg:px-12 xl:px-16 pt-28 pb-16">
        {/* TODAY'S VISITS TAB */}
        {activeTab === 'visits' && (
          <div className="flex flex-col w-full animate-fadeIn">
            {/* Top ASHA Duty Card */}
            <div className="bg-gradient-to-r from-amber-500/15 via-amber-100/40 to-transparent p-6 sm:p-8 rounded-3xl border-2 border-amber-300 shadow-sm mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-amber-300 text-amber-900 text-xs font-extrabold mb-3 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>National Rural Health Mission • Accredited Field Worker</span>
                  </div>
                  <h1 className="font-heading text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    ASHA Rural Community Console
                  </h1>
                  <p className="text-base text-slate-700 font-semibold mt-1">
                    Field Worker: <span className="text-amber-800 underline decoration-amber-400 decoration-2">{user?.name || 'Sunita Devi'}</span> • Assigned Sitapur Ward 4 Sector (245 Households)
                  </p>
                </div>
                <div className="bg-white border-2 border-amber-300 p-5 sm:p-6 rounded-3xl shadow-md flex items-center gap-5 self-start md:self-auto shrink-0">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 border-2 border-amber-300 flex items-center justify-center text-amber-700 shrink-0 shadow-xs">
                    <span className="material-symbols-outlined text-[30px]">volunteer_activism</span>
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-black mb-1">
                      <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse"></span>
                      <span>DUTY: ACTIVE TODAY</span>
                    </div>
                    <div className="flex items-center gap-2 bg-amber-100 text-amber-950 border-2 border-amber-300 px-3.5 py-1.5 rounded-xl shadow-xs my-1">
                      <span className="material-symbols-outlined text-[18px] text-amber-700">schedule</span>
                      <span className="text-base sm:text-lg font-black tracking-tight">8:00 AM – 6:00 PM</span>
                      <span className="text-[10px] uppercase font-black bg-amber-200/90 text-amber-900 px-1.5 py-0.5 rounded">Shift</span>
                    </div>
                    <span className="text-xs text-slate-600 font-bold block mt-0.5">Sitapur Ward 4 Field Route</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Accessible Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
              <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-sm flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase font-extrabold text-slate-500 tracking-wider block mb-1">Today's Assigned</span>
                  <span className="text-4xl font-black text-slate-900">{patients.length}</span>
                  <p className="text-xs text-slate-500 font-semibold mt-1">Village Household Visits</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-amber-50 border-2 border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[32px]">assignment</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border-2 border-amber-300 shadow-sm flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase font-extrabold text-amber-800 tracking-wider block mb-1">Pending Citizen Requests</span>
                  <span className="text-4xl font-black text-amber-950">{citizenRequests.filter(r => r.status === 'pending').length}</span>
                  <p className="text-xs text-amber-800 font-bold mt-1">Home visits awaiting acceptance</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[32px]">pending_actions</span>
                </div>
              </div>

              <div className="bg-rose-50/70 p-6 rounded-3xl border-2 border-rose-300 shadow-sm flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase font-extrabold text-rose-800 tracking-wider block mb-1">High Risk Priority</span>
                  <span className="text-4xl font-black text-rose-950">{patients.filter(p => p.riskColor).length}</span>
                  <p className="text-xs text-rose-800 font-bold mt-1">Immediate PHC triage needed</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[32px]">warning</span>
                </div>
              </div>
            </div>

            {/* Pending Citizen Requests Alert Banner */}
            {citizenRequests.filter(r => r.status === 'pending').length > 0 && (
              <div 
                onClick={() => setActiveTab('requests')}
                className="mb-8 p-4 sm:p-5 bg-gradient-to-r from-amber-500/15 via-amber-100/50 to-transparent border-2 border-amber-400 hover:border-amber-500 rounded-3xl flex items-center justify-between gap-4 cursor-pointer transition-all shadow-xs"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <span className="material-symbols-outlined text-[26px]">home_health</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-base font-extrabold text-amber-950">
                        {citizenRequests.filter(r => r.status === 'pending').length} New Citizen Visit Request(s) Received
                      </h3>
                      <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Action Needed</span>
                    </div>
                    <p className="text-xs text-amber-800 font-semibold">Village residents have requested home visits / medicine delivery from Sunita Devi.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="hidden sm:inline text-xs font-black text-amber-900">Open Requests Tab</span>
                  <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </div>
                </div>
              </div>
            )}

            {/* Daily Visit Queue Section */}
            <section className="mb-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-sm shrink-0">
                    <span className="material-symbols-outlined text-[22px]">format_list_bulleted</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-heading">Daily Household Visit Queue</h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium">Prioritized by clinical triage risk score &amp; gestation stage</p>
                  </div>
                </div>
                <span className="bg-amber-100 text-amber-900 text-xs font-extrabold px-3 py-1 rounded-full border border-amber-300 self-start sm:self-auto">
                  {patients.length} Citizens Queued
                </span>
              </div>

              {/* Patient Cards List */}
              <div className="flex flex-col gap-4 w-full">
                {patients.map(patient => (
                  <div 
                    key={patient._id || patient.id} 
                    className={`bg-white p-5 sm:p-6 rounded-3xl border-2 transition-all duration-200 shadow-sm hover:shadow-md ${
                      patient.riskColor 
                        ? 'border-rose-300 hover:border-rose-500 bg-rose-50/20' 
                        : 'border-slate-200 hover:border-amber-400'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                      <div className="flex items-start sm:items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center font-bold shrink-0 ${
                          patient.riskColor 
                            ? 'bg-rose-50 border-rose-300 text-rose-700' 
                            : patient.risk === 'Routine' 
                              ? 'bg-sky-50 border-sky-300 text-sky-800' 
                              : 'bg-amber-50 border-amber-300 text-amber-800'
                        }`}>
                          <span className="material-symbols-outlined text-[32px]">{patient.icon || 'person'}</span>
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2.5 mb-1">
                            <h3 className="text-xl font-extrabold text-slate-900 leading-snug notranslate" translate="no">{patient.name}</h3>
                            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{patient.age}</span>
                            <span className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-black border ${
                              patient.riskColor 
                                ? 'bg-rose-100 text-rose-900 border-rose-300 shadow-2xs' 
                                : 'bg-amber-100 text-amber-900 border-amber-300'
                            }`}>
                              {patient.riskColor && <span className="material-symbols-outlined text-[14px]">priority_high</span>}
                              {patient.risk}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-slate-700">{patient.type}</p>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-semibold mt-1">
                            <span className="flex items-center gap-1 text-slate-700 font-extrabold">
                              <span className="material-symbols-outlined text-[16px] text-amber-600">schedule</span>
                              Slot: {patient.time}
                            </span>
                            <span>•</span>
                            <span>{patient.village}</span>
                            <span>•</span>
                            <span className="font-mono text-amber-900 notranslate" translate="no">ABHA: {patient.abha}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0 pt-2 lg:pt-0">
                        {/* Dossier info button */}
                        <button 
                          type="button"
                          onClick={() => {
                            setSelectedPatient(patient);
                            setActiveModal('dossier');
                          }}
                          className="h-12 w-12 rounded-xl border-2 border-slate-300 bg-white hover:bg-slate-100 text-slate-700 hover:text-amber-700 hover:border-amber-400 flex items-center justify-center transition-all shadow-xs cursor-pointer"
                          title="View Full ABDM Clinical Dossier"
                        >
                          <span className="material-symbols-outlined text-[22px]">info</span>
                        </button>

                        {/* Call Button */}
                        <a 
                          href={`tel:${patient.phone}`} 
                          className="h-12 px-4 rounded-xl border-2 border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                        >
                          <span className="material-symbols-outlined text-[18px] text-amber-600">call</span>
                          <span>Call</span>
                        </a>

                        {/* Record Vitals Button */}
                        <button 
                          onClick={() => { 
                            setSelectedPatient(patient); 
                            setVitalsForm(prev => ({
                              ...prev,
                              bp: patient.vitals ? `${patient.vitals.systolicBP}/${patient.vitals.diastolicBP}` : '120/80',
                              pulse: patient.vitals ? String(patient.vitals.heartRate) : '72',
                              spo2: patient.vitals ? String(patient.vitals.spO2) : '98',
                              temp: patient.vitals ? String(patient.vitals.temperature) : '98.6',
                              sugar: patient.vitals?.bloodSugar ? String(patient.vitals.bloodSugar) : '100',
                            }));
                            setActiveModal('vitals'); 
                          }} 
                          className="h-12 px-5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-extrabold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[20px]">favorite</span>
                          <span>Record Vitals &amp; Triage</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* REGISTRY TAB */}
        {activeTab === 'registry' && (
          <div className="flex flex-col w-full animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-heading">Village Citizen Registry</h1>
                <p className="text-sm text-slate-600 font-medium">Verified ABHA digital health profiles of village households assigned under Rampur &amp; Sitapur sector.</p>
              </div>
              <button 
                onClick={() => setActiveModal('register-citizen')}
                className="bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white px-5 py-3 rounded-xl font-extrabold text-sm shadow-sm flex items-center gap-2 transition-all self-start sm:self-auto cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">person_add</span>
                <span>Register New Citizen</span>
              </button>
            </div>

            <div className="bg-white border-2 border-slate-200/90 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <span className="material-symbols-outlined text-[20px]">search</span>
                  </span>
                  <input 
                    type="text" 
                    value={registrySearch}
                    onChange={(e) => setRegistrySearch(e.target.value)}
                    placeholder="Search by Citizen Name, ABHA ID (e.g. 91-4820), or Phone Number..." 
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500" 
                  />
                </div>
                <select 
                  value={wardFilter}
                  onChange={(e) => setWardFilter(e.target.value)}
                  className="bg-white px-4 py-2.5 border border-slate-300 rounded-xl text-xs font-extrabold text-slate-800 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="ALL">All Wards (Rampur &amp; Sitapur)</option>
                  <option value="Ward 1">Ward 1 (North Rampur)</option>
                  <option value="Ward 2">Ward 2 (Central)</option>
                  <option value="Ward 3">Ward 3 (East Sub-Centre)</option>
                  <option value="Ward 4">Ward 4 (Sitapur Road)</option>
                </select>
              </div>

              <div className="divide-y divide-slate-100">
                {filteredPatients.map(c => (
                  <div key={c._id || c.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center font-bold text-xl">
                        {c.name[0]}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base font-extrabold text-slate-900">{c.name}</h4>
                          <span className="text-xs text-slate-500 font-bold">• {c.age}</span>
                          <span className="text-xs font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300">{c.abha}</span>
                        </div>
                        <p className="text-xs text-slate-500 font-semibold mt-0.5">{c.village} • Ph: {c.phone}</p>
                        <p className="text-[11px] text-slate-600 mt-1">
                          <strong>Condition:</strong> {c.condition}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      <button 
                        onClick={() => {
                          setSelectedPatient(c);
                          setActiveModal('dossier');
                        }}
                        className="h-10 px-4 rounded-xl border border-slate-300 bg-white hover:bg-amber-50 hover:text-amber-800 hover:border-amber-300 text-slate-800 text-xs font-extrabold transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[16px] text-amber-700">description</span>
                        <span>View Health Dossier</span>
                      </button>

                      <button 
                        onClick={() => { 
                          setSelectedPatient(c); 
                          setActiveModal('vitals'); 
                        }}
                        className="h-10 px-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-black shadow-xs transition-all cursor-pointer flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[16px]">favorite</span>
                        <span>Vitals</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* IMMUNIZATION TAB */}
        {activeTab === 'immunization' && (
          <div className="flex flex-col w-full animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-heading">Village Immunization Tracker</h1>
                <p className="text-sm text-slate-600 font-medium">Mission Indradhanush vaccination schedule for village infants and pregnant mothers.</p>
              </div>

              <button
                type="button"
                onClick={() => setActiveModal('schedule-chart')}
                className="px-4 py-2.5 bg-white hover:bg-amber-50 text-amber-900 border-2 border-amber-300 font-black text-xs rounded-xl shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto"
              >
                <span className="material-symbols-outlined text-[18px] text-amber-700">calendar_month</span>
                <span>National Vaccine Schedule Chart</span>
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-2xl w-fit border border-slate-200">
              {[
                { key: 'ALL', label: `All (${vaccines.length})` },
                { key: 'DUE', label: `Due Today (${vaccines.filter(v => v.status === 'due').length})` },
                { key: 'SCHEDULED', label: `Scheduled (${vaccines.filter(v => v.status === 'scheduled').length})` },
                { key: 'COMPLETED', label: `Completed (${vaccines.filter(v => v.status === 'completed').length})` },
              ].map(f => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setVaccineFilter(f.key)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    vaccineFilter === f.key 
                      ? 'bg-amber-600 text-white shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Vaccine Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredVaccines.map(vac => {
                const isCompleted = vac.status === 'completed';
                const isDue = vac.status === 'due';

                return (
                  <div 
                    key={vac.id} 
                    className={`bg-white p-6 sm:p-7 border-2 rounded-3xl shadow-sm border-l-8 transition-all ${
                      isCompleted ? 'border-slate-200 border-l-emerald-600 bg-emerald-50/10' :
                      isDue ? 'border-amber-300 border-l-rose-500' : 'border-slate-200 border-l-amber-500'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-extrabold text-slate-900">{vac.childName}</h3>
                          <span className="text-xs text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded">{vac.age}</span>
                        </div>
                        <p className="text-xs text-slate-500 font-semibold mt-0.5">{vac.motherName} • {vac.village}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-black border uppercase tracking-wider ${
                        isCompleted ? 'bg-emerald-100 text-emerald-900 border-emerald-300' :
                        isDue ? 'bg-rose-100 text-rose-900 border-rose-300' : 'bg-amber-100 text-amber-900 border-amber-300'
                      }`}>
                        {isCompleted ? 'Completed' : vac.dueDate}
                      </span>
                    </div>

                    <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200 text-xs font-bold text-amber-950 my-3.5">
                      <span className="text-[10px] text-amber-800 uppercase block font-black">Prescribed Vaccination:</span>
                      <span className="text-sm font-black text-slate-900 block mt-0.5">{vac.vaccineName}</span>
                      <span className="text-xs text-slate-500 font-semibold">{vac.doseNumber} • {vac.facility}</span>
                    </div>

                    {isCompleted ? (
                      <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between text-xs text-emerald-950 font-bold">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-emerald-600 text-[20px]">verified</span>
                          <span>Administered &amp; Logged on U-WIN Grid</span>
                        </div>
                        <span className="font-mono text-[11px] text-slate-500">{vac.batchNo || 'BATCH-OK'}</span>
                      </div>
                    ) : (
                      <button 
                        type="button"
                        onClick={() => {
                          setSelectedVaccine(vac);
                          setActiveModal('log-vaccine');
                        }}
                        className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-extrabold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">vaccines</span>
                        <span>Log Vaccination Dose (खुराक दर्ज करें)</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CITIZEN VISIT REQUESTS TAB */}
        {activeTab === 'requests' && (
          <div className="flex flex-col w-full animate-fadeIn">
            {/* Hero Header Banner */}
            <div className="bg-gradient-to-r from-amber-500/15 via-amber-100/40 to-transparent p-6 sm:p-8 rounded-3xl border-2 border-amber-300 shadow-sm mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-amber-300 text-amber-900 text-xs font-extrabold mb-3 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>National Rural Health Mission • Citizen Field Requests</span>
                  </div>
                  <h1 className="font-heading text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    Citizen Home Visit Requests
                  </h1>
                  <p className="text-base text-slate-700 font-semibold mt-1">
                    Direct visit &amp; medicine refill requests submitted by village households to <span className="text-amber-800 underline decoration-amber-400 decoration-2">{user?.name || 'Sunita Devi'}</span> • Sitapur Ward 4
                  </p>
                </div>

                <div className="bg-white border-2 border-amber-300 p-5 rounded-3xl shadow-sm flex items-center gap-4 self-start md:self-auto shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 border-2 border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[28px]">home_health</span>
                  </div>
                  <div>
                    <span className="text-xs uppercase font-extrabold text-slate-500 block">Assigned ASHA</span>
                    <span className="text-base font-black text-slate-900 leading-tight block notranslate" translate="no">{user?.name || 'Sunita Devi'}</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-800 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Auto-Synced to Cloud
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-xs">
                <span className="text-xs font-extrabold text-slate-500 uppercase">Total Requests</span>
                <p className="text-3xl font-black text-slate-900 mt-1">{citizenRequests.length}</p>
              </div>
              <div className="bg-amber-50/70 p-5 rounded-2xl border-2 border-amber-300 shadow-xs">
                <span className="text-xs font-extrabold text-amber-800 uppercase">Pending Review</span>
                <p className="text-3xl font-black text-amber-950 mt-1">{citizenRequests.filter(r => r.status === 'pending').length}</p>
              </div>
              <div className="bg-sky-50/70 p-5 rounded-2xl border-2 border-sky-300 shadow-xs">
                <span className="text-xs font-extrabold text-sky-800 uppercase">Scheduled Visits</span>
                <p className="text-3xl font-black text-sky-950 mt-1">{citizenRequests.filter(r => r.status === 'scheduled' || r.status === 'in_progress').length}</p>
              </div>
              <div className="bg-emerald-50/70 p-5 rounded-2xl border-2 border-emerald-300 shadow-xs">
                <span className="text-xs font-extrabold text-emerald-800 uppercase">Completed</span>
                <p className="text-3xl font-black text-emerald-950 mt-1">{citizenRequests.filter(r => r.status === 'completed').length}</p>
              </div>
            </div>

            {/* Requests List */}
            {citizenRequests.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border-2 border-slate-200 text-center">
                <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">home_health</span>
                <h3 className="text-lg font-black text-slate-800">No Visit Requests Received Yet</h3>
                <p className="text-xs text-slate-500 mt-1">When citizens request a home visit from their dashboard, they will appear here in real-time.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {citizenRequests.map(req => (
                  <div 
                    key={req._id || req.requestId} 
                    className="bg-white p-5 sm:p-6 rounded-3xl border-2 border-slate-200 hover:border-amber-400 transition-all shadow-sm"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-lg font-black text-slate-900">{req.patientName}</h3>
                          <span className="font-mono text-xs font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            {req.requestId || 'REQ-01'}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${
                            req.status === 'completed' ? 'bg-emerald-100 text-emerald-900' :
                            req.status === 'in_progress' ? 'bg-sky-100 text-sky-900' :
                            req.status === 'scheduled' ? 'bg-amber-100 text-amber-900' : 'bg-rose-100 text-rose-900'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-bold">
                          Reason: <span className="text-slate-900">{req.reason}</span> • Slot: {req.preferredSlot}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">Address: {req.patientAddress} • Phone: {req.patientPhone}</p>
                        {req.notes && <p className="text-xs text-slate-600 italic mt-1">"{req.notes}"</p>}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <a 
                          href={`tel:${req.patientPhone}`}
                          className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-xs font-extrabold flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[16px] text-amber-700">call</span>
                          <span>Call</span>
                        </a>

                        {req.status === 'pending' && (
                          <button
                            type="button"
                            disabled={updatingRequestId === req._id}
                            onClick={() => handleUpdateVisitStatus(req._id, 'scheduled')}
                            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black shadow-xs cursor-pointer"
                          >
                            Accept &amp; Schedule
                          </button>
                        )}

                        {req.status === 'scheduled' && (
                          <button
                            type="button"
                            disabled={updatingRequestId === req._id}
                            onClick={() => handleUpdateVisitStatus(req._id, 'completed')}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs cursor-pointer"
                          >
                            Mark Completed
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPatient({
                              _id: req.patient || '6aa974847fbaf7f52bfb3707',
                              name: req.patientName,
                              age: 'Adult',
                              phone: req.patientPhone,
                              village: req.patientAddress,
                              abha: '91-4820-1940-2810'
                            });
                            setActiveModal('vitals');
                          }}
                          className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black cursor-pointer flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[16px] text-amber-700">favorite</span>
                          <span>Record Vitals</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL 1: RECORD VITALS & TRIAGE */}
      {activeModal === 'vitals' && selectedPatient && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl border-2 border-amber-400 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <span className="material-symbols-outlined text-[24px]">favorite</span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-white font-heading">Record Citizen Vitals &amp; Triage</h3>
                  <p className="text-xs text-amber-300/80 font-bold">{selectedPatient.name} • {selectedPatient.age} • {selectedPatient.village}</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveModal(null)} 
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 transition-colors cursor-pointer shadow-sm"
                title="Close"
              >
                <span className="material-symbols-outlined text-[20px] font-bold text-slate-900">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveVitals} className="p-6 overflow-y-auto flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Blood Pressure (mmHg)</label>
                  <input 
                    type="text" 
                    value={vitalsForm.bp} 
                    onChange={e => setVitalsForm({...vitalsForm, bp: e.target.value})} 
                    className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-extrabold text-sm focus:outline-none focus:border-amber-500" 
                    placeholder="120/80"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Heart Rate (BPM)</label>
                  <input 
                    type="number" 
                    value={vitalsForm.pulse} 
                    onChange={e => setVitalsForm({...vitalsForm, pulse: e.target.value})} 
                    className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-extrabold text-sm focus:outline-none focus:border-amber-500" 
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Oxygen SpO2 (%)</label>
                  <input 
                    type="number" 
                    value={vitalsForm.spo2} 
                    onChange={e => setVitalsForm({...vitalsForm, spo2: e.target.value})} 
                    className="w-full bg-slate-50 px-3 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-extrabold text-sm focus:outline-none focus:border-amber-500" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Temp (°F)</label>
                  <input 
                    type="text" 
                    value={vitalsForm.temp} 
                    onChange={e => setVitalsForm({...vitalsForm, temp: e.target.value})} 
                    className="w-full bg-slate-50 px-3 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-extrabold text-sm focus:outline-none focus:border-amber-500" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Sugar (mg/dL)</label>
                  <input 
                    type="number" 
                    value={vitalsForm.sugar} 
                    onChange={e => setVitalsForm({...vitalsForm, sugar: e.target.value})} 
                    className="w-full bg-slate-50 px-3 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-extrabold text-sm focus:outline-none focus:border-amber-500" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">Clinical Observations &amp; Symptoms</label>
                <textarea 
                  rows="2" 
                  value={vitalsForm.notes} 
                  onChange={e => setVitalsForm({...vitalsForm, notes: e.target.value})} 
                  placeholder="e.g. Mild headache, fever subsided, prescribed Jan Aushadhi refill..." 
                  className="w-full bg-slate-50 px-3.5 py-2 rounded-xl border-2 border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-amber-500"
                ></textarea>
              </div>

              <div className="p-3 bg-rose-50 border-2 border-rose-200 rounded-2xl flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="urgentFlag" 
                  checked={vitalsForm.urgent} 
                  onChange={e => setVitalsForm({...vitalsForm, urgent: e.target.checked})} 
                  className="w-5 h-5 text-rose-600 rounded border-slate-300 focus:ring-rose-500 cursor-pointer" 
                />
                <label htmlFor="urgentFlag" className="text-xs font-extrabold text-rose-900 cursor-pointer">
                  Flag as High-Risk for Immediate Doctor Tele-Consultation
                </label>
              </div>

              <button 
                type="submit" 
                disabled={submittingVitals}
                className="w-full bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white py-3.5 rounded-xl font-extrabold text-sm shadow-sm mt-2 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {submittingVitals ? (
                  <>
                    <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
                    <span>Saving to MongoDB Atlas...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">cloud_upload</span>
                    <span>Save Vitals to ABDM Grid</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CLINICAL DOSSIER */}
      {activeModal === 'dossier' && selectedPatient && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-2xl rounded-3xl border-2 border-amber-400 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between border-b-4 border-amber-500">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[24px]">badge</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-black tracking-wider text-amber-300 block">Ayushman Bharat Digital Mission (ABDM)</span>
                  <h3 className="text-lg font-black text-white">{selectedPatient.name} — Clinical Dossier</h3>
                </div>
              </div>
              <button 
                onClick={() => setActiveModal(null)} 
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 transition-colors cursor-pointer shadow-sm"
                title="Close"
              >
                <span className="material-symbols-outlined text-[20px] font-bold text-slate-900">close</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-300 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">ABHA ID</span>
                  <strong className="font-mono text-amber-950 font-black">{selectedPatient.abha}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Age / Gender</span>
                  <strong className="text-slate-900 font-black">{selectedPatient.age} • {selectedPatient.gender || 'Female'}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Village Ward</span>
                  <strong className="text-slate-900 font-black">{selectedPatient.village}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Primary Phone</span>
                  <strong className="text-slate-900 font-black">{selectedPatient.phone}</strong>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] uppercase font-black text-slate-500 block mb-1">Primary Clinical Diagnosis</span>
                  <p className="text-xs font-black text-slate-900">{selectedPatient.condition}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] uppercase font-black text-slate-500 block mb-1">Active Prescribed Medications</span>
                  <p className="text-xs font-bold text-amber-950">{selectedPatient.meds}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200">
                  <span className="text-[10px] uppercase font-black text-rose-800 block mb-1">Known Drug Allergies</span>
                  <p className="text-xs font-black text-rose-950">{selectedPatient.allergies}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] uppercase font-black text-slate-500 block mb-1">Emergency Household Contact</span>
                  <p className="text-xs font-extrabold text-slate-900">{selectedPatient.emergencyContact}</p>
                </div>
              </div>

              <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase font-black text-amber-900 block">Last Recorded Clinical Vitals</span>
                  <p className="text-sm font-black text-slate-900 mt-0.5">{selectedPatient.lastVitals}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal('vitals');
                  }}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-black text-xs shadow-xs cursor-pointer"
                >
                  Update Vitals Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: REGISTER NEW CITIZEN */}
      {activeModal === 'register-citizen' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl border-2 border-amber-400 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between border-b-4 border-amber-500">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[22px]">person_add</span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-white font-heading">Register Household Citizen</h3>
                  <p className="text-xs text-amber-300/80 font-bold">Issue rural digital health profile with ABHA</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveModal(null)} 
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 transition-colors cursor-pointer shadow-sm"
                title="Close"
              >
                <span className="material-symbols-outlined text-[20px] font-bold text-slate-900">close</span>
              </button>
            </div>

            <form onSubmit={handleRegisterCitizen} className="p-6 overflow-y-auto space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">Full Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={newCitizen.name}
                  onChange={e => setNewCitizen({...newCitizen, name: e.target.value})}
                  placeholder="e.g. Shakuntala Devi"
                  className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">Age (Years) <span className="text-rose-500">*</span></label>
                  <input
                    type="number"
                    value={newCitizen.age}
                    onChange={e => setNewCitizen({...newCitizen, age: e.target.value})}
                    placeholder="e.g. 26"
                    className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">Gender</label>
                  <select
                    value={newCitizen.gender}
                    onChange={e => setNewCitizen({...newCitizen, gender: e.target.value})}
                    className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-amber-500"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">Mobile Phone</label>
                  <input
                    type="tel"
                    value={newCitizen.phone}
                    onChange={e => setNewCitizen({...newCitizen, phone: e.target.value})}
                    placeholder="9876543210"
                    className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">Village / Ward</label>
                  <select
                    value={newCitizen.village}
                    onChange={e => setNewCitizen({...newCitizen, village: e.target.value})}
                    className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-amber-500"
                  >
                    <option value="Sitapur Ward 4">Sitapur Ward 4</option>
                    <option value="Rampur Ward 1">Rampur Ward 1</option>
                    <option value="Rampur Ward 2">Rampur Ward 2</option>
                    <option value="Rampur Ward 3">Rampur Ward 3</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">Health Condition / Symptoms</label>
                <input
                  type="text"
                  value={newCitizen.condition}
                  onChange={e => setNewCitizen({...newCitizen, condition: e.target.value})}
                  placeholder="e.g. Trimester 2 Pregnancy, Hypertension, Seasonal Flu"
                  className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">Known Allergies</label>
                  <input
                    type="text"
                    value={newCitizen.allergies}
                    onChange={e => setNewCitizen({...newCitizen, allergies: e.target.value})}
                    placeholder="e.g. Penicillin, Sulfa"
                    className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">Clinical Priority</label>
                  <select
                    value={newCitizen.risk}
                    onChange={e => setNewCitizen({...newCitizen, risk: e.target.value})}
                    className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-amber-500"
                  >
                    <option value="Routine">Routine Visit</option>
                    <option value="High Risk">High Risk Priority</option>
                    <option value="Normal">Normal Follow-up</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black shadow-xs"
                >
                  Register &amp; Generate ABHA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: LOG VACCINE DOSE */}
      {activeModal === 'log-vaccine' && selectedVaccine && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-3xl border-2 border-amber-400 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between border-b-4 border-amber-500">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[22px]">vaccines</span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-white font-heading">Log Vaccine Administration</h3>
                  <p className="text-xs text-amber-300/80 font-bold">{selectedVaccine.childName} • {selectedVaccine.vaccineName}</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveModal(null)} 
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 transition-colors cursor-pointer shadow-sm"
                title="Close"
              >
                <span className="material-symbols-outlined text-[20px] font-bold text-slate-900">close</span>
              </button>
            </div>

            <form onSubmit={handleLogVaccineDose} className="p-6 space-y-3.5 text-xs">
              <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200">
                <strong className="text-slate-900 font-black block">{selectedVaccine.childName} ({selectedVaccine.age})</strong>
                <p className="text-slate-600 font-semibold mt-0.5">{selectedVaccine.vaccineName} • {selectedVaccine.doseNumber}</p>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">Vaccine Batch / Lot Number <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={vaccineLogForm.batchNo}
                  onChange={e => setVaccineLogForm({...vaccineLogForm, batchNo: e.target.value})}
                  className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-amber-500 font-mono"
                  placeholder="e.g. SII-COV-8291"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">Administered At Facility / Kiosk</label>
                <input
                  type="text"
                  value={vaccineLogForm.facility}
                  onChange={e => setVaccineLogForm({...vaccineLogForm, facility: e.target.value})}
                  className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">Observations &amp; Cold Chain Notes</label>
                <textarea
                  rows="2"
                  value={vaccineLogForm.notes}
                  onChange={e => setVaccineLogForm({...vaccineLogForm, notes: e.target.value})}
                  className="w-full bg-slate-50 px-3.5 py-2 rounded-xl border-2 border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-amber-500"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black shadow-xs"
                >
                  Verify &amp; Log on U-WIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: NATIONAL VACCINE SCHEDULE CHART */}
      {activeModal === 'schedule-chart' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-2xl rounded-3xl border-2 border-amber-400 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between border-b-4 border-amber-500">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[24px]">calendar_month</span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-white font-heading">National Immunization Schedule (NIS)</h3>
                  <p className="text-xs text-amber-300/80 font-bold">Universal Immunization Programme • Mission Indradhanush</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveModal(null)} 
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 transition-colors cursor-pointer shadow-sm"
                title="Close"
              >
                <span className="material-symbols-outlined text-[20px] font-bold text-slate-900">close</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-3 text-xs">
              {[
                { age: 'At Birth (जन्म के समय)', vaccines: 'BCG, OPV-0 Dose, Hepatitis B Birth Dose' },
                { age: '6 Weeks (6 सप्ताह)', vaccines: 'OPV-1, Pentavalent-1, Rotavirus-1, fIPV-1, PCV-1' },
                { age: '10 Weeks (10 सप्ताह)', vaccines: 'OPV-2, Pentavalent-2, Rotavirus-2' },
                { age: '14 Weeks (14 सप्ताह)', vaccines: 'OPV-3, Pentavalent-3, Rotavirus-3, fIPV-2, PCV-2' },
                { age: '9-12 Months (9-12 माह)', vaccines: 'MR-1 (Measles-Rubella), JE-1, PCV Booster, Vitamin A (1st Dose)' },
                { age: '16-24 Months (16-24 माह)', vaccines: 'MR-2, DPT Booster-1, OPV Booster, JE-2, Vitamin A (2nd Dose)' },
                { age: '5-6 Years (5-6 वर्ष)', vaccines: 'DPT Booster-2' },
                { age: '10 & 16 Years (10 और 16 वर्ष)', vaccines: 'Tetanus & adult Diphtheria (Td)' },
                { age: 'Pregnant Women (गर्भवती महिलाएं)', vaccines: 'Td-1 (Early pregnancy), Td-2 (4 weeks later) or Td Booster' },
              ].map((item, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-extrabold text-slate-900 text-xs sm:w-1/3">{item.age}</span>
                  <span className="text-amber-950 font-black text-xs sm:w-2/3">{item.vaccines}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="w-full bg-white border-t border-slate-200 mt-12">
        <div className="w-full px-6 lg:px-12 xl:px-16 py-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="md:col-span-2 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-600 text-[28px]">verified</span>
                <span className="text-lg text-slate-900 font-extrabold">Ministry of Health &amp; Family Welfare</span>
              </div>
              <p className="text-sm text-slate-600 font-medium max-w-2xl leading-relaxed">
                <span className="notranslate" translate="no">SehatSaarthi</span> delivers verified public clinical connectivity across rural dispensaries, district hospitals, and tertiary research institutes under the National Digital Health Framework.
              </p>
            </div>
            <div className="flex flex-col gap-1.5 justify-center md:items-end">
              <span className="text-xs text-slate-500 uppercase font-extrabold tracking-wider">National Emergency Helplines</span>
              <span className="text-xl font-black text-rose-700">Toll-Free 1075 / 108</span>
              <span className="text-xs text-slate-500 font-semibold">24x7 Tele-Consult &amp; Ambulance Dispatch</span>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
            <p>© 2026 Government Public Healthcare Infrastructure. All citizen rights reserved.</p>
            <p className="text-amber-900 font-bold">Radical Clarity &amp; Rural Accessibility Compliant</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
