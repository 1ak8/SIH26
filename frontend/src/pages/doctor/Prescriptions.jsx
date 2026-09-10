import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import DoctorNavbar from '../../components/DoctorNavbar';

const MEDICINES = [
  { num: 1, name: 'Amoxicillin 500mg (Cap)', generic: 'Amoxicillin IP', dosage: '1 capsule thrice daily (After Meals) × 5 days', jasCode: 'JAS-0044' },
  { num: 2, name: 'Cetirizine 10mg (Tab)', generic: 'Cetirizine Hydrochloride IP', dosage: '1 tablet at bedtime × 3 days', jasCode: 'JAS-0089' },
  { num: 3, name: 'Paracetamol 650mg (Tab)', generic: 'Paracetamol IP', dosage: 'As needed for fever / pain (Max 3/day)', jasCode: 'JAS-0012' },
];

export default function Prescriptions() {
  const { user } = useAuth();
  const [diagnosis, setDiagnosis] = useState('Mild acute bronchitis, non-productive cough x 3 days, throat irritation, no fever, chest clear on tele-auscultation.');
  const [advice, setAdvice] = useState('Warm saline gargles twice daily, adequate hydration. Review in CHC OPD if cough persists beyond 7 days.');
  const [toast, setToast] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSendRx = () => {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setToast(true);
      setTimeout(() => setToast(false), 3500);
    }, 1000);
  };
  
  return (
    <div className="bg-[#fbfaf7] text-slate-900 font-sans min-h-screen">
      <DoctorNavbar />

      <main className="w-full px-6 lg:px-12 xl:px-16 pt-28 pb-16">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link 
            to="/doctor" 
            className="inline-flex items-center gap-2 text-slate-700 hover:text-amber-600 bg-white px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold shadow-xs hover:border-amber-300 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Console
          </Link>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create e-Prescription</h1>
              <p className="text-sm text-slate-600 font-medium">ABDM Digital Signature • Jan Aushadhi generic delivery direct to patient phone.</p>
            </div>
            <span className="bg-amber-100 text-amber-900 text-xs font-extrabold px-3 py-1 rounded-full border border-amber-300 self-start sm:self-auto">
              OPD Token #04 • Aditya Verma
            </span>
          </div>
          
          <div className="bg-white border-2 border-slate-200/90 rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-sm">
            {/* Rx Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 border-2 border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[32px]">description</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h2 className="text-2xl font-extrabold text-slate-900">National e-Prescription</h2>
                    <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full">ABDM Signed</span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">Prescribed under Pradhan Mantri Digital Health Initiative</span>
                </div>
              </div>

              <div className="bg-amber-50/60 border border-amber-200 p-3.5 rounded-2xl flex items-center gap-4 shrink-0">
                <div className="flex flex-col">
                  <span className="text-[11px] text-slate-500 font-bold uppercase">Patient</span>
                  <span className="text-sm font-extrabold text-slate-900">Aditya Verma (32/M)</span>
                  <span className="text-[10px] font-mono text-amber-900">91-4820-1940-2810</span>
                </div>
                <div className="h-8 w-px bg-amber-200"></div>
                <div className="flex flex-col">
                  <span className="text-[11px] text-slate-500 font-bold uppercase">Centre</span>
                  <span className="text-xs font-bold text-slate-800">Rampur Sub-Centre</span>
                  <span className="text-[10px] text-amber-800 font-extrabold">ASHA: Sunita Devi</span>
                </div>
              </div>
            </div>

            {/* Vitals Strip */}
            <section className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4.5">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">Triage Vitals Logged by ASHA</span>
                <span className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
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
                    <span className="text-[11px] text-slate-500 font-bold">{v.label}</span>
                    <span className="text-xl font-black text-slate-900 mt-0.5">{v.value} <span className="text-xs text-slate-500 font-bold">{v.unit}</span></span>
                  </div>
                ))}
              </div>
            </section>

            {/* Form */}
            <form className="flex flex-col gap-6" onSubmit={e => e.preventDefault()}>
              {/* Diagnosis */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-extrabold text-slate-800">Clinical Diagnosis &amp; Symptoms</label>
                <textarea 
                  className="w-full bg-white border-2 border-slate-200 focus:border-amber-500 rounded-2xl p-3.5 text-sm font-semibold text-slate-900 outline-none transition-all shadow-2xs" 
                  rows="3"
                  value={diagnosis} 
                  onChange={e => setDiagnosis(e.target.value)} 
                />
              </div>

              {/* Prescribed Medicines */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-extrabold text-slate-800">Prescribed Generic Medicines (Jan Aushadhi Scheme)</label>
                  <button 
                    onClick={() => alert('Add Medicine from National Essential Medicine List')}
                    className="inline-flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-3 py-1 rounded-xl font-extrabold transition-all" 
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">add_circle</span>
                    <span>Add Medicine</span>
                  </button>
                </div>
                
                <div className="flex flex-col gap-3">
                  {MEDICINES.map(med => (
                    <div key={med.num} className="bg-slate-50 border-2 border-slate-200/90 rounded-2xl p-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-950 font-black text-xs flex items-center justify-center shrink-0 border border-amber-300">
                          #{med.num}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-extrabold text-slate-900">{med.name}</span>
                            <span className="bg-emerald-100 text-emerald-900 text-[10px] font-black px-2 py-0.2 rounded-md">{med.jasCode}</span>
                          </div>
                          <p className="text-xs text-slate-600 font-semibold mt-0.5">{med.dosage}</p>
                        </div>
                      </div>
                      <button 
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1" 
                        title="Remove Medicine" 
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advice */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-extrabold text-slate-800">Dietary Instructions, Home Care &amp; Review Follow-Up</label>
                <input 
                  className="w-full bg-white border-2 border-slate-200 focus:border-amber-500 rounded-2xl px-4 py-3.5 text-sm font-semibold text-slate-900 outline-none transition-all shadow-2xs" 
                  type="text"
                  value={advice} 
                  onChange={e => setAdvice(e.target.value)} 
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
                <Link 
                  to="/doctor/labs"
                  className="h-12 px-6 flex items-center justify-center gap-2 bg-white border-2 border-slate-300 text-slate-800 text-sm font-extrabold rounded-xl hover:bg-slate-100 transition-all shadow-xs" 
                >
                  <span className="material-symbols-outlined text-[20px] text-amber-600">science</span>
                  <span>Order Diagnostic Lab</span>
                </Link>

                <button 
                  className="h-12 px-8 flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-sm font-extrabold rounded-xl transition-all shadow-sm"
                  type="button" 
                  onClick={handleSendRx} 
                  disabled={sending}
                >
                  {sending ? (
                    <>
                      <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                      <span>Signing &amp; Dispatching...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px]">send</span>
                      <span>Digitally Sign &amp; Send to Patient</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border-2 border-amber-400 p-5 rounded-2xl shadow-xl flex items-center gap-3.5 max-w-md animate-fadeIn">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">verified</span>
          </div>
          <div>
            <span className="text-sm font-extrabold text-slate-900 block">e-Prescription Dispatched Successfully</span>
            <span className="text-xs text-slate-600 font-medium">Digital token sent to Aditya Verma (+91 98*** **410) &amp; ABDM Jan Aushadhi grid.</span>
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
