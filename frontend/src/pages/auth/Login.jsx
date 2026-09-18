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
    { key: 'patient', label: t('citizen') || 'Citizen', icon: 'person' },
    { key: 'health_worker', label: 'Health Worker', icon: 'medical_services' },
    { key: 'doctor', label: 'Doctor', icon: 'stethoscope' },
    { key: 'admin', label: 'Admin', icon: 'admin_panel_settings' },
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
    <div className="bg-[#fbfaf7] text-slate-800 min-h-[100dvh] w-full lg:h-screen lg:max-h-screen flex flex-col justify-between relative overflow-x-hidden overflow-y-auto lg:overflow-hidden selection:bg-amber-100 selection:text-amber-900">
      {/* Subtle ambient glow background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-200/35 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-sky-200/25 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 left-1/4 w-96 h-96 bg-emerald-100/30 rounded-full blur-3xl"></div>
      </div>

      {/* HEADER */}
      <header className="relative z-50 w-full px-4 sm:px-6 lg:px-24 pt-3 pb-1 flex items-center justify-between gap-3 lg:gap-4">
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <img src="/images/logo-transparent.png" alt="SehatSaarthi" className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl object-cover shadow-md shadow-amber-500/20 notranslate shrink-0" translate="no" />
          <div className="flex flex-col">
            <span className="font-brand font-black text-slate-900 tracking-tight text-xl sm:text-2xl lg:text-3xl leading-none notranslate" translate="no">SehatSaarthi</span>
            <p className="text-[10px] sm:text-xs lg:text-sm text-slate-500 font-medium tracking-tight mt-0.5">{t('nationalTeleHealth')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
          <LanguageSelector />
          <a href="tel:108" className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-xs font-extrabold hover:bg-rose-100 transition-colors cursor-pointer shadow-xs">
            <span className="material-symbols-outlined text-[16px] sm:text-[18px] text-rose-600">call</span>
            <span>108</span>
            <span className="hidden sm:inline font-bold">• {t('emergency')}</span>
          </a>
        </div>
      </header>

      {/* MAIN */}
      <main className="relative z-10 flex-1 flex items-center justify-center w-full px-4 sm:px-6 lg:px-24 py-3 lg:py-3 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center w-full">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-3">
            <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full bg-amber-50/90 border border-amber-200/80 text-amber-900 text-xs font-semibold shadow-xs">
              <span className="material-symbols-outlined text-amber-600 text-[18px]">verified</span>
              <span>राष्ट्रीय स्वास्थ्य मिशन | National Health Mission</span>
            </div>
            <div>
              <h1 className="font-heading text-2xl sm:text-4xl lg:text-[42px] font-extrabold text-slate-900 tracking-tight leading-[1.18]">
                {t('accessibleHealthcare')}<br /><span className="relative inline-block text-amber-600 font-black">{t('everyCitizen')}</span>
              </h1>
              <p className="text-slate-600 text-sm sm:text-base lg:text-lg mt-2 font-normal leading-relaxed max-w-xl">
                {t('authDesc')}
              </p>
            </div>
            {/* Illustration */}
            <div className="relative w-full max-w-xl bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
              <div className="w-full h-[180px] sm:h-[260px] lg:h-[300px] rounded-xl overflow-hidden bg-gradient-to-br from-amber-50 via-sky-50 to-emerald-50 flex items-center justify-center">
                <img src="/images/auth-hero.jpg" alt="Tele-Consultation in Progress" className="w-full h-full object-cover" />
              </div>
              <div className="absolute bottom-3 sm:bottom-4 left-4 right-4 sm:left-5 sm:right-5 bg-white/95 backdrop-blur-xs border border-slate-200/90 rounded-xl px-3.5 sm:px-4 py-2 sm:py-2.5 shadow-sm flex items-center justify-between text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-semibold text-slate-800">{t('liveClinics')}</span>
                </div>
                <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">{t('abdmIntegrated')}</span>
              </div>
            </div>
            {/* Value Badges */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-1 max-w-xl">
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
            <div className={`w-full bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xl shadow-slate-200/60 ${tab === 'register' ? 'form-card-register' : 'form-card-login'}`}>
              {/* Card Header */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="font-heading text-xl font-bold text-slate-900">{t('citizenAccess')}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{t('enterCredentials')}</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shrink-0">
                  <span className="material-symbols-outlined text-xl">shield_person</span>
                </div>
              </div>

              {/* Login / Register Tabs */}
              <div className="flex bg-slate-100 p-1 rounded-xl mb-3 relative">
                <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm transition-all duration-300 ease-out ${tab === 'register' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'}`}></div>
                <button className={`relative z-10 flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${tab === 'login' ? 'text-slate-900 underline underline-offset-4 decoration-amber-500 decoration-2' : 'text-slate-400 hover:text-slate-600'}`}
                  onClick={() => setTab('login')} type="button">{t('signIn')}</button>
                <button className={`relative z-10 flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${tab === 'register' ? 'text-slate-900 underline underline-offset-4 decoration-amber-500 decoration-2' : 'text-slate-400 hover:text-slate-600'}`}
                  onClick={() => setTab('register')} type="button">{t('newCitizen')}</button>
              </div>

              {/* Role Selector */}
              {tab === 'login' && (
                <div className="mb-3">
                  <label className="block text-[11px] font-bold text-slate-700 mb-2 uppercase tracking-wider">{t('selectPortal')}</label>
                  <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-50 border border-slate-200 rounded-xl animate-fadeIn">
                    {ROLES.map(r => (
                      <button key={r.key} onClick={() => handleRoleSelect(r.key)} type="button"
                        className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg text-[10px] font-bold transition-all ${role === r.key ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-white'}`}>
                        <span className="material-symbols-outlined text-[16px]">{r.icon}</span>
                        <span className="truncate">{r.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {error && <div className="p-3 mb-3 rounded-xl bg-rose-50 text-rose-700 text-sm font-medium border border-rose-200">{error}</div>}

              <div className="form-height-guard">
              {tab === 'login' && (
                <form key="login" className="flex flex-col gap-3 animate-form-morph" onSubmit={handleSubmit}>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-bold text-slate-700">{t('emailMobile')}</label>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 group-focus-within:text-amber-500 transition-colors">
                        <span className="material-symbols-outlined text-[20px]">badge</span>
                      </span>
                      <input className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-base lg:text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-medium shadow-sm hover:border-slate-400"
                        placeholder="your@email.com or 9876543210" required type="text" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-bold text-slate-700">{t('passwordPin')}</label>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 group-focus-within:text-amber-500 transition-colors">
                        <span className="material-symbols-outlined text-[20px]">lock</span>
                      </span>
                      <input className="w-full pl-11 pr-11 py-2.5 bg-white border border-slate-300 rounded-xl text-base lg:text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-medium shadow-sm hover:border-slate-400"
                        placeholder="••••••••" required type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-amber-600 focus:outline-none transition-colors cursor-pointer"
                        title={showPassword ? "Hide password" : "Show password"}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[13px] pt-1">
                    <label className="flex items-center gap-2.5 cursor-pointer text-slate-600 font-medium">
                      <input defaultChecked className="w-4 h-4 rounded border-slate-300 accent-amber-500 focus:ring-amber-500" type="checkbox" />
                      <span>{t('rememberMe')}</span>
                    </label>
                    <button 
                      type="button" 
                      onClick={openForgotPasswordModal} 
                      className="font-bold text-amber-600 hover:text-amber-700 hover:underline cursor-pointer bg-transparent border-0 p-0"
                    >
                      {t('forgotPassword')}
                    </button>
                  </div>
                  <button className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-[14px] rounded-xl shadow-lg shadow-amber-500/30 transition-all flex items-center justify-center gap-2 mt-1 disabled:opacity-70"
                    type="submit" disabled={loading}>
                    {loading ? <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span> : null}
                    <span>{loading ? t('authenticating') : t('signInBtn')}</span>
                    {!loading && <span className="material-symbols-outlined text-[20px]">arrow_forward</span>}
                  </button>
                </form>
              )}

              {tab === 'register' && (
                <form key="register" className="animate-form-morph" onSubmit={handleRegisterSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-bold text-slate-700">{t('fullName')}</label>
                      <input className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-base lg:text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-medium shadow-sm hover:border-slate-400"
                        placeholder="Full name" required type="text" value={regForm.name} onChange={e => setRegForm({...regForm, name: e.target.value})} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-bold text-slate-700">{t('emailMobile')}</label>
                      <input className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-base lg:text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-medium shadow-sm hover:border-slate-400"
                        placeholder="your@email.com" required type="email" value={regForm.email} onChange={e => setRegForm({...regForm, email: e.target.value})} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-bold text-slate-700">{t('mobileNumber')}</label>
                      <input className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-base lg:text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-medium shadow-sm hover:border-slate-400"
                        placeholder="10 digit number" required type="text" value={regForm.phone} onChange={e => setRegForm({...regForm, phone: e.target.value})} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-bold text-slate-700">{t('password')}</label>
                      <div className="relative group">
                        <input className="w-full pl-3 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-base lg:text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-medium shadow-sm hover:border-slate-400"
                          placeholder="••••••••" required type={showRegPassword ? "text" : "password"} value={regForm.password} onChange={e => setRegForm({...regForm, password: e.target.value})} />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-amber-600 focus:outline-none transition-colors cursor-pointer"
                          title={showRegPassword ? "Hide password" : "Show password"}
                          aria-label={showRegPassword ? "Hide password" : "Show password"}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {showRegPassword ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-bold text-slate-700">{t('role')}</label>
                      <select className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-base lg:text-[14px] text-slate-900 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-medium shadow-sm hover:border-slate-400"
                        value={regForm.role} onChange={e => setRegForm({...regForm, role: e.target.value})}>
                        <option value="patient">Citizen</option>
                        <option value="health_worker">Health Worker (ANM / CHO)</option>
                        <option value="doctor">Doctor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-bold text-slate-700">{t('gender')}</label>
                      <select className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-base lg:text-[14px] text-slate-900 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-medium shadow-sm hover:border-slate-400"
                        value={regForm.gender} onChange={e => setRegForm({...regForm, gender: e.target.value})}>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <button className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-[14px] rounded-xl shadow-lg shadow-amber-500/30 transition-all flex items-center justify-center gap-2 mt-3 disabled:opacity-70"
                    type="submit" disabled={loading}>
                    {loading ? <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span> : null}
                    <span>{loading ? t('creatingAccount') : t('createAccount')}</span>
                    {!loading && <span className="material-symbols-outlined text-[20px]">how_to_reg</span>}
                  </button>
                </form>
              )}
              </div>

              {/* Help Section */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-start gap-3 bg-amber-50/50 -mx-5 -mb-5 sm:-mx-6 sm:-mb-6 p-3 rounded-b-3xl">
                <span className="material-symbols-outlined text-amber-700 text-xl shrink-0 mt-0.5">contact_support</span>
                <div className="text-xs text-slate-600 leading-tight">
                  <span className="font-bold text-slate-800">{t('needHelp')}</span>
                  <p className="mt-0.5">{t('helpDesc')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FORGOT PASSWORD & CREDENTIAL RECOVERY MODAL */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-3xl border-2 border-amber-400 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between border-b-4 border-amber-500">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <span className="material-symbols-outlined text-[24px]">lock_reset</span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-white font-heading">
                    {forgotStep === 3 ? 'Password Changed!' : 'Reset Account Password'}
                  </h3>
                  <p className="text-[11px] text-amber-300/80 font-bold">ABDM Secure Identity Recovery</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setForgotModalOpen(false)} 
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 transition-colors cursor-pointer shadow-sm"
                title="Close"
              >
                <span className="material-symbols-outlined text-[20px] font-bold text-slate-900">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Error Message */}
              {forgotError && (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-900 font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-rose-600 text-[18px]">error</span>
                  <span>{forgotError}</span>
                </div>
              )}

              {/* Success Notification */}
              {forgotSuccess && forgotStep !== 3 && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-950 font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-600 text-[18px]">verified</span>
                  <span>{forgotSuccess}</span>
                </div>
              )}

              {/* STEP 1: ENTER EMAIL OR PHONE */}
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
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-600 text-[18px]">shield</span>
                    <span>Supports Citizen, Doctor, Health Worker &amp; Admin accounts.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full py-3 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white rounded-xl font-black text-xs shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
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

              {/* STEP 2: ENTER OTP & NEW PASSWORD */}
              {forgotStep === 2 && (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-slate-500 font-bold">Target Account: <strong className="text-slate-900">{forgotIdentity}</strong></span>
                    <button
                      type="button"
                      onClick={() => { setForgotStep(1); setForgotError(''); }}
                      className="text-amber-700 hover:underline font-bold text-[11px] cursor-pointer"
                    >
                      Change
                    </button>
                  </div>

                  {/* Demo OTP auto-fill badge */}
                  {receivedOtpHint && (
                    <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between">
                      <span className="text-[11px] text-amber-950 font-bold">Demo OTP Code:</span>
                      <button
                        type="button"
                        onClick={() => setForgotOtp(receivedOtpHint)}
                        className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-mono font-black text-xs transition-colors cursor-pointer"
                      >
                        Auto-Fill: {receivedOtpHint}
                      </button>
                    </div>
                  )}

                  {/* 6-Digit OTP */}
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
                      className="w-full text-center tracking-widest text-lg font-mono font-black bg-slate-50 border-2 border-slate-200 rounded-xl py-2 text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* New Password */}
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
                        className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3.5 py-2.5 pr-10 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowForgotPass(!showForgotPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-600"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {showForgotPass ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
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
                      className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full py-3 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white rounded-xl font-black text-xs shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                  >
                    {forgotLoading ? (
                      <>
                        <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                        <span>Updating Password in MongoDB...</span>
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

              {/* STEP 3: SUCCESS VIEW */}
              {forgotStep === 3 && (
                <div className="py-4 text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 border-2 border-emerald-300 flex items-center justify-center mx-auto shadow-sm">
                    <span className="material-symbols-outlined text-[36px]">check_circle</span>
                  </div>
                  <h4 className="text-lg font-black text-slate-900">Password Changed Successfully!</h4>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    Your password has been updated in the database and hashed with bcrypt. Your new credentials have been auto-filled into the sign-in form.
                  </p>

                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(false)}
                    className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-black text-xs shadow-sm transition-all cursor-pointer mt-2"
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
      <footer className="relative z-10 w-full border-t border-slate-200/80 bg-white/70 backdrop-blur-xs py-2 px-4 sm:px-6 lg:px-24 text-center">
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 notranslate" translate="no">SehatSaarthi Citizen Portal</span>
            <span className="hidden sm:inline">•</span>
            <span>Ministry of Health &amp; Family Welfare, Govt. of India</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Emergency Helplines: <strong className="text-slate-800 font-semibold">108 / 104 / 112</strong></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
