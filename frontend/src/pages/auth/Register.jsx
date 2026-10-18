import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LanguageSelector from '../../components/LanguageSelector';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'patient', gender: 'male' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register(form);
      const homes = { patient: '/patient', health_worker: '/health-worker', doctor: '/doctor', admin: '/admin' };
      navigate(homes[user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="bg-slate-50 text-slate-800 min-h-[100dvh] w-full flex flex-col justify-between relative overflow-x-hidden selection:bg-teal-100 selection:text-teal-900">
      {/* Precision Ambient Light Fields */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-teal-200/25 rounded-full blur-[100px]"></div>
        <div className="absolute top-1/3 right-0 w-[420px] h-[420px] bg-sky-200/20 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-32 left-1/3 w-[600px] h-[600px] bg-emerald-100/25 rounded-full blur-[110px]"></div>
      </div>

      {/* HEADER */}
      <header className="relative z-50 w-full px-4 sm:px-6 lg:px-20 pt-4 pb-3 flex items-center justify-between gap-4 glass-nav bg-white/70 backdrop-blur-md border-b border-slate-200/80">
        <Link to="/login" className="flex items-center gap-3 shrink-0 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-700 via-teal-600 to-emerald-500 p-0.5 shadow-md shadow-teal-700/20 flex items-center justify-center">
            <img src="/images/logo-transparent.png" alt="SehatSaarthi" className="w-full h-full rounded-[14px] object-cover notranslate bg-white" translate="no" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-brand font-black text-slate-900 tracking-tight text-xl sm:text-2xl leading-none notranslate" translate="no">SehatSaarthi</span>
              <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 hidden sm:inline">
                ABDM Grid
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium tracking-tight mt-0.5">National Tele-Health Initiative</p>
          </div>
        </Link>

        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <LanguageSelector />
          <Link to="/login" className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors">
            Sign In
          </Link>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="relative z-10 flex-1 flex items-center justify-center w-full px-4 py-8">
        <div className="w-full max-w-xl bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-9 shadow-2xl shadow-slate-200/60 backdrop-blur-xl animate-fadeIn">
          
          <div className="flex items-center gap-3.5 mb-6 pb-5 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200/80 shadow-2xs shrink-0">
              <span className="material-symbols-outlined text-[26px]">how_to_reg</span>
            </div>
            <div>
              <h2 className="font-heading text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Create Health ID</h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">Join SehatSaarthi National Healthcare Grid</p>
            </div>
          </div>

          {error && (
            <div className="p-3 mb-4 rounded-2xl bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200 flex items-center gap-2">
              <span className="material-symbols-outlined text-rose-600 text-[18px]">error</span>
              <span>{error}</span>
            </div>
          )}

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-700">Full Name</label>
                <input 
                  className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-600 transition-all font-semibold text-sm" 
                  placeholder="e.g. Ramesh Kumar" 
                  required 
                  value={form.name} 
                  onChange={e => set('name', e.target.value)} 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-700">Email Address</label>
                <input 
                  className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-600 transition-all font-semibold text-sm" 
                  type="email" 
                  placeholder="ramesh@example.com" 
                  required 
                  value={form.email} 
                  onChange={e => set('email', e.target.value)} 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-700">Mobile Number (10 Digits)</label>
                <input 
                  className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-600 transition-all font-semibold text-sm font-mono" 
                  placeholder="9876543210" 
                  required 
                  value={form.phone} 
                  onChange={e => set('phone', e.target.value)} 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-700">Password</label>
                <div className="relative">
                  <input 
                    className="w-full pl-3.5 pr-11 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-600 transition-all font-semibold text-sm" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Min 6 characters" 
                    required 
                    value={form.password} 
                    onChange={e => set('password', e.target.value)} 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-teal-600 focus:outline-none cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    <span className="material-symbols-outlined text-[19px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-700">Portal Role</label>
                <select 
                  className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-600 transition-all font-semibold text-sm cursor-pointer" 
                  value={form.role} 
                  onChange={e => set('role', e.target.value)}
                >
                  <option value="patient">Patient (Citizen)</option>
                  <option value="health_worker">Health Worker (ASHA / ANM)</option>
                  <option value="doctor">Doctor (Medical Officer)</option>
                  <option value="admin">Administrator (Govt)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-slate-700">Gender</label>
                <select 
                  className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-600 transition-all font-semibold text-sm cursor-pointer" 
                  value={form.gender} 
                  onChange={e => set('gender', e.target.value)}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 hover:from-teal-800 hover:to-emerald-700 text-white py-3.5 rounded-2xl text-sm font-black shadow-lg shadow-teal-700/25 transition-all flex items-center justify-center gap-2 mt-3 cursor-pointer active:scale-98 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                  <span>Generating ABHA Health Record...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
                  <span>Complete Registration</span>
                </>
              )}
            </button>

            <p className="text-center text-xs text-slate-500 font-medium mt-1">
              Already have an account?{' '}
              <Link to="/login" className="text-teal-700 font-black hover:underline">
                Sign in here
              </Link>
            </p>
          </form>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 w-full border-t border-slate-200/80 bg-white/70 backdrop-blur-md py-3 px-4 sm:px-6 lg:px-20 text-center">
        <p className="text-xs text-slate-500">
          SehatSaarthi National Digital Health Network • Ministry of Health &amp; Family Welfare, Govt. of India
        </p>
      </footer>
    </div>
  );
}
