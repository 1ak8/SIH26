import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import DoctorNavbar from '../../components/DoctorNavbar';

const QUEUE_DATA = [
  { id: 4, name: 'Aditya Verma', age: '32 yrs', gender: 'Male', location: 'Rampur', status: 'IN CONSULTATION', asha: 'Sunita Devi' },
  { id: 5, name: 'Savitri Devi', age: '54 yrs', gender: 'Female', location: 'Bilaspur', status: 'Next in Line' },
  { id: 6, name: 'Bharat Patel', age: '41 yrs', gender: 'Male', location: 'Dholpur', status: 'Waiting' },
  { id: 7, name: 'Pooja Kumari', age: '22 yrs', gender: 'Female', location: 'Rampur', status: 'Waiting' },
  { id: 8, name: 'Mohan Das', age: '68 yrs', gender: 'Male', location: 'Haripur', status: 'Waiting' },
];

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [sessionSeconds, setSessionSeconds] = useState(7163);

  useEffect(() => {
    api.get('/doctor/dashboard').then(r => setData(r.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setSessionSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (s) => {
    const hrs = String(Math.floor(s / 3600)).padStart(2, '0');
    const mins = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const secs = String(s % 60).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  return (
    <div className="bg-surface-container-lowest text-on-surface font-sans min-h-screen pt-20">
      <DoctorNavbar />

      <main className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-5">
        <div className="flex flex-col w-full">
          {/* Console Header */}
          <div className="w-full bg-surface-container-lowest border-b border-surface-variant pb-5 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 text-primary text-label-sm uppercase tracking-wider">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-primary-container animate-pulse"></span>
                  <span>Live Consultation Session</span>
                </div>
                <h1 className="text-headline-lg font-bold text-on-surface tracking-tight mt-1">Tele-OPD Doctor Console</h1>
                <div className="flex items-center gap-3 mt-1 text-on-surface-variant text-body-md">
                  <span className="font-bold text-on-surface">{user?.name || 'Dr. Rajesh Sharma, MD'}</span>
                  <span className="text-secondary">•</span>
                  <span>Virtual OPD Desk</span>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 self-start lg:self-center">
                <div className="bg-surface-container px-4 py-2 rounded-lg flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary text-[22px]">timer</span>
                  <div className="flex flex-col">
                    <span className="text-label-sm text-secondary uppercase">Session Time</span>
                    <span className="text-label-lg font-bold text-on-surface">{formatTime(sessionSeconds)}</span>
                  </div>
                </div>
                <div className="bg-surface-container px-4 py-2 rounded-lg flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-[22px]">groups</span>
                  <div className="flex flex-col">
                    <span className="text-label-sm text-secondary uppercase">Completed</span>
                    <span className="text-label-lg font-bold text-on-surface">{data?.completedToday || 19} Patients</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-surface-container p-6 rounded-xl border border-surface-variant">
              <h2 className="text-headline-md font-bold mb-2">Patients in Queue</h2>
              <p className="text-display-sm font-bold text-primary">6</p>
            </div>
            <div className="bg-surface-container p-6 rounded-xl border border-surface-variant">
              <h2 className="text-headline-md font-bold mb-2">Pending Labs</h2>
              <p className="text-display-sm font-bold text-tertiary">3</p>
            </div>
            <div className="bg-surface-container p-6 rounded-xl border border-surface-variant">
              <h2 className="text-headline-md font-bold mb-2">Prescriptions Sent</h2>
              <p className="text-display-sm font-bold text-secondary">19</p>
            </div>
          </div>

          {/* Patient Queue */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between bg-surface-container-low px-4 py-3 rounded-lg border border-surface-variant">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">reduce_capacity</span>
                <h2 className="text-headline-sm font-bold text-on-surface">Upcoming Consultations (Next 3)</h2>
              </div>
              <button className="text-secondary hover:text-on-surface p-1" title="Refresh Live Queue" type="button">
                <span className="material-symbols-outlined text-[20px]">sync</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {QUEUE_DATA.slice(0, 3).map(p => (
                <article key={p.id} className={`${p.status === 'IN CONSULTATION' ? 'bg-primary-fixed/40 border-l-4 border-l-primary-container' : 'bg-surface-container-lowest hover:bg-surface-container-low cursor-pointer'} border border-surface-variant p-4 rounded-lg flex flex-col gap-2 relative transition-colors`}>
                  <div className="flex items-center justify-between">
                    {p.status === 'IN CONSULTATION' ? (
                      <span className="inline-flex items-center gap-1.5 text-label-sm font-bold text-on-primary-container">
                        <span className="w-2 h-2 rounded-full bg-primary-container"></span>IN CONSULTATION
                      </span>
                    ) : (
                      <h3 className="text-headline-sm font-semibold text-on-surface">#{String(p.id).padStart(2, '0')} - {p.name}</h3>
                    )}
                    {p.status === 'IN CONSULTATION' ? (
                      <span className="material-symbols-outlined text-on-primary-container text-[24px]">video_call</span>
                    ) : (
                      <span className="bg-surface-container text-label-sm px-2 py-0.5 rounded text-on-surface-variant font-bold">{p.status}</span>
                    )}
                  </div>
                  {p.status === 'IN CONSULTATION' && (
                    <>
                      <div>
                        <h3 className="text-headline-sm font-bold text-on-surface">#{String(p.id).padStart(2, '0')} - {p.name}</h3>
                        <p className="text-body-md text-on-surface-variant">{p.age}, {p.gender} • {p.location}</p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-primary-container/30 text-label-sm text-secondary">
                        <span>Active Now</span>
                        <span className="text-primary font-bold">ASHA: {p.asha}</span>
                      </div>
                    </>
                  )}
                  {p.status !== 'IN CONSULTATION' && (
                    <p className="text-body-md text-on-surface-variant">{p.age}, {p.gender} • {p.location}</p>
                  )}
                </article>
              ))}
            </div>

            {/* Critical Triage Desk */}
            <div className="mt-3 p-3 bg-surface-container-low border border-surface-variant rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary text-[20px]">notification_important</span>
                <span className="text-label-sm font-bold text-on-surface">Critical Triage Desk</span>
              </div>
              <span className="text-label-sm font-bold text-tertiary">0 Cases Escalated</span>
            </div>
          </section>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-surface border-t border-surface-variant mt-8">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
          <div className="grid grid-cols-1 gap-5 grid-cols-2">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[28px]">verified</span>
                <span className="text-headline-sm text-on-surface font-bold">Ministry of Health & Family Welfare</span>
              </div>
              <p className="text-body-md text-on-surface-variant max-w-xl">AarogyaNet delivers verified public clinical connectivity across rural dispensaries, district hospitals, and tertiary research institutes under the National Digital Health Framework.</p>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-label-md text-secondary uppercase">Emergency Helplines</span>
              <span className="text-headline-sm font-bold text-tertiary">Toll-Free 1075 / 108</span>
              <span className="text-label-sm text-on-surface-variant">24x7 National Tele-Consult & Dispatch</span>
            </div>
          </div>
          <div className="mt-5 pt-3 border-t border-surface-variant flex flex-col sm:flex-row items-center justify-between gap-2 text-label-sm text-secondary">
            <p>© 2025 Government Public Healthcare Infrastructure. All citizen rights reserved.</p>
            <p>Radical Clarity & Rural Accessibility Compliant</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
