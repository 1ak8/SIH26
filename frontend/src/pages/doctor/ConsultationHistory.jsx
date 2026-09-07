import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import DoctorNavbar from '../../components/DoctorNavbar';

const HISTORY_DATA = [
  { id: 'C-9021', patient: 'Ravi Verma (45/M)', date: '05 Sep 2026', time: '10:15 AM', diagnosis: 'Acute Pharyngitis', type: 'Tele-Consult' },
  { id: 'C-9020', patient: 'Sunita Sharma (38/F)', date: '05 Sep 2026', time: '09:30 AM', diagnosis: 'Hypertension Follow-up', type: 'In-Person' },
  { id: 'C-9019', patient: 'Mohan Das (68/M)', date: '04 Sep 2026', time: '02:45 PM', diagnosis: 'Osteoarthritis Flare', type: 'Tele-Consult' },
  { id: 'C-9018', patient: 'Geeta Devi (55/F)', date: '04 Sep 2026', time: '11:20 AM', diagnosis: 'Type 2 Diabetes Routine Check', type: 'In-Person' },
];

export default function ConsultationHistory() {
  const { user } = useAuth();
  
  return (
    <div className="bg-surface-container-lowest text-on-surface font-sans min-h-screen pt-20">
      <DoctorNavbar />
      <main className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-headline-lg font-bold">Consultation History</h1>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[20px]">search</span>
              <input 
                type="text" 
                placeholder="Search patient name or ID..."
                className="h-10 pl-10 pr-4 bg-surface-container border border-surface-variant rounded-lg text-body-md outline-none focus:border-primary transition-colors w-full sm:w-64"
              />
            </div>
            <button className="h-10 px-4 bg-surface-container border border-surface-variant text-on-surface rounded-lg font-bold flex items-center gap-2 hover:bg-surface-variant transition-colors">
              <span className="material-symbols-outlined text-[20px]">filter_list</span>
              Filters
            </button>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-surface-variant rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-surface-variant">
                  <th className="px-6 py-4 text-label-md font-bold text-secondary uppercase tracking-wider">Consult ID</th>
                  <th className="px-6 py-4 text-label-md font-bold text-secondary uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-4 text-label-md font-bold text-secondary uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-4 text-label-md font-bold text-secondary uppercase tracking-wider">Diagnosis</th>
                  <th className="px-6 py-4 text-label-md font-bold text-secondary uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-label-md font-bold text-secondary uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-variant">
                {HISTORY_DATA.map(record => (
                  <tr key={record.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-6 py-4 font-bold text-on-surface">{record.id}</td>
                    <td className="px-6 py-4 text-body-md text-on-surface">{record.patient}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-label-md font-bold text-on-surface">{record.date}</span>
                        <span className="text-label-sm text-secondary">{record.time}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-body-md text-on-surface">{record.diagnosis}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-label-sm font-bold ${
                        record.type === 'Tele-Consult' ? 'bg-primary-container text-on-primary-container' : 'bg-surface-variant text-on-surface-variant'
                      }`}>
                        <span className="material-symbols-outlined text-[16px]">
                          {record.type === 'Tele-Consult' ? 'video_camera_front' : 'local_hospital'}
                        </span>
                        {record.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="inline-flex items-center gap-2 px-4 py-2 border border-surface-variant text-on-surface rounded-lg font-bold text-label-md hover:bg-surface-container transition-colors">
                        View Summary
                      </button>
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
