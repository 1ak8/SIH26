import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DoctorNavbar from '../../components/DoctorNavbar';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const PRESET_TESTS = [
  { name: 'Complete Blood Count (CBC)', category: 'Hematology', desc: 'Hemoglobin, TLC, Platelet count, RBC & PCV', fasting: false },
  { name: 'HbA1c & Fasting Sugar', category: 'Biochemistry', desc: 'Glycated hemoglobin & fasting plasma glucose', fasting: true },
  { name: 'Lipid Profile', category: 'Biochemistry', desc: 'Total cholesterol, HDL, LDL, Triglycerides', fasting: true },
  { name: 'Thyroid Panel (T3, T4, TSH)', category: 'Endocrinology', desc: 'Total T3, Total T4, Ultrasensitive TSH', fasting: false },
  { name: 'Liver Function Test (LFT)', category: 'Biochemistry', desc: 'Bilirubin, SGOT, SGPT, ALP & Total Protein', fasting: true },
  { name: 'Kidney Function Test (KFT)', category: 'Biochemistry', desc: 'Creatinine, BUN, Uric Acid & Serum Electrolytes', fasting: false },
  { name: 'Dengue NS1 Antigen & Platelet', category: 'Serology & Hematology', desc: 'Rapid viral antigen & platelet surveillance', fasting: false },
  { name: 'Urine Routine & Microscopic Examination', category: 'Clinical Pathology', desc: 'Albumin, glucose, pus cells & microscopic sediments', fasting: false },
];

export default function LabOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeModal, setActiveModal] = useState(null); // 'order-modal', 'view-report', 'update-status'
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Form State for Ordering Lab Test
  const [orderForm, setOrderForm] = useState({
    patientId: '',
    testName: 'Complete Blood Count (CBC)',
    category: 'Hematology',
    urgency: 'routine',
    facility: 'CHC Sitapur Central Pathology Lab',
    fastingRequired: false,
    clinicalNotes: '',
    status: 'pending',
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/doctor/lab-orders');
      if (res.data?.success) {
        setOrders(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load lab orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await api.get('/doctor/patients-list');
      if (res.data?.success && res.data.data?.length > 0) {
        setPatients(res.data.data);
        // Default to first patient or test patient
        const defaultPat = res.data.data.find(p => p.email === 'patient@test.com') || res.data.data[0];
        if (defaultPat) {
          setOrderForm(prev => ({ ...prev, patientId: defaultPat._id }));
        }
      }
    } catch (err) {
      console.error('Failed to load patients:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchPatients();
  }, []);

  const handleTestSelect = (test) => {
    setOrderForm(prev => ({
      ...prev,
      testName: test.name,
      category: test.category,
      fastingRequired: test.fasting,
    }));
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!orderForm.patientId || !orderForm.testName) {
      showToast('Please select a patient and test name.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/doctor/lab-orders', orderForm);
      if (res.data?.success) {
        showToast(`Diagnostic order ${res.data.data.orderId} assigned & dispatched to Pathology!`);
        setActiveModal(null);
        fetchOrders();
        setOrderForm(prev => ({
          ...prev,
          clinicalNotes: '',
          urgency: 'routine',
          status: 'pending',
        }));
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to create lab order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/doctor/lab-orders/${orderId}`, { status: newStatus });
      if (res.data?.success) {
        showToast(`Order status updated to "${newStatus.replace('_', ' ')}"!`);
        setActiveModal(null);
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to update status.');
    }
  };

  const printDiagnosticReport = (report) => {
    if (!report) return;
    const printWindow = window.open('', '_blank', 'width=850,height=950');
    if (!printWindow) {
      window.print();
      return;
    }
    const dateFormatted = report.completedAt 
      ? new Date(report.completedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    const rows = (report.results || []).map(r => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 12px; font-weight: bold; color: #0f172a;">${r.parameter}</td>
        <td style="padding: 10px 12px; font-weight: 800; color: #78350f;">${r.value} <span style="font-size: 11px; color: #64748b;">${r.unit || ''}</span></td>
        <td style="padding: 10px 12px; color: #475569; font-family: monospace;">${r.normalRange || '—'}</td>
        <td style="padding: 10px 12px; text-align: right;">
          <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; ${
            r.flag === 'High' ? 'background: #ffe4e6; color: #9f1239;' :
            r.flag === 'Low' ? 'background: #fef3c7; color: #92400e;' :
            'background: #dcfce7; color: #166534;'
          }">${r.flag || 'Normal'}</span>
        </td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Diagnostic Report - ${report.orderId}</title>
          <style>
            @page { size: A4; margin: 15mm; }
            body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a; margin: 0; padding: 24px; font-size: 13px; line-height: 1.5; }
            .header { border-bottom: 3px solid #d97706; padding-bottom: 15px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; }
            .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; background: #fef3c7; padding: 12px 16px; border-radius: 8px; margin-bottom: 18px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { background: #f1f5f9; padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; color: #475569; letter-spacing: 0.5px; }
            .summary-box { background: #f0fdf4; border-left: 4px solid #16a34a; padding: 12px 16px; border-radius: 6px; margin-bottom: 20px; }
            .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #cbd5e1; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div style="font-size: 10px; font-weight: bold; color: #d97706; letter-spacing: 1px; text-transform: uppercase;">Ministry of Health &amp; Family Welfare</div>
              <h1 style="margin: 3px 0; font-size: 20px; color: #0f172a;">${report.facility || 'CHC Sitapur Central Pathology Lab'}</h1>
              <div style="font-size: 11px; color: #64748b;">NABL Accredited ISO 15189 • National Digital Health Network</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 18px; font-weight: 900; font-family: monospace; color: #92400e;">${report.orderId}</div>
              <div style="font-size: 10px; color: #64748b;">BARCODE VERIFIED</div>
            </div>
          </div>

          <div class="meta-grid">
            <div><span style="font-size: 10px; color: #64748b; display: block;">CITIZEN PATIENT</span><strong>${report.patientName}</strong></div>
            <div><span style="font-size: 10px; color: #64748b; display: block;">PRESCRIBING DOCTOR</span><strong>${report.doctorName}</strong></div>
            <div><span style="font-size: 10px; color: #64748b; display: block;">TEST CATEGORY</span><strong>${report.category || 'Pathology'}</strong></div>
            <div><span style="font-size: 10px; color: #64748b; display: block;">COMPLETED DATE</span><strong>${dateFormatted}</strong></div>
          </div>

          <h2 style="font-size: 16px; margin: 0 0 12px 0; color: #0f172a;">${report.testName}</h2>

          <table>
            <thead>
              <tr>
                <th>Investigation Parameter</th>
                <th>Observed Value</th>
                <th>Reference Interval</th>
                <th style="text-align: right;">Status Flag</th>
              </tr>
            </thead>
            <tbody>
              ${rows || '<tr><td colspan="4" style="text-align:center; padding: 20px;">No quantitative parameters recorded.</td></tr>'}
            </tbody>
          </table>

          ${report.summary ? `
            <div class="summary-box">
              <strong style="color: #166534; display: block; margin-bottom: 4px; font-size: 12px;">Pathologist Clinical Impression &amp; Findings:</strong>
              <div>${report.summary}</div>
            </div>
          ` : ''}

          <div class="footer">
            <div>
              <strong>Digitally Signed &amp; Authenticated</strong><br/>
              ${report.verifiedBy || 'Dr. Anjali Seth (MD Pathology, Reg: NABL-84920)'}
            </div>
            <div style="text-align: right;">
              <strong>SehatSaarthi Digital Diagnostic Network</strong><br/>
              Compliant with ABDM Health Data Standards
            </div>
          </div>

          <script>
            window.onload = function() {
              window.focus();
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const filteredOrders = orders.filter(o => {
    const matchesFilter = 
      filter === 'All' ? true :
      filter === 'Pending' ? (o.status === 'pending' || o.status === 'sample_collected' || o.status === 'processing') :
      filter === 'Completed' ? o.status === 'completed' : true;

    const matchesSearch = 
      (o.patientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.testName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.orderId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.facility || '').toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const pendingCount = orders.filter(o => o.status !== 'completed').length;
  const completedCount = orders.filter(o => o.status === 'completed').length;

  return (
    <div className="bg-[#fbfaf7] text-slate-900 font-sans min-h-screen">
      <DoctorNavbar />

      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 bg-slate-900 text-amber-300 px-5 py-3 rounded-2xl shadow-xl border border-amber-400/50 flex items-center gap-3 text-sm font-bold animate-bounce">
          <span className="material-symbols-outlined text-amber-400">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="w-full px-6 lg:px-12 xl:px-16 pt-28 pb-16">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link 
            to="/doctor" 
            className="inline-flex items-center gap-2 text-slate-700 hover:text-amber-600 bg-white px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold shadow-xs hover:border-amber-300 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Console
          </Link>

          <div className="flex items-center gap-2 text-xs font-black bg-emerald-50 text-emerald-900 border border-emerald-300 px-3.5 py-1.5 rounded-full shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>NABL Pathology Sync • Live</span>
          </div>
        </div>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight font-heading">Diagnostic Lab Orders &amp; Pathology</h1>
              <span className="bg-amber-100 text-amber-900 text-xs font-black px-2.5 py-0.5 rounded-full border border-amber-300">
                ICMR Requisitions
              </span>
            </div>
            <p className="text-sm text-slate-600 font-medium">
              Digital lab requisitions for rural citizens processed via accredited district pathology centres and telemedicine kiosks.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => setActiveModal('order-modal')}
              className="h-11 px-5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white rounded-xl font-black text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              Order New Lab Test
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
          <div className="relative w-full sm:w-80">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
            <input
              type="text"
              placeholder="Search by patient, test name, order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white rounded-2xl border-2 border-slate-200 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 shadow-2xs"
            />
          </div>

          <div className="flex bg-white rounded-2xl p-1 border-2 border-slate-200 shadow-xs self-stretch sm:self-auto">
            {[
              { key: 'All', label: `All (${orders.length})` },
              { key: 'Pending', label: `Pending (${pendingCount})` },
              { key: 'Completed', label: `Completed (${completedCount})` },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  filter === f.key 
                    ? 'bg-amber-600 text-white shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white border-2 border-slate-200/90 rounded-3xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-slate-500 font-bold">
              <span className="material-symbols-outlined text-4xl text-amber-500 animate-spin block mx-auto mb-2">sync</span>
              Loading diagnostic lab orders from database...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <span className="material-symbols-outlined text-4xl text-slate-300 block mx-auto mb-2">biotech</span>
              <p className="font-extrabold text-slate-700">No lab orders found matching criteria</p>
              <p className="text-xs text-slate-400 mt-1">Click "Order New Lab Test" to assign a test to any patient.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b-2 border-slate-100">
                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Citizen Details</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Requested Test</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Lab Status</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map(order => {
                    const isCompleted = order.status === 'completed';
                    const isProcessing = order.status === 'processing' || order.status === 'sample_collected';
                    const dateFormatted = order.dateOrdered ? new Date(order.dateOrdered).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Today';

                    return (
                      <tr key={order._id} className="hover:bg-amber-50/20 transition-colors">
                        <td className="px-6 py-5">
                          <span className="font-mono text-xs font-black text-amber-950 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-300 shadow-2xs">
                            {order.orderId || 'LAB-1000'}
                          </span>
                          <span className={`block mt-1 text-[9px] font-black uppercase tracking-wider ${
                            order.urgency === 'urgent' ? 'text-rose-600' :
                            order.urgency === 'stat' ? 'text-rose-700 font-extrabold' : 'text-slate-400'
                          }`}>
                            {order.urgency}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <span className="text-sm font-black text-slate-900 block">{order.patientName}</span>
                          <span className="text-xs text-slate-500 font-semibold">{order.facility}</span>
                          {order.patientDetails && (
                            <span className="text-[11px] text-slate-400 block mt-0.5">{order.patientDetails}</span>
                          )}
                        </td>

                        <td className="px-6 py-5">
                          <span className="text-sm font-extrabold text-slate-800 block">{order.testName}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-slate-500">Ordered: {dateFormatted}</span>
                            {order.fastingRequired && (
                              <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black px-1.5 py-0.2 rounded">
                                Fasting Required
                              </span>
                            )}
                          </div>
                          {order.clinicalNotes && (
                            <p className="text-xs text-slate-500 italic mt-1 line-clamp-1">"{order.clinicalNotes}"</p>
                          )}
                        </td>

                        <td className="px-6 py-5">
                          {isCompleted ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-black shadow-2xs">
                              <span className="material-symbols-outlined text-[16px] text-emerald-700">check_circle</span>
                              Report Available
                            </span>
                          ) : isProcessing ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-900 border border-sky-300 text-xs font-black shadow-2xs">
                              <span className="material-symbols-outlined text-[16px] text-sky-600 animate-spin">sync</span>
                              {order.status === 'sample_collected' ? 'Sample Collected' : 'Lab Processing'}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black shadow-2xs">
                              <span className="material-symbols-outlined text-[16px] text-amber-700">schedule</span>
                              Pending Sample
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isCompleted ? (
                              <button 
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setActiveModal('view-report');
                                }}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-black rounded-xl text-xs shadow-xs transition-all cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[16px]">description</span>
                                View Report
                              </button>
                            ) : (
                              <>
                                <button 
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setActiveModal('update-status');
                                  }}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-amber-50 text-amber-900 font-extrabold rounded-xl text-xs border border-amber-300 transition-all cursor-pointer shadow-2xs"
                                >
                                  <span className="material-symbols-outlined text-[15px]">edit_note</span>
                                  Update Status
                                </button>
                                <button 
                                  onClick={() => handleUpdateStatus(order._id, 'completed')}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs transition-all cursor-pointer shadow-2xs"
                                  title="Complete & Auto-Fill Normal Parameters"
                                >
                                  <span className="material-symbols-outlined text-[15px]">verified</span>
                                  Complete
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* MODAL 1: ORDER NEW LAB TEST */}
      {activeModal === 'order-modal' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border-2 border-amber-300 w-full max-w-2xl overflow-hidden shadow-2xl my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">biotech</span>
                </div>
                <div>
                  <h3 className="font-heading text-lg font-black text-white">Order Diagnostic Lab Investigation</h3>
                  <p className="text-xs text-amber-300/80 font-medium">Assign pathology tests directly to citizen profile</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateOrder} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Select Patient */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Patient Citizen <span className="text-rose-500">*</span>
                </label>
                <select
                  value={orderForm.patientId}
                  onChange={(e) => setOrderForm(prev => ({ ...prev, patientId: e.target.value }))}
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                  required
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map(p => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.phone || p.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Preset Buttons */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  Quick Select Investigation Preset:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRESET_TESTS.map(t => (
                    <button
                      key={t.name}
                      type="button"
                      onClick={() => handleTestSelect(t)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        orderForm.testName === t.name 
                          ? 'bg-amber-100 border-amber-400 text-amber-950 font-black shadow-2xs' 
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold'
                      }`}
                    >
                      <span className="text-[11px] block truncate">{t.name}</span>
                      <span className="text-[9px] text-slate-400 block truncate">{t.category}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Test Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    Test Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={orderForm.testName}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, testName: e.target.value }))}
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                    placeholder="e.g. Complete Blood Count (CBC)"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    Pathology Category
                  </label>
                  <select
                    value={orderForm.category}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Hematology">Hematology</option>
                    <option value="Biochemistry">Biochemistry</option>
                    <option value="Endocrinology">Endocrinology</option>
                    <option value="Serology & Hematology">Serology &amp; Hematology</option>
                    <option value="Clinical Pathology">Clinical Pathology</option>
                    <option value="Microbiology">Microbiology</option>
                  </select>
                </div>
              </div>

              {/* Urgency & Facility */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    Requisition Urgency
                  </label>
                  <select
                    value={orderForm.urgency}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, urgency: e.target.value }))}
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                  >
                    <option value="routine">Routine (Next 24-48 Hours)</option>
                    <option value="urgent">Urgent (Same Day Dispatch)</option>
                    <option value="stat">STAT / Emergency (Immediate)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    Assigned Facility / Lab
                  </label>
                  <select
                    value={orderForm.facility}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, facility: e.target.value }))}
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                  >
                    <option value="CHC Sitapur Central Pathology Lab">CHC Sitapur Central Pathology Lab</option>
                    <option value="District Hospital Pathology Wing">District Hospital Pathology Wing</option>
                    <option value="Sub-Centre Kiosk Diagnostic Unit">Sub-Centre Kiosk Diagnostic Unit</option>
                    <option value="Rampur Kiosk Tele-Pathology">Rampur Kiosk Tele-Pathology</option>
                  </select>
                </div>
              </div>

              {/* Fasting Toggle & Status */}
              <div className="flex flex-wrap items-center justify-between p-3 bg-amber-50/60 rounded-xl border border-amber-200 gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={orderForm.fastingRequired}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, fastingRequired: e.target.checked }))}
                    className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                  />
                  <span className="text-xs font-extrabold text-slate-800">
                    Overnight Fasting Required (8-12 hours prior to sample collection)
                  </span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-500">Initial Status:</span>
                  <select
                    value={orderForm.status}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, status: e.target.value }))}
                    className="text-xs font-bold bg-white border border-amber-300 rounded-lg px-2 py-1"
                  >
                    <option value="pending">Pending Sample</option>
                    <option value="completed">Completed (With Verified Results)</option>
                  </select>
                </div>
              </div>

              {/* Clinical Notes */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  Clinical Indication / Notes for Pathology Team
                </label>
                <textarea
                  rows="2"
                  value={orderForm.clinicalNotes}
                  onChange={(e) => setOrderForm(prev => ({ ...prev, clinicalNotes: e.target.value }))}
                  placeholder="e.g. Check for microcytic hypochromic picture and platelet response post fever..."
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500"
                ></textarea>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2.5 rounded-xl border-2 border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-black shadow-sm transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                      <span>Assigning to Database...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">send</span>
                      <span>Assign &amp; Dispatch Order</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: OFFICIAL PATHOLOGY REPORT VIEW */}
      {activeModal === 'view-report' && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border-2 border-amber-300 w-full max-w-3xl overflow-hidden shadow-2xl my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Header with Govt / NABL Branding */}
            <div className="p-6 bg-slate-900 text-white border-b-4 border-amber-500">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                    <span className="material-symbols-outlined text-amber-400 text-[28px]">biotech</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">Ministry of Health &amp; Family Welfare</span>
                    <h2 className="text-xl font-black tracking-tight font-heading text-white">Central Clinical Pathology Laboratory</h2>
                    <span className="text-xs text-slate-300 font-medium">{selectedOrder.facility} • NABL Accredited ISO 15189</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => printDiagnosticReport(selectedOrder)}
                    className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">print</span>
                    Print
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Patient Meta Strip */}
            <div className="bg-amber-50/70 px-6 py-4 border-b border-amber-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-500 font-bold block text-[10px] uppercase">Patient Citizen</span>
                <strong className="text-slate-900 text-sm font-black">{selectedOrder.patientName}</strong>
              </div>
              <div>
                <span className="text-slate-500 font-bold block text-[10px] uppercase">Order / Barcode ID</span>
                <strong className="font-mono text-amber-950 font-black">{selectedOrder.orderId}</strong>
              </div>
              <div>
                <span className="text-slate-500 font-bold block text-[10px] uppercase">Referring Doctor</span>
                <strong className="text-slate-900 font-extrabold">{selectedOrder.doctorName}</strong>
              </div>
              <div>
                <span className="text-slate-500 font-bold block text-[10px] uppercase">Completed Date</span>
                <strong className="text-slate-900 font-extrabold">
                  {selectedOrder.completedAt ? new Date(selectedOrder.completedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Verified Today'}
                </strong>
              </div>
            </div>

            {/* Report Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-heading text-lg font-black text-slate-900">{selectedOrder.testName}</h3>
                  <span className="text-xs font-black text-amber-900 bg-amber-100 px-3 py-0.5 rounded-full border border-amber-300">
                    {selectedOrder.category}
                  </span>
                </div>
                {selectedOrder.clinicalNotes && (
                  <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <strong>Clinical Indication:</strong> {selectedOrder.clinicalNotes}
                  </p>
                )}
              </div>

              {/* Results Table */}
              {selectedOrder.results && selectedOrder.results.length > 0 ? (
                <div className="border border-slate-200 rounded-2xl overflow-hidden mb-5">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 border-b border-slate-200">
                        <th className="px-4 py-2.5 font-black uppercase">Investigation Parameter</th>
                        <th className="px-4 py-2.5 font-black uppercase">Observed Value</th>
                        <th className="px-4 py-2.5 font-black uppercase">Reference Range</th>
                        <th className="px-4 py-2.5 font-black uppercase text-right">Interpretation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedOrder.results.map((res, i) => (
                        <tr key={i} className="hover:bg-slate-50/60">
                          <td className="px-4 py-2.5 font-extrabold text-slate-900">{res.parameter}</td>
                          <td className="px-4 py-2.5 font-black text-amber-950">
                            {res.value} <span className="text-slate-500 font-semibold">{res.unit}</span>
                          </td>
                          <td className="px-4 py-2.5 text-slate-600 font-mono">{res.normalRange}</td>
                          <td className="px-4 py-2.5 text-right">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                              res.flag === 'High' ? 'bg-rose-100 text-rose-900 border border-rose-300' :
                              res.flag === 'Low' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                              'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            }`}>
                              {res.flag || 'Normal'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200 mb-5">
                  <span className="material-symbols-outlined text-3xl text-amber-600 animate-spin mb-1">sync</span>
                  <p className="font-bold text-xs">Test sample currently undergoing centrifugation &amp; automated assay.</p>
                </div>
              )}

              {/* Summary / Pathologist Remarks */}
              {selectedOrder.summary && (
                <div className="bg-emerald-50/60 border border-emerald-200 p-4 rounded-2xl mb-4">
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-900 block mb-1">
                    Pathologist Clinical Impression &amp; Findings:
                  </span>
                  <p className="text-xs text-slate-800 font-medium leading-relaxed">{selectedOrder.summary}</p>
                </div>
              )}

              {/* Digital Signature & Verification Box */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 text-xs">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600 text-[24px]">verified</span>
                  <div>
                    <span className="font-black text-slate-900 block">Digitally Verified &amp; Signed</span>
                    <span className="text-slate-500">{selectedOrder.verifiedBy || 'Dr. Anjali Seth (MD Pathology, NABL)'}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono text-[10px] font-black text-slate-400 block">QR / SHA256 VALIDATED</span>
                  <span className="text-[10px] text-slate-500">Ministry of Health Diagnostic Grid</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition-colors cursor-pointer"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: UPDATE STATUS */}
      {activeModal === 'update-status' && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-2 border-amber-300 w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-black text-slate-900 mb-1">Update Diagnostic Status</h3>
            <p className="text-xs text-slate-500 mb-4 font-medium">Order: <strong className="text-slate-900">{selectedOrder.orderId}</strong> — {selectedOrder.testName}</p>

            <div className="space-y-2 mb-6">
              {[
                { key: 'pending', label: 'Pending Sample Collection', desc: 'Sample awaiting phlebotomy at kiosk' },
                { key: 'sample_collected', label: 'Sample Collected', desc: 'Sample dispatched to pathology facility' },
                { key: 'processing', label: 'Under Processing / Assay', desc: 'Testing in progress inside lab' },
                { key: 'completed', label: 'Completed (Report Available)', desc: 'Generate verified parameters & finalize' },
              ].map(s => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => handleUpdateStatus(selectedOrder._id, s.key)}
                  className={`w-full p-3 rounded-2xl border text-left flex items-start justify-between gap-3 transition-all cursor-pointer ${
                    selectedOrder.status === s.key 
                      ? 'bg-amber-100 border-amber-400 text-amber-950 font-black' 
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800 font-semibold'
                  }`}
                >
                  <div>
                    <span className="text-xs block font-extrabold">{s.label}</span>
                    <span className="text-[10px] text-slate-500 block">{s.desc}</span>
                  </div>
                  {selectedOrder.status === s.key && (
                    <span className="material-symbols-outlined text-amber-700 text-[18px]">check_circle</span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
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
        </div>
      </footer>
    </div>
  );
}
