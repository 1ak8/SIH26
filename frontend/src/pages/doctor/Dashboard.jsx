import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import DoctorNavbar from '../../components/DoctorNavbar';

const QUEUE_DATA = [
  { 
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
  const [expandedPatientId, setExpandedPatientId] = useState(4); // default open for active patient

  useEffect(() => {
    api.get('/doctor/dashboard').then(r => setData(r.data?.data)).catch(() => {});
  }, []);

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

      <main className="w-full px-6 lg:px-12 xl:px-16 pt-28 pb-16">
        {/* Live OPD Console Header Banner */}
        <div className="bg-gradient-to-r from-amber-500/15 via-amber-100/40 to-transparent p-6 sm:p-8 rounded-3xl border-2 border-amber-300 shadow-sm mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-amber-300 text-amber-900 text-xs font-extrabold mb-3 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>National Tele-Consultation Mission • E-Sanjeevani Grid</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
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
              <span className="text-4xl font-black text-amber-950">6</span>
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
              <span className="text-4xl font-black text-slate-900">19</span>
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
              <span>View Full Queue (6)</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>

          <div className="flex flex-col gap-4 w-full">
            {QUEUE_DATA.slice(0, 4).map(p => {
              const isCurrent = p.status === 'IN CONSULTATION';
              return (
                <div 
                  key={p.id}
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
                        #{String(p.id).padStart(2, '0')}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2.5 mb-1">
                          <h3 className="text-xl font-extrabold text-slate-900 leading-snug notranslate" translate="no">{p.name}</h3>
                          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{p.age} • {p.gender}</span>
                          <span className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-black border ${
                            isCurrent 
                              ? 'bg-amber-100 text-amber-950 border-amber-400 shadow-2xs animate-pulse' 
                              : p.status === 'Next in Line'
                                ? 'bg-sky-100 text-sky-900 border-sky-300'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {isCurrent && <span className="material-symbols-outlined text-[14px]">videocam</span>}
                            {p.status}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-slate-700">{p.symptoms}</p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-semibold mt-1">
                          <span>{p.location}</span>
                          <span>•</span>
                          <span className="text-amber-900 font-extrabold">ASHA: {p.asha}</span>
                          <span>•</span>
                          <span className="font-mono text-slate-700 font-bold notranslate" translate="no">ABHA: {p.abha}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 pt-2 lg:pt-0">
                      {/* Info "i" Button */}
                      <button 
                        type="button"
                        onClick={() => setExpandedPatientId(expandedPatientId === p.id ? null : p.id)}
                        className={`h-12 w-12 rounded-xl border-2 flex items-center justify-center transition-all shadow-xs ${
                          expandedPatientId === p.id 
                            ? 'bg-amber-600 text-white border-amber-600 shadow-sm' 
                            : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700 hover:text-amber-700 hover:border-amber-400'
                        }`}
                        title="View Patient Clinical Dossier"
                      >
                        <span className="material-symbols-outlined text-[22px]">info</span>
                      </button>

                      <Link 
                        to="/doctor/prescriptions"
                        className="h-12 px-4 rounded-xl border-2 border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                      >
                        <span className="material-symbols-outlined text-[18px] text-amber-600">medication</span>
                        <span>Prescribe</span>
                      </Link>

                      {isCurrent ? (
                        <button 
                          onClick={() => alert(`Starting Live Tele-Consultation session with ${p.name} from ${p.location}...`)}
                          className="h-12 px-6 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-extrabold rounded-xl shadow-md shadow-amber-600/25 transition-all flex items-center justify-center gap-2"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[20px]">videocam</span>
                          <span>Live Consultation Room</span>
                        </button>
                      ) : (
                        <button 
                          onClick={() => alert(`Calling in Token #${p.id} (${p.name}) to Tele-Consultation Desk...`)}
                          className="h-12 px-5 bg-white border-2 border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-extrabold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[18px] text-amber-600">ring_volume</span>
                          <span>Call In Next</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* In-Place Expanded Patient Clinical Dossier */}
                  {expandedPatientId === p.id && (
                    <div className="w-full pt-4 mt-4 border-t-2 border-slate-100 animate-fadeIn">
                      <div className="bg-amber-50/60 rounded-2xl border-2 border-amber-200/80 p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-amber-200/70">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-amber-700 text-[20px]">clinical_notes</span>
                            <span className="text-xs uppercase font-black text-amber-950 tracking-wider">Clinical Vitals &amp; ASHA Triage Dossier</span>
                          </div>
                          <span className="text-xs font-mono font-extrabold bg-white text-amber-950 px-3 py-1 rounded-lg border border-amber-300 shadow-2xs self-start sm:self-auto">
                            ABHA: {p.abha}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                          <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs">
                            <span className="text-[10px] uppercase font-extrabold text-slate-500 block mb-0.5">Reported Symptoms</span>
                            <p className="text-xs font-extrabold text-slate-900">{p.symptoms}</p>
                          </div>
                          <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs">
                            <span className="text-[10px] uppercase font-extrabold text-slate-500 block mb-0.5">Logged Vitals</span>
                            <p className="text-xs font-black text-amber-950">{p.vitals}</p>
                          </div>
                          <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs">
                            <span className="text-[10px] uppercase font-extrabold text-slate-500 block mb-0.5">Assigned ASHA Worker</span>
                            <p className="text-xs font-extrabold text-slate-900">{p.asha} • {p.location}</p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-white p-3 rounded-xl border border-amber-200">
                          <span className="text-slate-600 font-semibold">Triage status verified under National Digital Health Framework</span>
                          <div className="flex items-center gap-2">
                            <Link to="/doctor/prescriptions" className="text-amber-800 font-black hover:underline flex items-center gap-1">
                              <span>Write Prescription &rarr;</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
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
                AarogyaNet delivers verified public clinical connectivity across rural dispensaries, district hospitals, and tertiary research institutes under the National Digital Health Framework.
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
