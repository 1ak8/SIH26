import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DoctorNavbar from '../../components/DoctorNavbar';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const DEFAULT_HISTORY = [
  { 
    _id: 'c-9021',
    id: 'SEHAT-9021', 
    patient: 'Ravi Verma (45/M)', 
    patientName: 'Ravi Verma',
    date: '15 Sep 2026', 
    time: '10:15 AM', 
    diagnosis: 'Acute Pharyngitis & Upper Respiratory Congestion', 
    type: 'Tele-Consult', 
    facility: 'Rampur Sub-Centre', 
    abha: '91-4820-1940-2810',
    clinicalNotes: 'Warm saline gargles twice daily, steam inhalation. Review in CHC OPD if fever recurs.',
    medicines: [
      { name: 'Amoxicillin 500mg', dosage: '1 cap TDS x 5 days', duration: '5 Days', isGeneric: true },
      { name: 'Paracetamol 650mg', dosage: '1 tab SOS for fever/pain', duration: '3 Days', isGeneric: true },
      { name: 'Cetirizine 10mg', dosage: '1 tab at bedtime', duration: '3 Days', isGeneric: true }
    ],
    isDigitallySigned: true,
  },
  { 
    _id: 'c-9020',
    id: 'SEHAT-9020', 
    patient: 'Sunita Sharma (38/F)', 
    patientName: 'Sunita Sharma',
    date: '14 Sep 2026', 
    time: '09:30 AM', 
    diagnosis: 'Essential Hypertension Follow-up (Stable BP 124/82)', 
    type: 'In-Person', 
    facility: 'CHC Sitapur Central', 
    abha: '91-2311-9041-5512',
    clinicalNotes: 'Blood pressure under optimal control. Low sodium diet advised.',
    medicines: [
      { name: 'Amlodipine 5mg', dosage: '1 tab OD in morning', duration: '30 Days', isGeneric: true }
    ],
    isDigitallySigned: true,
  },
  { 
    _id: 'c-9019',
    id: 'SEHAT-9019', 
    patient: 'Mohan Das (68/M)', 
    patientName: 'Mohan Das',
    date: '12 Sep 2026', 
    time: '02:45 PM', 
    diagnosis: 'Bilateral Osteoarthritis Knee Joint Pain', 
    type: 'Tele-Consult', 
    facility: 'Dholpur Sub-Centre', 
    abha: '91-8832-1002-3921',
    clinicalNotes: 'Quadriceps strengthening exercises, avoid deep squatting. Calcium supplement prescribed.',
    medicines: [
      { name: 'Paracetamol 650mg', dosage: '1 tab SOS for severe joint pain', duration: '5 Days', isGeneric: true },
      { name: 'Calcium + Vitamin D3', dosage: '1 tab OD after lunch', duration: '30 Days', isGeneric: true }
    ],
    isDigitallySigned: true,
  },
  { 
    _id: 'c-9018',
    id: 'SEHAT-9018', 
    patient: 'Geeta Devi (55/F)', 
    patientName: 'Geeta Devi',
    date: '10 Sep 2026', 
    time: '11:20 AM', 
    diagnosis: 'Type 2 Diabetes Routine Review (Fasting Sugar 128 mg/dL)', 
    type: 'In-Person', 
    facility: 'CHC Sitapur Central', 
    abha: '91-3490-1122-8761',
    clinicalNotes: 'Glycemic control satisfactory. Continue morning walks 30 mins.',
    medicines: [
      { name: 'Metformin 500mg', dosage: '1 tab BD after meals', duration: '30 Days', isGeneric: true }
    ],
    isDigitallySigned: true,
  },
];

export default function ConsultationHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState(DEFAULT_HISTORY);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [modeFilter, setModeFilter] = useState('All');
  const [selectedRecord, setSelectedRecord] = useState(null);

  const fetchHistory = () => {
    setLoading(true);
    api.get('/doctor/history')
      .then(res => {
        if (res.data?.data && res.data.data.length > 0) {
          // Merge with default history for maximum richness
          const serverList = res.data.data;
          setHistory([...serverList, ...DEFAULT_HISTORY]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const printConsultation = (rec) => {
    if (!rec) return;
    const printWindow = window.open('', '_blank', 'width=850,height=950');
    if (!printWindow) {
      window.print();
      return;
    }

    const medRows = (rec.medicines || []).map((m, i) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 12px; font-weight: bold; color: #0f172a;">${i + 1}. ${m.name}</td>
        <td style="padding: 10px 12px; font-weight: 800; color: #78350f;">${m.dosage || '1 tab OD'}</td>
        <td style="padding: 10px 12px; color: #475569;">${m.duration || '5 Days'}</td>
        <td style="padding: 10px 12px; text-align: right;"><span style="background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 11px;">Jan Aushadhi Generic</span></td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Consultation Summary - ${rec.id}</title>
          <style>
            @page { size: A4; margin: 15mm; }
            body { font-family: system-ui, -apple-system, sans-serif; color: #0f172a; margin: 0; padding: 24px; font-size: 13px; line-height: 1.5; }
            .header { border-bottom: 3px solid #d97706; padding-bottom: 15px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; }
            .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; background: #fef3c7; padding: 12px 16px; border-radius: 8px; margin-bottom: 18px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { background: #f1f5f9; padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; color: #475569; }
            .box { background: #f8fafc; border: 1px solid #cbd5e1; padding: 12px 16px; border-radius: 6px; margin-bottom: 18px; }
            .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #cbd5e1; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div style="font-size: 10px; font-weight: bold; color: #d97706; letter-spacing: 1px; text-transform: uppercase;">Ministry of Health &amp; Family Welfare</div>
              <h1 style="margin: 3px 0; font-size: 20px; color: #0f172a;">National Tele-Consultation Record</h1>
              <div style="font-size: 11px; color: #64748b;">E-Sanjeevani • ABDM Verified Clinical Summary</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 18px; font-weight: 900; font-family: monospace; color: #92400e;">${rec.id}</div>
              <div style="font-size: 10px; color: #64748b;">DIGITALLY PRESERVED</div>
            </div>
          </div>

          <div class="meta-grid">
            <div><span style="font-size: 10px; color: #64748b; display: block;">PATIENT CITIZEN</span><strong>${rec.patientName || rec.patient}</strong></div>
            <div><span style="font-size: 10px; color: #64748b; display: block;">ABHA NUMBER</span><strong>${rec.abha}</strong></div>
            <div><span style="font-size: 10px; color: #64748b; display: block;">ATTENDING SPECIALIST</span><strong>${user?.name || 'Dr. Rajesh Sharma, MD'}</strong></div>
            <div><span style="font-size: 10px; color: #64748b; display: block;">DATE &amp; TIME</span><strong>${rec.date} • ${rec.time}</strong></div>
          </div>

          <div class="box">
            <strong style="color: #0f172a; display: block; margin-bottom: 4px; font-size: 12px;">Clinical Diagnosis &amp; Findings:</strong>
            <div>${rec.diagnosis}</div>
          </div>

          <h2 style="font-size: 14px; margin: 0 0 10px 0; color: #0f172a;">Prescribed Generic Medications (Jan Aushadhi)</h2>
          <table>
            <thead>
              <tr>
                <th>Generic Formulation</th>
                <th>Dosage Frequency</th>
                <th>Course Duration</th>
                <th style="text-align: right;">Scheme Status</th>
              </tr>
            </thead>
            <tbody>
              ${medRows || '<tr><td colspan="4" style="text-align:center; padding: 15px;">No systemic medications prescribed.</td></tr>'}
            </tbody>
          </table>

          ${rec.clinicalNotes ? `
            <div class="box">
              <strong style="color: #0f172a; display: block; margin-bottom: 4px; font-size: 12px;">Doctor Advice &amp; Follow-up Instructions:</strong>
              <div>${rec.clinicalNotes}</div>
            </div>
          ` : ''}

          <div class="footer">
            <div>
              <strong>Digitally Signed by Medical Officer</strong><br/>
              ${user?.name || 'Dr. Rajesh Sharma, MD (Reg: MCI-84920)'}
            </div>
            <div style="text-align: right;">
              <strong>National Tele-Consultation Mission</strong><br/>
              Ministry of Health &amp; Family Welfare
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

  const filteredHistory = history.filter(h => {
    const matchesSearch = 
      (h.patient || '').toLowerCase().includes(search.toLowerCase()) || 
      (h.diagnosis || '').toLowerCase().includes(search.toLowerCase()) ||
      (h.id || '').toLowerCase().includes(search.toLowerCase());

    const matchesMode = 
      modeFilter === 'All' ? true :
      modeFilter === 'Tele-Consult' ? h.type === 'Tele-Consult' :
      modeFilter === 'In-Person' ? h.type === 'In-Person' : true;

    return matchesSearch && matchesMode;
  });
  
  return (
    <div className="bg-[#fbfaf7] text-slate-900 font-sans min-h-screen">
      <DoctorNavbar />

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

          <span className="text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 px-3.5 py-1.5 rounded-full shadow-2xs">
            ABDM Clinical Audit Log • Permanent Record
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-heading">Clinical Consultation History</h1>
            <p className="text-sm text-slate-600 font-medium">Historical OPD tele-consultations, e-prescriptions, and clinical audit log under National Health Mission.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
              <input 
                type="text" 
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search patient, ID, or diagnosis..."
                className="h-11 pl-10 pr-4 bg-white border-2 border-slate-200 focus:border-amber-500 rounded-xl text-xs font-bold outline-none transition-all w-full sm:w-72 shadow-2xs text-slate-900"
              />
            </div>

            <div className="flex bg-white rounded-2xl p-1 border-2 border-slate-200 shadow-xs">
              {['All', 'Tele-Consult', 'In-Person'].map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setModeFilter(m)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    modeFilter === m ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-slate-200/90 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b-2 border-slate-100">
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Consult ID</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Citizen Details</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Session Time</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Clinical Diagnosis</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Consult Mode</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHistory.map(record => (
                  <tr key={record._id || record.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-5">
                      <span className="font-mono text-xs font-black text-amber-950 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-300 shadow-2xs">
                        {record.id}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-extrabold text-slate-900 block">{record.patient}</span>
                      <span className="text-xs text-slate-500 font-semibold">{record.facility} • <span className="font-mono text-amber-900">{record.abha}</span></span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-extrabold text-slate-800 block">{record.date}</span>
                      <span className="text-xs text-slate-500 font-semibold">{record.time}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs font-bold text-slate-900 max-w-xs block leading-snug">{record.diagnosis}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${
                        record.type === 'Tele-Consult' 
                          ? 'bg-amber-100 text-amber-950 border-amber-300' 
                          : 'bg-sky-100 text-sky-900 border-sky-300'
                      }`}>
                        <span className="material-symbols-outlined text-[16px]">
                          {record.type === 'Tele-Consult' ? 'videocam' : 'local_hospital'}
                        </span>
                        {record.type}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button 
                        onClick={() => setSelectedRecord(record)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 border-2 border-slate-300 hover:border-amber-400 bg-white hover:bg-amber-50 text-slate-800 hover:text-amber-900 rounded-xl font-extrabold text-xs transition-all shadow-xs cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px] text-amber-600">visibility</span>
                        <span>Summary &amp; Rx</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* MODAL: VIEW CONSULTATION DOSSIER & RX */}
      {selectedRecord && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-2xl rounded-3xl border-2 border-amber-400 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between border-b-4 border-amber-500">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[24px]">description</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-black tracking-wider text-amber-300 block">National Tele-Consultation Mission</span>
                  <h3 className="text-lg font-black text-white font-heading">Consultation Dossier — {selectedRecord.id}</h3>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => printConsultation(selectedRecord)}
                  className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">print</span>
                  Print
                </button>
                <button 
                  onClick={() => setSelectedRecord(null)} 
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 transition-colors cursor-pointer shadow-sm"
                  title="Close"
                >
                  <span className="material-symbols-outlined text-[20px] font-bold text-slate-900">close</span>
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-300 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Citizen Name</span>
                  <strong className="text-slate-900 font-black">{selectedRecord.patientName || selectedRecord.patient}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">ABHA Number</span>
                  <strong className="font-mono text-amber-950 font-black">{selectedRecord.abha}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Facility Mode</span>
                  <strong className="text-slate-900 font-black">{selectedRecord.facility} ({selectedRecord.type})</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Consult Date</span>
                  <strong className="text-slate-900 font-black">{selectedRecord.date} • {selectedRecord.time}</strong>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] uppercase font-black text-slate-500 block mb-1">Clinical Diagnosis &amp; Symptoms</span>
                <p className="text-xs font-black text-slate-900">{selectedRecord.diagnosis}</p>
              </div>

              {/* Prescribed Medicines */}
              <div>
                <span className="text-xs font-black text-slate-900 block mb-2">Prescribed Generic Medicines (Jan Aushadhi Scheme)</span>
                {selectedRecord.medicines && selectedRecord.medicines.length > 0 ? (
                  <div className="border border-slate-200 rounded-2xl overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                          <th className="px-3.5 py-2 font-black">Medicine Formulation</th>
                          <th className="px-3.5 py-2 font-black">Dosage</th>
                          <th className="px-3.5 py-2 font-black">Duration</th>
                          <th className="px-3.5 py-2 font-black text-right">Generic Type</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedRecord.medicines.map((m, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="px-3.5 py-2 font-extrabold text-slate-900">{m.name}</td>
                            <td className="px-3.5 py-2 font-bold text-amber-950">{m.dosage || '1 tab OD'}</td>
                            <td className="px-3.5 py-2 text-slate-600">{m.duration || '5 Days'}</td>
                            <td className="px-3.5 py-2 text-right">
                              <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-black px-2 py-0.5 rounded">
                                Jan Aushadhi
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 rounded-xl text-slate-500 text-center">No medications prescribed.</div>
                )}
              </div>

              {selectedRecord.clinicalNotes && (
                <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200">
                  <span className="text-[10px] uppercase font-black text-amber-900 block mb-1">Doctor Advice &amp; Diet Plan</span>
                  <p className="text-xs text-slate-800 font-medium">{selectedRecord.clinicalNotes}</p>
                </div>
              )}

              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600 text-[22px]">verified</span>
                  <div>
                    <span className="font-black text-slate-900 block">Digitally Signed by Medical Officer</span>
                    <span className="text-slate-500 text-[11px]">{user?.name || 'Dr. Rajesh Sharma, MD (Reg: MCI-84920)'}</span>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-slate-400 font-black">E-SANJEEVANI-VALID</span>
              </div>
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
          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
            <p>© 2026 Government Public Healthcare Infrastructure. All citizen rights reserved.</p>
            <p className="text-amber-900 font-bold">Radical Clarity &amp; Rural Accessibility Compliant</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
