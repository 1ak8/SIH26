import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DoctorNavbar from '../../components/DoctorNavbar';
import { Link } from 'react-router-dom';

const QUEUE_DATA = [
  { id: 4, name: 'Aditya Verma', age: '32 yrs', gender: 'Male', location: 'Rampur', status: 'IN CONSULTATION', asha: 'Sunita Devi', time: '10:30 AM' },
  { id: 5, name: 'Savitri Devi', age: '54 yrs', gender: 'Female', location: 'Bilaspur', status: 'Next in Line', time: '10:45 AM' },
  { id: 6, name: 'Bharat Patel', age: '41 yrs', gender: 'Male', location: 'Dholpur', status: 'Waiting', time: '11:00 AM' },
  { id: 7, name: 'Pooja Kumari', age: '22 yrs', gender: 'Female', location: 'Rampur', status: 'Waiting', time: '11:15 AM' },
  { id: 8, name: 'Mohan Das', age: '68 yrs', gender: 'Male', location: 'Haripur', status: 'Waiting', time: '11:30 AM' },
  { id: 9, name: 'Kamla Devi', age: '45 yrs', gender: 'Female', location: 'Bilaspur', status: 'Waiting', time: '11:45 AM' },
];

export default function PatientQueue() {
  const { user } = useAuth();
  const [filter, setFilter] = useState('All');

  const filteredQueue = QUEUE_DATA.filter(p => {
    if (filter === 'All') return true;
    if (filter === 'Waiting') return p.status === 'Waiting' || p.status === 'Next in Line';
    if (filter === 'Active') return p.status === 'IN CONSULTATION';
    return true;
  });

  return (
    <div className="bg-surface-container-lowest text-on-surface font-sans min-h-screen pt-20">
      <DoctorNavbar />
      
      <main className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-headline-lg font-bold">Patient Queue</h1>
          
          <div className="flex items-center gap-3">
            <div className="flex bg-surface-container rounded-lg p-1">
              {['All', 'Active', 'Waiting'].map(f => (
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
              Add Walk-in
            </button>
          </div>
        </div>

        {/* Critical Triage Alert */}
        <div className="mb-6 p-4 bg-surface-container-low border border-surface-variant rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center">
              <span className="material-symbols-outlined text-tertiary text-[24px]">notification_important</span>
            </div>
            <div>
              <h3 className="text-label-lg font-bold text-on-surface">Critical Triage Desk</h3>
              <p className="text-body-md text-secondary">Monitor escalated cases requiring immediate attention.</p>
            </div>
          </div>
          <div className="bg-surface-container px-4 py-2 rounded-lg text-center">
            <span className="text-headline-md font-bold text-tertiary leading-none">0</span>
            <p className="text-label-sm text-secondary uppercase mt-1">Escalated</p>
          </div>
        </div>

        {/* Queue Table */}
        <div className="bg-surface-container-lowest border border-surface-variant rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-surface-variant">
                  <th className="px-6 py-4 text-label-md font-bold text-secondary uppercase tracking-wider">Token</th>
                  <th className="px-6 py-4 text-label-md font-bold text-secondary uppercase tracking-wider">Patient Details</th>
                  <th className="px-6 py-4 text-label-md font-bold text-secondary uppercase tracking-wider">Appointment</th>
                  <th className="px-6 py-4 text-label-md font-bold text-secondary uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-label-md font-bold text-secondary uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-variant">
                {filteredQueue.map(p => (
                  <tr key={p.id} className={`hover:bg-surface-container-low transition-colors ${p.status === 'IN CONSULTATION' ? 'bg-primary-container/10' : ''}`}>
                    <td className="px-6 py-4">
                      <span className="text-headline-sm font-bold text-on-surface">#{String(p.id).padStart(2, '0')}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-label-lg font-bold text-on-surface">{p.name}</span>
                        <span className="text-body-md text-secondary">{p.age}, {p.gender} • {p.location}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-label-md font-bold text-on-surface">{p.time}</span>
                        {p.asha && <span className="text-label-sm text-primary font-bold">ASHA: {p.asha}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {p.status === 'IN CONSULTATION' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-container text-on-primary-container text-label-sm font-bold">
                          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                          In Consultation
                        </span>
                      ) : p.status === 'Next in Line' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container text-label-sm font-bold">
                          Next in Line
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-variant text-on-surface-variant text-label-sm font-bold">
                          Waiting
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {p.status === 'IN CONSULTATION' ? (
                        <Link to="/doctor/prescriptions" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-bold text-label-md hover:bg-primary/90 transition-colors">
                          <span className="material-symbols-outlined text-[20px]">video_call</span>
                          Consult
                        </Link>
                      ) : (
                        <button className="inline-flex items-center gap-2 px-4 py-2 border border-surface-variant text-on-surface rounded-lg font-bold text-label-md hover:bg-surface-container transition-colors">
                          View Details
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                
                {filteredQueue.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-secondary">
                      No patients found matching the current filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
