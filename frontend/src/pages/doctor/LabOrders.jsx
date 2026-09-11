import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import DoctorNavbar from '../../components/DoctorNavbar';
import { Link } from 'react-router-dom';

const LAB_ORDERS = [
  { id: 'L-1042', patient: 'Aditya Verma (32/M)', test: 'Complete Blood Count (CBC)', date: '07 Sep 2026', status: 'Report Available', result: 'Normal', facility: 'CHC Sitapur Central Lab' },
  { id: 'L-1043', patient: 'Savitri Devi (54/F)', test: 'HbA1c & Fasting Sugar', date: '07 Sep 2026', status: 'In Progress', result: 'Sample at Lab', facility: 'District Hospital Lab' },
  { id: 'L-1044', patient: 'Ramesh Kumar (45/M)', test: 'Lipid Profile', date: '06 Sep 2026', status: 'Report Available', result: 'High LDL', facility: 'CHC Sitapur Central Lab' },
  { id: 'L-1045', patient: 'Meena Kumari (28/F)', test: 'Thyroid Panel (T3, T4, TSH)', date: '08 Sep 2026', status: 'Pending Sample', result: 'ASHA to Collect', facility: 'Sub-Centre Kiosk' },
];

export default function LabOrders() {
  const { user } = useAuth();
  const [filter, setFilter] = useState('All');

  const filteredOrders = LAB_ORDERS.filter(o => {
    if (filter === 'All') return true;
    if (filter === 'Pending') return o.status === 'Pending Sample' || o.status === 'In Progress';
    if (filter === 'Completed') return o.status === 'Report Available';
    return true;
  });
  
  return (
    <div className="bg-[#fbfaf7] text-slate-900 font-sans min-h-screen">
      <DoctorNavbar />

      <main className="w-full px-6 lg:px-12 xl:px-16 pt-28 pb-16">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link 
            to="/doctor" 
            className="inline-flex items-center gap-2 text-slate-700 hover:text-amber-600 bg-white px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold shadow-xs hover:border-amber-300 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Console
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Diagnostic Lab Orders</h1>
            <p className="text-sm text-slate-600 font-medium">Digital lab requisitions for rural patients processed via district pathology centres.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-white rounded-2xl p-1 border-2 border-slate-200 shadow-xs">
              {['All', 'Pending', 'Completed'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                    filter === f 
                      ? 'bg-amber-600 text-white shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {f} {f === 'All' ? `(${LAB_ORDERS.length})` : ''}
                </button>
              ))}
            </div>

            <button 
              onClick={() => alert('Opening Diagnostic Requisition Form')}
              className="h-11 px-5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white rounded-xl font-extrabold text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              Order New Lab Test
            </button>
          </div>
        </div>

        <div className="bg-white border-2 border-slate-200/90 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b-2 border-slate-100">
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Citizen Details</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Requested Test</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Lab Status</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-5">
                      <span className="font-mono text-sm font-black text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                        {order.id}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-base font-extrabold text-slate-900 block">{order.patient}</span>
                      <span className="text-xs text-slate-500 font-semibold">{order.facility}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-extrabold text-slate-800 block">{order.test}</span>
                      <span className="text-xs text-slate-500">Ordered: {order.date}</span>
                    </td>
                    <td className="px-6 py-5">
                      {order.status === 'Report Available' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-extrabold">
                          <span className="material-symbols-outlined text-[16px] text-emerald-700">check_circle</span>
                          {order.status}
                        </span>
                      ) : order.status === 'In Progress' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-900 border border-sky-300 text-xs font-extrabold">
                          <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                          {order.status}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-extrabold">
                          <span className="material-symbols-outlined text-[16px]">schedule</span>
                          {order.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      {order.status === 'Report Available' ? (
                        <button 
                          onClick={() => alert(`Opening verified pathology PDF report for ${order.id}`)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-50 text-amber-900 font-extrabold rounded-xl text-xs hover:bg-amber-100 transition-all border border-amber-300 shadow-2xs"
                        >
                          <span className="material-symbols-outlined text-[18px]">description</span>
                          View Report
                        </button>
                      ) : (
                        <button 
                          onClick={() => alert(`Tracking sample logistics for Order ${order.id}`)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 rounded-xl font-bold text-xs transition-all"
                        >
                          Sample Status
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-white border-t border-slate-200 mt-12">
        <div className="w-full px-6 lg:px-12 xl:px-16 py-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="md:col-span-2 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-600 text-[28px]">verified</span>
                <span className="text-lg text-slate-900 font-extrabold">Ministry of Health &amp; Family Welfare</span>
              </div>
              <p className="text-sm text-slate-600 font-medium max-w-2xl leading-relaxed">
                <span className="notranslate" translate="no">SEHATSARTHI</span> delivers verified public clinical connectivity across rural dispensaries, district hospitals, and tertiary research institutes under the National Digital Health Framework.
              </p>
            </div>
            <div className="flex flex-col gap-1.5 justify-center md:items-end">
              <span className="text-xs text-slate-500 uppercase font-extrabold tracking-wider">National Emergency Helplines</span>
              <span className="text-xl font-black text-rose-700">Toll-Free 1075 / 108</span>
              <span className="text-xs text-slate-500 font-semibold">24x7 Tele-Consult &amp; Ambulance Dispatch</span>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
            <p>© 2026 Government Public Healthcare Infrastructure. All citizen rights reserved.</p>
            <p className="text-amber-900 font-bold">Radical Clarity &amp; Rural Accessibility Compliant</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
