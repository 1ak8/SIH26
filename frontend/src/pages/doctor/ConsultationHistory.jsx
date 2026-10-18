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
  const [history, setHistory] = useState(() => {
    try {
      const local = JSON.parse(localStorage.getItem('sehatsaarthi_doctor_history') || '[]');
      if (local && local.length > 0) {
        return [...local, ...DEFAULT_HISTORY];
      }
    } catch(e) {}
    return DEFAULT_HISTORY;
  });

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [modeFilter, setModeFilter] = useState('All');
  const [selectedRecord, setSelectedRecord] = useState(null);

  const fetchHistory = () => {
    setLoading(true);
    api.get('/doctor/history')
      .then(res => {
        const serverList = res.data?.data || [];
        try {
          const local = JSON.parse(localStorage.getItem('sehatsaarthi_doctor_history') || '[]');
          const combined = [...local, ...serverList, ...DEFAULT_HISTORY];
          const seen = new Set();
          const unique = [];
          for (const item of combined) {
            const key = item.id || item._id;
            if (key && !seen.has(key)) {
              seen.add(key);
              unique.push(item);
            }
          }
          setHistory(unique);
        } catch(e) {
          if (serverList.length > 0) setHistory([...serverList, ...DEFAULT_HISTORY]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 6000);
    return () => clearInterval(interval);
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
        <td style="padding: 10px 12px; font-weight: 800; color: #0f766e;">${m.dosage || '1 tab OD'}</td>
        <td style="padding: 10px 12px; color: #475569;">${m.duration || '5 Days'}</td>
        <td style="padding: 10px 12px; text-align: right;"><span style="background: #ccfbf1; color: #0f766e; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 11px;">Jan Aushadhi Generic</span></td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Consultation Summary - ${rec.id}</title>
          <style>
            @page { size: A4; margin: 15mm; }
            body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; color: #0f172a; margin: 0; padding: 24px; font-size: 13px; line-height: 1.5; }
            .header { border-bottom: 3px solid #0d9488; padding-bottom: 15px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; }
            .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; background: #f0fdfa; padding: 12px 16px; border-radius: 8px; margin-bottom: 18px; border: 1px solid #ccfbf1; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { background: #f1f5f9; padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; color: #475569; }
            .box { background: #f8fafc; border: 1px solid #cbd5e1; padding: 12px 16px; border-radius: 6px; margin-bottom: 18px; }
            .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #cbd5e1; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div style="font-size: 10px; font-weight: bold; color: #0f766e; letter-spacing: 1px; text-transform: uppercase;">Ministry of Health &amp; Family Welfare</div>
              <h1 style="margin: 3px 0; font-size: 20px; color: #0f172a;">National Tele-Consultation Record</h1>
              <div style="font-size: 11px; color: #64748b;">E-Sanjeevani • ABDM Verified Clinical Summary</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 18px; font-weight: 900; font-family: monospace; color: #0f766e;">${rec.id}</div>
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
    <div className="bg-slate-50 text-slate-900 font-sans min-h-screen selection:bg-teal-100 selection:text-teal-900">
      <DoctorNavbar />

      <main className="w-full px-4 sm:px-6 lg:px-12 xl:px-16 pt-24 sm:pt-28 pb-16 max-w-7xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="mb-5 flex items-center justify-between">
          <Link 
            to="/doctor" 
            className="inline-flex items-center gap-2 text-slate-600 hover:text-teal-800 bg-white px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold shadow-2xs hover:border-teal-300 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px]">arrow_back</span>
            <span>Back to Console</span>
          </Link>

          <span className="text-xs font-black bg-teal-50 text-teal-900 border border-teal-200 px-3.5 py-1.5 rounded-full shadow-2xs">
            ABDM Clinical Audit Log • Permanent Record
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">history</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">Clinical Consultation History</h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">Historical OPD tele-consultations, e-prescriptions, and clinical audit log under National Health Mission.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
              <input 
                type="text" 
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search patient, ID, or diagnosis..."
                className="h-10 pl-10 pr-4 bg-white border border-slate-200 focus:border-teal-600 rounded-xl text-xs font-bold outline-none transition-all w-full sm:w-72 shadow-2xs text-slate-900"
              />
            </div>

            <div className="flex bg-white rounded-2xl p-1 border border-slate-200 shadow-2xs">
              {['All', 'Tele-Consult', 'In-Person'].map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setModeFilter(m)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    modeFilter === m ? 'bg-teal-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500">
                  <th className="px-6 py-4 font-black uppercase tracking-wider text-[11px]">Consult ID</th>
                  <th className="px-6 py-4 font-black uppercase tracking-wider text-[11px]">Citizen Details</th>
                  <th className="px-6 py-4 font-black uppercase tracking-wider text-[11px]">Session Time</th>
                  <th className="px-6 py-4 font-black uppercase tracking-wider text-[11px]">Clinical Diagnosis</th>
                  <th className="px-6 py-4 font-black uppercase tracking-wider text-[11px]">Consult Mode</th>
                  <th className="px-6 py-4 font-black uppercase tracking-wider text-[11px] text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHistory.map(record => (
                  <tr key={record._id || record.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-black text-teal-950 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 shadow-2xs">
                        {record.id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-black text-slate-900 block leading-snug">{record.patient}</span>
                      <span className="text-xs text-slate-500 font-semibold">{record.facility} • <span className="font-mono text-teal-800 font-bold">{record.abha}</span></span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-800 block">{record.date}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{record.time}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-900 max-w-xs block leading-snug">{record.diagnosis}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${
                        record.type === 'Tele-Consult' 
                          ? 'bg-teal-50 text-teal-950 border-teal-200' 
                          : 'bg-sky-50 text-sky-900 border-sky-200'
                      }`}>
                        <span className="material-symbols-outlined text-[15px]">
                          {record.type === 'Tele-Consult' ? 'videocam' : 'local_hospital'}
                        </span>
                        <span>{record.type}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        type="button"
                        onClick={() => setSelectedRecord(record)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-slate-200 hover:border-teal-300 bg-white hover:bg-slate-50 text-slate-800 hover:text-teal-900 rounded-xl font-bold text-xs transition-all shadow-2xs cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[15px] text-teal-600">visibility</span>
                        <span>Summary</span>
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-2xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-teal-950 text-white flex items-center justify-between border-b-2 border-teal-500">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[24px]">description</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-black tracking-wider text-teal-300 block">National Tele-Consultation Mission</span>
                  <h3 className="text-base font-black text-white font-heading">Consultation Dossier — {selectedRecord.id}</h3>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => printConsultation(selectedRecord)}
                  className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">print</span>
                  <span>Print</span>
                </button>
                <button 
                  onClick={() => setSelectedRecord(null)} 
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="Close"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 font-black uppercase block">Citizen Name</span>
                  <strong className="text-slate-900 font-black text-sm">{selectedRecord.patientName || selectedRecord.patient}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-black uppercase block">ABHA Number</span>
                  <strong className="font-mono text-teal-900 font-bold">{selectedRecord.abha}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-black uppercase block">Facility Mode</span>
                  <strong className="text-slate-900 font-bold">{selectedRecord.facility} ({selectedRecord.type})</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-black uppercase block">Consult Date</span>
                  <strong className="text-slate-900 font-bold">{selectedRecord.date} • {selectedRecord.time}</strong>
                </div>
              </div>

              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200">
                <span className="text-[10px] uppercase font-black text-slate-400 block mb-1">Clinical Diagnosis &amp; Symptoms</span>
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
                          <th className="px-3.5 py-2 font-black text-[11px]">Medicine Formulation</th>
                          <th className="px-3.5 py-2 font-black text-[11px]">Dosage</th>
                          <th className="px-3.5 py-2 font-black text-[11px]">Duration</th>
                          <th className="px-3.5 py-2 font-black text-[11px] text-right">Generic Type</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedRecord.medicines.map((m, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="px-3.5 py-2 font-black text-slate-900">{m.name}</td>
                            <td className="px-3.5 py-2 font-bold text-teal-900">{m.dosage || '1 tab OD'}</td>
                            <td className="px-3.5 py-2 text-slate-600">{m.duration || '5 Days'}</td>
                            <td className="px-3.5 py-2 text-right">
                              <span className="bg-emerald-50 text-emerald-900 border border-emerald-300 text-[10px] font-black px-2 py-0.5 rounded">
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
                <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-200">
                  <span className="text-[10px] uppercase font-black text-teal-900 block mb-1">Doctor Advice &amp; Diet Plan</span>
                  <p className="text-xs text-slate-800 font-medium">{selectedRecord.clinicalNotes}</p>
                </div>
              )}

              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600 text-[22px]">verified</span>
                  <div>
                    <span className="font-black text-slate-900 block">Digitally Signed by Medical Officer</span>
                    <span className="text-slate-500 text-[11px]">{user?.name || 'Dr. Rajesh Sharma, MD (Reg: MCI-84920)'}</span>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-teal-700 font-black">E-SANJEEVANI-VALID</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition-colors cursor-pointer"
              >
                Close Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
