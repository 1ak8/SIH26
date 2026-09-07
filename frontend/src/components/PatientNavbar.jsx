import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';

export default function PatientNavbar({ activeTab, setActiveTab }) {
  const { logout } = useAuth();
  const { t, i18n } = useTranslation();
  const location = useLocation();

  const isDashboard = location.pathname === '/patient';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest border-b border-surface-variant">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 flex items-center justify-between gap-4 h-14">
        <Link to="/patient" className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center font-bold shrink-0">
            <span className="material-symbols-outlined text-[26px]">health_and_safety</span>
          </div>
          <span className="font-bold text-on-surface tracking-tight text-2xl leading-none">AarogyaNet</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-1.5">
          {isDashboard ? (
            <button onClick={() => setActiveTab('dashboard')} className={`px-3 py-2 font-bold rounded-lg text-[15px] transition-colors ${activeTab === 'dashboard' ? 'bg-surface-container text-on-surface' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'}`}>{t('dashboard')}</button>
          ) : (
            <Link to="/patient" className="px-3 py-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-bold text-[15px] rounded-lg transition-colors">{t('dashboard')}</Link>
          )}
          <Link to="/patient/doctors" className={`px-3 py-2 font-bold text-[15px] rounded-lg transition-colors ${location.pathname === '/patient/doctors' ? 'bg-surface-container text-on-surface' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'}`}>{t('bookDoctor')}</Link>
          <Link to="/patient/medicines" className={`px-3 py-2 font-bold text-[15px] rounded-lg transition-colors ${location.pathname === '/patient/medicines' ? 'bg-surface-container text-on-surface' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'}`}>{t('myMedicines')}</Link>
          
          {isDashboard ? (
            <button onClick={() => setActiveTab('profile')} className={`px-3 py-2 font-bold text-[15px] rounded-lg transition-colors inline-flex items-center gap-1.5 ${activeTab === 'profile' ? 'bg-surface-container text-on-surface' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'}`}>
              <span>{t('myProfile')}</span>
              <span className="bg-surface-container-low text-primary text-label-sm px-1.5 py-0.5 rounded border border-surface-variant font-bold">{t('citizen')}</span>
            </button>
          ) : (
            <Link to="/patient" className="px-3 py-2 font-bold text-[15px] rounded-lg transition-colors inline-flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container">
              <span>{t('myProfile')}</span>
              <span className="bg-surface-container-low text-primary text-label-sm px-1.5 py-0.5 rounded border border-surface-variant font-bold">{t('citizen')}</span>
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-3 shrink-0">
          <button onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'hi' : 'en')} className="h-10 px-3 flex items-center gap-1.5 bg-surface-container-lowest border border-surface-variant rounded-lg text-on-surface text-[14px] font-bold hover:bg-surface-container transition-colors" type="button">
            <span className="material-symbols-outlined text-secondary text-[20px]">translate</span>
            <span className="hidden sm:inline">{t('language')}</span>
          </button>
          <a className="h-10 px-3.5 flex items-center gap-1.5 bg-primary-container text-on-primary-container text-[14px] font-bold rounded-lg hover:bg-[#ffb95f] transition-colors" href="tel:108">
            <span className="material-symbols-outlined text-[20px]">call</span>
            <span>Emergency 108</span>
          </a>
          <button onClick={() => { if (window.confirm('Are you sure you want to logout?')) logout(); }} className="w-9 h-9 rounded-full bg-tertiary flex items-center justify-center hover:bg-tertiary/80 transition-colors" title="Logout">
            <span className="material-symbols-outlined text-on-tertiary text-[18px]">logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
