import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import LanguageSelector from './LanguageSelector';

export default function TopNav() {
  const { user, notifications } = useAuth();
  const [showNotif, setShowNotif] = useState(false);

  return (
    <header className="fixed top-0 left-72 right-0 h-[72px] bg-white/85 backdrop-blur-xl border-b border-slate-200/80 shadow-xs z-30 flex items-center justify-between px-6">
      <div className="flex-1 max-w-xl">
        <div className="relative flex items-center w-full group">
          <span className="material-symbols-outlined absolute left-3.5 text-slate-400 group-focus-within:text-teal-600 pointer-events-none text-xl transition-colors">search</span>
          <input 
            className="w-full pl-11 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 text-xs font-semibold focus:outline-none focus:bg-white focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10 transition-all"
            placeholder="Search citizens, vitals, prescriptions, health centres..." 
            type="text" 
          />
        </div>
      </div>

      <div className="flex items-center gap-3 relative">
        <LanguageSelector />

        {/* Notifications */}
        <button 
          onClick={() => setShowNotif(!showNotif)} 
          className="relative p-2.5 rounded-xl bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-600 transition-colors cursor-pointer border border-slate-200"
          title="Notifications"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          {notifications.length > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
          )}
        </button>

        {showNotif && (
          <div className="absolute top-14 right-0 w-84 bg-white rounded-3xl shadow-2xl border border-slate-200 z-50 animate-fadeIn overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-teal-600 text-[18px]">notifications</span>
                <span className="font-black text-xs text-slate-900 uppercase tracking-wider">Alerts &amp; Updates</span>
              </div>
              <span className="text-[10px] bg-teal-100 text-teal-900 font-black px-2 py-0.5 rounded-full">{notifications.length} new</span>
            </div>
            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
              {notifications.length > 0 ? notifications.slice(0, 10).map(n => (
                <div key={n.id} className="p-3.5 hover:bg-slate-50 transition-colors">
                  <p className="text-xs font-bold text-slate-800">{n.text}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Just now • Primary Grid</p>
                </div>
              )) : (
                <div className="px-4 py-8 text-center">
                  <span className="material-symbols-outlined text-3xl text-slate-300 mb-1">notifications_none</span>
                  <p className="text-xs text-slate-500 font-medium">All caught up! No active alerts.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* User Pill */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-700 to-teal-500 flex items-center justify-center text-white text-xs font-black shadow-xs">
            {user?.name?.[0] || 'U'}
          </div>
          <div className="hidden xl:flex flex-col text-left">
            <span className="text-xs font-black text-slate-900 leading-tight">{user?.name}</span>
            <span className="text-[10px] text-teal-700 font-bold">ABDM Verified</span>
          </div>
        </div>
      </div>
    </header>
  );
}
