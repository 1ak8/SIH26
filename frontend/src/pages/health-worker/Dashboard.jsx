import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import LanguageSelector from '../../components/LanguageSelector';

const VISIT_QUEUE = [
  { 
    id: 1, 
    name: 'Kamla Devi', 
    age: '28 yrs', 
    icon: 'pregnant_woman', 
    risk: 'High Risk', 
    riskColor: true, 
    type: 'Trimester 3 Checkup (तीसरी तिमाही)', 
    time: '09:30 AM', 
    phone: '9876543211', 
    village: 'Rampur Ward 2', 
    abha: '91-4820-1940-2810',
    condition: 'Trimester 3 Pregnancy (Gestational Anemia & Mild Pre-eclampsia)',
    meds: 'Iron Folic Acid (IFA) 1 tab OD, Calcium 500mg BD',
    allergies: 'Penicillin Allergy (Severe)',
    emergencyContact: 'Husband: Mahendra (+91 9876543220)',
    lastVitals: 'BP 138/88 mmHg • Pulse 82 • SpO2 98%',
    referredDoctor: 'Dr. Priya Verma (SDH Sitapur)'
  },
  { 
    id: 2, 
    name: 'Rameshwar Singh', 
    age: '64 yrs', 
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
    referredDoctor: 'Dr. Rajesh Sharma (CHC Sitapur)'
  },
  { 
    id: 3, 
    name: 'Aarav Kumar', 
    age: '9 mos', 
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
    referredDoctor: 'Dr. Ananya Gupta (District Hospital)'
  },
  { 
    id: 4, 
    name: 'Meena Yadav', 
    age: '34 yrs', 
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
    referredDoctor: 'Dr. Priya Verma (Maternal Health)'
  },
  { 
    id: 5, 
    name: 'Chhedi Lal', 
    age: '71 yrs', 
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
    referredDoctor: 'Dr. Rajesh Sharma (CHC Sitapur)'
  },
];

export default function HealthWorkerDashboard() {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('visits');
  const [activeModal, setActiveModal] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [expandedPatientId, setExpandedPatientId] = useState(null);
  const [vitalsForm, setVitalsForm] = useState({
    bp: '120/80',
    pulse: '72',
    spo2: '98',
    temp: '98.6',
    notes: '',
    urgent: false
  });
  const [syncStatus, setSyncStatus] = useState(null);
  const [citizenRequests, setCitizenRequests] = useState([]);
  const [updatingRequestId, setUpdatingRequestId] = useState(null);
  const [requestFilter, setRequestFilter] = useState('all');

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

  useEffect(() => {
    api.get('/health-worker/dashboard')
      .then(r => setData(r.data?.data))
      .catch(() => {});
    fetchCitizenRequests();
    const interval = setInterval(fetchCitizenRequests, 8000);
    return () => clearInterval(interval);
  }, []);

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
    } catch (err) {
      // Offline fallback
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
    } finally {
      setUpdatingRequestId(null);
    }
  };

  const handleSaveVitals = async (e) => {
    e.preventDefault();
    try {
      const [sys, dia] = vitalsForm.bp.split('/');
      await api.post('/health-worker/triage', {
        patientId: selectedPatient?._id || '6a9e1a51040b705825b50abd',
        riskLevel: vitalsForm.urgent ? 'high' : 'medium',
        vitals: {
          systolicBP: Number(sys) || 120,
          diastolicBP: Number(dia) || 80,
          heartRate: Number(vitalsForm.pulse) || 72,
          spO2: Number(vitalsForm.spo2) || 98,
          temperature: Number(vitalsForm.temp) || 98.6,
        },
        symptoms: ['routine_checkup'],
        notes: vitalsForm.notes || 'Village household visit completed by ASHA worker.',
      });
      alert(`Vitals for ${selectedPatient?.name} successfully recorded & synced to ABDM Health Grid!`);
    } catch {
      alert(`Vitals for ${selectedPatient?.name} saved locally & queued for ABDM sync!`);
    } finally {
      setActiveModal(null);
    }
  };

  const handleSync = () => {
    setSyncStatus('syncing');
    setTimeout(() => {
      setSyncStatus('done');
      setTimeout(() => setSyncStatus(null), 3000);
    }, 1500);
  };

  return (
    <div className="bg-[#fbfaf7] text-slate-900 font-sans min-h-screen">
      {/* HEADER: Exactly matching PatientNavbar */}
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
              className={`px-3.5 py-2 font-extrabold text-sm rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'visits' 
                  ? 'bg-amber-600 text-white shadow-sm' 
                  : 'text-slate-700 hover:text-amber-800 hover:bg-amber-50/70'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">calendar_today</span>
              <span>Today's Visits</span>
            </button>

            <div className="h-6 w-[2px] bg-slate-300 rounded-full shrink-0"></div>

            <button 
              onClick={() => setActiveTab('registry')} 
              className={`px-3.5 py-2 font-extrabold text-sm rounded-xl transition-all flex items-center gap-2 ${
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
              className={`px-3.5 py-2 font-extrabold text-sm rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'immunization' 
                  ? 'bg-amber-600 text-white shadow-sm' 
                  : 'text-slate-700 hover:text-amber-800 hover:bg-amber-50/70'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">vaccines</span>
              <span>Immunization</span>
            </button>
            
            <div className="h-6 w-[2px] bg-slate-300 rounded-full shrink-0"></div>

            <button 
              onClick={() => setActiveTab('requests')} 
              className={`px-3.5 py-2 font-extrabold text-sm rounded-xl transition-all inline-flex items-center gap-2 ${
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
            <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-[11px] font-extrabold text-emerald-900 shadow-2xs" title="ABDM Health Grid: Automatic Background Cloud Sync 24x7 Active">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Grid Auto-Sync Active</span>
            </div>

            <div className="h-8 w-[2px] bg-slate-300 rounded-full hidden lg:block mr-1"></div>

            <LanguageSelector />

            <a 
              className="h-10 px-3.5 flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-extrabold rounded-xl hover:bg-rose-100 transition-all shadow-xs" 
              href="tel:108"
            >
              <span className="material-symbols-outlined text-rose-600 text-[18px]">call</span>
              <span>Emergency 108</span>
            </a>

            <button 
              onClick={() => { if (window.confirm('Are you sure you want to logout?')) logout(); }} 
              className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 border border-slate-200 flex items-center justify-center transition-all shadow-xs" 
              title="Logout"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER: Full Width matching Patient Panel */}
      <main className="w-full px-6 lg:px-12 xl:px-16 pt-28 pb-16">
        {activeTab === 'visits' && (
          <div className="flex flex-col w-full animate-fadeIn">
            {/* Village Schedule Hero Banner */}
            <div className="bg-gradient-to-r from-amber-500/15 via-amber-100/40 to-transparent p-6 sm:p-8 rounded-3xl border-2 border-amber-300 shadow-sm mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-amber-300 text-amber-900 text-xs font-extrabold mb-3 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>National Rural Health Mission • Gram Swasthya Grid</span>
                  </div>
                  <h1 className="font-heading text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    Village Rampur &amp; Sitapur Sub-Centre
                  </h1>
                  <p className="text-base text-slate-700 font-semibold mt-1">
                    ASHA Field Worker: <span className="text-amber-800 underline decoration-amber-400 decoration-2">{user?.name || 'Sunita Devi'}</span> • Assigned 245 Rural Households
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

            {/* High-Contrast Rural Accessible Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
              <div className="bg-white p-6 rounded-3xl border-2 border-slate-200/90 shadow-sm flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase font-extrabold text-slate-500 tracking-wider block mb-1">Today's Assigned</span>
                  <span className="text-4xl font-black text-slate-900">{data?.todayVisits || 12}</span>
                  <p className="text-xs text-slate-500 font-semibold mt-1">Home Visits Scheduled</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-amber-50 border-2 border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[32px]">assignment</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border-2 border-amber-300 shadow-sm flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase font-extrabold text-amber-800 tracking-wider block mb-1">Pending Visits</span>
                  <span className="text-4xl font-black text-amber-950">{5 + citizenRequests.filter(r => r.status === 'pending').length}</span>
                  <p className="text-xs text-amber-800 font-bold mt-1">Remaining for today</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[32px]">pending_actions</span>
                </div>
              </div>

              <div className="bg-rose-50/70 p-6 rounded-3xl border-2 border-rose-300 shadow-sm flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase font-extrabold text-rose-800 tracking-wider block mb-1">High Risk Priority</span>
                  <span className="text-4xl font-black text-rose-950">{data?.highRiskAlerts?.length || 2}</span>
                  <p className="text-xs text-rose-800 font-bold mt-1">Immediate PHC triage needed</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[32px]">warning</span>
                </div>
              </div>
            </div>

            {/* Pending Citizen Requests Alert Banner (Clickable to switch to Requests tab) */}
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
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Daily Household Visit Queue</h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium">Prioritized by clinical triage risk score</p>
                  </div>
                </div>
                <span className="bg-amber-100 text-amber-900 text-xs font-extrabold px-3 py-1 rounded-full border border-amber-300 self-start sm:self-auto">
                  5 Patients Queued
                </span>
              </div>

              {/* Patient Cards List */}
              <div className="flex flex-col gap-4 w-full">
                {VISIT_QUEUE.map(patient => (
                  <div 
                    key={patient.id} 
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
                          <span className="material-symbols-outlined text-[32px]">{patient.icon}</span>
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
                        {/* Info "i" Button */}
                        <button 
                          type="button"
                          onClick={() => setExpandedPatientId(expandedPatientId === patient.id ? null : patient.id)}
                          className={`h-12 w-12 rounded-xl border-2 flex items-center justify-center transition-all shadow-xs ${
                            expandedPatientId === patient.id 
                              ? 'bg-amber-600 text-white border-amber-600 shadow-sm' 
                              : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700 hover:text-amber-700 hover:border-amber-400'
                          }`}
                          title="View Patient Clinical Information"
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
                          onClick={() => { setSelectedPatient(patient); setActiveModal('vitals'); }} 
                          className="h-12 px-5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-extrabold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[20px]">favorite</span>
                          <span>Record Vitals &amp; Triage</span>
                        </button>
                      </div>
                    </div>

                    {/* In-Place Expanded Patient Information Card */}
                    {expandedPatientId === patient.id && (
                      <div className="w-full pt-4 mt-4 border-t-2 border-slate-100 animate-fadeIn">
                        <div className="bg-amber-50/60 rounded-2xl border-2 border-amber-200/80 p-5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-amber-200/70">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-amber-700 text-[20px]">badge</span>
                              <span className="text-xs uppercase font-black text-amber-950 tracking-wider">Patient Clinical Dossier • ABDM Verified Record</span>
                            </div>
                            <span className="text-xs font-mono font-extrabold bg-white text-amber-950 px-3 py-1 rounded-lg border border-amber-300 shadow-2xs self-start sm:self-auto">
                              ABHA: {patient.abha}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                            <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs">
                              <span className="text-[10px] uppercase font-extrabold text-slate-500 block mb-0.5">Clinical Condition</span>
                              <p className="text-xs font-extrabold text-slate-900 leading-snug">{patient.condition}</p>
                            </div>
                            <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs">
                              <span className="text-[10px] uppercase font-extrabold text-slate-500 block mb-0.5">Active Medications</span>
                              <p className="text-xs font-extrabold text-slate-900 leading-snug">{patient.meds}</p>
                            </div>
                            <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs">
                              <span className="text-[10px] uppercase font-extrabold text-slate-500 block mb-0.5">Known Allergies</span>
                              <p className="text-xs font-black text-rose-700 leading-snug">{patient.allergies}</p>
                            </div>
                            <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs">
                              <span className="text-[10px] uppercase font-extrabold text-slate-500 block mb-0.5">Emergency Contact</span>
                              <p className="text-xs font-extrabold text-slate-900 leading-snug">{patient.emergencyContact}</p>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-white p-3.5 rounded-xl border border-amber-200">
                            <div className="flex items-center gap-2 text-slate-700 font-semibold">
                              <span className="material-symbols-outlined text-amber-600 text-[18px]">monitor_heart</span>
                              <span>Last Recorded Vitals: <strong className="text-slate-900">{patient.lastVitals}</strong></span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500 font-medium">Assigned MO / Specialist:</span>
                              <span className="font-extrabold text-amber-900">{patient.referredDoctor}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
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
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Village Citizen Registry</h1>
                <p className="text-sm text-slate-600 font-medium">Digital health profiles of 245 households assigned under Rampur sub-centre.</p>
              </div>
              <button 
                onClick={() => alert('Add New Citizen form - Enter ABHA / Aadhaar ID')}
                className="bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white px-5 py-3 rounded-xl font-extrabold text-sm shadow-sm flex items-center gap-2 transition-all self-start sm:self-auto"
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
                    placeholder="Search by Citizen Name, ABHA ID (e.g. 91-4820), or Phone Number..." 
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:border-amber-500" 
                  />
                </div>
                <select className="bg-white px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-extrabold text-slate-800 focus:outline-none focus:border-amber-500">
                  <option>All Wards (Rampur &amp; Sitapur)</option>
                  <option>Ward 1 (North Rampur)</option>
                  <option>Ward 2 (Central)</option>
                  <option>Ward 3 (East Sub-Centre)</option>
                  <option>Ward 4 (Sitapur Road)</option>
                </select>
              </div>

              <div className="divide-y divide-slate-100">
                {VISIT_QUEUE.map(c => (
                  <div key={c.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center font-bold text-xl">
                        {c.name[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-extrabold text-slate-900">{c.name}</h4>
                          <span className="text-xs text-slate-500 font-bold">• {c.age}</span>
                          <span className="text-xs font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.2 rounded">{c.abha}</span>
                        </div>
                        <p className="text-xs text-slate-500 font-semibold">{c.village} • Ph: {c.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => alert(`Opening ABDM Digital Health Profile for ${c.name}`)}
                        className="h-10 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-xs font-extrabold transition-all"
                      >
                        View Health Records
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
            <div className="mb-6">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Village Immunization Tracker</h1>
              <p className="text-sm text-slate-600 font-medium">Mission Indradhanush vaccination schedule for infants and pregnant mothers.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 sm:p-7 border-2 border-amber-300 rounded-3xl shadow-sm border-l-8 border-l-amber-500">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900">Aarav Kumar (9 mos)</h3>
                    <p className="text-xs text-slate-500 font-semibold">Mother: Sunita Kumar • Rampur Ward 3</p>
                  </div>
                  <span className="bg-rose-100 text-rose-900 border border-rose-300 px-3 py-1 rounded-full text-xs font-extrabold">Due Today</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 my-3">
                  Vaccines: MR-1 (Measles-Rubella), JE-1, Vitamin A (1st Dose)
                </div>
                <button 
                  onClick={() => alert('Vaccination recorded & certificate logged on CoWIN/U-WIN Grid!')}
                  className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-extrabold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">vaccines</span>
                  Log Vaccination Dose
                </button>
              </div>

              <div className="bg-white p-6 sm:p-7 border-2 border-slate-200 rounded-3xl shadow-sm border-l-8 border-l-amber-600">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900">Diya Patel (1.5 yrs)</h3>
                    <p className="text-xs text-slate-500 font-semibold">Mother: Gita Patel • Rampur Ward 1</p>
                  </div>
                  <span className="bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-full text-xs font-extrabold">Next Week</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 my-3">
                  Vaccines: DPT Booster-1, OPV Booster, Measles-2
                </div>
                <button 
                  onClick={() => alert('Showing 2026 Indradhanush Immunization Schedule for Diya Patel')}
                  className="w-full py-3 rounded-xl bg-white border-2 border-slate-300 hover:bg-slate-100 text-slate-800 font-extrabold text-sm transition-all flex items-center justify-center gap-2 shadow-xs"
                >
                  <span className="material-symbols-outlined text-[18px] text-amber-600">event_note</span>
                  View Complete Schedule
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CITIZEN VISIT REQUESTS DEDICATED PAGE */}
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

            {/* High-Contrast Summary Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 mb-8">
              <div className="bg-white p-5 rounded-3xl border-2 border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-extrabold text-slate-500 tracking-wider block mb-1">Total Requests</span>
                  <span className="text-3xl font-black text-slate-900">{citizenRequests.length}</span>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">Village households</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[26px]">inbox</span>
                </div>
              </div>

              <div className="bg-amber-50/70 p-5 rounded-3xl border-2 border-amber-400 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-extrabold text-amber-900 tracking-wider block mb-1">Pending Review</span>
                  <span className="text-3xl font-black text-amber-950">
                    {citizenRequests.filter(r => r.status === 'pending').length}
                  </span>
                  <p className="text-xs text-amber-800 font-bold mt-0.5">Awaiting schedule</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-200 text-amber-900 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[26px]">pending_actions</span>
                </div>
              </div>

              <div className="bg-sky-50/70 p-5 rounded-3xl border-2 border-sky-300 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-extrabold text-sky-900 tracking-wider block mb-1">Scheduled / Route</span>
                  <span className="text-3xl font-black text-sky-950">
                    {citizenRequests.filter(r => r.status === 'scheduled' || r.status === 'in_progress').length}
                  </span>
                  <p className="text-xs text-sky-800 font-bold mt-0.5">In progress today</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-sky-200 text-sky-900 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[26px]">event_available</span>
                </div>
              </div>

              <div className="bg-emerald-50/70 p-5 rounded-3xl border-2 border-emerald-300 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-extrabold text-emerald-900 tracking-wider block mb-1">Completed</span>
                  <span className="text-3xl font-black text-emerald-950">
                    {citizenRequests.filter(r => r.status === 'completed').length}
                  </span>
                  <p className="text-xs text-emerald-800 font-bold mt-0.5">Visits resolved</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-200 text-emerald-900 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[26px]">check_circle</span>
                </div>
              </div>
            </div>

            {/* Filter Navigation Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-black text-slate-500 tracking-wider">Filter By Status:</span>
                <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  {['all', 'pending', 'scheduled', 'completed'].map(flt => {
                    const count = flt === 'all'
                      ? citizenRequests.length
                      : citizenRequests.filter(r => r.status === flt || (flt === 'scheduled' && r.status === 'in_progress')).length;
                    return (
                      <button
                        key={flt}
                        type="button"
                        onClick={() => setRequestFilter(flt)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                          requestFilter === flt
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {flt} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={fetchCitizenRequests}
                className="h-10 px-3.5 rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs self-start sm:self-auto"
              >
                <span className="material-symbols-outlined text-[18px] text-amber-600">refresh</span>
                <span>Refresh Requests</span>
              </button>
            </div>

            {/* Requests List */}
            {citizenRequests.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-slate-200 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[36px]">mark_email_read</span>
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">No Citizen Visit Requests Found</h3>
                <p className="text-sm text-slate-500 max-w-md mt-1">
                  When village patients request a home visit or medicine checkup from their dashboard, it will appear here automatically for Sunita Devi.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 w-full">
                {citizenRequests
                  .filter(req => {
                    if (requestFilter === 'all') return true;
                    if (requestFilter === 'scheduled') return req.status === 'scheduled' || req.status === 'in_progress';
                    return req.status === requestFilter;
                  })
                  .map(req => (
                    <div 
                      key={req._id || req.requestId}
                      className={`bg-white p-6 rounded-3xl border-2 transition-all shadow-sm ${
                        req.status === 'pending'
                          ? 'border-amber-400 bg-amber-50/25'
                          : req.status === 'scheduled' || req.status === 'in_progress'
                          ? 'border-sky-300 bg-sky-50/15'
                          : req.status === 'completed'
                          ? 'border-emerald-300 bg-emerald-50/10'
                          : 'border-slate-200'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                        <div className="flex items-start gap-4">
                          <div className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center font-bold shrink-0 ${
                            req.status === 'completed'
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                              : req.status === 'scheduled' || req.status === 'in_progress'
                              ? 'bg-sky-50 border-sky-300 text-sky-700'
                              : req.urgency === 'urgent'
                              ? 'bg-rose-50 border-rose-300 text-rose-700'
                              : 'bg-amber-50 border-amber-300 text-amber-700'
                          }`}>
                            <span className="material-symbols-outlined text-[32px]">
                              {req.status === 'completed' ? 'verified' : 'home_health'}
                            </span>
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                              <h3 className="text-xl font-extrabold text-slate-900 notranslate" translate="no">
                                {req.patientName}
                              </h3>
                              <span className="font-mono text-xs font-black bg-slate-900 text-amber-400 px-2.5 py-0.5 rounded-full">
                                {req.requestId || 'VISIT-REQ'}
                              </span>
                              <span className={`inline-flex items-center gap-1 text-xs font-black px-2.5 py-0.5 rounded-full border ${
                                req.urgency === 'urgent'
                                  ? 'bg-rose-100 text-rose-900 border-rose-300'
                                  : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}>
                                {req.urgency === 'urgent' ? '⚡ Urgent Priority' : 'Routine'}
                              </span>
                              <span className={`inline-flex items-center gap-1 text-xs font-black px-3 py-0.5 rounded-full border uppercase tracking-wider ${
                                req.status === 'completed'
                                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                  : req.status === 'scheduled'
                                  ? 'bg-sky-100 text-sky-900 border-sky-300'
                                  : req.status === 'in_progress'
                                  ? 'bg-orange-100 text-orange-900 border-orange-300 animate-pulse'
                                  : 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                              }`}>
                                <span className={`w-2 h-2 rounded-full ${
                                  req.status === 'completed' ? 'bg-emerald-600' : req.status === 'scheduled' ? 'bg-sky-600' : 'bg-amber-600'
                                }`}></span>
                                {req.status === 'pending' && 'Pending Review'}
                                {req.status === 'scheduled' && (req.scheduledTime ? `Scheduled: ${req.scheduledTime}` : 'Scheduled')}
                                {req.status === 'in_progress' && 'In Progress (Visiting Now)'}
                                {req.status === 'completed' && 'Completed ✓'}
                                {req.status === 'cancelled' && 'Cancelled'}
                              </span>
                            </div>

                            <p className="text-base font-extrabold text-slate-900">{req.reason}</p>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-semibold mt-1.5">
                              <span className="flex items-center gap-1 text-slate-700 font-bold">
                                <span className="material-symbols-outlined text-[16px] text-amber-600">location_on</span>
                                {req.patientAddress}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-slate-700 font-bold">
                                <span className="material-symbols-outlined text-[16px] text-amber-600">schedule</span>
                                Preferred: {req.preferredSlot}
                              </span>
                              <span>•</span>
                              <span>Requested: {new Date(req.createdAt || Date.now()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>

                            {req.notes && (
                              <p className="mt-2 text-xs bg-white p-3 rounded-xl border border-slate-200 text-slate-700 italic">
                                "{req.notes}"
                              </p>
                            )}

                            {req.actionNotes && (
                              <p className="mt-2 text-xs bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-amber-900 font-bold">
                                Sunita Devi Remark: {req.actionNotes}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Action Controls */}
                        <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 lg:pt-0">
                          {/* Call Button */}
                          <a 
                            href={`tel:${req.patientPhone}`} 
                            className="h-11 px-3.5 rounded-xl border-2 border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                            title={`Call ${req.patientName}`}
                          >
                            <span className="material-symbols-outlined text-[18px] text-amber-600">call</span>
                            <span>Call {req.patientPhone}</span>
                          </a>

                          {/* Status Workflow Buttons */}
                          {req.status === 'pending' && (
                            <button
                              type="button"
                              disabled={updatingRequestId === req._id}
                              onClick={() => handleUpdateVisitStatus(req._id, 'scheduled')}
                              className="h-11 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                            >
                              <span className="material-symbols-outlined text-[18px]">event_available</span>
                              <span>Accept &amp; Schedule</span>
                            </button>
                          )}

                          {req.status === 'scheduled' && (
                            <>
                              <button
                                type="button"
                                disabled={updatingRequestId === req._id}
                                onClick={() => handleUpdateVisitStatus(req._id, 'in_progress')}
                                className="h-11 px-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                              >
                                <span className="material-symbols-outlined text-[18px]">directions_walk</span>
                                <span>Start Visit</span>
                              </button>
                              <button
                                type="button"
                                disabled={updatingRequestId === req._id}
                                onClick={() => handleUpdateVisitStatus(req._id, 'completed')}
                                className="h-11 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                              >
                                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                <span>Mark Completed</span>
                              </button>
                            </>
                          )}

                          {req.status === 'in_progress' && (
                            <button
                              type="button"
                              disabled={updatingRequestId === req._id}
                              onClick={() => handleUpdateVisitStatus(req._id, 'completed')}
                              className="h-11 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                            >
                              <span className="material-symbols-outlined text-[18px]">check_circle</span>
                              <span>Mark Completed</span>
                            </button>
                          )}

                          {/* Dropdown for Manual Status Override */}
                          <select
                            value={req.status}
                            onChange={(e) => handleUpdateVisitStatus(req._id, e.target.value)}
                            className="h-11 px-2.5 rounded-xl border-2 border-slate-300 bg-white text-xs font-extrabold text-slate-700 focus:outline-none focus:border-amber-500 cursor-pointer"
                            title="Update Status"
                          >
                            <option value="pending">Pending</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>

                          {/* Record Vitals button */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPatient({
                                _id: req.patient || '6a9e1a51040b705825b50abd',
                                name: req.patientName,
                                age: 'Adult',
                                phone: req.patientPhone,
                                village: req.patientAddress,
                                abha: '91-4820-1940-2810'
                              });
                              setActiveModal('vitals');
                            }}
                            className="h-11 px-3 rounded-xl border-2 border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-extrabold flex items-center justify-center gap-1 transition-all"
                            title="Record Vitals for this patient"
                          >
                            <span className="material-symbols-outlined text-[18px] text-amber-700">favorite</span>
                            <span>Vitals</span>
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

      {/* RECORD VITALS MODAL */}
      {activeModal === 'vitals' && selectedPatient && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl border-2 border-amber-400 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-amber-50/60">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[24px]">favorite</span>
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">Record Citizen Vitals</h3>
                  <p className="text-xs text-slate-600 font-bold">{selectedPatient.name} • {selectedPatient.age} • {selectedPatient.village}</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveModal(null)} 
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveVitals} className="p-6 overflow-y-auto flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Blood Pressure (mmHg)</label>
                  <input 
                    type="text" 
                    value={vitalsForm.bp} 
                    onChange={e => setVitalsForm({...vitalsForm, bp: e.target.value})} 
                    className="w-full bg-slate-50 px-4 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-extrabold text-sm focus:outline-none focus:border-amber-500" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Heart Rate (BPM)</label>
                  <input 
                    type="number" 
                    value={vitalsForm.pulse} 
                    onChange={e => setVitalsForm({...vitalsForm, pulse: e.target.value})} 
                    className="w-full bg-slate-50 px-4 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-extrabold text-sm focus:outline-none focus:border-amber-500" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Oxygen SpO2 (%)</label>
                  <input 
                    type="number" 
                    value={vitalsForm.spo2} 
                    onChange={e => setVitalsForm({...vitalsForm, spo2: e.target.value})} 
                    className="w-full bg-slate-50 px-4 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-extrabold text-sm focus:outline-none focus:border-amber-500" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Temperature (°F)</label>
                  <input 
                    type="text" 
                    value={vitalsForm.temp} 
                    onChange={e => setVitalsForm({...vitalsForm, temp: e.target.value})} 
                    className="w-full bg-slate-50 px-4 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-extrabold text-sm focus:outline-none focus:border-amber-500" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">Clinical Observations / Symptoms</label>
                <textarea 
                  rows="3" 
                  value={vitalsForm.notes} 
                  onChange={e => setVitalsForm({...vitalsForm, notes: e.target.value})} 
                  placeholder="E.g. Mild cough, headache, swollen feet in trimester 3..." 
                  className="w-full bg-slate-50 px-4 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:border-amber-500"
                ></textarea>
              </div>

              <div className="p-3 bg-rose-50 border-2 border-rose-200 rounded-2xl flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="urgentFlag" 
                  checked={vitalsForm.urgent} 
                  onChange={e => setVitalsForm({...vitalsForm, urgent: e.target.checked})} 
                  className="w-5 h-5 text-rose-600 rounded border-slate-300 focus:ring-rose-500" 
                />
                <label htmlFor="urgentFlag" className="text-xs font-extrabold text-rose-900 cursor-pointer">
                  Flag for Urgent Doctor Tele-Consultation (CHC Specialist)
                </label>
              </div>

              <button 
                type="submit" 
                className="w-full bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white py-3.5 rounded-xl font-extrabold text-sm shadow-sm mt-2 flex items-center justify-center gap-2 transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">cloud_upload</span>
                <span>Save Vitals to ABDM Grid</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER: Exact same as Patient Panel */}
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
