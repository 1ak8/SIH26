import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../../components/LanguageSelector';
import api from '../../services/api';

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  
  const [tab, setTab] = useState('login');
  const [role, setRole] = useState('patient');
  const [email, setEmail] = useState('patient@test.com');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regForm, setRegForm] = useState({ name: '', phone: '', gender: 'male', role: 'patient', email: '', password: '' });

  // Forgot Password States
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1 = input identity, 2 = verify OTP & new pass, 3 = success
  const [forgotIdentity, setForgotIdentity] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotPass, setShowForgotPass] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [receivedOtpHint, setReceivedOtpHint] = useState('');

  const openForgotPasswordModal = () => {
    setForgotIdentity(email || '');
    setForgotStep(1);
    setForgotOtp('');
    setForgotNewPassword('');
    setForgotConfirmPassword('');
    setForgotError('');
    setForgotSuccess('');
    setReceivedOtpHint('');
    setForgotModalOpen(true);
  };

  const handleSendForgotOtp = async (e) => {
    e.preventDefault();
    if (!forgotIdentity) {
      setForgotError('Please enter your registered email or mobile number.');
      return;
    }
    setForgotLoading(true);
    setForgotError('');
    setForgotSuccess('');
    try {
      const res = await api.post('/auth/forgot-password', { identity: forgotIdentity });
      if (res.data?.success) {
        setForgotSuccess(res.data.message || 'OTP sent successfully!');
        setReceivedOtpHint(res.data.otp || '849201');
        setForgotStep(2);
      }
    } catch (err) {
      setForgotError(err.response?.data?.message || 'No account found with this email or mobile number.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!forgotOtp) {
      setForgotError('Please enter the 6-digit verification code.');
      return;
    }
    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      setForgotError('New password must be at least 6 characters long.');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('New password and confirm password do not match.');
      return;
    }

    setForgotLoading(true);
    setForgotError('');
    try {
      const res = await api.post('/auth/reset-password', {
        identity: forgotIdentity,
        otp: forgotOtp,
        newPassword: forgotNewPassword,
      });

      if (res.data?.success) {
        setForgotStep(3);
        setPassword(forgotNewPassword);
        setEmail(forgotIdentity);
      }
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const ROLE_CREDS = {
    patient: { email: 'patient@test.com', pass: '123456' },
    health_worker: { email: 'asha@test.com', pass: '123456' },
    doctor: { email: 'doctor@test.com', pass: '123456' },
    admin: { email: 'admin@test.com', pass: '123456' },
  };

  const handleRoleSelect = (roleKey) => {
    setRole(roleKey);
    if (ROLE_CREDS[roleKey]) {
      setEmail(ROLE_CREDS[roleKey].email);
      setPassword(ROLE_CREDS[roleKey].pass);
    }
  };

  const ROLES = [
    { key: 'patient', label: 'Patient', icon: 'person', subtitle: 'Citizen Access' },
    { key: 'health_worker', label: 'Health Worker', icon: 'medical_services', subtitle: 'ASHA / ANM' },
    { key: 'doctor', label: 'Doctor', icon: 'stethoscope', subtitle: 'CHC / Tele-Desk' },
    { key: 'admin', label: 'Admin', icon: 'admin_panel_settings', subtitle: 'Govt Officer' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email.trim(), password.trim());
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
    <div className="bg-slate-50 text-slate-800 min-h-[100dvh] w-full lg:h-screen lg:max-h-screen flex flex-col justify-between relative overflow-x-hidden overflow-y-auto lg:overflow-hidden selection:bg-teal-100 selection:text-teal-900">
      {/* Precision Ambient Light Fields */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[520px] h-[520px] bg-teal-200/30 rounded-full blur-[100px]"></div>
        <div className="absolute top-1/4 right-0 w-[420px] h-[420px] bg-sky-200/25 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-32 left-1/3 w-[600px] h-[600px] bg-emerald-100/30 rounded-full blur-[110px]"></div>
      </div>

      {/* HEADER */}
      <header className="relative z-50 w-full px-4 sm:px-6 lg:px-20 pt-3 pb-2 flex items-center justify-between gap-4 glass-nav bg-white/70 backdrop-blur-md border-b border-slate-200/80">
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-teal-700 via-teal-600 to-emerald-500 p-0.5 shadow-md shadow-teal-700/20 flex items-center justify-center">
            <img src="/images/logo-transparent.png" alt="SehatSaarthi" className="w-full h-full rounded-[14px] object-cover notranslate bg-white" translate="no" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-brand font-black text-slate-900 tracking-tight text-xl sm:text-2xl leading-none notranslate" translate="no">SehatSaarthi</span>
              <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 hidden sm:inline">
                National Portal
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium tracking-tight mt-0.5">{t('nationalTeleHealth')}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 ml-auto">
          <LanguageSelector />
          <a href="tel:108" className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 bg-rose-50 text-rose-700 border border-rose-200/90 rounded-xl text-xs font-black hover:bg-rose-100 hover:border-rose-300 transition-all cursor-pointer shadow-xs active:scale-95">
            <span className="material-symbols-outlined text-[17px] text-rose-600">call</span>
            <span className="font-mono">108</span>
            <span className="hidden sm:inline font-bold">• {t('emergency')}</span>
          </a>
        </div>
      </header>

      {/* MAIN CONTENT STAGE */}
      <main className="relative z-10 flex-1 flex items-center justify-center w-full px-4 sm:px-6 lg:px-20 py-4 lg:py-2 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full max-w-7xl mx-auto">
          
          {/* LEFT COLUMN: Hero & Visual Credibility */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-4">
            <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full bg-teal-50/90 border border-teal-200/90 text-teal-900 text-xs font-bold shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span>राष्ट्रीय स्वास्थ्य मिशन • Ayushman Bharat Digital Mission (ABDM)</span>
            </div>

            <div>
              <h1 className="font-heading text-3xl sm:text-4xl lg:text-[44px] font-black text-slate-900 tracking-tight leading-[1.14]">
                Next-Gen Healthcare For <br />
                <span className="bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 bg-clip-text text-transparent">Every Indian Citizen.</span>
              </h1>
              <p className="text-slate-600 text-sm sm:text-base lg:text-lg mt-2 font-medium leading-relaxed max-w-xl">
                {t('authDesc')}
              </p>
            </div>

            {/* High-Tech Illustration & HUD Badge */}
            <div className="relative w-full max-w-xl bg-white p-2.5 rounded-3xl border border-slate-200/90 shadow-lg shadow-slate-200/40 transition-all hover:shadow-xl group">
              <div className="w-full h-[180px] sm:h-[240px] lg:h-[280px] rounded-2xl overflow-hidden bg-gradient-to-br from-teal-50 via-sky-50 to-emerald-50 flex items-center justify-center relative">
                <img src="/images/auth-hero.jpg" alt="Tele-Consultation in Progress" className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>
              </div>
              
              <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl px-4 py-2.5 shadow-md flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse ring-4 ring-emerald-100"></span>
                  <div>
                    <span className="font-bold text-slate-900 block leading-tight">{t('liveClinics')}</span>
                    <span className="text-[10px] text-slate-500">Sitapur &amp; 14,800+ Rural Centres</span>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 font-bold border border-teal-200/80">
                  <span className="material-symbols-outlined text-[16px] text-teal-600">verified</span>
                  <span>{t('abdmIntegrated')}</span>
                </div>
              </div>
            </div>

            {/* Feature Pills */}
            <div className="grid grid-cols-3 gap-2.5 max-w-xl pt-1">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/80 border border-slate-200 text-xs text-slate-700 font-semibold shadow-2xs">
                <span className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center material-symbols-outlined text-[17px] shrink-0">translate</span>
                <span className="truncate">{t('languagesSupported')}</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/80 border border-slate-200 text-xs text-slate-700 font-semibold shadow-2xs">
                <span className="w-7 h-7 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center material-symbols-outlined text-[17px] shrink-0">wifi_tethering</span>
                <span className="truncate">{t('lowNetworkReady')}</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/80 border border-slate-200 text-xs text-slate-700 font-semibold shadow-2xs">
                <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center material-symbols-outlined text-[17px] shrink-0">lock</span>
                <span className="truncate">{t('encrypted')}</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Next-Gen Auth Console Card */}
          <div className="lg:col-span-5 w-full flex justify-center">
            <div className={`w-full bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-slate-300/50 backdrop-blur-xl ${tab === 'register' ? 'form-card-register' : 'form-card-login'}`}>
              
              {/* Card Header with ABDM Badge */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-heading text-2xl font-black text-slate-900 tracking-tight">{t('citizenAccess')}</h2>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">{t('enterCredentials')}</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200/80 shadow-2xs shrink-0">
                  <span className="material-symbols-outlined text-[22px]">shield_person</span>
                </div>
              </div>

              {/* Login / Register Segmented Switch */}
              <div className="flex bg-slate-100/90 p-1 rounded-2xl mb-4 relative border border-slate-200/60">
                <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-xl shadow-xs transition-all duration-300 ease-out ${tab === 'register' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'}`}></div>
                <button 
                  className={`relative z-10 flex-1 py-2 text-xs font-black rounded-xl transition-colors cursor-pointer ${tab === 'login' ? 'text-teal-900' : 'text-slate-500 hover:text-slate-800'}`}
                  onClick={() => setTab('login')} 
                  type="button"
                >
                  {t('signIn')}
                </button>
                <button 
                  className={`relative z-10 flex-1 py-2 text-xs font-black rounded-xl transition-colors cursor-pointer ${tab === 'register' ? 'text-teal-900' : 'text-slate-500 hover:text-slate-800'}`}
                  onClick={() => setTab('register')} 
                  type="button"
                >
                  {t('newCitizen')}
                </button>
              </div>

              {/* Role Selection Grid */}
              {tab === 'login' && (
                <div className="mb-4">
                  <label className="block text-[11px] font-black text-slate-500 mb-2 uppercase tracking-wider">{t('selectPortal')}</label>
                  <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100/80 border border-slate-200/80 rounded-2xl">
                    {ROLES.map(r => (
                      <button 
                        key={r.key} 
                        onClick={() => handleRoleSelect(r.key)} 
                        type="button"
                        className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer ${
                          role === r.key 
                            ? 'bg-gradient-to-b from-teal-600 to-teal-700 text-white shadow-sm shadow-teal-700/20 scale-[1.02]' 
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[17px]">{r.icon}</span>
                        <span className="truncate text-[10px]">{r.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Error Alert Box */}
              {error && (
                <div className="p-3 mb-3.5 rounded-2xl bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200 flex items-center gap-2 animate-fadeIn">
                  <span className="material-symbols-outlined text-rose-600 text-[18px]">error</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Form Heights Guard */}
              <div className="form-height-guard">
                {tab === 'login' && (
                  <form key="login" className="flex flex-col gap-3.5 animate-form-morph" onSubmit={handleSubmit}>
                    
                    {/* Identifier Input */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-black text-slate-700">{t('emailMobile')}</label>
                      <div className="relative group">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 group-focus-within:text-teal-600 transition-colors">
                          <span className="material-symbols-outlined text-[20px]">badge</span>
                        </span>
                        <input 
                          className="w-full pl-11 pr-4 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-600 transition-all font-semibold text-sm shadow-2xs hover:border-slate-300"
                          placeholder="your@email.com or 9876543210" 
                          required 
                          type="text" 
                          value={email} 
                          onChange={e => setEmail(e.target.value)} 
                        />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-black text-slate-700">{t('passwordPin')}</label>
                      <div className="relative group">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 group-focus-within:text-teal-600 transition-colors">
                          <span className="material-symbols-outlined text-[20px]">lock</span>
                        </span>
                        <input 
                          className="w-full pl-11 pr-11 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-600 transition-all font-semibold text-sm shadow-2xs hover:border-slate-300"
                          placeholder="••••••••" 
                          required 
                          type={showPassword ? "text" : "password"} 
                          value={password} 
                          onChange={e => setPassword(e.target.value)} 
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-teal-600 focus:outline-none transition-colors cursor-pointer"
                          title={showPassword ? "Hide password" : "Show password"}
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {showPassword ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Remember & Forgot controls */}
                    <div className="flex items-center justify-between text-xs pt-0.5">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-bold select-none">
                        <input defaultChecked className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 accent-teal-600" type="checkbox" />
                        <span>{t('rememberMe')}</span>
                      </label>
                      <button 
                        type="button" 
                        onClick={openForgotPasswordModal} 
                        className="font-bold text-teal-700 hover:text-teal-800 hover:underline cursor-pointer bg-transparent border-0 p-0"
                      >
                        {t('forgotPassword')}
                      </button>
                    </div>

                    {/* Submit Button */}
                    <button 
                      className="w-full py-3 px-4 bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 hover:from-teal-800 hover:to-emerald-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-teal-700/25 hover:shadow-teal-700/40 transition-all duration-200 flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-70 active:scale-98"
                      type="submit" 
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                          <span>{t('authenticating')}</span>
                        </>
                      ) : (
                        <>
                          <span>{t('signInBtn')}</span>
                          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* REGISTER TAB */}
                {tab === 'register' && (
                  <form key="register" className="animate-form-morph space-y-3" onSubmit={handleRegisterSubmit}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3.5 gap-y-2.5">
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-black text-slate-700">{t('fullName')}</label>
                        <input 
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-bold focus:bg-white focus:outline-none focus:border-teal-600 transition-all"
                          placeholder="Full name" required type="text" value={regForm.name} onChange={e => setRegForm({...regForm, name: e.target.value})} 
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-black text-slate-700">{t('emailMobile')}</label>
                        <input 
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-bold focus:bg-white focus:outline-none focus:border-teal-600 transition-all"
                          placeholder="your@email.com" required type="email" value={regForm.email} onChange={e => setRegForm({...regForm, email: e.target.value})} 
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-black text-slate-700">{t('mobileNumber')}</label>
                        <input 
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-bold focus:bg-white focus:outline-none focus:border-teal-600 transition-all"
                          placeholder="10 digit number" required type="text" value={regForm.phone} onChange={e => setRegForm({...regForm, phone: e.target.value})} 
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-black text-slate-700">{t('password')}</label>
                        <div className="relative">
                          <input 
                            className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-bold focus:bg-white focus:outline-none focus:border-teal-600 transition-all"
                            placeholder="••••••••" required type={showRegPassword ? "text" : "password"} value={regForm.password} onChange={e => setRegForm({...regForm, password: e.target.value})} 
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegPassword(!showRegPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-teal-600"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              {showRegPassword ? 'visibility_off' : 'visibility'}
                            </span>
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-black text-slate-700">{t('role')}</label>
                        <select 
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-bold focus:bg-white focus:outline-none focus:border-teal-600 transition-all"
                          value={regForm.role} onChange={e => setRegForm({...regForm, role: e.target.value})}
                        >
                          <option value="patient">Patient (Citizen)</option>
                          <option value="health_worker">Health Worker (ANM / CHO)</option>
                          <option value="doctor">Doctor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-black text-slate-700">{t('gender')}</label>
                        <select 
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-bold focus:bg-white focus:outline-none focus:border-teal-600 transition-all"
                          value={regForm.gender} onChange={e => setRegForm({...regForm, gender: e.target.value})}
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    <button 
                      className="w-full py-2.5 px-4 bg-gradient-to-r from-teal-700 to-emerald-600 hover:from-teal-800 hover:to-emerald-700 text-white font-black text-xs rounded-xl shadow-md shadow-teal-700/25 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-70"
                      type="submit" disabled={loading}
                    >
                      {loading ? <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> : null}
                      <span>{loading ? t('creatingAccount') : t('createAccount')}</span>
                      {!loading && <span className="material-symbols-outlined text-[18px]">how_to_reg</span>}
                    </button>
                  </form>
                )}
              </div>

              {/* Bottom Support Callout */}
              <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-start gap-3 bg-teal-50/50 -mx-5 -mb-5 sm:-mx-7 sm:-mb-7 p-3.5 rounded-b-3xl">
                <span className="material-symbols-outlined text-teal-700 text-xl shrink-0 mt-0.5">contact_support</span>
                <div className="text-xs text-slate-600 leading-tight">
                  <span className="font-black text-slate-800">{t('needHelp')}</span>
                  <p className="mt-0.5 font-medium">{t('helpDesc')}</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* FORGOT PASSWORD MODAL */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-teal-950 text-white flex items-center justify-between border-b-2 border-teal-500">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-600/80 text-white flex items-center justify-center font-bold shadow-xs">
                  <span className="material-symbols-outlined text-[24px]">lock_reset</span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-white font-heading">
                    {forgotStep === 3 ? 'Password Changed!' : 'Reset Account Password'}
                  </h3>
                  <p className="text-[11px] text-teal-300 font-bold">ABDM Secure Identity Recovery</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setForgotModalOpen(false)} 
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Close"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {forgotError && (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-900 font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-rose-600 text-[18px]">error</span>
                  <span>{forgotError}</span>
                </div>
              )}

              {forgotSuccess && forgotStep !== 3 && (
                <div className="p-3 bg-teal-50 border border-teal-300 rounded-xl text-teal-950 font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-teal-600 text-[18px]">verified</span>
                  <span>{forgotSuccess}</span>
                </div>
              )}

              {forgotStep === 1 && (
                <form onSubmit={handleSendForgotOtp} className="space-y-4">
                  <p className="text-slate-600 font-medium leading-relaxed">
                    Enter your registered <strong>Mobile Number</strong> (+91) or <strong>Email Address</strong>. We will generate an authentication OTP to verify your identity.
                  </p>
                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                      Registered Email or Mobile Phone <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <span className="material-symbols-outlined text-[18px]">contact_mail</span>
                      </span>
                      <input
                        type="text"
                        required
                        value={forgotIdentity}
                        onChange={e => setForgotIdentity(e.target.value)}
                        placeholder="e.g. 9876543211 or patient@test.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:border-teal-600"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-black text-xs shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {forgotLoading ? (
                      <>
                        <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                        <span>Verifying Account &amp; Sending OTP...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">send_to_mobile</span>
                        <span>Send 6-Digit Verification Code</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {forgotStep === 2 && (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-slate-500 font-bold">Target Account: <strong className="text-slate-900">{forgotIdentity}</strong></span>
                    <button
                      type="button"
                      onClick={() => { setForgotStep(1); setForgotError(''); }}
                      className="text-teal-700 hover:underline font-bold text-[11px] cursor-pointer"
                    >
                      Change
                    </button>
                  </div>

                  {receivedOtpHint && (
                    <div className="p-2.5 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between">
                      <span className="text-[11px] text-teal-950 font-bold">Demo OTP Code:</span>
                      <button
                        type="button"
                        onClick={() => setForgotOtp(receivedOtpHint)}
                        className="px-2.5 py-1 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-mono font-black text-xs transition-colors cursor-pointer"
                      >
                        Auto-Fill: {receivedOtpHint}
                      </button>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                      Enter 6-Digit OTP <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength="6"
                      value={forgotOtp}
                      onChange={e => setForgotOtp(e.target.value)}
                      placeholder="e.g. 849201"
                      className="w-full text-center tracking-widest text-lg font-mono font-black bg-slate-50 border border-slate-200 rounded-xl py-2 text-slate-900 focus:outline-none focus:border-teal-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                      New Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showForgotPass ? 'text' : 'password'}
                        required
                        minLength="6"
                        value={forgotNewPassword}
                        onChange={e => setForgotNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 pr-10 text-xs font-bold text-slate-900 focus:outline-none focus:border-teal-600"
                      />
                      <button
                        type="button"
                        onClick={() => setShowForgotPass(!showForgotPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {showForgotPass ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                      Confirm New Password <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type={showForgotPass ? 'text' : 'password'}
                      required
                      value={forgotConfirmPassword}
                      onChange={e => setForgotConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-teal-600"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-black text-xs shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                  >
                    {forgotLoading ? (
                      <>
                        <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">lock_reset</span>
                        <span>Verify OTP &amp; Reset Password</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {forgotStep === 3 && (
                <div className="py-4 text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 border border-emerald-300 flex items-center justify-center mx-auto shadow-sm">
                    <span className="material-symbols-outlined text-[36px]">check_circle</span>
                  </div>
                  <h4 className="text-lg font-black text-slate-900">Password Changed Successfully!</h4>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    Your password has been updated in the database and hashed securely. Your new credentials have been auto-filled into the sign-in form.
                  </p>
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(false)}
                    className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-black text-xs shadow-sm transition-all cursor-pointer mt-2"
                  >
                    Sign In Now with New Password
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="relative z-10 w-full border-t border-slate-200/80 bg-white/70 backdrop-blur-md py-2.5 px-4 sm:px-6 lg:px-20 text-center">
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 notranslate" translate="no">SehatSaarthi Patient Portal</span>
            <span className="hidden sm:inline">•</span>
            <span>Ministry of Health &amp; Family Welfare, Govt. of India</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Emergency Helplines: <strong className="text-slate-800 font-bold">108 / 104 / 112</strong></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
