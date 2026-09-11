import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import DoctorNavbar from '../../components/DoctorNavbar';
import { Link } from 'react-router-dom';

const HISTORY_DATA = [
  { id: 'C-9021', patient: 'Ravi Verma (45/M)', date: '05 Sep 2026', time: '10:15 AM', diagnosis: 'Acute Pharyngitis & Throat Congestion', type: 'Tele-Consult', facility: 'Rampur Sub-Centre', abha: '91-4820-1940-2810' },
  { id: 'C-9020', patient: 'Sunita Sharma (38/F)', date: '05 Sep 2026', time: '09:30 AM', diagnosis: 'Hypertension Follow-up (Stable BP)', type: 'In-Person', facility: 'CHC Sitapur Central', abha: '91-2311-9041-5512' },
  { id: 'C-9019', patient: 'Mohan Das (68/M)', date: '04 Sep 2026', time: '02:45 PM', diagnosis: 'Osteoarthritis Knee Joint Pain', type: 'Tele-Consult', facility: 'Dholpur Sub-Centre', abha: '91-8832-1002-3921' },
  { id: 'C-9018', patient: 'Geeta Devi (55/F)', date: '04 Sep 2026', time: '11:20 AM', diagnosis: 'Type 2 Diabetes Routine Fasting Sugar Check', type: 'In-Person', facility: 'CHC Sitapur Central', abha: '91-3490-1122-8761' },
];

export default function ConsultationHistory() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');

  const filteredHistory = HISTORY_DATA.filter(h => 
    h.patient.toLowerCase().includes(search.toLowerCase()) || 
    h.diagnosis.toLowerCase().includes(search.toLowerCase()) ||
    h.id.toLowerCase().includes(search.toLowerCase())
  );
  
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
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Clinical Consultation History</h1>
            <p className="text-sm text-slate-600 font-medium">Historical OPD tele-consultations and clinical audit log under National Health Mission.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
              <input 
                type="text" 
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search patient, ID, or diagnosis..."
                className="h-11 pl-11 pr-4 bg-white border-2 border-slate-200 focus:border-amber-500 rounded-xl text-sm font-semibold outline-none transition-all w-full sm:w-72 shadow-xs"
              />
            </div>
            <button 
              onClick={() => alert('Filtering consultation records by date range')}
              className="h-11 px-4 bg-white border-2 border-slate-200 hover:border-amber-400 text-slate-800 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px] text-amber-600">filter_list</span>
              Filters
            </button>
          </div>
        </div>

        <div className="bg-white border-2 border-slate-200/90 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b-2 border-slate-100">
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Consult ID</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Citizen Details</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Session Time</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Clinical Diagnosis</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Consult Mode</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHistory.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-5">
                      <span className="font-mono text-sm font-black text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                        {record.id}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-base font-extrabold text-slate-900 block">{record.patient}</span>
                      <span className="text-xs text-slate-500 font-semibold">{record.facility} • <span className="font-mono text-amber-900">{record.abha}</span></span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-extrabold text-slate-800 block">{record.date}</span>
                      <span className="text-xs text-slate-500 font-semibold">{record.time}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-bold text-slate-900 max-w-xs block leading-snug">{record.diagnosis}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${
                        record.type === 'Tele-Consult' 
                          ? 'bg-amber-100 text-amber-950 border-amber-300' 
                          : 'bg-sky-100 text-sky-900 border-sky-300'
                      }`}>
                        <span className="material-symbols-outlined text-[16px]">
                          {record.type === 'Tele-Consult' ? 'videocam' : 'local_hospital'}
                        </span>
                        {record.type}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button 
                        onClick={() => alert(`Viewing Consultation Summary Dossier for ${record.id}`)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 border-2 border-slate-300 hover:bg-slate-100 text-slate-800 rounded-xl font-extrabold text-xs transition-all shadow-xs"
                      >
                        <span className="material-symbols-outlined text-[16px] text-amber-600">visibility</span>
                        Summary
                      </button>
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
                <span className="notranslate" translate="no">SehatSaarthi</span> delivers verified public clinical connectivity across rural dispensaries, district hospitals, and tertiary research institutes under the National Digital Health Framework.
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
