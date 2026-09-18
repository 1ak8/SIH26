import { useState, useEffect } from 'react';
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
    printWindow.document.write(`<!DOCTYPE html><html><head><title>Lab Report - ${report.testName}</title>
      <style>body{font-family:'Segoe UI',sans-serif;padding:30px;color:#0f172a;}table{width:100%;border-collapse:collapse;margin:15px 0;}th{background:#f1f5f9;text-align:left;padding:10px 12px;font-size:12px;border-bottom:2px solid #cbd5e1;}</style></head><body>
      <div style="display:flex;align-items:center;gap:12px;border-bottom:3px solid #d97706;padding-bottom:15px;margin-bottom:20px;">
        <div style="width:50px;height:50px;background:#fef3c7;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:24px;">🔬</div>
        <div><div style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#92400e;font-weight:800;">Ministry of Health & Family Welfare</div>
        <div style="font-size:18px;font-weight:900;">${report.facility || 'CHC Sitapur Central Pathology Lab'}</div>
        <div style="font-size:11px;color:#64748b;">NABL Accredited ISO 15189 • National Digital Health Grid</div></div></div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:10px;background:#fffbeb;padding:12px;border-radius:8px;margin-bottom:20px;font-size:12px;border:1px solid #fde68a;">
        <div><div style="font-size:10px;color:#92400e;font-weight:700;text-transform:uppercase;">Patient</div><strong>${report.patientName || user?.name}</strong></div>
        <div><div style="font-size:10px;color:#92400e;font-weight:700;text-transform:uppercase;">Order ID</div><strong style="font-family:monospace;">${report.orderId}</strong></div>
        <div><div style="font-size:10px;color:#92400e;font-weight:700;text-transform:uppercase;">Doctor</div><strong>${report.doctorName}</strong></div>
        <div><div style="font-size:10px;color:#92400e;font-weight:700;text-transform:uppercase;">Date</div><strong>${dateFormatted}</strong></div>
      </div>
      <h3 style="font-size:16px;margin-bottom:10px;">${report.testName} <span style="background:#fef3c7;padding:2px 8px;border-radius:4px;font-size:11px;color:#92400e;">${report.category}</span></h3>
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
    <div className="min-h-screen bg-slate-100">
      <PatientNavbar />
      <main className="w-full px-6 lg:px-12 xl:px-16 pt-[92px] pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-amber-600 text-[28px]">science</span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">Lab Reports</h1>
            </div>
            <p className="text-sm text-slate-600 font-medium">Diagnostic investigations ordered by your attending doctors & verified by pathology labs.</p>
          </div>
          <div className="flex bg-white rounded-xl p-1 border border-slate-200 shadow-xs">
            {['All', 'Completed', 'Pending'].map(f => (
              <button key={f} type="button" onClick={() => setLabFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${labFilter === f ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-amber-500 animate-spin block mx-auto mb-2">sync</span>
            <p className="text-sm text-slate-500 font-bold">Synchronizing lab investigations...</p>
          </div>
        ) : selectedReport ? (
          /* DETAILED REPORT VIEW */
          <div className="animate-fadeIn">
            <button type="button" onClick={() => setSelectedReport(null)}
              className="inline-flex items-center gap-1.5 text-xs font-black text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-300 transition-colors cursor-pointer mb-4">
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Back to All Reports</span>
            </button>

            <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden">
              {/* Official Header */}
              <div className="bg-slate-900 text-white p-5 border-b-4 border-amber-500">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[24px]">biotech</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-black tracking-wider text-amber-300 block">Ministry of Health & Family Welfare</span>
                    <h4 className="text-base font-black">{selectedReport.facility || 'CHC Sitapur Central Pathology Lab'}</h4>
                    <p className="text-[11px] text-slate-300">NABL Accredited ISO 15189 • National Digital Health Grid</p>
                  </div>
                </div>
              </div>

              <div className="p-5">
                {/* Patient & Order Details */}
                <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-200 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs mb-4">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Citizen Name</span>
                    <strong className="text-slate-900 font-black">{selectedReport.patientName || user?.name}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Barcode / Order ID</span>
                    <strong className="font-mono text-amber-950 font-black">{selectedReport.orderId}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Prescribed By</span>
                    <strong className="text-slate-900 font-extrabold">{selectedReport.doctorName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Date Completed</span>
                    <strong className="text-slate-900 font-extrabold">
                      {selectedReport.completedAt ? new Date(selectedReport.completedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Verified Today'}
                    </strong>
                  </div>
                </div>

                {/* Investigation Title */}
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-base font-black text-slate-900">{selectedReport.testName}</h4>
                  <span className="text-xs font-black text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-md border border-amber-300">{selectedReport.category}</span>
                </div>

                {/* Results Table */}
                {selectedReport.results && selectedReport.results.length > 0 ? (
                  <div className="border border-slate-200 rounded-2xl overflow-hidden mb-4">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                          <th className="px-3 py-2 font-black uppercase">Parameter</th>
                          <th className="px-3 py-2 font-black uppercase">Observed Value</th>
                          <th className="px-3 py-2 font-black uppercase">Reference Range</th>
                          <th className="px-3 py-2 font-black uppercase text-right">Interpretation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedReport.results.map((res, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="px-3 py-2 font-extrabold text-slate-900">{res.parameter}</td>
                            <td className="px-3 py-2 font-black text-amber-950">
                              {res.value} <span className="text-slate-500 text-[11px] font-medium">{res.unit}</span>
                            </td>
                            <td className="px-3 py-2 text-slate-600 font-mono text-[11px]">{res.normalRange}</td>
                            <td className="px-3 py-2 text-right">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                res.flag === 'High' ? 'bg-rose-100 text-rose-900 border border-rose-300' :
                                res.flag === 'Low' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                                'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              }`}>{res.flag || 'Normal'}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-5 text-center bg-slate-50 rounded-2xl border border-slate-200 mb-4 text-xs text-slate-500">
                    <span className="material-symbols-outlined text-2xl text-amber-600 animate-spin block mb-1">sync</span>
                    Sample collected and in laboratory queue. Results will be uploaded once verified by pathologist.
                  </div>
                )}

                {/* Summary */}
                {selectedReport.summary && (
                  <div className="bg-emerald-50/70 border border-emerald-300 p-3 rounded-xl mb-4 text-xs">
                    <strong className="text-emerald-900 font-black block mb-0.5">Pathologist Impression & Findings:</strong>
                    <p className="text-slate-700 font-medium">{selectedReport.summary}</p>
                  </div>
                )}

                {/* Verification & Print */}
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600 text-[22px]">verified</span>
                    <div>
                      <span className="font-black text-slate-900 block">Digitally Signed & Authenticated</span>
                      <span className="text-slate-500 text-[11px]">{selectedReport.verifiedBy || 'Dr. Anjali Seth (MD Pathology, Reg: NABL-84920)'}</span>
                    </div>
                  </div>
                  <button type="button" onClick={() => printDiagnosticReport(selectedReport)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black rounded-xl shadow-xs transition-all cursor-pointer">
                    <span className="material-symbols-outlined text-[16px]">print</span>
                    <span>Print Report</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
            <span className="material-symbols-outlined text-slate-300 text-[48px]">science</span>
            <p className="text-sm text-slate-500 font-bold mt-3">No Lab Reports Ordered Yet</p>
            <p className="text-xs text-slate-400 mt-1">When your doctor orders blood tests or diagnostic investigations, they will appear here instantly.</p>
          </div>
        ) : (
          /* LIST VIEW */
          <div className="space-y-3">
            {filtered.map((report) => {
              const isCompleted = report.status === 'completed';
              const isProcessing = report.status === 'processing' || report.status === 'sample_collected';
              const dateFormatted = report.dateOrdered 
                ? new Date(report.dateOrdered).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) 
                : 'Recently';

              return (
                <div key={report._id} className={`p-4 rounded-2xl border-2 transition-all ${
                  isCompleted ? 'bg-white border-amber-200 hover:border-amber-400 hover:shadow-sm' : 'bg-amber-50/30 border-amber-300/80'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[20px]">
                          {report.category?.includes('Hema') ? 'bloodtype' : 'science'}
                        </span>
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-black text-slate-900 text-sm">{report.testName}</h4>
                          <span className="font-mono text-[10px] font-bold text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">{report.orderId}</span>
                        </div>
                        <p className="text-xs text-slate-600 font-semibold mt-0.5">
                          Ordered by <strong className="text-slate-900">{report.doctorName}</strong> • {dateFormatted}
                        </p>
                        <p className="text-[11px] text-slate-500">{report.facility}</p>
                      </div>
                    </div>
                    <div className="self-start sm:self-auto shrink-0">
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-black">
                          <span className="material-symbols-outlined text-[15px] text-emerald-700">check_circle</span>
                          Report Available
                        </span>
                      ) : isProcessing ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-900 border border-sky-300 text-xs font-black">
                          <span className="material-symbols-outlined text-[15px] text-sky-600 animate-spin">sync</span>
                          {report.status === 'sample_collected' ? 'Sample Dispatched' : 'Under Testing'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black">
                          <span className="material-symbols-outlined text-[15px] text-amber-700">schedule</span>
                          Pending Sample
                        </span>
                      )}
                    </div>
                  </div>

                  {report.fastingRequired && (
                    <div className="mt-2 text-xs bg-amber-100/70 border border-amber-300 p-2 rounded-xl text-amber-950 flex items-center gap-2 font-medium">
                      <span className="material-symbols-outlined text-[16px] text-amber-700">info</span>
                      <span>Fasting Required: 8 to 12 hours overnight fasting before giving blood sample.</span>
                    </div>
                  )}

                  {report.clinicalNotes && (
                    <p className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-200 italic font-medium">"{report.clinicalNotes}"</p>
                  )}

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-3">
                    <span className="text-[11px] font-bold text-slate-500">{report.category || 'Clinical Pathology'}</span>
                    {isCompleted ? (
                      <button type="button" onClick={() => setSelectedReport(report)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black rounded-xl shadow-xs transition-all cursor-pointer">
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                        <span>View Verified Report</span>
                      </button>
                    ) : (
                      <span className="text-xs font-extrabold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                        ASHA / PHC Sample Collection Scheduled
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
