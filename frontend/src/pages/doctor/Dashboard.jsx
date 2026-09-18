import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import DoctorNavbar from '../../components/DoctorNavbar';

const QUEUE_DATA = [
  { 
    _id: '6aa9748a7fbaf7f52bfb3735',
    id: 4, 
    name: 'Aditya Verma', 
    age: '32 yrs', 
    gender: 'Male', 
    location: 'Rampur Sub-Centre', 
    status: 'IN CONSULTATION', 
    asha: 'Sunita Devi',
    vitals: 'BP 120/80 • Pulse 74 • SpO2 98% • Temp 98.6°F',
    symptoms: 'Mild fever, dry cough x 2 days, chest clear on tele-auscultation.',
    abha: '91-4820-1940-2810'
  },
  { 
    _id: '6aa9748a7fbaf7f52bfb3737',
    id: 5, 
    name: 'Savitri Devi', 
    age: '54 yrs', 
    gender: 'Female', 
    location: 'Bilaspur PHC', 
    status: 'Next in Line', 
    asha: 'Kiran Bala',
    vitals: 'BP 148/92 • Pulse 78 • Sugar Fasting 168 mg/dL',
    symptoms: 'Type-2 Diabetes & Hypertension routine review, dizziness.',
    abha: '91-2311-9041-5512'
  },
  { 
    _id: '6aa9748a7fbaf7f52bfb3733',
    id: 6, 
    name: 'Bharat Patel', 
    age: '41 yrs', 
    gender: 'Male', 
    location: 'Dholpur SC', 
    status: 'Waiting', 
    asha: 'Sunita Devi',
    vitals: 'BP 126/82 • Pulse 70 • SpO2 99%',
    symptoms: 'Gastric discomfort, acidity, follow-up on antacid medication.',
    abha: '91-8832-1002-3921'
  },
  { 
    _id: '6aa9748b7fbaf7f52bfb3739',
    id: 7, 
    name: 'Pooja Kumari', 
    age: '22 yrs', 
    gender: 'Female', 
    location: 'Rampur Sub-Centre', 
    status: 'Waiting', 
    asha: 'Sunita Devi',
    vitals: 'BP 110/70 • Pulse 80 • SpO2 98%',
    symptoms: 'Trimester 2 routine checkup, Hb check advised.',
    abha: '91-3490-1122-8761'
  },
];

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [sessionSeconds, setSessionSeconds] = useState(7163);
  const [expandedPatientId, setExpandedPatientId] = useState(null);
  const [queue, setQueue] = useState(QUEUE_DATA);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [activeConsultation, setActiveConsultation] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchDashboard = () => {
    api.get('/doctor/dashboard').then(r => setData(r.data?.data)).catch(() => {});
    api.get('/doctor/queue')
      .then(r => {
        if (r.data?.data?.length > 0) {
          setQueue(r.data.data);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (item, newStatus) => {
    const appointmentId = item._id || item.id;
    setActionLoadingId(appointmentId);

    if (newStatus === 'completed') {
      // Remove from active queue immediately
      setQueue(prev => prev.filter(a => {
        const match = (a._id && a._id === appointmentId) || (a.id && a.id === appointmentId);
        return !match;
      }));

      // Increment completed counter
      setData(prev => ({
        ...prev,
        completedToday: (prev?.completedToday || 19) + 1,
      }));

      // Save to Doctor Consultation History cache immediately
      const historyItem = {
        _id: appointmentId,
        id: `SEHAT-${Math.floor(1000 + Math.random() * 9000)}`,
        patient: `${item.name || item.patient?.name || 'Citizen'} (${item.age || '32 yrs'}/${item.gender ? item.gender.charAt(0).toUpperCase() : 'M'})`,
        patientName: item.name || item.patient?.name || 'Citizen',
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
        diagnosis: item.symptoms || item.reason || 'General Tele-Consultation Completed',
        type: 'Tele-Consult',
        facility: item.location || 'CHC Sitapur Central',
        abha: item.abha || '91-4820-1940-2810',
        medicines: [],
        clinicalNotes: 'Consultation concluded by doctor. Patient advised routine care.',
        isDigitallySigned: true,
        createdAt: new Date().toISOString(),
      };

      try {
        const existing = JSON.parse(localStorage.getItem('sehatsaarthi_doctor_history') || '[]');
        localStorage.setItem('sehatsaarthi_doctor_history', JSON.stringify([historyItem, ...existing]));
      } catch(e) {}

      showToast(`Consultation for ${item.name || item.patient?.name} completed & moved to History!`);
    } else {
      // Update in-consultation status
      setQueue(prev => prev.map(a => {
        const match = (a._id && a._id === appointmentId) || (a.id && a.id === appointmentId);
        if (match) {
          return {
            ...a,
            status: 'IN CONSULTATION',
            rawStatus: 'in_consultation',
          };
        }
        return a;
      }));

      if (newStatus === 'in_consultation') {
        setActiveConsultation(item);
        showToast(`Tele-Consultation started with ${item.name || item.patient?.name}! Connected to Kiosk.`);
      }
    }

    try {
      await api.put(`/doctor/queue/${appointmentId}/status`, { status: newStatus });
      fetchDashboard();
    } catch (err) {
      console.warn('Updated locally:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => setSessionSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (s) => {
    const hrs = String(Math.floor(s / 3600)).padStart(2, '0');
    const mins = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const secs = String(s % 60).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  return (
    <div className="bg-[#fbfaf7] text-slate-900 font-sans min-h-screen">
      <DoctorNavbar />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-[120] bg-slate-900 text-amber-300 px-5 py-3 rounded-2xl shadow-xl border border-amber-400/50 flex items-center gap-3 text-sm font-bold animate-bounce">
          <span className="material-symbols-outlined text-amber-400">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="w-full px-6 lg:px-12 xl:px-16 pt-28 pb-16">
        {/* Live OPD Console Header Banner */}
        <div className="bg-gradient-to-r from-amber-500/15 via-amber-100/40 to-transparent p-6 sm:p-8 rounded-3xl border-2 border-amber-300 shadow-sm mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-amber-300 text-amber-900 text-xs font-extrabold mb-3 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>National Tele-Consultation Mission • E-Sanjeevani Grid</span>
              </div>
              <h1 className="font-heading text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Tele-OPD Doctor Console
              </h1>
              <p className="text-base text-slate-700 font-semibold mt-1">
                Attending Specialist: <span className="text-amber-800 underline decoration-amber-400 decoration-2 notranslate" translate="no">{user?.name || 'Dr. Rajesh Sharma, MD'}</span> • CHC Sitapur Central
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3.5 shrink-0 self-start lg:self-auto">
              <div className="bg-white border-2 border-amber-300 px-4 py-3 rounded-2xl shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">timer</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider">Live OPD Time</span>
                  <span className="text-lg font-black text-slate-900 font-mono leading-tight">{formatTime(sessionSeconds)}</span>
                </div>
              </div>

              <div className="bg-white border-2 border-emerald-400 px-4 py-3 rounded-2xl shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-emerald-800 uppercase font-black tracking-wider">Completed Today</span>
                  <span className="text-lg font-black text-emerald-950 leading-tight">{data?.completedToday || 19} Patients</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 High-Contrast Clinical Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <Link 
            to="/doctor/queue"
            className="bg-white p-6 rounded-3xl border-2 border-amber-300 hover:border-amber-500 shadow-sm flex items-center justify-between gap-4 transition-all group"
          >
            <div>
              <span className="text-xs uppercase font-extrabold text-amber-800 tracking-wider block mb-1">Live Queue Waiting</span>
              <span className="text-4xl font-black text-amber-950">{queue.filter(a => a.status !== 'completed' && a.status !== 'Completed' && a.rawStatus !== 'completed').length}</span>
              <p className="text-xs text-amber-800 font-bold mt-1">Ready for consultation</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border-2 border-amber-200 text-amber-700 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-all">
              <span className="material-symbols-outlined text-[32px]">reduce_capacity</span>
            </div>
          </Link>

          <Link 
            to="/doctor/labs"
            className="bg-white p-6 rounded-3xl border-2 border-slate-200/90 hover:border-amber-400 shadow-sm flex items-center justify-between gap-4 transition-all group"
          >
            <div>
              <span className="text-xs uppercase font-extrabold text-slate-500 tracking-wider block mb-1">Diagnostic Labs</span>
              <span className="text-4xl font-black text-slate-900">3</span>
              <p className="text-xs text-slate-500 font-semibold mt-1">Pending lab reports</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-sky-50 border-2 border-sky-200 text-sky-700 flex items-center justify-center shrink-0 group-hover:bg-sky-500 group-hover:text-white transition-all">
              <span className="material-symbols-outlined text-[32px]">science</span>
            </div>
          </Link>

          <Link 
            to="/doctor/prescriptions"
            className="bg-white p-6 rounded-3xl border-2 border-slate-200/90 hover:border-amber-400 shadow-sm flex items-center justify-between gap-4 transition-all group"
          >
            <div>
              <span className="text-xs uppercase font-extrabold text-slate-500 tracking-wider block mb-1">Digital Prescriptions</span>
              <span className="text-4xl font-black text-slate-900">{data?.prescriptionsToday || 3}</span>
              <p className="text-xs text-slate-500 font-semibold mt-1">Signed via Jan Aushadhi</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-emerald-800 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <span className="material-symbols-outlined text-[32px]">medication</span>
            </div>
          </Link>
        </div>

        {/* Upcoming Consultations Queue List */}
        <section className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-sm shrink-0">
                <span className="material-symbols-outlined text-[22px]">video_camera_front</span>
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Active Tele-Consultations Queue</h2>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">Patients connected from rural sub-centres with assigned ASHA workers</p>
              </div>
            </div>
            <Link 
              to="/doctor/queue"
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-800 bg-amber-100 hover:bg-amber-200 px-3.5 py-1.5 rounded-full border border-amber-300 transition-all self-start sm:self-auto"
            >
              <span>View Full Queue ({queue.filter(a => a.status !== 'completed' && a.status !== 'Completed' && a.rawStatus !== 'completed').length})</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>

          <div className="flex flex-col gap-4 w-full">
            {(() => {
              const activeList = queue.filter(a => a.status !== 'completed' && a.status !== 'Completed' && a.rawStatus !== 'completed');
              if (activeList.length === 0) {
                return (
                  <div className="p-8 text-center bg-white rounded-3xl border-2 border-slate-200">
                    <span className="material-symbols-outlined text-4xl text-emerald-600 block mx-auto mb-2">check_circle</span>
                    <h4 className="text-base font-black text-slate-900">All Scheduled Consultations Completed!</h4>
                    <p className="text-xs text-slate-500 mt-1">All patients in queue have been attended. Completed records have automatically moved to Consultation History.</p>
                  </div>
                );
              }
              return activeList.slice(0, 4).map((item, idx) => {
                const isApi = !!item._id;
                const pId = isApi ? item._id : item.id;
                const pName = isApi ? (item.patient?.name || 'Patient') : item.name;
                const pAge = isApi ? (item.patient?.dateOfBirth ? `${Math.floor((Date.now() - new Date(item.patient.dateOfBirth))/(365.25*24*3600*1000))} yrs` : '32 yrs') : item.age;
                const pGender = isApi ? (item.patient?.gender ? (item.patient.gender.charAt(0).toUpperCase() + item.patient.gender.slice(1)) : 'Male') : item.gender;
                const pToken = isApi ? (item.tokenNumber || idx + 1) : item.id;
                const isCurrent = isApi ? (item.status === 'in_consultation') : (item.status === 'IN CONSULTATION');
                const pStatus = isCurrent ? 'IN CONSULTATION' : item.status === 'in_queue' ? 'Next in Line' : item.status === 'completed' ? 'Completed' : 'Waiting';
                const pSymptoms = isApi ? (item.reason || item.notes || 'General Tele-Consultation') : item.symptoms;
                const pLocation = isApi ? (item.facility?.name || 'Rampur Sub-Centre') : item.location;
                const pAsha = 'Sunita Devi';
                const pAbha = isApi ? (item.patient?.abhaId || '91-4820-1940-2810') : item.abha;

                return (
                  <div 
                    key={pId}
                    className={`bg-white p-5 sm:p-6 rounded-3xl border-2 transition-all duration-200 shadow-sm hover:shadow-md ${
                      isCurrent 
                        ? 'border-amber-500 bg-amber-50/25' 
                        : 'border-slate-200 hover:border-amber-400'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                      <div className="flex items-start sm:items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center font-bold text-xl shrink-0 ${
                          isCurrent 
                            ? 'bg-amber-100 border-amber-400 text-amber-900 shadow-xs' 
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}>
                          #{String(pToken).padStart(2, '0')}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2.5 mb-1">
                            <h3 className="text-xl font-extrabold text-slate-900 leading-snug notranslate" translate="no">{pName}</h3>
                            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{pAge} • {pGender}</span>
                            <span className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-black border ${
                              isCurrent 
                                ? 'bg-amber-100 text-amber-950 border-amber-400 shadow-2xs animate-pulse' 
                                : pStatus === 'Next in Line'
                                  ? 'bg-sky-100 text-sky-900 border-sky-300'
                                  : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}>
                              {isCurrent && <span className="material-symbols-outlined text-[14px]">videocam</span>}
                              {pStatus}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-slate-700">{pSymptoms}</p>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-semibold mt-1">
                            <span>{pLocation}</span>
                            <span>•</span>
                            <span className="text-amber-900 font-extrabold">ASHA: {pAsha}</span>
                            <span>•</span>
                            <span className="font-mono text-slate-700 font-bold notranslate" translate="no">ABHA: {pAbha}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0 pt-2 lg:pt-0">
                        {/* Info "i" Button */}
                        <button 
                          type="button"
                          onClick={() => setExpandedPatientId(expandedPatientId === pId ? null : pId)}
                          className={`h-12 w-12 rounded-xl border-2 flex items-center justify-center transition-all shadow-xs ${
                            expandedPatientId === pId 
                              ? 'bg-amber-600 text-white border-amber-600 shadow-sm' 
                              : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700 hover:text-amber-700 hover:border-amber-400'
                          }`}
                          title="View Patient Clinical Dossier"
                        >
                          <span className="material-symbols-outlined text-[22px]">info</span>
                        </button>

                        <Link 
                          to="/doctor/prescriptions"
                          state={{
                            patientId: isApi ? item.patient?._id : 'pat-demo',
                            patientName: pName,
                            abhaId: pAbha,
                            appointmentId: isApi ? item._id : null,
                            reason: pSymptoms,
                            location: pLocation,
                            token: pToken
                          }}
                          className="h-12 px-4 rounded-xl border-2 border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                        >
                          <span className="material-symbols-outlined text-[18px] text-amber-600">medication</span>
                          <span>Prescribe</span>
                        </Link>

                        {isCurrent ? (
                          <button 
                            onClick={() => handleUpdateStatus(item, 'completed')}
                            disabled={actionLoadingId === pId}
                            className="h-12 px-5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-extrabold rounded-xl shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[20px]">check_circle</span>
                            <span>Complete Consultation</span>
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleUpdateStatus(item, 'in_consultation')}
                            disabled={actionLoadingId === pId}
                            className="h-12 px-5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-extrabold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[18px]">videocam</span>
                            <span>Call In (Consult)</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* In-Place Expanded Patient Clinical Dossier */}
                    {expandedPatientId === pId && (
                      <div className="w-full pt-4 mt-4 border-t-2 border-slate-100 animate-fadeIn">
                        <div className="bg-amber-50/60 rounded-2xl border-2 border-amber-200/80 p-5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-amber-200/70">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-amber-700 text-[20px]">clinical_notes</span>
                              <span className="text-xs uppercase font-black text-amber-950 tracking-wider">Clinical Vitals &amp; ASHA Triage Dossier</span>
                            </div>
                            <span className="text-xs font-mono font-extrabold bg-white text-amber-950 px-3 py-1 rounded-lg border border-amber-300 shadow-2xs self-start sm:self-auto">
                              ABHA: {pAbha}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                            <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs">
                              <span className="text-[10px] uppercase font-extrabold text-slate-500 block mb-0.5">Reported Symptoms</span>
                              <p className="text-xs font-extrabold text-slate-900">{pSymptoms}</p>
                            </div>
                            <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs">
                              <span className="text-[10px] uppercase font-extrabold text-slate-500 block mb-0.5">Logged Vitals</span>
                              <p className="text-xs font-black text-amber-950">BP 120/80 • Pulse 74 • SpO2 98%</p>
                            </div>
                            <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs">
                              <span className="text-[10px] uppercase font-extrabold text-slate-500 block mb-0.5">Assigned ASHA Worker</span>
                              <p className="text-xs font-extrabold text-slate-900">{pAsha} • {pLocation}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              });
            })()}
          </div>
        </section>

        {/* ACTIVE TELE-CONSULTATION ROOM MODAL FOR DOCTOR */}
        {activeConsultation && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-4 animate-fadeIn">
            <div className="bg-slate-950 text-white w-full max-w-4xl rounded-3xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
              {/* Modal Header */}
              <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping"></span>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                      <span>Live Tele-OPD Consultation</span>
                      <span className="text-xs font-mono text-amber-400 bg-slate-800 px-2.5 py-0.5 rounded-md border border-slate-700">
                        Token #{activeConsultation.id || 4}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 font-semibold">
                      Citizen: <strong className="text-white">{activeConsultation.name || activeConsultation.patient?.name}</strong> • Connected via {activeConsultation.location || 'Rural Sub-Centre'}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setActiveConsultation(null)} 
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 transition-colors cursor-pointer shadow-sm"
                  title="Close Preview"
                >
                  <span className="material-symbols-outlined text-[20px] font-bold text-slate-900">close</span>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left: Video Simulation */}
                <div className="lg:col-span-7 flex flex-col gap-3">
                  <div className="relative aspect-video rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center group shadow-inner">
                    <div className="flex flex-col items-center gap-2 z-10 text-center p-4">
                      <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-400/40 flex items-center justify-center text-amber-400">
                        <span className="material-symbols-outlined text-[42px]">person</span>
                      </div>
                      <span className="text-sm font-black text-white notranslate" translate="no">{activeConsultation.name || activeConsultation.patient?.name}</span>
                      <span className="text-xs text-emerald-400 font-extrabold flex items-center gap-1.5 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        HD Encrypted Video Stream • Online
                      </span>
                    </div>

                    {/* Audio visualizer simulation */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-1">
                      {[18, 35, 22, 45, 60, 30, 50, 25, 40, 55, 30, 18].map((h, i) => (
                        <span key={i} style={{ height: `${h}px` }} className="w-1 bg-amber-400/70 rounded-full animate-pulse"></span>
                      ))}
                    </div>
                  </div>

                  {/* Doctor Consultation Controls */}
                  <div className="flex items-center justify-center gap-3 p-3 bg-slate-900/80 rounded-2xl border border-slate-800">
                    <button type="button" className="w-11 h-11 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors">
                      <span className="material-symbols-outlined text-[20px]">mic</span>
                    </button>
                    <button type="button" className="w-11 h-11 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors">
                      <span className="material-symbols-outlined text-[20px]">videocam</span>
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        handleUpdateStatus(activeConsultation, 'completed');
                        setActiveConsultation(null);
                      }}
                      className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-md"
                    >
                      <span className="material-symbols-outlined text-[18px]">call_end</span>
                      <span>End &amp; Complete Consultation</span>
                    </button>
                  </div>
                </div>

                {/* Right: Clinical Information & Quick Prescription */}
                <div className="lg:col-span-5 flex flex-col gap-3">
                  {/* Patient Info Card */}
                  <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Citizen</span>
                        <strong className="text-white text-base font-black">{activeConsultation.name || activeConsultation.patient?.name}</strong>
                      </div>
                      <span className="text-[10px] font-mono text-amber-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        ABHA: {activeConsultation.abha || '91-4820-1940-2810'}
                      </span>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Reported Symptoms / Notes</span>
                      <p className="text-slate-200 font-semibold">{activeConsultation.symptoms || activeConsultation.reason || 'Routine follow-up'}</p>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                      <span className="text-[10px] text-amber-400 uppercase font-black block mb-1">Live Vitals Received from Field Kiosk</span>
                      <p className="text-white font-mono font-black">{activeConsultation.vitals || 'BP 120/80 mmHg • Pulse 74 • SpO2 98%'}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 mt-auto">
                    <Link
                      to="/doctor/prescriptions"
                      state={{
                        patientId: activeConsultation._id || activeConsultation.patient?._id || '6aa9748a7fbaf7f52bfb3735',
                        patientName: activeConsultation.name || activeConsultation.patient?.name || 'Aditya Verma',
                        abhaId: activeConsultation.abha || '91-4820-1940-2810',
                        appointmentId: activeConsultation._id,
                        reason: activeConsultation.symptoms || activeConsultation.reason,
                        location: activeConsultation.location || 'Rampur Sub-Centre',
                        token: activeConsultation.id || 4,
                      }}
                      className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">medication</span>
                      <span>Write Digital e-Prescription (Jan Aushadhi)</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        handleUpdateStatus(activeConsultation, 'completed');
                        setActiveConsultation(null);
                      }}
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      <span>Mark Consultation as Complete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

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
