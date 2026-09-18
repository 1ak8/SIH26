import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import LanguageSelector from '../../components/LanguageSelector';

const INITIAL_ALERTS = [
  {
    id: 1,
    icon: 'inventory_2',
    category: 'Dispensary Stock Critical',
    source: 'CHC Sitapur Central',
    title: 'Jan Aushadhi buffer stock low at CHC Sitapur Central (ORS & Paracetamol below 20%)',
    detail: 'Depletion alert triggered from Ward 4 dispensary. Requisition ticket #REQ-88902 generated.',
    action: 'Restock Medicines',
    urgency: 'high',
  },
  {
    id: 2,
    icon: 'pregnant_woman',
    category: 'Clinical Escalation',
    source: 'Rampur Sub-Centre Kiosk',
    title: 'High-risk trimester 3 pregnancy with gestational hypertension (Kamla Devi)',
    detail: 'Field ASHA Sunita Devi detected BP 138/88 mmHg. Tele-specialist consultation recommended.',
    action: 'Review Case Dossier',
    urgency: 'high',
  },
  {
    id: 3,
    icon: 'coronavirus',
    category: 'Epidemic Surveillance',
    source: 'Sitapur Ward 4 Health Post',
    title: 'Vector-Borne Surveillance: 4 localized fever clusters detected in Sector 2',
    detail: 'Health Worker initiated rapid diagnostic Dengue NS1 & Malarial antigen screening drive.',
    action: 'View Survey Route',
    urgency: 'medium',
  },
];

const DEFAULT_INVENTORY = [
  { id: 'MED-01', name: 'Paracetamol 650mg (Tab)', facility: 'CHC Sitapur Central', quantity: 1420, threshold: 2500, unit: 'Tablets', status: 'low_stock', jasCode: 'JAS-0012' },
  { id: 'MED-02', name: 'Amoxicillin 500mg (Cap)', facility: 'District Hospital Sitapur', quantity: 8600, threshold: 5000, unit: 'Capsules', status: 'in_stock', jasCode: 'JAS-0044' },
  { id: 'MED-03', name: 'ORS Electrolyte (21.8g Sachet)', facility: 'Rampur Sub-Centre', quantity: 480, threshold: 1500, unit: 'Sachets', status: 'low_stock', jasCode: 'JAS-0078' },
  { id: 'MED-04', name: 'Iron Folic Acid (IFA 100mg)', facility: 'Sitapur Ward 4 Health Post', quantity: 12400, threshold: 6000, unit: 'Tablets', status: 'in_stock', jasCode: 'JAS-0105' },
  { id: 'MED-05', name: 'Metformin 500mg (Tab)', facility: 'CHC Sitapur Central', quantity: 6200, threshold: 4000, unit: 'Tablets', status: 'in_stock', jasCode: 'JAS-0210' },
  { id: 'MED-06', name: 'Amlodipine 5mg (Tab)', facility: 'District Hospital Sitapur', quantity: 5100, threshold: 3500, unit: 'Tablets', status: 'in_stock', jasCode: 'JAS-0188' },
  { id: 'MED-07', name: 'Cetirizine 10mg (Tab)', facility: 'State Medical College Tele-Hub', quantity: 7300, threshold: 4000, unit: 'Tablets', status: 'in_stock', jasCode: 'JAS-0089' },
  { id: 'MED-08', name: 'Azithromycin 500mg (Tab)', facility: 'CHC Sitapur Central', quantity: 3800, threshold: 2000, unit: 'Tablets', status: 'in_stock', jasCode: 'JAS-0312' },
];

const DEFAULT_DOCTOR_ROSTER = [
  { id: 'DOC-01', name: 'Dr. Rajesh Sharma', spec: 'MD General Medicine', facility: 'CHC Sitapur Central', shift: '08:00 AM – 04:00 PM', status: 'On Duty' },
  { id: 'DOC-02', name: 'Dr. Priya Verma', spec: 'MS Obstetrics & Gynae', facility: 'District Hospital Sitapur', shift: '10:00 AM – 06:00 PM', status: 'On Duty' },
  { id: 'DOC-03', name: 'Dr. Ananya Gupta', spec: 'MBBS, DCH Pediatrics', facility: 'Sub-Divisional Hospital', shift: '02:00 PM – 10:00 PM', status: 'On Duty' },
  { id: 'DOC-04', name: 'Dr. Vikramaditya Rathore', spec: 'MD, DM Cardiology', facility: 'State Medical College Hub', shift: '09:00 AM – 05:00 PM', status: 'On Duty' },
];

const ASHA_FORCE = [
  { id: 'ASHA-01', name: 'ASHA Sunita Devi', ward: 'Sitapur Ward 4', households: 245, todayVisits: '18 / 22', highRisk: '2 Flagged', phone: '9876543230', status: 'Active on Field' },
  { id: 'ASHA-02', name: 'ASHA Geeta Yadav', ward: 'Rampur Ward 1', households: 210, todayVisits: '14 / 20', highRisk: '1 Flagged', phone: '9876543231', status: 'Active on Field' },
  { id: 'ASHA-03', name: 'ASHA Manju Devi', ward: 'Rampur Ward 2', households: 230, todayVisits: '16 / 20', highRisk: 'None', phone: '9876543232', status: 'Active on Field' },
  { id: 'ASHA-04', name: 'ASHA Pushpa Sharma', ward: 'Rampur Ward 3', households: 195, todayVisits: '12 / 18', highRisk: 'None', phone: '9876543233', status: 'Active on Field' },
  { id: 'ASHA-05', name: 'ASHA Kamlesh Kumari', ward: 'Sitapur Ward 2', households: 260, todayVisits: '19 / 24', highRisk: '1 Flagged', phone: '9876543234', status: 'Field Survey' },
];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [facilities, setFacilities] = useState([]);
  const [inventory, setInventory] = useState(DEFAULT_INVENTORY);
  const [doctorRoster, setDoctorRoster] = useState(DEFAULT_DOCTOR_ROSTER);
  const [activeDirective, setActiveDirective] = useState(null);

  const [activeView, setActiveView] = useState('overview'); // 'overview', 'teleCenters', 'fieldForce', 'inventory'
  const [activeModal, setActiveModal] = useState(null); // 'exportProgress', 'districtFilter', 'shiftRoster', 'issueDirective', 'addStock', 'viewFacility'
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [exportProgress, setExportProgress] = useState(0);
  const [toast, setToast] = useState(null);

  // Forms State
  const [directiveForm, setDirectiveForm] = useState({
    title: '',
    priority: 'high',
    message: '',
  });

  const [newStockForm, setNewStockForm] = useState({
    name: 'Paracetamol 650mg (Tab)',
    facility: 'CHC Sitapur Central',
    quantity: 2500,
    unit: 'Tablets',
  });

  const [selectedDistrict, setSelectedDistrict] = useState('All Districts (Sitapur Hub)');

  // Multilingual toggle
  const [lang, setLang] = useState('en');
  const t = (enText, hiText) => lang === 'en' ? enText : (hiText || enText);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  };

  const fetchAnalytics = () => {
    api.get('/admin/analytics')
      .then(r => {
        if (r.data?.data) setData(r.data.data);
      })
      .catch(() => {});

    api.get('/admin/facilities')
      .then(r => {
        if (r.data?.data && r.data.data.length > 0) {
          setFacilities(r.data.data);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 10000);
    return () => clearInterval(interval);
  }, []);

  // 1. Export Data Report Action
  const handleExport = () => {
    setActiveModal('exportProgress');
    setExportProgress(0);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 25;
      setExportProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          const report = {
            directorate: 'National Rural Tele-Health Mission',
            state: 'Uttar Pradesh',
            districtNode: 'Sitapur District Command MIS',
            generatedAt: new Date().toISOString(),
            analytics: data || {
              totalPatients: 12450,
              totalDoctors: 42,
              totalHealthWorkers: 128,
              totalFacilities: 5,
              todayConsultations: 48,
              highRiskCases: 3,
            },
            facilities: facilities.map(f => ({ name: f.name, type: f.type, beds: f.capacity?.beds, phone: f.contactPhone })),
            inventorySummary: inventory.map(i => ({ medicine: i.name, stock: i.quantity, status: i.status })),
          };
          const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `SehatSaarthi-MIS-Report-${new Date().toISOString().split('T')[0]}.json`;
          a.click();
          URL.revokeObjectURL(url);
          setActiveModal(null);
          showToast(t('MIS Telemetry Report Exported Successfully!', 'MIS टेलीमेट्री रिपोर्ट सफलतापूर्वक निर्यात की गई!'));
        }, 400);
      }
    }, 300);
  };

  // 2. Broadcast State Directive
  const submitDirective = async (e) => {
    e.preventDefault();
    if (!directiveForm.title || !directiveForm.message) {
      showToast('Please enter directive title and message');
      return;
    }

    try {
      await api.post('/admin/directives', directiveForm);
    } catch {}

    const newDirective = {
      id: `DIR-${Date.now()}`,
      title: directiveForm.title,
      priority: directiveForm.priority,
      message: directiveForm.message,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
    };

    setActiveDirective(newDirective);
    showToast(t('Emergency State Directive Broadcasted to all Health Posts!', 'आपातकालीन निर्देश सभी स्वास्थ्य केंद्रों पर प्रसारित!'));
    setActiveModal(null);
    setDirectiveForm({ title: '', priority: 'high', message: '' });
  };

  // 3. Auto-Requisition & Replenish Stock
  const handleAutoRequisition = (drugId) => {
    setInventory(prev => prev.map(d => {
      if (d.id === drugId) {
        return {
          ...d,
          quantity: d.quantity + 2500,
          status: 'in_stock',
        };
      }
      return d;
    }));
    showToast(`Replenishment Order #REQ-${Math.floor(10000 + Math.random() * 90000)} dispatched! +2,500 units added.`);
  };

  // 4. Add New Stock Form Submit
  const handleAddStockSubmit = (e) => {
    e.preventDefault();
    const newDrug = {
      id: `MED-0${inventory.length + 1}`,
      name: newStockForm.name,
      facility: newStockForm.facility,
      quantity: Number(newStockForm.quantity) || 2000,
      threshold: 3000,
      unit: newStockForm.unit || 'Units',
      status: 'in_stock',
      jasCode: `JAS-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    setInventory([newDrug, ...inventory]);
    showToast(`Medicine stock for "${newStockForm.name}" updated at ${newStockForm.facility}!`);
    setActiveModal(null);
  };

  // 5. Reassign Doctor Shift Roster
  const handleSaveRoster = () => {
    showToast('Doctor shift rotations updated & synced with District Health Officer!');
    setActiveModal(null);
  };

  // 6. Dismiss Alert
  const dismissAlert = (alertId) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    showToast('Escalation marked as resolved and archived.');
  };

  return (
    <div className="bg-[#fbfaf7] text-slate-900 font-sans min-h-screen">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-24 right-6 z-[150] bg-slate-900 text-amber-300 px-5 py-3 rounded-2xl shadow-xl border border-amber-400/50 flex items-center gap-3 text-sm font-bold animate-bounce">
          <span className="material-symbols-outlined text-amber-400">check_circle</span>
          <span>{toast}</span>
        </div>
      )}

      {/* HEADER: Matching Warm Amber & Slate Theme */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs w-full">
        <div className="w-full px-6 lg:px-12 xl:px-16 flex items-center justify-between gap-8 h-20">
          {/* Logo with Govt Portal Badge */}
          <div className="flex items-center gap-3.5 shrink-0 group">
            <img src="/images/logo-transparent.png" alt="SehatSaarthi" className="w-11 h-11 rounded-2xl object-cover shrink-0 notranslate" translate="no" />
            <div className="flex flex-col">
              <span className="font-brand font-black text-slate-900 tracking-tight text-2xl leading-none notranslate" translate="no">SehatSaarthi</span>
              <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 self-start mt-1">
                Govt Portal • Mission Directorate MIS
              </span>
            </div>
          </div>

          {/* Clean Navigation Items */}
          <nav className="hidden lg:flex items-center gap-2 xl:gap-3">
            <button 
              onClick={() => setActiveView('overview')} 
              className={`px-3.5 py-2 font-extrabold text-sm rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
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
              className={`px-3.5 py-2 font-extrabold text-sm rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeView === 'teleCenters' 
                  ? 'bg-amber-600 text-white shadow-sm' 
                  : 'text-slate-700 hover:text-amber-800 hover:bg-amber-50/70'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">domain</span>
              <span>{t('Tele-Health Centers', 'टेली-हेल्थ केंद्र')}</span>
              <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-1.5 py-0.2 rounded-full border border-amber-300">
                {facilities.length || 5}
              </span>
            </button>

            <div className="h-6 w-[2px] bg-slate-300 rounded-full shrink-0"></div>

            <button 
              onClick={() => setActiveView('fieldForce')} 
              className={`px-3.5 py-2 font-extrabold text-sm rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeView === 'fieldForce' 
                  ? 'bg-amber-600 text-white shadow-sm' 
                  : 'text-slate-700 hover:text-amber-800 hover:bg-amber-50/70'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">diversity_1</span>
              <span>{t('Field Force Tracking', 'फील्ड फोर्स ट्रैकिंग')}</span>
            </button>

            <div className="h-6 w-[2px] bg-slate-300 rounded-full shrink-0"></div>

            <button 
              onClick={() => setActiveView('inventory')} 
              className={`px-3.5 py-2 font-extrabold text-sm rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeView === 'inventory' 
                  ? 'bg-amber-600 text-white shadow-sm' 
                  : 'text-slate-700 hover:text-amber-800 hover:bg-amber-50/70'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">medication</span>
              <span>{t('Drug Inventory', 'दवा सूची')}</span>
            </button>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="h-8 w-[2px] bg-slate-300 rounded-full hidden lg:block mr-1"></div>

            <LanguageSelector />

            <button 
              onClick={() => { if (window.confirm('Are you sure you want to logout from Admin Console?')) logout(); }} 
              className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 border border-slate-200 flex items-center justify-center transition-all shadow-xs cursor-pointer" 
              title="Logout"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="w-full bg-[#fbfaf7] px-6 lg:px-12 xl:px-16 pt-28 pb-16 animate-fadeIn min-h-[85vh]">
        {/* Active Emergency Directive Banner (if broadcasted) */}
        {activeDirective && (
          <div className="mb-6 p-4 sm:p-5 bg-rose-50 border-2 border-rose-400 rounded-3xl flex items-start justify-between gap-4 shadow-sm animate-fadeIn">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">campaign</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                    ACTIVE STATE DIRECTIVE • {activeDirective.priority}
                  </span>
                  <span className="text-xs text-rose-800 font-bold">Issued at {activeDirective.time}</span>
                </div>
                <h4 className="text-base font-black text-rose-950">{activeDirective.title}</h4>
                <p className="text-xs text-rose-800 font-medium mt-0.5">{activeDirective.message}</p>
              </div>
            </div>
            <button
              onClick={() => setActiveDirective(null)}
              className="text-rose-700 hover:text-rose-900 font-bold text-xs"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Top Header & Export / Filter Toolbar */}
        <div className="w-full flex flex-col md:flex-row md:items-end justify-between gap-4 py-5 border-b border-slate-200 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center justify-center w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs text-slate-500 uppercase tracking-wider font-extrabold">National Digital Health Mission • Live Telemetry</span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {activeView === 'overview' && t('National Health MIS Dashboard', 'राष्ट्रीय स्वास्थ्य अवलोकन')}
              {activeView === 'teleCenters' && t('Tele-Health Centers Network', 'टेली-हेल्थ केंद्र नेटवर्क')}
              {activeView === 'fieldForce' && t('Field Force Tracking', 'फील्ड फोर्स ट्रैकिंग')}
              {activeView === 'inventory' && t('Central Drug Inventory', 'दवा सूची प्रबंधन')}
            </h1>
            <p className="text-sm text-slate-600 font-semibold mt-1">
              {t('Central Tele-Health Surveillance, Public Resource Allocation & District Healthcare Framework', 'ग्रामीण टेली-हेल्थ मिशन - केंद्रीय निगरानी और जिला वितरण ढांचा')}
            </p>
          </div>
          
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border-2 border-slate-200 rounded-xl shadow-2xs">
              <span className="material-symbols-outlined text-amber-600 text-[18px]">calendar_today</span>
              <span className="text-xs font-black text-slate-800">
                {new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            <button 
              onClick={() => setActiveModal('districtFilter')} 
              className="h-11 px-4 flex items-center gap-1.5 bg-white border-2 border-slate-200 hover:border-amber-400 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-black transition-all shadow-2xs cursor-pointer" 
              type="button"
            >
              <span className="material-symbols-outlined text-amber-600 text-[18px]">tune</span>
              <span>{selectedDistrict.split(' ')[0]}</span>
            </button>

            <button 
              onClick={handleExport} 
              className="h-11 px-5 flex items-center gap-2 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-black rounded-xl shadow-xs transition-all cursor-pointer" 
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>{t('Export MIS Report', 'MIS निर्यात करें')}</span>
            </button>
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeView === 'overview' && (
          <div className="animate-fadeIn">
            {/* Live Node Callout */}
            <div className="w-full p-5 sm:p-6 bg-gradient-to-r from-amber-500/15 via-amber-100/40 to-transparent border-2 border-amber-300 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white border-2 border-amber-400 flex items-center justify-center text-amber-700 shrink-0 shadow-xs">
                  <span className="material-symbols-outlined text-[30px] animate-pulse">hub</span>
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight font-heading">
                    {t('State Central Tele-Health Node Synchronized', 'राज्य केंद्रीय नोड सिंक्रनाइज़')}
                  </h3>
                  <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-0.5">
                    142 Primary Health Centres &amp; Sub-Centres connected. Satellite uplink latency: 28ms. Zero packet loss.
                  </p>
                </div>
              </div>
              <span className="text-xs font-black px-4 py-2 bg-white text-amber-950 rounded-xl border border-amber-300 shadow-2xs whitespace-nowrap">
                NODE UPTIME: 99.98%
              </span>
            </div>

            {/* 4 KPI Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {[
                { 
                  label: 'Registered Citizens', 
                  value: (data?.totalPatients || 12).toLocaleString(), 
                  sub: 'ABDM Verified Profiles',
                  icon: 'groups', 
                  color: 'amber' 
                },
                { 
                  label: 'OPD Consultations', 
                  value: (data?.totalAppointments || 6).toLocaleString(), 
                  sub: 'Digital OPD Sessions',
                  icon: 'video_chat', 
                  color: 'sky' 
                },
                { 
                  label: 'Field ASHA Workforce', 
                  value: '8 Active', 
                  sub: '1,200 Households Covered',
                  icon: 'medical_services', 
                  color: 'emerald' 
                },
                { 
                  label: 'Jan Aushadhi Prescriptions', 
                  value: '14 Signed', 
                  sub: '98.4% Fulfillment Rate',
                  icon: 'local_pharmacy', 
                  color: 'purple' 
                },
              ].map(kpi => (
                <div key={kpi.label} className="bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-amber-400 shadow-sm transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs uppercase font-black tracking-wider text-slate-500">{kpi.label}</span>
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[22px]">{kpi.icon}</span>
                    </div>
                  </div>
                  <div className="text-3xl font-black text-slate-900 tracking-tight font-heading">{kpi.value}</div>
                  <div className="text-xs font-semibold text-slate-500 mt-1">{kpi.sub}</div>
                </div>
              ))}
            </div>

            {/* Clinical Escalation Alerts */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-rose-600 text-[24px]">crisis_alert</span>
                  <h3 className="text-xl font-black text-slate-900 font-heading">Critical Field Escalations</h3>
                  <span className="bg-rose-100 text-rose-900 text-xs font-black px-2 py-0.5 rounded-full border border-rose-300">
                    {alerts.length} Pending
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {alerts.map(al => (
                  <div 
                    key={al.id}
                    className="p-5 bg-white border-2 border-slate-200 hover:border-rose-300 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-700 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[26px]">{al.icon}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-rose-100 text-rose-900 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                            {al.category}
                          </span>
                          <span className="text-xs text-slate-500 font-bold">• {al.source}</span>
                        </div>
                        <h4 className="text-base font-black text-slate-900">{al.title}</h4>
                        <p className="text-xs text-slate-600 font-medium mt-0.5">{al.detail}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => {
                          if (al.action === 'Restock Medicines') {
                            setActiveView('inventory');
                          } else {
                            dismissAlert(al.id);
                          }
                        }}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black shadow-xs transition-all cursor-pointer"
                      >
                        {al.action}
                      </button>
                      <button
                        type="button"
                        onClick={() => dismissAlert(al.id)}
                        className="p-2 text-slate-400 hover:text-slate-700 rounded-lg"
                        title="Dismiss alert"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Command Center Dock */}
            <section className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border-b-4 border-amber-500 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[32px]">admin_panel_settings</span>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white font-heading">District Tele-Medicine Command Console</h3>
                  <p className="text-xs text-slate-300 font-medium mt-1">
                    Manage doctor roster rotations, emergency van dispatch, and broadcast district health directives.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                <button 
                  onClick={() => setActiveModal('shiftRoster')} 
                  className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-black border border-slate-700 shadow-sm transition-all cursor-pointer" 
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px] inline mr-1 text-amber-400">group</span>
                  <span>Doctor Shift Roster</span>
                </button>

                <button 
                  onClick={() => setActiveModal('issueDirective')} 
                  className="px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-black shadow-sm transition-all cursor-pointer" 
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px] inline mr-1">campaign</span>
                  <span>Issue State Directive</span>
                </button>
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: TELE-HEALTH CENTERS NETWORK */}
        {activeView === 'teleCenters' && (
          <div className="animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 font-heading">Connected Public Healthcare Facilities</h2>
                <p className="text-xs text-slate-600 font-medium">Real-time status of district hospitals, community health centres, and telemedicine kiosks.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {(facilities.length > 0 ? facilities : [
                { _id: '1', name: 'CHC Sitapur Central', type: 'CHC', capacity: { beds: 30, opdRooms: 6 }, contactPhone: '05862-242108', timing: '24x7 Emergency' },
                { _id: '2', name: 'District Hospital Sitapur', type: 'district_hospital', capacity: { beds: 120, opdRooms: 18 }, contactPhone: '05862-243108', timing: '24x7 Emergency' },
                { _id: '3', name: 'Rampur Sub-Centre', type: 'sub_centre', capacity: { beds: 5, opdRooms: 2 }, contactPhone: '05862-245108', timing: '9:00 AM – 4:00 PM' },
                { _id: '4', name: 'Sitapur Ward 4 Health Post', type: 'sub_centre', capacity: { beds: 4, opdRooms: 1 }, contactPhone: '05862-246108', timing: '9:00 AM – 4:00 PM' },
                { _id: '5', name: 'State Medical College Tele-Hub', type: 'tertiary', capacity: { beds: 500, opdRooms: 40 }, contactPhone: '05862-248108', timing: '24x7 Emergency' },
              ]).map((fac, i) => (
                <div key={fac._id || i} className="bg-white border-2 border-slate-200 hover:border-amber-400 rounded-3xl p-6 shadow-sm transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[26px]">domain</span>
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 text-base">{fac.name}</h4>
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            {fac.type?.replace('_', ' ') || 'Health Post'}
                          </span>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                        Online
                      </span>
                    </div>

                    <div className="space-y-2 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-200 mb-4">
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">Total Bed Capacity:</span>
                        <strong className="text-slate-900 font-black">{fac.capacity?.beds || 20} Beds</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">OPD Tele-Rooms:</span>
                        <strong className="text-slate-900 font-black">{fac.capacity?.opdRooms || 4} Rooms</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">Helpdesk Phone:</span>
                        <strong className="text-slate-900 font-black">{fac.contactPhone || '05862-242108'}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFacility(fac);
                        setActiveModal('viewFacility');
                      }}
                      className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px] text-amber-400">monitoring</span>
                      <span>Live Telemetry</span>
                    </button>
                    <a
                      href={`tel:${fac.contactPhone || '05862-242108'}`}
                      className="px-3 py-2.5 border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-bold transition-all shadow-2xs"
                      title="Call facility"
                    >
                      <span className="material-symbols-outlined text-[16px] text-amber-700">call</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: FIELD FORCE TRACKING */}
        {activeView === 'fieldForce' && (
          <div className="animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 font-heading">ASHA Community Field Force Tracking</h2>
                <p className="text-xs text-slate-600 font-medium">Live household visit execution and telemetry across Sitapur &amp; Rampur rural sectors.</p>
              </div>
            </div>

            <div className="bg-white border-2 border-slate-200/90 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left border-collapse text-xs">
                  <thead className="bg-slate-50 border-b-2 border-slate-100">
                    <tr>
                      <th className="p-4 font-black text-slate-500 uppercase tracking-wider whitespace-nowrap">Worker Details</th>
                      <th className="p-4 font-black text-slate-500 uppercase tracking-wider whitespace-nowrap">Assigned Ward</th>
                      <th className="p-4 font-black text-slate-500 uppercase tracking-wider whitespace-nowrap">Households Covered</th>
                      <th className="p-4 font-black text-slate-500 uppercase tracking-wider whitespace-nowrap">Today's Visits</th>
                      <th className="p-4 font-black text-slate-500 uppercase tracking-wider whitespace-nowrap">High-Risk Cases</th>
                      <th className="p-4 font-black text-slate-500 uppercase tracking-wider text-right whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ASHA_FORCE.map(a => (
                      <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-black text-slate-900 flex items-center gap-3 whitespace-nowrap">
                          <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 flex items-center justify-center font-black">
                            {a.name.replace('ASHA ', '').charAt(0)}
                          </div>
                          <div>
                            <span className="block text-sm font-black">{a.name}</span>
                            <span className="text-[10px] font-mono text-slate-400">{a.id}</span>
                          </div>
                        </td>
                        <td className="p-4 font-bold text-slate-700 whitespace-nowrap">{a.ward}</td>
                        <td className="p-4 font-bold text-slate-900 whitespace-nowrap">{a.households} Households</td>
                        <td className="p-4 font-black text-amber-950 whitespace-nowrap">{a.todayVisits} Completed</td>
                        <td className="p-4 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black whitespace-nowrap ${
                            a.highRisk.includes('Flagged') ? 'bg-rose-100 text-rose-900 border border-rose-300' : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          }`}>
                            {a.highRisk}
                          </span>
                        </td>
                        <td className="p-4 text-right whitespace-nowrap">
                          <a 
                            href={`tel:${a.phone}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-black transition-colors"
                          >
                            <span className="material-symbols-outlined text-[15px]">call</span>
                            <span>Call</span>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DRUG INVENTORY MANAGEMENT */}
        {activeView === 'inventory' && (
          <div className="animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 font-heading">Central Jan Aushadhi Drug Inventory</h2>
                <p className="text-xs text-slate-600 font-medium">District medicine reserves, consumption buffer stocks, and automated requisition dispatch.</p>
              </div>

              <button
                type="button"
                onClick={() => setActiveModal('addStock')}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span>Replenish / Add Drug Stock</span>
              </button>
            </div>

            <div className="bg-white border-2 border-slate-200/90 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[750px] text-left border-collapse text-xs">
                  <thead className="bg-slate-50 border-b-2 border-slate-100">
                    <tr>
                      <th className="p-4 font-black text-slate-500 uppercase tracking-wider whitespace-nowrap">Generic Drug Name</th>
                      <th className="p-4 font-black text-slate-500 uppercase tracking-wider whitespace-nowrap">Facility Allocation</th>
                      <th className="p-4 font-black text-slate-500 uppercase tracking-wider whitespace-nowrap">Available Stock</th>
                      <th className="p-4 font-black text-slate-500 uppercase tracking-wider whitespace-nowrap">Buffer Threshold</th>
                      <th className="p-4 font-black text-slate-500 uppercase tracking-wider whitespace-nowrap">Stock Status</th>
                      <th className="p-4 font-black text-slate-500 uppercase tracking-wider text-right whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inventory.map((drug) => {
                      const isLow = drug.status === 'low_stock' || drug.quantity < drug.threshold;
                      return (
                        <tr key={drug.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 font-black text-slate-900 whitespace-nowrap">
                            <span>{drug.name}</span>
                            <span className="font-mono text-[10px] text-amber-900 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 block mt-0.5 w-fit">
                              {drug.jasCode}
                            </span>
                          </td>
                          <td className="p-4 font-semibold text-slate-600 whitespace-nowrap">{drug.facility}</td>
                          <td className="p-4 font-black text-slate-900 text-sm whitespace-nowrap">
                            {Number(drug.quantity).toLocaleString()} <span className="text-xs font-medium text-slate-500">{drug.unit}</span>
                          </td>
                          <td className="p-4 font-mono font-bold text-slate-500 whitespace-nowrap">{Number(drug.threshold).toLocaleString()}</td>
                          <td className="p-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black whitespace-nowrap ${
                              isLow ? 'bg-rose-100 text-rose-900 border border-rose-300' : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            }`}>
                              {isLow ? 'Critical / Buffer Low' : 'Adequate Supply'}
                            </span>
                          </td>
                          <td className="p-4 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleAutoRequisition(drug.id)}
                              className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl font-black text-xs transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
                            >
                              Auto-Requisition
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL 1: EXPORT PROGRESS */}
      {activeModal === 'exportProgress' && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border-2 border-amber-300 shadow-2xl w-full max-w-sm overflow-hidden p-8 text-center">
            <div className="mb-4 flex justify-center">
              <span className="material-symbols-outlined text-amber-600 text-[48px] animate-bounce">cloud_download</span>
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-1">Exporting MIS Telemetry Report</h3>
            <p className="text-xs text-slate-500 font-semibold mb-5">Compiling state health database and generating validated JSON report...</p>
            <div className="w-full bg-slate-100 rounded-full h-3 mb-2 overflow-hidden border border-slate-200">
              <div className="bg-amber-600 h-3 rounded-full transition-all duration-300" style={{ width: `${exportProgress}%` }}></div>
            </div>
            <span className="text-sm font-black text-amber-900 font-mono">{exportProgress}% Completed</span>
          </div>
        </div>
      )}

      {/* MODAL 2: DISTRICT FILTER */}
      {activeModal === 'districtFilter' && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border-2 border-amber-400 shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b-4 border-amber-500">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400">tune</span>
                <span>Select District Telemetry Hub</span>
              </h3>
              <button 
                onClick={() => setActiveModal(null)} 
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 transition-colors cursor-pointer shadow-sm"
              >
                <span className="material-symbols-outlined text-[20px] font-bold text-slate-900">close</span>
              </button>
            </div>

            <div className="p-6 space-y-2 text-xs">
              {['Sitapur Central Hub (Primary)', 'Hardoi Rural District', 'Lakhimpur Kheri Sector', 'Barabanki Health Node'].map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    setSelectedDistrict(d);
                    showToast(`Switched active MIS node to "${d}"`);
                    setActiveModal(null);
                  }}
                  className={`w-full p-3.5 rounded-2xl border text-left font-bold transition-all cursor-pointer flex items-center justify-between ${
                    selectedDistrict === d ? 'bg-amber-100 border-amber-400 text-amber-950 font-black' : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <span>{d}</span>
                  {selectedDistrict === d && <span className="material-symbols-outlined text-amber-700">check_circle</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: SHIFT ROSTER */}
      {activeModal === 'shiftRoster' && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border-2 border-amber-400 shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between border-b-4 border-amber-500">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <span className="material-symbols-outlined text-[22px]">group</span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-white font-heading">Doctor Tele-OPD Shift Roster</h3>
                  <p className="text-xs text-amber-300/80 font-bold">Manage medical officer rotations across CHCs and hospitals</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveModal(null)} 
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 transition-colors cursor-pointer shadow-sm"
                title="Close"
              >
                <span className="material-symbols-outlined text-[20px] font-bold text-slate-900">close</span>
              </button>
            </div>

            <div className="p-4 sm:p-6 text-xs">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 font-black text-slate-500 uppercase">Specialist Doctor</th>
                    <th className="py-3 px-4 font-black text-slate-500 uppercase">Assigned Facility</th>
                    <th className="py-3 px-4 font-black text-slate-500 uppercase">Shift Timing</th>
                    <th className="py-3 px-4 font-black text-slate-500 uppercase text-right">Duty Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {doctorRoster.map(doc => (
                    <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-black text-slate-900 text-sm block">{doc.name}</span>
                        <span className="text-[11px] text-slate-500 font-semibold">{doc.spec}</span>
                      </td>
                      <td className="py-3 px-4 font-bold text-amber-950">
                        {doc.facility}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">
                        <span className="bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 inline-block font-bold text-xs">
                          {doc.shift}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300 whitespace-nowrap shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                          <span>{doc.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => setActiveModal(null)} className="px-5 py-2 text-xs font-bold text-slate-700 cursor-pointer">Close</button>
              <button onClick={handleSaveRoster} className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer">
                Confirm &amp; Sync Shift Roster
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: ISSUE STATE DIRECTIVE */}
      {activeModal === 'issueDirective' && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border-2 border-amber-400 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b-4 border-amber-500">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[22px]">campaign</span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-white font-heading">Broadcast State Public Health Directive</h3>
                  <p className="text-xs text-amber-300/80 font-bold">Dispatch live instruction to all district tele-health centres</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveModal(null)} 
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 transition-colors cursor-pointer shadow-sm"
              >
                <span className="material-symbols-outlined text-[20px] font-bold text-slate-900">close</span>
              </button>
            </div>

            <form onSubmit={submitDirective} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">Directive Title <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={directiveForm.title}
                  onChange={e => setDirectiveForm({...directiveForm, title: e.target.value})}
                  placeholder="e.g. Mandatory Malaria Screening in High-Risk Wards"
                  className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">Priority Level</label>
                <select
                  value={directiveForm.priority}
                  onChange={e => setDirectiveForm({...directiveForm, priority: e.target.value})}
                  className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-amber-500"
                >
                  <option value="high">High - Immediate Action Required</option>
                  <option value="medium">Medium - Action within 24 Hours</option>
                  <option value="routine">Routine Administrative Advisory</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">Directive Instructions / Action Steps <span className="text-rose-500">*</span></label>
                <textarea
                  required
                  rows="3"
                  value={directiveForm.message}
                  onChange={e => setDirectiveForm({...directiveForm, message: e.target.value})}
                  placeholder="Detail exact SOPs for medical officers, ANMs, and ASHA workers..."
                  className="w-full bg-slate-50 px-3.5 py-2 rounded-xl border-2 border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-amber-500"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 text-xs font-bold text-slate-700">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  <span>Broadcast Across State Grid</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: ADD DRUG STOCK */}
      {activeModal === 'addStock' && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border-2 border-amber-400 shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b-4 border-amber-500">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[22px]">medication</span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-white font-heading">Replenish Jan Aushadhi Stock</h3>
                  <p className="text-xs text-amber-300/80 font-bold">Central warehouse delivery dispatch</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveModal(null)} 
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 transition-colors cursor-pointer shadow-sm"
              >
                <span className="material-symbols-outlined text-[20px] font-bold text-slate-900">close</span>
              </button>
            </div>

            <form onSubmit={handleAddStockSubmit} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">Medicine Formulation <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={newStockForm.name}
                  onChange={e => setNewStockForm({...newStockForm, name: e.target.value})}
                  className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">Target Healthcare Facility</label>
                <select
                  value={newStockForm.facility}
                  onChange={e => setNewStockForm({...newStockForm, facility: e.target.value})}
                  className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-amber-500"
                >
                  <option value="CHC Sitapur Central">CHC Sitapur Central</option>
                  <option value="District Hospital Sitapur">District Hospital Sitapur</option>
                  <option value="Rampur Sub-Centre">Rampur Sub-Centre</option>
                  <option value="Sitapur Ward 4 Health Post">Sitapur Ward 4 Health Post</option>
                  <option value="State Medical College Tele-Hub">State Medical College Tele-Hub</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">Quantity</label>
                  <input
                    type="number"
                    value={newStockForm.quantity}
                    onChange={e => setNewStockForm({...newStockForm, quantity: e.target.value})}
                    className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">Unit</label>
                  <select
                    value={newStockForm.unit}
                    onChange={e => setNewStockForm({...newStockForm, unit: e.target.value})}
                    className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-amber-500"
                  >
                    <option value="Tablets">Tablets</option>
                    <option value="Capsules">Capsules</option>
                    <option value="Sachets">Sachets</option>
                    <option value="Bottles">Bottles</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 text-xs font-bold text-slate-700">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl shadow-xs cursor-pointer">
                  Confirm Stock Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: VIEW FACILITY TELEMETRY */}
      {activeModal === 'viewFacility' && selectedFacility && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border-2 border-amber-400 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b-4 border-amber-500">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[22px]">domain</span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-white font-heading">{selectedFacility.name}</h3>
                  <p className="text-xs text-amber-300/80 font-bold">Live Telemetry &amp; Bed Occupancy Node</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveModal(null)} 
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 transition-colors cursor-pointer shadow-sm"
              >
                <span className="material-symbols-outlined text-[20px] font-bold text-slate-900">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs overflow-y-auto">
              <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Facility Type</span>
                  <strong className="text-slate-900 font-black">{selectedFacility.type?.replace('_', ' ')}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Beds</span>
                  <strong className="text-slate-900 font-black">{selectedFacility.capacity?.beds || 20} Beds</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">OPD Rooms</span>
                  <strong className="text-slate-900 font-black">{selectedFacility.capacity?.opdRooms || 4} Rooms</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Network Status</span>
                  <strong className="text-emerald-700 font-black">99.9% Online</strong>
                </div>
              </div>

              {/* Services */}
              {selectedFacility.services && selectedFacility.services.length > 0 && (
                <div>
                  <span className="font-black text-slate-900 block mb-1.5">Accredited Clinical Services:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedFacility.services.map((s, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-800 font-bold">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] uppercase font-black text-slate-500 block mb-1">Facility Contact Desk</span>
                <p className="text-sm font-black text-slate-900">Phone: {selectedFacility.contactPhone || '05862-242108'}</p>
                <p className="text-xs text-slate-500 mt-0.5">Sitapur District Public Health Network, Uttar Pradesh</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button onClick={() => setActiveModal(null)} className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-black">
                Close Telemetry
              </button>
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
