import { useState, useEffect } from 'react';
import api from '../services/api';

const MEDICINE_STOCK = [
  { id: 1, name: 'Paracetamol 500mg', category: 'Analgesic', stock: 450, unit: 'tablets', minStock: 200, lastRefill: '2026-09-10', expiry: '2027-06-30', supplier: 'Jan Aushadhi Kendra' },
  { id: 2, name: 'Amoxicillin 250mg', category: 'Antibiotic', stock: 80, unit: 'capsules', minStock: 150, lastRefill: '2026-09-05', expiry: '2027-03-15', supplier: 'District Drug Warehouse' },
  { id: 3, name: 'Metformin 500mg', category: 'Antidiabetic', stock: 320, unit: 'tablets', minStock: 100, lastRefill: '2026-09-12', expiry: '2027-08-20', supplier: 'Jan Aushadhi Kendra' },
  { id: 4, name: 'Amlodipine 5mg', category: 'Antihypertensive', stock: 25, unit: 'tablets', minStock: 100, lastRefill: '2026-08-28', expiry: '2027-04-10', supplier: 'CHC Pharmacy' },
  { id: 5, name: 'ORS Sachets', category: 'Rehydration', stock: 15, unit: 'sachets', minStock: 50, lastRefill: '2026-09-01', expiry: '2027-12-31', supplier: 'PHC Stock' },
  { id: 6, name: 'Iron Folic Acid', category: 'Supplement', stock: 500, unit: 'tablets', minStock: 200, lastRefill: '2026-09-14', expiry: '2027-09-30', supplier: 'Jan Aushadhi Kendra' },
  { id: 7, name: 'Cetirizine 10mg', category: 'Antiallergic', stock: 35, unit: 'tablets', minStock: 80, lastRefill: '2026-09-08', expiry: '2027-07-15', supplier: 'District Drug Warehouse' },
  { id: 8, name: 'Pantoprazole 40mg', category: 'Antacid', stock: 60, unit: 'tablets', minStock: 100, lastRefill: '2026-09-03', expiry: '2027-05-20', supplier: 'CHC Pharmacy' },
  { id: 9, name: 'Azithromycin 500mg', category: 'Antibiotic', stock: 5, unit: 'tablets', minStock: 50, lastRefill: '2026-08-20', expiry: '2027-02-28', supplier: 'District Drug Warehouse' },
  { id: 10, name: 'Salbutamol Inhaler', category: 'Respiratory', stock: 2, unit: 'units', minStock: 10, lastRefill: '2026-09-06', expiry: '2027-01-15', supplier: 'CHC Pharmacy' },
];

export default function MedicineAvailability() {
  const [medicines, setMedicines] = useState(MEDICINE_STOCK);
  const [filter, setFilter] = useState('all');
  const [aiAlerts, setAiAlerts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);

  const getStockStatus = (med) => {
    const ratio = med.stock / med.minStock;
    if (ratio <= 0.15) return { label: 'Critical', color: 'bg-red-100 text-red-900 border-red-300', dot: 'bg-red-500', severity: 'critical' };
    if (ratio <= 0.3) return { label: 'Very Low', color: 'bg-orange-100 text-orange-900 border-orange-300', dot: 'bg-orange-500', severity: 'very_low' };
    if (ratio <= 0.5) return { label: 'Low', color: 'bg-amber-100 text-amber-900 border-amber-300', dot: 'bg-amber-500', severity: 'low' };
    if (ratio <= 0.8) return { label: 'Moderate', color: 'bg-sky-100 text-sky-900 border-sky-300', dot: 'bg-sky-500', severity: 'moderate' };
    return { label: 'Sufficient', color: 'bg-emerald-100 text-emerald-900 border-emerald-300', dot: 'bg-emerald-500', severity: 'sufficient' };
  };

  const generateAiAlerts = () => {
    setLoadingAlerts(true);
    const alerts = [];
    const critical = medicines.filter(m => (m.stock / m.minStock) <= 0.15);
    const low = medicines.filter(m => { const r = m.stock / m.minStock; return r > 0.15 && r <= 0.5; });
    const expiringSoon = medicines.filter(m => {
      const exp = new Date(m.expiry);
      const now = new Date();
      const diffDays = (exp - now) / (1000 * 60 * 60 * 24);
      return diffDays <= 90 && diffDays > 0;
    });

    if (critical.length > 0) {
      alerts.push({
        type: 'emergency',
        icon: 'error',
        title: `${critical.length} Medicine${critical.length > 1 ? 's' : ''} CRITICAL — Immediate Restock Needed`,
        message: `${critical.map(m => m.name).join(', ')} — stock almost zero. Contact District Drug Warehouse immediately.`,
        color: 'bg-red-50 border-red-300 text-red-900',
      });
    }

    if (low.length > 0) {
      alerts.push({
        type: 'warning',
        icon: 'warning',
        title: `${low.length} Medicine${low.length > 1 ? 's' : ''} Running Low`,
        message: `${low.map(m => `${m.name} (${m.stock} ${m.unit})`).join(', ')} — restock within 7 days to avoid shortage.`,
        color: 'bg-amber-50 border-amber-300 text-amber-900',
      });
    }

    if (expiringSoon.length > 0) {
      alerts.push({
        type: 'info',
        icon: 'schedule',
        title: `${expiringSoon.length} Medicine${expiringSoon.length > 1 ? 's' : ''} Expiring Soon`,
        message: `${expiringSoon.map(m => `${m.name} (exp: ${new Date(m.expiry).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })})`).join(', ')} — use or return before expiry.`,
        color: 'bg-sky-50 border-sky-300 text-sky-900',
      });
    }

    const totalValue = medicines.reduce((sum, m) => sum + m.stock, 0);
    alerts.push({
      type: 'summary',
      icon: 'inventory_2',
      title: `Total Stock: ${totalValue} units across ${medicines.length} medicines`,
      message: `${medicines.filter(m => (m.stock / m.minStock) > 0.5).length} sufficient, ${low.length + critical.length} need attention.`,
      color: 'bg-slate-50 border-slate-300 text-slate-900',
    });

    setTimeout(() => {
      setAiAlerts(alerts);
      setLoadingAlerts(false);
    }, 800);
  };

  useEffect(() => { generateAiAlerts(); }, [medicines]);

  const filtered = medicines.filter(m => {
    if (filter === 'all') return true;
    const status = getStockStatus(m);
    return status.severity === filter;
  });

  return (
    <div className="animate-fadeIn">
      {/* AI Alerts Banner */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-amber-600 text-[20px]">smart_toy</span>
          <h3 className="text-sm font-black text-slate-900">AI Stock Alerts</h3>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>

        {loadingAlerts ? (
          <div className="p-4 bg-white rounded-xl border border-slate-200 flex items-center gap-3">
            <span className="material-symbols-outlined text-amber-500 text-[20px] animate-spin">progress_activity</span>
            <span className="text-xs font-bold text-slate-500">AI analyzing medicine stock levels...</span>
          </div>
        ) : (
          <div className="space-y-2">
            {aiAlerts.map((alert, i) => (
              <div key={i} className={`p-3 rounded-xl border-2 ${alert.color} flex items-start gap-3`}>
                <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">{alert.icon}</span>
                <div>
                  <p className="text-xs font-black">{alert.title}</p>
                  <p className="text-[11px] font-medium mt-0.5 opacity-80">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {[{ key: 'all', label: 'All', count: medicines.length },
          { key: 'critical', label: 'Critical', count: medicines.filter(m => getStockStatus(m).severity === 'critical').length },
          { key: 'very_low', label: 'Very Low', count: medicines.filter(m => getStockStatus(m).severity === 'very_low').length },
          { key: 'low', label: 'Low', count: medicines.filter(m => getStockStatus(m).severity === 'low').length },
          { key: 'sufficient', label: 'Sufficient', count: medicines.filter(m => getStockStatus(m).severity === 'sufficient').length },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-black whitespace-nowrap transition-all cursor-pointer ${
              filter === f.key ? 'bg-amber-500 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-700 hover:border-amber-300'
            }`}>
            {f.label} <span className="ml-1 opacity-70">({f.count})</span>
          </button>
        ))}
      </div>

      {/* Medicine Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(med => {
          const status = getStockStatus(med);
          const stockPercent = Math.min(100, (med.stock / med.minStock) * 100);
          return (
            <div key={med.id} className="bg-white p-4 rounded-xl border-2 border-slate-200 hover:border-amber-400 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-sm font-black text-slate-900">{med.name}</h4>
                  <p className="text-[10px] text-slate-500 font-bold">{med.category} • {med.supplier}</p>
                </div>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${status.color}`}>
                  {status.label}
                </span>
              </div>

              {/* Stock Bar */}
              <div className="mb-2">
                <div className="flex justify-between text-[10px] font-bold mb-1">
                  <span className="text-slate-600">{med.stock} {med.unit} remaining</span>
                  <span className="text-slate-400">Min: {med.minStock}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${
                    stockPercent <= 15 ? 'bg-red-500' : stockPercent <= 30 ? 'bg-orange-500' : stockPercent <= 50 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`} style={{ width: `${stockPercent}%` }}></div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                <span>Exp: {new Date(med.expiry).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                <span>Last refill: {new Date(med.lastRefill).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
