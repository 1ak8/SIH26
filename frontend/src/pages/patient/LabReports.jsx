import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PatientNavbar from '../../components/PatientNavbar';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function LabReports() {
  const { user } = useAuth();
  const [labReports, setLabReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [labFilter, setLabFilter] = useState('All');

  const fetchLabReports = () => {
    setLoading(true);
    api.get('/patient/lab-reports')
      .then(res => {
        if (res.data?.data) setLabReports(res.data.data);
      })
      .catch(() => {
        try {
          const local = JSON.parse(localStorage.getItem('sehatsaarthi_lab_reports') || '[]');
          setLabReports(local);
        } catch(e) {}
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLabReports(); }, []);

  const printDiagnosticReport = (report) => {
    if (!report) return;
    const printWindow = window.open('', '_blank', 'width=850,height=950');
    if (!printWindow) { window.print(); return; }
    const dateFormatted = report.completedAt 
      ? new Date(report.completedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) 
      : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const rows = (report.results || []).map(r => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 12px; font-weight: bold; color: #0f172a;">${r.parameter}</td>
        <td style="padding: 10px 12px; font-weight: 800; color: #0f766e;">${r.value} <span style="font-size: 11px; color: #64748b;">${r.unit || ''}</span></td>
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
    printWindow.document.write(`<!DOCTYPE html><html><head><title>Lab Report - ${report.testName}</title>
      <style>body{font-family:'Plus Jakarta Sans','Segoe UI',sans-serif;padding:30px;color:#0f172a;}table{width:100%;border-collapse:collapse;margin:15px 0;}th{background:#f1f5f9;text-align:left;padding:10px 12px;font-size:12px;border-bottom:2px solid #cbd5e1;}</style></head><body>
      <div style="display:flex;align-items:center;gap:12px;border-bottom:3px solid #0d9488;padding-bottom:15px;margin-bottom:20px;">
        <div style="width:50px;height:50px;background:#ccfbf1;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:24px;">🔬</div>
        <div><div style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#0f766e;font-weight:800;">Ministry of Health & Family Welfare</div>
        <div style="font-size:18px;font-weight:900;">${report.facility || 'CHC Sitapur Central Pathology Lab'}</div>
        <div style="font-size:11px;color:#64748b;">NABL Accredited ISO 15189 • National Digital Health Grid</div></div></div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:10px;background:#f0fdfa;padding:12px;border-radius:8px;margin-bottom:20px;font-size:12px;border:1px solid #99f6e4;">
        <div><div style="font-size:10px;color:#0f766e;font-weight:700;text-transform:uppercase;">Citizen</div><strong>${report.patientName || user?.name}</strong></div>
        <div><div style="font-size:10px;color:#0f766e;font-weight:700;text-transform:uppercase;">Order ID</div><strong style="font-family:monospace;">${report.orderId}</strong></div>
        <div><div style="font-size:10px;color:#0f766e;font-weight:700;text-transform:uppercase;">Prescribed By</div><strong>${report.doctorName}</strong></div>
        <div><div style="font-size:10px;color:#0f766e;font-weight:700;text-transform:uppercase;">Date</div><strong>${dateFormatted}</strong></div>
      </div>
      <h3 style="font-size:16px;margin-bottom:10px;">${report.testName} <span style="background:#ccfbf1;padding:2px 8px;border-radius:4px;font-size:11px;color:#0f766e;">${report.category}</span></h3>
      <table><thead><tr><th>Parameter</th><th>Value</th><th>Reference Range</th><th style="text-align:right;">Status</th></tr></thead><tbody>${rows}</tbody></table>
      ${report.summary ? `<div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:12px;border-radius:8px;margin:15px 0;font-size:12px;"><strong style="color:#166534;">Pathologist Findings:</strong><br/>${report.summary}</div>` : ''}
      <div style="border-top:2px solid #e2e8f0;padding-top:12px;margin-top:20px;display:flex;justify-content:space-between;font-size:11px;color:#64748b;">
        <span>Digitally Signed: ${report.verifiedBy || 'Dr. Anjali Seth (MD Pathology)'}</span><span>QR-ABHA-VALID</span></div></body></html>`);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  const filtered = labReports.filter(r => {
    if (labFilter === 'Completed') return r.status === 'completed';
    if (labFilter === 'Pending') return r.status !== 'completed';
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-teal-100 selection:text-teal-900">
      <PatientNavbar />
      <main className="w-full px-4 sm:px-6 lg:px-12 xl:px-16 pt-24 sm:pt-28 pb-16 max-w-7xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="mb-4">
          <Link 
            to="/patient" 
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-teal-700 text-xs font-bold transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Back to Patient Console</span>
          </Link>
        </div>

        {/* Distinct Greyish Clinical Health Card Header */}
        <div className="w-full mb-8 bg-slate-200/90 p-6 sm:p-7 rounded-3xl border border-slate-300 shadow-sm relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-300 text-teal-800 text-xs font-black shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>National Health Mission • NABL Verified Pathology Grid</span>
              </div>
              
              <div>
                <h1 className="font-heading text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
                  <span>Diagnostic Lab Tests &amp; Reports</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-700 font-medium mt-1 max-w-xl">
                  Access certified pathology investigations, blood profiles, and digital lab results directly linked to your ABHA health registry.
                </p>
              </div>

              {/* Status Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-300 shadow-xs flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <span className="material-symbols-outlined text-teal-600 text-[16px]">science</span>
                  <span className="text-slate-600">Reports:</span>
                  <strong className="text-slate-900 font-black">{labReports.length} Investigations</strong>
                </div>
                <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-300 shadow-xs flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <span className="material-symbols-outlined text-emerald-600 text-[16px]">verified</span>
                  <span className="text-slate-600">Accreditation:</span>
                  <strong className="text-emerald-700 font-black">NABL ISO-15189</strong>
                </div>
                <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-300 shadow-xs flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <span className="material-symbols-outlined text-sky-600 text-[16px]">domain</span>
                  <span className="text-slate-600">Hub:</span>
                  <strong className="text-slate-900 font-black">CHC Sitapur Central</strong>
                </div>
              </div>
            </div>

            {/* Right Side Filter Tabs & Registry Chip */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
              <div className="inline-flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl border border-slate-300 shadow-xs text-xs">
                <span className="material-symbols-outlined text-emerald-600 text-[18px]">verified_user</span>
                <div>
                  <span className="text-[10px] text-slate-500 font-black uppercase block leading-tight">ABDM Laboratory</span>
                  <strong className="text-slate-800 font-mono font-bold leading-tight">NABL-UP-84920</strong>
                </div>
              </div>

              <div className="flex bg-white rounded-2xl p-1 border border-slate-300 shadow-xs">
                {['All', 'Completed', 'Pending'].map(f => (
                  <button 
                    key={f} 
                    type="button" 
                    onClick={() => setLabFilter(f)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      labFilter === f 
                        ? 'bg-teal-700 text-white shadow-xs' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center bg-white rounded-3xl border border-slate-200">
            <span className="material-symbols-outlined text-4xl text-teal-600 animate-spin block mx-auto mb-2">sync</span>
            <p className="text-xs text-slate-500 font-bold">Synchronizing pathology investigations...</p>
          </div>
        ) : selectedReport ? (
          /* DETAILED REPORT VIEW */
          <div className="animate-fadeIn">
            <button 
              type="button" 
              onClick={() => setSelectedReport(null)}
              className="inline-flex items-center gap-1.5 text-xs font-black text-teal-800 bg-teal-50 hover:bg-teal-100 px-3.5 py-2 rounded-xl border border-teal-200 transition-colors cursor-pointer mb-4"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Back to All Reports</span>
            </button>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
              {/* Official Header */}
              <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-6 border-b-2 border-teal-500">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-teal-600/80 text-white flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[26px]">biotech</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-black tracking-widest text-teal-300 block">Ministry of Health &amp; Family Welfare</span>
                    <h4 className="text-lg font-black text-white">{selectedReport.facility || 'CHC Sitapur Central Pathology Lab'}</h4>
                    <p className="text-xs text-slate-300">NABL Accredited ISO 15189 • National Digital Health Grid</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Patient & Order Details */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-5">
                  <div>
                    <span className="text-[10px] text-slate-400 font-black uppercase block">Citizen Name</span>
                    <strong className="text-slate-900 font-black">{selectedReport.patientName || user?.name}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-black uppercase block">Order Barcode</span>
                    <strong className="font-mono text-teal-900 font-black">{selectedReport.orderId}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-black uppercase block">Prescribed By</span>
                    <strong className="text-slate-900 font-bold">{selectedReport.doctorName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-black uppercase block">Date Completed</span>
                    <strong className="text-slate-900 font-bold">
                      {selectedReport.completedAt ? new Date(selectedReport.completedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Verified Today'}
                    </strong>
                  </div>
                </div>

                {/* Investigation Title */}
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-black text-slate-900 font-heading">{selectedReport.testName}</h4>
                  <span className="text-xs font-black text-teal-900 bg-teal-50 px-3 py-1 rounded-xl border border-teal-200">{selectedReport.category}</span>
                </div>

                {/* Results Table */}
                {selectedReport.results && selectedReport.results.length > 0 ? (
                  <div className="border border-slate-200 rounded-2xl overflow-hidden mb-5">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100/80 text-slate-700 border-b border-slate-200">
                          <th className="px-4 py-3 font-black uppercase tracking-wider text-[11px]">Parameter</th>
                          <th className="px-4 py-3 font-black uppercase tracking-wider text-[11px]">Observed Value</th>
                          <th className="px-4 py-3 font-black uppercase tracking-wider text-[11px]">Reference Range</th>
                          <th className="px-4 py-3 font-black uppercase tracking-wider text-[11px] text-right">Interpretation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedReport.results.map((res, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-black text-slate-900">{res.parameter}</td>
                            <td className="px-4 py-3 font-black text-teal-900">
                              {res.value} <span className="text-slate-500 text-[11px] font-medium">{res.unit}</span>
                            </td>
                            <td className="px-4 py-3 text-slate-600 font-mono text-xs">{res.normalRange}</td>
                            <td className="px-4 py-3 text-right">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                                res.flag === 'High' ? 'bg-rose-50 text-rose-900 border-rose-300' :
                                res.flag === 'Low' ? 'bg-amber-50 text-amber-900 border-amber-300' :
                                'bg-emerald-50 text-emerald-900 border-emerald-300'
                              }`}>{res.flag || 'Normal'}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-200 mb-5 text-xs text-slate-500">
                    <span className="material-symbols-outlined text-2xl text-teal-600 animate-spin block mb-1">sync</span>
                    Sample collected and in laboratory queue. Results will be uploaded once verified by pathologist.
                  </div>
                )}

                {/* Pathologist Summary */}
                {selectedReport.summary && (
                  <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-2xl mb-5 text-xs">
                    <strong className="text-emerald-950 font-black block mb-1">Pathologist Impression &amp; Findings:</strong>
                    <p className="text-slate-800 font-medium leading-relaxed">{selectedReport.summary}</p>
                  </div>
                )}

                {/* Verification & Print CTA */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-emerald-600 text-[24px]">verified</span>
                    <div>
                      <span className="font-black text-slate-900 block">Digitally Signed &amp; Authenticated</span>
                      <span className="text-slate-500 text-[11px]">{selectedReport.verifiedBy || 'Dr. Anjali Seth (MD Pathology, Reg: NABL-84920)'}</span>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => printDiagnosticReport(selectedReport)}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-black rounded-xl shadow-md shadow-teal-700/20 transition-all cursor-pointer active:scale-98"
                  >
                    <span className="material-symbols-outlined text-[17px]">print</span>
                    <span>Download / Print Slip</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-2xs">
            <span className="material-symbols-outlined text-slate-300 text-[48px]">science</span>
            <p className="text-sm text-slate-600 font-bold mt-2">No Lab Reports Ordered Yet</p>
            <p className="text-xs text-slate-400 mt-1">When your doctor orders blood tests or diagnostic investigations, they will appear here instantly.</p>
          </div>
        ) : (
          /* LIST VIEW */
          <div className="space-y-3.5">
            {filtered.map((report) => {
              const isCompleted = report.status === 'completed';
              const isProcessing = report.status === 'processing' || report.status === 'sample_collected';
              const dateFormatted = report.dateOrdered 
                ? new Date(report.dateOrdered).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) 
                : 'Recently';

              return (
                <div 
                  key={report._id} 
                  className={`p-5 rounded-2xl border-2 transition-all ${
                    isCompleted 
                      ? 'bg-white border-emerald-200/90 hover:border-emerald-400 hover:shadow-md' 
                      : 'bg-slate-50/70 border-slate-200 hover:border-teal-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 mb-2.5">
                    <div className="flex items-start gap-3.5">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs border ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-teal-50 text-teal-700 border-teal-200'
                      }`}>
                        <span className="material-symbols-outlined text-[22px]">
                          {report.category?.includes('Hema') ? 'bloodtype' : 'science'}
                        </span>
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-black text-slate-900 text-sm">{report.testName}</h4>
                          <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">{report.orderId}</span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium mt-0.5">
                          Prescribed by <strong className="text-slate-900 font-bold">{report.doctorName}</strong> • {dateFormatted}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{report.facility}</p>
                      </div>
                    </div>
                    <div className="self-start sm:self-auto shrink-0">
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-black shadow-2xs">
                          <span className="material-symbols-outlined text-[15px] text-emerald-700">check_circle</span>
                          Report Ready
                        </span>
                      ) : isProcessing ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-900 border border-sky-200 text-xs font-black shadow-2xs">
                          <span className="material-symbols-outlined text-[15px] text-sky-600 animate-spin">sync</span>
                          {report.status === 'sample_collected' ? 'Sample Dispatched' : 'Under Testing'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-black shadow-2xs">
                          <span className="material-symbols-outlined text-[15px] text-amber-700">schedule</span>
                          Pending Sample
                        </span>
                      )}
                    </div>
                  </div>

                  {report.fastingRequired && (
                    <div className="mt-2 text-xs bg-teal-50/80 border border-teal-200 p-2.5 rounded-xl text-teal-950 flex items-center gap-2 font-medium">
                      <span className="material-symbols-outlined text-[16px] text-teal-700">info</span>
                      <span><strong>Fasting Required:</strong> 8 to 12 hours overnight fasting before giving blood sample.</span>
                    </div>
                  )}

                  <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                    <span className="text-[11px] font-bold text-slate-400">{report.category || 'Clinical Pathology'}</span>
                    {isCompleted ? (
                      <button 
                        type="button" 
                        onClick={() => setSelectedReport(report)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-black rounded-xl shadow-md shadow-teal-700/20 transition-all cursor-pointer active:scale-98"
                      >
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                        <span>View Verified Report</span>
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs inline-flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>ASHA / PHC Sample Collection Scheduled</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
