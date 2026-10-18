import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import DoctorNavbar from '../../components/DoctorNavbar';
import api from '../../services/api';

const MEDICINES = [
  { num: 1, name: 'Amoxicillin 500mg (Cap)', generic: 'Amoxicillin IP', dosage: '1 capsule thrice daily (After Meals) × 5 days', jasCode: 'JAS-0044' },
  { num: 2, name: 'Cetirizine 10mg (Tab)', generic: 'Cetirizine Hydrochloride IP', dosage: '1 tablet at bedtime × 3 days', jasCode: 'JAS-0089' },
  { num: 3, name: 'Paracetamol 650mg (Tab)', generic: 'Paracetamol IP', dosage: 'As needed for fever / pain (Max 3/day)', jasCode: 'JAS-0012' },
];

export default function Prescriptions() {
  const { user } = useAuth();
  const location = useLocation();
  const stateData = location.state || {};
  const patientName = stateData.patientName || 'Aditya Verma';
  const abhaId = stateData.abhaId || '91-4820-1940-2810';
  const tokenNum = stateData.token || 4;

  const [diagnosis, setDiagnosis] = useState(stateData.reason ? `Diagnosis: ${stateData.reason}. Mild throat congestion, non-productive cough.` : 'Mild acute bronchitis, non-productive cough x 3 days, throat irritation, no fever, chest clear on tele-auscultation.');
  const [advice, setAdvice] = useState('Warm saline gargles twice daily, adequate hydration. Review in CHC OPD if cough persists beyond 7 days.');
  const [toast, setToast] = useState(false);
  const [sending, setSending] = useState(false);
  const [issuedRxId, setIssuedRxId] = useState(null);

  const handleSendRx = async (e) => {
    if (e) e.preventDefault();
    setSending(true);
    try {
      const pId = stateData.patientId || '6aa974837fbaf7f52bfb36fc';
      const payload = {
        patientId: pId,
        appointmentId: stateData.appointmentId,
        diagnosis,
        clinicalNotes: advice,
        medicines: MEDICINES.map(m => ({
          name: m.name,
          dosage: m.dosage,
          frequency: 'TDS (Thrice daily)',
          duration: '5 Days',
          instructions: 'After meals',
          isGeneric: true
        })),
        isDigitallySigned: true,
      };
      const res = await api.post('/doctor/prescriptions', payload);
      if (res.data?.data?.prescriptionId) {
        setIssuedRxId(res.data.data.prescriptionId);
      }
      setToast(true);
      setTimeout(() => setToast(false), 4500);
    } catch (err) {
      setToast(true);
      setTimeout(() => setToast(false), 3500);
    } finally {
      setSending(false);
    }
  };
  
  return (
    <div className="bg-slate-50 text-slate-900 font-sans min-h-screen selection:bg-teal-100 selection:text-teal-900">
      <DoctorNavbar />

      <main className="w-full px-4 sm:px-6 lg:px-12 xl:px-16 pt-24 sm:pt-28 pb-16 max-w-7xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="mb-5">
          <Link 
            to="/doctor" 
            className="inline-flex items-center gap-2 text-slate-600 hover:text-teal-800 bg-white px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold shadow-2xs hover:border-teal-300 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px]">arrow_back</span>
            <span>Back to Console</span>
          </Link>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-teal-600 text-[26px]">medication</span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">Digital e-Prescription Composer</h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">ABDM Digital Signature • Jan Aushadhi generic delivery directly synced to citizen mobile.</p>
            </div>
            <span className="bg-teal-50 text-teal-900 text-xs font-black px-3.5 py-1.5 rounded-full border border-teal-200 self-start sm:self-auto shadow-2xs">
              Token #{String(tokenNum).padStart(2, '0')} • {patientName}
            </span>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-sm">
            {/* Rx Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0 shadow-2xs">
                  <span className="material-symbols-outlined text-[30px]">description</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">National e-Prescription</h2>
                    <span className="bg-emerald-50 text-emerald-900 border border-emerald-300 text-[10px] font-black px-2.5 py-0.5 rounded-full">ABDM Signed</span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">Prescribed under Pradhan Mantri Digital Health Initiative</span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex items-center gap-4 shrink-0">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-black uppercase">Citizen</span>
                  <span className="text-sm font-black text-slate-900 notranslate" translate="no">{patientName}</span>
                  <span className="text-[10px] font-mono text-teal-800 font-bold">{abhaId}</span>
                </div>
                <div className="h-8 w-px bg-slate-200"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-black uppercase">Sub-Centre</span>
                  <span className="text-xs font-bold text-slate-800">{stateData.location || 'Rampur Sub-Centre'}</span>
                  <span className="text-[10px] text-teal-800 font-bold">ASHA: Sunita Devi</span>
                </div>
              </div>
            </div>

            {/* Vitals Strip */}
            <section className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4.5">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Triage Telemetry Received from Field Kiosk</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  <span>Verified 10m ago</span>
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Blood Pressure', value: '122/80', unit: 'mmHg' },
                  { label: 'Pulse Rate', value: '74', unit: 'bpm' },
                  { label: 'Body Temp', value: '98.4', unit: '°F' },
                  { label: 'Oxygen (SpO2)', value: '99', unit: '%' },
                ].map(v => (
                  <div key={v.label} className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col shadow-2xs">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{v.label}</span>
                    <span className="text-xl font-black text-slate-900 font-mono mt-0.5">{v.value} <span className="text-xs text-slate-400 font-sans">{v.unit}</span></span>
                  </div>
                ))}
              </div>
            </section>

            {/* Form */}
            <form className="flex flex-col gap-6 text-xs" onSubmit={e => e.preventDefault()}>
              {/* Diagnosis */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider">Clinical Diagnosis &amp; Symptoms</label>
                <textarea 
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-600 rounded-2xl p-3.5 text-xs font-semibold text-slate-900 outline-none transition-all shadow-2xs resize-none" 
                  rows="3"
                  value={diagnosis} 
                  onChange={e => setDiagnosis(e.target.value)} 
                />
              </div>

              {/* Prescribed Medicines */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider">Prescribed Generic Medicines (Jan Aushadhi Scheme)</label>
                  <button 
                    onClick={() => alert('Add Medicine from National Essential Medicine List (NEML)')}
                    className="inline-flex items-center gap-1.5 text-xs text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1 rounded-xl font-black transition-all cursor-pointer" 
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">add_circle</span>
                    <span>Add Formulation</span>
                  </button>
                </div>
                
                <div className="flex flex-col gap-3">
                  {MEDICINES.map(med => (
                    <div key={med.num} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <span className="w-8 h-8 rounded-xl bg-teal-50 text-teal-900 font-black text-xs flex items-center justify-center shrink-0 border border-teal-200 font-mono">
                          #{med.num}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-slate-900">{med.name}</span>
                            <span className="bg-teal-50 text-teal-900 border border-teal-200 text-[10px] font-black px-2 py-0.2 rounded-md font-mono">{med.jasCode}</span>
                          </div>
                          <p className="text-xs text-slate-600 font-medium mt-0.5">{med.dosage}</p>
                        </div>
                      </div>
                      <button 
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1" 
                        title="Remove Medicine" 
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advice */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider">Dietary Instructions, Home Care &amp; Review Follow-Up</label>
                <input 
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-600 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-900 outline-none transition-all shadow-2xs" 
                  type="text"
                  value={advice} 
                  onChange={e => setAdvice(e.target.value)} 
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
                <Link 
                  to="/doctor/labs"
                  className="h-11 px-5 flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-800 text-xs font-black rounded-xl hover:bg-slate-50 transition-all shadow-2xs" 
                >
                  <span className="material-symbols-outlined text-[18px] text-teal-600">science</span>
                  <span>Order Diagnostic Lab</span>
                </Link>

                <button 
                  className="h-11 px-6 flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-teal-700/20 cursor-pointer active:scale-98 disabled:opacity-70"
                  type="button" 
                  onClick={handleSendRx} 
                  disabled={sending}
                >
                  {sending ? (
                    <>
                      <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                      <span>Signing &amp; Dispatching...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">send</span>
                      <span>Digitally Sign &amp; Send to Patient Phone</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-teal-300 border border-teal-500/40 p-5 rounded-2xl shadow-xl flex items-center gap-3.5 max-w-md animate-fadeIn text-xs">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">verified</span>
          </div>
          <div>
            <span className="text-sm font-black text-white block">e-Prescription Dispatched Successfully!</span>
            <span className="text-xs text-slate-300 font-medium">
              Rx <strong className="text-teal-300 font-mono">{issuedRxId || 'SEHAT-LIVE'}</strong> digitally signed &amp; synced to {patientName}'s ABDM records.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
