import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import LanguageSelector from './LanguageSelector';

export default function PatientNavbar({ activeTab, setActiveTab, setActiveModal }) {
  const { logout } = useAuth();
  const { t } = useTranslation();
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

  const navItemClass = (isActive) => `
    px-3.5 py-2 font-black text-[13px] rounded-xl transition-all duration-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0
    ${isActive 
      ? 'bg-gradient-to-r from-teal-700 to-teal-600 text-white shadow-sm shadow-teal-700/25' 
      : 'text-slate-600 hover:text-teal-950 hover:bg-teal-50/80'}
  `;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-xl border-b border-slate-200/80 shadow-xs w-full">
      <div className="w-full px-4 lg:px-8 xl:px-12 flex items-center gap-3 h-[72px]">
        {/* Brand Logo & National Seal Badge */}
        <Link to="/patient" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-700 via-teal-600 to-emerald-500 p-0.5 shadow-md shadow-teal-700/20 flex items-center justify-center shrink-0">
            <img src="/images/logo-transparent.png" alt="SehatSaarthi" className="w-full h-full rounded-[10px] object-cover notranslate bg-white" translate="no" />
          </div>
          <div className="flex flex-col">
            <span className="font-brand font-black text-slate-900 tracking-tight text-[22px] leading-none group-hover:text-teal-700 transition-colors notranslate" translate="no">SehatSaarthi</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[9px] uppercase font-black tracking-wider px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 self-start">
                Patient Portal
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
          </div>
        </Link>

        {/* Center Nav Rail */}
        <nav className="hidden lg:flex items-center gap-2 xl:gap-2.5 flex-1 min-w-0 overflow-x-auto scrollbar-hide px-2">
          <button 
            onClick={handleDashboardClick} 
            className={navItemClass(isDashboard && activeTab === 'dashboard')}
          >
            <span className="material-symbols-outlined text-[18px]">dashboard</span>
            <span>{t('dashboard')}</span>
          </button>

          <div className="h-5 w-[1.5px] bg-slate-200 rounded-full shrink-0"></div>

          <Link 
            to="/patient/doctors" 
            className={navItemClass(location.pathname === '/patient/doctors')}
          >
            <span className="material-symbols-outlined text-[18px]">stethoscope</span>
            <span>{t('bookDoctor')}</span>
          </Link>

          <div className="h-5 w-[1.5px] bg-slate-200 rounded-full shrink-0"></div>

          <Link 
            to="/patient/medicines" 
            className={navItemClass(location.pathname === '/patient/medicines')}
          >
            <span className="material-symbols-outlined text-[18px]">medication</span>
            <span>My Medicines</span>
          </Link>
          
          <div className="h-5 w-[1.5px] bg-slate-200 rounded-full shrink-0"></div>

          <Link 
            to="/patient/lab-reports" 
            className={navItemClass(location.pathname === '/patient/lab-reports')}
          >
            <span className="material-symbols-outlined text-[18px]">science</span>
            <span>Lab Reports</span>
          </Link>
          
          <div className="h-5 w-[1.5px] bg-slate-200 rounded-full shrink-0"></div>

          <Link 
            to="/patient/referrals" 
            className={navItemClass(location.pathname === '/patient/referrals')}
          >
            <span className="material-symbols-outlined text-[18px]">forward</span>
            <span>Referrals</span>
          </Link>

          <div className="h-5 w-[1.5px] bg-slate-200 rounded-full shrink-0"></div>

          <button 
            onClick={handleProfileClick} 
            className={navItemClass(isDashboard && activeTab === 'profile')}
          >
            <span className="material-symbols-outlined text-[18px]">person</span>
            <span>{t('myProfile')}</span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
              isDashboard && activeTab === 'profile' 
                ? 'bg-teal-900 text-teal-100' 
                : 'bg-teal-50 text-teal-800 border border-teal-200'
            }`}>
              {t('citizen')}
            </span>
          </button>
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5 shrink-0 whitespace-nowrap ml-auto lg:ml-0">
          <div className="h-6 w-[1.5px] bg-slate-200 rounded-full hidden lg:block mr-1"></div>

          <LanguageSelector />

          <a 
            className="h-9 px-3 flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-black rounded-xl hover:bg-rose-100 hover:border-rose-300 transition-all shadow-2xs active:scale-95" 
            href="tel:108"
            title="Emergency Ambulance Line"
          >
            <span className="material-symbols-outlined text-rose-600 text-[17px] animate-pulse">call</span>
            <span className="font-mono">108</span>
          </a>

          <button 
            onClick={() => { if (window.confirm('Are you sure you want to logout?')) logout(); }} 
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 border border-slate-200 flex items-center justify-center transition-all shadow-2xs cursor-pointer active:scale-95" 
            title="Sign Out"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
