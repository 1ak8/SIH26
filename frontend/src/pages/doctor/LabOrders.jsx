import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import DoctorNavbar from '../../components/DoctorNavbar';

const LAB_ORDERS = [
  { id: 'L-1042', patient: 'Aditya Verma (32/M)', test: 'Complete Blood Count (CBC)', date: '07 Sep 2026', status: 'Report Available', result: 'Normal' },
  { id: 'L-1043', patient: 'Savitri Devi (54/F)', test: 'HbA1c & Fasting Sugar', date: '07 Sep 2026', status: 'In Progress', result: '-' },
  { id: 'L-1044', patient: 'Ramesh Kumar (45/M)', test: 'Lipid Profile', date: '06 Sep 2026', status: 'Report Available', result: 'High LDL' },
  { id: 'L-1045', patient: 'Meena Kumari (28/F)', test: 'Thyroid Panel (T3, T4, TSH)', date: '08 Sep 2026', status: 'Pending Sample', result: '-' },
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
    <div className="bg-surface-container-lowest text-on-surface font-sans min-h-screen pt-20">
      <DoctorNavbar />
      <main className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-headline-lg font-bold">Lab Orders</h1>
          
          <div className="flex items-center gap-3">
            <div className="flex bg-surface-container rounded-lg p-1">
              {['All', 'Pending', 'Completed'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-md text-label-md font-bold transition-colors ${filter === f ? 'bg-surface-container-lowest text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                  {f}
                </button>
              ))}
            </div>
            <button className="h-10 px-4 bg-primary text-on-primary rounded-lg font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors">
              <span className="material-symbols-outlined text-[20px]">add</span>
              New Order
            </button>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-surface-variant rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-surface-variant">
                  <th className="px-6 py-4 text-label-md font-bold text-secondary uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-4 text-label-md font-bold text-secondary uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-4 text-label-md font-bold text-secondary uppercase tracking-wider">Test Details</th>
                  <th className="px-6 py-4 text-label-md font-bold text-secondary uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-label-md font-bold text-secondary uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-variant">
                {filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-6 py-4 font-bold text-on-surface">{order.id}</td>
                    <td className="px-6 py-4 text-body-md text-on-surface">{order.patient}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-label-md font-bold text-on-surface">{order.test}</span>
                        <span className="text-label-sm text-secondary">Ordered on {order.date}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {order.status === 'Report Available' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-container text-on-primary-container text-label-sm font-bold">
                          <span className="material-symbols-outlined text-[16px]">check_circle</span>
                          {order.status}
                        </span>
                      ) : order.status === 'In Progress' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container text-label-sm font-bold">
                          <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                          {order.status}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-variant text-on-surface-variant text-label-sm font-bold">
                          <span className="material-symbols-outlined text-[16px]">pending</span>
                          {order.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {order.status === 'Report Available' ? (
                        <button className="inline-flex items-center gap-2 px-4 py-2 bg-surface-container text-primary font-bold rounded-lg text-label-md hover:bg-surface-variant transition-colors border border-surface-variant">
                          <span className="material-symbols-outlined text-[20px]">visibility</span>
                          View Report
                        </button>
                      ) : (
                        <button className="inline-flex items-center gap-2 px-4 py-2 border border-surface-variant text-secondary rounded-lg font-bold text-label-md hover:bg-surface-container transition-colors">
                          Details
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
    </div>
  );
}
