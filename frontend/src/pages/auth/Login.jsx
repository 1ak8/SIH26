import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ROLES = [
  { key: 'patient', label: 'Citizen', icon: 'person' },
  { key: 'health_worker', label: 'ASHA Worker', icon: 'volunteer_activism' },
  { key: 'doctor', label: 'Doctor', icon: 'medical_services' },
  { key: 'admin', label: 'Admin', icon: 'admin_panel_settings' },
];

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');
  const [role, setRole] = useState('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [regForm, setRegForm] = useState({ name: '', phone: '', gender: 'male', role: 'patient', email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      const homes = { patient: '/patient', health_worker: '/health-worker', doctor: '/doctor', admin: '/admin' };
      navigate(homes[user.role] || '/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      if (msg.includes('Invalid credentials') || msg.includes('not found')) {
        setError('Account not found. Please register first.');
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
    <div className="bg-[#fbfaf7] text-slate-800 min-h-screen flex flex-col justify-between relative overflow-x-hidden selection:bg-amber-100 selection:text-amber-900">
      {/* Subtle ambient glow background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-200/35 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-sky-200/25 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 left-1/4 w-96 h-96 bg-emerald-100/30 rounded-full blur-3xl"></div>
      </div>

      {/* HEADER */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-6 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 font-bold">
            <span className="material-symbols-outlined fill text-2xl">health_and_safety</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 tracking-tight text-xl">AarogyaNet</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">Govt Portal</span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">National Tele-Health Initiative</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center text-xs font-semibold bg-white border border-slate-200 rounded-full p-1 shadow-sm">
            <button className="px-3 py-1 bg-amber-500 text-white rounded-full transition-colors shadow-xs" type="button">English</button>
            <button className="px-3 py-1 text-slate-600 hover:text-slate-900 transition-colors" type="button">हिंदी</button>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-xs font-bold">
            <span className="material-symbols-outlined text-[16px] text-rose-600">call</span>
            <span>Emergency: 108</span>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="relative z-10 flex-1 flex items-center justify-center w-full max-w-6xl mx-auto px-6 py-4 lg:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-4">
            <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full bg-amber-50/90 border border-amber-200/80 text-amber-900 text-xs font-semibold shadow-xs">
              <span className="material-symbols-outlined text-amber-600 text-[18px]">verified</span>
              <span>राष्ट्रीय स्वास्थ्य मिशन | National Health Mission</span>
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-slate-900 tracking-tight leading-tight">
                Accessible Healthcare for <span className="relative inline-block text-amber-600">Every Citizen.</span>
              </h1>
              <p className="text-slate-600 text-base sm:text-lg mt-2 font-normal leading-relaxed max-w-xl">
                Connecting rural citizens, ASHA workers, and verified doctors seamlessly. Access specialist tele-consultations, prescription records, and primary care from anywhere.
              </p>
            </div>
            {/* Illustration */}
            <div className="relative w-full max-w-xl bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
              <div className="w-full h-[260px] sm:h-[300px] rounded-xl overflow-hidden bg-gradient-to-br from-amber-50 via-sky-50 to-emerald-50 flex items-center justify-center">
                <img src="/images/auth-hero.jpg" alt="Tele-Consultation in Progress" className="w-full h-full object-cover" />
              </div>
              <div className="absolute bottom-4 left-5 right-5 bg-white/95 backdrop-blur-xs border border-slate-200/90 rounded-xl px-4 py-2.5 shadow-sm flex items-center justify-between text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-semibold text-slate-800">Live Panchayat Tele-Clinics Active</span>
                </div>
                <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">ABDM Integrated</span>
              </div>
            </div>
            {/* Value Badges */}
            <div className="grid grid-cols-3 gap-3 pt-1 max-w-xl">
              <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                <span className="material-symbols-outlined text-amber-600 text-lg shrink-0">translate</span>
                <span>22 Languages</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                <span className="material-symbols-outlined text-amber-600 text-lg shrink-0">wifi_tethering</span>
                <span>Low 2G/3G Ready</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                <span className="material-symbols-outlined text-amber-600 text-lg shrink-0">lock</span>
                <span>256-Bit Encrypted</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Auth Card */}
          <div className="lg:col-span-5 w-full flex justify-center">
            <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl p-7 sm:p-8 shadow-xl shadow-slate-200/60 transition-all">
              {/* Card Header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Citizen Access</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Enter credentials to access your portal</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                  <span className="material-symbols-outlined text-xl">shield_person</span>
                </div>
              </div>

              {/* Login / Register Tabs */}
              <div className="flex bg-slate-100 p-1 rounded-xl mb-5">
                <button className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${tab === 'login' ? 'text-slate-900 bg-white shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                  onClick={() => setTab('login')} type="button">Sign In</button>
                <button className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${tab === 'register' ? 'text-slate-900 bg-white shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                  onClick={() => setTab('register')} type="button">New Citizen</button>
              </div>

              {/* Role Selector */}
              {tab === 'login' && (
                <div className="mb-4">
                  <label className="block text-[11px] font-bold text-slate-700 mb-2 uppercase tracking-wider">Select Portal</label>
                  <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-50 border border-slate-200 rounded-xl">
                    {ROLES.map(r => (
                      <button key={r.key} onClick={() => setRole(r.key)} type="button"
                        className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg text-[10px] font-bold transition-all ${role === r.key ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-white'}`}>
                        <span className="material-symbols-outlined text-[16px]">{r.icon}</span>
                        <span>{r.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {error && <div className="p-3 mb-3 rounded-xl bg-rose-50 text-rose-700 text-sm font-medium border border-rose-200">{error}</div>}

              {tab === 'login' && (
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Email / Mobile Number</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                        <span className="material-symbols-outlined text-[18px]">badge</span>
                      </span>
                      <input className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
                        placeholder="your@email.com or 9876543210" required type="text" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Password / Security PIN</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                        <span className="material-symbols-outlined text-[18px]">lock</span>
                      </span>
                      <input className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
                        placeholder="••••••••" required type="password" value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                      <input defaultChecked className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500" type="checkbox" />
                      <span>Remember me</span>
                    </label>
                    <a className="font-semibold text-amber-700 hover:text-amber-800 hover:underline" href="#">Forgot password?</a>
                  </div>
                  <button className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold text-sm rounded-xl shadow-md shadow-amber-500/25 transition-all flex items-center justify-center gap-2 mt-1 disabled:opacity-70"
                    type="submit" disabled={loading}>
                    {loading ? <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> : null}
                    <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
                    {!loading && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
                  </button>
                </form>
              )}

              {tab === 'register' && (
                <form className="space-y-4" onSubmit={handleRegisterSubmit}>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name</label>
                    <input className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
                      placeholder="Enter your name" required type="text" value={regForm.name} onChange={e => setRegForm({...regForm, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                    <input className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
                      placeholder="your@email.com" required type="email" value={regForm.email} onChange={e => setRegForm({...regForm, email: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Mobile Number</label>
                    <input className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
                      placeholder="10 digit number" required type="text" value={regForm.phone} onChange={e => setRegForm({...regForm, phone: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
                    <input className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
                      placeholder="••••••••" required type="password" value={regForm.password} onChange={e => setRegForm({...regForm, password: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Role</label>
                      <select className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
                        value={regForm.role} onChange={e => setRegForm({...regForm, role: e.target.value})}>
                        <option value="patient">Citizen</option>
                        <option value="health_worker">ASHA Worker</option>
                        <option value="doctor">Doctor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Gender</label>
                      <select className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
                        value={regForm.gender} onChange={e => setRegForm({...regForm, gender: e.target.value})}>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <button className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold text-sm rounded-xl shadow-md shadow-amber-500/25 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-70"
                    type="submit" disabled={loading}>
                    {loading ? <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> : null}
                    <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
                    {!loading && <span className="material-symbols-outlined text-[18px]">how_to_reg</span>}
                  </button>
                </form>
              )}

              {/* Help Section */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-start gap-3 bg-amber-50/50 -mx-3 -mb-3 p-3 rounded-b-2xl">
                <span className="material-symbols-outlined text-amber-700 text-xl shrink-0 mt-0.5">contact_support</span>
                <div className="text-xs text-slate-600 leading-tight">
                  <span className="font-bold text-slate-800">Need help logging in?</span>
                  <p className="mt-0.5">Call Toll-Free <strong className="text-amber-800">104</strong> for Tele-Health or visit your nearest CSC Gram Center.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 w-full border-t border-slate-200/80 bg-white/70 backdrop-blur-xs py-3 px-6 text-center">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">AarogyaNet Citizen Portal</span>
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
