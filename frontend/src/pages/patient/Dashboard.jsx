import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import PatientNavbar from '../../components/PatientNavbar';

export default function PatientDashboard() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'dashboard');

  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state]);

  useEffect(() => {
    api.get('/patient/dashboard').then(r => setData(r.data.data)).catch(() => {});
  }, []);

  const vitals = data?.profile?.vitals;

  return (
    <div className="bg-surface-container-lowest text-on-surface font-sans min-h-screen">
      <PatientNavbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* MAIN */}
      <main className="w-full bg-surface-container-lowest px-6 lg:px-12 xl:px-16 pt-28">
        {activeTab === 'dashboard' && (
          <div className="flex flex-col w-full pb-8">
            {/* Welcome Header */}
            <div className="w-full py-5 mb-3 bg-gradient-to-r from-amber-500/10 via-amber-100/30 to-transparent p-5 sm:p-6 rounded-2xl border border-amber-200/80 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-amber-300/80 text-amber-900 text-xs font-bold mb-2 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Ayushman Bharat Digital Health Grid</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
                    Hello, <span className="notranslate" translate="no">{user?.name?.split(' ')[0] || 'Patient'}</span> <span className="text-3xl sm:text-4xl">👋</span>
                  </h1>
                  <p className="text-base sm:text-lg text-slate-700 font-semibold mt-1">
                    Your health, our priority — <span className="text-amber-800 underline decoration-amber-400 decoration-2">Sitapur Rural Sub-Centre</span>
                  </p>
                </div>
                <div className="inline-flex items-center gap-2.5 bg-white border-2 border-emerald-400 px-4 py-2.5 rounded-2xl text-emerald-900 text-sm font-extrabold shadow-sm self-start md:self-auto">
                  <span className="relative flex h-3 w-3 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
                  </span>
                  <span>{t('activeCitizenHealthRecord')}</span>
                </div>
              </div>
            </div>

            {/* Primary Care Services */}
            <section className="mb-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-sm shrink-0">
                    <span className="material-symbols-outlined text-[22px]">apps</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{t('primaryCareServices')}</h2>
                      <span className="bg-amber-100 text-amber-900 text-xs px-2.5 py-0.5 rounded-full border border-amber-300 font-extrabold hidden sm:inline">{t('fastAccess')}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium">{t('selectAnyServiceToBegin')}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { icon: 'calendar_month', title: t('bookTeleConsult'), desc: t('consultChc'), badge: t('freeGovService'), action: () => navigate('/patient/doctors'), color: 'amber', bg: 'from-amber-500/10 to-amber-50/50' },
                  { icon: 'medication', title: t('orderFreeMedicines'), desc: t('janAushadhiRefill'), badge: t('subsidizedFree'), action: () => navigate('/patient/medicines'), color: 'emerald', bg: 'from-emerald-500/10 to-emerald-50/50' },
                  { icon: 'science', title: t('labTestsReports'), desc: t('diagnosticHistoryVitals'), badge: t('instantSync'), action: () => setActiveModal('lab-tests'), color: 'sky', bg: 'from-sky-500/10 to-sky-50/50' },
                  { icon: 'near_me', title: t('findNearestPhc'), desc: t('dispensariesSubCentres'), badge: 'Sitapur Ward 4', action: () => setActiveModal('find-phc'), color: 'violet', bg: 'from-violet-500/10 to-violet-50/50' },
                ].map(card => (
                  <button 
                    key={card.title} 
                    onClick={card.action} 
                    className={`group text-left bg-white hover:bg-slate-50/80 p-6 rounded-2xl border-2 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-200 flex flex-col justify-between focus:outline-none focus:ring-4 focus:ring-amber-500/30 relative overflow-hidden ${
                      card.color === 'amber' ? 'border-amber-300 hover:border-amber-500' :
                      card.color === 'emerald' ? 'border-emerald-300 hover:border-emerald-500' :
                      card.color === 'sky' ? 'border-sky-300 hover:border-sky-500' :
                      'border-violet-300 hover:border-violet-500'
                    }`} 
                    type="button"
                  >
                    <div className="flex items-center justify-between w-full mb-5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border-2 transition-all ${
                        card.color === 'amber' ? 'bg-amber-50 text-amber-700 border-amber-200 group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-500' :
                        card.color === 'emerald' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500' :
                        card.color === 'sky' ? 'bg-sky-50 text-sky-700 border-sky-200 group-hover:bg-sky-500 group-hover:text-white group-hover:border-sky-500' :
                        'bg-violet-50 text-violet-700 border-violet-200 group-hover:bg-violet-500 group-hover:text-white group-hover:border-violet-500'
                      }`}>
                        <span className="material-symbols-outlined text-[32px]">{card.icon}</span>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-600 group-hover:text-white group-hover:bg-amber-500 group-hover:border-amber-500 transition-all shadow-xs">
                        <span className="material-symbols-outlined text-[20px] font-bold group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-xl font-extrabold text-slate-900 group-hover:text-amber-700 transition-colors block mb-1.5 leading-snug">{card.title}</span>
                      <p className="text-sm text-slate-600 font-medium leading-relaxed mb-4">{card.desc}</p>
                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 text-xs font-extrabold px-3 py-1.5 rounded-full border border-amber-300 shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                        {card.badge}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Upcoming Care */}
            <section className="mb-10">
              <div className="bg-white p-6 sm:p-7 rounded-3xl border-2 border-amber-300/80 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-slate-200 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center shrink-0 shadow-sm">
                      <span className="material-symbols-outlined text-[22px]">event_upcoming</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Your Upcoming Care</h2>
                        <span className="bg-amber-600 text-white text-xs font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-xs">Next 48 Hours</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 font-medium">Verified doctor tele-consultation queue</p>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-2.5 bg-emerald-50 border-2 border-emerald-300 px-3.5 py-1.5 rounded-full text-emerald-900 text-xs font-extrabold self-start sm:self-auto shadow-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
                    <span>Live Queue Monitored • लाइव टोकन</span>
                  </div>
                </div>
                {data?.upcomingAppointments?.length > 0 ? (
                  data.upcomingAppointments.map(a => (
                    <div key={a._id} className="bg-amber-50/40 hover:bg-amber-50/70 p-5 sm:p-6 rounded-2xl border-2 border-amber-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-4 transition-all">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                        <div className="flex flex-col items-center justify-center w-24 py-3 rounded-2xl bg-white border-2 border-amber-400 text-center shrink-0 shadow-sm">
                          <span className="text-xs text-amber-800 font-extrabold uppercase tracking-wider">{new Date(a.date).toLocaleDateString('en', {weekday:'short'})}</span>
                          <span className="text-2xl font-black text-amber-950 leading-tight">{a.timeSlot}</span>
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                            <span className="text-xl font-extrabold text-slate-900 notranslate" translate="no">{a.doctor?.name || 'Dr. Rajesh Sharma'}</span>
                            <span className="bg-sky-100 text-sky-900 font-extrabold px-3 py-1 rounded-full text-xs border border-sky-300">Tele-Consult</span>
                            <span className="bg-emerald-100 text-emerald-900 font-black px-3.5 py-1 rounded-full text-xs border-2 border-emerald-400 shadow-xs notranslate" translate="no">Token #{a.tokenNumber}</span>
                          </div>
                          <p className="text-sm text-slate-700 font-semibold">General Medicine • ABHA Linked Consultation</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 pt-2 lg:pt-0">
                        <button className="h-12 px-5 rounded-xl border-2 border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-sm font-bold transition-all shadow-xs" type="button">View Vitals & Notes</button>
                        <button className="h-12 px-6 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-sm font-extrabold transition-all flex items-center gap-2 shadow-sm transform hover:-translate-y-0.5" type="button">
                          <span className="material-symbols-outlined text-[22px]">videocam</span>Enter Consultation
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-amber-50/40 hover:bg-amber-50/70 p-5 sm:p-6 rounded-2xl border-2 border-amber-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5 transition-all">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                      <div className="flex flex-col items-center justify-center w-24 py-3 rounded-2xl bg-white border-2 border-amber-400 text-center shrink-0 shadow-sm">
                        <span className="text-xs text-amber-800 font-extrabold uppercase tracking-wider">Today</span>
                        <span className="text-2xl font-black text-amber-950 leading-tight">4:00</span>
                        <span className="text-xs text-amber-800 font-black uppercase">PM</span>
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                          <span className="text-xl font-extrabold text-slate-900 notranslate" translate="no">Dr. Rajesh Sharma</span>
                          <span className="bg-sky-100 text-sky-900 font-extrabold px-3 py-1 rounded-full text-xs border border-sky-300">Tele-Consult</span>
                          <span className="bg-emerald-100 text-emerald-900 font-black px-3.5 py-1 rounded-full text-xs border-2 border-emerald-400 shadow-xs notranslate" translate="no">Token #04</span>
                        </div>
                        <p className="text-sm text-slate-700 font-semibold">General Medicine • CHC Sitapur Central • ABHA Linked Consultation</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 pt-2 lg:pt-0">
                      <button className="h-12 px-5 rounded-xl border-2 border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-sm font-bold transition-all shadow-xs" type="button">View Vitals & Notes</button>
                        <button className="h-12 px-6 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-sm font-extrabold transition-all flex items-center gap-2 shadow-sm transform hover:-translate-y-0.5" type="button">
                          <span className="material-symbols-outlined text-[22px]">videocam</span>Enter Consultation
                        </button>
                    </div>
                  </div>
                )}
              </div>
            </section>

              {/* Bottom Grid: Camp & ASHA Companion */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Village Health Camp */}
                <div className="bg-white p-6 sm:p-7 rounded-3xl border-2 border-slate-200/90 hover:border-amber-400 shadow-sm flex flex-col justify-between gap-5 transition-all duration-200">
                  <div>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-amber-50 border-2 border-amber-200 text-amber-700 flex items-center justify-center shrink-0 shadow-xs">
                        <span className="material-symbols-outlined text-[32px]">vaccines</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-xs uppercase tracking-wider text-slate-500 font-extrabold">Village Health Camp</span>
                          <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black px-3 py-0.5 rounded-full shadow-xs">
                            <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                            This Thursday • इस गुरुवार
                          </span>
                        </div>
                        <h3 className="text-xl font-extrabold text-slate-900 leading-snug">Immunization &amp; Maternal Health Checkup</h3>
                        <p className="text-sm text-slate-600 font-medium mt-0.5">Anganwadi Centre 3 • Walk-in free for all mothers and infants</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs font-semibold text-slate-700 flex flex-wrap gap-2">
                      <span className="bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-xs text-slate-800">✓ Free Vaccination (Polio/BCG/TT)</span>
                      <span className="bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-xs text-slate-800">✓ BP, Sugar &amp; Weight Check</span>
                      <span className="bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-xs text-slate-800">✓ Nutrition Supplements Refill</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                      <span className="material-symbols-outlined text-[18px] text-amber-600">location_on</span>
                      <span>Anganwadi Centre 3 (Ward 4)</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setActiveModal('find-phc')}
                      className="h-11 px-4 rounded-xl border-2 border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[18px] text-amber-600">near_me</span>
                      <span>Find Centre</span>
                    </button>
                  </div>
                </div>

                {/* ASHA Companion Card */}
                <div className="bg-white p-6 sm:p-7 rounded-3xl border-2 border-amber-300 hover:border-amber-500 shadow-sm flex flex-col justify-between gap-5 transition-all duration-200">
                  <div>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative shrink-0">
                        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-800 border-2 border-amber-400 flex items-center justify-center font-bold shadow-xs">
                          <span className="material-symbols-outlined text-[32px] text-amber-600">health_and_safety</span>
                        </div>
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-xs" title="Active in Village"></span>
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-xs uppercase tracking-wider text-slate-500 font-extrabold">Village ASHA Companion</span>
                          <span className="inline-flex items-center gap-1 text-emerald-900 text-xs font-extrabold bg-emerald-50 px-3 py-0.5 rounded-full border border-emerald-300 shadow-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Active Today • उपलब्ध
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-extrabold text-slate-900 leading-tight notranslate" translate="no">Sunita Devi</h3>
                          <span className="material-symbols-outlined text-amber-600 text-[20px]" title="Govt Certified ASHA">verified</span>
                        </div>
                        <p className="text-xs text-slate-600 font-semibold mt-0.5">Govt Certified Field Health Worker • Sitapur Ward 4</p>
                      </div>
                    </div>

                    <div className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200/80 text-xs font-medium text-slate-700 leading-relaxed">
                      Assigned for home visits, child immunizations, Jan Aushadhi refills &amp; emergency PHC escort.
                      <div className="mt-2 text-xs font-extrabold text-amber-950 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-amber-700">schedule</span>
                        <span>Working Hours: 8:00 AM – 6:00 PM</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                    <a 
                      href="tel:9876543210" 
                      className="h-12 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-sm font-extrabold flex items-center justify-center gap-2 shadow-sm transition-all text-center"
                    >
                      <span className="material-symbols-outlined text-[20px]">call</span>
                      <span>Call Sunita Devi</span>
                    </a>
                    <button 
                      type="button" 
                      onClick={() => alert('Request sent to ASHA worker Sunita Devi! She will contact you shortly.')}
                      className="h-12 px-4 rounded-xl bg-white border-2 border-slate-300 hover:bg-slate-100 text-slate-800 text-sm font-extrabold flex items-center justify-center gap-2 transition-all shadow-xs text-center"
                    >
                      <span className="material-symbols-outlined text-[20px] text-amber-600">home_health</span>
                      <span>Request Visit</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
        )}

        {activeTab === 'profile' && (
          <div className="py-6 animate-fadeIn max-w-4xl mx-auto">
            {/* Digital ABHA Card */}
            <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-amber-500/20 mb-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/20 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                      <span className="material-symbols-outlined text-white text-[28px]">health_and_safety</span>
                    </div>
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-amber-100 block">National Health Authority • ABDM</span>
                      <h3 className="text-xl font-black text-white">Digital Ayushman Health Card</h3>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-2 bg-emerald-500/90 text-white px-3.5 py-1 rounded-full text-xs font-extrabold shadow-sm border border-emerald-300 self-start sm:self-auto">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                    <span>Verified Citizen Record</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
                  <div className="sm:col-span-2 space-y-3">
                    <div>
                      <span className="text-xs uppercase font-extrabold text-amber-200 tracking-wider">Citizen Full Name</span>
                      <p className="text-2xl font-black text-white">{user?.name || 'Aditya Sharma'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs uppercase font-extrabold text-amber-200 tracking-wider">ABHA Number</span>
                        <p className="text-lg font-mono font-black text-amber-100">{user?.abhaId || '91-4820-1940-2810'}</p>
                      </div>
                      <div>
                        <span className="text-xs uppercase font-extrabold text-amber-200 tracking-wider">Mobile Contact</span>
                        <p className="text-base font-extrabold text-white">{user?.phone || '+91 9876543210'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center flex flex-col items-center justify-center">
                    <span className="material-symbols-outlined text-white text-[48px] mb-1">qr_code_2</span>
                    <span className="text-[11px] font-bold text-amber-100">Scan at any PHC / CHC</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Details & SC Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-slate-200 shadow-sm mb-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border-2 border-amber-200 text-amber-700 flex items-center justify-center font-bold">
                    <span className="material-symbols-outlined text-[22px]">person</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">{t('personalDetails')}</h2>
                    <p className="text-xs text-slate-500 font-medium">Personal identity &amp; healthcare centre links</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveModal('edit-profile')} 
                  className="bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white px-5 py-2.5 rounded-xl text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  <span>{t('editProfileInformation')}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <span className="text-xs uppercase font-extrabold text-slate-500 block mb-1">{t('fullName')}</span>
                  <p className="text-base font-extrabold text-slate-900">{user?.name || 'Aditya Sharma'}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <span className="text-xs uppercase font-extrabold text-slate-500 block mb-1">{t('abhaId')}</span>
                  <p className="text-base font-mono font-extrabold text-amber-900">{user?.abhaId || '91-4820-1940-2810'}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <span className="text-xs uppercase font-extrabold text-slate-500 block mb-1">{t('mobileNumber')}</span>
                  <p className="text-base font-extrabold text-slate-900">{user?.phone || '+91 9876543210'}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <span className="text-xs uppercase font-extrabold text-slate-500 block mb-1">{t('linkedSubCentre')}</span>
                  <p className="text-base font-extrabold text-slate-900">Sitapur Rural SC (Ward 4)</p>
                </div>
              </div>
            </div>
            
            {/* Bluetooth Connected Devices */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border-2 border-amber-200 text-amber-700 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[22px]">watch</span>
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">{t('connectedDevicesSync')}</h3>
                  <p className="text-xs text-slate-500 font-medium">Auto-sync vitals (BP, SpO2, Pulse) from portable medical kits</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 font-medium mb-5">{t('noPortableDevices')}</p>
              <button 
                onClick={() => alert('Searching for nearby Bluetooth Vitals Monitors... Make sure device is powered ON.')}
                className="bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white px-5 py-3 rounded-xl text-sm font-extrabold shadow-sm transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">bluetooth_searching</span>
                <span>{t('connectBluetoothMonitor')}</span>
              </button>
            </div>
          </div>
        )}
      </main>

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
                AarogyaNet delivers verified public clinical connectivity across rural dispensaries, district hospitals, and tertiary research institutes under the National Digital Health Framework.
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

      {/* Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-surface-variant flex items-center justify-between bg-surface-container-low">
              <h3 className="text-headline-sm font-bold text-on-surface">
                {activeModal === 'lab-tests' && 'Lab Tests & Reports'}
                {activeModal === 'find-phc' && 'Find Nearest PHC'}
                {activeModal === 'edit-profile' && 'Edit Profile Information'}
              </h3>
              <button onClick={() => setActiveModal(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-variant text-on-surface-variant transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto">
                {/* Book Consult */}
                {activeModal === 'book-consult' && (
                  <div className="flex flex-col gap-4">
                    <p className="text-body-md text-secondary">Select a specialty to consult with a doctor from your district hospital or state medical college.</p>
                    <select className="w-full bg-surface-container px-4 py-3 rounded-xl border border-surface-variant text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-bold">
                      <option>General Medicine</option>
                      <option>Pediatrics</option>
                      <option>Gynecology</option>
                      <option>Dermatology</option>
                      <option>Mental Health</option>
                    </select>
                    <button onClick={() => { setActiveModal(null); alert('Appointment Booked!'); }} className="w-full bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white py-3.5 rounded-xl font-bold shadow-sm transition-all mt-2">Find Next Available Doctor</button>
                  </div>
                )}
                {/* Order Meds */}
                {activeModal === 'order-meds' && (
                  <div className="flex flex-col gap-4">
                    <div className="bg-primary-container/20 p-4 rounded-xl border border-primary-container">
                      <p className="text-body-md text-on-surface font-bold">Upload your prescription or select from past records to order medicines from Jan Aushadhi Kendra.</p>
                    </div>
                    <button className="w-full bg-surface-container px-4 py-3 rounded-xl border border-surface-variant text-on-surface text-sm hover:bg-surface-variant transition-colors flex items-center justify-between font-bold">
                      <span>Select Past Prescription</span>
                      <span className="material-symbols-outlined text-primary">history</span>
                    </button>
                    <button className="w-full bg-surface-container px-4 py-3 rounded-xl border border-surface-variant text-on-surface text-sm hover:bg-surface-variant transition-colors flex items-center justify-between font-bold">
                      <span>Upload New Prescription (PDF/Image)</span>
                      <span className="material-symbols-outlined text-primary">upload_file</span>
                    </button>
                    <button onClick={() => { setActiveModal(null); alert('Order Placed!'); }} className="w-full bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white py-3.5 rounded-xl font-bold shadow-sm transition-all mt-2">Proceed to Order</button>
                  </div>
                )}
                {/* Lab Tests */}
                {activeModal === 'lab-tests' && (
                  <div className="flex flex-col gap-3">
                    <p className="text-body-md text-secondary mb-2">Recent diagnostic reports synchronized from your PHC.</p>
                    <div className="p-4 rounded-xl border border-surface-variant flex items-center justify-between">
                      <div>
                        <p className="font-bold text-on-surface text-sm">Complete Blood Count (CBC)</p>
                        <p className="text-[12px] text-secondary">Ordered by Dr. Sharma • 2 days ago</p>
                      </div>
                      <button className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
                        <span className="material-symbols-outlined text-[18px]">download</span> PDF
                      </button>
                    </div>
                    <div className="p-4 rounded-xl border border-surface-variant flex items-center justify-between">
                      <div>
                        <p className="font-bold text-on-surface text-sm">HbA1c & Fasting Sugar</p>
                        <p className="text-[12px] text-secondary">Ordered by Dr. Verma • 1 month ago</p>
                      </div>
                      <button className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
                        <span className="material-symbols-outlined text-[18px]">download</span> PDF
                      </button>
                    </div>
                  </div>
                )}
                {/* Find PHC */}
                {activeModal === 'find-phc' && (
                  <div className="flex flex-col gap-4">
                    <input className="w-full bg-surface-container px-4 py-3 rounded-xl border border-surface-variant text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-bold" placeholder="Search by Pincode or Village Name..." />
                    <div className="bg-surface-container-low p-4 rounded-xl border border-primary-container">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-primary">Sitapur Ward 4 Sub-Centre</p>
                          <p className="text-sm text-secondary">1.2 km away • Govt. Dispensary</p>
                        </div>
                        <span className="bg-primary-container text-on-primary-container px-2 py-0.5 rounded text-[11px] font-bold">Nearest</span>
                      </div>
                      <p className="text-[13px] text-on-surface-variant mb-3">Operating Hours: 9:00 AM - 4:00 PM</p>
                      <div className="flex gap-2">
                        <button className="flex-1 bg-surface-container border border-surface-variant text-on-surface py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-1 hover:bg-surface-variant"><span className="material-symbols-outlined text-[16px]">directions</span> Get Directions</button>
                        <button className="flex-1 bg-surface-container border border-surface-variant text-on-surface py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-1 hover:bg-surface-variant"><span className="material-symbols-outlined text-[16px]">call</span> Call Center</button>
                      </div>
                    </div>
                  </div>
                )}
                {/* Edit Profile */}
                {activeModal === 'edit-profile' && (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-label-sm font-bold text-secondary">{t('fullName')}</label>
                      <input type="text" defaultValue={user?.name || 'Aditya Sharma'} className="w-full bg-surface-container px-4 py-3 rounded-xl border border-surface-variant text-on-surface text-sm focus:outline-none focus:border-primary font-bold" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-label-sm font-bold text-secondary">{t('mobileNumber')}</label>
                      <input type="tel" defaultValue={user?.phone || '+91 9876543210'} className="w-full bg-surface-container px-4 py-3 rounded-xl border border-surface-variant text-on-surface text-sm focus:outline-none focus:border-primary font-bold" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-label-sm font-bold text-secondary">Address / Ward</label>
                      <input type="text" defaultValue="Sitapur Rural (Ward 4)" className="w-full bg-surface-container px-4 py-3 rounded-xl border border-surface-variant text-on-surface text-sm focus:outline-none focus:border-primary font-bold" />
                    </div>
                    <button onClick={() => { setActiveModal(null); alert('Profile updated successfully!'); }} className="w-full bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white py-3.5 rounded-xl font-bold shadow-sm transition-all mt-2">Save Changes</button>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
