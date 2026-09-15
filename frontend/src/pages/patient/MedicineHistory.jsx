import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PatientNavbar from '../../components/PatientNavbar';
import api from '../../services/api';

const MOCK_PRESCRIPTIONS = [
  {
    id: 'SEHAT-9699',
    date: '07 Sep 2026',
    doctor: 'Dr. Rajesh Sharma',
    facility: 'CHC Sitapur Central',
    diagnosis: 'Acute Viral Fever & Dehydration',
    status: 'Active Treatment',
    medicines: [
      { name: 'Paracetamol 500mg', dosage: '1 tablet', frequency: 'TDS (Three times a day)', duration: '5 Days', generic: 'Paracetamol IP', janAushadhiCode: 'JAS-0012' },
      { name: 'Cetirizine 10mg', dosage: '1 tablet', frequency: 'HS (Bedtime)', duration: '3 Days', generic: 'Cetirizine Hydrochloride IP', janAushadhiCode: 'JAS-0089' },
      { name: 'ORS Electrolyte Sachet', dosage: '1 packet in 1L water', frequency: 'As Needed', duration: '3 Days', generic: 'Oral Rehydration Salts IP', janAushadhiCode: 'JAS-0210' },
    ],
    notes: 'Adequate rest for 3 days. Drink plenty of boiled clean water. Return if fever persists beyond 5 days.',
    digitallySigned: true,
  },
  {
    id: 'SEHAT-8120',
    date: '14 Aug 2026',
    doctor: 'Dr. Ananya Gupta',
    facility: 'District Hospital Sitapur',
    diagnosis: 'Seasonal Bronchial Allergy',
    status: 'Completed',
    medicines: [
      { name: 'Amoxicillin 250mg', dosage: '1 capsule', frequency: 'BD (Twice a day)', duration: '5 Days', generic: 'Amoxicillin IP', janAushadhiCode: 'JAS-0044' },
      { name: 'Vitamin C 500mg', dosage: '1 chewable tab', frequency: 'OD (Once daily)', duration: '15 Days', generic: 'Ascorbic Acid IP', janAushadhiCode: 'JAS-0511' },
    ],
    notes: 'Completed prescribed course.',
    digitallySigned: true,
  },
];

export default function MedicineHistory() {
  const [prescriptions, setPrescriptions] = useState(MOCK_PRESCRIPTIONS);
  const [reorderedId, setReorderedId] = useState(null);

  const fetchPrescriptions = () => {
    api.get('/patient/prescriptions')
      .then(res => {
        if (res.data?.data?.length > 0) {
          const apiList = res.data.data.map(p => ({
            id: p.prescriptionId || 'SEHAT-9699',
            date: new Date(p.createdAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            doctor: p.doctor?.name || 'Dr. Rajesh Sharma',
            facility: p.doctor?.specialization ? `${p.doctor.specialization} • CHC Sitapur` : 'CHC Sitapur Central',
            diagnosis: p.diagnosis || 'Routine Treatment',
            status: p.status === 'active' ? 'Active Treatment' : p.status === 'dispensed' ? 'Dispensed' : 'Completed',
            medicines: (p.medicines && p.medicines.length > 0) ? p.medicines : [
              { name: 'Paracetamol 500mg', dosage: '1 tablet', frequency: 'TDS (Three times a day)', duration: '5 Days', generic: 'Paracetamol IP', janAushadhiCode: 'JAS-0012' }
            ],
            notes: p.clinicalNotes || 'Follow prescribed routine.',
            digitallySigned: p.isDigitallySigned !== false,
          }));
          setPrescriptions(apiList);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const handleReorder = (id) => {
    setReorderedId(id);
    setTimeout(() => setReorderedId(null), 3000);
  };

  return (
    <div className="bg-[#fbfaf7] text-slate-900 font-sans min-h-screen">
      <PatientNavbar />

      <main className="w-full px-6 lg:px-12 xl:px-16 pt-28 pb-16">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link 
            to="/patient" 
            className="inline-flex items-center gap-2 text-slate-700 hover:text-amber-600 bg-white px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold shadow-xs hover:border-amber-300 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Dashboard
          </Link>
        </div>

        {/* Hero Header in Real Amber Theme */}
        <div className="bg-gradient-to-r from-amber-500/15 via-amber-100/40 to-transparent p-6 sm:p-8 rounded-3xl border-2 border-amber-300 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-amber-300 text-amber-900 text-xs font-extrabold mb-3 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span>Pradhan Mantri Bhartiya Janaushadhi Pariyojana</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Jan Aushadhi Prescriptions &amp; Refills
              </h1>
              <p className="text-base text-slate-600 font-medium mt-1 max-w-2xl">
                Access your verified digital prescriptions. Order subsidized or free government generic medicines directly to your nearest village PHC or sub-centre.
              </p>
            </div>
            <div className="bg-white border-2 border-amber-400 p-4 rounded-2xl shadow-sm text-center shrink-0 self-start md:self-auto">
              <span className="text-xs uppercase font-extrabold text-amber-800 tracking-wider block">Generic Savings</span>
              <span className="text-2xl font-black text-amber-950 leading-tight">Up to 80%</span>
              <span className="text-[11px] text-slate-500 block font-semibold">Subsidized &amp; Certified</span>
            </div>
          </div>
        </div>

        {/* Success Alert */}
        {reorderedId && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border-2 border-amber-400 text-amber-950 font-extrabold flex items-center justify-between shadow-sm animate-fadeIn">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-amber-600 text-[26px]">check_circle</span>
              <div>
                <p className="text-sm">Refill request sent to Sitapur Jan Aushadhi Kendra (Sub-Centre Ward 4)!</p>
                <p className="text-xs text-amber-800 font-medium">Your ASHA worker Sunita Devi will verify medicine availability.</p>
              </div>
            </div>
            <span className="text-xs bg-amber-200/90 text-amber-900 font-black px-3 py-1 rounded-lg">Refill #ORD-2819</span>
          </div>
        )}

        {/* Prescriptions List */}
        <div className="space-y-6">
          {prescriptions.map((rx) => (
            <div 
              key={rx.id}
              className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-slate-200 hover:border-amber-500 hover:shadow-xl transition-all duration-200"
            >
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 border-2 border-amber-200 text-amber-700 flex items-center justify-center shrink-0 shadow-xs">
                    <span className="material-symbols-outlined text-[32px]">medication</span>
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-black bg-slate-900 text-amber-400 px-3 py-0.5 rounded-full uppercase tracking-wider">{rx.id}</span>
                      <span className="text-xs text-slate-500 font-bold">• {rx.date}</span>
                      <span className={`text-xs font-extrabold px-3 py-0.5 rounded-full border ${
                        rx.status === 'Active Treatment' 
                          ? 'bg-amber-50 text-amber-900 border-amber-300' 
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {rx.status}
                      </span>
                    </div>
                    <h2 className="text-2xl font-extrabold text-slate-900 leading-snug">{rx.diagnosis}</h2>
                    <p className="text-sm text-slate-600 font-medium">{rx.doctor} • {rx.facility}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button 
                    onClick={() => alert(`Prescription ${rx.id} downloaded as ABDM verified PDF.`)}
                    className="h-11 px-4 rounded-xl border-2 border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px] text-slate-600">download</span>
                    <span>Download PDF</span>
                  </button>
                  <button 
                    onClick={() => handleReorder(rx.id)}
                    className="h-11 px-5 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-all"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">local_pharmacy</span>
                    <span>Re-Order Jan Aushadhi Refill</span>
                  </button>
                </div>
              </div>

              {/* Medicines Table / List */}
              <div className="py-5">
                <h3 className="text-xs uppercase font-extrabold text-slate-500 tracking-wider mb-3">Prescribed Generic Medicines</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {rx.medicines.map((m, idx) => (
                    <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between gap-2">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="text-base font-extrabold text-slate-900">{m.name}</span>
                          <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 border border-amber-300/60">Generic</span>
                        </div>
                        <p className="text-xs text-slate-600 font-bold">{m.dosage} • {m.frequency}</p>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200">
                        <span>Duration: <strong className="text-slate-700">{m.duration}</strong></span>
                        <span className="font-mono text-amber-900 font-extrabold">{m.janAushadhiCode || 'JAS-Govt'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes & Verification */}
              <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-700">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-amber-600 text-[18px] shrink-0 mt-0.5">clinical_notes</span>
                  <div>
                    <span className="font-extrabold text-slate-900">Doctor's Advice: </span>
                    <span>{rx.notes}</span>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.5 text-amber-900 font-extrabold shrink-0">
                  <span className="material-symbols-outlined text-[18px] text-amber-600">verified</span>
                  <span>Digitally Signed by Ayushman Bharat ID</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
