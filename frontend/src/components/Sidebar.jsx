import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Sidebar({ links, activeKey, onNavigate }) {
  const { user, logout } = useAuth();
  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-white/90 backdrop-blur-xl border-r border-slate-200/80 shadow-xs z-40 flex flex-col justify-between">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="h-[72px] px-6 flex items-center gap-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-700 via-teal-600 to-emerald-500 p-0.5 shadow-md shadow-teal-700/20 flex items-center justify-center shrink-0">
            <img src="/images/logo-transparent.png" alt="SehatSaarthi" className="w-full h-full rounded-[10px] object-cover notranslate bg-white" translate="no" />
          </div>
          <div className="flex flex-col">
            <span className="font-brand font-black text-xl text-slate-900 tracking-tight notranslate" translate="no">SehatSaarthi</span>
            <span className="text-[10px] text-teal-800 font-bold uppercase tracking-wider">MoHFW • India</span>
          </div>
        </div>

        {/* Navigation Rail */}
        <nav className="flex flex-col gap-1.5 px-4 mt-4">
          {links.map(l => {
            const isActive = activeKey === l.key;
            return (
              <a 
                key={l.key} 
                href="#" 
                onClick={(e) => { e.preventDefault(); onNavigate?.(l.key); }}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-xs font-black cursor-pointer ${
                  isActive 
                    ? 'bg-gradient-to-r from-teal-700 to-teal-600 text-white shadow-sm shadow-teal-700/25 scale-[1.01]' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-[19px]">{l.icon}</span>
                <span>{l.label}</span>
                {l.badge && (
                  <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  }`}>
                    {l.badge}
                  </span>
                )}
              </a>
            );
          })}
        </nav>
      </div>

      {/* User Status Card */}
      <div className="p-4 m-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-700 to-teal-500 flex items-center justify-center text-white text-xs font-black shadow-xs">
            {user?.name?.[0] || 'U'}
          </div>
          <div className="flex flex-col text-left min-w-0">
            <span className="text-xs font-black text-slate-900 leading-tight truncate">{user?.name}</span>
            <span className="text-[10px] text-slate-500 font-bold capitalize leading-tight mt-0.5">{user?.role?.replace('_', ' ')}</span>
          </div>
        </div>
        <button 
          onClick={logout} 
          className="w-full py-2 rounded-xl bg-white text-slate-700 text-xs font-black hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 border border-slate-200 transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-98"
        >
          <span className="material-symbols-outlined text-[16px]">logout</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
