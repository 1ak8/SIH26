import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'patient', gender: 'male' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    <main className="w-full min-h-screen flex items-center justify-center p-6 bg-surface">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 animate-fadeIn">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-surface-container-high text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl" style={{fontVariationSettings:"'FILL' 1"}}>badge</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-on-surface">Create Account</h2>
            <p className="text-[13px] text-secondary">Join AarogyaNet Health Grid</p>
          </div>
        </div>
        {error && <div className="p-3 mb-4 rounded-xl bg-error-container text-[#93000a] text-sm font-medium">{error}</div>}
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input className="w-full bg-surface-container-low px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Full Name" required value={form.name} onChange={e => set('name', e.target.value)} />
          <input className="w-full bg-surface-container-low px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary" type="email" placeholder="Email Address" required value={form.email} onChange={e => set('email', e.target.value)} />
          <input className="w-full bg-surface-container-low px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Mobile Number (10 digits)" required value={form.phone} onChange={e => set('phone', e.target.value)} />
          <input className="w-full bg-surface-container-low px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary" type="password" placeholder="Password (min 6 chars)" required value={form.password} onChange={e => set('password', e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <select className="bg-surface-container-low px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary" value={form.role} onChange={e => set('role', e.target.value)}>
              <option value="patient">Patient</option>
              <option value="health_worker">ASHA / Health Worker</option>
              <option value="doctor">Doctor</option>
              <option value="admin">Admin</option>
            </select>
            <select className="bg-surface-container-low px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary" value={form.gender} onChange={e => set('gender', e.target.value)}>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-primary text-white py-3.5 rounded-xl text-sm font-semibold shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-70">
            {loading ? <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span> : <span className="material-symbols-outlined text-xl">badge</span>}
            <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
          </button>
          <p className="text-center text-sm text-secondary">Already registered? <Link to="/login" className="text-primary font-semibold hover:underline">Login here</Link></p>
        </form>
      </div>
    </main>
  );
}
