import { useState, useEffect } from 'react';
import api from '../services/api';

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

const FACILITIES = [
  'CHC Sitapur Central', 'District Hospital Sitapur', 'SDH Rampur', 'PHC Bilaspur',
  'PHC Ward 4 Health Centre', 'Sub-Centre Rampur Ward 2', 'Jan Aushadhi Kendra Sitapur',
];

export default function ReferralTrackingPanel({ userRole = 'health_worker' }) {
  const [referrals, setReferrals] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, accepted: 0, inTransit: 0, completed: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(null);
  const [patients, setPatients] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  const [createForm, setCreateForm] = useState({
    patientId: '', toFacility: 'District Hospital Sitapur', specialty: 'General Medicine',
    reason: '', clinicalSummary: '', priority: 'medium', transportMode: 'self', estimatedArrival: '',
  });

  const [statusForm, setStatusForm] = useState({ status: '', note: '', rejectionReason: '' });

  const showToast = (msg) => { setToastMessage(msg); setTimeout(() => setToastMessage(null), 4000); };

  const fetchData = async () => {
    try {
      const [refRes, statsRes] = await Promise.all([
        api.get('/referrals'),
        api.get('/referrals/stats'),
      ]);
      setReferrals(refRes.data?.data || []);
      setStats(refRes.data?.data || statsRes.data?.data || {});
    } catch (err) {
      console.warn('Referral fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const endpoint = userRole === 'doctor' ? '/doctor/patients-list' : '/health-worker/patients';
      const res = await api.get(endpoint);
      setPatients(res.data?.data || []);
    } catch (err) {
      console.warn('Patient list fetch error');
    }
  };

  useEffect(() => { fetchData(); fetchPatients(); }, []);

  const handleCreateReferral = async (e) => {
    e.preventDefault();
    if (!createForm.patientId || !createForm.reason) {
      showToast('Patient and reason are required');
      return;
    }
    try {
      await api.post('/referrals', createForm);
      showToast('Referral created successfully!');
      setShowCreateModal(false);
      setCreateForm({ patientId: '', toFacility: 'District Hospital Sitapur', specialty: 'General Medicine', reason: '', clinicalSummary: '', priority: 'medium', transportMode: 'self', estimatedArrival: '' });
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create referral');
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!showStatusModal || !statusForm.status) return;
    try {
      await api.patch(`/referrals/${showStatusModal._id}/status`, statusForm);
      showToast(`Referral status updated to ${statusForm.status}`);
      setShowStatusModal(null);
      setStatusForm({ status: '', note: '', rejectionReason: '' });
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status');
    }
  };

  const filtered = filter === 'all' ? referrals : referrals.filter(r => r.status === filter);

  return (
    <div className="animate-fadeIn">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-[120] bg-slate-900 text-amber-300 px-5 py-3 rounded-2xl shadow-xl border border-amber-400/50 flex items-center gap-3 text-sm font-bold animate-bounce">
          <span className="material-symbols-outlined text-amber-400">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-amber-600 text-[28px]">forward</span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">Referral Tracking</h1>
            <span className="bg-amber-100 text-amber-900 text-xs font-black px-2.5 py-0.5 rounded-full border border-amber-300">{referrals.length} Total</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">Track patient referrals across facilities with real-time status updates.</p>
        </div>
        <button onClick={() => setShowCreateModal(true)}
          className="bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white px-5 py-3 rounded-xl font-extrabold text-xs shadow-sm flex items-center gap-2 transition-all self-start sm:self-auto cursor-pointer">
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>New Referral</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
        {[
          { key: 'total', label: 'Total', icon: 'summarize', color: 'text-slate-700' },
          { key: 'pending', label: 'Pending', icon: 'hourglass_empty', color: 'text-yellow-600' },
          { key: 'accepted', label: 'Accepted', icon: 'check_circle', color: 'text-blue-600' },
          { key: 'inTransit', label: 'In Transit', icon: 'local_shipping', color: 'text-purple-600' },
          { key: 'completed', label: 'Completed', icon: 'verified', color: 'text-emerald-600' },
          { key: 'rejected', label: 'Rejected', icon: 'cancel', color: 'text-red-600' },
        ].map(s => (
          <div key={s.key} className="bg-white p-3 rounded-xl border border-slate-200 text-center">
            <span className={`material-symbols-outlined text-[18px] ${s.color}`}>{s.icon}</span>
            <p className="text-xl font-black text-slate-900">{stats[s.key] || 0}</p>
            <p className="text-[9px] font-black text-slate-500 uppercase">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[{ key: 'all', label: 'All' }, ...Object.entries(STATUS_CONFIG).map(([k, v]) => ({ key: k, label: v.label }))].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${filter === f.key ? 'bg-amber-500 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-700 hover:border-amber-300'}`}>
            {f.label} {f.key !== 'all' && <span className="ml-1 opacity-70">({referrals.filter(r => r.status === f.key).length})</span>}
          </button>
        ))}
      </div>

      {/* Referral List */}
      {loading ? (
        <div className="text-center py-16"><span className="material-symbols-outlined text-amber-500 text-[40px] animate-spin">progress_activity</span></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
          <span className="material-symbols-outlined text-slate-300 text-[48px]">forward</span>
          <p className="text-sm text-slate-500 font-bold mt-3">No referrals found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => {
            const sc = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending;
            const pc = PRIORITY_CONFIG[r.priority] || PRIORITY_CONFIG.medium;
            return (
              <div key={r._id} className="bg-white p-5 rounded-2xl border-2 border-slate-200 hover:border-amber-400 hover:shadow-lg transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${sc.color} border`}>
                      <span className="material-symbols-outlined text-[20px]">{sc.icon}</span>
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs font-black bg-slate-900 text-amber-400 px-2.5 py-0.5 rounded-full">{r.referralId}</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${pc.color}`}>{pc.label}</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${sc.color}`}>{sc.label}</span>
                      </div>
                      <h3 className="text-sm font-extrabold text-slate-900">{r.patient?.name || 'Patient'} → <span className="text-amber-700">{r.toFacility}</span></h3>
                      <p className="text-xs text-slate-500 font-bold mt-0.5">{r.reason} {r.specialty ? `• ${r.specialty}` : ''}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">By: {r.referredBy?.name || 'Unknown'} • {new Date(r.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    <button onClick={() => setSelectedReferral(selectedReferral?._id === r._id ? null : r)}
                      className={`px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer flex items-center gap-1 transition-all ${
                        selectedReferral?._id === r._id 
                          ? 'bg-amber-100 border-amber-400 text-amber-800' 
                          : 'border-slate-200 bg-white hover:bg-amber-50 text-slate-700'
                      }`}>
                      <span className="material-symbols-outlined text-[14px]">
                        {selectedReferral?._id === r._id ? 'keyboard_arrow_up' : 'timeline'}
                      </span>
                      {selectedReferral?._id === r._id ? '' : 'Track'}
                    </button>
                    {r.status !== 'completed' && r.status !== 'cancelled' && r.status !== 'rejected' && (
                      <button onClick={() => setShowStatusModal(r)}
                        className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black cursor-pointer flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">update</span>
                        Update
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Timeline */}
                {selectedReferral?._id === r._id && (
                  <div className="mt-4 pt-4 border-t border-slate-100 animate-fadeIn">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      <div className="bg-slate-50 p-3 rounded-xl"><span className="text-[9px] font-black text-slate-500 uppercase block">Patient</span><p className="text-xs font-bold text-slate-900">{r.patient?.name}</p><p className="text-[10px] text-slate-500">{r.patient?.phone}</p></div>
                      <div className="bg-slate-50 p-3 rounded-xl"><span className="text-[9px] font-black text-slate-500 uppercase block">ABHA ID</span><p className="text-xs font-bold text-slate-900 font-mono">{r.patient?.abhaId || 'N/A'}</p></div>
                      <div className="bg-slate-50 p-3 rounded-xl"><span className="text-[9px] font-black text-slate-500 uppercase block">Transport</span><p className="text-xs font-bold text-slate-900 capitalize">{r.transportMode?.replace('_', ' ')}</p></div>
                      <div className="bg-slate-50 p-3 rounded-xl"><span className="text-[9px] font-black text-slate-500 uppercase block">ETA</span><p className="text-xs font-bold text-slate-900">{r.estimatedArrival || 'Not set'}</p></div>
                    </div>
                    {r.clinicalSummary && <div className="mb-4 p-3 bg-amber-50 rounded-xl border border-amber-200"><span className="text-[9px] font-black text-amber-800 uppercase block mb-1">Clinical Notes</span><p className="text-xs text-slate-700">{r.clinicalSummary}</p></div>}
                    {r.rejectionReason && <div className="mb-4 p-3 bg-red-50 rounded-xl border border-red-200"><span className="text-[9px] font-black text-red-800 uppercase block mb-1">Rejection Reason</span><p className="text-xs text-slate-700">{r.rejectionReason}</p></div>}

                    <span className="text-[10px] font-black text-slate-500 uppercase block mb-3">Status Timeline</span>
                    <div className="space-y-0">
                      {(r.statusHistory || []).map((h, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full ${STATUS_CONFIG[h.status]?.dot || 'bg-slate-400'}`}></div>
                            {i < (r.statusHistory || []).length - 1 && <div className="w-0.5 h-6 bg-slate-200"></div>}
                          </div>
                          <div className="pb-3">
                            <p className="text-xs font-black text-slate-800 capitalize">{h.status?.replace('_', ' ')}</p>
                            <p className="text-[10px] text-slate-500">{h.note}</p>
                            <p className="text-[9px] text-slate-400">{new Date(h.timestamp).toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE REFERRAL MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl border-2 border-amber-400 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between border-b-4 border-amber-500">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">forward</span>
                </div>
                <div>
                  <h3 className="text-lg font-black font-heading">Create New Referral</h3>
                  <p className="text-xs text-amber-300/80 font-bold">Refer patient to higher facility</p>
                </div>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white cursor-pointer">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <form onSubmit={handleCreateReferral} className="p-6 overflow-y-auto space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">Select Patient <span className="text-rose-500">*</span></label>
                <select value={createForm.patientId} onChange={e => setCreateForm({...createForm, patientId: e.target.value})}
                  className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-amber-500" required>
                  <option value="">Select patient...</option>
                  {patients.map(p => (<option key={p._id} value={p._id}>{p.name} ({p.phone || p.abhaId})</option>))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">Refer To Facility <span className="text-rose-500">*</span></label>
                  <select value={createForm.toFacility} onChange={e => setCreateForm({...createForm, toFacility: e.target.value})}
                    className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-amber-500">
                    {FACILITIES.map(f => (<option key={f} value={f}>{f}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">Priority</label>
                  <select value={createForm.priority} onChange={e => setCreateForm({...createForm, priority: e.target.value})}
                    className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-amber-500">
                    <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="emergency">Emergency</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">Specialty</label>
                  <input type="text" value={createForm.specialty} onChange={e => setCreateForm({...createForm, specialty: e.target.value})}
                    placeholder="e.g. Pediatrics, Cardiology" className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">Transport Mode</label>
                  <select value={createForm.transportMode} onChange={e => setCreateForm({...createForm, transportMode: e.target.value})}
                    className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-amber-500">
                    <option value="self">Self</option><option value="asha_escort">ASHA Escort</option><option value="ambulance">Ambulance</option><option value="emergency">Emergency</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">Reason for Referral <span className="text-rose-500">*</span></label>
                <input type="text" value={createForm.reason} onChange={e => setCreateForm({...createForm, reason: e.target.value})}
                  placeholder="e.g. High-risk pregnancy, requires specialist" required
                  className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">Clinical Summary / Notes</label>
                <textarea value={createForm.clinicalSummary} onChange={e => setCreateForm({...createForm, clinicalSummary: e.target.value})} rows={3}
                  placeholder="Vitals, symptoms, diagnosis summary..." className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-amber-500 resize-none" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black shadow-xs">Create Referral</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPDATE STATUS MODAL */}
      {showStatusModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-3xl border-2 border-amber-400 shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between border-b-4 border-amber-500">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">update</span>
                </div>
                <div>
                  <h3 className="text-lg font-black font-heading">Update Referral Status</h3>
                  <p className="text-xs text-amber-300/80 font-bold">{showStatusModal.referralId}</p>
                </div>
              </div>
              <button onClick={() => setShowStatusModal(null)} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white cursor-pointer">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <form onSubmit={handleUpdateStatus} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">New Status <span className="text-rose-500">*</span></label>
                <div className="grid grid-cols-2 gap-2">
                  {['accepted', 'in_transit', 'in_consultation', 'completed', 'rejected', 'cancelled'].map(s => {
                    const cfg = STATUS_CONFIG[s];
                    return (
                      <button key={s} type="button"
                        onClick={() => setStatusForm({...statusForm, status: s})}
                        className={`p-3 rounded-xl border-2 text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                          statusForm.status === s ? `${cfg.color} border-current` : 'bg-white border-slate-200 text-slate-700 hover:border-amber-300'
                        }`}>
                        <span className="material-symbols-outlined text-[16px]">{cfg.icon}</span>
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              {statusForm.status === 'rejected' && (
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">Rejection Reason</label>
                  <input type="text" value={statusForm.rejectionReason} onChange={e => setStatusForm({...statusForm, rejectionReason: e.target.value})}
                    placeholder="Reason for rejection" className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-amber-500" />
                </div>
              )}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">Status Note</label>
                <textarea value={statusForm.note} onChange={e => setStatusForm({...statusForm, note: e.target.value})} rows={2}
                  placeholder="Add a note about this status update..." className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-amber-500 resize-none" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowStatusModal(null)} className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold">Cancel</button>
                <button type="submit" disabled={!statusForm.status}
                  className={`px-5 py-2.5 rounded-xl font-black shadow-xs ${statusForm.status ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
                  Update Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
