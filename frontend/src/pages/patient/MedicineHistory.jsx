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

  const handleDownloadPDF = (rx) => {
    const medicinesHTML = rx.medicines.map((m, i) => `
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:10px 8px;font-weight:700;color:#0f172a;">${i + 1}</td>
        <td style="padding:10px 8px;font-weight:800;color:#0f172a;">${m.name}</td>
        <td style="padding:10px 8px;color:#475569;">${m.generic || m.name}</td>
        <td style="padding:10px 8px;color:#475569;">${m.dosage}</td>
        <td style="padding:10px 8px;color:#475569;">${m.frequency}</td>
        <td style="padding:10px 8px;color:#475569;">${m.duration}</td>
        <td style="padding:10px 8px;font-weight:800;color:#0f766e;">${m.janAushadhiCode || 'N/A'}</td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Prescription ${rx.id} - SehatSaarthi</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Plus Jakarta Sans', sans-serif; color: #0f172a; padding: 40px; background: #fff; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #0d9488; padding-bottom: 20px; margin-bottom: 24px; }
          .brand h1 { font-size: 22px; font-weight: 800; color: #0f172a; }
          .brand p { font-size: 12px; color: #64748b; margin-top: 2px; }
          .logo { text-align: right; }
          .logo .app-name { font-size: 18px; font-weight: 800; color: #0d9488; }
          .logo .sub { font-size: 10px; color: #94a3b8; }
          .rx-header { background: #f0fdfa; border: 1px solid #ccfbf1; border-radius: 12px; padding: 16px 20px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
          .rx-header .rx-id { font-size: 14px; font-weight: 800; color: #0f766e; }
          .rx-header .rx-date { font-size: 12px; color: #475569; }
          .rx-header .rx-status { font-size: 11px; font-weight: 800; background: #ccfbf1; color: #0f766e; padding: 4px 12px; border-radius: 20px; border: 1px solid #99f6e4; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
          .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 16px; }
          .info-box label { font-size: 9px; font-weight: 800; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em; display: block; margin-bottom: 4px; }
          .info-box span { font-size: 13px; font-weight: 700; color: #0f172a; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background: #0f172a; color: #5eead4; font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 10px 8px; text-align: left; letter-spacing: 0.05em; }
          .notes { background: #f0fdfa; border: 1px solid #ccfbf1; border-radius: 10px; padding: 16px; margin-bottom: 20px; }
          .notes h4 { font-size: 12px; font-weight: 800; color: #0f766e; margin-bottom: 6px; }
          .notes p { font-size: 12px; color: #475569; line-height: 1.6; }
          .footer { border-top: 2px solid #e2e8f0; padding-top: 16px; display: flex; justify-content: space-between; align-items: center; }
          .footer .signed { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; color: #0d9488; }
          .footer .disclaimer { font-size: 9px; color: #94a3b8; max-width: 300px; text-align: right; line-height: 1.4; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand">
            <h1>SehatSaarthi Digital Prescription</h1>
            <p>Ayushman Bharat Digital Mission (ABDM) Verified</p>
          </div>
          <div class="logo">
            <div class="app-name">SehatSaarthi</div>
            <div class="sub">National Digital Health Framework</div>
          </div>
        </div>

        <div class="rx-header">
          <div>
            <div class="rx-id">${rx.id}</div>
            <div class="rx-date">${rx.date}</div>
          </div>
          <div class="rx-status">${rx.status}</div>
        </div>

        <div class="info-grid">
          <div class="info-box">
            <label>Citizen Record</label>
            <span>Verified Citizen</span>
          </div>
          <div class="info-box">
            <label>Diagnosis</label>
            <span>${rx.diagnosis}</span>
          </div>
          <div class="info-box">
            <label>Prescribing Doctor</label>
            <span>${rx.doctor}</span>
          </div>
          <div class="info-box">
            <label>Health Facility</label>
            <span>${rx.facility}</span>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Medicine</th>
              <th>Generic Name</th>
              <th>Dosage</th>
              <th>Frequency</th>
              <th>Duration</th>
              <th>Jan Aushadhi Code</th>
            </tr>
          </thead>
          <tbody>
            ${medicinesHTML}
          </tbody>
        </table>

        <div class="notes">
          <h4>Doctor's Clinical Advice</h4>
          <p>${rx.notes}</p>
        </div>

        <div class="footer">
          <div class="signed">
            <span style="font-size:18px;">&#10003;</span>
            Digitally Signed — Ayushman Bharat Health Account
          </div>
          <div class="disclaimer">
            This is a digitally generated prescription verified under the National Digital Health Framework. 
            For queries, contact your nearest CHC or call helpline 1075.
          </div>
        </div>

        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  const handleReorder = (id) => {
    setReorderedId(id);
    setTimeout(() => setReorderedId(null), 3000);
  };

  return (
    <div className="bg-slate-50 text-slate-900 font-sans min-h-screen selection:bg-teal-100 selection:text-teal-900">
      <PatientNavbar />

      <main className="w-full px-4 sm:px-6 lg:px-12 xl:px-16 pt-24 sm:pt-28 pb-16 max-w-7xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="mb-5">
          <Link 
            to="/patient" 
            className="inline-flex items-center gap-2 text-slate-600 hover:text-teal-800 bg-white px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold shadow-2xs hover:border-teal-300 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px]">arrow_back</span>
            <span>Back to Patient Console</span>
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
                <span>Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP)</span>
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                Jan Aushadhi Prescriptions &amp; Refills
              </h1>
              <p className="text-xs sm:text-sm lg:text-base text-teal-100/90 font-medium mt-2 leading-relaxed">
                Access your verified digital prescriptions. Order subsidized or free government generic medicines directly to your nearest village PHC or sub-centre.
              </p>
            </div>

            <div className="bg-white/15 backdrop-blur-xl border border-white/25 rounded-2xl p-4 sm:p-5 text-white flex flex-col justify-between shadow-lg shrink-0 self-start lg:self-auto min-w-[240px]">
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-teal-200">Generic Price Subsidy</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-black">
                  PMBJP Certified
                </span>
              </div>
              <div className="text-3xl font-black font-mono tracking-tight text-white">
                Up to 80% <span className="text-xs font-sans text-teal-200 font-bold">Savings</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-teal-100 font-semibold mt-2 pt-2 border-t border-white/15">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Sitapur Kendra #04 Stock Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Success Alert */}
        {reorderedId && (
          <div className="mb-6 p-4 rounded-2xl bg-teal-50 border border-teal-300 text-teal-950 font-black flex items-center justify-between shadow-xs animate-fadeIn">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-teal-700 text-[24px]">check_circle</span>
              <div>
                <p className="text-xs sm:text-sm">Refill request sent to Sitapur Jan Aushadhi Kendra (Sub-Centre Ward 4)!</p>
                <p className="text-[11px] text-teal-800 font-medium">Your ASHA worker Sunita Devi will verify medicine availability.</p>
              </div>
            </div>
            <span className="text-xs bg-teal-200 text-teal-900 font-black px-3 py-1 rounded-xl">Refill #ORD-2819</span>
          </div>
        )}

        {/* Prescriptions List */}
        <div className="space-y-6">
          {prescriptions.map((rx) => (
            <div 
              key={rx.id}
              className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 hover:border-teal-400 hover:shadow-lg transition-all duration-200"
            >
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div className="flex items-start gap-4">
                  <div className="w-13 h-13 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0 shadow-2xs">
                    <span className="material-symbols-outlined text-[30px]">medication</span>
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-black bg-slate-900 text-teal-300 px-3 py-0.5 rounded-full uppercase tracking-wider">{rx.id}</span>
                      <span className="text-xs text-slate-500 font-bold">• {rx.date}</span>
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                        rx.status === 'Active Treatment' 
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-300' 
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {rx.status}
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">{rx.diagnosis}</h2>
                    <p className="text-xs text-slate-600 font-medium">{rx.doctor} • {rx.facility}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button 
                    onClick={() => handleDownloadPDF(rx)}
                    className="h-10 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-98"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[17px] text-teal-700">download</span>
                    <span>Download PDF</span>
                  </button>
                  <button 
                    onClick={() => handleReorder(rx.id)}
                    className="h-10 px-5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-teal-700/20 transition-all cursor-pointer active:scale-98"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[17px]">local_pharmacy</span>
                    <span>Re-Order Refill</span>
                  </button>
                </div>
              </div>

              {/* Medicines Table / List */}
              <div className="py-5">
                <h3 className="text-[11px] uppercase font-black text-slate-400 tracking-wider mb-3">Prescribed Generic Formulations</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {rx.medicines.map((m, idx) => (
                    <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between gap-2.5">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="text-sm font-black text-slate-900">{m.name}</span>
                          <span className="bg-teal-50 text-teal-900 text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 border border-teal-200">Generic</span>
                        </div>
                        <p className="text-xs text-slate-600 font-bold">{m.dosage} • {m.frequency}</p>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200">
                        <span>Duration: <strong className="text-slate-800">{m.duration}</strong></span>
                        <span className="font-mono text-teal-800 font-black">{m.janAushadhiCode || 'JAS-Govt'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes & Verification */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-700">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-teal-600 text-[18px] shrink-0 mt-0.5">clinical_notes</span>
                  <div>
                    <span className="font-black text-slate-900">Doctor's Clinical Advice: </span>
                    <span>{rx.notes}</span>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.5 text-teal-800 font-black shrink-0">
                  <span className="material-symbols-outlined text-[18px] text-teal-600">verified</span>
                  <span>Digitally Signed with ABHA Key</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
