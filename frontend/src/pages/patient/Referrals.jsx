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

export default function PatientReferrals() {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [filter, setFilter] = useState('all');

  const fetchReferrals = async () => {
    try {
      const res = await api.get('/referrals');
      setReferrals(res.data?.data || []);
    } catch (err) {
      console.warn('Using local fallback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReferrals(); }, []);

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

        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-teal-950 via-teal-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-teal-500/30 shadow-xl mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-teal-200 text-xs font-black mb-3 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Inter-Facility Care Continuity • ABDM Grid</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight font-heading flex items-center gap-3">
                <span className="material-symbols-outlined text-teal-400 text-[32px]">forward</span>
                <span>My Hospital Referrals</span>
              </h1>
              <p className="text-xs sm:text-base text-slate-300 font-medium mt-1.5 max-w-2xl leading-relaxed">
                Track all referrals initiated by your field health worker or attending doctors to CHC Sitapur and district hospitals.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-teal-400/30 px-5 py-3 rounded-2xl text-center self-start md:self-auto">
              <span className="text-[10px] uppercase font-black tracking-wider text-teal-300 block">Active Status</span>
              <span className="text-xl font-black text-white font-mono mt-0.5 block">{referrals.length} Cases Logged</span>
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
          {[{ key: 'all', label: 'All Referrals' }, ...Object.entries(STATUS_CONFIG).map(([k, v]) => ({ key: k, label: v.label }))].map(f => (
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
                  className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 hover:border-teal-400 hover:shadow-md transition-all duration-200 cursor-pointer"
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
                                <div className={`w-3 h-3 rounded-full ${STATUS_CONFIG[h.status]?.dot || 'bg-slate-400'} ring-4 ring-slate-100`}></div>
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
