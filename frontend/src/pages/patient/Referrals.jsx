import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PatientNavbar from '../../components/PatientNavbar';
import api from '../../services/api';

const STATUS_CONFIG = {
  pending: { color: 'bg-amber-50 text-amber-900 border-amber-200', icon: 'hourglass_empty', label: 'Pending Review', dot: 'bg-amber-500' },
  accepted: { color: 'bg-sky-50 text-sky-900 border-sky-200', icon: 'check_circle', label: 'Accepted at Facility', dot: 'bg-sky-500' },
  in_transit: { color: 'bg-indigo-50 text-indigo-900 border-indigo-200', icon: 'local_shipping', label: 'In Transit', dot: 'bg-indigo-500' },
  in_consultation: { color: 'bg-teal-50 text-teal-900 border-teal-200', icon: 'medical_services', label: 'In Consultation', dot: 'bg-teal-600' },
  completed: { color: 'bg-emerald-50 text-emerald-900 border-emerald-200', icon: 'verified', label: 'Completed', dot: 'bg-emerald-500' },
  rejected: { color: 'bg-rose-50 text-rose-900 border-rose-200', icon: 'cancel', label: 'Rejected', dot: 'bg-rose-500' },
  cancelled: { color: 'bg-slate-50 text-slate-700 border-slate-200', icon: 'block', label: 'Cancelled', dot: 'bg-slate-400' },
};

const PRIORITY_CONFIG = {
  low: { color: 'bg-slate-100 text-slate-700', label: 'Low' },
  medium: { color: 'bg-sky-100 text-sky-800', label: 'Medium' },
  high: { color: 'bg-amber-100 text-amber-900 border border-amber-300', label: 'High' },
  emergency: { color: 'bg-rose-100 text-rose-900 border border-rose-300 animate-pulse', label: 'Emergency' },
};

const MOCK_REFERRALS = [
  {
    _id: 'ref-101',
    referralId: 'REF-2026-9041',
    patient: { name: 'Aditya Verma', phone: '9876543210', abhaId: '91-4820-1940-2810' },
    referredBy: { name: 'Dr. Rajesh Sharma', role: 'Medical Officer • CHC Sitapur Central' },
    toFacility: 'District Hospital Sitapur — Cardiology Department',
    specialty: 'Cardiology (हृदय रोग)',
    priority: 'high',
    status: 'in_transit',
    reason: 'Persistent stage-2 hypertension with occasional palpitations and dizziness',
    clinicalSummary: 'Resting BP 152/94 mmHg despite Amlodipine 5mg. ECG shows mild LVH changes. Referral for 2D Echocardiogram and specialist evaluation.',
    transportMode: 'ambulance',
    estimatedArrival: 'Today, 02:30 PM (ALS Unit UP-34-G-1081)',
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    statusHistory: [
      { status: 'pending', note: 'Referral generated at Sitapur Rural Sub-Centre by Dr. Rajesh Sharma', timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString() },
      { status: 'accepted', note: 'Accepted by Dr. Vikramaditya Rathore (Cardiologist, District Hospital Sitapur)', timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString() },
      { status: 'in_transit', note: '108 Ambulance ALS unit dispatched with paramedic escort', timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
    ],
  },
  {
    _id: 'ref-102',
    referralId: 'REF-2026-8812',
    patient: { name: 'Aditya Verma', phone: '9876543210', abhaId: '91-4820-1940-2810' },
    referredBy: { name: 'ASHA Sunita Devi', role: 'Health Worker • Sitapur Ward 4' },
    toFacility: 'State Medical College Tele-Hub',
    specialty: 'Pulmonology (श्वसन रोग)',
    priority: 'medium',
    status: 'accepted',
    reason: 'Post-viral bronchial hyperreactivity and nocturnal wheezing',
    clinicalSummary: 'SpO2 96%, non-productive cough lasting >3 weeks post acute viral bronchitis. Spirometry and chest specialist consult requested.',
    transportMode: 'self',
    estimatedArrival: 'Tomorrow, 10:00 AM (OPD Slot 04)',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    statusHistory: [
      { status: 'pending', note: 'Requisition submitted via ASHA field triage', timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString() },
      { status: 'accepted', note: 'OPD slot confirmed by State Medical College Pulmonology Tele-Desk', timestamp: new Date(Date.now() - 18 * 3600 * 1000).toISOString() },
    ],
  },
  {
    _id: 'ref-103',
    referralId: 'REF-2026-7640',
    patient: { name: 'Aditya Verma', phone: '9876543210', abhaId: '91-4820-1940-2810' },
    referredBy: { name: 'Dr. Ananya Gupta', role: 'Consultant • SDH Rampur' },
    toFacility: 'CHC Sitapur Central Pathology Lab',
    specialty: 'Clinical Biochemistry',
    priority: 'low',
    status: 'completed',
    reason: 'Annual routine diabetic & lipid surveillance panel',
    clinicalSummary: 'HbA1c, Fasting Plasma Glucose, Urine Microalbumin & Lipid profile completed. Parameters normal and synced to ABHA record.',
    transportMode: 'self',
    estimatedArrival: 'Completed',
    createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    statusHistory: [
      { status: 'pending', note: 'Lab investigation referral order placed', timestamp: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString() },
      { status: 'accepted', note: 'Sample phlebotomy scheduled at Sub-Centre', timestamp: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString() },
      { status: 'in_consultation', note: 'Pathology testing completed at CHC Sitapur Central', timestamp: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString() },
      { status: 'completed', note: 'Digital pathology report verified & signed by Dr. Anjali Seth', timestamp: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString() },
    ],
  },
];

export default function PatientReferrals() {
  const [referrals, setReferrals] = useState(MOCK_REFERRALS);
  const [loading, setLoading] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState(MOCK_REFERRALS[0]);
  const [filter, setFilter] = useState('all');

  const fetchReferrals = async () => {
    try {
      const res = await api.get('/referrals');
      if (res.data?.data && res.data.data.length > 0) {
        // Merge server referrals with mock data ensuring unique IDs
        const combined = [...res.data.data, ...MOCK_REFERRALS];
        const seen = new Set();
        const unique = [];
        for (const item of combined) {
          const key = item._id || item.referralId;
          if (key && !seen.has(key)) {
            seen.add(key);
            unique.push(item);
          }
        }
        setReferrals(unique);
        if (!selectedReferral && unique.length > 0) {
          setSelectedReferral(unique[0]);
        }
      }
    } catch (err) {
      console.warn('Using seeded referrals fallback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchReferrals(); 
  }, []);

  const filtered = filter === 'all' ? referrals : referrals.filter(r => r.status === filter);

  return (
    <div className="bg-slate-50 text-slate-900 font-sans min-h-screen selection:bg-teal-100 selection:text-teal-900">
      <PatientNavbar />
      
      <main className="w-full px-4 sm:px-6 lg:px-12 xl:px-16 pt-24 sm:pt-28 pb-16 max-w-7xl mx-auto">
        <div className="mb-5">
          <Link 
            to="/patient" 
            className="inline-flex items-center gap-2 text-slate-600 hover:text-teal-800 bg-white px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold shadow-2xs hover:border-teal-300 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px]">arrow_back</span>
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Jewel Royal Teal & Luminous Frosted Glass Hero Banner */}
        <div className="w-full mb-8 bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 text-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-teal-950/15 border border-teal-600/40 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-teal-100 text-xs font-black mb-3 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Ayushman Bharat Digital Mission • Inter-Facility Grid</span>
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight flex items-center gap-3">
                <span className="material-symbols-outlined text-teal-200 text-[36px]">forward</span>
                <span>Hospital Referral Tracking Pipeline</span>
              </h1>
              <p className="text-xs sm:text-sm lg:text-base text-teal-100/90 font-medium mt-2 leading-relaxed">
                Track all referrals initiated by your field health worker or attending doctors to CHC Sitapur and district hospitals with live transport telemetry.
              </p>
            </div>

            <div className="bg-white/15 backdrop-blur-xl border border-white/25 rounded-2xl p-4 sm:p-5 text-white flex flex-col justify-between shadow-lg shrink-0 self-start lg:self-auto min-w-[240px]">
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-teal-200">Referral Network</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-black">
                  ABDM Live
                </span>
              </div>
              <div className="text-3xl font-black font-mono tracking-tight text-white">
                {referrals.length} <span className="text-xs font-sans text-teal-200 font-bold">Cases Tracked</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-teal-100 font-semibold mt-2 pt-2 border-t border-white/15">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>In-Transit Ambulance Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
          {['pending', 'accepted', 'in_transit', 'completed'].map(s => {
            const cfg = STATUS_CONFIG[s];
            const count = referrals.filter(r => r.status === s).length;
            return (
              <div key={s} className="bg-white p-4 rounded-2xl border border-slate-200 text-center shadow-2xs hover:border-teal-300 transition-all">
                <span className={`material-symbols-outlined text-[22px] ${cfg.dot.replace('bg-', 'text-')}`}>{cfg.icon}</span>
                <p className="text-2xl font-black text-slate-900 mt-1 font-mono">{count}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{cfg.label}</p>
              </div>
            );
          })}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
          {[{ key: 'all', label: `All Referrals (${referrals.length})` }, ...Object.entries(STATUS_CONFIG).map(([k, v]) => ({ key: k, label: `${v.label} (${referrals.filter(r => r.status === k).length})` }))].map(f => (
            <button 
              key={f.key} 
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                filter === f.key 
                  ? 'bg-teal-700 text-white shadow-sm shadow-teal-700/25' 
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-teal-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
            <span className="material-symbols-outlined text-teal-600 text-[40px] animate-spin">progress_activity</span>
            <p className="text-xs text-slate-500 font-bold mt-2">Loading referral records...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-2xs">
            <span className="material-symbols-outlined text-slate-300 text-[48px]">forward</span>
            <p className="text-sm text-slate-600 font-bold mt-2">No referrals found in this category</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filtered.map(r => {
              const sc = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending;
              const pc = PRIORITY_CONFIG[r.priority] || PRIORITY_CONFIG.medium;
              const isSelected = selectedReferral?._id === r._id;

              return (
                <div 
                  key={r._id} 
                  onClick={() => setSelectedReferral(isSelected ? null : r)}
                  className={`bg-white p-5 sm:p-6 rounded-3xl border transition-all duration-200 cursor-pointer ${
                    isSelected ? 'border-teal-500 shadow-md ring-2 ring-teal-500/10' : 'border-slate-200 hover:border-teal-300 shadow-2xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${sc.color} border shadow-2xs`}>
                        <span className="material-symbols-outlined text-[24px]">{sc.icon}</span>
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-xs font-mono font-black bg-slate-900 text-teal-300 px-2.5 py-0.5 rounded-full">{r.referralId || r._id?.slice(-8)}</span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${pc.color}`}>{pc.label}</span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${sc.color}`}>{sc.label}</span>
                        </div>
                        <h3 className="text-base font-black text-slate-900">{r.reason}</h3>
                        <p className="text-xs text-slate-600 font-medium mt-0.5">
                          Referred by: <strong className="text-slate-800">{r.referredBy?.name || 'Healthcare Worker'}</strong> → <strong className="text-teal-800">{r.toFacility}</strong>
                        </p>
                        {r.specialty && <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Specialty: {r.specialty}</p>}
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 text-[22px] self-start sm:self-auto">
                      {isSelected ? 'expand_less' : 'expand_more'}
                    </span>
                  </div>

                  {isSelected && (
                    <div className="mt-4 pt-4 border-t border-slate-100 animate-fadeIn">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                        {r.clinicalSummary && (
                          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Clinical Notes</span>
                            <p className="text-xs text-slate-800 font-semibold">{r.clinicalSummary}</p>
                          </div>
                        )}
                        {r.transportMode && (
                          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Transport</span>
                            <p className="text-xs text-slate-800 font-bold capitalize">{r.transportMode.replace('_', ' ')}</p>
                          </div>
                        )}
                        {r.estimatedArrival && (
                          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">ETA</span>
                            <p className="text-xs text-slate-800 font-bold">{r.estimatedArrival}</p>
                          </div>
                        )}
                      </div>

                      {/* Status Progression Timeline */}
                      <div className="mt-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2.5">Status Progression Timeline</span>
                        <div className="space-y-0 pl-2">
                          {(r.statusHistory || []).map((h, i) => (
                            <div key={i} className="flex items-start gap-3">
                              <div className="flex flex-col items-center">
                                <div className={`w-3.5 h-3.5 rounded-full ${STATUS_CONFIG[h.status]?.dot || 'bg-slate-400'} ring-4 ring-slate-100`}></div>
                                {i < (r.statusHistory || []).length - 1 && <div className="w-0.5 h-6 bg-slate-200 my-0.5"></div>}
                              </div>
                              <div className="pb-3">
                                <p className="text-xs font-black text-slate-900 capitalize">{h.status?.replace('_', ' ')}</p>
                                <p className="text-[11px] text-slate-600 mt-0.5">{h.note}</p>
                                <p className="text-[10px] text-slate-400 font-mono mt-0.5">{new Date(h.timestamp).toLocaleString('en-IN')}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="mt-2 text-[10px] text-slate-400 font-mono">Order Created: {new Date(r.createdAt).toLocaleString('en-IN')}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
