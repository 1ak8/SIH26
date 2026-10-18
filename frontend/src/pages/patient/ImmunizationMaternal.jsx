import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import PatientNavbar from '../../components/PatientNavbar';
import { useNavigate } from 'react-router-dom';

export default function ImmunizationMaternal() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [immData, setImmData] = useState(null);
  const [maternalData, setMaternalData] = useState(null);
  const defaultDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [activeModal, setActiveModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({ vaccineName: '', nextDueDate: defaultDate, facility: 'Anganwadi Centre 3', notes: '' });
  const [ancForm, setAncForm] = useState({ visitType: 'ANC-4', dateOfVisit: defaultDate, weeksPregnant: '34', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [visibleVaccineCount, setVisibleVaccineCount] = useState(4);
  const [visibleAncCount, setVisibleAncCount] = useState(3);
  const [visibleUpcomingCount, setVisibleUpcomingCount] = useState(3);

  const fetchImmunizations = () => {
    api.get('/patient/immunizations').then(r => {
      if (r.data?.data) setImmData(r.data.data);
    }).catch(() => {});
  };

  const fetchMaternal = () => {
    api.get('/patient/maternal-checkups').then(r => {
      if (r.data?.data) setMaternalData(r.data.data);
    }).catch(() => {});
  };

  useEffect(() => { 
    fetchImmunizations(); 
    fetchMaternal(); 
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 4000); };

  const handleScheduleVaccine = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        vaccineName: scheduleForm.vaccineName,
        nextDueDate: scheduleForm.nextDueDate || defaultDate,
        facility: scheduleForm.facility || 'Anganwadi Centre 3',
        notes: scheduleForm.notes || 'Routine child vaccination',
      };
      await api.post('/patient/immunizations', payload);
      showToast(`Vaccination "${payload.vaccineName}" scheduled successfully & saved to registry!`);
      setActiveModal(null);
      setScheduleForm({ vaccineName: '', nextDueDate: defaultDate, facility: 'Anganwadi Centre 3', notes: '' });
      fetchImmunizations();
    } catch (err) {
      console.error(err);
      showToast('Failed to schedule vaccination. Please try again.');
    } finally { setSubmitting(false); }
  };

  const handleCancelVaccine = async (id, name) => {
    if (!window.confirm(`Cancel scheduled vaccination: ${name}?`)) return;
    try {
      await api.patch(`/patient/immunizations/${id}/cancel`, { reason: 'Cancelled by patient' });
      showToast(`Vaccination "${name}" cancelled in database.`);
      fetchImmunizations();
    } catch { showToast('Failed to cancel.'); }
  };

  const handleScheduleANC = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        visitType: ancForm.visitType,
        dateOfVisit: ancForm.dateOfVisit || defaultDate,
        weeksPregnant: Number(ancForm.weeksPregnant || 34),
        notes: ancForm.notes || 'Routine antenatal review',
      };
      await api.post('/patient/maternal-checkups', payload);
      showToast(`ANC visit "${payload.visitType}" scheduled! Attending doctor notified.`);
      setActiveModal(null);
      setAncForm({ visitType: 'ANC-4', dateOfVisit: defaultDate, weeksPregnant: '34', notes: '' });
      fetchMaternal();
    } catch (err) {
      console.error(err);
      showToast('Failed to schedule ANC visit. Please check date.');
    } finally { setSubmitting(false); }
  };

  const stats = immData?.stats || { total: 0, completed: 0, scheduled: 0, overdue: 0 };
  const upcoming = immData?.upcoming || [];
  const completed = immData?.completed || [];
  const maternalCheckups = maternalData?.checkups || [];
  const sortedMaternalCheckups = [...maternalCheckups].sort((a, b) => new Date(a.dateOfVisit) - new Date(b.dateOfVisit));
  const maternalProfile = maternalData?.maternalProfile;
  const upcomingANC = maternalData?.upcoming || [];
  const completedANC = maternalData?.completed || [];

  const vaccineOptions = [
    'Measles-Rubella (MR-2)', 'DPT Booster-2', 'OPV Booster', 'Typhoid Conjugate Vaccine',
    'Hepatitis A Vaccine', 'Chickenpox (Varicella)', 'MMR-2', 'Tetanus Diphtheria (Td)',
  ];

  const visitTypeOptions = [
    { value: 'ANC-1', label: 'ANC-1 (First Trimester • 12 Weeks)' },
    { value: 'ANC-2', label: 'ANC-2 (Second Trimester • 20 Weeks)' },
    { value: 'ANC-3', label: 'ANC-3 (Third Trimester • 28 Weeks)' },
    { value: 'ANC-4', label: 'ANC-4 (Pre-Delivery • 34-36 Weeks)' },
    { value: 'postnatal', label: 'Postnatal Care (PNC Visit)' },
    { value: 'emergency', label: 'Emergency Gynecological Visit' },
  ];

  return (
    <div className="bg-slate-50 text-slate-900 font-sans min-h-screen selection:bg-teal-100 selection:text-teal-900">
      <PatientNavbar />

      <main className="w-full px-4 sm:px-6 lg:px-12 xl:px-16 pt-24 sm:pt-28 pb-16 max-w-7xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="mb-4">
          <Link 
            to="/patient" 
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-teal-700 text-xs font-bold transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Back to Patient Console</span>
          </Link>
        </div>

        {/* Vibrant Luminous Clinical Hero Banner */}
        <div className="w-full mb-8 rounded-3xl bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 text-white p-6 sm:p-8 shadow-xl shadow-teal-700/20 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <span className="material-symbols-outlined text-[30px]">vaccines</span>
              </div>

              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-xs font-black mb-2 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
                  <span>Mission Indradhanush • Universal Immunization Programme (UIP)</span>
                </div>

                <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                  Immunization &amp; Maternal Health
                </h1>
                <p className="text-xs sm:text-sm lg:text-base text-teal-50 font-medium mt-1.5 max-w-2xl leading-relaxed opacity-95">
                  ABDM verified digital immunization certificates, pediatric vaccine schedules &amp; antenatal care (ANC) clinical records.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0 self-start lg:self-auto">
              <div className="bg-white/15 backdrop-blur-md border border-white/25 px-4 py-3 rounded-2xl text-center min-w-[120px] shadow-sm">
                <span className="text-[10px] font-black uppercase tracking-wider text-teal-100 block">Vaccine Registry</span>
                <span className="text-lg font-black text-white font-mono mt-0.5 block">{stats.total} Doses</span>
              </div>
              <div className="bg-white/15 backdrop-blur-md border border-white/25 px-4 py-3 rounded-2xl text-center min-w-[120px] shadow-sm">
                <span className="text-[10px] font-black uppercase tracking-wider text-teal-100 block">Village Camp</span>
                <span className="text-lg font-black text-emerald-300 font-mono mt-0.5 block">This Thursday</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Immunizations', value: stats.total, icon: 'vaccines', color: 'teal', bg: 'bg-teal-50 text-teal-700 border-teal-200' },
            { label: 'Completed Doses', value: stats.completed, icon: 'verified', color: 'emerald', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
            { label: 'Upcoming Doses', value: stats.scheduled, icon: 'schedule', color: 'sky', bg: 'bg-sky-50 text-sky-700 border-sky-200' },
            { label: 'Overdue / Pending', value: stats.overdue, icon: 'warning', color: 'rose', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
          ].map((s, i) => (
            <div key={i} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs flex items-center gap-4 hover:border-teal-300 transition-all">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${s.bg}`}>
                <span className="material-symbols-outlined text-[24px]">{s.icon}</span>
              </div>
              <div>
                <span className="text-2xl font-black text-slate-900 leading-tight block font-mono">{s.value}</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{s.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Top Grid: Upcoming Vaccinations + Maternal Health Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          {/* Upcoming Vaccinations */}
          <div className="lg:col-span-2 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center shrink-0 shadow-2xs">
                  <span className="material-symbols-outlined text-[22px]">event_upcoming</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-heading text-xl font-black text-slate-900">Upcoming Vaccinations</h2>
                    <span className="bg-teal-50 text-teal-900 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-teal-200">
                      National Schedule
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Coordinated with Village Anganwadi &amp; Mission Indradhanush</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveModal('schedule-vaccine')} 
                className="h-10 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-teal-700/20 transition-all self-start sm:self-auto cursor-pointer active:scale-98"
              >
                <span className="material-symbols-outlined text-[17px]">add</span>
                <span>Schedule New Vaccine</span>
              </button>
            </div>

            {upcoming.length > 0 ? (
              <div className="space-y-3">
                {upcoming.slice(0, visibleUpcomingCount).map(imm => (
                  <div key={imm._id} className="bg-slate-50/70 hover:bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all">
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-teal-200 text-teal-700 flex items-center justify-center shrink-0 shadow-2xs">
                        <span className="material-symbols-outlined text-[24px]">vaccines</span>
                      </div>
                      <div>
                        <span className="text-base font-black text-slate-900 block leading-tight">{imm.vaccineName}</span>
                        <span className="text-xs text-slate-500 font-medium">Dose #{imm.doseNumber} • {imm.facility}</span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="material-symbols-outlined text-[15px] text-teal-700">schedule</span>
                          <span className="text-xs font-bold text-teal-950 font-mono">
                            Due: {new Date(imm.nextDueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-3 py-1 bg-teal-50 text-teal-900 border border-teal-200 text-[10px] font-black rounded-full uppercase tracking-wider">
                        Scheduled
                      </span>
                      <button 
                        onClick={() => handleCancelVaccine(imm._id, imm.vaccineName)} 
                        className="h-9 px-3 rounded-xl bg-white border border-rose-200 text-rose-700 text-xs font-bold hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}

                {upcoming.length > 3 && (
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
                    <span className="text-xs font-semibold text-slate-500">
                      Showing {Math.min(visibleUpcomingCount, upcoming.length)} of {upcoming.length} upcoming
                    </span>
                    <div className="flex items-center gap-2">
                      {visibleUpcomingCount < upcoming.length && (
                        <button
                          type="button"
                          onClick={() => setVisibleUpcomingCount(prev => prev + 3)}
                          className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-900 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[15px]">expand_more</span>
                          <span>Show More (+{Math.min(3, upcoming.length - visibleUpcomingCount)})</span>
                        </button>
                      )}
                      {visibleUpcomingCount > 3 && (
                        <button
                          type="button"
                          onClick={() => setVisibleUpcomingCount(3)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[15px]">expand_less</span>
                          <span>Show Less</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 text-center">
                <span className="material-symbols-outlined text-[44px] text-teal-600">check_circle</span>
                <p className="text-sm font-bold text-slate-700 mt-2">All due vaccinations are completed up to date!</p>
              </div>
            )}
          </div>

          {/* Maternal Health Card */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 hover:border-teal-400 shadow-sm flex flex-col justify-between transition-all">
            <div>
              <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center shrink-0 shadow-2xs">
                  <span className="material-symbols-outlined text-[22px]">child_care</span>
                </div>
                <div>
                  <h2 className="font-heading text-xl font-black text-slate-900">Maternal Health</h2>
                  <p className="text-xs text-slate-500 font-medium">ANC Visit Tracker &amp; Pregnancy Care</p>
                </div>
              </div>

              {maternalProfile?.isPregnant ? (
                <div className="space-y-3.5">
                  <div className="bg-teal-50/70 p-4 rounded-2xl border border-teal-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-teal-700 text-[18px]">pregnant_woman</span>
                      <span className="text-xs font-black text-teal-950 uppercase tracking-wider">Active Pregnancy Status</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-slate-500 font-medium">Gestational:</span> <span className="font-bold text-slate-900">{maternalProfile.weeksPregnant || '34'} Weeks</span></div>
                      <div><span className="text-slate-500 font-medium">Gravida / Para:</span> <span className="font-bold text-slate-900">G{maternalProfile.gravida || 2} / P{maternalProfile.para || 1}</span></div>
                      <div><span className="text-slate-500 font-medium">Clinical Risk:</span> <span className="font-bold text-emerald-700">Low (Normal)</span></div>
                      <div><span className="text-slate-500 font-medium">Care Doctor:</span> <span className="font-bold text-slate-900">Dr. Priya Verma</span></div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block mb-2">ANC Checkups Completed</span>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4].map(n => (
                        <div 
                          key={n} 
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 ${
                            completedANC.length >= n 
                              ? 'bg-teal-700 text-white border-teal-700 shadow-2xs' 
                              : 'bg-slate-100 text-slate-400 border-slate-300'
                          }`}
                        >
                          {n}
                        </div>
                      ))}
                      <span className="text-xs font-black text-slate-700 ml-2">{completedANC.length} of 4 Done</span>
                    </div>
                  </div>

                  {upcomingANC.length > 0 && (
                    <div className="bg-teal-50 p-3 rounded-xl border border-teal-200 text-xs">
                      <span className="text-[10px] font-black text-teal-900 uppercase tracking-wider block mb-0.5">Next Recommended Visit</span>
                      <span className="font-bold text-slate-900">
                        {upcomingANC[0].visitType} — {new Date(upcomingANC[0].nextVisitDate || upcomingANC[0].dateOfVisit).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-6">
                  <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-[36px]">pregnant_woman</span>
                  </div>
                  <p className="text-sm font-bold text-slate-700 mb-1">Maternal &amp; Child Health Record</p>
                  <p className="text-xs text-slate-500 max-w-xs mb-4">Book your periodic antenatal care (ANC) visits with CHC Sitapur gynecologists.</p>
                </div>
              )}
            </div>

            <button 
              onClick={() => setActiveModal('schedule-anc')} 
              className="w-full mt-4 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-teal-700/20 transition-all cursor-pointer active:scale-98"
            >
              <span className="material-symbols-outlined text-[18px]">calendar_month</span>
              <span>Book Antenatal (ANC) Visit</span>
            </button>
          </div>
        </div>

        {/* 1. ANC VISIT HISTORY */}
        {maternalCheckups.length > 0 && (
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center shrink-0 shadow-2xs">
                  <span className="material-symbols-outlined text-[22px]">medical_information</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-heading text-xl font-black text-slate-900">Antenatal Care (ANC) Visit History</h2>
                    <span className="bg-teal-50 text-teal-900 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-teal-200">
                      MCH Grid
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Antenatal care checkup records with clinical vitals &amp; nutrition supplements</p>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 px-3.5 py-1.5 rounded-full text-teal-900 text-xs font-black self-start sm:self-auto">
                <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse"></span>
                <span>Showing {Math.min(visibleAncCount, maternalCheckups.length)} of {maternalCheckups.length} ANC Visits</span>
              </div>
            </div>

            <div className="space-y-3.5">
              {sortedMaternalCheckups.slice(0, visibleAncCount).map((mc, idx) => {
                const isCompleted = mc.status === 'completed';
                const dateObj = mc.dateOfVisit ? new Date(mc.dateOfVisit) : null;
                const formattedDate = dateObj && !isNaN(dateObj.getTime())
                  ? dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                  : 'Date Scheduled (Morning OPD)';
                const monthText = dateObj && !isNaN(dateObj.getTime())
                  ? dateObj.toLocaleDateString('en-IN', { month: 'short' }).toUpperCase()
                  : 'ANC';
                const dayText = dateObj && !isNaN(dateObj.getTime())
                  ? dateObj.toLocaleDateString('en-IN', { day: '2-digit' })
                  : '0' + (idx + 1);

                return (
                  <div 
                    key={mc._id || idx} 
                    className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 hover:border-teal-300 transition-all shadow-2xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                      <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-white border border-teal-300 text-center shrink-0 shadow-2xs">
                          <span className="text-[10px] text-teal-800 font-black uppercase tracking-wider">{monthText}</span>
                          <span className="text-xl font-black text-slate-900 leading-none">{dayText}</span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase">{dateObj ? dateObj.getFullYear() : '2026'}</span>
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                              {mc.visitType} — Gestation Week {mc.weeksPregnant || '34'}
                            </h3>
                            <span className="text-[10px] font-mono font-bold text-teal-900 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 shadow-2xs">
                              Token #ANC-0{idx + 1}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 font-medium flex flex-wrap items-center gap-1.5">
                            <span className="material-symbols-outlined text-[15px] text-teal-700">domain</span>
                            <span>{mc.facility || 'CHC Sitapur Central'}</span>
                            <span>•</span>
                            <span className="text-slate-900 font-bold">{mc.doctorName || 'Dr. Priya Verma (Gynecologist)'}</span>
                          </p>

                          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs">
                            <span className="flex items-center gap-1 font-bold text-teal-950 bg-white px-2.5 py-0.5 rounded-md border border-slate-200">
                              <span className="material-symbols-outlined text-[15px] text-teal-600">calendar_today</span>
                              <span>Visit Date: <strong>{formattedDate}</strong></span>
                            </span>
                            <span className="text-slate-400 hidden sm:inline">•</span>
                            <span className="text-slate-600 font-medium">Slot: Morning (10:00 AM – 1:00 PM)</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="self-start sm:self-auto shrink-0">
                        <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black border uppercase tracking-wider shadow-2xs ${
                          isCompleted 
                            ? 'bg-emerald-50 text-emerald-900 border-emerald-300' 
                            : 'bg-teal-50 text-teal-900 border-teal-300'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-emerald-600' : 'bg-teal-600 animate-pulse'}`}></span>
                          <span>{isCompleted ? 'Completed Checkup' : 'Scheduled Appointment'}</span>
                        </span>
                      </div>
                    </div>

                    {/* Patient / Doctor Notes */}
                    {mc.notes && (
                      <div className="mb-3 text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200 font-medium leading-relaxed">
                        <strong className="font-black text-slate-900 mr-1.5">Patient / Consultation Note:</strong>
                        "{mc.notes}"
                      </div>
                    )}

                    {/* Vitals Grid */}
                    {mc.vitals && (mc.vitals.bloodPressure || mc.vitals.weight || mc.vitals.hemoglobin || mc.vitals.fetalHeartRate) && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs mb-3">
                        {mc.vitals.bloodPressure && (
                          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                            <span className="text-[10px] text-slate-400 font-bold block uppercase">Blood Pressure</span>
                            <span className="text-sm font-black text-slate-900 font-mono">{mc.vitals.bloodPressure} mmHg</span>
                          </div>
                        )}
                        {mc.vitals.weight && (
                          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                            <span className="text-[10px] text-slate-400 font-bold block uppercase">Mother's Weight</span>
                            <span className="text-sm font-black text-slate-900 font-mono">{mc.vitals.weight} kg</span>
                          </div>
                        )}
                        {mc.vitals.hemoglobin && (
                          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                            <span className="text-[10px] text-slate-400 font-bold block uppercase">Hemoglobin (Hb)</span>
                            <span className="text-sm font-black text-slate-900 font-mono">{mc.vitals.hemoglobin} g/dL</span>
                          </div>
                        )}
                        {mc.vitals.fetalHeartRate && (
                          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                            <span className="text-[10px] text-slate-400 font-bold block uppercase">Fetal Heart Rate</span>
                            <span className="text-sm font-black text-slate-900 font-mono">{mc.vitals.fetalHeartRate} bpm</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Clinical Findings */}
                    {mc.diagnosis && (
                      <div className="text-xs text-slate-700 font-medium bg-white p-3 rounded-xl border border-slate-200 mb-2">
                        <strong className="font-black text-slate-900 mr-1.5">Doctor Clinical Findings:</strong>
                        {mc.diagnosis}
                      </div>
                    )}

                    {/* Supplements */}
                    {mc.supplements?.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[11px] font-bold text-slate-400 mr-1">Supplements:</span>
                        {mc.supplements.map((s, i) => (
                          <span key={i} className="px-2.5 py-1 bg-teal-50 text-teal-900 border border-teal-200 text-[10px] font-bold rounded-lg">
                            {s.name} ({s.dosage})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {maternalCheckups.length > 3 && (
              <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-500">
                  Displaying <strong className="text-slate-900 font-black">{Math.min(visibleAncCount, maternalCheckups.length)}</strong> of <strong className="text-slate-900 font-black">{maternalCheckups.length}</strong> antenatal records
                </span>

                <div className="flex items-center gap-2">
                  {visibleAncCount < maternalCheckups.length && (
                    <button
                      type="button"
                      onClick={() => setVisibleAncCount(prev => prev + 3)}
                      className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-black flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer active:scale-98"
                    >
                      <span className="material-symbols-outlined text-[17px]">expand_more</span>
                      <span>Show More (+{Math.min(3, maternalCheckups.length - visibleAncCount)} ANC Visits)</span>
                    </button>
                  )}

                  {visibleAncCount > 3 && (
                    <button
                      type="button"
                      onClick={() => setVisibleAncCount(3)}
                      className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-300 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">expand_less</span>
                      <span>Show Less</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. COMPLETED VACCINATION HISTORY TABLE */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm mb-8 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center shrink-0 shadow-2xs">
                <span className="material-symbols-outlined text-[22px]">history</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-heading text-xl font-black text-slate-900">Vaccination History</h2>
                  <span className="bg-emerald-50 text-emerald-900 border border-emerald-300 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                    ABDM Certified
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">All completed immunizations with official government digital certificates</p>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 px-3.5 py-1.5 rounded-full text-teal-900 text-xs font-black self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse"></span>
              <span>Showing {Math.min(visibleVaccineCount, completed.length)} of {completed.length} Official Records</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-3.5 font-black text-slate-500 uppercase tracking-wider text-[11px]">#</th>
                  <th className="p-3.5 font-black text-slate-500 uppercase tracking-wider text-[11px]">Vaccine Name</th>
                  <th className="p-3.5 font-black text-slate-500 uppercase tracking-wider text-[11px]">Dose</th>
                  <th className="p-3.5 font-black text-slate-500 uppercase tracking-wider text-[11px]">Date Administered</th>
                  <th className="p-3.5 font-black text-slate-500 uppercase tracking-wider text-[11px]">Facility</th>
                  <th className="p-3.5 font-black text-slate-500 uppercase tracking-wider text-[11px]">Administered By</th>
                  <th className="p-3.5 font-black text-slate-500 uppercase tracking-wider text-[11px]">Status</th>
                  <th className="p-3.5 font-black text-slate-500 uppercase tracking-wider text-[11px]">Certificate ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {completed.length > 0 ? completed.slice(0, visibleVaccineCount).map((imm, idx) => (
                  <tr key={imm._id || idx} className="hover:bg-slate-50">
                    <td className="p-3.5 text-xs font-mono font-bold text-slate-400">{String(idx + 1).padStart(2, '0')}</td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-teal-600 text-[18px]">vaccines</span>
                        <span className="text-xs font-black text-slate-900">{imm.vaccineName}</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-bold text-slate-700">Dose #{imm.doseNumber}</td>
                    <td className="p-3.5 font-medium text-slate-600">
                      {new Date(imm.dateAdministered).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-3.5 text-slate-600">{imm.facility}</td>
                    <td className="p-3.5 text-slate-600">{imm.administeredBy}</td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-900 border border-emerald-300 text-[10px] font-black rounded-full uppercase">
                        Completed
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="text-xs font-mono font-bold text-teal-900 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                        {imm.certificateId || `VAX-${100000 + idx + 1}`}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="8" className="p-6 text-center text-sm text-slate-500 font-medium">No vaccination records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Show More / Show Less */}
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-500">
              Displaying <strong className="text-slate-900 font-black">{Math.min(visibleVaccineCount, completed.length)}</strong> of <strong className="text-slate-900 font-black">{completed.length}</strong> official vaccination certificates
            </span>

            <div className="flex items-center gap-2">
              {visibleVaccineCount < completed.length && (
                <button
                  type="button"
                  onClick={() => setVisibleVaccineCount(prev => prev + 20)}
                  className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-black flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer active:scale-98"
                >
                  <span className="material-symbols-outlined text-[17px]">expand_more</span>
                  <span>Show More (+{Math.min(20, completed.length - visibleVaccineCount)} Records)</span>
                </button>
              )}

              {visibleVaccineCount > 4 && (
                <button
                  type="button"
                  onClick={() => setVisibleVaccineCount(4)}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-300 transition-all cursor-pointer flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">expand_less</span>
                  <span>Show Less</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Village Health Camp Info */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm mb-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[32px]">vaccines</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-heading text-xl font-black text-slate-900">Village Health Camp — Immunization Day</h3>
                <span className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-900 border border-teal-200 text-xs font-black px-3 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-pulse"></span>
                  <span>This Thursday • इस गुरुवार</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">Anganwadi Centre 3, Ward 4 — Walk-in free for all mothers and infants</p>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-700 flex flex-wrap gap-2">
            <span className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs text-slate-800 flex items-center gap-1.5"><span className="material-symbols-outlined text-teal-600 text-[14px]">check</span> Free Vaccination (Polio/BCG/TT/MR)</span>
            <span className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs text-slate-800 flex items-center gap-1.5"><span className="material-symbols-outlined text-teal-600 text-[14px]">check</span> BP, Sugar &amp; Weight Check</span>
            <span className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs text-slate-800 flex items-center gap-1.5"><span className="material-symbols-outlined text-teal-600 text-[14px]">check</span> Nutrition Supplements (IFA/Calcium)</span>
            <span className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs text-slate-800 flex items-center gap-1.5"><span className="material-symbols-outlined text-teal-600 text-[14px]">check</span> Growth Monitoring (Weighing)</span>
          </div>
        </div>

      </main>

      {/* Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200">
            <div className="px-6 py-4.5 border-b border-teal-500/30 flex items-center justify-between bg-gradient-to-r from-slate-900 to-teal-950 text-white">
              <h3 className="text-base font-black text-white font-heading flex items-center gap-2">
                <span className="material-symbols-outlined text-teal-400 text-[22px]">
                  {activeModal === 'schedule-vaccine' ? 'vaccines' : 'calendar_month'}
                </span>
                <span>{activeModal === 'schedule-vaccine' ? 'Schedule New Vaccination' : 'Book Antenatal (ANC) Visit'}</span>
              </h3>
              <button 
                onClick={() => setActiveModal(null)} 
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Close"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {activeModal === 'schedule-vaccine' && (
                <form onSubmit={handleScheduleVaccine} className="flex flex-col gap-4 text-xs">
                  <div className="bg-teal-50 p-4 rounded-2xl border border-teal-200 flex items-start gap-3">
                    <span className="material-symbols-outlined text-teal-700 text-[24px]">info</span>
                    <div>
                      <h4 className="text-sm font-black text-teal-950">ASHA Worker Coordination</h4>
                      <p className="text-xs text-teal-800 font-medium">Sunita Devi will be alerted to reserve the vaccine batch at Anganwadi Centre 3.</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-black text-slate-700">Vaccine Name <span className="text-rose-500">*</span></label>
                    <select 
                      required 
                      value={scheduleForm.vaccineName} 
                      onChange={e => setScheduleForm({ ...scheduleForm, vaccineName: e.target.value })} 
                      className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                    >
                      <option value="">Select Vaccine...</option>
                      {vaccineOptions.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-black text-slate-700">Preferred Date <span className="text-rose-500">*</span></label>
                    <input 
                      type="date" 
                      required 
                      value={scheduleForm.nextDueDate} 
                      onChange={e => setScheduleForm({ ...scheduleForm, nextDueDate: e.target.value })} 
                      className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 font-mono" 
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-black text-slate-700">Facility / Location</label>
                    <select 
                      value={scheduleForm.facility} 
                      onChange={e => setScheduleForm({ ...scheduleForm, facility: e.target.value })} 
                      className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                    >
                      <option>Anganwadi Centre 3</option>
                      <option>CHC Sitapur Central</option>
                      <option>District Hospital Sitapur</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-black text-slate-700">Notes for Health Worker (Optional)</label>
                    <textarea 
                      rows="2" 
                      value={scheduleForm.notes} 
                      onChange={e => setScheduleForm({ ...scheduleForm, notes: e.target.value })} 
                      placeholder="e.g. Needs home visit assistance or vaccine card update..." 
                      className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 resize-none"
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    disabled={submitting} 
                    className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white font-black text-xs rounded-xl shadow-md shadow-teal-700/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer mt-1 active:scale-98"
                  >
                    {submitting ? <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> : <span className="material-symbols-outlined text-[18px]">send</span>}
                    <span>{submitting ? 'Scheduling...' : 'Confirm Vaccination Appointment'}</span>
                  </button>
                </form>
              )}

              {activeModal === 'schedule-anc' && (
                <form onSubmit={handleScheduleANC} className="flex flex-col gap-4 text-xs">
                  <div className="bg-teal-50 p-4 rounded-2xl border border-teal-200 flex items-start gap-3">
                    <span className="material-symbols-outlined text-teal-700 text-[24px]">pregnant_woman</span>
                    <div>
                      <h4 className="text-sm font-black text-teal-950">ANC Clinic Booking</h4>
                      <p className="text-xs text-teal-800 font-medium">Dr. Priya Verma (Gynecologist • CHC Sitapur Central) will be assigned.</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-black text-slate-700">Visit Stage / Type <span className="text-rose-500">*</span></label>
                    <select 
                      required 
                      value={ancForm.visitType} 
                      onChange={e => setAncForm({ ...ancForm, visitType: e.target.value })} 
                      className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                    >
                      {visitTypeOptions.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-black text-slate-700">Preferred Date <span className="text-rose-500">*</span></label>
                    <input 
                      type="date" 
                      required 
                      value={ancForm.dateOfVisit} 
                      onChange={e => setAncForm({ ...ancForm, dateOfVisit: e.target.value })} 
                      className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 font-mono" 
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-black text-slate-700">Gestational Weeks (Optional)</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="42" 
                      value={ancForm.weeksPregnant} 
                      onChange={e => setAncForm({ ...ancForm, weeksPregnant: e.target.value })} 
                      placeholder="e.g. 34" 
                      className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 font-mono" 
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-black text-slate-700">Symptoms or Queries to Discuss</label>
                    <textarea 
                      rows="2" 
                      value={ancForm.notes} 
                      onChange={e => setAncForm({ ...ancForm, notes: e.target.value })} 
                      placeholder="e.g. Swollen feet, blood pressure check, iron supplement refill..." 
                      className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 resize-none"
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    disabled={submitting} 
                    className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white font-black text-xs rounded-xl shadow-md shadow-teal-700/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer mt-1 active:scale-98"
                  >
                    {submitting ? <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> : <span className="material-symbols-outlined text-[18px]">send</span>}
                    <span>{submitting ? 'Booking...' : 'Book Antenatal Visit'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-teal-300 border border-teal-500/40 p-4 rounded-2xl shadow-xl flex items-center gap-3 max-w-md animate-fadeIn text-xs font-black">
          <span className="material-symbols-outlined text-[20px] text-teal-400">verified</span>
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
