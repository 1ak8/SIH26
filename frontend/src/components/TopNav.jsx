import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function TopNav() {
  const { user, notifications } = useAuth();
  const [showNotif, setShowNotif] = useState(false);

  return (
    <header className="fixed top-0 left-72 right-0 h-16 bg-white/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-30 flex items-center justify-between px-6">
      <div className="flex-1 max-w-xl">
        <div className="relative flex items-center w-full">
          <span className="material-symbols-outlined absolute left-3 text-outline pointer-events-none text-xl">search</span>
          <input className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            placeholder="Search doctors, reports, health records..." type="text" />
        </div>
      </div>
      <div className="flex items-center gap-4 relative">
        <button onClick={() => setShowNotif(!showNotif)} className="relative p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-low transition-colors">
          <span className="material-symbols-outlined text-xl">notifications</span>
          {notifications.length > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-error rounded-full ring-2 ring-white" />
          )}
        </button>
        {showNotif && (
          <div className="absolute top-12 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-outline-variant/20 z-50 animate-fadeIn">
            <div className="p-4 border-b border-outline-variant/20 flex items-center justify-between">
              <span className="font-bold text-sm text-on-surface">Notifications</span>
              <span className="text-[11px] text-primary font-semibold cursor-pointer">{notifications.length} new</span>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {notifications.length > 0 ? notifications.slice(0, 10).map(n => (
                <div key={n.id} className="px-4 py-3 border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors">
                  <p className="text-[12px] font-medium text-on-surface">{n.text}</p>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">Just now</p>
                </div>
              )) : (
                <div className="px-4 py-8 text-center">
                  <span className="material-symbols-outlined text-3xl text-outline mb-1">notifications_none</span>
                  <p className="text-[12px] text-on-surface-variant">No notifications yet</p>
                </div>
              )}
            </div>
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-white text-sm font-bold">{user?.name?.[0] || 'U'}</div>
          <div className="hidden xl:flex flex-col text-left">
            <span className="text-[12px] font-semibold text-on-surface leading-tight">{user?.name}</span>
            <span className="text-[11px] text-tertiary font-medium">ABHA Verified</span>
          </div>
        </div>
      </div>
    </header>
  );
}
