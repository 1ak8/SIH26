import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DoctorNavbar from '../../components/DoctorNavbar';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const QUEUE_DATA = [
  { _id: '6aa9748a7fbaf7f52bfb3735', id: 4, name: 'Aditya Verma', age: '32 yrs', gender: 'Male', location: 'Rampur Sub-Centre', status: 'IN CONSULTATION', asha: 'Sunita Devi', time: '10:30 AM', abha: '91-4820-1940-2810' },
  { _id: '6aa9748a7fbaf7f52bfb3737', id: 5, name: 'Savitri Devi', age: '54 yrs', gender: 'Female', location: 'Bilaspur PHC', status: 'Next in Line', asha: 'Kiran Bala', time: '10:45 AM', abha: '91-2311-9041-5512' },
  { _id: '6aa9748a7fbaf7f52bfb3733', id: 6, name: 'Bharat Patel', age: '41 yrs', gender: 'Male', location: 'Dholpur SC', status: 'Waiting', asha: 'Sunita Devi', time: '11:00 AM', abha: '91-8832-1002-3921' },
  { _id: '6aa9748b7fbaf7f52bfb3739', id: 7, name: 'Pooja Kumari', age: '22 yrs', gender: 'Female', location: 'Rampur Sub-Centre', status: 'Waiting', asha: 'Sunita Devi', time: '11:15 AM', abha: '91-3490-1122-8761' },
  { _id: '6aa9748b7fbaf7f52bfb373b', id: 8, name: 'Mohan Das', age: '68 yrs', gender: 'Male', location: 'Haripur', status: 'Waiting', asha: 'Gita Rani', time: '11:30 AM', abha: '91-9981-2244-1298' },
  { _id: '6aa9748b7fbaf7f52bfb373d', id: 9, name: 'Kamla Devi', age: '45 yrs', gender: 'Female', location: 'Bilaspur PHC', status: 'Waiting', asha: 'Kiran Bala', time: '11:45 AM', abha: '91-7711-4455-8899' },
];

export default function PatientQueue() {
  const { user } = useAuth();
  const [filter, setFilter] = useState('All');
  const [queue, setQueue] = useState(QUEUE_DATA);
  const [actionLoading, setActionLoading] = useState(null);
  const [walkinModalOpen, setWalkinModalOpen] = useState(false);
  const [submittingWalkin, setSubmittingWalkin] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const [walkinForm, setWalkinForm] = useState({
    name: '',
    phone: '',
    age: '35',
    gender: 'Male',
    location: 'CHC Sitapur Central Walk-in',
    reason: 'Fever, sore throat and body ache',
    timeSlot: 'Immediate (Walk-in)',
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchQueue = () => {
    api.get('/doctor/queue')
      .then(res => {
        if (res.data?.data?.length > 0) {
          const formatted = res.data.data.map((item, idx) => ({
            _id: item._id,
            id: item.tokenNumber || idx + 1,
            name: item.patient?.name || 'Citizen',
            age: item.patient?.dateOfBirth ? `${Math.floor((Date.now() - new Date(item.patient.dateOfBirth))/(365.25*24*3600*1000))} yrs` : '32 yrs',
            gender: item.patient?.gender ? (item.patient.gender.charAt(0).toUpperCase() + item.patient.gender.slice(1)) : 'Male',
            location: item.facility?.name || 'Sitapur Rural SC',
            status: item.status === 'in_consultation' ? 'IN CONSULTATION' : item.status === 'in_queue' ? 'Next in Line' : item.status === 'completed' ? 'Completed' : 'Waiting',
            rawStatus: item.status,
            asha: 'Sunita Devi',
            time: item.timeSlot || '10:30 AM',
            abha: item.patient?.abhaId || '91-4820-1940-2810',
            patientId: item.patient?._id,
            reason: item.reason || 'General Consultation'
          }));
          setQueue(formatted);
        } else {
          setQueue(QUEUE_DATA);
        }
      })
      .catch(() => setQueue(QUEUE_DATA));
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusUpdate = async (item, newStatus) => {
    const targetId = item._id || item.id;
    setActionLoading(targetId);

    if (newStatus === 'completed') {
      setQueue(prev => prev.filter(p => (p._id !== targetId && p.id !== targetId)));

      const historyItem = {
        _id: targetId,
        id: `SEHAT-${Math.floor(1000 + Math.random() * 9000)}`,
        patient: `${item.name} (${item.age || '32 yrs'}/${item.gender || 'M'})`,
        patientName: item.name,
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
        diagnosis: item.reason || 'General Tele-Consultation Completed',
        type: 'Tele-Consult',
        facility: item.location || 'CHC Sitapur Central',
        abha: item.abha || '91-4820-1940-2810',
        medicines: [],
        clinicalNotes: 'Consultation concluded by attending physician.',
        isDigitallySigned: true,
        createdAt: new Date().toISOString(),
      };

      try {
        const existing = JSON.parse(localStorage.getItem('sehatsaarthi_doctor_history') || '[]');
        localStorage.setItem('sehatsaarthi_doctor_history', JSON.stringify([historyItem, ...existing]));
      } catch(e) {}

      showToast(`Token #${item.id} (${item.name}) marked as Completed & logged to history!`);
    } else {
      setQueue(prev => prev.map(p => {
        const match = (p._id && p._id === targetId) || (p.id && p.id === targetId);
        if (match) {
          return {
            ...p,
            status: 'IN CONSULTATION',
            rawStatus: 'in_consultation',
          };
        }
        return p;
      }));

      showToast(`Token #${item.id} (${item.name}) marked as IN CONSULTATION!`);
    }

    try {
      await api.put(`/doctor/queue/${targetId}/status`, { status: newStatus });
      fetchQueue();
    } catch (e) {
      console.warn('Queue updated locally:', e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateWalkin = async (e) => {
    e.preventDefault();
    if (!walkinForm.name) {
      showToast('Please enter citizen name');
      return;
    }
    setSubmittingWalkin(true);
    try {
      const res = await api.post('/doctor/walkin', walkinForm);
      if (res.data?.success) {
        showToast(`Token generated for walk-in patient "${walkinForm.name}"!`);
        setWalkinModalOpen(false);
        setWalkinForm({
          name: '',
          phone: '',
          age: '35',
          gender: 'Male',
          location: 'CHC Sitapur Central Walk-in',
          reason: 'Fever, sore throat and body ache',
          timeSlot: 'Immediate (Walk-in)',
        });
        fetchQueue();
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to generate walk-in token.');
    } finally {
      setSubmittingWalkin(false);
    }
  };

  const currentList = queue.length > 0 ? queue : QUEUE_DATA;

  const filteredQueue = currentList.filter(p => {
    if (filter === 'All') return true;
    if (filter === 'Waiting') return p.status === 'Waiting' || p.status === 'Next in Line';
    if (filter === 'Active') return p.status === 'IN CONSULTATION';
    return true;
  });

  return (
    <div className="bg-slate-50 text-slate-900 font-sans min-h-screen selection:bg-teal-100 selection:text-teal-900">
      <DoctorNavbar />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-[120] bg-slate-900 text-teal-300 px-5 py-3 rounded-2xl shadow-xl border border-teal-500/40 flex items-center gap-3 text-xs font-black animate-fadeIn">
          <span className="material-symbols-outlined text-teal-400 text-[18px]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}
      
      <main className="w-full px-4 sm:px-6 lg:px-12 xl:px-16 pt-24 sm:pt-28 pb-16 max-w-7xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="mb-5">
          <Link 
            to="/doctor" 
            className="inline-flex items-center gap-2 text-slate-600 hover:text-teal-800 bg-white px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold shadow-2xs hover:border-teal-300 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px]">arrow_back</span>
            <span>Back to Console</span>
          </Link>
        </div>

        {/* Top Header & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-teal-600 text-[26px]">reduce_capacity</span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">Daily Patient OPD Queue</h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">Manage and call in rural patients waiting at PHC/Sub-Centre tele-kiosks.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-white rounded-2xl p-1 border border-slate-200 shadow-2xs">
              {['All', 'Active', 'Waiting'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    filter === f 
                      ? 'bg-teal-700 text-white shadow-sm shadow-teal-700/25' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {f} {f === 'All' ? `(${QUEUE_DATA.length})` : ''}
                </button>
              ))}
            </div>

            <button 
              onClick={() => setWalkinModalOpen(true)}
              className="h-10 px-4 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-black text-xs flex items-center gap-2 shadow-md shadow-teal-700/20 transition-all cursor-pointer active:scale-98"
            >
              <span className="material-symbols-outlined text-[17px]">person_add</span>
              <span>Add Rural Walk-in</span>
            </button>
          </div>
        </div>

        {/* Queue Table Card */}
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500">
                  <th className="px-6 py-4 font-black uppercase tracking-wider text-[11px]">Token #</th>
                  <th className="px-6 py-4 font-black uppercase tracking-wider text-[11px]">Citizen Details</th>
                  <th className="px-6 py-4 font-black uppercase tracking-wider text-[11px]">Sub-Centre &amp; ASHA</th>
                  <th className="px-6 py-4 font-black uppercase tracking-wider text-[11px]">Status</th>
                  <th className="px-6 py-4 font-black uppercase tracking-wider text-[11px] text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQueue.map(p => {
                  const isCurrent = p.status === 'IN CONSULTATION';
                  return (
                    <tr key={p.id} className={`hover:bg-slate-50/80 transition-colors ${isCurrent ? 'bg-teal-50/30' : ''}`}>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl font-mono font-black text-sm border ${
                          isCurrent 
                            ? 'bg-teal-700 text-white border-teal-700 shadow-2xs' 
                            : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}>
                          #{String(p.id).padStart(2, '0')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-900 leading-snug">{p.name}</span>
                          <span className="text-xs text-slate-500 font-semibold">{p.age}, {p.gender} • <span className="font-mono text-teal-800 font-bold">{p.abha}</span></span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-800">{p.location}</span>
                          <span className="text-[11px] text-teal-800 font-bold">ASHA: {p.asha}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {isCurrent ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-300 text-teal-950 text-[11px] font-black animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                            In Consultation
                          </span>
                        ) : p.status === 'Next in Line' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-300 text-sky-900 text-[11px] font-black">
                            Next in Line
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold">
                            Waiting ({p.time})
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link 
                            to="/doctor/prescriptions" 
                            state={{
                              patientId: p.patientId,
                              patientName: p.name,
                              abhaId: p.abha,
                              appointmentId: p._id,
                              reason: p.reason,
                              location: p.location,
                              token: p.id
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-xl font-bold text-xs transition-all shadow-2xs"
                          >
                            <span className="material-symbols-outlined text-[16px] text-teal-700">medication</span>
                            <span>Prescribe</span>
                          </Link>
                          {isCurrent ? (
                            <button 
                              onClick={() => handleStatusUpdate(p, 'completed')}
                              disabled={actionLoading === (p._id || p.id)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs shadow-sm transition-all cursor-pointer active:scale-98"
                            >
                              <span className="material-symbols-outlined text-[16px]">check_circle</span>
                              <span>Complete</span>
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleStatusUpdate(p, 'in_consultation')}
                              disabled={actionLoading === (p._id || p.id)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-black text-xs shadow-2xs transition-all cursor-pointer active:scale-98"
                            >
                              <span className="material-symbols-outlined text-[16px]">videocam</span>
                              <span>Call In</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL: ADD RURAL WALKIN CITIZEN */}
        {walkinModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-teal-950 text-white flex items-center justify-between border-b-2 border-teal-500">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
                    <span className="material-symbols-outlined text-[22px]">person_add</span>
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white font-heading">Generate Rural Walk-in Token</h3>
                    <p className="text-xs text-teal-300 font-bold">Issue immediate OPD queue token for walk-in patient</p>
                  </div>
                </div>
                <button 
                  onClick={() => setWalkinModalOpen(false)} 
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="Close"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              <form onSubmit={handleCreateWalkin} className="p-6 space-y-3.5 text-xs">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">Citizen Full Name <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={walkinForm.name}
                    onChange={e => setWalkinForm({...walkinForm, name: e.target.value})}
                    placeholder="e.g. Ramesh Chandra"
                    className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-teal-600"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase mb-1">Age</label>
                    <input
                      type="number"
                      value={walkinForm.age}
                      onChange={e => setWalkinForm({...walkinForm, age: e.target.value})}
                      placeholder="e.g. 45"
                      className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-teal-600 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase mb-1">Gender</label>
                    <select
                      value={walkinForm.gender}
                      onChange={e => setWalkinForm({...walkinForm, gender: e.target.value})}
                      className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-teal-600"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      value={walkinForm.phone}
                      onChange={e => setWalkinForm({...walkinForm, phone: e.target.value})}
                      placeholder="9876543210"
                      className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-teal-600 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase mb-1">Location / Ward</label>
                    <input
                      type="text"
                      value={walkinForm.location}
                      onChange={e => setWalkinForm({...walkinForm, location: e.target.value})}
                      placeholder="e.g. CHC Sitapur Central Walk-in"
                      className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-teal-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">Primary Symptoms / Chief Complaints</label>
                  <textarea
                    rows="2"
                    value={walkinForm.reason}
                    onChange={e => setWalkinForm({...walkinForm, reason: e.target.value})}
                    placeholder="e.g. High fever, headache, body pain x 2 days..."
                    className="w-full bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-teal-600 resize-none"
                  ></textarea>
                </div>

                <div className="pt-2 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setWalkinModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingWalkin}
                    className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-black shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50 active:scale-98"
                  >
                    <span className="material-symbols-outlined text-[16px]">confirmation_number</span>
                    <span>{submittingWalkin ? 'Generating...' : 'Issue OPD Token'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
