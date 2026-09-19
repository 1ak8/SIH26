import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import LanguageSelector from './LanguageSelector';

export default function DoctorNavbar() {
  const { logout } = useAuth();
  const { t, i18n } = useTranslation();
  const location = useLocation();

  const getLinkClass = (path) => {
    const isActive = location.pathname === path;
    return `px-3 py-1.5 font-extrabold text-[13px] rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
      isActive 
        ? 'bg-amber-600 text-white shadow-sm' 
        : 'text-slate-700 hover:text-amber-800 hover:bg-amber-50/70'
    }`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs w-full">
      <div className="w-full px-4 lg:px-8 xl:px-12 flex items-center justify-between gap-4 h-[72px] overflow-hidden">
        {/* Logo */}
        <Link to="/doctor" className="flex items-center gap-2.5 shrink-0 group">
          <img src="/images/logo-transparent.png" alt="SehatSaarthi" className="w-10 h-10 rounded-xl object-cover shrink-0 notranslate" translate="no" />
          <div className="flex flex-col">
            <span className="font-brand font-black text-slate-900 tracking-tight text-[22px] leading-none group-hover:text-amber-700 transition-colors notranslate" translate="no">SehatSaarthi</span>
            <span className="text-[9px] uppercase font-black tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 self-start mt-0.5">
              Doctor Desk
            </span>
          </div>
        </Link>

        {/* Nav Items */}
        <nav className="hidden lg:flex items-center gap-2 xl:gap-2.5 shrink overflow-x-auto min-w-0">
          <Link to="/doctor" className={getLinkClass('/doctor')}>
            <span className="material-symbols-outlined text-[17px]">dashboard</span>
            <span>Dashboard</span>
          </Link>
          <div className="h-5 w-[1.5px] bg-slate-300 rounded-full shrink-0"></div>

          <Link to="/doctor/queue" className={getLinkClass('/doctor/queue')}>
            <span className="material-symbols-outlined text-[17px]">reduce_capacity</span>
            <span>Queue</span>
          </Link>
          <div className="h-5 w-[1.5px] bg-slate-300 rounded-full shrink-0"></div>

          <Link to="/doctor/prescriptions" className={getLinkClass('/doctor/prescriptions')}>
            <span className="material-symbols-outlined text-[17px]">medication</span>
            <span>Prescriptions</span>
          </Link>
          <div className="h-5 w-[1.5px] bg-slate-300 rounded-full shrink-0"></div>

          <Link to="/doctor/labs" className={getLinkClass('/doctor/labs')}>
            <span className="material-symbols-outlined text-[17px]">science</span>
            <span>Labs</span>
          </Link>
          <div className="h-5 w-[1.5px] bg-slate-300 rounded-full shrink-0"></div>

          <Link to="/doctor/history" className={getLinkClass('/doctor/history')}>
            <span className="material-symbols-outlined text-[17px]">history</span>
            <span>History</span>
          </Link>
          <div className="h-5 w-[1.5px] bg-slate-300 rounded-full shrink-0"></div>

          <Link to="/doctor/referrals" className={getLinkClass('/doctor/referrals')}>
            <span className="material-symbols-outlined text-[17px]">forward</span>
            <span>Referrals</span>
          </Link>
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2 shrink-0 whitespace-nowrap">
          <div className="h-6 w-[1.5px] bg-slate-300 rounded-full hidden lg:block mr-1"></div>
          <LanguageSelector />
          <a className="h-9 px-3 flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-extrabold rounded-xl hover:bg-rose-100 transition-all shadow-xs" href="tel:108">
            <span className="material-symbols-outlined text-rose-600 text-[16px]">call</span>
            <span>108</span>
          </a>
          <button onClick={() => { if (window.confirm('Are you sure you want to logout?')) logout(); }} 
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 border border-slate-200 flex items-center justify-center transition-all shadow-xs cursor-pointer" title="Logout">
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
