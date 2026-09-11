import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import LanguageSelector from '../../components/LanguageSelector';

const INITIAL_ALERTS = [
  {
    id: 1, icon: 'inventory_2', color: 'tertiary', bg: 'tertiary-container',
    category: 'Dispensary Stock Critical', source: 'District Hospital CHC Sitapur',
    title: 'Medicine stock low at District CHC Sitapur (Paracetamol reserves below 15%)',
    detail: 'Buffer stock depleted • Auto-requisition ticket #REQ-88902 generated',
    action: 'View Stock & Reorder',
  },
  {
    id: 2, icon: 'pregnant_woman', color: 'tertiary', bg: 'tertiary-container',
    category: 'Clinical Escalation', source: 'Block B Sub-Center 04',
    title: 'High-risk maternal alerts pending review in Block B',
    detail: 'Severe anemia (Hb < 7.0 g/dL) detected • Specialist tele-triaging requested',
    action: 'View Cases',
  },
];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [toast, setToast] = useState(null);
  
  // Custom View State
  const [activeView, setActiveView] = useState('overview');

  // Modals State
  const [activeModal, setActiveModal] = useState(null); 
  const [modalContent, setModalContent] = useState({});
  const [exportProgress, setExportProgress] = useState(0);

  // Language State
  const [lang, setLang] = useState('en');
  const toggleLang = () => setLang(l => l === 'en' ? 'hi' : 'en');
  const t = (enText, hiText) => lang === 'en' ? enText : (hiText || enText);

  useEffect(() => {
    api.get('/admin/analytics').then(r => setData(r.data.data)).catch(() => {});
  }, []);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleExport = () => {
    setActiveModal('exportProgress');
    setExportProgress(0);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setExportProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          const report = { generatedAt: new Date().toISOString(), analytics: data };
          const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `sehatsaarthi-report.json`;
          a.click();
          URL.revokeObjectURL(url);
          setActiveModal(null);
          showToast(t('Data Exported Successfully!', 'डेटा सफलतापूर्वक निर्यात किया गया!'));
        }, 500);
      }
    }, 400);
  };

  const handleAlertAction = (alert) => {
    setModalContent({
      title: alert.action,
      body: `${t('Processing action for:', 'कार्रवाई की जा रही है:')} ${alert.title}\n${t('Source:', 'स्रोत:')} ${alert.source}`,
      onConfirm: () => {
        setAlerts(alerts.filter(a => a.id !== alert.id));
        showToast(`${alert.action} ${t('processed successfully!', 'सफलतापूर्वक संसाधित!')}`);
        setActiveModal(null);
      }
    });
    setActiveModal('alertConfirm');
  };

  const submitDirective = (e) => {
    e.preventDefault();
    setActiveModal(null);
    showToast(t('Directive successfully broadcasted!', 'निर्देश सफलतापूर्वक प्रसारित किया गया!'));
  };

  const saveRoster = () => {
    setActiveModal(null);
    showToast(t('Doctor shift roster updated!', 'डॉक्टर शिफ्ट रोस्टर अपडेट किया गया!'));
  };

  const applyDistrictFilter = () => {
    setActiveModal(null);
    showToast(t('Filters applied to dashboard.', 'डैशबोर्ड पर फ़िल्टर लागू किए गए।'));
  };

  return (
    <div className="bg-[#fbfaf7] text-slate-900 font-sans min-h-screen">
      {/* HEADER: Exactly matching Patient and ASHA Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs w-full">
        <div className="w-full px-6 lg:px-12 xl:px-16 flex items-center justify-between gap-8 h-20">
          {/* Logo with Govt Portal Badge Below */}
          <div className="flex items-center gap-3.5 shrink-0 group">
              <img src="/images/logo-transparent.png" alt="SehatSaarthi" className="w-11 h-11 rounded-2xl object-cover shrink-0 notranslate" translate="no" />
            <div className="flex flex-col">
              <span className="font-brand font-black text-slate-900 tracking-tight text-2xl leading-none notranslate" translate="no">SehatSaarthi</span>
              <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 self-start mt-1">
                Govt Portal • Mission MIS
              </span>
            </div>
          </div>

          {/* Clean Navigation Items with Subtle Dividers */}
          <nav className="hidden lg:flex items-center gap-2 xl:gap-3">
            <button 
              onClick={() => setActiveView('overview')} 
              className={`px-3.5 py-2 font-extrabold text-sm rounded-xl transition-all flex items-center gap-2 ${
                activeView === 'overview' 
                  ? 'bg-amber-600 text-white shadow-sm' 
                  : 'text-slate-700 hover:text-amber-800 hover:bg-amber-50/70'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">dashboard</span>
              <span>{t('National Overview', 'राष्ट्रीय अवलोकन')}</span>
            </button>

            <div className="h-6 w-[2px] bg-slate-300 rounded-full shrink-0"></div>

            <button 
              onClick={() => setActiveView('teleCenters')} 
              className={`px-3.5 py-2 font-extrabold text-sm rounded-xl transition-all flex items-center gap-2 ${
                activeView === 'teleCenters' 
                  ? 'bg-amber-600 text-white shadow-sm' 
                  : 'text-slate-700 hover:text-amber-800 hover:bg-amber-50/70'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">domain</span>
              <span>{t('Tele-Health Centers', 'टेली-हेल्थ केंद्र')}</span>
            </button>

            <div className="h-6 w-[2px] bg-slate-300 rounded-full shrink-0"></div>

            <button 
              onClick={() => setActiveView('fieldForce')} 
              className={`px-3.5 py-2 font-extrabold text-sm rounded-xl transition-all flex items-center gap-2 ${
                activeView === 'fieldForce' 
                  ? 'bg-amber-600 text-white shadow-sm' 
                  : 'text-slate-700 hover:text-amber-800 hover:bg-amber-50/70'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">diversity_1</span>
              <span>{t('Field Force (ASHA)', 'फील्ड फोर्स (आशा)')}</span>
            </button>

            <div className="h-6 w-[2px] bg-slate-300 rounded-full shrink-0"></div>

            <button 
              onClick={() => setActiveView('inventory')} 
              className={`px-3.5 py-2 font-extrabold text-sm rounded-xl transition-all flex items-center gap-2 ${
                activeView === 'inventory' 
                  ? 'bg-amber-600 text-white shadow-sm' 
                  : 'text-slate-700 hover:text-amber-800 hover:bg-amber-50/70'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">medication</span>
              <span>{t('Drug Inventory', 'दवा सूची')}</span>
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="h-8 w-[2px] bg-slate-300 rounded-full hidden lg:block mr-1"></div>

            <LanguageSelector />

            <a 
              className="h-10 px-3.5 flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-extrabold rounded-xl hover:bg-rose-100 transition-all shadow-xs" 
              href="tel:108"
            >
              <span className="material-symbols-outlined text-rose-600 text-[18px]">call</span>
              <span>Emergency 108</span>
            </a>

            <button 
              onClick={() => { if (window.confirm('Are you sure you want to logout?')) logout(); }} 
              className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 border border-slate-200 flex items-center justify-center transition-all shadow-xs" 
              title="Logout"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* RE-DESIGNED MAIN CONTENT: Full Width & Zero Overlap */}
      <main className="w-full bg-[#fbfaf7] px-6 lg:px-12 xl:px-16 pt-28 pb-16 animate-fadeIn min-h-[85vh]">
        <div className="flex flex-col w-full pb-8">
          
          {/* Top Header */}
          <div className="w-full flex flex-col md:flex-row md:items-end justify-between gap-4 py-5 border-b border-surface-variant">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span className="text-label-sm text-secondary uppercase tracking-wider font-bold">Mission Directorate MIS • Live Telemetry</span>
              </div>
              <h1 className="font-heading text-4xl font-black text-on-surface tracking-tight">
                {activeView === 'overview' && t('National Health Overview', 'राष्ट्रीय स्वास्थ्य अवलोकन')}
                {activeView === 'teleCenters' && t('Tele-Health Centers Network', 'टेली-हेल्थ केंद्र नेटवर्क')}
                {activeView === 'fieldForce' && t('Field Force (ASHA) Tracking', 'फील्ड फोर्स (आशा) ट्रैकिंग')}
                {activeView === 'inventory' && t('Drug Inventory Management', 'दवा सूची प्रबंधन')}
              </h1>
              <p className="text-body-lg text-on-surface-variant font-medium mt-1">
                {t('Rural Tele-Health Mission — Central Surveillance & District Delivery Framework', 'ग्रामीण टेली-हेल्थ मिशन - केंद्रीय निगरानी और जिला वितरण ढांचा')}
              </p>
            </div>
            
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-200 rounded-xl shadow-xs">
                <span className="material-symbols-outlined text-slate-500 text-[18px]">calendar_today</span>
                <span className="text-xs font-extrabold text-slate-800">{t('Today:', 'आज:')} {new Date().toLocaleDateString(lang === 'en' ? 'en' : 'hi-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <button onClick={() => setActiveModal('districtFilter')} className="h-11 px-4 flex items-center gap-2 bg-white border-2 border-slate-300 rounded-xl text-xs font-extrabold text-slate-800 hover:border-amber-400 hover:bg-slate-50 transition-all shadow-xs" type="button">
                <span className="material-symbols-outlined text-amber-600 text-[18px]">tune</span>
                <span>{t('District Filter', 'जिला फ़िल्टर')}</span>
              </button>
              <button onClick={handleExport} className="h-11 px-6 flex items-center gap-2 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-extrabold rounded-xl shadow-sm transition-all" type="button">
                <span className="material-symbols-outlined text-[18px]">download</span>
                <span>{t('Export MIS', 'MIS निर्यात करें')}</span>
              </button>
            </div>
          </div>

          {/* DYNAMIC VIEWS */}
          {activeView === 'overview' && (
            <div className="animate-fadeIn">
              {/* Network Status Callout */}
              <div className="w-full mt-6 p-6 bg-gradient-to-r from-amber-500/15 via-amber-100/40 to-transparent border-2 border-amber-300 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white border-2 border-amber-300 flex items-center justify-center text-amber-700 shrink-0 shadow-xs">
                    <span className="material-symbols-outlined text-[30px] animate-pulse">hub</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xl font-extrabold text-slate-900 tracking-tight">{t('State Central Node Synchronized', 'राज्य केंद्रीय नोड सिंक्रनाइज़')}</span>
                    <span className="text-sm font-semibold text-slate-600 mt-0.5">{t('142 Primary Health Centers connected. Satellite uplink latency: 34ms.', '142 प्राथमिक स्वास्थ्य केंद्र जुड़े हैं। सैटेलाइट अपलिंक विलंबता: 34ms')}</span>
                  </div>
                </div>
                <span className="text-xs font-black px-3.5 py-1.5 bg-white text-amber-950 rounded-xl border border-amber-300 shadow-xs whitespace-nowrap">NODE UP: 99.98%</span>
              </div>

              {/* KPI Cards */}
              <section className="mt-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: t('Total Patients', 'कुल मरीज़'), value: data?.totalPatients?.toLocaleString() || '12,450', icon: 'groups', iconColor: 'text-primary', iconBg: 'bg-primary-container', trend: <><span className="material-symbols-outlined text-primary text-[18px]">trending_up</span><span className="font-bold text-primary">+8.2%</span><span className="text-on-surface-variant font-medium">vs {t('last week', 'पिछले सप्ताह')}</span></> },
                    { label: t('Tele-Consults', 'टेली-परामर्श'), value: data?.todayConsultations?.toLocaleString() || '3,890', icon: 'video_chat', iconColor: 'text-secondary', iconBg: 'bg-secondary-container', trend: <><span className="material-symbols-outlined text-secondary text-[18px]">schedule</span><span className="text-on-surface-variant font-medium">{t('Avg:', 'औसत:')} <strong className="text-on-surface font-bold">7.4 {t('mins', 'मिनट')}</strong></span></> },
                    { label: t('Active ASHA', 'सक्रिय आशा'), value: '1,120', icon: 'medical_services', iconColor: 'text-tertiary', iconBg: 'bg-tertiary-container', trend: <><span className="material-symbols-outlined text-tertiary text-[18px]">travel_explore</span><span className="text-on-surface-variant font-medium">{t('Coverage:', 'कवरेज:')} <strong className="text-on-surface font-bold">94.6%</strong></span></> },
                    { label: t('Prescriptions', 'पर्चे'), value: '11,840', icon: 'local_pharmacy', iconColor: 'text-primary', iconBg: 'bg-primary-container', trend: <><span className="material-symbols-outlined text-primary text-[18px]">check_circle</span><span className="text-on-surface-variant font-medium">{t('Met:', 'पूरा:')} <strong className="text-on-surface font-bold">98.1%</strong></span></> },
                  ].map((kpi, index) => (
                    <div key={kpi.label} className="bg-surface-container-lowest rounded-2xl p-6 border border-surface-variant shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group">
                      <div className={`absolute top-0 right-0 w-24 h-24 ${kpi.iconBg} opacity-50 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-150`}></div>
                      <div className="flex items-center justify-between relative z-10">
                        <div className={`w-12 h-12 rounded-xl ${kpi.iconBg} flex items-center justify-center ${kpi.iconColor} shadow-sm`}>
                          <span className="material-symbols-outlined text-[28px]">{kpi.icon}</span>
                        </div>
                      </div>
                      <div className="mt-5 relative z-10">
                        <span className="text-xs uppercase font-extrabold tracking-wider text-secondary">{kpi.label}</span>
                        <div className="text-4xl font-black text-on-surface tracking-tight mt-1">{kpi.value}</div>
                        <div className="mt-3 flex items-center gap-1.5 text-sm">{kpi.trend}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Charts Section */}
              <section className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart 1: District Consultations */}
                <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-surface-variant">
                    <div>
                      <h2 className="text-xl font-bold text-on-surface">{t('Weekly Tele-Consultations', 'साप्ताहिक टेली-परामर्श')}</h2>
                      <p className="text-sm text-on-surface-variant mt-1 font-medium">{t('Aggregated cross-referenced by demographic block', 'जनसांख्यिकीय ब्लॉक द्वारा एकत्रित और संदर्भित')}</p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0 bg-surface-container px-3 py-1.5 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded bg-primary-container shadow-sm"></span>
                        <span className="text-xs font-bold text-secondary uppercase">{t('Rural', 'ग्रामीण')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded bg-on-surface shadow-sm"></span>
                        <span className="text-xs font-bold text-secondary uppercase">{t('Semi-Urban', 'अर्ध-शहरी')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-full mt-8">
                    <svg aria-label="District consultation chart" className="w-full h-auto overflow-visible" role="img" viewBox="0 0 540 240">
                      <line stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 4" x1="90" x2="520" y1="20" y2="20" />
                      <line stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 4" x1="90" x2="520" y1="70" y2="70" />
                      <line stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 4" x1="90" x2="520" y1="120" y2="120" />
                      <line stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 4" x1="90" x2="520" y1="170" y2="170" />
                      <line stroke="#94A3B8" strokeWidth="2" x1="90" x2="520" y1="210" y2="210" />
                      <text className="text-[12px] font-bold" fill="#64748B" textAnchor="end" x="80" y="24">1,500</text>
                      <text className="text-[12px] font-bold" fill="#64748B" textAnchor="end" x="80" y="74">1,000</text>
                      <text className="text-[12px] font-bold" fill="#64748B" textAnchor="end" x="80" y="124">500</text>
                      <text className="text-[12px] font-bold" fill="#64748B" textAnchor="end" x="80" y="174">250</text>
                      <text className="text-[12px] font-bold" fill="#64748B" textAnchor="end" x="80" y="214">0</text>
                      
                      <g transform="translate(130, 0)" className="group cursor-pointer">
                        <rect fill="#ffb95f" height="157" rx="4" width="28" x="0" y="53" className="transition-all group-hover:opacity-80" />
                        <rect fill="#1E293B" height="130" rx="4" width="28" x="32" y="80" className="transition-all group-hover:opacity-80" />
                        <text className="text-[11px] font-bold opacity-0 group-hover:opacity-100 transition-opacity" fill="#111c2d" textAnchor="middle" x="30" y="44">1,240</text>
                        <text className="text-[13px] font-bold" fill="#475569" textAnchor="middle" x="30" y="235">{t('Sitapur', 'सीतापुर')}</text>
                      </g>
                      <g transform="translate(230, 0)" className="group cursor-pointer">
                        <rect fill="#ffb95f" height="124" rx="4" width="28" x="0" y="86" className="transition-all group-hover:opacity-80" />
                        <rect fill="#1E293B" height="95" rx="4" width="28" x="32" y="115" className="transition-all group-hover:opacity-80" />
                        <text className="text-[11px] font-bold opacity-0 group-hover:opacity-100 transition-opacity" fill="#111c2d" textAnchor="middle" x="30" y="77">980</text>
                        <text className="text-[13px] font-bold" fill="#475569" textAnchor="middle" x="30" y="235">{t('Hardoi', 'हरदोई')}</text>
                      </g>
                      <g transform="translate(330, 0)" className="group cursor-pointer">
                        <rect fill="#ffb95f" height="109" rx="4" width="28" x="0" y="101" className="transition-all group-hover:opacity-80" />
                        <rect fill="#1E293B" height="80" rx="4" width="28" x="32" y="130" className="transition-all group-hover:opacity-80" />
                        <text className="text-[11px] font-bold opacity-0 group-hover:opacity-100 transition-opacity" fill="#111c2d" textAnchor="middle" x="30" y="92">860</text>
                        <text className="text-[13px] font-bold" fill="#475569" textAnchor="middle" x="30" y="235">{t('Lakhimpur', 'लखीमपुर')}</text>
                      </g>
                      <g transform="translate(430, 0)" className="group cursor-pointer">
                        <rect fill="#ffb95f" height="103" rx="4" width="28" x="0" y="107" className="transition-all group-hover:opacity-80" />
                        <rect fill="#1E293B" height="68" rx="4" width="28" x="32" y="142" className="transition-all group-hover:opacity-80" />
                        <text className="text-[11px] font-bold opacity-0 group-hover:opacity-100 transition-opacity" fill="#111c2d" textAnchor="middle" x="30" y="98">810</text>
                        <text className="text-[13px] font-bold" fill="#475569" textAnchor="middle" x="30" y="235">{t('Barabanki', 'बाराबंकी')}</text>
                      </g>
                    </svg>
                  </div>
                  <div className="mt-8 pt-5 border-t border-surface-variant grid grid-cols-2 sm:grid-cols-4 gap-4 text-center bg-surface-container-low p-4 rounded-xl">
                    {[
                      { label: t('Sitapur Rural', 'सीतापुर ग्रामीण'), value: '710' },
                      { label: t('Hardoi Rural', 'हरदोई ग्रामीण'), value: '540' },
                      { label: t('Lakhimpur Rural', 'लखीमपुर ग्रामीण'), value: '490' },
                      { label: t('Barabanki Rural', 'बाराबंकी ग्रामीण'), value: '460' },
                    ].map(d => (
                      <div key={d.label} className="flex flex-col">
                        <span className="text-xs font-bold text-secondary uppercase tracking-wider">{d.label}</span>
                        <span className="text-xl font-black text-on-surface mt-1">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chart 2: ASHA Field Visits */}
                <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-surface-variant">
                    <div>
                      <h2 className="text-xl font-bold text-on-surface">{t('Immunization Tracking', 'टीकाकरण ट्रैकिंग')}</h2>
                      <p className="text-sm text-on-surface-variant mt-1 font-medium">{t('Quarterly Target vs. Verified Realization', 'त्रैमासिक लक्ष्य बनाम सत्यापित प्राप्ति')}</p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0 bg-surface-container px-3 py-1.5 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded bg-surface-variant border border-secondary shadow-sm"></span>
                        <span className="text-xs font-bold text-secondary uppercase">{t('Target', 'लक्ष्य')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded bg-primary-container shadow-sm"></span>
                        <span className="text-xs font-bold text-secondary uppercase">{t('Achieved', 'प्राप्त')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-full mt-8">
                    <svg aria-label="Target versus Achieved tracking" className="w-full h-auto overflow-visible" role="img" viewBox="0 0 540 240">
                      <line stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 4" x1="90" x2="520" y1="20" y2="20" />
                      <line stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 4" x1="90" x2="520" y1="70" y2="70" />
                      <line stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 4" x1="90" x2="520" y1="120" y2="120" />
                      <line stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 4" x1="90" x2="520" y1="170" y2="170" />
                      <line stroke="#94A3B8" strokeWidth="2" x1="90" x2="520" y1="210" y2="210" />
                      <text className="text-[12px] font-bold" fill="#64748B" textAnchor="end" x="80" y="24">5,000</text>
                      <text className="text-[12px] font-bold" fill="#64748B" textAnchor="end" x="80" y="74">3,750</text>
                      <text className="text-[12px] font-bold" fill="#64748B" textAnchor="end" x="80" y="124">2,500</text>
                      <text className="text-[12px] font-bold" fill="#64748B" textAnchor="end" x="80" y="174">1,250</text>
                      <text className="text-[12px] font-bold" fill="#64748B" textAnchor="end" x="80" y="214">0</text>
                      
                      <g transform="translate(130, 0)" className="group cursor-pointer">
                        <rect fill="#E2E8F0" height="171" rx="4" width="28" x="0" y="39" className="transition-all group-hover:opacity-80" />
                        <rect fill="#ffb95f" height="164" rx="4" width="28" x="32" y="46" className="transition-all group-hover:opacity-80" />
                        <text className="text-[12px] font-extrabold opacity-0 group-hover:opacity-100 transition-opacity" fill="#111c2d" textAnchor="middle" x="30" y="30">96%</text>
                        <text className="text-[13px] font-bold" fill="#475569" textAnchor="middle" x="30" y="235">{t('Pentavalent', 'पेंटावैलेंट')}</text>
                      </g>
                      <g transform="translate(230, 0)" className="group cursor-pointer">
                        <rect fill="#E2E8F0" height="145" rx="4" width="28" x="0" y="65" className="transition-all group-hover:opacity-80" />
                        <rect fill="#ffb95f" height="135" rx="4" width="28" x="32" y="75" className="transition-all group-hover:opacity-80" />
                        <text className="text-[12px] font-extrabold opacity-0 group-hover:opacity-100 transition-opacity" fill="#111c2d" textAnchor="middle" x="30" y="58">93%</text>
                        <text className="text-[13px] font-bold" fill="#475569" textAnchor="middle" x="30" y="235">{t('Antenatal', 'प्रसवपूर्व')}</text>
                      </g>
                      <g transform="translate(330, 0)" className="group cursor-pointer">
                        <rect fill="#E2E8F0" height="160" rx="4" width="28" x="0" y="50" className="transition-all group-hover:opacity-80" />
                        <rect fill="#ffb95f" height="148" rx="4" width="28" x="32" y="62" className="transition-all group-hover:opacity-80" />
                        <text className="text-[12px] font-extrabold opacity-0 group-hover:opacity-100 transition-opacity" fill="#111c2d" textAnchor="middle" x="30" y="42">92%</text>
                        <text className="text-[13px] font-bold" fill="#475569" textAnchor="middle" x="30" y="235">{t('NCD Checks', 'एनसीडी जांच')}</text>
                      </g>
                      <g transform="translate(430, 0)" className="group cursor-pointer">
                        <rect fill="#E2E8F0" height="110" rx="4" width="28" x="0" y="100" className="transition-all group-hover:opacity-80" />
                        <rect fill="#ffb95f" height="107" rx="4" width="28" x="32" y="103" className="transition-all group-hover:opacity-80" />
                        <text className="text-[12px] font-extrabold opacity-0 group-hover:opacity-100 transition-opacity" fill="#111c2d" textAnchor="middle" x="30" y="93">97%</text>
                        <text className="text-[13px] font-bold" fill="#475569" textAnchor="middle" x="30" y="235">{t('Neonatal', 'नवजात')}</text>
                      </g>
                    </svg>
                  </div>
                  <div className="mt-8 pt-5 border-t border-surface-variant grid grid-cols-2 sm:grid-cols-4 gap-4 text-center bg-surface-container-low p-4 rounded-xl">
                    {[
                      { label: t('Target Met', 'लक्ष्य प्राप्त'), value: '14,560', color: 'text-primary' },
                      { label: t('Pending Visits', 'लंबित यात्राएं'), value: '840', color: 'text-tertiary' },
                      { label: t('High-Risk', 'उच्च जोखिम'), value: '38', color: 'text-error' },
                      { label: t('Verified Sync', 'सत्यापित सिंक'), value: '100%', color: 'text-secondary' },
                    ].map(s => (
                      <div key={s.label} className="flex flex-col">
                        <span className="text-xs font-bold text-secondary uppercase tracking-wider">{s.label}</span>
                        <span className={`text-xl font-black mt-1 ${s.color}`}>{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Priority System Alerts */}
              {alerts.length > 0 && (
                <section className="mt-10">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-surface-variant mb-6 gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-error-container rounded-xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-on-error-container text-[26px]">crisis_alert</span>
                      </div>
                      <h2 className="text-2xl font-bold text-on-surface">{t('Action Needed (Priority System Alerts)', 'कार्रवाई आवश्यक (प्राथमिकता प्रणाली अलर्ट)')}</h2>
                    </div>
                    <span className="text-sm text-on-error-container bg-error-container px-3 py-1.5 rounded-lg font-extrabold uppercase tracking-wide border border-error shadow-sm">{alerts.length} {t('Issues', 'समस्याएं')}</span>
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    {alerts.map((alert, i) => (
                      <div key={alert.id} className="bg-surface-container-lowest border border-surface-variant hover:border-surface-variant/80 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm hover:shadow-md transition-all transform hover:-translate-y-1">
                        <div className="flex items-start gap-5">
                          <div className={`w-14 h-14 rounded-2xl bg-${alert.bg} flex items-center justify-center shrink-0 shadow-sm`}>
                            <span className={`material-symbols-outlined text-${alert.color} text-[30px]`}>{alert.icon}</span>
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className={`text-xs uppercase font-extrabold tracking-wider text-${alert.color} bg-${alert.bg} px-2 py-0.5 rounded`}>{alert.category}</span>
                              <span className="text-secondary opacity-50">•</span>
                              <span className="text-sm font-bold text-secondary">{alert.source}</span>
                            </div>
                            <p className="text-xl font-bold text-on-surface leading-tight mt-1">{alert.title}</p>
                            <span className="text-sm font-medium text-on-surface-variant mt-1.5">{alert.detail}</span>
                          </div>
                        </div>
                        <div className="shrink-0 w-full md:w-auto mt-2 md:mt-0">
                          <button onClick={() => handleAlertAction(alert)} className="w-full md:w-auto h-12 px-6 bg-surface-container border border-surface-variant rounded-xl text-on-surface font-bold text-sm hover:bg-inverse-surface hover:text-inverse-on-surface transition-all flex items-center justify-center gap-2 shadow-sm" type="button">
                            <span>{alert.action}</span>
                            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Command Center Dock */}
              <section className="mt-10 relative overflow-hidden rounded-3xl bg-inverse-surface p-8 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex items-center gap-5 relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-surface-container border border-surface-variant flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-primary text-[32px]">admin_panel_settings</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-inverse-on-surface tracking-tight">{t('District Tele-Medicine Command Center', 'जिला टेली-मेडिसिन कमांड सेंटर')}</h3>
                    <p className="text-surface-container font-medium mt-1.5 max-w-lg">{t('Manage doctor roster rotations, emergency van dispatch, and rural drug distribution trucks.', 'डॉक्टर रोस्टर रोटेशन, आपातकालीन वैन प्रेषण और ग्रामीण दवा वितरण ट्रकों का प्रबंधन करें।')}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto relative z-10">
                  <button onClick={() => setActiveModal('shiftRoster')} className="flex-1 lg:flex-none h-12 px-6 bg-surface-container text-on-surface rounded-xl font-bold hover:bg-surface-variant transition-colors shadow-sm" type="button">
                    {t('Doctor Shift Roster', 'डॉक्टर शिफ्ट रोस्टर')}
                  </button>
                  <button onClick={() => setActiveModal('issueDirective')} className="flex-1 lg:flex-none h-12 px-6 bg-primary-container text-on-primary-container rounded-xl font-extrabold hover:bg-[#ffb95f] transition-all shadow-sm" type="button">
                    {t('Issue State Directives', 'राज्य निर्देश जारी करें')}
                  </button>
                </div>
              </section>
            </div>
          )}

          {activeView === 'teleCenters' && (
            <div className="animate-fadeIn mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-secondary text-[32px]">domain</span>
                        <div>
                          <h3 className="font-bold text-on-surface text-lg">PHC Block {String.fromCharCode(64 + i)}</h3>
                          <p className="text-sm text-on-surface-variant">Rural Outpost</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-bold rounded-lg ${i === 3 ? 'bg-error-container text-on-error-container' : 'bg-primary-container text-on-primary-container'}`}>
                        {i === 3 ? t('Offline', 'ऑफ़लाइन') : t('Online', 'ऑनलाइन')}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-on-surface-variant">{t('Current Queue', 'वर्तमान कतार')}</span>
                        <span className="font-bold text-on-surface">{i * 3 + 2} {t('Patients', 'मरीज़')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-on-surface-variant">{t('Assigned Doctor', 'नियुक्त डॉक्टर')}</span>
                        <span className="font-bold text-on-surface">Dr. Sharma</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-on-surface-variant">{t('Last Sync', 'अंतिम सिंक')}</span>
                        <span className="font-bold text-on-surface">2 mins ago</span>
                      </div>
                    </div>
                    <button className="w-full mt-5 py-2.5 bg-surface-container text-on-surface font-bold rounded-xl border border-surface-variant hover:bg-surface-variant transition-colors">
                      {t('View Telemetry', 'टेलीमेट्री देखें')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeView === 'fieldForce' && (
            <div className="animate-fadeIn mt-6">
               <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-surface-container">
                    <tr>
                      <th className="p-5 font-bold text-secondary text-sm uppercase">{t('ASHA Worker', 'आशा कार्यकर्ता')}</th>
                      <th className="p-5 font-bold text-secondary text-sm uppercase">{t('Assigned Zone', 'नियुक्त क्षेत्र')}</th>
                      <th className="p-5 font-bold text-secondary text-sm uppercase">{t('Today\'s Visits', 'आज की यात्राएं')}</th>
                      <th className="p-5 font-bold text-secondary text-sm uppercase">{t('High Risk Flags', 'उच्च जोखिम फ्लैग')}</th>
                      <th className="p-5 font-bold text-secondary text-sm uppercase">{t('Last Update', 'अंतिम अपडेट')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-variant">
                    {['Sunita Devi', 'Kamla Verma', 'Rekha Singh', 'Pooja Tiwari', 'Anjali Gupta'].map((name, i) => (
                      <tr key={name} className="hover:bg-surface-container-lowest transition-colors">
                        <td className="p-5 font-bold text-on-surface flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold">{name[0]}</div>
                          {name}
                        </td>
                        <td className="p-5 font-medium text-on-surface-variant">Sector {i + 1} Rural</td>
                        <td className="p-5 font-bold text-on-surface">{10 + i * 2} / 25</td>
                        <td className="p-5 font-bold">
                          {i % 2 === 0 ? <span className="text-error">{i + 1} Flagged</span> : <span className="text-primary">None</span>}
                        </td>
                        <td className="p-5 font-medium text-on-surface-variant">10:45 AM</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeView === 'inventory' && (
            <div className="animate-fadeIn mt-6">
              <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-surface-container">
                    <tr>
                      <th className="p-5 font-bold text-secondary text-sm uppercase">{t('Medicine Name', 'दवा का नाम')}</th>
                      <th className="p-5 font-bold text-secondary text-sm uppercase">{t('Stock Level', 'स्टॉक स्तर')}</th>
                      <th className="p-5 font-bold text-secondary text-sm uppercase">{t('Threshold', 'सीमा')}</th>
                      <th className="p-5 font-bold text-secondary text-sm uppercase">{t('Status', 'स्थिति')}</th>
                      <th className="p-5 font-bold text-secondary text-sm uppercase">{t('Action', 'कार्रवाई')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-variant">
                    {[
                      { name: 'Paracetamol 500mg', stock: 1200, thresh: 5000, status: 'Critical', color: 'error' },
                      { name: 'Amoxicillin 250mg', stock: 8500, thresh: 4000, status: 'Healthy', color: 'primary' },
                      { name: 'ORS Packets', stock: 450, thresh: 1000, status: 'Low', color: 'tertiary' },
                      { name: 'Ibuprofen 400mg', stock: 12000, thresh: 5000, status: 'Healthy', color: 'primary' },
                    ].map((drug, i) => (
                      <tr key={i} className="hover:bg-surface-container-lowest transition-colors">
                        <td className="p-5 font-bold text-on-surface">{drug.name}</td>
                        <td className="p-5 font-black text-on-surface">{drug.stock.toLocaleString()}</td>
                        <td className="p-5 font-medium text-on-surface-variant">{drug.thresh.toLocaleString()}</td>
                        <td className="p-5">
                          <span className={`px-2 py-1 text-xs font-bold rounded-lg bg-${drug.color}-container text-on-${drug.color}-container`}>
                            {t(drug.status, drug.status)}
                          </span>
                        </td>
                        <td className="p-5">
                          <button onClick={() => showToast(`Requisition sent for ${drug.name}`)} className="px-4 py-2 bg-surface-container border border-surface-variant rounded-xl font-bold text-xs hover:bg-surface-variant transition-colors">
                            {t('Auto Requisition', 'स्वतः मांग')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* FOOTER: Exact same as Patient, ASHA, and Doctor Panels */}
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
      
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fadeIn font-bold">
          <span className="material-symbols-outlined text-primary-container">check_circle</span>
          <span>{toast}</span>
        </div>
      )}

      {/* MODAL: EXPORT PROGRESS */}
      {activeModal === 'exportProgress' && (
        <div className="fixed inset-0 z-50 bg-scrim/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-surface-container-lowest rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden p-8 text-center">
            <div className="mb-6 flex justify-center">
              <span className="material-symbols-outlined text-primary text-[48px] animate-bounce">cloud_download</span>
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-2">{t('Exporting Telemetry Data', 'टेलीमेट्री डेटा निर्यात कर रहा है')}</h3>
            <p className="text-on-surface-variant font-medium mb-6">{t('Compiling logs and generating JSON...', 'लॉग संकलित कर रहा है...')}</p>
            <div className="w-full bg-surface-variant rounded-full h-3 mb-2 overflow-hidden">
              <div className="bg-primary h-3 rounded-full transition-all duration-300" style={{ width: `${exportProgress}%` }}></div>
            </div>
            <span className="text-sm font-bold text-primary">{exportProgress}%</span>
          </div>
        </div>
      )}

      {/* MODAL: DISTRICT FILTER */}
      {activeModal === 'districtFilter' && (
        <div className="fixed inset-0 z-50 bg-scrim/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-surface-container-lowest rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-surface-variant flex items-center justify-between bg-surface-container">
              <h3 className="text-xl font-bold text-on-surface flex items-center gap-2"><span className="material-symbols-outlined text-secondary">tune</span> {t('Filter Districts', 'जिले फ़िल्टर करें')}</h3>
              <button onClick={() => setActiveModal(null)} className="material-symbols-outlined text-secondary hover:text-on-surface">close</button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-3">
              {['Sitapur', 'Hardoi', 'Lakhimpur', 'Barabanki', 'Unnao', 'Ayodhya'].map(district => (
                <label key={district} className="flex items-center justify-between p-3 border border-surface-variant rounded-xl cursor-pointer hover:bg-surface-container transition-colors">
                  <span className="font-bold text-on-surface">{district}</span>
                  <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary rounded cursor-pointer" />
                </label>
              ))}
            </div>
            <div className="p-6 border-t border-surface-variant flex justify-end gap-3 bg-surface-container-lowest">
              <button onClick={() => setActiveModal(null)} className="px-5 py-2.5 text-secondary font-bold hover:bg-surface-container rounded-xl transition-colors">{t('Cancel', 'रद्द करें')}</button>
              <button onClick={applyDistrictFilter} className="px-5 py-2.5 bg-primary text-on-primary font-bold rounded-xl hover:shadow-lg transition-all">{t('Apply Filters', 'लागू करें')}</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SHIFT ROSTER */}
      {activeModal === 'shiftRoster' && (
        <div className="fixed inset-0 z-50 bg-scrim/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-surface-container-lowest rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-surface-variant flex items-center justify-between bg-surface-container">
              <h3 className="text-2xl font-bold text-on-surface flex items-center gap-2"><span className="material-symbols-outlined text-primary">group</span> {t('Doctor Shift Roster', 'डॉक्टर शिफ्ट रोस्टर')}</h3>
              <button onClick={() => setActiveModal(null)} className="material-symbols-outlined text-secondary hover:text-on-surface">close</button>
            </div>
            <div className="overflow-x-auto overflow-y-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-low sticky top-0">
                  <tr>
                    <th className="p-4 font-bold text-secondary text-sm uppercase">Doctor Name</th>
                    <th className="p-4 font-bold text-secondary text-sm uppercase">Specialization</th>
                    <th className="p-4 font-bold text-secondary text-sm uppercase">Current Assignment</th>
                    <th className="p-4 font-bold text-secondary text-sm uppercase">Shift Timing</th>
                    <th className="p-4 font-bold text-secondary text-sm uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-variant">
                  {[
                    { name: 'Dr. Rakesh Sharma', spec: 'General Physician', loc: 'PHC Rampur', time: '08:00 AM - 04:00 PM' },
                    { name: 'Dr. Sunita Verma', spec: 'Gynecologist', loc: 'District Hospital Sitapur', time: '10:00 AM - 06:00 PM' },
                    { name: 'Dr. Amit Patel', spec: 'Pediatrician', loc: 'On Leave', time: '-' },
                  ].map((doc, i) => (
                    <tr key={i} className="hover:bg-surface-container-lowest transition-colors">
                      <td className="p-4 font-bold text-on-surface">{doc.name}</td>
                      <td className="p-4 font-medium text-on-surface-variant">{doc.spec}</td>
                      <td className="p-4 font-medium text-on-surface">{doc.loc}</td>
                      <td className="p-4 font-medium text-on-surface-variant">{doc.time}</td>
                      <td className="p-4">
                        <button className="px-3 py-1.5 bg-surface-container border border-surface-variant text-on-surface font-bold text-xs rounded-lg hover:bg-surface-variant transition-colors">{t('Reassign', 'बदलें')}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-6 border-t border-surface-variant flex justify-end gap-3 bg-surface-container">
              <button onClick={() => setActiveModal(null)} className="px-5 py-2.5 text-secondary font-bold hover:bg-surface-variant rounded-xl transition-colors">{t('Close', 'बंद करें')}</button>
              <button onClick={saveRoster} className="px-5 py-2.5 bg-primary text-on-primary font-bold rounded-xl hover:shadow-lg transition-all">{t('Save Changes', 'सहेजें')}</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ISSUE DIRECTIVE */}
      {activeModal === 'issueDirective' && (
        <div className="fixed inset-0 z-50 bg-scrim/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-surface-container-lowest rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-6 border-b border-surface-variant bg-surface-container">
              <h3 className="text-2xl font-bold text-on-surface flex items-center gap-2"><span className="material-symbols-outlined text-primary">campaign</span> {t('Issue State Directive', 'राज्य निर्देश जारी करें')}</h3>
              <p className="text-on-surface-variant mt-1 font-medium">{t('Broadcast an emergency directive.', 'आपातकालीन निर्देश प्रसारित करें।')}</p>
            </div>
            <form onSubmit={submitDirective} className="p-6 flex flex-col gap-5">
              <div>
                <label className="block text-sm font-bold text-secondary mb-2 uppercase">{t('Directive Title', 'निर्देश शीर्षक')}</label>
                <input type="text" required placeholder={t("e.g. Mandatory Malaria Screening", "उदा. अनिवार्य मलेरिया स्क्रीनिंग")} className="w-full bg-surface-container border border-surface-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-bold" />
              </div>
              <div>
                <label className="block text-sm font-bold text-secondary mb-2 uppercase">{t('Priority Level', 'प्राथमिकता स्तर')}</label>
                <select className="w-full bg-surface-container border border-surface-variant rounded-xl px-4 py-3 text-on-surface font-bold focus:outline-none focus:border-primary cursor-pointer">
                  <option value="high">{t('High - Immediate Action', 'उच्च - तत्काल कार्रवाई')}</option>
                  <option value="medium">{t('Medium - Action within 24 Hrs', 'मध्यम - 24 घंटे में कार्रवाई')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-secondary mb-2 uppercase">{t('Message Content', 'संदेश सामग्री')}</label>
                <textarea required rows="4" placeholder={t("Detail the instructions here...", "निर्देशों का विवरण यहां दें...")} className="w-full bg-surface-container border border-surface-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"></textarea>
              </div>
              <div className="flex justify-end gap-3 mt-2">
                <button type="button" onClick={() => setActiveModal(null)} className="px-6 py-3 text-secondary font-bold hover:bg-surface-container rounded-xl transition-colors">{t('Cancel', 'रद्द करें')}</button>
                <button type="submit" className="px-6 py-3 bg-primary text-on-primary font-bold rounded-xl hover:shadow-lg flex items-center gap-2 transition-all">
                  <span className="material-symbols-outlined">send</span> {t('Broadcast Now', 'अभी प्रसारित करें')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ALERT CONFIRMATION */}
      {activeModal === 'alertConfirm' && (
        <div className="fixed inset-0 z-50 bg-scrim/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-surface-container-lowest rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-8">
              <h3 className="text-2xl font-bold text-on-surface mb-3">{modalContent.title}</h3>
              <p className="text-on-surface-variant mb-8 font-medium whitespace-pre-line text-lg">{modalContent.body}</p>
              <div className="flex items-center justify-end gap-4">
                <button onClick={() => setActiveModal(null)} className="px-6 py-3 text-secondary font-bold hover:bg-surface-container rounded-xl transition-colors">
                  {t('Cancel', 'रद्द करें')}
                </button>
                <button onClick={modalContent.onConfirm} className="px-6 py-3 bg-primary text-on-primary font-bold rounded-xl hover:shadow-lg transition-all">
                  {t('Confirm Action', 'कार्रवाई की पुष्टि करें')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
