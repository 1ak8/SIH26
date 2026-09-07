import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const VISIT_QUEUE = [
  { id: 1, name: 'Kamla Devi', age: '28 yrs', icon: 'pregnant_woman', risk: 'High Risk', riskColor: true, type: 'Trimester 3 Checkup', time: '09:30 AM' },
  { id: 2, name: 'Rameshwar Singh', age: '64 yrs', icon: 'bloodtype', risk: 'High Risk', riskColor: true, type: 'Diabetes Follow-up', time: '10:15 AM' },
  { id: 3, name: 'Aarav Kumar', age: '9 mos', icon: 'child_care', risk: 'Routine', riskColor: false, type: 'Immunization MR-1', time: '11:30 AM' },
  { id: 4, name: 'Meena Yadav', age: '34 yrs', icon: 'elderly_woman', risk: 'Normal', riskColor: false, type: 'Post-natal Care', time: '01:00 PM' },
  { id: 5, name: 'Chhedi Lal', age: '71 yrs', icon: 'elderly', risk: 'Scheduled', riskColor: false, type: 'Hypertension Review', time: '02:15 PM' },
];

export default function HealthWorkerDashboard() {
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('visits');
  const [activeModal, setActiveModal] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    api.get('/health-worker/dashboard').then(r => setData(r.data.data)).catch(() => {});
  }, []);

  return (
    <div className="bg-surface-container-lowest text-on-surface font-sans min-h-screen">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest border-b border-surface-variant">
        <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary-container text-[20px]">health_and_safety</span>
            </div>
            <span className="text-headline-md font-bold text-on-surface tracking-tight leading-tight">AarogyaNet</span>
          </div>
          <nav className="hidden lg:flex items-center gap-2">
            <button onClick={() => setActiveTab('visits')} className={`px-3 py-1.5 text-label-md font-bold rounded-lg transition-colors ${activeTab === 'visits' ? 'bg-surface-container text-on-surface' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'}`}>Today's Visits</button>
            <button onClick={() => setActiveTab('registry')} className={`px-3 py-1.5 text-label-md font-bold rounded-lg transition-colors ${activeTab === 'registry' ? 'bg-surface-container text-on-surface' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'}`}>Patient Registry</button>
            <button onClick={() => setActiveTab('immunization')} className={`px-3 py-1.5 text-label-md font-bold rounded-lg transition-colors ${activeTab === 'immunization' ? 'bg-surface-container text-on-surface' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'}`}>Immunization Track</button>
            <button onClick={() => setActiveTab('sync')} className={`px-3 py-1.5 text-label-md font-bold rounded-lg transition-colors ${activeTab === 'sync' ? 'bg-surface-container text-on-surface' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'}`}>Sync Records</button>
          </nav>
          <div className="flex items-center gap-3 shrink-0">
            <button className="h-12 px-3 flex items-center gap-2 bg-surface-container-lowest border border-surface-variant rounded-lg text-on-surface text-label-md font-semibold hover:bg-surface-container hover:text-on-surface transition-colors" type="button">
              <span className="material-symbols-outlined text-secondary text-[20px]">translate</span>
              <span className="hidden sm:inline">Language: EN / हिंदी</span>
            </button>
            <a className="h-12 px-4 flex items-center gap-2 bg-primary-container text-on-primary-container text-label-lg font-bold rounded-lg hover:bg-[#ffb95f] hover:text-on-surface transition-colors" href="tel:108">
              <span className="material-symbols-outlined text-[22px]">call</span>
              <span>Emergency 108</span>
            </a>
            <button onClick={logout} className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0" title="Logout">
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="w-full pt-20 bg-surface-container-lowest max-w-7xl mx-auto px-4 lg:px-8">
        {activeTab === 'visits' && (
          <div className="flex flex-col w-full animate-fadeIn pb-8">
            {/* Village Header */}
          <section className="w-full bg-surface-container-lowest p-6 rounded-xl mb-8 flex flex-col md:flex-row md:items-end justify-between gap-5">
            <div className="flex flex-col gap-1.5">
              <span className="text-label-sm text-secondary uppercase tracking-wider font-semibold">Today's Schedule</span>
              <h1 className="text-display-lg font-bold text-on-surface tracking-tight">Village Rampur</h1>
              <p className="text-body-md text-secondary">Sub-Centre: Rampur Kalan</p>
            </div>
            <div className="flex items-center gap-3.5 bg-surface-container-low px-4 py-3 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold shrink-0">
                <span className="material-symbols-outlined text-[24px]">person</span>
              </div>
              <div className="flex flex-col">
                <span className="text-headline-sm font-bold text-on-surface">{user?.name || 'Sunita Devi'}</span>
                <span className="text-label-sm text-secondary">ASHA Worker</span>
              </div>
            </div>
          </section>

          {/* Stats Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-6 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-label-lg text-secondary font-semibold">Total Assigned</span>
                <span className="material-symbols-outlined text-secondary text-[24px]">assignment</span>
              </div>
              <div className="mt-4">
                <span className="text-display-lg text-on-surface font-bold">{data?.todayVisits || 12}</span>
                <p className="text-label-md text-secondary mt-1">Households</p>
              </div>
            </div>
            <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-6 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-label-lg text-secondary font-semibold">Pending Visits</span>
                <span className="material-symbols-outlined text-secondary text-[24px]">pending_actions</span>
              </div>
              <div className="mt-4">
                <span className="text-display-lg text-on-surface font-bold">5</span>
                <p className="text-label-md text-secondary mt-1">Remaining today</p>
              </div>
            </div>
            <div className="bg-error-container border border-tertiary-fixed-dim rounded-xl p-6 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-label-lg text-tertiary font-bold">High Risk</span>
                <span className="material-symbols-outlined text-tertiary text-[24px]">priority_high</span>
              </div>
              <div className="mt-4">
                <span className="text-display-lg text-on-error-container font-bold">{data?.highRiskAlerts?.length || 2}</span>
                <p className="text-label-md text-tertiary font-semibold mt-1">Immediate attention</p>
              </div>
            </div>
          </section>

          {/* Daily Visit Queue Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-headline-lg font-bold text-on-surface">Daily Visit Queue</h2>
              <p className="text-body-md text-secondary mt-0.5">Ordered by clinical triage priority</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="h-12 px-4 rounded-lg bg-surface-container text-on-surface text-label-md font-semibold flex items-center gap-2 hover:bg-surface-variant transition-colors" type="button">
                <span className="material-symbols-outlined text-[20px]">filter_list</span>
                <span>All (5)</span>
              </button>
            </div>
          </div>

          {/* Patient Visit List */}
          <div className="flex flex-col gap-4 w-full mb-8">
            {VISIT_QUEUE.map(patient => (
              <article key={patient.id} className="bg-surface-container-lowest border border-surface-variant rounded-xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5 hover:bg-surface-container-low transition-colors shadow-sm">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${patient.riskColor ? 'bg-error-container text-tertiary' : patient.risk === 'Routine' ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container text-secondary'} font-bold flex items-center justify-center shrink-0`}>
                    <span className="material-symbols-outlined text-[26px]">{patient.icon}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-headline-md font-bold text-on-surface">{patient.name}</h3>
                      <span className="text-label-md text-secondary">{patient.age}</span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full ${patient.riskColor ? 'bg-error-container text-tertiary' : patient.risk === 'Routine' ? 'bg-secondary-container text-on-secondary-fixed' : 'bg-surface-container text-on-surface'} text-label-sm font-bold`}>
                        {patient.riskColor && <span className="material-symbols-outlined text-[14px]">warning</span>}
                        {patient.risk}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-body-md text-secondary mt-0.5">
                      <span>{patient.type}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-semibold text-on-surface">
                        <span className="material-symbols-outlined text-[16px]">schedule</span>
                        {patient.time}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="shrink-0 self-stretch lg:self-auto">
                  <button onClick={() => { setSelectedPatient(patient); setActiveModal('vitals'); }} className="w-full lg:w-auto h-14 px-8 bg-primary-container text-on-primary-container text-label-lg font-bold rounded-xl hover:bg-[#ffb95f] transition-colors flex items-center justify-center gap-2 shadow-sm" type="button">
                    <span className="material-symbols-outlined text-[22px]">favorite</span>
                    <span>Record Vitals</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
        )}

        {activeTab === 'registry' && (
          <div className="flex flex-col w-full animate-fadeIn pb-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-headline-lg font-bold text-on-surface">Patient Registry</h1>
              <button className="bg-primary text-on-primary px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-surface-tint">Add New Citizen</button>
            </div>
            <div className="bg-surface-container-lowest border border-surface-variant rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-surface-variant bg-surface-container-low flex gap-4">
                <input type="text" placeholder="Search by name, ABHA ID or house number..." className="flex-1 bg-surface-container px-4 py-2 rounded-lg text-sm border border-surface-variant focus:outline-none focus:border-primary" />
                <select className="bg-surface-container px-4 py-2 rounded-lg text-sm border border-surface-variant font-bold">
                  <option>All Villages</option>
                  <option>Rampur</option>
                  <option>Sitapur</option>
                </select>
              </div>
              <div className="p-8 text-center text-secondary">
                <span className="material-symbols-outlined text-[48px] text-surface-variant mb-2">person_search</span>
                <p className="font-bold">Search to view citizens</p>
                <p className="text-sm">Access complete health records of 245 households assigned to you.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'immunization' && (
          <div className="flex flex-col w-full animate-fadeIn pb-8">
            <h1 className="text-headline-lg font-bold text-on-surface mb-6">Immunization Tracker</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-surface-container-lowest p-5 border border-surface-variant rounded-xl shadow-sm border-l-4 border-l-amber-500">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-on-surface">Aarav Kumar (9 mos)</h3>
                  <span className="bg-error-container text-tertiary px-2 py-0.5 rounded text-[11px] font-bold">Due Today</span>
                </div>
                <p className="text-sm text-secondary mb-3">MR-1, JE-1, Vitamin A (1st dose)</p>
                <button className="w-full bg-surface-container py-2 rounded-lg text-sm font-bold border border-surface-variant hover:bg-surface-variant">Log Vaccination</button>
              </div>
              <div className="bg-surface-container-lowest p-5 border border-surface-variant rounded-xl shadow-sm border-l-4 border-l-emerald-500">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-on-surface">Diya Patel (1.5 yrs)</h3>
                  <span className="bg-surface-container-low text-secondary px-2 py-0.5 rounded text-[11px] font-bold">Upcoming: Next week</span>
                </div>
                <p className="text-sm text-secondary mb-3">DPT Booster, OPV Booster</p>
                <button className="w-full bg-surface-container py-2 rounded-lg text-sm font-bold border border-surface-variant hover:bg-surface-variant">View Schedule</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sync' && (
          <div className="flex flex-col w-full animate-fadeIn pb-8 max-w-2xl mx-auto mt-10">
            <div className="bg-surface-container-lowest p-8 border border-surface-variant rounded-2xl shadow-sm text-center">
              <span className="material-symbols-outlined text-[64px] text-primary mb-4">cloud_sync</span>
              <h2 className="text-headline-md font-bold text-on-surface mb-2">Offline Records Sync</h2>
              <p className="text-secondary mb-6">You have 12 patient records and 5 vitals logged offline. Connect to internet to sync to the national grid.</p>
              <button className="bg-primary text-on-primary w-full py-3 rounded-xl font-bold hover:bg-surface-tint shadow-sm flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">sync</span> Start Sync
              </button>
              <p className="text-[12px] text-secondary mt-4">Last synced: Today at 08:00 AM</p>
            </div>
          </div>
        )}
      </main>

      {/* Record Vitals Modal */}
      {activeModal === 'vitals' && selectedPatient && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-surface-variant flex items-center justify-between bg-surface-container-low">
              <div>
                <h3 className="text-headline-sm font-bold text-on-surface">Record Vitals</h3>
                <p className="text-sm text-secondary">{selectedPatient.name} • {selectedPatient.age}</p>
              </div>
              <button onClick={() => setActiveModal(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-variant text-on-surface-variant transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-secondary mb-1">Blood Pressure (mmHg)</label>
                    <input type="text" placeholder="120/80" className="w-full bg-surface-container px-3 py-2 rounded-lg border border-surface-variant text-on-surface font-bold focus:outline-none focus:border-primary" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-secondary mb-1">Heart Rate (BPM)</label>
                    <input type="number" placeholder="72" className="w-full bg-surface-container px-3 py-2 rounded-lg border border-surface-variant text-on-surface font-bold focus:outline-none focus:border-primary" />
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-secondary mb-1">SpO2 (%)</label>
                    <input type="number" placeholder="98" className="w-full bg-surface-container px-3 py-2 rounded-lg border border-surface-variant text-on-surface font-bold focus:outline-none focus:border-primary" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-secondary mb-1">Temperature (°F)</label>
                    <input type="text" placeholder="98.6" className="w-full bg-surface-container px-3 py-2 rounded-lg border border-surface-variant text-on-surface font-bold focus:outline-none focus:border-primary" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-secondary mb-1">Clinical Notes (Optional)</label>
                  <textarea rows="3" placeholder="Any observed symptoms or notes..." className="w-full bg-surface-container px-3 py-2 rounded-lg border border-surface-variant text-on-surface text-sm focus:outline-none focus:border-primary"></textarea>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input type="checkbox" id="urgent" className="w-4 h-4 text-primary bg-surface-container border-surface-variant rounded focus:ring-primary" />
                  <label htmlFor="urgent" className="text-sm font-bold text-tertiary">Flag for Urgent Tele-Consult Review</label>
                </div>
                <button onClick={() => { setActiveModal(null); alert('Vitals saved to ABDM grid successfully!'); }} className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold hover:bg-surface-tint shadow-sm mt-2 flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">save</span> Save & Sync Vitals
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* FOOTER */}
      <footer className="w-full bg-surface border-t border-surface-variant mt-8">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
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
