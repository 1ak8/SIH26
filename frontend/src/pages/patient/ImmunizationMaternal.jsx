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
      showToast(`Vaccination "${payload.vaccineName}" scheduled successfully & saved to database!`);
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
      showToast(`ANC visit "${payload.visitType}" scheduled & saved to database! Dr. Priya Verma notified.`);
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
  // Sort chronologically ascending so the earliest appointment appears at the top
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
    <div className="bg-[#fbfaf7] text-slate-900 font-sans min-h-screen">
      <PatientNavbar />

      <main className="w-full px-6 lg:px-12 xl:px-16 pt-28 pb-16">

        {/* Header - Styled to match Warm Amber Brand Identity */}
        <div className="w-full py-6 mb-8 bg-gradient-to-r from-amber-500/10 via-amber-100/30 to-transparent p-6 sm:p-7 rounded-3xl border-2 border-amber-200/80 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-amber-300/80 text-amber-900 text-xs font-bold mb-2 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Mission Indradhanush • Universal Immunization Programme</span>
              </div>
              <h1 className="font-heading text-3xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                <span className="material-symbols-outlined text-amber-600 text-[38px]">vaccines</span>
                <span>Immunization &amp; Maternal Health</span>
              </h1>
              <p className="text-base text-slate-700 font-semibold mt-1">
                ABDM Verified digital immunization certificates, child vaccine tracking &amp; antenatal care records
              </p>
            </div>
            <button 
              onClick={() => navigate('/patient')} 
              className="h-11 px-5 rounded-xl border-2 border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-xs font-extrabold flex items-center gap-2 transition-all shadow-xs self-start cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>

        {/* Stats Grid - Matching SehatSaarthi palette */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Immunizations', value: stats.total, icon: 'vaccines', color: 'amber' },
            { label: 'Completed Doses', value: stats.completed, icon: 'verified', color: 'emerald' },
            { label: 'Upcoming Doses', value: stats.scheduled, icon: 'schedule', color: 'sky' },
            { label: 'Overdue / Pending', value: stats.overdue, icon: 'warning', color: 'rose' },
          ].map((s, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border-2 border-slate-200/90 hover:border-amber-300 shadow-xs flex items-center gap-4 transition-all">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-2 ${
                s.color === 'amber' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                s.color === 'emerald' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                s.color === 'sky' ? 'bg-sky-50 border-sky-200 text-sky-700' :
                'bg-rose-50 border-rose-200 text-rose-700'
              }`}>
                <span className="material-symbols-outlined text-[24px]">{s.icon}</span>
              </div>
              <div>
                <span className="text-2xl font-black text-slate-900 leading-tight block">{s.value}</span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{s.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Top Grid: Upcoming Vaccinations + Maternal Health Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          {/* Upcoming Vaccinations */}
          <div className="lg:col-span-2 bg-white p-6 sm:p-7 rounded-3xl border-2 border-amber-300/80 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[22px]">event_upcoming</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-heading text-xl font-extrabold text-slate-900">Upcoming Vaccinations</h2>
                    <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-amber-300">
                      Universal Schedule
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">Scheduled via Mission Indradhanush / Village Anganwadi</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveModal('schedule-vaccine')} 
                className="h-10 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-all self-start sm:self-auto cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Schedule New Vaccine</span>
              </button>
            </div>

            {upcoming.length > 0 ? (
              <div className="space-y-3">
                {upcoming.slice(0, visibleUpcomingCount).map(imm => (
                  <div key={imm._id} className="bg-amber-50/40 hover:bg-amber-50/70 p-4 rounded-2xl border-2 border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all">
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-white border-2 border-amber-400 text-amber-800 flex items-center justify-center shrink-0 shadow-xs">
                        <span className="material-symbols-outlined text-[24px]">vaccines</span>
                      </div>
                      <div>
                        <span className="text-base font-extrabold text-slate-900 block leading-tight">{imm.vaccineName}</span>
                        <span className="text-xs text-slate-600 font-medium">Dose #{imm.doseNumber} • {imm.facility}</span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="material-symbols-outlined text-[15px] text-amber-700">schedule</span>
                          <span className="text-xs font-bold text-amber-900">
                            Due Date: {new Date(imm.nextDueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black rounded-full uppercase tracking-wider">
                        Scheduled
                      </span>
                      <button 
                        onClick={() => handleCancelVaccine(imm._id, imm.vaccineName)} 
                        className="h-9 px-3 rounded-xl bg-white border-2 border-rose-300 text-rose-700 text-xs font-bold hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}

                {/* Show More / Show Less for Upcoming Vaccinations */}
                {(upcoming.length > 3) && (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
                    <span className="text-xs font-semibold text-slate-500">
                      Showing {Math.min(visibleUpcomingCount, upcoming.length)} of {upcoming.length} upcoming
                    </span>
                    <div className="flex items-center gap-2">
                      {visibleUpcomingCount < upcoming.length && (
                        <button
                          type="button"
                          onClick={() => setVisibleUpcomingCount(prev => prev + 3)}
                          className="px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
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
                <span className="material-symbols-outlined text-[44px] text-amber-500">check_circle</span>
                <p className="text-sm font-bold text-slate-700 mt-2">All due vaccinations are completed up to date!</p>
              </div>
            )}
          </div>

          {/* Maternal Health Card - Styled to Match Project Brand */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border-2 border-slate-200/90 hover:border-amber-400 shadow-md flex flex-col justify-between transition-all">
            <div>
              <div className="flex items-center gap-3 mb-5 border-b border-slate-200 pb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[22px]">child_care</span>
                </div>
                <div>
                  <h2 className="font-heading text-xl font-extrabold text-slate-900">Maternal Health</h2>
                  <p className="text-xs text-slate-500 font-medium">ANC Visit Tracker &amp; Pregnancy Care</p>
                </div>
              </div>

              {maternalProfile?.isPregnant ? (
                <div className="space-y-3.5">
                  <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/90">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-amber-700 text-[18px]">pregnant_woman</span>
                      <span className="text-xs font-extrabold text-amber-950 uppercase tracking-wider">Active Pregnancy Status</span>
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
                              ? 'bg-amber-100 text-amber-900 border-amber-400' 
                              : 'bg-slate-100 text-slate-400 border-slate-300'
                          }`}
                        >
                          {n}
                        </div>
                      ))}
                      <span className="text-xs font-extrabold text-slate-700 ml-2">{completedANC.length} of 4 Done</span>
                    </div>
                  </div>

                  {upcomingANC.length > 0 && (
                    <div className="bg-amber-100/70 p-3 rounded-xl border border-amber-300 text-xs">
                      <span className="text-[10px] font-black text-amber-900 uppercase tracking-wider block mb-0.5">Next Recommended Visit</span>
                      <span className="font-bold text-slate-900">
                        {upcomingANC[0].visitType} — {new Date(upcomingANC[0].nextVisitDate || upcomingANC[0].dateOfVisit).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-6">
                  <div className="w-16 h-16 rounded-2xl bg-amber-50 border-2 border-amber-200 text-amber-600 flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-[36px]">pregnant_woman</span>
                  </div>
                  <p className="text-sm font-bold text-slate-700 mb-1">Maternal &amp; Child Health Record</p>
                  <p className="text-xs text-slate-500 max-w-xs mb-4">Book your periodic antenatal care (ANC) visits with CHC Sitapur gynecologists.</p>
                </div>
              )}
            </div>

            <button 
              onClick={() => setActiveModal('schedule-anc')} 
              className="w-full mt-4 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">calendar_month</span>
              <span>Book Antenatal (ANC) Visit</span>
            </button>
          </div>
        </div>

        {/* 1. ANC VISIT HISTORY - Placed strictly ABOVE Vaccination History */}
        {maternalCheckups.length > 0 && (
          <div className="bg-white p-6 sm:p-7 rounded-3xl border-2 border-amber-300/80 shadow-md mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[22px]">medical_information</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-heading text-xl font-extrabold text-slate-900">Antenatal Care (ANC) Visit History</h2>
                    <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-amber-300">
                      MCH Grid
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Antenatal care checkup records with clinical vitals &amp; nutrition supplements</p>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-300 px-3.5 py-1.5 rounded-full text-amber-900 text-xs font-black self-start sm:self-auto">
                <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse"></span>
                <span>Showing {Math.min(visibleAncCount, maternalCheckups.length)} of {maternalCheckups.length} ANC Visits</span>
              </div>
            </div>

            <div className="space-y-4">
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
                    className={`p-5 sm:p-6 rounded-2xl border-2 transition-all shadow-xs ${
                      isCompleted 
                        ? 'bg-amber-50/30 border-amber-200 hover:border-amber-400' 
                        : 'bg-amber-100/30 border-amber-300/90 hover:border-amber-400'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                      <div className="flex items-start gap-4">
                        {/* Calendar Badge Box with Day & Month */}
                        <div className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-white border-2 border-amber-400 text-center shrink-0 shadow-xs">
                          <span className="text-[10px] text-amber-800 font-black uppercase tracking-wider">{monthText}</span>
                          <span className="text-xl font-black text-amber-950 leading-none">{dayText}</span>
                          <span className="text-[9px] text-slate-500 font-bold uppercase">{dateObj ? dateObj.getFullYear() : '2026'}</span>
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                              {mc.visitType} — Gestation Week {mc.weeksPregnant || '34'}
                            </h3>
                            <span className="text-[10px] font-mono font-bold text-amber-900 bg-white px-2 py-0.5 rounded border border-amber-300 shadow-2xs">
                              Token #ANC-0{idx + 1}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 font-semibold flex flex-wrap items-center gap-1.5">
                            <span className="material-symbols-outlined text-[15px] text-amber-700">domain</span>
                            <span>{mc.facility || 'CHC Sitapur Central'}</span>
                            <span>•</span>
                            <span className="text-slate-900 font-extrabold">{mc.doctorName || 'Dr. Priya Verma (Gynecologist)'}</span>
                          </p>

                          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs">
                            <span className="flex items-center gap-1 font-extrabold text-amber-950 bg-white px-2.5 py-0.5 rounded-md border border-amber-200">
                              <span className="material-symbols-outlined text-[15px] text-amber-600">calendar_today</span>
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
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-400' 
                            : 'bg-amber-100 text-amber-900 border-amber-400'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-emerald-600' : 'bg-amber-600 animate-pulse'}`}></span>
                          <span>{isCompleted ? 'Completed Checkup' : 'Scheduled Appointment'}</span>
                        </span>
                      </div>
                    </div>

                    {/* Patient / Doctor Notes */}
                    {mc.notes && (
                      <div className="mb-3 text-xs text-amber-950 bg-white/95 p-3 rounded-xl border border-amber-200 font-medium leading-relaxed">
                        <strong className="font-extrabold text-amber-900 mr-1.5">Patient / Consultation Note:</strong>
                        "{mc.notes}"
                      </div>
                    )}

                    {/* Vitals Grid if recorded */}
                    {mc.vitals && (mc.vitals.bloodPressure || mc.vitals.weight || mc.vitals.hemoglobin || mc.vitals.fetalHeartRate) && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs mb-3">
                        {mc.vitals.bloodPressure && (
                          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                            <span className="text-[11px] text-slate-500 font-bold block">Blood Pressure</span>
                            <span className="text-sm font-black text-slate-900">{mc.vitals.bloodPressure} mmHg</span>
                          </div>
                        )}
                        {mc.vitals.weight && (
                          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                            <span className="text-[11px] text-slate-500 font-bold block">Mother's Weight</span>
                            <span className="text-sm font-black text-slate-900">{mc.vitals.weight} kg</span>
                          </div>
                        )}
                        {mc.vitals.hemoglobin && (
                          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                            <span className="text-[11px] text-slate-500 font-bold block">Hemoglobin (Hb)</span>
                            <span className="text-sm font-black text-slate-900">{mc.vitals.hemoglobin} g/dL</span>
                          </div>
                        )}
                        {mc.vitals.fetalHeartRate && (
                          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                            <span className="text-[11px] text-slate-500 font-bold block">Fetal Heart Rate</span>
                            <span className="text-sm font-black text-slate-900">{mc.vitals.fetalHeartRate} bpm</span>
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
                        <span className="text-[11px] font-bold text-slate-500 mr-1">Supplements:</span>
                        {mc.supplements.map((s, i) => (
                          <span key={i} className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-300 text-[10px] font-extrabold rounded-lg">
                            {s.name} ({s.dosage})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Show More / Show Less for ANC Visits */}
            {(maternalCheckups.length > 3) && (
              <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-500">
                  Displaying <strong className="text-slate-900 font-black">{Math.min(visibleAncCount, maternalCheckups.length)}</strong> of <strong className="text-slate-900 font-black">{maternalCheckups.length}</strong> antenatal records
                </span>

                <div className="flex items-center gap-2">
                  {visibleAncCount < maternalCheckups.length && (
                    <button
                      type="button"
                      onClick={() => setVisibleAncCount(prev => prev + 3)}
                      className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                      <span className="material-symbols-outlined text-[18px]">expand_more</span>
                      <span>Show More (+{Math.min(3, maternalCheckups.length - visibleAncCount)} ANC Visits)</span>
                    </button>
                  )}

                  {visibleAncCount > 3 && (
                    <button
                      type="button"
                      onClick={() => setVisibleAncCount(3)}
                      className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold border-2 border-slate-300 transition-all cursor-pointer flex items-center gap-1"
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

        {/* 2. COMPLETED VACCINATION HISTORY - Placed BELOW ANC History, Showing 4 with (+20) Show More */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border-2 border-slate-200/90 hover:border-amber-400 shadow-md mb-8 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-[22px]">history</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-heading text-xl font-extrabold text-slate-900">Vaccination History</h2>
                  <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                    ABDM Certified
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">All completed immunizations with official government digital certificates</p>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-300 px-3.5 py-1.5 rounded-full text-amber-900 text-xs font-black self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse"></span>
              <span>Showing {Math.min(visibleVaccineCount, completed.length)} of {completed.length} Official Records</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-amber-50/40 border-b border-slate-200">
                <tr>
                  <th className="p-4 font-extrabold text-slate-700 text-xs uppercase tracking-wider">#</th>
                  <th className="p-4 font-extrabold text-slate-700 text-xs uppercase tracking-wider">Vaccine Name</th>
                  <th className="p-4 font-extrabold text-slate-700 text-xs uppercase tracking-wider">Dose</th>
                  <th className="p-4 font-extrabold text-slate-700 text-xs uppercase tracking-wider">Date Administered</th>
                  <th className="p-4 font-extrabold text-slate-700 text-xs uppercase tracking-wider">Facility</th>
                  <th className="p-4 font-extrabold text-slate-700 text-xs uppercase tracking-wider">Administered By</th>
                  <th className="p-4 font-extrabold text-slate-700 text-xs uppercase tracking-wider">Status</th>
                  <th className="p-4 font-extrabold text-slate-700 text-xs uppercase tracking-wider">Certificate ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {completed.length > 0 ? completed.slice(0, visibleVaccineCount).map((imm, idx) => (
                  <tr key={imm._id || idx} className="hover:bg-amber-50/30 transition-colors">
                    <td className="p-4 text-xs font-mono font-bold text-slate-400">{String(idx + 1).padStart(2, '0')}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-amber-600 text-[18px]">vaccines</span>
                        <span className="text-sm font-bold text-slate-900">{imm.vaccineName}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-bold text-slate-700">Dose #{imm.doseNumber}</td>
                    <td className="p-4 text-sm font-medium text-slate-600">
                      {new Date(imm.dateAdministered).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-4 text-xs font-medium text-slate-600">{imm.facility}</td>
                    <td className="p-4 text-xs font-medium text-slate-600">{imm.administeredBy}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-900 border border-emerald-300 text-[10px] font-black rounded-full uppercase">
                        Completed
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-mono font-bold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-300">
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

          {/* Show More / Show Less Action Buttons */}
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-500">
              Displaying <strong className="text-slate-900 font-black">{Math.min(visibleVaccineCount, completed.length)}</strong> of <strong className="text-slate-900 font-black">{completed.length}</strong> official vaccination certificates
            </span>

            <div className="flex items-center gap-2">
              {visibleVaccineCount < completed.length && (
                <button
                  type="button"
                  onClick={() => setVisibleVaccineCount(prev => prev + 20)}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span className="material-symbols-outlined text-[18px]">expand_more</span>
                  <span>Show More (+{Math.min(20, completed.length - visibleVaccineCount)} Records)</span>
                </button>
              )}

              {visibleVaccineCount > 4 && (
                <button
                  type="button"
                  onClick={() => setVisibleVaccineCount(4)}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold border-2 border-slate-300 transition-all cursor-pointer flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">expand_less</span>
                  <span>Show Less (Collapse to 4)</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Village Health Camp Info */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border-2 border-amber-300/80 shadow-sm mb-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border-2 border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[32px]">vaccines</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-heading text-xl font-extrabold text-slate-900">Village Health Camp — Immunization Day</h3>
                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black px-3 py-0.5 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse"></span>
                  <span>This Thursday • इस गुरुवार</span>
                </span>
              </div>
              <p className="text-sm text-slate-600 font-medium">Anganwadi Centre 3, Ward 4 — Walk-in free for all mothers and infants</p>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs font-semibold text-slate-700 flex flex-wrap gap-2">
            <span className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs text-slate-800 flex items-center gap-1.5"><span className="material-symbols-outlined text-amber-600 text-[14px]">check</span> Free Vaccination (Polio/BCG/TT/MR)</span>
            <span className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs text-slate-800 flex items-center gap-1.5"><span className="material-symbols-outlined text-amber-600 text-[14px]">check</span> BP, Sugar &amp; Weight Check</span>
            <span className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs text-slate-800 flex items-center gap-1.5"><span className="material-symbols-outlined text-amber-600 text-[14px]">check</span> Nutrition Supplements (IFA/Calcium)</span>
            <span className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs text-slate-800 flex items-center gap-1.5"><span className="material-symbols-outlined text-amber-600 text-[14px]">check</span> Growth Monitoring (Weighing)</span>
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
                <span className="notranslate" translate="no">SehatSaarthi</span> Universal Immunization Programme provides real-time child vaccination tracking, antenatal care records, and digital ABDM compliance across rural Anganwadis and CHCs.
              </p>
            </div>
            <div className="flex flex-col gap-1.5 justify-center md:items-end">
              <span className="text-xs text-slate-500 uppercase font-extrabold tracking-wider">Universal Immunization Helpline</span>
              <span className="text-xl font-black text-rose-700">Toll-Free 1075 / 108</span>
              <span className="text-xs text-slate-500 font-semibold">24x7 Mission Indradhanush Support</span>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
            <p>© 2026 Government Public Healthcare Infrastructure. All citizen rights reserved.</p>
            <p className="text-amber-900 font-bold">ABDM Digital Immunization Certificate Compliant</p>
          </div>
        </div>
      </footer>

      {/* Modals - Warm Amber Style */}
      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border-2 border-slate-200">
            <div className="px-6 py-4 border-b border-amber-200 flex items-center justify-between bg-amber-50/80">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-700 text-[22px]">
                  {activeModal === 'schedule-vaccine' ? 'vaccines' : 'calendar_month'}
                </span>
                <span>{activeModal === 'schedule-vaccine' ? 'Schedule New Vaccination' : 'Book Antenatal (ANC) Visit'}</span>
              </h3>
              <button 
                onClick={() => setActiveModal(null)} 
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-amber-100 text-slate-600 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {activeModal === 'schedule-vaccine' && (
                <form onSubmit={handleScheduleVaccine} className="flex flex-col gap-4">
                  <div className="bg-amber-50 p-4 rounded-2xl border border-amber-300 flex items-start gap-3">
                    <span className="material-symbols-outlined text-amber-700 text-[24px]">info</span>
                    <div>
                      <h4 className="text-sm font-extrabold text-amber-950">ASHA Worker Coordination</h4>
                      <p className="text-xs text-amber-800 font-medium">Sunita Devi will be alerted to reserve the vaccine batch at Anganwadi Centre 3.</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-700">Vaccine Name <span className="text-rose-500">*</span></label>
                    <select 
                      required 
                      value={scheduleForm.vaccineName} 
                      onChange={e => setScheduleForm({ ...scheduleForm, vaccineName: e.target.value })} 
                      className="w-full bg-white px-4 py-3 rounded-xl border border-slate-300 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">Select Vaccine...</option>
                      {vaccineOptions.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-700">Preferred Date <span className="text-rose-500">*</span></label>
                    <input 
                      type="date" 
                      required 
                      value={scheduleForm.nextDueDate} 
                      onChange={e => setScheduleForm({ ...scheduleForm, nextDueDate: e.target.value })} 
                      className="w-full bg-white px-4 py-3 rounded-xl border border-slate-300 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500" 
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-700">Facility / Location</label>
                    <select 
                      value={scheduleForm.facility} 
                      onChange={e => setScheduleForm({ ...scheduleForm, facility: e.target.value })} 
                      className="w-full bg-white px-4 py-3 rounded-xl border border-slate-300 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option>Anganwadi Centre 3</option>
                      <option>CHC Sitapur Central</option>
                      <option>District Hospital Sitapur</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-700">Notes for Health Worker (Optional)</label>
                    <textarea 
                      rows="2" 
                      value={scheduleForm.notes} 
                      onChange={e => setScheduleForm({ ...scheduleForm, notes: e.target.value })} 
                      placeholder="e.g. Needs home visit assistance or vaccine card update..." 
                      className="w-full bg-white px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    disabled={submitting} 
                    className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer mt-1"
                  >
                    {submitting ? <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span> : <span className="material-symbols-outlined text-[20px]">send</span>}
                    <span>{submitting ? 'Scheduling...' : 'Confirm Vaccination Appointment'}</span>
                  </button>
                </form>
              )}

              {activeModal === 'schedule-anc' && (
                <form onSubmit={handleScheduleANC} className="flex flex-col gap-4">
                  <div className="bg-amber-50 p-4 rounded-2xl border border-amber-300 flex items-start gap-3">
                    <span className="material-symbols-outlined text-amber-700 text-[24px]">pregnant_woman</span>
                    <div>
                      <h4 className="text-sm font-extrabold text-amber-950">ANC Clinic Booking</h4>
                      <p className="text-xs text-amber-800 font-medium">Dr. Priya Verma (Gynecologist • CHC Sitapur Central) will be assigned.</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-700">Visit Stage / Type <span className="text-rose-500">*</span></label>
                    <select 
                      required 
                      value={ancForm.visitType} 
                      onChange={e => setAncForm({ ...ancForm, visitType: e.target.value })} 
                      className="w-full bg-white px-4 py-3 rounded-xl border border-slate-300 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      {visitTypeOptions.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-700">Preferred Date <span className="text-rose-500">*</span></label>
                    <input 
                      type="date" 
                      required 
                      value={ancForm.dateOfVisit} 
                      onChange={e => setAncForm({ ...ancForm, dateOfVisit: e.target.value })} 
                      className="w-full bg-white px-4 py-3 rounded-xl border border-slate-300 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500" 
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-700">Gestational Weeks (Optional)</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="42" 
                      value={ancForm.weeksPregnant} 
                      onChange={e => setAncForm({ ...ancForm, weeksPregnant: e.target.value })} 
                      placeholder="e.g. 34" 
                      className="w-full bg-white px-4 py-3 rounded-xl border border-slate-300 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500" 
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-700">Symptoms or Queries to Discuss</label>
                    <textarea 
                      rows="2" 
                      value={ancForm.notes} 
                      onChange={e => setAncForm({ ...ancForm, notes: e.target.value })} 
                      placeholder="e.g. Swollen feet, blood pressure check, iron supplement refill..." 
                      className="w-full bg-white px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    disabled={submitting} 
                    className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer mt-1"
                  >
                    {submitting ? <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span> : <span className="material-symbols-outlined text-[20px]">send</span>}
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
        <div className="fixed bottom-6 right-6 z-50 bg-white border-2 border-amber-400 p-5 rounded-2xl shadow-xl flex items-center gap-3.5 max-w-md animate-fadeIn">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">verified</span>
          </div>
          <div>
            <span className="text-sm font-extrabold text-slate-900 block">{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
}
