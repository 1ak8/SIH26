import { useAuth } from '../context/AuthContext';

export default function Sidebar({ links, activeKey, onNavigate }) {
  const { user, logout } = useAuth();
  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-white shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex flex-col justify-between">
      <div className="flex flex-col">
        <div className="h-16 px-5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-lg">health_and_safety</span>
          </div>
          <div className="flex flex-col">
            <span className="font-brand font-black text-lg text-amber-700 tracking-tight notranslate" translate="no">SehatSaarthi</span>
            <span className="text-[11px] text-on-surface-variant">Health Portal · MoHFW</span>
          </div>
        </div>
        <nav className="flex flex-col gap-1 px-3 mt-2">
          {links.map(l => (
            <a key={l.key} href="#" onClick={(e) => { e.preventDefault(); onNavigate?.(l.key); }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors text-sm font-medium ${activeKey === l.key ? 'bg-primary-container text-white font-semibold shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'}`}>
              <span className="material-symbols-outlined text-xl">{l.icon}</span>
              <span>{l.label}</span>
              {l.badge && <span className="ml-auto px-2 py-0.5 rounded-full bg-[#4edea3] text-[#002113] text-[11px] font-bold">{l.badge}</span>}
            </a>
          ))}
        </nav>
      </div>
      <div className="p-3 m-3 rounded-xl bg-surface-container-low flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary text-sm font-bold">{user?.name?.[0] || 'U'}</div>
          <div className="flex flex-col text-left min-w-0">
            <span className="text-[12px] font-semibold text-on-surface leading-tight truncate">{user?.name}</span>
            <span className="text-[11px] text-on-surface-variant capitalize leading-tight">{user?.role?.replace('_', ' ')}</span>
          </div>
        </div>
        <button onClick={logout} className="mt-1 w-full py-1.5 rounded-lg bg-white text-on-surface-variant text-[12px] font-semibold hover:bg-surface-container hover:text-error transition-colors flex items-center justify-center gap-1">
          <span className="material-symbols-outlined text-sm">logout</span> Sign Out
        </button>
      </div>
    </aside>
  );
}
