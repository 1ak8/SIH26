import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';

export default function DoctorNavbar() {
  const { logout } = useAuth();
  const { t, i18n } = useTranslation();
  const location = useLocation();

  const getLinkClass = (path) => {
    const isActive = location.pathname === path;
    return `px-3 py-1.5 transition-colors text-label-md rounded-lg ${isActive ? 'bg-surface-container text-on-surface font-bold' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'}`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest border-b border-surface-variant">
      <div className="h-20 max-w-7xl mx-auto px-4 lg:px-8 flex items-center justify-between gap-4">
        <Link to="/doctor" className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary-container text-[20px]">health_and_safety</span>
          </div>
          <div className="flex flex-col">
            <span className="text-headline-sm font-bold text-on-surface leading-tight tracking-tight">AarogyaNet</span>
            <span className="text-label-sm text-secondary">National Public Health Infrastructure</span>
          </div>
        </Link>
        <nav className="hidden lg:flex items-center gap-2">
          <Link to="/doctor" className={getLinkClass('/doctor')}>Dashboard</Link>
          <Link to="/doctor/queue" className={getLinkClass('/doctor/queue')}>Patient Queue</Link>
          <Link to="/doctor/prescriptions" className={getLinkClass('/doctor/prescriptions')}>Prescriptions</Link>
          <Link to="/doctor/labs" className={getLinkClass('/doctor/labs')}>Lab Orders</Link>
          <Link to="/doctor/history" className={getLinkClass('/doctor/history')}>Consultation History</Link>
        </nav>
        <div className="flex items-center gap-3 shrink-0">
          <button onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'hi' : 'en')} className="h-12 px-3 flex items-center gap-2 bg-surface-container-lowest border border-surface-variant rounded-lg text-on-surface text-label-md hover:bg-surface-container hover:text-on-surface transition-colors" type="button">
            <span className="material-symbols-outlined text-secondary text-[20px]">translate</span>
            <span className="hidden sm:inline">{t('language') || 'Language: EN / हिंदी'}</span>
          </button>
          <a className="h-12 px-4 flex items-center gap-2 bg-primary-container text-on-primary-container text-label-lg rounded-lg hover:bg-[#ffb95f] hover:text-on-surface transition-colors" href="tel:108">
            <span className="material-symbols-outlined text-[22px]">call</span>
            <span>Emergency 108</span>
          </a>
          <button onClick={logout} className="w-8 h-8 rounded-full bg-primary flex items-center justify-center" title="Logout">
            <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
          </button>
        </div>
      </div>
    </header>
  );
}
