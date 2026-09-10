import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

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
          a.download = `aarogyanet-report.json`;
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
    <div className="bg-surface-container-lowest text-on-surface font-sans min-h-screen selection:bg-amber-100">
      {/* ORIGINAL HEADER */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-surface-container-lowest border-b border-surface-variant">
        <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            {/* LOGO COLOR RESTORED */}
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary-container text-[20px]">health_and_safety</span>
            </div>
            <span className="text-headline-md font-bold text-on-surface tracking-tight leading-tight">AarogyaNet</span>
          </div>
          <nav className="hidden lg:flex items-center gap-2">
            <button onClick={() => setActiveView('overview')} className={`px-3 py-1.5 inline-flex items-center gap-1.5 transition-colors rounded-lg ${activeView === 'overview' ? 'bg-surface-container text-on-surface font-bold text-body-md' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'}`}>
              <span className="material-symbols-outlined text-[20px]">dashboard</span>
              <span>{t('National Overview', 'राष्ट्रीय अवलोकन')}</span>
            </button>
            <button onClick={() => setActiveView('teleCenters')} className={`px-3 py-1.5 inline-flex items-center gap-1.5 transition-colors rounded-lg ${activeView === 'teleCenters' ? 'bg-surface-container text-on-surface font-bold text-body-md' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'}`}>
              <span className="material-symbols-outlined text-[20px]">domain</span>
              <span>{t('Tele-Health Centers', 'टेली-हेल्थ केंद्र')}</span>
            </button>
            <button onClick={() => setActiveView('fieldForce')} className={`px-3 py-1.5 inline-flex items-center gap-1.5 transition-colors rounded-lg ${activeView === 'fieldForce' ? 'bg-surface-container text-on-surface font-bold text-body-md' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'}`}>
              <span className="material-symbols-outlined text-[20px]">diversity_1</span>
              <span>{t('Field Force (ASHA)', 'फील्ड फोर्स (आशा)')}</span>
            </button>
            <button onClick={() => setActiveView('inventory')} className={`px-3 py-1.5 inline-flex items-center gap-1.5 transition-colors rounded-lg ${activeView === 'inventory' ? 'bg-surface-container text-on-surface font-bold text-body-md' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'}`}>
              <span className="material-symbols-outlined text-[20px]">medication</span>
              <span>{t('Drug Inventory', 'दवा सूची')}</span>
            </button>
          </nav>
          <div className="flex items-center gap-3 shrink-0">
            <button onClick={toggleLang} className="h-10 px-3 flex items-center gap-2 bg-surface-container-lowest border border-surface-variant rounded-lg text-on-surface text-label-md hover:bg-surface-container transition-colors" type="button">
              <span className="material-symbols-outlined text-secondary text-[20px]">translate</span>
              <span className="hidden sm:inline">Lang: {lang === 'en' ? 'English' : 'हिंदी'}</span>
            </button>
            <a className="h-10 px-4 flex items-center gap-2 bg-secondary text-on-secondary text-label-lg font-bold rounded-lg hover:bg-secondary-container hover:text-on-secondary-container transition-colors shadow-sm" href="tel:108">
              <span className="material-symbols-outlined text-[20px]">call</span>
              <span>{t('Emergency 108', 'आपातकालीन 108')}</span>
            </a>
            {/* LOGOUT BUTTON SHADE UPDATED */}
            <button onClick={logout} className="w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-600 flex items-center justify-center text-white shrink-0 shadow-sm transition-colors" title="Logout">
              <span className="material-symbols-outlined text-[20px]">person</span>
            </button>
          </div>
        </div>
      </header>

      {/* RE-DESIGNED MAIN CONTENT */}
      <main className="w-full bg-surface-container-lowest max-w-7xl mx-auto px-4 lg:px-8 pt-20 animate-fadeIn min-h-[85vh]">
        <div className="flex flex-col w-full pb-8">
          
          {/* Top Header */}
          <div className="w-full flex flex-col md:flex-row md:items-end justify-between gap-4 py-5 border-b border-surface-variant">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span className="text-label-sm text-secondary uppercase tracking-wider font-bold">Mission Directorate MIS • Live Telemetry</span>
              </div>
              <h1 className="text-4xl font-extrabold text-on-surface tracking-tight">
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
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-surface-container rounded-xl shadow-sm border border-surface-variant">
                <span className="material-symbols-outlined text-secondary text-[20px]">calendar_today</span>
                <span className="text-label-md font-medium text-on-surface">{t('Today:', 'आज:')} {new Date().toLocaleDateString(lang === 'en' ? 'en' : 'hi-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <button onClick={() => setActiveModal('districtFilter')} className="h-11 px-4 flex items-center gap-2 bg-surface-container-lowest border border-surface-variant rounded-xl text-label-md font-bold text-on-surface hover:bg-surface-container hover:shadow-sm transition-all transform hover:-translate-y-0.5" type="button">
                <span className="material-symbols-outlined text-secondary text-[20px]">tune</span>
                <span>{t('District Filter', 'जिला फ़िल्टर')}</span>
              </button>
              {/* EXPORT MIS SHADE UPDATED */}
              <button onClick={handleExport} className="h-11 px-6 flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-label-lg font-bold rounded-xl hover:shadow-lg transition-all transform hover:-translate-y-0.5" type="button">
                <span className="material-symbols-outlined text-[20px]">file_download</span>
                <span>{t('Export MIS', 'MIS निर्यात करें')}</span>
              </button>
            </div>
          </div>

          {/* DYNAMIC VIEWS */}
          {activeView === 'overview' && (
            <div className="animate-fadeIn">
              {/* Network Status Callout */}
              <div className="w-full mt-6 p-5 bg-amber-50 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm border border-amber-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-amber-500 shrink-0 shadow-sm">
                    <span className="material-symbols-outlined text-[28px] animate-pulse">hub</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg text-amber-900 font-bold tracking-tight">{t('State Central Node Synchronized', 'राज्य केंद्रीय नोड सिंक्रनाइज़')}</span>
                    <span className="text-sm text-amber-800 font-medium mt-0.5">{t('142 Primary Health Centers connected. Satellite uplink latency: 34ms.', '142 प्राथमिक स्वास्थ्य केंद्र जुड़े हैं। सैटेलाइट अपलिंक विलंबता: 34ms')}</span>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1.5 bg-white text-amber-600 rounded-lg shadow-sm whitespace-nowrap">NODE UP: 99.98%</span>
              </div>

              {/* KPI Cards */}
              <section className="mt-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: t('Total Patients', 'कुल मरीज़'), value: data?.totalPatients?.toLocaleString() || '12,450', icon: 'groups', iconColor: 'text-amber-500', iconBg: 'bg-amber-100', trend: <><span className="material-symbols-outlined text-amber-500 text-[18px]">trending_up</span><span className="font-bold text-amber-500">+8.2%</span><span className="text-on-surface-variant font-medium">vs {t('last week', 'पिछले सप्ताह')}</span></> },
                    { label: t('Tele-Consults', 'टेली-परामर्श'), value: data?.todayConsultations?.toLocaleString() || '3,890', icon: 'video_chat', iconColor: 'text-secondary', iconBg: 'bg-secondary-container', trend: <><span className="material-symbols-outlined text-secondary text-[18px]">schedule</span><span className="text-on-surface-variant font-medium">{t('Avg:', 'औसत:')} <strong className="text-on-surface font-bold">7.4 {t('mins', 'मिनट')}</strong></span></> },
                    { label: t('Active ASHA', 'सक्रिय आशा'), value: '1,120', icon: 'medical_services', iconColor: 'text-tertiary', iconBg: 'bg-tertiary-container', trend: <><span className="material-symbols-outlined text-tertiary text-[18px]">travel_explore</span><span className="text-on-surface-variant font-medium">{t('Coverage:', 'कवरेज:')} <strong className="text-on-surface font-bold">94.6%</strong></span></> },
                    { label: t('Prescriptions', 'पर्चे'), value: '11,840', icon: 'local_pharmacy', iconColor: 'text-amber-500', iconBg: 'bg-amber-100', trend: <><span className="material-symbols-outlined text-amber-500 text-[18px]">check_circle</span><span className="text-on-surface-variant font-medium">{t('Met:', 'पूरा:')} <strong className="text-on-surface font-bold">98.1%</strong></span></> },
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
                    <span className="material-symbols-outlined text-amber-500 text-[32px]">admin_panel_settings</span>
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
                  {/* DIRECTIVE BUTTON SHADE UPDATED */}
                  <button onClick={() => setActiveModal('issueDirective')} className="flex-1 lg:flex-none h-12 px-6 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-extrabold hover:shadow-lg transition-all transform hover:-translate-y-0.5" type="button">
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
                      <span className={`px-2 py-1 text-xs font-bold rounded-lg ${i === 3 ? 'bg-error-container text-on-error-container' : 'bg-amber-100 text-amber-800'}`}>
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
                          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold">{name[0]}</div>
                          {name}
                        </td>
                        <td className="p-5 font-medium text-on-surface-variant">Sector {i + 1} Rural</td>
                        <td className="p-5 font-bold text-on-surface">{10 + i * 2} / 25</td>
                        <td className="p-5 font-bold">
                          {i % 2 === 0 ? <span className="text-error">{i + 1} Flagged</span> : <span className="text-amber-600">None</span>}
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
                      { name: 'Amoxicillin 250mg', stock: 8500, thresh: 4000, status: 'Healthy', color: 'amber' },
                      { name: 'ORS Packets', stock: 450, thresh: 1000, status: 'Low', color: 'tertiary' },
                      { name: 'Ibuprofen 400mg', stock: 12000, thresh: 5000, status: 'Healthy', color: 'amber' },
                    ].map((drug, i) => (
                      <tr key={i} className="hover:bg-surface-container-lowest transition-colors">
                        <td className="p-5 font-bold text-on-surface">{drug.name}</td>
                        <td className="p-5 font-black text-on-surface">{drug.stock.toLocaleString()}</td>
                        <td className="p-5 font-medium text-on-surface-variant">{drug.thresh.toLocaleString()}</td>
                        <td className="p-5">
                          <span className={`px-2 py-1 text-xs font-bold rounded-lg bg-${drug.color}-100 text-${drug.color}-800`}>
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

      {/* ORIGINAL FOOTER */}
      <footer className="w-full bg-surface border-t border-surface-variant mt-8">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="md:col-span-2 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500 text-[28px]">verified</span>
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
      
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fadeIn font-bold">
          <span className="material-symbols-outlined text-amber-400">check_circle</span>
          <span>{toast}</span>
        </div>
      )}

      {/* MODAL: EXPORT PROGRESS */}
      {activeModal === 'exportProgress' && (
        <div className="fixed inset-0 z-50 bg-scrim/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-surface-container-lowest rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden p-8 text-center">
            <div className="mb-6 flex justify-center">
              <span className="material-symbols-outlined text-amber-500 text-[48px] animate-bounce">cloud_download</span>
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-2">{t('Exporting Telemetry Data', 'टेलीमेट्री डेटा निर्यात कर रहा है')}</h3>
            <p className="text-on-surface-variant font-medium mb-6">{t('Compiling logs and generating JSON...', 'लॉग संकलित कर रहा है...')}</p>
            <div className="w-full bg-surface-variant rounded-full h-3 mb-2 overflow-hidden">
              <div className="bg-amber-500 h-3 rounded-full transition-all duration-300" style={{ width: `${exportProgress}%` }}></div>
            </div>
            <span className="text-sm font-bold text-amber-600">{exportProgress}%</span>
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
                  <input type="checkbox" defaultChecked className="w-5 h-5 accent-amber-500 rounded cursor-pointer" />
                </label>
              ))}
            </div>
            <div className="p-6 border-t border-surface-variant flex justify-end gap-3 bg-surface-container-lowest">
              <button onClick={() => setActiveModal(null)} className="px-5 py-2.5 text-secondary font-bold hover:bg-surface-container rounded-xl transition-colors">{t('Cancel', 'रद्द करें')}</button>
              {/* FILTER SHADE UPDATED */}
              <button onClick={applyDistrictFilter} className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl hover:shadow-lg transition-all">{t('Apply Filters', 'लागू करें')}</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SHIFT ROSTER */}
      {activeModal === 'shiftRoster' && (
        <div className="fixed inset-0 z-50 bg-scrim/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-surface-container-lowest rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-surface-variant flex items-center justify-between bg-surface-container">
              <h3 className="text-2xl font-bold text-on-surface flex items-center gap-2"><span className="material-symbols-outlined text-amber-500">group</span> {t('Doctor Shift Roster', 'डॉक्टर शिफ्ट रोस्टर')}</h3>
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
              <button onClick={saveRoster} className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl hover:shadow-lg transition-all">{t('Save Changes', 'सहेजें')}</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ISSUE DIRECTIVE */}
      {activeModal === 'issueDirective' && (
        <div className="fixed inset-0 z-50 bg-scrim/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-surface-container-lowest rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-6 border-b border-surface-variant bg-surface-container">
              <h3 className="text-2xl font-bold text-on-surface flex items-center gap-2"><span className="material-symbols-outlined text-amber-500">campaign</span> {t('Issue State Directive', 'राज्य निर्देश जारी करें')}</h3>
              <p className="text-on-surface-variant mt-1 font-medium">{t('Broadcast an emergency directive.', 'आपातकालीन निर्देश प्रसारित करें।')}</p>
            </div>
            <form onSubmit={submitDirective} className="p-6 flex flex-col gap-5">
              <div>
                <label className="block text-sm font-bold text-secondary mb-2 uppercase">{t('Directive Title', 'निर्देश शीर्षक')}</label>
                <input type="text" required placeholder={t("e.g. Mandatory Malaria Screening", "उदा. अनिवार्य मलेरिया स्क्रीनिंग")} className="w-full bg-surface-container border border-surface-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-bold" />
              </div>
              <div>
                <label className="block text-sm font-bold text-secondary mb-2 uppercase">{t('Priority Level', 'प्राथमिकता स्तर')}</label>
                <select className="w-full bg-surface-container border border-surface-variant rounded-xl px-4 py-3 text-on-surface font-bold focus:outline-none focus:border-amber-500 cursor-pointer">
                  <option value="high">{t('High - Immediate Action', 'उच्च - तत्काल कार्रवाई')}</option>
                  <option value="medium">{t('Medium - Action within 24 Hrs', 'मध्यम - 24 घंटे में कार्रवाई')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-secondary mb-2 uppercase">{t('Message Content', 'संदेश सामग्री')}</label>
                <textarea required rows="4" placeholder={t("Detail the instructions here...", "निर्देशों का विवरण यहां दें...")} className="w-full bg-surface-container border border-surface-variant rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all resize-none"></textarea>
              </div>
              <div className="flex justify-end gap-3 mt-2">
                <button type="button" onClick={() => setActiveModal(null)} className="px-6 py-3 text-secondary font-bold hover:bg-surface-container rounded-xl transition-colors">{t('Cancel', 'रद्द करें')}</button>
                <button type="submit" className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl hover:shadow-lg flex items-center gap-2 transition-all">
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
                <button onClick={modalContent.onConfirm} className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl hover:shadow-lg transition-all">
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
