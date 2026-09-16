import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import PatientNavbar from '../../components/PatientNavbar';

export default function PatientDashboard() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'dashboard');
  const [visitRequests, setVisitRequests] = useState([]);
  const [visitForm, setVisitForm] = useState({
    reason: 'Routine Health Checkup & Vitals',
    urgency: 'routine',
    preferredSlot: 'Morning (8:00 AM - 12:00 PM)',
    address: 'Sitapur Ward 4, House 12',
    notes: '',
  });
  const [submittingVisit, setSubmittingVisit] = useState(false);
  const [visitAlert, setVisitAlert] = useState(null);

  // Tele-Consultation & Vitals States
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [vitalsForm, setVitalsForm] = useState({
    systolicBP: 120,
    diastolicBP: 80,
    heartRate: 74,
    spO2: 98,
    temperature: 98.6,
    bloodSugar: 105,
    weight: 68,
    height: 172,
  });
  const [isEditingVitals, setIsEditingVitals] = useState(false);
  const [vitalsSaving, setVitalsSaving] = useState(false);
  const [vitalsToast, setVitalsToast] = useState(null);

  // Video Call Tele-OPD States
  const localVideoRef = useRef(null);
  const streamRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callTimer, setCallTimer] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [activeCallTab, setActiveCallTab] = useState('call'); // 'call', 'chat', 'rx'
  const [callEndedSummary, setCallEndedSummary] = useState(null);

  // Lab Tests & Diagnostic Reports States
  const [labReports, setLabReports] = useState([]);
  const [loadingLabs, setLoadingLabs] = useState(false);
  const [selectedLabReport, setSelectedLabReport] = useState(null);
  const [labFilter, setLabFilter] = useState('All');

  const fetchLabReports = () => {
    setLoadingLabs(true);
    api.get('/patient/lab-reports')
      .then(res => {
        if (res.data?.data) {
          setLabReports(res.data.data);
          try { localStorage.setItem('sehatsaarthi_lab_reports', JSON.stringify(res.data.data)); } catch(e) {}
        }
      })
      .catch(err => {
        console.error('Error fetching lab reports:', err);
        try {
          const local = JSON.parse(localStorage.getItem('sehatsaarthi_lab_reports') || '[]');
          setLabReports(local);
        } catch(e) {}
      })
      .finally(() => setLoadingLabs(false));
  };

  const printDiagnosticReport = (report) => {
    if (!report) return;
    const printWindow = window.open('', '_blank', 'width=850,height=950');
    if (!printWindow) {
      window.print();
      return;
    }
    const dateFormatted = report.completedAt 
      ? new Date(report.completedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    const rows = (report.results || []).map(r => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 12px; font-weight: bold; color: #0f172a;">${r.parameter}</td>
        <td style="padding: 10px 12px; font-weight: 800; color: #78350f;">${r.value} <span style="font-size: 11px; color: #64748b;">${r.unit || ''}</span></td>
        <td style="padding: 10px 12px; color: #475569; font-family: monospace;">${r.normalRange || '—'}</td>
        <td style="padding: 10px 12px; text-align: right;">
          <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; ${
            r.flag === 'High' ? 'background: #ffe4e6; color: #9f1239;' :
            r.flag === 'Low' ? 'background: #fef3c7; color: #92400e;' :
            'background: #dcfce7; color: #166534;'
          }">${r.flag || 'Normal'}</span>
        </td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Diagnostic Report - ${report.orderId}</title>
          <style>
            @page { size: A4; margin: 15mm; }
            body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a; margin: 0; padding: 24px; font-size: 13px; line-height: 1.5; }
            .header { border-bottom: 3px solid #d97706; padding-bottom: 15px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; }
            .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; background: #fef3c7; padding: 12px 16px; border-radius: 8px; margin-bottom: 18px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { background: #f1f5f9; padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; color: #475569; letter-spacing: 0.5px; }
            .summary-box { background: #f0fdf4; border-left: 4px solid #16a34a; padding: 12px 16px; border-radius: 6px; margin-bottom: 20px; }
            .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #cbd5e1; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div style="font-size: 10px; font-weight: bold; color: #d97706; letter-spacing: 1px; text-transform: uppercase;">Ministry of Health &amp; Family Welfare</div>
              <h1 style="margin: 3px 0; font-size: 20px; color: #0f172a;">${report.facility || 'CHC Sitapur Central Pathology Lab'}</h1>
              <div style="font-size: 11px; color: #64748b;">NABL Accredited ISO 15189 • National Digital Health Network</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 18px; font-weight: 900; font-family: monospace; color: #92400e;">${report.orderId}</div>
              <div style="font-size: 10px; color: #64748b;">BARCODE VERIFIED</div>
            </div>
          </div>

          <div class="meta-grid">
            <div><span style="font-size: 10px; color: #64748b; display: block;">CITIZEN PATIENT</span><strong>${report.patientName || user?.name}</strong></div>
            <div><span style="font-size: 10px; color: #64748b; display: block;">PRESCRIBING DOCTOR</span><strong>${report.doctorName}</strong></div>
            <div><span style="font-size: 10px; color: #64748b; display: block;">TEST CATEGORY</span><strong>${report.category || 'Pathology'}</strong></div>
            <div><span style="font-size: 10px; color: #64748b; display: block;">COMPLETED DATE</span><strong>${dateFormatted}</strong></div>
          </div>

          <h2 style="font-size: 16px; margin: 0 0 12px 0; color: #0f172a;">${report.testName}</h2>

          <table>
            <thead>
              <tr>
                <th>Investigation Parameter</th>
                <th>Observed Value</th>
                <th>Reference Interval</th>
                <th style="text-align: right;">Status Flag</th>
              </tr>
            </thead>
            <tbody>
              ${rows || '<tr><td colspan="4" style="text-align:center; padding: 20px;">No quantitative parameters recorded.</td></tr>'}
            </tbody>
          </table>

          ${report.summary ? `
            <div class="summary-box">
              <strong style="color: #166534; display: block; margin-bottom: 4px; font-size: 12px;">Pathologist Clinical Impression &amp; Findings:</strong>
              <div>${report.summary}</div>
            </div>
          ` : ''}

          <div class="footer">
            <div>
              <strong>Digitally Signed &amp; Authenticated</strong><br/>
              ${report.verifiedBy || 'Dr. Anjali Seth (MD Pathology, Reg: NABL-84920)'}
            </div>
            <div style="text-align: right;">
              <strong>SehatSaarthi Digital Diagnostic Network</strong><br/>
              Compliant with ABDM Health Data Standards
            </div>
          </div>

          <script>
            window.onload = function() {
              window.focus();
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const fetchVisits = () => {
    api.get('/patient/visit-requests')
      .then(res => {
        if (res.data?.data) {
          setVisitRequests(res.data.data);
          try { localStorage.setItem('sehatsaarthi_visit_requests', JSON.stringify(res.data.data)); } catch(e) {}
        }
      })
      .catch(() => {
        try {
          const local = JSON.parse(localStorage.getItem('sehatsaarthi_visit_requests') || '[]');
          setVisitRequests(local);
        } catch(e) {}
      });
  };

  useEffect(() => {
    fetchVisits();
    fetchLabReports();
    const interval = setInterval(() => {
      fetchVisits();
      fetchLabReports();
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleRequestVisitSubmit = async (e) => {
    e.preventDefault();
    setSubmittingVisit(true);
    try {
      const payload = {
        patientName: user?.name || 'Patient Test',
        patientPhone: user?.phone || '9876543211',
        patientAddress: visitForm.address || 'Sitapur Ward 4',
        reason: visitForm.reason,
        urgency: visitForm.urgency,
        preferredSlot: visitForm.preferredSlot,
        notes: visitForm.notes,
      };
      const res = await api.post('/patient/visit-request', payload);
      const newVisit = res.data?.data;
      if (newVisit) {
        const updated = [newVisit, ...visitRequests.filter(v => v._id !== newVisit._id)];
        setVisitRequests(updated);
        try { localStorage.setItem('sehatsaarthi_visit_requests', JSON.stringify(updated)); } catch(e) {}
        setVisitAlert(`Visit request (${newVisit.requestId}) sent to Sunita Devi! She will confirm your slot shortly.`);
      }
      setActiveModal(null);
    } catch (err) {
      const fallback = {
        _id: 'local-' + Date.now(),
        requestId: 'VISIT-' + Math.floor(1000 + Math.random() * 9000),
        patientName: user?.name || 'Patient Test',
        patientPhone: user?.phone || '9876543211',
        patientAddress: visitForm.address || 'Sitapur Ward 4',
        ashaName: 'Sunita Devi',
        reason: visitForm.reason,
        urgency: visitForm.urgency,
        preferredSlot: visitForm.preferredSlot,
        notes: visitForm.notes,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      const updated = [fallback, ...visitRequests];
      setVisitRequests(updated);
      try { localStorage.setItem('sehatsaarthi_visit_requests', JSON.stringify(updated)); } catch(e) {}
      setVisitAlert(`Visit request (${fallback.requestId}) sent to Sunita Devi!`);
      setActiveModal(null);
    } finally {
      setSubmittingVisit(false);
    }
  };

  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state]);

  useEffect(() => {
    api.get('/patient/dashboard').then(r => {
      setData(r.data?.data);
      if (r.data?.data?.profile?.vitals) {
        const v = r.data.data.profile.vitals;
        setVitalsForm({
          systolicBP: v.systolicBP || 120,
          diastolicBP: v.diastolicBP || 80,
          heartRate: v.heartRate || 74,
          spO2: v.spO2 || 98,
          temperature: v.temperature || 98.6,
          bloodSugar: v.bloodSugar || 105,
          weight: v.weight || 68,
          height: v.height || 172,
        });
      }
    }).catch(() => {});
  }, []);

  // Tele-Consultation Camera & Timer Lifecycle
  useEffect(() => {
    let timer = null;
    if (activeModal === 'teleconsult-room' && !callEndedSummary) {
      timer = setInterval(() => {
        setCallTimer(prev => prev + 1);
      }, 1000);

      // Attempt to access user camera
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
          .then(stream => {
            streamRef.current = stream;
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = stream;
            }
            setIsCameraActive(true);
          })
          .catch(() => {
            setIsCameraActive(false);
          });
      }
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }

    return () => {
      if (timer) clearInterval(timer);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [activeModal, callEndedSummary]);

  const handleOpenVitalsNotes = (apt) => {
    const targetApt = apt || data?.upcomingAppointments?.[0] || {
      doctor: { name: 'Dr. Rajesh Sharma', specialization: 'General Medicine (CHC Sitapur)' },
      date: new Date(),
      timeSlot: '04:00 PM',
      tokenNumber: 4,
      reason: 'Follow-up on Viral Fever & Weakness',
      notes: 'Patient reports fever subsided, requesting Jan Aushadhi refill and vitals review.',
      sessionPasscode: 'MED-1744'
    };
    setSelectedAppointment(targetApt);
    setIsEditingVitals(false);
    setActiveModal('vitals-notes');
  };

  const handleEnterConsultation = (apt) => {
    const targetApt = apt || data?.upcomingAppointments?.[0] || {
      doctor: { name: 'Dr. Rajesh Sharma', specialization: 'General Medicine (CHC Sitapur)' },
      date: new Date(),
      timeSlot: '04:00 PM',
      tokenNumber: 4,
      reason: 'Follow-up on Viral Fever & Weakness',
      notes: 'Patient reports fever subsided, requesting Jan Aushadhi refill and vitals review.',
      sessionPasscode: 'MED-1744'
    };
    setSelectedAppointment(targetApt);
    setCallTimer(0);
    setCallEndedSummary(null);
    setIsMicMuted(false);
    setIsVideoOff(false);
    setActiveCallTab('call');
    setChatMessages([
      { sender: 'doctor', time: targetApt.timeSlot || '04:00 PM', text: `Namaste ${user?.name ? user.name.split(' ')[0] : 'Aditya'} ji! Dr. Rajesh Sharma here from CHC Sitapur Central (OPD-4). I have received your vitals & CBC blood count report. How are you feeling today?` },
    ]);
    setActiveModal('teleconsult-room');
  };

  const toggleMic = () => {
    setIsMicMuted(prev => {
      const next = !prev;
      if (streamRef.current) {
        streamRef.current.getAudioTracks().forEach(t => { t.enabled = !next; });
      }
      return next;
    });
  };

  const toggleVideo = () => {
    setIsVideoOff(prev => {
      const next = !prev;
      if (streamRef.current) {
        streamRef.current.getVideoTracks().forEach(t => { t.enabled = !next; });
      }
      return next;
    });
  };

  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const msg = chatInput.trim();
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages(prev => [...prev, { sender: 'patient', text: msg, time: now }]);
    setChatInput('');

    setTimeout(() => {
      let reply = "Good to know. Continue drinking clean boiled water and taking ORS fluids. I am digitally prescribing your recovery supplements.";
      const lower = msg.toLowerCase();
      if (lower.includes('fever') || lower.includes('temperature') || lower.includes('bukhar')) {
        reply = "Normal body temperature is maintained. Only take Paracetamol 500mg if temperature rises above 99.5°F. Rest today.";
      } else if (lower.includes('dawa') || lower.includes('medicine') || lower.includes('prescription')) {
        reply = "Your generic prescription SEHAT-9699 is generated with QR verification. You can pick it up from Jan Aushadhi Kendra or request ASHA delivery.";
      } else if (lower.includes('khana') || lower.includes('food') || lower.includes('diet')) {
        reply = "Take light meals: khichdi, curd, and warm vegetable soup. Avoid oily foods for 2 more days.";
      }
      setChatMessages(prev => [...prev, {
        sender: 'doctor',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1100);
  };

  const handleEndCall = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    const mins = Math.floor(callTimer / 60).toString().padStart(2, '0');
    const secs = (callTimer % 60).toString().padStart(2, '0');
    setCallEndedSummary({
      doctor: selectedAppointment?.doctor?.name || 'Dr. Rajesh Sharma',
      specialty: 'General Medicine • CHC Sitapur Central',
      duration: `${mins}:${secs}`,
      rxId: 'SEHAT-9699',
      diagnosis: 'Acute Viral Fever & Dehydration — Clinical Recovery Phase',
      notes: 'Advised hydration, 3-day generic replenishment, and post-viral rest. Follow up after 7 days if weakness persists.',
      medicines: [
        { name: 'Paracetamol 500mg (Tab)', dosage: '1 tablet TDS (As needed)', duration: '3 Days', generic: 'Paracetamol IP' },
        { name: 'ORS Electrolyte Sachet', dosage: '1 packet in 1 Litre boiled water', duration: '2 Days', generic: 'Oral Rehydration Salts' },
        { name: 'Vitamin C 500mg & Zinc', dosage: '1 chewable tablet daily after lunch', duration: '15 Days', generic: 'Ascorbic Acid IP' },
      ]
    });
  };

  const handleSaveVitals = async (e) => {
    e.preventDefault();
    setVitalsSaving(true);
    try {
      const payload = {
        vitals: {
          systolicBP: Number(vitalsForm.systolicBP),
          diastolicBP: Number(vitalsForm.diastolicBP),
          heartRate: Number(vitalsForm.heartRate),
          spO2: Number(vitalsForm.spO2),
          temperature: Number(vitalsForm.temperature),
          bloodSugar: Number(vitalsForm.bloodSugar),
          weight: Number(vitalsForm.weight),
          height: Number(vitalsForm.height),
          lastUpdated: new Date()
        }
      };
      await api.put('/patient/profile', payload);
      setData(prev => ({
        ...prev,
        profile: {
          ...prev?.profile,
          vitals: payload.vitals
        }
      }));
      setIsEditingVitals(false);
      setVitalsToast('✓ Vitals updated & synced to Dr. Rajesh Sharma OPD queue!');
      setTimeout(() => setVitalsToast(null), 4000);
    } catch {
      setIsEditingVitals(false);
      setVitalsToast('✓ Vitals updated locally!');
      setTimeout(() => setVitalsToast(null), 3000);
    } finally {
      setVitalsSaving(false);
    }
  };

  const vitals = data?.profile?.vitals || vitalsForm;

  return (
    <div className="bg-surface-container-lowest text-on-surface font-sans min-h-screen">
      <PatientNavbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* MAIN */}
      <main className="w-full bg-surface-container-lowest px-6 lg:px-12 xl:px-16 pt-28">
        {activeTab === 'dashboard' && (
          <div className="flex flex-col w-full pb-8">
            {/* Welcome Header */}
            <div className="w-full py-5 mb-3 bg-gradient-to-r from-amber-500/10 via-amber-100/30 to-transparent p-5 sm:p-6 rounded-2xl border border-amber-200/80 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-amber-300/80 text-amber-900 text-xs font-bold mb-2 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Ayushman Bharat Digital Health Grid</span>
                  </div>
                  <h1 className="font-heading text-3xl sm:text-4xl lg:text-[40px] font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                    Hello, <span className="notranslate" translate="no">{user?.name?.split(' ')[0] || 'Patient'}</span> <span className="text-3xl sm:text-4xl">👋</span>
                  </h1>
                  <p className="text-base sm:text-lg text-slate-700 font-semibold mt-1">
                    Your health, our priority — <span className="text-amber-800 underline decoration-amber-400 decoration-2">Sitapur Rural Sub-Centre</span>
                  </p>
                </div>
                <div className="inline-flex items-center gap-2.5 bg-white border-2 border-emerald-400 px-4 py-2.5 rounded-2xl text-emerald-900 text-sm font-extrabold shadow-sm self-start md:self-auto">
                  <span className="relative flex h-3 w-3 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
                  </span>
                  <span>{t('activeCitizenHealthRecord')}</span>
                </div>
              </div>
            </div>

            {/* Primary Care Services */}
            <section className="mb-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-sm shrink-0">
                    <span className="material-symbols-outlined text-[22px]">apps</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-heading text-2xl font-extrabold text-slate-900 tracking-tight">{t('primaryCareServices')}</h2>
                      <span className="bg-amber-100 text-amber-900 text-xs px-2.5 py-0.5 rounded-full border border-amber-300 font-extrabold hidden sm:inline">{t('fastAccess')}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium">{t('selectAnyServiceToBegin')}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { icon: 'calendar_month', title: t('bookTeleConsult'), desc: t('consultChc'), badge: t('freeGovService'), action: () => navigate('/patient/doctors'), color: 'amber', bg: 'from-amber-500/10 to-amber-50/50' },
                  { icon: 'airport_shuttle', title: 'Check Ambulance Availability', desc: 'Real-time GPS tracking, nearest ALS/BLS units & 108 emergency dispatch', badge: '108 Fleet • Live', action: () => navigate('/patient/ambulance'), color: 'rose', bg: 'from-rose-500/10 to-rose-50/50' },
                  { icon: 'science', title: t('labTestsReports'), desc: t('diagnosticHistoryVitals'), badge: t('instantSync'), action: () => setActiveModal('lab-tests'), color: 'sky', bg: 'from-sky-500/10 to-sky-50/50' },
                  { icon: 'near_me', title: t('findNearestPhc'), desc: t('dispensariesSubCentres'), badge: 'Sitapur Ward 4', action: () => setActiveModal('find-phc'), color: 'violet', bg: 'from-violet-500/10 to-violet-50/50' },
                ].map(card => (
                  <button 
                    key={card.title} 
                    onClick={card.action} 
                    className={`group text-left bg-white hover:bg-slate-50/80 p-6 rounded-2xl border-2 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-200 flex flex-col justify-between focus:outline-none focus:ring-4 focus:ring-amber-500/30 relative overflow-hidden ${
                      card.color === 'amber' ? 'border-amber-300 hover:border-amber-500' :
                      card.color === 'rose' ? 'border-rose-300 hover:border-rose-500' :
                      card.color === 'emerald' ? 'border-emerald-300 hover:border-emerald-500' :
                      card.color === 'sky' ? 'border-sky-300 hover:border-sky-500' :
                      'border-violet-300 hover:border-violet-500'
                    }`} 
                    type="button"
                  >
                    <div className="flex items-center justify-between w-full mb-5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border-2 transition-all ${
                        card.color === 'amber' ? 'bg-amber-50 text-amber-700 border-amber-200 group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-500' :
                        card.color === 'rose' ? 'bg-rose-50 text-rose-700 border-rose-200 group-hover:bg-rose-600 group-hover:text-white group-hover:border-rose-600' :
                        card.color === 'emerald' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500' :
                        card.color === 'sky' ? 'bg-sky-50 text-sky-700 border-sky-200 group-hover:bg-sky-500 group-hover:text-white group-hover:border-sky-500' :
                        'bg-violet-50 text-violet-700 border-violet-200 group-hover:bg-violet-500 group-hover:text-white group-hover:border-violet-500'
                      }`}>
                        <span className="material-symbols-outlined text-[32px]">{card.icon}</span>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-600 group-hover:text-white group-hover:bg-amber-500 group-hover:border-amber-500 transition-all shadow-xs">
                        <span className="material-symbols-outlined text-[20px] font-bold group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-xl font-extrabold text-slate-900 group-hover:text-amber-700 transition-colors block mb-1.5 leading-snug">{card.title}</span>
                      <p className="text-sm text-slate-600 font-medium leading-relaxed mb-4">{card.desc}</p>
                      <span className={`inline-flex items-center gap-1 text-xs font-extrabold px-3 py-1.5 rounded-full border shadow-xs ${
                        card.color === 'rose'
                          ? 'bg-rose-50 text-rose-900 border-rose-300'
                          : 'bg-amber-50 text-amber-900 border-amber-300'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${card.color === 'rose' ? 'bg-rose-600 animate-pulse' : 'bg-amber-600'}`}></span>
                        {card.badge}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Upcoming Care */}
            <section className="mb-10">
              <div className="bg-white p-6 sm:p-7 rounded-3xl border-2 border-amber-300/80 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-slate-200 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center shrink-0 shadow-sm">
                      <span className="material-symbols-outlined text-[22px]">event_upcoming</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-heading text-2xl font-extrabold text-slate-900 tracking-tight">Your Upcoming Care</h2>
                        <span className="bg-amber-600 text-white text-xs font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-xs">Next 48 Hours</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 font-medium">Verified doctor tele-consultation queue</p>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-2.5 bg-emerald-50 border-2 border-emerald-300 px-3.5 py-1.5 rounded-full text-emerald-900 text-xs font-extrabold self-start sm:self-auto shadow-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
                    <span>Live Queue Monitored • लाइव टोकन</span>
                  </div>
                </div>
                {data?.upcomingAppointments?.length > 0 ? (
                  data.upcomingAppointments.map(a => (
                    <div key={a._id} className="bg-amber-50/40 hover:bg-amber-50/70 p-5 sm:p-6 rounded-2xl border-2 border-amber-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-4 transition-all">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                        <div className="flex flex-col items-center justify-center w-24 py-3 rounded-2xl bg-white border-2 border-amber-400 text-center shrink-0 shadow-sm">
                          <span className="text-xs text-amber-800 font-extrabold uppercase tracking-wider">{new Date(a.date).toLocaleDateString('en', {weekday:'short'})}</span>
                          <span className="text-2xl font-black text-amber-950 leading-tight">{a.timeSlot}</span>
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                            <span className="text-xl font-extrabold text-slate-900 notranslate" translate="no">{a.doctor?.name || 'Dr. Rajesh Sharma'}</span>
                            <span className="bg-sky-100 text-sky-900 font-extrabold px-3 py-1 rounded-full text-xs border border-sky-300">Tele-Consult</span>
                            <span className="bg-emerald-100 text-emerald-900 font-black px-3.5 py-1 rounded-full text-xs border-2 border-emerald-400 shadow-xs notranslate" translate="no">Token #{a.tokenNumber}</span>
                          </div>
                          <p className="text-sm text-slate-700 font-semibold">General Medicine • ABHA Linked Consultation</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 pt-2 lg:pt-0">
                        <button 
                          onClick={() => handleOpenVitalsNotes(a)} 
                          className="h-12 px-5 rounded-xl border-2 border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-sm font-bold transition-all shadow-xs flex items-center gap-2" 
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[18px] text-amber-700">vital_signs</span>
                          <span>View Vitals &amp; Notes</span>
                        </button>
                        <button 
                          onClick={() => handleEnterConsultation(a)} 
                          className="h-12 px-6 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-sm font-extrabold transition-all flex items-center gap-2 shadow-sm transform hover:-translate-y-0.5 cursor-pointer" 
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[22px]">videocam</span>
                          <span>Enter Consultation</span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-amber-50/40 hover:bg-amber-50/70 p-5 sm:p-6 rounded-2xl border-2 border-amber-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5 transition-all">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                      <div className="flex flex-col items-center justify-center w-24 py-3 rounded-2xl bg-white border-2 border-amber-400 text-center shrink-0 shadow-sm">
                        <span className="text-xs text-amber-800 font-extrabold uppercase tracking-wider">Today</span>
                        <span className="text-2xl font-black text-amber-950 leading-tight">4:00</span>
                        <span className="text-xs text-amber-800 font-black uppercase">PM</span>
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                          <span className="text-xl font-extrabold text-slate-900 notranslate" translate="no">Dr. Rajesh Sharma</span>
                          <span className="bg-sky-100 text-sky-900 font-extrabold px-3 py-1 rounded-full text-xs border border-sky-300">Tele-Consult</span>
                          <span className="bg-emerald-100 text-emerald-900 font-black px-3.5 py-1 rounded-full text-xs border-2 border-emerald-400 shadow-xs notranslate" translate="no">Token #04</span>
                        </div>
                        <p className="text-sm text-slate-700 font-semibold">General Medicine • CHC Sitapur Central • ABHA Linked Consultation</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 pt-2 lg:pt-0">
                      <button 
                        onClick={() => handleOpenVitalsNotes(null)} 
                        className="h-12 px-5 rounded-xl border-2 border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-sm font-bold transition-all shadow-xs flex items-center gap-2" 
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[18px] text-amber-700">vital_signs</span>
                        <span>View Vitals &amp; Notes</span>
                      </button>
                      <button 
                        onClick={() => handleEnterConsultation(null)} 
                        className="h-12 px-6 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-sm font-extrabold transition-all flex items-center gap-2 shadow-sm transform hover:-translate-y-0.5 cursor-pointer" 
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[22px]">videocam</span>
                        <span>Enter Consultation</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>

              {/* Bottom Grid: Camp & ASHA Companion */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Village Health Camp */}
                <div className="bg-white p-6 sm:p-7 rounded-3xl border-2 border-slate-200/90 hover:border-amber-400 shadow-sm flex flex-col justify-between gap-5 transition-all duration-200">
                  <div>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-amber-50 border-2 border-amber-200 text-amber-700 flex items-center justify-center shrink-0 shadow-xs">
                        <span className="material-symbols-outlined text-[32px]">vaccines</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-xs uppercase tracking-wider text-slate-500 font-extrabold">Village Health Camp</span>
                          <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black px-3 py-0.5 rounded-full shadow-xs">
                            <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                            This Thursday • इस गुरुवार
                          </span>
                        </div>
                        <h3 className="text-xl font-extrabold text-slate-900 leading-snug">Immunization &amp; Maternal Health Checkup</h3>
                        <p className="text-sm text-slate-600 font-medium mt-0.5">Anganwadi Centre 3 • Walk-in free for all mothers and infants</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs font-semibold text-slate-700 flex flex-wrap gap-2">
                      <span className="bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-xs text-slate-800">✓ Free Vaccination (Polio/BCG/TT)</span>
                      <span className="bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-xs text-slate-800">✓ BP, Sugar &amp; Weight Check</span>
                      <span className="bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-xs text-slate-800">✓ Nutrition Supplements Refill</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                      <span className="material-symbols-outlined text-[18px] text-amber-600">location_on</span>
                      <span>Anganwadi Centre 3 (Ward 4)</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => navigate('/patient/immunization')}
                      className="h-11 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[18px]">vaccines</span>
                      <span>View Immunization Records</span>
                    </button>
                  </div>
                </div>

                {/* ASHA Companion Card */}
                <div className="bg-white p-6 sm:p-7 rounded-3xl border-2 border-amber-300 hover:border-amber-500 shadow-sm flex flex-col justify-between gap-5 transition-all duration-200">
                  <div>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative shrink-0">
                        <img src="/images/logo-transparent.png" alt="SehatSaarthi" className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400 shadow-xs notranslate" translate="no" />
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-xs" title="Active in Village"></span>
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-xs uppercase tracking-wider text-slate-500 font-extrabold">Village ASHA Companion</span>
                          <span className="inline-flex items-center gap-1 text-emerald-900 text-xs font-extrabold bg-emerald-50 px-3 py-0.5 rounded-full border border-emerald-300 shadow-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Active Today • उपलब्ध
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-extrabold text-slate-900 leading-tight notranslate" translate="no">Sunita Devi</h3>
                          <span className="material-symbols-outlined text-amber-600 text-[20px]" title="Govt Certified ASHA">verified</span>
                        </div>
                        <p className="text-xs text-slate-600 font-semibold mt-0.5">Govt Certified Field Health Worker • Sitapur Ward 4</p>
                      </div>
                    </div>

                    <div className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200/80 text-xs font-medium text-slate-700 leading-relaxed">
                      Assigned for home visits, child immunizations, Jan Aushadhi refills &amp; emergency PHC escort.
                      <div className="mt-2 text-xs font-extrabold text-amber-950 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-amber-700">schedule</span>
                        <span>Working Hours: 8:00 AM – 6:00 PM</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                    <a 
                      href="tel:9876543210" 
                      className="h-12 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-sm font-extrabold flex items-center justify-center gap-2 shadow-sm transition-all text-center"
                    >
                      <span className="material-symbols-outlined text-[20px]">call</span>
                      <span>Call Sunita Devi</span>
                    </a>
                    <button 
                      type="button" 
                      onClick={() => setActiveModal('request-visit')}
                      className="h-12 px-4 rounded-xl bg-white border-2 border-amber-400 hover:bg-amber-50 text-slate-800 text-sm font-extrabold flex items-center justify-center gap-2 transition-all shadow-xs text-center"
                    >
                      <span className="material-symbols-outlined text-[20px] text-amber-600">home_health</span>
                      <span>Request Visit</span>
                    </button>
                  </div>

                  {/* Visit Request Success Toast */}
                  {visitAlert && (
                    <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-start justify-between gap-2 text-xs text-emerald-900 font-bold animate-fadeIn">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
                        <span>{visitAlert}</span>
                      </div>
                      <button onClick={() => setVisitAlert(null)} className="text-emerald-700 hover:text-emerald-950">✕</button>
                    </div>
                  )}

                  {/* Active / Recent Visit Requests from Citizen */}
                  {visitRequests.length > 0 && (
                    <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase font-black tracking-wider text-slate-500">Your Home Visit Requests ({visitRequests.length})</span>
                        <span className="text-[10px] font-black uppercase text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md">Live ABDM Grid</span>
                      </div>
                      {visitRequests.slice(0, 3).map((vr) => (
                        <div key={vr._id || vr.requestId} className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex flex-col gap-1.5 text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 font-bold text-slate-900">
                              <span className="material-symbols-outlined text-[16px] text-amber-600">home_health</span>
                              <span>{vr.reason}</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${
                              vr.status === 'completed'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : vr.status === 'scheduled' || vr.status === 'in_progress'
                                ? 'bg-sky-50 text-sky-800 border-sky-300 animate-pulse'
                                : 'bg-amber-50 text-amber-900 border-amber-300'
                            }`}>
                              {vr.status === 'pending' && 'Pending Sunita Devi Review'}
                              {vr.status === 'scheduled' && (vr.scheduledTime ? `Scheduled: ${vr.scheduledTime}` : 'Visit Scheduled')}
                              {vr.status === 'in_progress' && 'In Progress (On The Way)'}
                              {vr.status === 'completed' && 'Completed ✓'}
                              {vr.status === 'cancelled' && 'Cancelled'}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                            <span>Preferred Slot: <strong className="text-slate-700">{vr.preferredSlot}</strong></span>
                            <span className="font-mono text-amber-900 font-bold">{vr.requestId}</span>
                          </div>
                          {vr.actionNotes && (
                            <p className="text-[11px] text-amber-900 bg-amber-100/70 p-2 rounded-xl border border-amber-200 font-semibold">
                              <span className="font-black">Sunita Devi Update:</span> {vr.actionNotes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
        )}

        {activeTab === 'profile' && (
          <div className="py-6 animate-fadeIn max-w-4xl mx-auto">
            {/* Digital ABHA Card */}
            <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-amber-500/20 mb-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/20 mb-5">
                  <div className="flex items-center gap-3">
                      <img src="/images/logo-transparent.png" alt="SehatSaarthi" className="w-12 h-12 rounded-2xl object-cover border border-white/30 notranslate" translate="no" />
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-amber-100 block">National Health Authority • ABDM</span>
                      <h3 className="text-xl font-black text-white">Digital Ayushman Health Card</h3>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-2 bg-emerald-500/90 text-white px-3.5 py-1 rounded-full text-xs font-extrabold shadow-sm border border-emerald-300 self-start sm:self-auto">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                    <span>Verified Citizen Record</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
                  <div className="sm:col-span-2 space-y-3">
                    <div>
                      <span className="text-xs uppercase font-extrabold text-amber-200 tracking-wider">Citizen Full Name</span>
                      <p className="text-2xl font-black text-white">{user?.name || 'Aditya Sharma'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs uppercase font-extrabold text-amber-200 tracking-wider">ABHA Number</span>
                        <p className="text-lg font-mono font-black text-amber-100">{user?.abhaId || '91-4820-1940-2810'}</p>
                      </div>
                      <div>
                        <span className="text-xs uppercase font-extrabold text-amber-200 tracking-wider">Mobile Contact</span>
                        <p className="text-base font-extrabold text-white">{user?.phone || '+91 9876543210'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center flex flex-col items-center justify-center">
                    <span className="material-symbols-outlined text-white text-[48px] mb-1">qr_code_2</span>
                    <span className="text-[11px] font-bold text-amber-100">Scan at any PHC / CHC</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Details & SC Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-slate-200 shadow-sm mb-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border-2 border-amber-200 text-amber-700 flex items-center justify-center font-bold">
                    <span className="material-symbols-outlined text-[22px]">person</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">{t('personalDetails')}</h2>
                    <p className="text-xs text-slate-500 font-medium">Personal identity &amp; healthcare centre links</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveModal('edit-profile')} 
                  className="bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white px-5 py-2.5 rounded-xl text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  <span>{t('editProfileInformation')}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <span className="text-xs uppercase font-extrabold text-slate-500 block mb-1">{t('fullName')}</span>
                  <p className="text-base font-extrabold text-slate-900">{user?.name || 'Aditya Sharma'}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <span className="text-xs uppercase font-extrabold text-slate-500 block mb-1">{t('abhaId')}</span>
                  <p className="text-base font-mono font-extrabold text-amber-900">{user?.abhaId || '91-4820-1940-2810'}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <span className="text-xs uppercase font-extrabold text-slate-500 block mb-1">{t('mobileNumber')}</span>
                  <p className="text-base font-extrabold text-slate-900">{user?.phone || '+91 9876543210'}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <span className="text-xs uppercase font-extrabold text-slate-500 block mb-1">{t('linkedSubCentre')}</span>
                  <p className="text-base font-extrabold text-slate-900">Sitapur Rural SC (Ward 4)</p>
                </div>
              </div>
            </div>
            
            {/* Bluetooth Connected Devices */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border-2 border-amber-200 text-amber-700 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[22px]">watch</span>
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">{t('connectedDevicesSync')}</h3>
                  <p className="text-xs text-slate-500 font-medium">Auto-sync vitals (BP, SpO2, Pulse) from portable medical kits</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 font-medium mb-5">{t('noPortableDevices')}</p>
              <button 
                onClick={() => alert('Searching for nearby Bluetooth Vitals Monitors... Make sure device is powered ON.')}
                className="bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white px-5 py-3 rounded-xl text-sm font-extrabold shadow-sm transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">bluetooth_searching</span>
                <span>{t('connectBluetoothMonitor')}</span>
              </button>
            </div>
          </div>
        )}
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

      {/* Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-3 sm:p-4 animate-fadeIn">
          <div className={`w-full ${
            activeModal === 'teleconsult-room' 
              ? 'max-w-4xl bg-slate-950 border border-slate-700 text-white' 
              : activeModal === 'vitals-notes' 
              ? 'max-w-2xl bg-white text-slate-900 border border-slate-200' 
              : activeModal === 'lab-tests'
              ? 'max-w-3xl bg-white text-slate-900 border-2 border-amber-300'
              : 'max-w-lg bg-surface-container-lowest text-on-surface'
          } rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]`}>
            {/* Modal Header */}
            <div className={`px-6 py-4 border-b flex items-center justify-between ${
              activeModal === 'teleconsult-room'
                ? 'bg-slate-900 border-slate-800 text-white'
                : activeModal === 'vitals-notes'
                ? 'bg-amber-50/70 border-amber-200 text-slate-900'
                : activeModal === 'lab-tests'
                ? 'bg-slate-900 border-slate-800 text-white'
                : 'bg-surface-container-low border-surface-variant'
            }`}>
              <h3 className="text-base sm:text-lg font-black flex items-center gap-2">
                {activeModal === 'teleconsult-room' && (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                    <span>Live Tele-Consultation Room</span>
                  </>
                )}
                {activeModal === 'vitals-notes' && (
                  <>
                    <span className="material-symbols-outlined text-amber-700 text-[22px]">vital_signs</span>
                    <span>Clinical Vitals &amp; Pre-Consultation Notes</span>
                  </>
                )}
                {activeModal === 'request-visit' && 'Request ASHA Home Visit (गृह-भ्रमण अनुरोध)'}
                {activeModal === 'lab-tests' && (
                  <>
                    <span className="material-symbols-outlined text-amber-400 text-[24px]">biotech</span>
                    <span>Diagnostic Lab Tests &amp; Reports (जांच रिपोर्ट)</span>
                  </>
                )}
                {activeModal === 'find-phc' && 'Find Nearest PHC'}
                {activeModal === 'edit-profile' && 'Edit Profile Information'}
              </h3>
              <button 
                onClick={() => {
                  if (activeModal === 'teleconsult-room' && !callEndedSummary) {
                    if (window.confirm('Leave consultation room? Your video call will end.')) {
                      handleEndCall();
                      setActiveModal(null);
                    }
                  } else {
                    setActiveModal(null);
                  }
                }} 
                className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors ${
                  activeModal === 'teleconsult-room' ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-600'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            {/* Modal Body */}
            <div className={`overflow-y-auto ${activeModal === 'teleconsult-room' ? 'p-4 sm:p-6 bg-slate-950 text-white' : 'p-6'}`}>
                {/* 1. CLINICAL VITALS & NOTES MODAL */}
                {activeModal === 'vitals-notes' && (
                  <div className="flex flex-col gap-5">
                    {/* Doctor & Appointment Meta Card */}
                    <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                          <span className="material-symbols-outlined text-[26px]">stethoscope</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-extrabold text-slate-900 notranslate" translate="no">{selectedAppointment?.doctor?.name || 'Dr. Rajesh Sharma'}</h4>
                            <span className="bg-emerald-100 text-emerald-900 text-[11px] font-black px-2.5 py-0.5 rounded-full border border-emerald-300 notranslate" translate="no">Token #{selectedAppointment?.tokenNumber || '04'}</span>
                          </div>
                          <p className="text-xs text-slate-600 font-medium">General Medicine • CHC Sitapur Central • Tele-OPD 04</p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right sm:border-l sm:border-amber-200 sm:pl-4">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Consultation Slot</span>
                        <span className="text-sm font-black text-amber-900">{selectedAppointment?.timeSlot || '04:00 PM'} (Today)</span>
                      </div>
                    </div>

                    {/* Pre-Consultation Reason & Clinical Notes */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-amber-600">clinical_notes</span>
                          Chief Complaint &amp; Pre-Consultation Notes
                        </span>
                        <span className="text-[10px] font-mono font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md">
                          Passcode: {selectedAppointment?.sessionPasscode || 'MED-1744'}
                        </span>
                      </div>
                      <p className="text-sm font-extrabold text-slate-900">{selectedAppointment?.reason || 'Follow-up on Viral Fever & Weakness'}</p>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                        "{selectedAppointment?.notes || 'Patient reports fever subsided, requesting Jan Aushadhi refill and vitals review.'}"
                      </p>
                    </div>

                    {/* Live Synchronized Vitals */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[18px] text-rose-600">vital_signs</span>
                            Patient Recorded Vitals
                          </span>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Synchronized with ABDM Grid"></span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsEditingVitals(!isEditingVitals)}
                          className="text-xs font-extrabold text-amber-800 hover:text-amber-950 flex items-center gap-1 bg-amber-50 hover:bg-amber-100 px-3 py-1 rounded-lg border border-amber-300 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[15px]">{isEditingVitals ? 'visibility' : 'edit'}</span>
                          <span>{isEditingVitals ? 'Cancel Editing' : 'Update Vitals'}</span>
                        </button>
                      </div>

                      {vitalsToast && (
                        <div className="mb-3 p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-900 flex items-center gap-2 animate-fadeIn">
                          <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
                          <span>{vitalsToast}</span>
                        </div>
                      )}

                      {!isEditingVitals ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <div className="bg-white p-3.5 rounded-2xl border-2 border-slate-200 shadow-2xs">
                            <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold mb-1">
                              <span>Blood Pressure</span>
                              <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] font-extrabold">Normal</span>
                            </div>
                            <div className="text-lg font-black text-slate-900">{vitalsForm.systolicBP}/{vitalsForm.diastolicBP} <span className="text-xs font-medium text-slate-500">mmHg</span></div>
                          </div>

                          <div className="bg-white p-3.5 rounded-2xl border-2 border-slate-200 shadow-2xs">
                            <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold mb-1">
                              <span>Heart Rate</span>
                              <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] font-extrabold">Normal</span>
                            </div>
                            <div className="text-lg font-black text-slate-900">{vitalsForm.heartRate} <span className="text-xs font-medium text-slate-500">bpm</span></div>
                          </div>

                          <div className="bg-white p-3.5 rounded-2xl border-2 border-slate-200 shadow-2xs">
                            <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold mb-1">
                              <span>Oxygen (SpO2)</span>
                              <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] font-extrabold">Optimal</span>
                            </div>
                            <div className="text-lg font-black text-slate-900">{vitalsForm.spO2}% <span className="text-xs font-medium text-slate-500">Level</span></div>
                          </div>

                          <div className="bg-white p-3.5 rounded-2xl border-2 border-slate-200 shadow-2xs">
                            <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold mb-1">
                              <span>Body Temp</span>
                              <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] font-extrabold">Normal</span>
                            </div>
                            <div className="text-lg font-black text-slate-900">{vitalsForm.temperature}°F <span className="text-xs font-medium text-slate-500">Oral</span></div>
                          </div>

                          <div className="bg-white p-3.5 rounded-2xl border-2 border-slate-200 shadow-2xs">
                            <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold mb-1">
                              <span>Blood Sugar</span>
                              <span className="text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded text-[10px] font-extrabold">Fasting</span>
                            </div>
                            <div className="text-lg font-black text-slate-900">{vitalsForm.bloodSugar} <span className="text-xs font-medium text-slate-500">mg/dL</span></div>
                          </div>

                          <div className="bg-white p-3.5 rounded-2xl border-2 border-slate-200 shadow-2xs">
                            <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold mb-1">
                              <span>Weight / BMI</span>
                              <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] font-extrabold">23.0</span>
                            </div>
                            <div className="text-lg font-black text-slate-900">{vitalsForm.weight} <span className="text-xs font-medium text-slate-500">kg ({vitalsForm.height} cm)</span></div>
                          </div>
                        </div>
                      ) : (
                        <form onSubmit={handleSaveVitals} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col gap-3">
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="text-[11px] font-bold text-slate-600 block mb-1">Systolic BP</label>
                              <input type="number" required value={vitalsForm.systolicBP} onChange={e => setVitalsForm({...vitalsForm, systolicBP: e.target.value})} className="w-full bg-white px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold" />
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-slate-600 block mb-1">Diastolic BP</label>
                              <input type="number" required value={vitalsForm.diastolicBP} onChange={e => setVitalsForm({...vitalsForm, diastolicBP: e.target.value})} className="w-full bg-white px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold" />
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-slate-600 block mb-1">Heart Rate (bpm)</label>
                              <input type="number" required value={vitalsForm.heartRate} onChange={e => setVitalsForm({...vitalsForm, heartRate: e.target.value})} className="w-full bg-white px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold" />
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-slate-600 block mb-1">SpO2 (%)</label>
                              <input type="number" required value={vitalsForm.spO2} onChange={e => setVitalsForm({...vitalsForm, spO2: e.target.value})} className="w-full bg-white px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold" />
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-slate-600 block mb-1">Temperature (°F)</label>
                              <input type="number" step="0.1" required value={vitalsForm.temperature} onChange={e => setVitalsForm({...vitalsForm, temperature: e.target.value})} className="w-full bg-white px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold" />
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-slate-600 block mb-1">Blood Sugar (mg/dL)</label>
                              <input type="number" required value={vitalsForm.bloodSugar} onChange={e => setVitalsForm({...vitalsForm, bloodSugar: e.target.value})} className="w-full bg-white px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold" />
                            </div>
                          </div>
                          <div className="flex items-center gap-2 pt-2">
                            <button type="submit" disabled={vitalsSaving} className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                              <span className="material-symbols-outlined text-[16px]">sync</span>
                              <span>{vitalsSaving ? 'Saving to Doctor...' : 'Save & Sync to Doctor Queue'}</span>
                            </button>
                            <button type="button" onClick={() => setIsEditingVitals(false)} className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors">
                              Cancel
                            </button>
                          </div>
                        </form>
                      )}
                    </div>

                    {/* Medical Flags */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold px-3 py-1 rounded-xl flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px]">warning</span> Allergy: Dust &amp; Pollen (Mild)
                      </span>
                      <span className="bg-sky-100 text-sky-900 border border-sky-300 text-[11px] font-bold px-3 py-1 rounded-xl flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px]">health_and_safety</span> Chronic: Mild Seasonal Allergy (Managed)
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                      <button 
                        type="button" 
                        onClick={() => setActiveModal(null)}
                        className="h-12 px-4 rounded-xl border-2 border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-xs font-extrabold transition-all"
                      >
                        Close Window
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleEnterConsultation(selectedAppointment)}
                        className="h-12 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[20px]">videocam</span>
                        <span>Enter Consultation Room Now</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. TELE-CONSULTATION VIDEO ROOM MODAL */}
                {activeModal === 'teleconsult-room' && (
                  <div>
                    {!callEndedSummary ? (
                      <div className="flex flex-col gap-4">
                        {/* Call Info Header Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-3.5 rounded-2xl border border-slate-800">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-11 h-11 rounded-xl bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-400 font-bold">
                                <span className="material-symbols-outlined text-[24px]">stethoscope</span>
                              </div>
                              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900 animate-pulse"></span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-sm text-white notranslate" translate="no">{selectedAppointment?.doctor?.name || 'Dr. Rajesh Sharma'}</span>
                                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black px-2 py-0.5 rounded-full">
                                  LIVE • OPD-4
                                </span>
                              </div>
                              <span className="text-xs text-slate-400 font-medium">CHC Sitapur Central • Telemedicine Unit</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                              <span className="font-mono text-sm font-black text-rose-300">
                                {Math.floor(callTimer / 60).toString().padStart(2, '0')}:{(callTimer % 60).toString().padStart(2, '0')}
                              </span>
                            </div>
                            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-slate-400 bg-slate-800/50 px-2.5 py-1.5 rounded-xl border border-slate-800">
                              <span className="material-symbols-outlined text-emerald-400 text-[16px]">network_check</span>
                              <span>1080p • 22ms</span>
                            </div>
                          </div>
                        </div>

                        {/* Call Mode Tabs */}
                        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                          <button
                            type="button"
                            onClick={() => setActiveCallTab('call')}
                            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                              activeCallTab === 'call'
                                ? 'bg-amber-600 text-white shadow-sm'
                                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[16px]">videocam</span>
                            <span>Video Stream</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveCallTab('chat')}
                            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                              activeCallTab === 'chat'
                                ? 'bg-amber-600 text-white shadow-sm'
                                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[16px]">chat</span>
                            <span>Doctor Chat ({chatMessages.length})</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveCallTab('rx')}
                            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                              activeCallTab === 'rx'
                                ? 'bg-amber-600 text-white shadow-sm'
                                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[16px]">prescriptions</span>
                            <span>e-Prescription Draft</span>
                          </button>
                        </div>

                        {/* Tab 1: Video Call View */}
                        {activeCallTab === 'call' && (
                          <div className="space-y-4">
                            <div className="relative w-full aspect-video sm:h-[360px] bg-slate-900 rounded-2xl overflow-hidden border-2 border-slate-800 flex items-center justify-center">
                              {/* Doctor Consultation Video Stream View */}
                              <div className="relative w-full h-full bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 flex flex-col items-center justify-center p-6 text-center">
                                {/* Doctor Avatar / Stethoscope Animation */}
                                <div className="relative mb-3">
                                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-amber-600/20 border-2 border-amber-500/60 flex items-center justify-center shadow-lg shadow-amber-500/10">
                                    <span className="material-symbols-outlined text-[54px] text-amber-400">account_circle</span>
                                  </div>
                                  {/* Pulsing Audio Waves to indicate speaking */}
                                  <div className="absolute -bottom-2 inset-x-0 flex items-center justify-center gap-1">
                                    <span className="w-1 h-3 bg-emerald-400 rounded-full animate-bounce"></span>
                                    <span className="w-1 h-5 bg-emerald-400 rounded-full animate-bounce delay-100"></span>
                                    <span className="w-1 h-4 bg-emerald-400 rounded-full animate-bounce delay-200"></span>
                                    <span className="w-1 h-6 bg-emerald-400 rounded-full animate-bounce delay-75"></span>
                                    <span className="w-1 h-3 bg-emerald-400 rounded-full animate-bounce"></span>
                                  </div>
                                </div>

                                <div className="space-y-1 z-10 max-w-md">
                                  <h4 className="text-lg font-black text-white notranslate" translate="no">{selectedAppointment?.doctor?.name || 'Dr. Rajesh Sharma'}</h4>
                                  <p className="text-xs text-amber-400 font-bold">General Medicine Specialist • CHC Sitapur Central</p>
                                  <p className="text-xs text-slate-300 font-medium bg-slate-850/90 px-4 py-2 rounded-xl border border-slate-700/80 mt-2">
                                    "Namaste! I am reviewing your recent fever symptoms and vitals. Blood Pressure (120/80) and SpO2 (98%) look healthy. How is your appetite today?"
                                  </p>
                                </div>

                                {/* Encrypted Session Tag */}
                                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5 text-[11px] text-slate-300 font-semibold">
                                  <span className="material-symbols-outlined text-emerald-400 text-[14px]">lock</span>
                                  <span>End-to-End Encrypted ABDM Stream</span>
                                </div>

                                {/* Doctor Location Tag */}
                                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5 text-[11px] text-amber-300 font-bold">
                                  <span className="material-symbols-outlined text-[14px]">location_on</span>
                                  <span>CHC Sitapur Room 04</span>
                                </div>
                              </div>

                              {/* Patient Self-View (Picture-in-Picture) */}
                              <div className="absolute bottom-4 right-4 w-32 sm:w-44 aspect-video rounded-xl bg-slate-950 border-2 border-amber-400/80 shadow-2xl overflow-hidden z-20 flex items-center justify-center">
                                {isCameraActive && !isVideoOff ? (
                                  <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover mirror" />
                                ) : (
                                  <div className="flex flex-col items-center justify-center p-2 text-center">
                                    <span className="material-symbols-outlined text-[28px] text-slate-500">person</span>
                                    <span className="text-[10px] font-bold text-slate-400">
                                      {isVideoOff ? 'Camera Off' : (user?.name || 'You')}
                                    </span>
                                  </div>
                                )}
                                <div className="absolute bottom-1 left-1.5 bg-black/70 px-1.5 py-0.5 rounded text-[9px] font-black text-white">
                                  You ({user?.name ? user.name.split(' ')[0] : 'Patient'})
                                </div>
                              </div>
                            </div>

                            {/* In-Call Controls Bar */}
                            <div className="flex items-center justify-center gap-3 sm:gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
                              {/* Mic Toggle */}
                              <button
                                type="button"
                                onClick={toggleMic}
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold transition-all cursor-pointer ${
                                  isMicMuted
                                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                                }`}
                                title={isMicMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                              >
                                <span className="material-symbols-outlined text-[24px]">{isMicMuted ? 'mic_off' : 'mic'}</span>
                              </button>

                              {/* Video Toggle */}
                              <button
                                type="button"
                                onClick={toggleVideo}
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold transition-all cursor-pointer ${
                                  isVideoOff
                                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                                }`}
                                title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
                              >
                                <span className="material-symbols-outlined text-[24px]">{isVideoOff ? 'videocam_off' : 'videocam'}</span>
                              </button>

                              {/* Chat Toggle */}
                              <button
                                type="button"
                                onClick={() => setActiveCallTab('chat')}
                                className="w-12 h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold transition-all cursor-pointer"
                                title="Open Chat"
                              >
                                <span className="material-symbols-outlined text-[22px]">chat</span>
                              </button>

                              {/* Rx Preview Toggle */}
                              <button
                                type="button"
                                onClick={() => setActiveCallTab('rx')}
                                className="w-12 h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-400 flex items-center justify-center font-bold transition-all cursor-pointer"
                                title="View Live Prescription Draft"
                              >
                                <span className="material-symbols-outlined text-[22px]">prescriptions</span>
                              </button>

                              {/* End Call Button */}
                              <button
                                type="button"
                                onClick={handleEndCall}
                                className="h-12 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm shadow-xl shadow-rose-600/30 flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[22px]">call_end</span>
                                <span>End Consultation</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Tab 2: Doctor In-Call Chat */}
                        {activeCallTab === 'chat' && (
                          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 flex flex-col h-[380px]">
                            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                              {chatMessages.map((msg, i) => (
                                <div key={i} className={`flex flex-col ${msg.sender === 'patient' ? 'items-end' : 'items-start'}`}>
                                  <div className={`max-w-xs sm:max-w-md p-3.5 rounded-2xl text-xs ${
                                    msg.sender === 'patient'
                                      ? 'bg-amber-600 text-white rounded-br-none'
                                      : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
                                  }`}>
                                    <div className="flex items-center justify-between gap-2 mb-1 text-[10px] opacity-75 font-bold">
                                      <span>{msg.sender === 'patient' ? 'You' : 'Dr. Rajesh Sharma'}</span>
                                      <span>{msg.time}</span>
                                    </div>
                                    <p className="font-medium leading-relaxed">{msg.text}</p>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <form onSubmit={handleSendChatMessage} className="flex gap-2 pt-3 border-t border-slate-800">
                              <input
                                type="text"
                                value={chatInput}
                                onChange={e => setChatInput(e.target.value)}
                                placeholder="Ask doctor a question (e.g. fever, medicine timing, diet)..."
                                className="flex-1 bg-slate-950 border border-slate-700 px-4 py-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-medium"
                              />
                              <button
                                type="submit"
                                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black flex items-center gap-1 transition-all cursor-pointer"
                              >
                                <span>Send</span>
                                <span className="material-symbols-outlined text-[16px]">send</span>
                              </button>
                            </form>
                          </div>
                        )}

                        {/* Tab 3: e-Prescription Draft */}
                        {activeCallTab === 'rx' && (
                          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                              <div>
                                <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">Live ABDM Digital Draft</span>
                                <h4 className="text-base font-extrabold text-white">e-Prescription Token #SEHAT-9699</h4>
                              </div>
                              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-black px-3 py-1 rounded-full">
                                Active Drafting
                              </span>
                            </div>

                            <div className="space-y-2.5">
                              <span className="text-xs font-bold text-slate-400 block">Prescribed Medicines:</span>
                              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                                <div>
                                  <span className="font-bold text-white block">Paracetamol 500mg (Tab)</span>
                                  <span className="text-slate-400">1 tablet TDS (3 times/day) • 5 Days • After meals</span>
                                </div>
                                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800">Generic JAS-0012</span>
                              </div>
                              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                                <div>
                                  <span className="font-bold text-white block">ORS Electrolyte Sachet</span>
                                  <span className="text-slate-400">1 packet in 1L water • 3 Days • Throughout day</span>
                                </div>
                                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800">Generic JAS-0045</span>
                              </div>
                              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                                <div>
                                  <span className="font-bold text-white block">Vitamin C 500mg &amp; Zinc</span>
                                  <span className="text-slate-400">1 chewable tab OD • 15 Days • Post-lunch</span>
                                </div>
                                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800">Generic JAS-0078</span>
                              </div>
                            </div>

                            <p className="text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                              🔒 This e-Prescription will be digitally signed using Dr. Rajesh Sharma's NHA registration upon consultation completion and synced to Jan Aushadhi Kendra.
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Call Ended Summary Screen */
                      <div className="flex flex-col items-center text-center p-6 space-y-5">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400">
                          <span className="material-symbols-outlined text-[36px]">check_circle</span>
                        </div>

                        <div>
                          <span className="text-xs font-black uppercase tracking-wider text-emerald-400 block mb-1">Session Concluded</span>
                          <h3 className="text-2xl font-black text-white">Consultation Completed Successfully</h3>
                          <p className="text-xs text-slate-400 mt-1">With {callEndedSummary.doctor} • Duration: {callEndedSummary.duration}</p>
                        </div>

                        <div className="w-full bg-slate-900 p-4 rounded-2xl border border-slate-800 text-left space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <span className="text-xs font-bold text-slate-400">Clinical Diagnosis:</span>
                            <span className="text-xs font-black text-amber-300">{callEndedSummary.diagnosis}</span>
                          </div>
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <span className="text-xs font-bold text-slate-400">e-Prescription ID:</span>
                            <span className="font-mono text-xs font-black text-emerald-400">{callEndedSummary.rxId}</span>
                          </div>
                          <p className="text-xs text-slate-300 font-medium">
                            <span className="font-bold text-white">Doctor Instructions:</span> {callEndedSummary.notes}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveModal(null);
                              navigate('/patient/medicines');
                            }}
                            className="h-12 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20 transition-all cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]">medication</span>
                            <span>View Prescribed Medicines</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveModal(null)}
                            className="h-12 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer"
                          >
                            Back to Dashboard
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Request ASHA Home Visit Modal */}
                {activeModal === 'request-visit' && (
                  <form onSubmit={handleRequestVisitSubmit} className="flex flex-col gap-4">
                    <div className="bg-amber-50 p-4 rounded-2xl border border-amber-300 flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-amber-300 text-amber-700 flex items-center justify-center shrink-0 shadow-2xs">
                        <span className="material-symbols-outlined text-[24px]">volunteer_activism</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-amber-950">Assigned ASHA Worker: Sunita Devi</h4>
                        <p className="text-xs text-amber-800 font-medium">Sitapur Ward 4 Field Worker • Working Hours: 8:00 AM – 6:00 PM</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-700">Patient Name</label>
                        <input 
                          type="text" 
                          readOnly 
                          value={user?.name || 'Patient'} 
                          className="w-full bg-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm font-bold cursor-not-allowed" 
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-700">Mobile Number</label>
                        <input 
                          type="text" 
                          readOnly 
                          value={user?.phone || '9876543211'} 
                          className="w-full bg-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm font-bold cursor-not-allowed" 
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-700">Village / Ward Address <span className="text-rose-500">*</span></label>
                      <input 
                        type="text" 
                        required 
                        value={visitForm.address} 
                        onChange={e => setVisitForm({ ...visitForm, address: e.target.value })}
                        className="w-full bg-white px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500" 
                        placeholder="House no, Gali / Mohalla, Ward 4" 
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-700">Reason for Visit <span className="text-rose-500">*</span></label>
                      <select 
                        value={visitForm.reason} 
                        onChange={e => setVisitForm({ ...visitForm, reason: e.target.value })}
                        className="w-full bg-white px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="Routine Health Checkup & Vitals">Routine Health Checkup & Vitals (नियमित स्वास्थ्य जांच)</option>
                        <option value="Jan Aushadhi Medicine Refill / Delivery">Jan Aushadhi Medicine Refill / Delivery (दवाई डिलीवरी)</option>
                        <option value="High Fever / Cough / Seasonal Illness">High Fever / Cough / Seasonal Illness (बुखार व मौसमी बीमारी)</option>
                        <option value="Maternal / ANC Pregnancy Follow-up">Maternal / ANC Pregnancy Follow-up (गर्भवती जांच)</option>
                        <option value="Elderly Care & Mobility Assistance">Elderly Care & Mobility Assistance (बुजुर्ग देखभाल)</option>
                        <option value="Child Immunization / Vaccine Check">Child Immunization / Vaccine Check (टीकाकरण)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-700">Preferred Time Slot</label>
                        <select 
                          value={visitForm.preferredSlot} 
                          onChange={e => setVisitForm({ ...visitForm, preferredSlot: e.target.value })}
                          className="w-full bg-white px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                        >
                          <option value="Morning (8:00 AM - 12:00 PM)">Morning (8:00 AM - 12:00 PM)</option>
                          <option value="Afternoon (12:00 PM - 3:00 PM)">Afternoon (12:00 PM - 3:00 PM)</option>
                          <option value="Evening (3:00 PM - 6:00 PM)">Evening (3:00 PM - 6:00 PM)</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-700">Urgency Level</label>
                        <select 
                          value={visitForm.urgency} 
                          onChange={e => setVisitForm({ ...visitForm, urgency: e.target.value })}
                          className="w-full bg-white px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                        >
                          <option value="routine">Routine (सामान्य)</option>
                          <option value="urgent">Urgent Priority (प्राथमिकता)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-700">Symptoms or Notes for ASHA (Optional)</label>
                      <textarea 
                        rows="2"
                        value={visitForm.notes} 
                        onChange={e => setVisitForm({ ...visitForm, notes: e.target.value })}
                        placeholder="e.g., Feeling dizzy since morning, need BP check..."
                        className="w-full bg-white px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                      ></textarea>
                    </div>

                    <button 
                      type="submit" 
                      disabled={submittingVisit}
                      className="w-full py-3.5 px-4 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-extrabold text-sm rounded-xl shadow-md shadow-amber-600/20 transition-all flex items-center justify-center gap-2 mt-1 disabled:opacity-70"
                    >
                      {submittingVisit ? (
                        <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                      ) : (
                        <span className="material-symbols-outlined text-[20px]">send</span>
                      )}
                      <span>{submittingVisit ? 'Sending Request...' : 'Send Visit Request to Sunita Devi'}</span>
                    </button>
                  </form>
                )}
                {/* Book Consult */}
                {activeModal === 'book-consult' && (
                  <div className="flex flex-col gap-4">
                    <p className="text-body-md text-secondary">Select a specialty to consult with a doctor from your district hospital or state medical college.</p>
                    <select className="w-full bg-surface-container px-4 py-3 rounded-xl border border-surface-variant text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-bold">
                      <option>General Medicine</option>
                      <option>Pediatrics</option>
                      <option>Gynecology</option>
                      <option>Dermatology</option>
                      <option>Mental Health</option>
                    </select>
                    <button onClick={() => { setActiveModal(null); alert('Appointment Booked!'); }} className="w-full bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white py-3.5 rounded-xl font-bold shadow-sm transition-all mt-2">Find Next Available Doctor</button>
                  </div>
                )}
                {/* Order Meds */}
                {activeModal === 'order-meds' && (
                  <div className="flex flex-col gap-4">
                    <div className="bg-primary-container/20 p-4 rounded-xl border border-primary-container">
                      <p className="text-body-md text-on-surface font-bold">Upload your prescription or select from past records to order medicines from Jan Aushadhi Kendra.</p>
                    </div>
                    <button className="w-full bg-surface-container px-4 py-3 rounded-xl border border-surface-variant text-on-surface text-sm hover:bg-surface-variant transition-colors flex items-center justify-between font-bold">
                      <span>Select Past Prescription</span>
                      <span className="material-symbols-outlined text-primary">history</span>
                    </button>
                    <button className="w-full bg-surface-container px-4 py-3 rounded-xl border border-surface-variant text-on-surface text-sm hover:bg-surface-variant transition-colors flex items-center justify-between font-bold">
                      <span>Upload New Prescription (PDF/Image)</span>
                      <span className="material-symbols-outlined text-primary">upload_file</span>
                    </button>
                    <button onClick={() => { setActiveModal(null); alert('Order Placed!'); }} className="w-full bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white py-3.5 rounded-xl font-bold shadow-sm transition-all mt-2">Proceed to Order</button>
                  </div>
                )}
                {/* Lab Tests & Diagnostic Reports - Real MongoDB Atlas Integration */}
                {activeModal === 'lab-tests' && (
                  <div className="flex flex-col gap-4 max-h-[75vh] overflow-y-auto pr-1">
                    {selectedLabReport ? (
                      /* DETAILED PATHOLOGY REPORT VIEW */
                      <div className="animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                          <button
                            type="button"
                            onClick={() => setSelectedLabReport(null)}
                            className="inline-flex items-center gap-1.5 text-xs font-black text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-300 transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                            <span>Back to All Reports</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => printDiagnosticReport(selectedLabReport)}
                            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">print</span>
                            <span>Print Report</span>
                          </button>
                        </div>

                        {/* Official Header */}
                        <div className="bg-slate-900 text-white p-4 rounded-2xl mb-3 border-b-4 border-amber-500">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0">
                              <span className="material-symbols-outlined text-[24px]">biotech</span>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-black tracking-wider text-amber-300 block">Ministry of Health &amp; Family Welfare</span>
                              <h4 className="text-base font-black text-white">{selectedLabReport.facility || 'CHC Sitapur Central Pathology Lab'}</h4>
                              <p className="text-[11px] text-slate-300">NABL Accredited ISO 15189 • National Digital Health Grid</p>
                            </div>
                          </div>
                        </div>

                        {/* Patient & Order Details Strip */}
                        <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-200 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs mb-3">
                          <div>
                            <span className="text-[10px] text-slate-500 font-bold uppercase block">Citizen Name</span>
                            <strong className="text-slate-900 font-black">{selectedLabReport.patientName || user?.name}</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 font-bold uppercase block">Barcode / Order ID</span>
                            <strong className="font-mono text-amber-950 font-black">{selectedLabReport.orderId}</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 font-bold uppercase block">Prescribed By</span>
                            <strong className="text-slate-900 font-extrabold">{selectedLabReport.doctorName}</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 font-bold uppercase block">Date Completed</span>
                            <strong className="text-slate-900 font-extrabold">
                              {selectedLabReport.completedAt ? new Date(selectedLabReport.completedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Verified Today'}
                            </strong>
                          </div>
                        </div>

                        {/* Investigation Title */}
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-base font-black text-slate-900">{selectedLabReport.testName}</h4>
                          <span className="text-xs font-black text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-md border border-amber-300">
                            {selectedLabReport.category}
                          </span>
                        </div>

                        {/* Results Table */}
                        {selectedLabReport.results && selectedLabReport.results.length > 0 ? (
                          <div className="border border-slate-200 rounded-2xl overflow-hidden mb-3">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                                  <th className="px-3 py-2 font-black uppercase">Parameter</th>
                                  <th className="px-3 py-2 font-black uppercase">Observed Value</th>
                                  <th className="px-3 py-2 font-black uppercase">Reference Range</th>
                                  <th className="px-3 py-2 font-black uppercase text-right">Interpretation</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {selectedLabReport.results.map((res, i) => (
                                  <tr key={i} className="hover:bg-slate-50">
                                    <td className="px-3 py-2 font-extrabold text-slate-900">{res.parameter}</td>
                                    <td className="px-3 py-2 font-black text-amber-950">
                                      {res.value} <span className="text-slate-500 text-[11px] font-medium">{res.unit}</span>
                                    </td>
                                    <td className="px-3 py-2 text-slate-600 font-mono text-[11px]">{res.normalRange}</td>
                                    <td className="px-3 py-2 text-right">
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                        res.flag === 'High' ? 'bg-rose-100 text-rose-900 border border-rose-300' :
                                        res.flag === 'Low' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                                        'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                      }`}>
                                        {res.flag || 'Normal'}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="p-5 text-center bg-slate-50 rounded-2xl border border-slate-200 mb-3 text-xs text-slate-500">
                            <span className="material-symbols-outlined text-2xl text-amber-600 animate-spin block mb-1">sync</span>
                            Sample collected and in laboratory queue. Results will be uploaded once verified by pathologist.
                          </div>
                        )}

                        {/* Summary / Remarks */}
                        {selectedLabReport.summary && (
                          <div className="bg-emerald-50/70 border border-emerald-300 p-3 rounded-xl mb-3 text-xs">
                            <strong className="text-emerald-900 font-black block mb-0.5">Pathologist Impression &amp; Findings:</strong>
                            <p className="text-slate-700 font-medium">{selectedLabReport.summary}</p>
                          </div>
                        )}

                        {/* Verification Box */}
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-emerald-600 text-[22px]">verified</span>
                            <div>
                              <span className="font-black text-slate-900 block">Digitally Signed &amp; Authenticated</span>
                              <span className="text-slate-500 text-[11px]">{selectedLabReport.verifiedBy || 'Dr. Anjali Seth (MD Pathology, Reg: NABL-84920)'}</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-slate-400">QR-ABHA-VALID</span>
                        </div>
                      </div>
                    ) : (
                      /* LIST OF LAB REPORTS */
                      <>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                          <div>
                            <p className="text-xs text-slate-600 font-semibold">
                              Diagnostic investigations ordered by your attending doctors &amp; verified by pathology labs.
                            </p>
                          </div>
                          <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200 self-start sm:self-auto">
                            {['All', 'Completed', 'Pending'].map(f => (
                              <button
                                key={f}
                                type="button"
                                onClick={() => setLabFilter(f)}
                                className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                                  labFilter === f 
                                    ? 'bg-amber-600 text-white shadow-xs' 
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                {f}
                              </button>
                            ))}
                          </div>
                        </div>

                        {loadingLabs ? (
                          <div className="p-8 text-center text-slate-500 font-bold text-xs">
                            <span className="material-symbols-outlined text-3xl text-amber-500 animate-spin block mx-auto mb-1">sync</span>
                            Synchronizing lab investigations with hospital pathology system...
                          </div>
                        ) : labReports.length === 0 ? (
                          <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
                            <span className="material-symbols-outlined text-4xl text-slate-300 block mx-auto mb-1">science</span>
                            <p className="font-extrabold text-slate-700 text-sm">No Lab Reports Ordered Yet</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              When your doctor orders blood tests or diagnostic investigations, they will appear here instantly.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {labReports
                              .filter(rep => {
                                if (labFilter === 'Completed') return rep.status === 'completed';
                                if (labFilter === 'Pending') return rep.status !== 'completed';
                                return true;
                              })
                              .map((report) => {
                                const isCompleted = report.status === 'completed';
                                const isProcessing = report.status === 'processing' || report.status === 'sample_collected';
                                const dateFormatted = report.dateOrdered 
                                  ? new Date(report.dateOrdered).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) 
                                  : 'Recently';

                                return (
                                  <div 
                                    key={report._id} 
                                    className={`p-4 rounded-2xl border-2 transition-all ${
                                      isCompleted 
                                        ? 'bg-white border-amber-200 hover:border-amber-400 hover:shadow-sm' 
                                        : 'bg-amber-50/30 border-amber-300/80'
                                    }`}
                                  >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                                      <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 flex items-center justify-center shrink-0">
                                          <span className="material-symbols-outlined text-[20px]">
                                            {report.category?.includes('Hema') ? 'bloodtype' : 'science'}
                                          </span>
                                        </div>
                                        <div>
                                          <div className="flex flex-wrap items-center gap-2">
                                            <h4 className="font-black text-slate-900 text-sm">{report.testName}</h4>
                                            <span className="font-mono text-[10px] font-bold text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                              {report.orderId}
                                            </span>
                                          </div>
                                          <p className="text-xs text-slate-600 font-semibold mt-0.5">
                                            Ordered by <strong className="text-slate-900">{report.doctorName}</strong> • {dateFormatted}
                                          </p>
                                          <p className="text-[11px] text-slate-500">{report.facility}</p>
                                        </div>
                                      </div>

                                      {/* Status Badge */}
                                      <div className="self-start sm:self-auto shrink-0">
                                        {isCompleted ? (
                                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-black shadow-2xs">
                                            <span className="material-symbols-outlined text-[15px] text-emerald-700">check_circle</span>
                                            Report Available
                                          </span>
                                        ) : isProcessing ? (
                                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-900 border border-sky-300 text-xs font-black shadow-2xs">
                                            <span className="material-symbols-outlined text-[15px] text-sky-600 animate-spin">sync</span>
                                            {report.status === 'sample_collected' ? 'Sample Dispatched' : 'Under Testing'}
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black shadow-2xs">
                                            <span className="material-symbols-outlined text-[15px] text-amber-700">schedule</span>
                                            Pending Sample
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Fasting Notice */}
                                    {report.fastingRequired && (
                                      <div className="mt-2 text-xs bg-amber-100/70 border border-amber-300 p-2 rounded-xl text-amber-950 flex items-center gap-2 font-medium">
                                        <span className="material-symbols-outlined text-[16px] text-amber-700">info</span>
                                        <span>Fasting Required: 8 to 12 hours overnight fasting before giving blood sample.</span>
                                      </div>
                                    )}

                                    {/* Doctor Clinical Notes */}
                                    {report.clinicalNotes && (
                                      <p className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-200 italic font-medium">
                                        "{report.clinicalNotes}"
                                      </p>
                                    )}

                                    {/* Actions */}
                                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-3">
                                      <span className="text-[11px] font-bold text-slate-500">
                                        {report.category || 'Clinical Pathology'}
                                      </span>

                                      {isCompleted ? (
                                        <button
                                          type="button"
                                          onClick={() => setSelectedLabReport(report)}
                                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-black rounded-xl shadow-xs transition-all cursor-pointer"
                                        >
                                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                                          <span>View Verified Report (जांच रिपोर्ट)</span>
                                        </button>
                                      ) : (
                                        <span className="text-xs font-extrabold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                                          ASHA / PHC Sample Collection Scheduled
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        )}

                        <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 flex items-center gap-2 font-medium">
                          <span className="material-symbols-outlined text-slate-400 text-[18px]">verified_user</span>
                          <span>Reports are generated by accredited NABL district laboratories under the Ayushman Bharat Digital Mission (ABDM).</span>
                        </div>
                      </>
                    )}
                  </div>
                )}
                {/* Find PHC */}
                {activeModal === 'find-phc' && (
                  <div className="flex flex-col gap-4">
                    <input className="w-full bg-surface-container px-4 py-3 rounded-xl border border-surface-variant text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-bold" placeholder="Search by Pincode or Village Name..." />
                    <div className="bg-surface-container-low p-4 rounded-xl border border-primary-container">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-primary">Sitapur Ward 4 Sub-Centre</p>
                          <p className="text-sm text-secondary">1.2 km away • Govt. Dispensary</p>
                        </div>
                        <span className="bg-primary-container text-on-primary-container px-2 py-0.5 rounded text-[11px] font-bold">Nearest</span>
                      </div>
                      <p className="text-[13px] text-on-surface-variant mb-3">Operating Hours: 9:00 AM - 4:00 PM</p>
                      <div className="flex gap-2">
                        <button className="flex-1 bg-surface-container border border-surface-variant text-on-surface py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-1 hover:bg-surface-variant"><span className="material-symbols-outlined text-[16px]">directions</span> Get Directions</button>
                        <button className="flex-1 bg-surface-container border border-surface-variant text-on-surface py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-1 hover:bg-surface-variant"><span className="material-symbols-outlined text-[16px]">call</span> Call Center</button>
                      </div>
                    </div>
                  </div>
                )}
                {/* Edit Profile */}
                {activeModal === 'edit-profile' && (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-label-sm font-bold text-secondary">{t('fullName')}</label>
                      <input type="text" defaultValue={user?.name || 'Aditya Sharma'} className="w-full bg-surface-container px-4 py-3 rounded-xl border border-surface-variant text-on-surface text-sm focus:outline-none focus:border-primary font-bold" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-label-sm font-bold text-secondary">{t('mobileNumber')}</label>
                      <input type="tel" defaultValue={user?.phone || '+91 9876543210'} className="w-full bg-surface-container px-4 py-3 rounded-xl border border-surface-variant text-on-surface text-sm focus:outline-none focus:border-primary font-bold" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-label-sm font-bold text-secondary">Address / Ward</label>
                      <input type="text" defaultValue="Sitapur Rural (Ward 4)" className="w-full bg-surface-container px-4 py-3 rounded-xl border border-surface-variant text-on-surface text-sm focus:outline-none focus:border-primary font-bold" />
                    </div>
                    <button onClick={() => { setActiveModal(null); alert('Profile updated successfully!'); }} className="w-full bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white py-3.5 rounded-xl font-bold shadow-sm transition-all mt-2">Save Changes</button>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
