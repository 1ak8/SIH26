import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import DoctorNavbar from '../../components/DoctorNavbar';

const MEDICINES = [
  { num: 1, name: 'Amoxicillin 500mg (Cap)', dosage: '1 capsule thrice daily (After Meals) × 5 days' },
  { num: 2, name: 'Cetirizine 10mg (Tab)', dosage: '1 tablet at bedtime × 3 days' },
  { num: 3, name: 'Paracetamol 650mg (Tab)', dosage: 'As needed for fever / pain × max 3 per day' },
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
    <div className="bg-surface-container-lowest text-on-surface font-sans min-h-screen pt-20">
      <DoctorNavbar />
      <main className="w-full max-w-4xl mx-auto px-4 lg:px-8 py-8">
        <h1 className="text-headline-lg font-bold mb-6">Create Digital Prescription</h1>
        
        <div className="bg-surface-container-lowest border border-surface-variant rounded-lg p-6 flex flex-col gap-5 shadow-sm">
          {/* Rx Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-surface-variant gap-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[28px]">description</span>
              <div>
                <h2 className="text-headline-md font-bold text-on-surface">Digital Prescription</h2>
                <span className="text-label-sm text-secondary">Directly delivered to patient phone</span>
              </div>
            </div>
            <div className="bg-surface-container-low px-4 py-2 rounded-lg flex items-center gap-4 shrink-0">
              <div className="flex flex-col">
                <span className="text-label-sm text-secondary">Patient</span>
                <span className="text-label-lg font-bold text-on-surface">Aditya Verma (32/M)</span>
              </div>
              <div className="h-8 w-px bg-surface-variant"></div>
              <div className="flex flex-col">
                <span className="text-label-sm text-secondary">Consultation</span>
                <span className="text-label-md font-bold text-primary">#04 OPD</span>
              </div>
            </div>
          </div>

          {/* Vitals Strip */}
          <section className="bg-surface-container-low border border-surface-variant rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-label-sm font-bold text-secondary uppercase tracking-wider">Recorded Vitals</span>
              <span className="inline-flex items-center gap-1 text-label-sm text-secondary">
                <span className="material-symbols-outlined text-[16px]">check_circle</span> Verified
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Blood Pressure', value: '122/80', unit: 'mmHg' },
                { label: 'Pulse', value: '74', unit: 'bpm' },
                { label: 'Temperature', value: '98.4', unit: '°F' },
                { label: 'Oxygen (SpO2)', value: '99', unit: '%' },
              ].map(v => (
                <div key={v.label} className="bg-surface-container-lowest p-3 rounded-lg border border-surface-variant flex flex-col">
                  <span className="text-label-sm text-secondary">{v.label}</span>
                  <span className="text-headline-sm font-bold text-on-surface mt-0.5">{v.value} <span className="text-label-sm text-secondary font-normal">{v.unit}</span></span>
                </div>
              ))}
            </div>
          </section>

          {/* Form */}
          <form className="flex flex-col gap-5" onSubmit={e => e.preventDefault()}>
            {/* Diagnosis */}
            <div className="flex flex-col gap-1.5">
              <label className="text-label-md font-bold text-on-surface">Symptoms & Clinical Notes</label>
              <textarea className="w-full bg-surface-container-lowest border-2 border-surface-variant focus:border-on-surface rounded-lg p-3 text-body-md text-on-surface outline-none transition-colors" rows="3"
                value={diagnosis} onChange={e => setDiagnosis(e.target.value)} />
            </div>

            {/* Prescribed Medicines */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-label-md font-bold text-on-surface">Prescribed Medicines</label>
                <button className="inline-flex items-center gap-1 text-label-sm text-primary font-bold hover:underline" type="button">
                  <span className="material-symbols-outlined text-[18px]">add_circle</span> Add Medicine
                </button>
              </div>
              <div className="flex flex-col gap-2 bg-surface-container-low p-3 rounded-lg border border-surface-variant">
                {MEDICINES.map(med => (
                  <div key={med.num} className="bg-surface-container-lowest border border-surface-variant rounded-lg p-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-surface-container text-on-surface text-label-sm flex items-center justify-center font-bold">{med.num}</span>
                      <div className="flex flex-col">
                        <span className="text-label-md font-bold text-on-surface">{med.name}</span>
                        <span className="text-body-md text-on-surface-variant">{med.dosage}</span>
                      </div>
                    </div>
                    <button className="text-secondary hover:text-tertiary transition-colors p-1" title="Remove Medicine" type="button">
                      <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Advice */}
            <div className="flex flex-col gap-1.5">
              <label className="text-label-md font-bold text-on-surface">Dietary Instructions, Home Care & Follow-Up</label>
              <input className="h-[54px] w-full bg-surface-container-lowest border-2 border-surface-variant focus:border-on-surface rounded-lg px-3 text-body-md text-on-surface outline-none transition-colors" type="text"
                value={advice} onChange={e => setAdvice(e.target.value)} />
            </div>

            {/* ABDM Badge */}
            <div className="bg-surface-container-low border border-surface-variant p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">verified</span>
                <span className="text-label-md font-bold text-on-surface">Digitally Verified Prescription</span>
              </div>
              <div className="flex items-center gap-2 text-label-sm text-secondary">
                <span className="material-symbols-outlined text-[18px] text-primary">sms</span>
                <span>Direct SMS + WhatsApp delivery</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-surface-variant">
              <button className="h-14 px-6 flex items-center justify-center gap-2 bg-surface-container-lowest border-2 border-on-surface text-on-surface text-label-lg rounded-lg hover:bg-surface-container-low transition-colors" type="button">
                <span className="material-symbols-outlined text-[20px]">science</span>
                <span>Order Lab Test</span>
              </button>
              <button className="h-14 px-8 flex items-center justify-center gap-2 bg-primary-container text-on-primary-container text-label-lg rounded-lg hover:bg-[#ffb95f] transition-colors font-bold shadow-none"
                type="button" onClick={handleSendRx} disabled={sending}>
                {sending ? (
                  <>
                    <span className="material-symbols-outlined text-[22px] animate-spin">progress_activity</span>
                    <span>Encrypting & Dispatching...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[22px]">send</span>
                    <span>Send Prescription</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-surface-container-lowest border-2 border-primary-container p-4 rounded-lg shadow-lg flex items-center gap-3 max-w-md animate-fadeIn">
          <span className="material-symbols-outlined text-primary text-[28px]">check_circle</span>
          <div className="flex flex-col">
            <span className="text-label-md font-bold text-on-surface">e-Prescription Dispatched Successfully</span>
            <span className="text-label-sm text-secondary">Token sent to Aditya Verma (+91 98*** **410) & ABDM Registry.</span>
          </div>
        </div>
      )}
    </div>
  );
}
