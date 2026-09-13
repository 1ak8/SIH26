import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import LanguageSelector from './LanguageSelector';

export default function PatientNavbar({ activeTab, setActiveTab }) {
  const { logout } = useAuth();
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const isDashboard = location.pathname === '/patient';

  const handleDashboardClick = () => {
    if (isDashboard) {
      if (setActiveTab) setActiveTab('dashboard');
    } else {
      navigate('/patient', { state: { tab: 'dashboard' } });
    }
  };

  const handleProfileClick = () => {
    if (isDashboard) {
      if (setActiveTab) setActiveTab('profile');
    } else {
      navigate('/patient', { state: { tab: 'profile' } });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs w-full">
      <div className="w-full px-6 lg:px-12 xl:px-16 flex items-center justify-between gap-8 h-20">
        {/* Logo with Govt Portal Badge Below */}
        <Link to="/patient" className="flex items-center gap-3.5 shrink-0 group">
          <img src="/images/logo-transparent.png" alt="SehatSaarthi" className="w-11 h-11 rounded-2xl object-cover notranslate" translate="no" />
          <div className="flex flex-col">
            <span className="font-brand font-black text-slate-900 tracking-tight text-2xl leading-none group-hover:text-amber-700 transition-colors notranslate" translate="no">SehatSaarthi</span>
            <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 self-start mt-1">
              Govt Portal
            </span>
          </div>
        </Link>

        {/* Clean Navigation Items with Subtle Dividers - Centered & Cohesive */}
        <nav className="hidden lg:flex items-center gap-2 xl:gap-4">
          <button 
            onClick={handleDashboardClick} 
            className={`px-3.5 py-2 font-extrabold text-sm rounded-xl transition-all flex items-center gap-2 ${
              isDashboard && activeTab === 'dashboard' 
                ? 'bg-amber-600 text-white shadow-sm' 
                : 'text-slate-700 hover:text-amber-800 hover:bg-amber-50/70'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">dashboard</span>
            <span>{t('dashboard')}</span>
          </button>

          <div className="h-6 w-[2px] bg-slate-300 rounded-full shrink-0"></div>

          <Link 
            to="/patient/doctors" 
            className={`px-3.5 py-2 font-extrabold text-sm rounded-xl transition-all flex items-center gap-2 ${
              location.pathname === '/patient/doctors' 
                ? 'bg-amber-600 text-white shadow-sm' 
                : 'text-slate-700 hover:text-amber-800 hover:bg-amber-50/70'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">stethoscope</span>
            <span>{t('bookDoctor')}</span>
          </Link>

          <div className="h-6 w-[2px] bg-slate-300 rounded-full shrink-0"></div>

          <Link 
            to="/patient/medicines" 
            className={`px-3.5 py-2 font-extrabold text-sm rounded-xl transition-all flex items-center gap-2 ${
              location.pathname === '/patient/medicines' 
                ? 'bg-amber-600 text-white shadow-sm' 
                : 'text-slate-700 hover:text-amber-800 hover:bg-amber-50/70'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">medication</span>
            <span>My Medicines</span>
          </Link>
          
          <div className="h-6 w-[2px] bg-slate-300 rounded-full shrink-0"></div>

          <button 
            onClick={handleProfileClick} 
            className={`px-3.5 py-2 font-extrabold text-sm rounded-xl transition-all inline-flex items-center gap-2 ${
              isDashboard && activeTab === 'profile' 
                ? 'bg-amber-600 text-white shadow-sm' 
                : 'text-slate-700 hover:text-amber-800 hover:bg-amber-50/70'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">person</span>
            <span>{t('myProfile')}</span>
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
              isDashboard && activeTab === 'profile' 
                ? 'bg-amber-700 text-white' 
                : 'bg-amber-100 text-amber-900 border border-amber-300'
            }`}>
              {t('citizen')}
            </span>
          </button>
        </nav>

        {/* Right Action Controls with clear separation */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="h-8 w-[2px] bg-slate-300 rounded-full hidden lg:block mr-1"></div>

          <LanguageSelector />

          <a 
            className="h-10 px-3.5 flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-extrabold rounded-xl hover:bg-rose-100 transition-all shadow-xs" 
            href="tel:108"
          >
            <span className="material-symbols-outlined text-rose-600 text-[18px]">call</span>
            <span>Emergency 108</span>
          </a>

          <button 
            onClick={() => { if (window.confirm('Are you sure you want to logout?')) logout(); }} 
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 border border-slate-200 flex items-center justify-center transition-all shadow-xs" 
            title="Logout"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
