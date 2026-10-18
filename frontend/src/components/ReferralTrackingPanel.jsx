import { useState, useEffect } from 'react';
import api from '../services/api';

const STATUS_CONFIG = {
  pending: { color: 'bg-amber-50 text-amber-900 border-amber-200', icon: 'hourglass_empty', label: 'Pending', dot: 'bg-amber-500' },
  accepted: { color: 'bg-sky-50 text-sky-900 border-sky-200', icon: 'check_circle', label: 'Accepted', dot: 'bg-sky-500' },
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
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-[120] bg-slate-900 text-teal-300 px-5 py-3 rounded-2xl shadow-xl border border-teal-500/40 flex items-center gap-3 text-xs font-black animate-fadeIn">
          <span className="material-symbols-outlined text-teal-400 text-[18px]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
              <span className="material-symbols-outlined text-[20px]">forward</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">Referral Pipeline</h1>
            <span className="bg-teal-50 text-teal-900 text-xs font-black px-2.5 py-0.5 rounded-full border border-teal-200">{referrals.length} Cases</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">Real-time tele-triage tracking across sub-centres, CHC, and district hospitals.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-teal-700 to-teal-600 hover:from-teal-800 hover:to-teal-700 text-white px-5 py-2.5 rounded-xl font-black text-xs shadow-md shadow-teal-700/20 flex items-center gap-2 transition-all self-start sm:self-auto cursor-pointer active:scale-98"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>New Referral</span>
        </button>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[
          { key: 'total', label: 'Total', icon: 'summarize', color: 'text-slate-700', bg: 'bg-slate-50' },
          { key: 'pending', label: 'Pending', icon: 'hourglass_empty', color: 'text-amber-600', bg: 'bg-amber-50/50' },
          { key: 'accepted', label: 'Accepted', icon: 'check_circle', color: 'text-sky-600', bg: 'bg-sky-50/50' },
          { key: 'inTransit', label: 'In Transit', icon: 'local_shipping', color: 'text-indigo-600', bg: 'bg-indigo-50/50' },
          { key: 'completed', label: 'Completed', icon: 'verified', color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
          { key: 'rejected', label: 'Rejected', icon: 'cancel', color: 'text-rose-600', bg: 'bg-rose-50/50' },
        ].map(s => (
          <div key={s.key} className={`p-3.5 rounded-2xl border border-slate-200/80 ${s.bg} text-center shadow-2xs`}>
            <span className={`material-symbols-outlined text-[19px] ${s.color}`}>{s.icon}</span>
            <p className="text-xl font-black text-slate-900 mt-0.5">{stats[s.key] || 0}</p>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
        {[{ key: 'all', label: 'All Referrals' }, ...Object.entries(STATUS_CONFIG).map(([k, v]) => ({ key: k, label: v.label }))].map(f => (
          <button 
            key={f.key} 
            onClick={() => setFilter(f.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
              filter === f.key 
                ? 'bg-teal-700 text-white shadow-sm shadow-teal-700/25' 
                : 'bg-white border border-slate-200 text-slate-600 hover:border-teal-300'
            }`}
          >
            {f.label} {f.key !== 'all' && <span className="ml-1 opacity-70 font-mono">({referrals.filter(r => r.status === f.key).length})</span>}
          </button>
        ))}
      </div>

      {/* Referral List */}
      {loading ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
          <span className="material-symbols-outlined text-teal-600 text-[36px] animate-spin">progress_activity</span>
          <p className="text-xs text-slate-500 font-bold mt-2">Connecting to ABDM referral hub...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-2xs">
          <span className="material-symbols-outlined text-slate-300 text-[48px]">forward</span>
          <p className="text-sm text-slate-600 font-bold mt-2">No referrals in this category</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => {
            const sc = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending;
            const pc = PRIORITY_CONFIG[r.priority] || PRIORITY_CONFIG.medium;
            const isSelected = selectedReferral?._id === r._id;

            return (
              <div 
                key={r._id} 
                className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-teal-400 hover:shadow-md transition-all duration-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                  <div className="flex items-start gap-3.5">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${sc.color} border shadow-2xs`}>
                      <span className="material-symbols-outlined text-[20px]">{sc.icon}</span>
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-black bg-slate-900 text-teal-300 px-2.5 py-0.5 rounded-full">{r.referralId}</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${pc.color}`}>{pc.label}</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${sc.color}`}>{sc.label}</span>
                      </div>
                      <h3 className="text-sm font-black text-slate-900">
                        {r.patient?.name || 'Patient'} <span className="text-slate-400 font-normal">→</span> <span className="text-teal-800">{r.toFacility}</span>
                      </h3>
                      <p className="text-xs text-slate-600 font-bold mt-0.5">{r.reason} {r.specialty ? `• ${r.specialty}` : ''}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">By: {r.referredBy?.name || 'Healthcare Worker'} • {new Date(r.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    <button 
                      onClick={() => setSelectedReferral(isSelected ? null : r)}
                      className={`px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-all ${
                        isSelected 
                          ? 'bg-teal-50 border-teal-300 text-teal-800' 
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px] text-teal-600">
                        {isSelected ? 'expand_less' : 'timeline'}
                      </span>
                      <span>{isSelected ? 'Collapse' : 'Timeline'}</span>
                    </button>

                    {r.status !== 'completed' && r.status !== 'cancelled' && r.status !== 'rejected' && (
                      <button 
                        onClick={() => setShowStatusModal(r)}
                        className="px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-black cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-98"
                      >
                        <span className="material-symbols-outlined text-[15px]">update</span>
                        <span>Update Status</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Timeline */}
                {isSelected && (
                  <div className="mt-4 pt-4 border-t border-slate-100 animate-fadeIn">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Patient</span>
                        <p className="text-xs font-black text-slate-900 mt-0.5">{r.patient?.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{r.patient?.phone}</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">ABHA ID</span>
                        <p className="text-xs font-bold text-slate-900 font-mono mt-0.5">{r.patient?.abhaId || '91-4820-1940-2810'}</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Transport</span>
                        <p className="text-xs font-bold text-slate-900 capitalize mt-0.5">{r.transportMode?.replace('_', ' ')}</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">ETA</span>
                        <p className="text-xs font-bold text-slate-900 mt-0.5">{r.estimatedArrival || 'Scheduled'}</p>
                      </div>
                    </div>

                    {r.clinicalSummary && (
                      <div className="mb-4 p-3.5 bg-teal-50/70 rounded-2xl border border-teal-200">
                        <span className="text-[10px] font-black text-teal-900 uppercase tracking-wider block mb-1">Clinical Notes</span>
                        <p className="text-xs text-slate-800 font-medium leading-relaxed">{r.clinicalSummary}</p>
                      </div>
                    )}

                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-3">Status Progression</span>
                    <div className="space-y-0 pl-2">
                      {(r.statusHistory || []).map((h, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="flex flex-col items-center">
                            <div className={`w-3.5 h-3.5 rounded-full ${STATUS_CONFIG[h.status]?.dot || 'bg-slate-400'} ring-4 ring-slate-100`}></div>
                            {i < (r.statusHistory || []).length - 1 && <div className="w-0.5 h-7 bg-slate-200 my-0.5"></div>}
                          </div>
                          <div className="pb-3.5">
                            <p className="text-xs font-black text-slate-900 capitalize">{h.status?.replace('_', ' ')}</p>
                            <p className="text-[11px] text-slate-600 mt-0.5">{h.note}</p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{new Date(h.timestamp).toLocaleString('en-IN')}</p>
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

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-teal-950 text-white flex items-center justify-between border-b-2 border-teal-500">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-600/80 text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">forward</span>
                </div>
                <div>
                  <h3 className="text-lg font-black font-heading text-white">Create Referral Order</h3>
                  <p className="text-xs text-teal-300 font-bold">Transfer patient to secondary / tertiary centre</p>
                </div>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)} 
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <form onSubmit={handleCreateReferral} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">Select Patient <span className="text-rose-500">*</span></label>
                <select 
                  value={createForm.patientId} 
                  onChange={e => setCreateForm({...createForm, patientId: e.target.value})}
                  className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-teal-600" 
                  required
                >
                  <option value="">Select patient record...</option>
                  {patients.map(p => (<option key={p._id} value={p._id}>{p.name} ({p.phone || p.abhaId})</option>))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">Target Facility</label>
                  <select 
                    value={createForm.toFacility} 
                    onChange={e => setCreateForm({...createForm, toFacility: e.target.value})}
                    className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-teal-600"
                  >
                    {FACILITIES.map(f => (<option key={f} value={f}>{f}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">Priority</label>
                  <select 
                    value={createForm.priority} 
                    onChange={e => setCreateForm({...createForm, priority: e.target.value})}
                    className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-teal-600"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="emergency">Emergency (Immediate)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">Specialty</label>
                  <input 
                    type="text" 
                    value={createForm.specialty} 
                    onChange={e => setCreateForm({...createForm, specialty: e.target.value})}
                    placeholder="e.g. Pediatrics, Cardiology" 
                    className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-teal-600" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">Transport Mode</label>
                  <select 
                    value={createForm.transportMode} 
                    onChange={e => setCreateForm({...createForm, transportMode: e.target.value})}
                    className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-teal-600"
                  >
                    <option value="self">Self Transport</option>
                    <option value="asha_escort">ASHA Escort</option>
                    <option value="ambulance">108 Ambulance Dispatch</option>
                    <option value="emergency">Emergency BLS/ALS</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">Reason for Referral <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  value={createForm.reason} 
                  onChange={e => setCreateForm({...createForm, reason: e.target.value})}
                  placeholder="e.g. High-risk pregnancy, specialized ultrasound needed" 
                  required
                  className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-teal-600" 
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">Clinical Summary / Observations</label>
                <textarea 
                  value={createForm.clinicalSummary} 
                  onChange={e => setCreateForm({...createForm, clinicalSummary: e.target.value})} 
                  rows={3}
                  placeholder="Vitals, current medication, preliminary diagnosis..." 
                  className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:border-teal-600 resize-none" 
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)} 
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-black shadow-md shadow-teal-700/25 cursor-pointer active:scale-98"
                >
                  Dispatch Referral
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPDATE STATUS MODAL */}
      {showStatusModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-teal-950 text-white flex items-center justify-between border-b-2 border-teal-500">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">update</span>
                </div>
                <div>
                  <h3 className="text-base font-black font-heading text-white">Update Status</h3>
                  <p className="text-xs text-teal-300 font-mono font-bold">{showStatusModal.referralId}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowStatusModal(null)} 
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-2">Select Next Milestone <span className="text-rose-500">*</span></label>
                <div className="grid grid-cols-2 gap-2">
                  {['accepted', 'in_transit', 'in_consultation', 'completed', 'rejected', 'cancelled'].map(s => {
                    const cfg = STATUS_CONFIG[s];
                    return (
                      <button 
                        key={s} 
                        type="button"
                        onClick={() => setStatusForm({...statusForm, status: s})}
                        className={`p-2.5 rounded-xl border text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                          statusForm.status === s 
                            ? `${cfg.color} ring-2 ring-teal-600` 
                            : 'bg-white border-slate-200 text-slate-700 hover:border-teal-300'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">{cfg.icon}</span>
                        <span>{cfg.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">Status Note / Observation</label>
                <textarea 
                  value={statusForm.note} 
                  onChange={e => setStatusForm({...statusForm, note: e.target.value})} 
                  rows={2}
                  placeholder="e.g. Patient arrived at CHC OPD Room 4..." 
                  className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:border-teal-600 resize-none" 
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowStatusModal(null)} 
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={!statusForm.status}
                  className={`px-5 py-2.5 rounded-xl font-black shadow-xs ${
                    statusForm.status 
                      ? 'bg-teal-700 hover:bg-teal-800 text-white cursor-pointer' 
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Commit Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
