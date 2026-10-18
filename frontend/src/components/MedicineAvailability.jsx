import { useState, useEffect } from 'react';

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
    if (ratio <= 0.15) return { label: 'Critical', color: 'bg-rose-50 text-rose-900 border-rose-300', dot: 'bg-rose-500', severity: 'critical' };
    if (ratio <= 0.3) return { label: 'Very Low', color: 'bg-orange-50 text-orange-900 border-orange-300', dot: 'bg-orange-500', severity: 'very_low' };
    if (ratio <= 0.5) return { label: 'Low Stock', color: 'bg-amber-50 text-amber-900 border-amber-300', dot: 'bg-amber-500', severity: 'low' };
    if (ratio <= 0.8) return { label: 'Adequate', color: 'bg-sky-50 text-sky-900 border-sky-300', dot: 'bg-sky-500', severity: 'moderate' };
    return { label: 'Sufficient', color: 'bg-emerald-50 text-emerald-900 border-emerald-300', dot: 'bg-emerald-500', severity: 'sufficient' };
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
        title: `${critical.length} Critical Shortages — Restock Requested`,
        message: `${critical.map(m => m.name).join(', ')} stocks are critical. Tele-requisition dispatched to District Drug Warehouse.`,
        color: 'bg-rose-50 border-rose-200 text-rose-900',
        iconColor: 'text-rose-600',
      });
    }

    if (low.length > 0) {
      alerts.push({
        type: 'warning',
        icon: 'warning',
        title: `${low.length} Medicines Approaching Threshold`,
        message: `${low.map(m => `${m.name} (${m.stock} ${m.unit})`).join(', ')} — schedule refill before stockout.`,
        color: 'bg-amber-50 border-amber-200 text-amber-900',
        iconColor: 'text-amber-600',
      });
    }

    if (expiringSoon.length > 0) {
      alerts.push({
        type: 'info',
        icon: 'schedule',
        title: `${expiringSoon.length} Batches Near Expiry`,
        message: `${expiringSoon.map(m => `${m.name} (exp: ${new Date(m.expiry).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })})`).join(', ')} — prioritize dispensing.`,
        color: 'bg-sky-50 border-sky-200 text-sky-900',
        iconColor: 'text-sky-600',
      });
    }

    const totalValue = medicines.reduce((sum, m) => sum + m.stock, 0);
    alerts.push({
      type: 'summary',
      icon: 'inventory_2',
      title: `Sub-Centre Inventory: ${totalValue} Units in Stock`,
      message: `${medicines.filter(m => (m.stock / m.minStock) > 0.5).length} sufficient categories, ${low.length + critical.length} requiring re-order.`,
      color: 'bg-slate-50 border-slate-200 text-slate-800',
      iconColor: 'text-teal-600',
    });

    const timer = setTimeout(() => {
      setAiAlerts(alerts);
      setLoadingAlerts(false);
    }, 300);
    return () => clearTimeout(timer);
  };

  useEffect(() => { generateAiAlerts(); }, [medicines]);

  const filtered = medicines.filter(m => {
    if (filter === 'all') return true;
    const status = getStockStatus(m);
    return status.severity === filter;
  });

  return (
    <div className="animate-fadeIn">
      {/* AI Header Alerts */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
            <span className="material-symbols-outlined text-[19px]">smart_toy</span>
          </div>
          <h3 className="text-sm font-black text-slate-900 font-heading">AI Pharmacy &amp; Stock Intelligence</h3>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>

        {loadingAlerts ? (
          <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center gap-3">
            <span className="material-symbols-outlined text-teal-600 text-[20px] animate-spin">progress_activity</span>
            <span className="text-xs font-bold text-slate-500">Checking Jan Aushadhi &amp; Sub-Centre supplies...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {aiAlerts.map((alert, i) => (
              <div key={i} className={`p-4 rounded-2xl border ${alert.color} flex items-start gap-3 shadow-2xs`}>
                <span className={`material-symbols-outlined text-[20px] shrink-0 mt-0.5 ${alert.iconColor}`}>{alert.icon}</span>
                <div>
                  <p className="text-xs font-black leading-tight">{alert.title}</p>
                  <p className="text-[11px] font-medium mt-1 leading-relaxed opacity-90">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
        {[
          { key: 'all', label: 'All Medicines', count: medicines.length },
          { key: 'critical', label: 'Critical', count: medicines.filter(m => getStockStatus(m).severity === 'critical').length },
          { key: 'very_low', label: 'Very Low', count: medicines.filter(m => getStockStatus(m).severity === 'very_low').length },
          { key: 'low', label: 'Low Stock', count: medicines.filter(m => getStockStatus(m).severity === 'low').length },
          { key: 'sufficient', label: 'Sufficient', count: medicines.filter(m => getStockStatus(m).severity === 'sufficient').length },
        ].map(f => (
          <button 
            key={f.key} 
            onClick={() => setFilter(f.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
              filter === f.key 
                ? 'bg-teal-700 text-white shadow-sm shadow-teal-700/25' 
                : 'bg-white border border-slate-200 text-slate-600 hover:border-teal-300'
            }`}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* Medicine Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filtered.map(med => {
          const status = getStockStatus(med);
          const stockPercent = Math.min(100, (med.stock / med.minStock) * 100);
          return (
            <div key={med.id} className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-teal-400 hover:shadow-md transition-all duration-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-sm font-black text-slate-900 leading-snug">{med.name}</h4>
                  <p className="text-[10px] text-slate-500 font-bold mt-0.5">{med.category} • {med.supplier}</p>
                </div>
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${status.color}`}>
                  {status.label}
                </span>
              </div>

              {/* Stock Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-[11px] font-bold mb-1.5">
                  <span className="text-slate-700">{med.stock} {med.unit} available</span>
                  <span className="text-slate-400">Min: {med.minStock}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      stockPercent <= 15 ? 'bg-rose-500' : stockPercent <= 30 ? 'bg-orange-500' : stockPercent <= 50 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} 
                    style={{ width: `${stockPercent}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium pt-2 border-t border-slate-100">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px] text-slate-400">calendar_today</span>
                  Exp: {new Date(med.expiry).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </span>
                <span className="text-slate-400">
                  Refill: {new Date(med.lastRefill).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
