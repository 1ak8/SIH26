import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const ALERTS = [
  {
    icon: 'inventory_2', color: 'tertiary', bg: 'tertiary-fixed',
    category: 'Dispensary Stock Critical', source: 'District Hospital CHC Sitapur',
    title: 'Medicine stock low at District CHC Sitapur (Paracetamol & Amoxicillin reserves below 15%)',
    detail: 'Buffer stock depleted • Auto-requisition ticket #REQ-88902 generated',
    action: 'View Stock & Reorder',
  },
  {
    icon: 'pregnant_woman', color: 'tertiary', bg: 'tertiary-fixed',
    category: 'Clinical Escalation', source: 'Block B Sub-Center 04',
    title: 'High-risk maternal alerts pending review in Block B (3 urgent cases flagged by ASHA)',
    detail: 'Severe anemia (Hb < 7.0 g/dL) detected • Specialist tele-triaging requested',
    action: 'View Cases',
  },
  {
    icon: 'wifi_tethering_error', color: 'secondary', bg: 'secondary-container',
    category: 'Telemetry Latency', source: 'PHC Rampur Outpost',
    title: 'Network bandwidth latency reported at PHC Rampur tele-kiosk',
    detail: 'Signal strength degradation • Video feed reverting to audio fallback',
    action: 'View Diagnostics',
  },
];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/admin/analytics').then(r => setData(r.data.data)).catch(() => {});
  }, []);

  const handleExport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      generatedBy: user?.name,
      analytics: data,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aarogyanet-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-surface-container-lowest text-on-surface font-sans min-h-screen">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest border-b border-surface-variant">
        <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary-container text-[20px]">health_and_safety</span>
            </div>
            <span className="text-headline-md font-bold text-on-surface tracking-tight leading-tight">AarogyaNet</span>
          </div>
          <nav className="hidden lg:flex items-center gap-2">
            <a className="px-3 py-1.5 inline-flex items-center gap-1.5 transition-colors bg-surface-container text-on-surface font-bold text-body-md rounded-lg" href="#">
              <span className="material-symbols-outlined text-[20px]">dashboard</span>
              <span>National Overview</span>
            </a>
            <a className="px-3 py-1.5 inline-flex items-center gap-1.5 transition-colors text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg" href="#">
              <span className="material-symbols-outlined text-[20px]">domain</span>
              <span>Tele-Health Centers</span>
            </a>
            <a className="px-3 py-1.5 inline-flex items-center gap-1.5 transition-colors text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg" href="#">
              <span className="material-symbols-outlined text-[20px]">diversity_1</span>
              <span>Field Force (ASHA)</span>
            </a>
            <a className="px-3 py-1.5 inline-flex items-center gap-1.5 transition-colors text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg" href="#">
              <span className="material-symbols-outlined text-[20px]">medication</span>
              <span>Drug Inventory</span>
            </a>
            <a className="px-3 py-1.5 inline-flex items-center gap-1.5 transition-colors text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg" href="#">
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span>Alerts & Directives</span>
            </a>
          </nav>
          <div className="flex items-center gap-3 shrink-0">
            <button className="h-10 px-3 flex items-center gap-2 bg-surface-container-lowest border border-surface-variant rounded-lg text-on-surface text-label-md hover:bg-surface-container hover:text-on-surface transition-colors" type="button">
              <span className="material-symbols-outlined text-secondary text-[20px]">translate</span>
              <span className="hidden sm:inline">Language: EN / हिंदी</span>
            </button>
            <a className="h-10 px-4 flex items-center gap-2 bg-primary-container text-on-primary-container text-label-lg rounded-lg hover:bg-[#ffb95f] hover:text-on-surface transition-colors" href="tel:108">
              <span className="material-symbols-outlined text-[20px]">call</span>
              <span>Emergency 108</span>
            </a>
            <button onClick={logout} className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary shrink-0" title="Logout">
              <span className="material-symbols-outlined text-[20px]">person</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="w-full bg-surface-container-lowest max-w-7xl mx-auto px-4 lg:px-8 pt-16">
        <div className="flex flex-col w-full pb-8">
          {/* Top Header */}
          <div className="w-full flex flex-col md:flex-row md:items-end justify-between gap-4 py-5 border-b border-surface-variant">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-primary-container"></span>
                <span className="text-label-sm text-secondary uppercase tracking-wider">Mission Directorate MIS • Live Telemetry</span>
              </div>
              <h1 className="text-headline-lg font-bold text-on-surface tracking-tight">National Health Overview</h1>
              <p className="text-body-md text-on-surface-variant">Rural Tele-Health Mission — Central Surveillance & District Delivery Framework</p>
            </div>
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container-lowest border border-surface-variant rounded-lg">
                <span className="material-symbols-outlined text-secondary text-[20px]">calendar_today</span>
                <span className="text-label-md text-on-surface">Today: {new Date().toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <button className="h-12 px-3 flex items-center gap-2 bg-surface-container-lowest border border-surface-variant rounded-lg text-label-md text-on-surface hover:bg-surface-container transition-colors" type="button">
                <span className="material-symbols-outlined text-secondary text-[20px]">tune</span>
                <span>District Filter</span>
              </button>
              <button className="h-12 px-4 flex items-center gap-2 bg-primary-container text-on-primary-container text-label-lg rounded-lg hover:bg-[#ffb95f] transition-colors" type="button" onClick={handleExport}>
                <span className="material-symbols-outlined text-[20px]">file_download</span>
                <span>Export MIS</span>
              </button>
            </div>
          </div>

          {/* Network Status Callout */}
          <div className="w-full mt-5 p-4 bg-secondary-container rounded-lg border-l-4 border-on-surface flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-on-secondary-fixed text-[26px]">hub</span>
              <div className="flex flex-col">
                <span className="text-label-md text-on-secondary-fixed font-bold">State Central Node Synchronized</span>
                <span className="text-body-md text-on-secondary-container">142 Primary Health Centers connected. Satellite uplink latency: 34ms. Zero packet drops reported.</span>
              </div>
            </div>
            <span className="text-label-sm text-on-secondary-fixed font-bold px-2 py-0.5 bg-surface-container-lowest rounded">NODE UP: 99.98%</span>
          </div>

          {/* KPI Cards */}
          <section className="mt-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Patients', value: data?.totalPatients?.toLocaleString() || '12,450', icon: 'groups', trend: <><span className="material-symbols-outlined text-primary text-[18px]">trending_up</span><span className="font-bold text-primary">+8.2%</span><span className="text-on-surface-variant font-normal">from last week</span></> },
                { label: 'Tele-Consults Completed', value: data?.todayConsultations?.toLocaleString() || '3,890', icon: 'video_chat', trend: <><span className="material-symbols-outlined text-secondary text-[18px]">schedule</span><span>Avg. Duration: <strong className="text-on-surface font-bold">7.4 mins</strong></span></> },
                { label: 'Active ASHA Workers', value: '1,120', icon: 'medical_services', trend: <><span className="material-symbols-outlined text-secondary text-[18px]">travel_explore</span><span>Field coverage: <strong className="text-on-surface font-bold">94.6%</strong></span></> },
                { label: 'Prescriptions Dispatched', value: '11,840', icon: 'local_pharmacy', trend: <><span className="material-symbols-outlined text-secondary text-[18px]">check_circle</span><span>Dispensary fulfillment: <strong className="text-on-surface font-bold">98.1%</strong></span></> },
              ].map(kpi => (
                <div key={kpi.label} className="bg-surface-container-lowest rounded-lg p-6 border border-surface-variant flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-label-sm text-secondary uppercase font-bold tracking-wider">{kpi.label}</span>
                    <span className="material-symbols-outlined text-secondary text-[24px]">{kpi.icon}</span>
                  </div>
                  <div className="mt-4">
                    <div className="text-display-lg font-bold text-on-surface tracking-tight">{kpi.value}</div>
                    <div className="mt-2 flex items-center gap-1 text-label-md text-on-surface-variant">{kpi.trend}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Charts Section */}
          <section className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Chart 1: District Consultations */}
            <div className="bg-surface-container-lowest border border-surface-variant rounded-lg p-6 flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-surface-variant">
                <div>
                  <h2 className="text-headline-sm font-bold text-on-surface">Weekly Tele-Consultations by District</h2>
                  <p className="text-label-sm text-on-surface-variant mt-0.5">Aggregated consultations cross-referenced by demographic block</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-primary-container"></span>
                    <span className="text-label-sm text-secondary">Rural Block</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-on-surface"></span>
                    <span className="text-label-sm text-secondary">Semi-Urban</span>
                  </div>
                </div>
              </div>
              {/* SVG Bar Chart */}
              <div className="w-full mt-6">
                <svg aria-label="District consultation chart" className="w-full h-auto overflow-visible" role="img" viewBox="0 0 540 240">
                  <line stroke="#E5E7EB" strokeWidth="1" x1="90" x2="520" y1="20" y2="20" />
                  <line stroke="#E5E7EB" strokeWidth="1" x1="90" x2="520" y1="70" y2="70" />
                  <line stroke="#E5E7EB" strokeWidth="1" x1="90" x2="520" y1="120" y2="120" />
                  <line stroke="#E5E7EB" strokeWidth="1" x1="90" x2="520" y1="170" y2="170" />
                  <line stroke="#1E293B" strokeWidth="1.5" x1="90" x2="520" y1="210" y2="210" />
                  <text className="text-[12px] font-bold" fill="#50616b" textAnchor="end" x="80" y="24">1,500</text>
                  <text className="text-[12px] font-bold" fill="#50616b" textAnchor="end" x="80" y="74">1,000</text>
                  <text className="text-[12px] font-bold" fill="#50616b" textAnchor="end" x="80" y="124">500</text>
                  <text className="text-[12px] font-bold" fill="#50616b" textAnchor="end" x="80" y="174">250</text>
                  <text className="text-[12px] font-bold" fill="#50616b" textAnchor="end" x="80" y="214">0</text>
                  <g transform="translate(130, 0)">
                    <rect fill="#F59E0B" height="157" rx="2" width="28" x="0" y="53" />
                    <rect fill="#1E293B" height="130" rx="2" width="28" x="32" y="80" />
                    <text className="text-[12px] font-bold" fill="#111c2d" textAnchor="middle" x="30" y="44">1,240</text>
                    <text className="text-[13px] font-bold" fill="#111c2d" textAnchor="middle" x="30" y="230">Sitapur</text>
                  </g>
                  <g transform="translate(230, 0)">
                    <rect fill="#F59E0B" height="124" rx="2" width="28" x="0" y="86" />
                    <rect fill="#1E293B" height="95" rx="2" width="28" x="32" y="115" />
                    <text className="text-[12px] font-bold" fill="#111c2d" textAnchor="middle" x="30" y="77">980</text>
                    <text className="text-[13px] font-bold" fill="#111c2d" textAnchor="middle" x="30" y="230">Hardoi</text>
                  </g>
                  <g transform="translate(330, 0)">
                    <rect fill="#F59E0B" height="109" rx="2" width="28" x="0" y="101" />
                    <rect fill="#1E293B" height="80" rx="2" width="28" x="32" y="130" />
                    <text className="text-[12px] font-bold" fill="#111c2d" textAnchor="middle" x="30" y="92">860</text>
                    <text className="text-[13px] font-bold" fill="#111c2d" textAnchor="middle" x="30" y="230">Lakhimpur</text>
                  </g>
                  <g transform="translate(430, 0)">
                    <rect fill="#F59E0B" height="103" rx="2" width="28" x="0" y="107" />
                    <rect fill="#1E293B" height="68" rx="2" width="28" x="32" y="142" />
                    <text className="text-[12px] font-bold" fill="#111c2d" textAnchor="middle" x="30" y="98">810</text>
                    <text className="text-[13px] font-bold" fill="#111c2d" textAnchor="middle" x="30" y="230">Barabanki</text>
                  </g>
                </svg>
              </div>
              {/* District Breakdown Footer */}
              <div className="mt-6 pt-4 border-t border-surface-variant grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                {[
                  { label: 'Sitapur Rural', value: '710' },
                  { label: 'Hardoi Rural', value: '540' },
                  { label: 'Lakhimpur Rural', value: '490' },
                  { label: 'Barabanki Rural', value: '460' },
                ].map(d => (
                  <div key={d.label} className="flex flex-col">
                    <span className="text-label-sm text-secondary">{d.label}</span>
                    <span className="text-headline-sm font-bold text-on-surface">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart 2: ASHA Field Visits */}
            <div className="bg-surface-container-lowest border border-surface-variant rounded-lg p-6 flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-surface-variant">
                <div>
                  <h2 className="text-headline-sm font-bold text-on-surface">ASHA Field Visits & Immunization Tracking</h2>
                  <p className="text-label-sm text-on-surface-variant mt-0.5">Quarterly Target vs. Verified Field Realization</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-surface-variant border border-secondary"></span>
                    <span className="text-label-sm text-secondary">Target</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-primary-container"></span>
                    <span className="text-label-sm text-secondary">Achieved</span>
                  </div>
                </div>
              </div>
              {/* SVG Target vs Achieved */}
              <div className="w-full mt-6">
                <svg aria-label="Target versus Achieved tracking" className="w-full h-auto overflow-visible" role="img" viewBox="0 0 540 240">
                  <line stroke="#E5E7EB" strokeWidth="1" x1="90" x2="520" y1="20" y2="20" />
                  <line stroke="#E5E7EB" strokeWidth="1" x1="90" x2="520" y1="70" y2="70" />
                  <line stroke="#E5E7EB" strokeWidth="1" x1="90" x2="520" y1="120" y2="120" />
                  <line stroke="#E5E7EB" strokeWidth="1" x1="90" x2="520" y1="170" y2="170" />
                  <line stroke="#1E293B" strokeWidth="1.5" x1="90" x2="520" y1="210" y2="210" />
                  <text className="text-[12px] font-bold" fill="#50616b" textAnchor="end" x="80" y="24">5,000</text>
                  <text className="text-[12px] font-bold" fill="#50616b" textAnchor="end" x="80" y="74">3,750</text>
                  <text className="text-[12px] font-bold" fill="#50616b" textAnchor="end" x="80" y="124">2,500</text>
                  <text className="text-[12px] font-bold" fill="#50616b" textAnchor="end" x="80" y="174">1,250</text>
                  <text className="text-[12px] font-bold" fill="#50616b" textAnchor="end" x="80" y="214">0</text>
                  <g transform="translate(130, 0)">
                    <rect fill="#dee8ff" height="171" rx="2" width="28" x="0" y="39" />
                    <rect fill="#F59E0B" height="164" rx="2" width="28" x="32" y="46" />
                    <text className="text-[12px] font-bold" fill="#111c2d" textAnchor="middle" x="30" y="30">96%</text>
                    <text className="text-[13px] font-bold" fill="#111c2d" textAnchor="middle" x="30" y="230">Pentavalent</text>
                  </g>
                  <g transform="translate(230, 0)">
                    <rect fill="#dee8ff" height="145" rx="2" width="28" x="0" y="65" />
                    <rect fill="#F59E0B" height="135" rx="2" width="28" x="32" y="75" />
                    <text className="text-[12px] font-bold" fill="#111c2d" textAnchor="middle" x="30" y="58">93%</text>
                    <text className="text-[13px] font-bold" fill="#111c2d" textAnchor="middle" x="30" y="230">Antenatal</text>
                  </g>
                  <g transform="translate(330, 0)">
                    <rect fill="#dee8ff" height="160" rx="2" width="28" x="0" y="50" />
                    <rect fill="#F59E0B" height="148" rx="2" width="28" x="32" y="62" />
                    <text className="text-[12px] font-bold" fill="#111c2d" textAnchor="middle" x="30" y="42">92%</text>
                    <text className="text-[13px] font-bold" fill="#111c2d" textAnchor="middle" x="30" y="230">NCD Checks</text>
                  </g>
                  <g transform="translate(430, 0)">
                    <rect fill="#dee8ff" height="110" rx="2" width="28" x="0" y="100" />
                    <rect fill="#F59E0B" height="107" rx="2" width="28" x="32" y="103" />
                    <text className="text-[12px] font-bold" fill="#111c2d" textAnchor="middle" x="30" y="93">97%</text>
                    <text className="text-[13px] font-bold" fill="#111c2d" textAnchor="middle" x="30" y="230">Neonatal</text>
                  </g>
                </svg>
              </div>
              {/* Fulfillment Stats */}
              <div className="mt-6 pt-4 border-t border-surface-variant grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                {[
                  { label: 'Target Met', value: '14,560', color: 'text-primary' },
                  { label: 'Pending Visits', value: '840', color: 'text-on-surface' },
                  { label: 'High-Risk Flaggable', value: '38', color: 'text-tertiary' },
                  { label: 'Verified Sync', value: '100%', color: 'text-on-surface' },
                ].map(s => (
                  <div key={s.label} className="flex flex-col">
                    <span className="text-label-sm text-secondary">{s.label}</span>
                    <span className={`text-headline-sm font-bold ${s.color}`}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Priority System Alerts */}
          <section className="mt-8">
            <div className="flex items-center justify-between pb-3 border-b border-surface-variant">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary text-[24px]">crisis_alert</span>
                <h2 className="text-headline-md font-bold text-on-surface">Action Needed (Priority System Alerts)</h2>
              </div>
              <span className="text-label-sm text-on-tertiary-container bg-tertiary-fixed px-2.5 py-1 rounded font-bold uppercase">3 Critical Issues</span>
            </div>
            <div className="mt-4 flex flex-col gap-3">
              {ALERTS.map((alert, i) => (
                <div key={i} className="bg-surface-container-lowest border border-surface-variant rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg bg-${alert.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                      <span className={`material-symbols-outlined text-${alert.color} text-[24px]`}>{alert.icon}</span>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-label-sm uppercase font-bold text-${alert.color}`}>{alert.category}</span>
                        <span className="text-secondary">•</span>
                        <span className="text-label-sm text-secondary">{alert.source}</span>
                      </div>
                      <p className="text-body-lg font-bold text-on-surface mt-1">{alert.title}</p>
                      <span className="text-label-sm text-on-surface-variant mt-1">{alert.detail}</span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <button className="w-full md:w-auto h-12 px-4 bg-surface-container-lowest border border-surface-variant rounded-lg text-on-surface text-label-md hover:bg-surface-container transition-colors flex items-center justify-center gap-2" type="button">
                      <span>{alert.action}</span>
                      <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Command Center Dock */}
          <section className="mt-8 bg-surface-container-low rounded-lg p-6 border border-surface-variant flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-[28px]">admin_panel_settings</span>
              <div>
                <h3 className="text-headline-sm font-bold text-on-surface">District Tele-Medicine Command Center</h3>
                <p className="text-body-md text-on-surface-variant">Manage doctor roster rotations, emergency van dispatch, and rural drug distribution trucks.</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <button className="h-12 px-4 bg-surface-container-lowest border border-surface-variant rounded-lg text-on-surface text-label-md hover:bg-surface-container transition-colors" type="button">
                Doctor Shift Roster
              </button>
              <button className="h-12 px-4 bg-on-surface text-surface-container-lowest rounded-lg text-label-md hover:bg-inverse-surface transition-colors" type="button">
                Issue State Directives
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-surface border-t border-surface-variant mt-8">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="md:col-span-2 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[28px]">verified</span>
                <span className="text-headline-sm text-on-surface font-bold">Ministry of Health & Family Welfare</span>
              </div>
              <p className="text-body-md text-on-surface-variant max-w-xl">AarogyaNet delivers verified public clinical connectivity across rural dispensaries, district hospitals, and tertiary research institutes under the National Digital Health Framework.</p>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-label-md text-secondary uppercase">Emergency Helplines</span>
              <span className="text-headline-sm font-bold text-tertiary">Toll-Free 1075 / 108</span>
              <span className="text-label-sm text-on-surface-variant">24x7 National Tele-Consult & Dispatch</span>
            </div>
          </div>
          <div className="mt-5 pt-3 border-t border-surface-variant flex flex-col sm:flex-row items-center justify-between gap-2 text-label-sm text-secondary">
            <p>© 2025 Government Public Healthcare Infrastructure. All citizen rights reserved.</p>
            <p>Radical Clarity & Rural Accessibility Compliant</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
