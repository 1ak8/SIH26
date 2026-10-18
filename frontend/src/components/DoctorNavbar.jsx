import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import LanguageSelector from './LanguageSelector';

export default function DoctorNavbar() {
  const { logout } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();

  const getLinkClass = (path) => {
    const isActive = location.pathname === path;
    return `px-3.5 py-2 font-black text-[13px] rounded-xl transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
      isActive 
        ? 'bg-gradient-to-r from-teal-700 to-teal-600 text-white shadow-sm shadow-teal-700/25' 
        : 'text-slate-600 hover:text-teal-950 hover:bg-teal-50/80'
    }`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-xl border-b border-slate-200/80 shadow-xs w-full">
      <div className="w-full px-4 lg:px-8 xl:px-12 flex items-center gap-3 h-[72px]">
        {/* Brand Logo & Doctor Desk Seal */}
        <Link to="/doctor" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-700 via-teal-600 to-emerald-500 p-0.5 shadow-md shadow-teal-700/20 flex items-center justify-center shrink-0">
            <img src="/images/logo-transparent.png" alt="SehatSaarthi" className="w-full h-full rounded-[10px] object-cover notranslate bg-white" translate="no" />
          </div>
          <div className="flex flex-col">
            <span className="font-brand font-black text-slate-900 tracking-tight text-[22px] leading-none group-hover:text-teal-700 transition-colors notranslate" translate="no">SehatSaarthi</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[9px] uppercase font-black tracking-wider px-1.5 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200 self-start">
                Doctor Desk
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
            </div>
          </div>
        </Link>

        {/* Nav Items */}
        <nav className="hidden lg:flex items-center gap-2 xl:gap-2.5 flex-1 min-w-0 overflow-x-auto scrollbar-hide px-2">
          <Link to="/doctor" className={getLinkClass('/doctor')}>
            <span className="material-symbols-outlined text-[17px]">dashboard</span>
            <span>Dashboard</span>
          </Link>
          <div className="h-5 w-[1.5px] bg-slate-200 rounded-full shrink-0"></div>

          <Link to="/doctor/queue" className={getLinkClass('/doctor/queue')}>
            <span className="material-symbols-outlined text-[17px]">reduce_capacity</span>
            <span>Queue</span>
          </Link>
          <div className="h-5 w-[1.5px] bg-slate-200 rounded-full shrink-0"></div>

          <Link to="/doctor/prescriptions" className={getLinkClass('/doctor/prescriptions')}>
            <span className="material-symbols-outlined text-[17px]">medication</span>
            <span>Prescriptions</span>
          </Link>
          <div className="h-5 w-[1.5px] bg-slate-200 rounded-full shrink-0"></div>

          <Link to="/doctor/labs" className={getLinkClass('/doctor/labs')}>
            <span className="material-symbols-outlined text-[17px]">science</span>
            <span>Labs</span>
          </Link>
          <div className="h-5 w-[1.5px] bg-slate-200 rounded-full shrink-0"></div>

          <Link to="/doctor/history" className={getLinkClass('/doctor/history')}>
            <span className="material-symbols-outlined text-[17px]">history</span>
            <span>History</span>
          </Link>
          <div className="h-5 w-[1.5px] bg-slate-200 rounded-full shrink-0"></div>

          <Link to="/doctor/referrals" className={getLinkClass('/doctor/referrals')}>
            <span className="material-symbols-outlined text-[17px]">forward</span>
            <span>Referrals</span>
          </Link>
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5 shrink-0 whitespace-nowrap ml-auto lg:ml-0">
          <div className="h-6 w-[1.5px] bg-slate-200 rounded-full hidden lg:block mr-1"></div>
          
          <LanguageSelector />
          
          <a className="h-9 px-3 flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-black rounded-xl hover:bg-rose-100 transition-all shadow-2xs active:scale-95" href="tel:108">
            <span className="material-symbols-outlined text-rose-600 text-[17px]">call</span>
            <span className="font-mono">108</span>
          </a>

          <button 
            onClick={() => { if (window.confirm('Are you sure you want to logout?')) logout(); }} 
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 border border-slate-200 flex items-center justify-center transition-all shadow-2xs cursor-pointer active:scale-95" 
            title="Logout"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
