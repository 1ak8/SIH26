import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PatientNavbar from '../../components/PatientNavbar';
import api from '../../services/api';

const STATUS_CONFIG = {
  pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: 'hourglass_empty', label: 'Pending', dot: 'bg-yellow-500' },
  accepted: { color: 'bg-blue-100 text-blue-800 border-blue-300', icon: 'check_circle', label: 'Accepted', dot: 'bg-blue-500' },
  in_transit: { color: 'bg-purple-100 text-purple-800 border-purple-300', icon: 'local_shipping', label: 'In Transit', dot: 'bg-purple-500' },
  in_consultation: { color: 'bg-indigo-100 text-indigo-800 border-indigo-300', icon: 'medical_services', label: 'In Consultation', dot: 'bg-indigo-500' },
  completed: { color: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: 'verified', label: 'Completed', dot: 'bg-emerald-500' },
  rejected: { color: 'bg-red-100 text-red-800 border-red-300', icon: 'cancel', label: 'Rejected', dot: 'bg-red-500' },
  cancelled: { color: 'bg-slate-100 text-slate-600 border-slate-300', icon: 'block', label: 'Cancelled', dot: 'bg-slate-400' },
};

const PRIORITY_CONFIG = {
  low: { color: 'bg-slate-100 text-slate-700', label: 'Low' },
  medium: { color: 'bg-amber-100 text-amber-800', label: 'Medium' },
  high: { color: 'bg-orange-100 text-orange-800', label: 'High' },
  emergency: { color: 'bg-red-100 text-red-800', label: 'Emergency' },
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
    <div className="bg-[#fbfaf7] text-slate-900 font-sans min-h-screen">
      <PatientNavbar />
      <main className="w-full px-6 lg:px-12 xl:px-16 pt-28 pb-16">
        <div className="mb-6">
          <Link to="/patient" className="inline-flex items-center gap-2 text-slate-700 hover:text-amber-600 bg-white px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold shadow-xs hover:border-amber-300 transition-all">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-gradient-to-r from-amber-500/15 via-amber-100/40 to-transparent p-6 sm:p-8 rounded-3xl border-2 border-amber-300 shadow-sm mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-amber-600 text-[28px]">forward</span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Referrals</h1>
          </div>
          <p className="text-sm text-slate-600 font-medium">Track all your hospital referrals and their current status.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {['pending', 'accepted', 'in_transit', 'completed'].map(s => {
            const cfg = STATUS_CONFIG[s];
            const count = referrals.filter(r => r.status === s).length;
            return (
              <div key={s} className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
                <span className={`material-symbols-outlined text-[20px] ${cfg.dot.replace('bg-', 'text-')}`}>{cfg.icon}</span>
                <p className="text-2xl font-black text-slate-900 mt-1">{count}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase">{cfg.label}</p>
              </div>
            );
          })}
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[{ key: 'all', label: 'All' }, ...Object.entries(STATUS_CONFIG).map(([k, v]) => ({ key: k, label: v.label }))].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${filter === f.key ? 'bg-amber-500 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-700 hover:border-amber-300'}`}>
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16"><span className="material-symbols-outlined text-amber-500 text-[40px] animate-spin">progress_activity</span></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
            <span className="material-symbols-outlined text-slate-300 text-[48px]">forward</span>
            <p className="text-sm text-slate-500 font-bold mt-3">No referrals found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(r => {
              const sc = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending;
              const pc = PRIORITY_CONFIG[r.priority] || PRIORITY_CONFIG.medium;
              return (
                <div key={r._id} onClick={() => setSelectedReferral(selectedReferral?._id === r._id ? null : r)}
                  className="bg-white p-5 sm:p-6 rounded-2xl border-2 border-slate-200 hover:border-amber-400 hover:shadow-lg transition-all cursor-pointer">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${sc.color} border`}>
                        <span className="material-symbols-outlined text-[22px]">{sc.icon}</span>
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-xs font-black bg-slate-900 text-amber-400 px-2.5 py-0.5 rounded-full">{r.referralId || r._id?.slice(-8)}</span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${pc.color}`}>{pc.label}</span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${sc.color}`}>{sc.label}</span>
                        </div>
                        <h3 className="text-base font-extrabold text-slate-900">{r.reason}</h3>
                        <p className="text-xs text-slate-500 font-bold mt-0.5">
                          Referred by: <strong className="text-slate-800">{r.referredBy?.name || 'Health Worker'}</strong> → <strong className="text-slate-800">{r.toFacility}</strong>
                        </p>
                        {r.specialty && <p className="text-[11px] text-slate-600 mt-0.5">Specialty: {r.specialty}</p>}
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 text-[20px]">{selectedReferral?._id === r._id ? 'expand_less' : 'expand_more'}</span>
                  </div>

                  {selectedReferral?._id === r._id && (
                    <div className="mt-4 pt-4 border-t border-slate-100 animate-fadeIn">
                      {r.clinicalSummary && (
                        <div className="mb-3 p-3 bg-slate-50 rounded-xl"><span className="text-[10px] font-black text-slate-500 uppercase block mb-1">Clinical Notes</span><p className="text-xs text-slate-700 font-bold">{r.clinicalSummary}</p></div>
                      )}
                      {r.transportMode && (
                        <div className="mb-3 p-3 bg-slate-50 rounded-xl"><span className="text-[10px] font-black text-slate-500 uppercase block mb-1">Transport</span><p className="text-xs text-slate-700 font-bold capitalize">{r.transportMode.replace('_', ' ')}</p></div>
                      )}
                      {r.estimatedArrival && (
                        <div className="mb-3 p-3 bg-slate-50 rounded-xl"><span className="text-[10px] font-black text-slate-500 uppercase block mb-1">ETA</span><p className="text-xs text-slate-700 font-bold">{r.estimatedArrival}</p></div>
                      )}
                      {/* Timeline */}
                      <div className="mt-3">
                        <span className="text-[10px] font-black text-slate-500 uppercase block mb-2">Status Timeline</span>
                        <div className="space-y-2">
                          {(r.statusHistory || []).map((h, i) => (
                            <div key={i} className="flex items-start gap-3">
                              <div className="flex flex-col items-center">
                                <div className={`w-3 h-3 rounded-full ${STATUS_CONFIG[h.status]?.dot || 'bg-slate-400'}`}></div>
                                {i < (r.statusHistory || []).length - 1 && <div className="w-0.5 h-4 bg-slate-200 mt-1"></div>}
                              </div>
                              <div className="pb-1">
                                <p className="text-xs font-black text-slate-800 capitalize">{h.status?.replace('_', ' ')}</p>
                                <p className="text-[10px] text-slate-500">{h.note}</p>
                                <p className="text-[9px] text-slate-400">{new Date(h.timestamp).toLocaleString('en-IN')}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="mt-3 text-[10px] text-slate-400">Created: {new Date(r.createdAt).toLocaleString('en-IN')}</div>
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
