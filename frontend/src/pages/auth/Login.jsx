import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../../components/LanguageSelector';

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  
  const [tab, setTab] = useState('login');
  const [role, setRole] = useState('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [regForm, setRegForm] = useState({ name: '', phone: '', gender: 'male', role: 'patient', email: '', password: '' });

  const ROLES = [
    { key: 'patient', label: t('citizen') || 'Citizen', icon: 'person' },
    { key: 'health_worker', label: 'ASHA Worker', icon: 'volunteer_activism' },
    { key: 'doctor', label: 'Doctor', icon: 'medical_services' },
    { key: 'admin', label: 'Admin', icon: 'admin_panel_settings' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      const homes = { patient: '/patient', health_worker: '/health-worker', doctor: '/doctor', admin: '/admin' };
      navigate(homes[user.role] || '/login');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      if (msg.includes('Invalid credentials') || msg.includes('not found') || msg.includes('404')) {
        setError('Invalid credentials. Please check your email/password or register first.');
      } else if (msg.includes('Network') || msg.includes('ECONNREFUSED')) {
        setError('Server is not reachable. Please try again later.');
      } else {
        setError(msg);
      }
    } finally { setLoading(false); }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register(regForm);
      const homes = { patient: '/patient', health_worker: '/health-worker', doctor: '/doctor', admin: '/admin' };
      navigate(homes[user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="bg-[#fbfaf7] text-slate-800 min-h-[100dvh] lg:h-screen lg:max-h-screen flex flex-col justify-between relative overflow-x-hidden overflow-y-auto lg:overflow-hidden selection:bg-amber-100 selection:text-amber-900">
      {/* Subtle ambient glow background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-200/35 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-sky-200/25 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 left-1/4 w-96 h-96 bg-emerald-100/30 rounded-full blur-3xl"></div>
      </div>

      {/* HEADER */}
      <header className="relative z-50 w-full px-3.5 sm:px-6 lg:px-24 pt-2.5 sm:pt-3 pb-1.5 flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <img src="/images/logo-transparent.png" alt="SehatSaarthi" className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl object-cover shadow-sm notranslate shrink-0" translate="no" />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-brand font-black text-slate-900 tracking-tight text-xl sm:text-2xl lg:text-3xl leading-none notranslate" translate="no">SehatSaarthi</span>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">{t('govtPortal')}</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 hidden md:block mt-0.5">{t('nationalTeleHealth')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
          <LanguageSelector />
          <a href="tel:108" className="flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-[11px] sm:text-xs font-extrabold hover:bg-rose-100 transition-colors cursor-pointer shadow-xs">
            <span className="material-symbols-outlined text-[16px] sm:text-[18px] text-rose-600">call</span>
            <span className="hidden xs:inline sm:inline">{t('emergency')}</span>
          </a>
        </div>
      </header>

      {/* MAIN */}
      <main className="relative z-10 flex-1 flex items-center justify-center w-full px-3.5 sm:px-6 lg:px-16 xl:px-24 py-3 sm:py-6 lg:py-3">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-10 items-center w-full max-w-6xl mx-auto">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-2.5 sm:space-y-4">
            <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-amber-50/90 border border-amber-200/80 text-amber-900 text-xs font-semibold shadow-xs">
              <span className="material-symbols-outlined text-amber-600 text-[16px] sm:text-[18px]">verified</span>
              <span className="text-[11px] sm:text-xs">राष्ट्रीय स्वास्थ्य मिशन | National Health Mission</span>
            </div>
            <div>
              <h1 className="font-heading text-2xl sm:text-4xl lg:text-[42px] font-extrabold text-slate-900 tracking-tight leading-[1.18]">
                {t('accessibleHealthcare')}<br className="hidden sm:inline" /><span className="relative inline-block text-amber-600 font-black ml-1 sm:ml-0">{t('everyCitizen')}</span>
              </h1>
              <p className="text-slate-600 text-xs sm:text-base lg:text-lg mt-1 sm:mt-2 font-normal leading-relaxed max-w-xl">
                {t('authDesc')}
              </p>
            </div>
            {/* Illustration: shown on lg desktop, hidden on mobile */}
            <div className="hidden lg:block relative w-full max-w-xl bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
              <div className="w-full h-[260px] sm:h-[300px] rounded-xl overflow-hidden bg-gradient-to-br from-amber-50 via-sky-50 to-emerald-50 flex items-center justify-center">
                <img src="/images/auth-hero.jpg" alt="Tele-Consultation in Progress" className="w-full h-full object-cover" />
              </div>
              <div className="absolute bottom-4 left-5 right-5 bg-white/95 backdrop-blur-xs border border-slate-200/90 rounded-xl px-4 py-2.5 shadow-sm flex items-center justify-between text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-semibold text-slate-800">{t('liveClinics')}</span>
                </div>
                <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">{t('abdmIntegrated')}</span>
              </div>
            </div>
            {/* Value Badges */}
            <div className="hidden sm:grid grid-cols-3 gap-2 sm:gap-3 pt-1 max-w-xl">
              <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-600 font-medium">
                <span className="material-symbols-outlined text-amber-600 text-[18px] shrink-0">translate</span>
                <span>{t('languagesSupported')}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-600 font-medium">
                <span className="material-symbols-outlined text-amber-600 text-[18px] shrink-0">wifi_tethering</span>
                <span>{t('lowNetworkReady')}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-600 font-medium">
                <span className="material-symbols-outlined text-amber-600 text-[18px] shrink-0">lock</span>
                <span>{t('encrypted')}</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Auth Card */}
          <div className="lg:col-span-5 w-full flex justify-center">
            <div className={`w-full bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl shadow-slate-200/60 ${tab === 'register' ? 'form-card-register' : 'form-card-login'}`}>
              {/* Card Header */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="font-heading text-lg sm:text-xl font-bold text-slate-900">{t('citizenAccess')}</h2>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">{t('enterCredentials')}</p>
                </div>
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shrink-0">
                  <span className="material-symbols-outlined text-lg sm:text-xl">shield_person</span>
                </div>
              </div>

              {/* Login / Register Tabs */}
              <div className="flex bg-slate-100 p-1 rounded-xl mb-3 relative">
                <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm transition-all duration-300 ease-out ${tab === 'register' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'}`}></div>
                <button className={`relative z-10 flex-1 py-1.5 sm:py-2 text-xs font-bold rounded-lg transition-colors ${tab === 'login' ? 'text-slate-900 underline underline-offset-4 decoration-amber-500 decoration-2' : 'text-slate-400 hover:text-slate-600'}`}
                  onClick={() => setTab('login')} type="button">{t('signIn')}</button>
                <button className={`relative z-10 flex-1 py-1.5 sm:py-2 text-xs font-bold rounded-lg transition-colors ${tab === 'register' ? 'text-slate-900 underline underline-offset-4 decoration-amber-500 decoration-2' : 'text-slate-400 hover:text-slate-600'}`}
                  onClick={() => setTab('register')} type="button">{t('newCitizen')}</button>
              </div>

              {/* Role Selector */}
              {tab === 'login' && (
                <div className="mb-3">
                  <label className="block text-[10px] sm:text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider">{t('selectPortal')}</label>
                  <div className="grid grid-cols-4 gap-1 sm:gap-1.5 p-1 bg-slate-50 border border-slate-200 rounded-xl animate-fadeIn">
                    {ROLES.map(r => (
                      <button key={r.key} onClick={() => setRole(r.key)} type="button"
                        className={`flex flex-col items-center justify-center gap-0.5 sm:gap-1 py-1.5 sm:py-2 px-1 rounded-lg text-[9px] sm:text-[10px] font-bold transition-all ${role === r.key ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-white'}`}>
                        <span className="material-symbols-outlined text-[16px] sm:text-[18px]">{r.icon}</span>
                        <span className="truncate max-w-full leading-tight">{r.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {error && <div className="p-2.5 sm:p-3 mb-3 rounded-xl bg-rose-50 text-rose-700 text-xs sm:text-sm font-medium border border-rose-200">{error}</div>}

              <div className="form-height-guard">
              {tab === 'login' && (
                <form key="login" className="flex flex-col gap-2.5 sm:gap-3 animate-form-morph" onSubmit={handleSubmit}>
                  <div className="flex flex-col gap-1 sm:gap-1.5">
                    <label className="text-[12px] sm:text-[13px] font-bold text-slate-700">{t('emailMobile')}</label>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 group-focus-within:text-amber-500 transition-colors">
                        <span className="material-symbols-outlined text-[18px] sm:text-[20px]">badge</span>
                      </span>
                      <input className="w-full pl-10 sm:pl-11 pr-3.5 py-2.5 sm:py-2.5 bg-white border border-slate-300 rounded-xl text-base sm:text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-medium shadow-sm hover:border-slate-400"
                        placeholder="your@email.com or 9876543210" required type="text" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 sm:gap-1.5">
                    <label className="text-[12px] sm:text-[13px] font-bold text-slate-700">{t('passwordPin')}</label>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 group-focus-within:text-amber-500 transition-colors">
                        <span className="material-symbols-outlined text-[18px] sm:text-[20px]">lock</span>
                      </span>
                      <input className="w-full pl-10 sm:pl-11 pr-3.5 py-2.5 sm:py-2.5 bg-white border border-slate-300 rounded-xl text-base sm:text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-medium shadow-sm hover:border-slate-400"
                        placeholder="••••••••" required type="password" value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-[13px] pt-0.5">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium">
                      <input defaultChecked className="w-4 h-4 rounded border-slate-300 accent-amber-500 focus:ring-amber-500" type="checkbox" />
                      <span>{t('rememberMe')}</span>
                    </label>
                    <a className="font-bold text-amber-600 hover:text-amber-700 hover:underline" href="#">{t('forgotPassword')}</a>
                  </div>
                  <button className="w-full py-3 sm:py-2.5 px-4 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-sm sm:text-[14px] rounded-xl shadow-lg shadow-amber-500/30 transition-all flex items-center justify-center gap-2 mt-1 disabled:opacity-70"
                    type="submit" disabled={loading}>
                    {loading ? <span className="material-symbols-outlined animate-spin text-[18px] sm:text-[20px]">progress_activity</span> : null}
                    <span>{loading ? t('authenticating') : t('signInBtn')}</span>
                    {!loading && <span className="material-symbols-outlined text-[18px] sm:text-[20px]">arrow_forward</span>}
                  </button>
                </form>
              )}

              {tab === 'register' && (
                <form key="register" className="animate-form-morph" onSubmit={handleRegisterSubmit}>
                  <div className="grid grid-cols-2 gap-2 sm:gap-x-3 sm:gap-y-2.5">
                    <div className="col-span-2 sm:col-span-1 flex flex-col gap-1">
                      <label className="text-[11px] sm:text-[12px] font-bold text-slate-700">{t('fullName')}</label>
                      <input className="w-full px-3 py-2 sm:py-2 bg-white border border-slate-300 rounded-xl text-base sm:text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-medium shadow-sm hover:border-slate-400"
                        placeholder="Full name" required type="text" value={regForm.name} onChange={e => setRegForm({...regForm, name: e.target.value})} />
                    </div>
                    <div className="col-span-2 sm:col-span-1 flex flex-col gap-1">
                      <label className="text-[11px] sm:text-[12px] font-bold text-slate-700">{t('emailMobile')}</label>
                      <input className="w-full px-3 py-2 sm:py-2 bg-white border border-slate-300 rounded-xl text-base sm:text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-medium shadow-sm hover:border-slate-400"
                        placeholder="your@email.com" required type="email" value={regForm.email} onChange={e => setRegForm({...regForm, email: e.target.value})} />
                    </div>
                    <div className="col-span-2 sm:col-span-1 flex flex-col gap-1">
                      <label className="text-[11px] sm:text-[12px] font-bold text-slate-700">{t('mobileNumber')}</label>
                      <input className="w-full px-3 py-2 sm:py-2 bg-white border border-slate-300 rounded-xl text-base sm:text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-medium shadow-sm hover:border-slate-400"
                        placeholder="10 digit number" required type="text" value={regForm.phone} onChange={e => setRegForm({...regForm, phone: e.target.value})} />
                    </div>
                    <div className="col-span-2 sm:col-span-1 flex flex-col gap-1">
                      <label className="text-[11px] sm:text-[12px] font-bold text-slate-700">{t('password')}</label>
                      <input className="w-full px-3 py-2 sm:py-2 bg-white border border-slate-300 rounded-xl text-base sm:text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-medium shadow-sm hover:border-slate-400"
                        placeholder="••••••••" required type="password" value={regForm.password} onChange={e => setRegForm({...regForm, password: e.target.value})} />
                    </div>
                    <div className="col-span-1 flex flex-col gap-1">
                      <label className="text-[11px] sm:text-[12px] font-bold text-slate-700">{t('role')}</label>
                      <select className="w-full px-2.5 sm:px-3 py-2 sm:py-2 bg-white border border-slate-300 rounded-xl text-base sm:text-[14px] text-slate-900 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-medium shadow-sm hover:border-slate-400"
                        value={regForm.role} onChange={e => setRegForm({...regForm, role: e.target.value})}>
                        <option value="patient">Citizen</option>
                        <option value="health_worker">ASHA Worker</option>
                        <option value="doctor">Doctor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div className="col-span-1 flex flex-col gap-1">
                      <label className="text-[11px] sm:text-[12px] font-bold text-slate-700">{t('gender')}</label>
                      <select className="w-full px-2.5 sm:px-3 py-2 sm:py-2 bg-white border border-slate-300 rounded-xl text-base sm:text-[14px] text-slate-900 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-medium shadow-sm hover:border-slate-400"
                        value={regForm.gender} onChange={e => setRegForm({...regForm, gender: e.target.value})}>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <button className="w-full py-3 sm:py-2.5 px-4 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-sm sm:text-[14px] rounded-xl shadow-lg shadow-amber-500/30 transition-all flex items-center justify-center gap-2 mt-2.5 disabled:opacity-70"
                    type="submit" disabled={loading}>
                    {loading ? <span className="material-symbols-outlined animate-spin text-[18px] sm:text-[20px]">progress_activity</span> : null}
                    <span>{loading ? t('creatingAccount') : t('createAccount')}</span>
                    {!loading && <span className="material-symbols-outlined text-[18px] sm:text-[20px]">how_to_reg</span>}
                  </button>
                </form>
              )}
              </div>

              {/* Help Section */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-start gap-2.5 bg-amber-50/60 -mx-1 -mb-2 sm:-mx-2 sm:-mb-4 p-2.5 rounded-b-2xl">
                <span className="material-symbols-outlined text-amber-700 text-lg sm:text-xl shrink-0 mt-0.5">contact_support</span>
                <div className="text-[11px] sm:text-xs text-slate-600 leading-tight">
                  <span className="font-bold text-slate-800">{t('needHelp')}</span>
                  <p className="mt-0.5">{t('helpDesc')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 w-full border-t border-slate-200/80 bg-white/80 backdrop-blur-xs py-2 px-3.5 sm:px-6 lg:px-24 text-center mt-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] sm:text-xs text-slate-500 gap-1 sm:gap-2">
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            <span className="font-semibold text-slate-700 notranslate" translate="no">SehatSaarthi Citizen Portal</span>
            <span className="hidden sm:inline">•</span>
            <span>Ministry of Health &amp; Family Welfare, Govt. of India</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Emergency Helplines: <strong className="text-slate-800 font-semibold">108 / 104 / 112</strong></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
