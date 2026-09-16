import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import LanguageSelector from '../../components/LanguageSelector';

const ASHA_WORKFORCE = [
  { id: 'ASHA-01', name: 'ASHA Sunita Devi', phone: '9876543230', ward: 'Sitapur Ward 4', households: 245, status: 'Active on Duty' },
  { id: 'ASHA-02', name: 'ASHA Geeta Yadav', phone: '9876543231', ward: 'Rampur Ward 1', households: 210, status: 'Active on Duty' },
  { id: 'ASHA-03', name: 'ASHA Manju Devi', phone: '9876543232', ward: 'Rampur Ward 2', households: 230, status: 'Active on Duty' },
  { id: 'ASHA-04', name: 'ASHA Pushpa Sharma', phone: '9876543233', ward: 'Rampur Ward 3', households: 195, status: 'Active on Duty' },
  { id: 'ASHA-05', name: 'ASHA Kamlesh Kumari', phone: '9876543234', ward: 'Sitapur Ward 2', households: 260, status: 'Field Survey' },
];

const INITIAL_TASKS = [
  {
    _id: 'task-101',
    taskId: 'TASK-101',
    ashaWorker: { name: 'ASHA Sunita Devi', phone: '9876543230', ward: 'Sitapur Ward 4' },
    patientName: 'Kamla Devi',
    patientPhone: '9876543251',
    patientAddress: 'Rampur Ward 2, Near Primary School',
    taskType: 'Antenatal Checkup (ANC)',
    priority: 'high',
    scheduledDate: 'Today',
    scheduledTime: '10:00 AM',
    instructions: 'Deliver 30 IFA tablets. Check blood pressure for pre-eclampsia symptoms and verify fetal movement.',
    status: 'in_progress',
    outcomeNotes: '',
  },
  {
    _id: 'task-102',
    taskId: 'TASK-102',
    ashaWorker: { name: 'ASHA Geeta Yadav', phone: '9876543231', ward: 'Rampur Ward 1' },
    patientName: 'Rameshwar Singh',
    patientPhone: '9876543214',
    patientAddress: 'Rampur Ward 1, House 42',
    taskType: 'Chronic NCD Follow-up',
    priority: 'high',
    scheduledDate: 'Today',
    scheduledTime: '02:00 PM',
    instructions: 'Take fasting blood sugar reading with portable glucometer. Hand over Metformin Jan Aushadhi refill.',
    status: 'pending',
    outcomeNotes: '',
  },
  {
    _id: 'task-103',
    taskId: 'TASK-103',
    ashaWorker: { name: 'ASHA Sunita Devi', phone: '9876543230', ward: 'Sitapur Ward 4' },
    patientName: 'Aarav Kumar (Infant)',
    patientPhone: '9876543215',
    patientAddress: 'Rampur Ward 3, Kiosk Road',
    taskType: 'Infant Immunization Reminders',
    priority: 'routine',
    scheduledDate: 'Tomorrow',
    scheduledTime: '11:00 AM',
    instructions: 'Mobilize mother Sunita Kumar for MR-1 & Vitamin A vaccination dose at Anganwadi Booth 3.',
    status: 'pending',
    outcomeNotes: '',
  },
  {
    _id: 'task-104',
    taskId: 'TASK-104',
    ashaWorker: { name: 'ASHA Manju Devi', phone: '9876543232', ward: 'Rampur Ward 2' },
    patientName: 'Chhedi Lal',
    patientPhone: '9876543217',
    patientAddress: 'Sitapur Ward 4',
    taskType: 'Home Visit & Vitals',
    priority: 'routine',
    scheduledDate: 'Yesterday',
    scheduledTime: '04:00 PM',
    instructions: 'Weekly hypertension surveillance. Check adherence to Telmisartan medication.',
    status: 'completed',
    outcomeNotes: 'BP recorded 140/86 mmHg. Patient taking medication regularly without complaints.',
  }
];

const INITIAL_VILLAGE_PATIENTS = [
  { 
    _id: '6aa974847fbaf7f52bfb3707',
    id: 1, 
    name: 'Kamla Devi', 
    age: '28 yrs', 
    gender: 'Female',
    icon: 'pregnant_woman', 
    risk: 'High Risk', 
    riskColor: true, 
    type: 'Trimester 3 Checkup (तीसरी तिमाही)', 
    phone: '9876543251', 
    village: 'Rampur Ward 2', 
    abha: '91-4820-1940-2810',
    condition: 'Trimester 3 Pregnancy (Gestational Anemia & Mild Pre-eclampsia)',
    meds: 'Iron Folic Acid (IFA) 1 tab OD, Calcium 500mg BD',
    allergies: 'Penicillin Allergy (Severe)',
    emergencyContact: 'Husband: Mahendra (+91 9876543220)',
    lastVitals: 'BP 138/88 mmHg • Pulse 82 • SpO2 98%',
    vitals: { systolicBP: 138, diastolicBP: 88, heartRate: 82, spO2: 98, temperature: 98.6, bloodSugar: 108 },
    referredDoctor: 'Dr. Priya Verma (SDH Sitapur)',
    assignedAsha: 'ASHA Sunita Devi',
  },
  { 
    _id: '6aa974857fbaf7f52bfb370c',
    id: 2, 
    name: 'Rameshwar Singh', 
    age: '64 yrs', 
    gender: 'Male',
    icon: 'bloodtype', 
    risk: 'High Risk', 
    riskColor: true, 
    type: 'Diabetes & BP Follow-up', 
    phone: '9876543214', 
    village: 'Rampur Ward 1', 
    abha: '91-2311-9041-5512',
    condition: 'Type-2 Diabetes (HbA1c 8.2%) & Essential Hypertension',
    meds: 'Metformin 500mg BD, Amlodipine 5mg OD',
    allergies: 'None reported',
    emergencyContact: 'Son: Sunil Singh (+91 9876543221)',
    lastVitals: 'BP 146/92 mmHg • Pulse 74 • Sugar 164 mg/dL',
    vitals: { systolicBP: 146, diastolicBP: 92, heartRate: 74, spO2: 97, temperature: 98.4, bloodSugar: 164 },
    referredDoctor: 'Dr. Rajesh Sharma (CHC Sitapur)',
    assignedAsha: 'ASHA Geeta Yadav',
  },
  { 
    _id: '6aa974857fbaf7f52bfb3712',
    id: 3, 
    name: 'Aarav Kumar', 
    age: '9 mos', 
    gender: 'Male',
    icon: 'child_care', 
    risk: 'Routine', 
    riskColor: false, 
    type: 'Immunization MR-1 (टीकाकरण)', 
    phone: '9876543215', 
    village: 'Rampur Ward 3', 
    abha: '91-8832-1002-3921',
    condition: '9-Month Milestone Checkup & Weight Monitoring',
    meds: 'Vitamin A Syrup (1 Lakh IU), Paracetamol Drops SOS',
    allergies: 'None reported',
    emergencyContact: 'Mother: Sunita Kumar (+91 9876543222)',
    lastVitals: 'Weight: 8.4 kg • Temp: 98.4°F • SpO2: 99%',
    vitals: { systolicBP: 90, diastolicBP: 60, heartRate: 110, spO2: 99, temperature: 98.4, bloodSugar: 85 },
    referredDoctor: 'Dr. Ananya Gupta (District Hospital)',
    assignedAsha: 'ASHA Pushpa Sharma',
  },
  { 
    _id: '6aa974867fbaf7f52bfb3716',
    id: 4, 
    name: 'Meena Yadav', 
    age: '34 yrs', 
    gender: 'Female',
    icon: 'elderly_woman', 
    risk: 'Normal', 
    riskColor: false, 
    type: 'Post-natal Care (प्रसवोत्तर देखभाल)', 
    phone: '9876543216', 
    village: 'Sitapur Ward 4', 
    abha: '91-3490-1122-8761',
    condition: 'Post-natal Day 14 Recovery • Infant Lactation Review',
    meds: 'IFA 1 OD, Multivitamin & Calcium 500mg',
    allergies: 'Sulfa Drugs',
    emergencyContact: 'Mother-in-law: Sita Devi (+91 9876543223)',
    lastVitals: 'BP 118/76 mmHg • Pulse 72 • Temp: 98.6°F',
    vitals: { systolicBP: 118, diastolicBP: 76, heartRate: 72, spO2: 98, temperature: 98.6, bloodSugar: 94 },
    referredDoctor: 'Dr. Priya Verma (Maternal Health)',
    assignedAsha: 'ASHA Sunita Devi',
  },
  { 
    _id: '6aa974877fbaf7f52bfb371a',
    id: 5, 
    name: 'Chhedi Lal', 
    age: '71 yrs', 
    gender: 'Male',
    icon: 'elderly', 
    risk: 'Scheduled', 
    riskColor: false, 
    type: 'Hypertension Review (उच्च रक्तचाप)', 
    phone: '9876543217', 
    village: 'Sitapur Ward 4', 
    abha: '91-9981-2244-1298',
    condition: 'Chronic Hypertension & Mild Osteoarthritis',
    meds: 'Telmisartan 40mg OD, Calcium D3',
    allergies: 'Aspirin / NSAIDs',
    emergencyContact: 'Nephew: Anil Lal (+91 9876543224)',
    lastVitals: 'BP 142/86 mmHg • Pulse 68 • SpO2: 96%',
    vitals: { systolicBP: 142, diastolicBP: 86, heartRate: 68, spO2: 96, temperature: 98.2, bloodSugar: 112 },
    referredDoctor: 'Dr. Rajesh Sharma (CHC Sitapur)',
    assignedAsha: 'ASHA Sunita Devi',
  },
  {
    _id: '6aa974837fbaf7f52bfb36fc',
    id: 6,
    name: 'Aditya Verma',
    age: '32 yrs',
    gender: 'Male',
    icon: 'person',
    risk: 'Routine',
    riskColor: false,
    type: 'General Health & Vitals Review',
    phone: '9876543252',
    village: 'Sitapur Ward 4 Kiosk',
    abha: '91-8472-1029-4820',
    condition: 'Post-viral recovery, mild fatigue',
    meds: 'Paracetamol 650mg SOS, Vitamin B-Complex OD',
    allergies: 'None reported',
    emergencyContact: 'Father: R.K. Verma (+91 9876543290)',
    lastVitals: 'BP 122/80 mmHg • Pulse 74 • SpO2: 99%',
    vitals: { systolicBP: 122, diastolicBP: 80, heartRate: 74, spO2: 99, temperature: 98.4, bloodSugar: 98 },
    referredDoctor: 'Dr. Rajesh Sharma (CHC Sitapur Central)',
    assignedAsha: 'ASHA Sunita Devi',
  }
];

const INITIAL_VACCINES = [
  {
    id: 'V-01',
    childName: 'Aarav Kumar',
    age: '9 mos',
    motherName: 'Sunita Kumar',
    village: 'Rampur Ward 3',
    vaccineName: 'MR-1 (Measles-Rubella) + Vitamin A',
    dueDate: 'Due Today (16 Sep 2026)',
    status: 'due',
    doseNumber: 'Dose 1 of 2',
    facility: 'Anganwadi Centre 3',
    assignedAsha: 'ASHA Pushpa Sharma',
    batchNo: '',
  },
  {
    id: 'V-02',
    childName: 'Diya Patel',
    age: '1.5 yrs',
    motherName: 'Gita Patel',
    village: 'Rampur Ward 1',
    vaccineName: 'DPT Booster-1 & OPV Booster',
    dueDate: 'Next Week (24 Sep 2026)',
    status: 'scheduled',
    doseNumber: 'Booster Dose',
    facility: 'Rampur Sub-Centre Kiosk',
    assignedAsha: 'ASHA Geeta Yadav',
    batchNo: '',
  },
  {
    id: 'V-03',
    childName: 'Kamla Devi',
    age: '28 yrs (Pregnant)',
    motherName: 'Self (Maternal Care)',
    village: 'Rampur Ward 2',
    vaccineName: 'Tetanus & adult Diphtheria (Td-2)',
    dueDate: '20 Sep 2026',
    status: 'scheduled',
    doseNumber: 'Antenatal Dose 2',
    facility: 'CHC Sitapur Central',
    assignedAsha: 'ASHA Manju Devi',
    batchNo: '',
  },
  {
    id: 'V-04',
    childName: 'Rohan Gupta',
    age: '5 yrs',
    motherName: 'Pooja Gupta',
    village: 'Sitapur Ward 4',
    vaccineName: 'DPT Booster-2 (School Entry Dose)',
    dueDate: 'Due Today (16 Sep 2026)',
    status: 'due',
    doseNumber: 'Final Booster',
    facility: 'Primary School Booth 4',
    assignedAsha: 'ASHA Sunita Devi',
    batchNo: '',
  },
  {
    id: 'V-05',
    childName: 'Pari Yadav',
    age: '14 wks',
    motherName: 'Meena Yadav',
    village: 'Sitapur Ward 4',
    vaccineName: 'Pentavalent-3, Rotavirus-3 & fIPV-2',
    dueDate: '10 Sep 2026',
    status: 'completed',
    doseNumber: 'Primary Series 3',
    facility: 'Sitapur Sub-Centre Kiosk',
    assignedAsha: 'ASHA Sunita Devi',
    batchNo: 'SII-PNT-9942',
    completedDate: '10 Sep 2026',
  },
];

export default function HealthWorkerDashboard() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks', 'vitals-triage', 'registry', 'immunization', 'requests'
  const [activeModal, setActiveModal] = useState(null); // 'assign-task', 'vitals', 'dossier', 'register-citizen', 'log-vaccine', 'schedule-chart', 'update-task'
  
  // Data States with permanent LocalStorage persistence on top of MongoDB Atlas
  const [tasks, setTasks] = useState(() => {
    try {
      const local = JSON.parse(localStorage.getItem('sehatsaarthi_asha_tasks'));
      if (local && local.length > 0) return local;
    } catch(e) {}
    return INITIAL_TASKS;
  });

  const [patients, setPatients] = useState(() => {
    try {
      const local = JSON.parse(localStorage.getItem('sehatsaarthi_village_patients'));
      if (local && local.length > 0) return local;
    } catch(e) {}
    return INITIAL_VILLAGE_PATIENTS;
  });

  const [vaccines, setVaccines] = useState(() => {
    try {
      const local = JSON.parse(localStorage.getItem('sehatsaarthi_village_vaccines'));
      if (local && local.length > 0) return local;
    } catch(e) {}
    return INITIAL_VACCINES;
  });
  const [citizenRequests, setCitizenRequests] = useState([]);

  // Selected entities for modals
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedVaccine, setSelectedVaccine] = useState(null);

  // Filters & Searches
  const [taskFilter, setTaskFilter] = useState('ALL');
  const [registrySearch, setRegistrySearch] = useState('');
  const [wardFilter, setWardFilter] = useState('ALL');
  const [vaccineFilter, setVaccineFilter] = useState('ALL');

  // Registry Sub-Tabs: 'citizens' or 'asha'
  const [registrySubTab, setRegistrySubTab] = useState('citizens');
  const [ashaList, setAshaList] = useState(() => {
    try {
      const local = JSON.parse(localStorage.getItem('sehatsaarthi_asha_roster'));
      if (local && local.length > 0) return local;
    } catch(e) {}
    return ASHA_WORKFORCE;
  });

  const [newAshaForm, setNewAshaForm] = useState({
    name: '',
    phone: '',
    ward: 'Sitapur Ward 4',
    households: 220,
    status: 'Active on Duty',
  });

  // Form: Assign New Task to ASHA
  const [taskForm, setTaskForm] = useState({
    ashaName: 'ASHA Sunita Devi',
    patientName: 'Kamla Devi',
    patientAddress: 'Rampur Ward 2',
    patientPhone: '9876543251',
    taskType: 'Antenatal Checkup (ANC)',
    priority: 'high',
    scheduledDate: 'Today',
    scheduledTime: '10:00 AM',
    instructions: 'Check blood pressure, verify fetal movements, deliver IFA supplements.',
  });

  // Form: Vitals Entry
  const [vitalsForm, setVitalsForm] = useState({
    bp: '120/80',
    pulse: '72',
    spo2: '98',
    temp: '98.6',
    sugar: '104',
    notes: '',
    urgent: false,
  });

  // Form: Register New Citizen
  const [newCitizen, setNewCitizen] = useState({
    name: '',
    age: '',
    gender: 'Female',
    phone: '',
    village: 'Sitapur Ward 4',
    condition: 'Routine Health Check',
    allergies: 'None reported',
    risk: 'Routine',
    assignedAsha: 'ASHA Sunita Devi',
  });

  // Form: Log Vaccine
  const [vaccineLogForm, setVaccineLogForm] = useState({
    batchNo: 'SII-COV-8291',
    facility: 'Anganwadi Centre 3 (Sitapur)',
    notes: 'Vaccine vial monitor verified (Stage 1), zero adverse reaction noted.',
  });

  const [toastMessage, setToastMessage] = useState(null);
  const [submittingVitals, setSubmittingVitals] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Background data fetching & automatic sync
  const fetchCitizenRequests = () => {
    api.get('/health-worker/visit-requests')
      .then(r => {
        if (r.data?.data) {
          setCitizenRequests(r.data.data);
          try { localStorage.setItem('sehatsaarthi_visit_requests', JSON.stringify(r.data.data)); } catch(e) {}
        }
      })
      .catch(() => {
        try {
          const local = JSON.parse(localStorage.getItem('sehatsaarthi_visit_requests') || '[]');
          setCitizenRequests(local);
        } catch(e) {}
      });
  };

  const fetchAssignedPatients = () => {
    api.get('/health-worker/patients')
      .then(r => {
        if (r.data?.data && r.data.data.length > 0) {
          const backendPatients = r.data.data;
          const merged = INITIAL_VILLAGE_PATIENTS.map(ip => {
            const found = backendPatients.find(bp => bp._id === ip._id || bp.name.toLowerCase() === ip.name.toLowerCase());
            if (found) {
              return {
                ...ip,
                ...found,
                vitals: found.vitals || ip.vitals,
                lastVitals: found.vitals ? `BP ${found.vitals.systolicBP}/${found.vitals.diastolicBP} • Pulse ${found.vitals.heartRate}` : ip.lastVitals,
              };
            }
            return ip;
          });
          setPatients(merged);
        }
      })
      .catch(err => {
        console.warn('Local patients fallback:', err);
      });
  };

  const fetchTasks = () => {
    api.get('/health-worker/tasks')
      .then(r => {
        if (r.data?.data && r.data.data.length > 0) {
          setTasks(r.data.data);
          try { localStorage.setItem('sehatsaarthi_asha_tasks', JSON.stringify(r.data.data)); } catch(e) {}
        }
      })
      .catch(() => {
        try {
          const local = JSON.parse(localStorage.getItem('sehatsaarthi_asha_tasks') || '[]');
          if (local.length > 0) setTasks(local);
        } catch(e) {}
      });
  };

  useEffect(() => {
    fetchCitizenRequests();
    fetchAssignedPatients();
    fetchTasks();
    const interval = setInterval(() => {
      fetchCitizenRequests();
      fetchAssignedPatients();
      fetchTasks();
      try {
        localStorage.setItem('sehatsaarthi_last_abdm_sync', new Date().toISOString());
      } catch(e) {}
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // 1. Assign New Task to ASHA Worker
  const handleCreateTask = async (e) => {
    e.preventDefault();
    const ashaObj = ASHA_WORKFORCE.find(a => a.name === taskForm.ashaName) || { name: taskForm.ashaName, phone: '9876543230', ward: taskForm.patientAddress };
    const newTask = {
      _id: `task-${Date.now()}`,
      taskId: `TASK-${Math.floor(100 + Math.random() * 900)}`,
      ashaWorker: ashaObj,
      patientName: taskForm.patientName,
      patientPhone: taskForm.patientPhone,
      patientAddress: taskForm.patientAddress,
      taskType: taskForm.taskType,
      priority: taskForm.priority,
      scheduledDate: taskForm.scheduledDate,
      scheduledTime: taskForm.scheduledTime,
      instructions: taskForm.instructions,
      status: 'pending',
    };

    let updatedTasks = [newTask, ...tasks];
    try {
      const res = await api.post('/health-worker/tasks', newTask);
      if (res.data?.success) {
        updatedTasks = [res.data.data, ...tasks];
      }
    } catch {}

    setTasks(updatedTasks);
    try { localStorage.setItem('sehatsaarthi_asha_tasks', JSON.stringify(updatedTasks)); } catch(e) {}
    showToast(`Task ${newTask.taskId} assigned to ${taskForm.ashaName}! SMS alert dispatched.`);
    setActiveModal(null);
  };

  // 2. Update Task Status
  const handleUpdateTaskStatus = async (taskId, newStatus, outcomeNotes) => {
    try {
      await api.patch(`/health-worker/tasks/${taskId}/status`, { status: newStatus, outcomeNotes });
    } catch {}

    const updated = tasks.map(t => {
      if (t._id === taskId || t.taskId === taskId) {
        return {
          ...t,
          status: newStatus,
          outcomeNotes: outcomeNotes || t.outcomeNotes || (newStatus === 'completed' ? 'Field task verified by Health Worker.' : ''),
        };
      }
      return t;
    });
    setTasks(updated);
    try { localStorage.setItem('sehatsaarthi_asha_tasks', JSON.stringify(updated)); } catch(e) {}

    showToast(`Task status updated to "${newStatus.replace('_', ' ')}"!`);
    setActiveModal(null);
  };

  // 3. Update Citizen Visit Request Status
  const handleUpdateVisitStatus = async (id, newStatus, customNotes) => {
    try {
      const nowStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
      const scheduledTime = newStatus === 'scheduled' ? `Today, ${nowStr}` : undefined;
      const actionNotes = customNotes || (
        newStatus === 'scheduled' ? 'Health Worker assigned visit to ASHA Sunita Devi' :
        newStatus === 'in_progress' ? 'ASHA field worker en-route to household' :
        newStatus === 'completed' ? 'Home visit & health check completed' :
        newStatus === 'cancelled' ? 'Visit cancelled/rescheduled' : ''
      );

      const res = await api.patch(`/health-worker/visit-requests/${id}/status`, {
        status: newStatus,
        scheduledTime,
        actionNotes
      });

      const updated = citizenRequests.map(item => (item._id === id ? res.data.data : item));
      setCitizenRequests(updated);
      try { localStorage.setItem('sehatsaarthi_visit_requests', JSON.stringify(updated)); } catch(e) {}
      showToast(`Visit request updated to "${newStatus.replace('_', ' ')}"!`);
    } catch (err) {
      const updated = citizenRequests.map(item => {
        if (item._id === id || item.requestId === id) {
          return {
            ...item,
            status: newStatus,
            scheduledTime: newStatus === 'scheduled' ? 'Today, 11:30 AM' : item.scheduledTime,
            actionNotes: customNotes || (newStatus === 'scheduled' ? 'Assigned to ASHA' : 'Updated')
          };
        }
        return item;
      });
      setCitizenRequests(updated);
      try { localStorage.setItem('sehatsaarthi_visit_requests', JSON.stringify(updated)); } catch(e) {}
      showToast(`Status updated to "${newStatus.replace('_', ' ')}"`);
    }
  };

  // 3b. Onboard / Register New ASHA Worker
  const handleRegisterAsha = (e) => {
    e.preventDefault();
    if (!newAshaForm.name) {
      showToast('Please enter ASHA worker name');
      return;
    }
    const cleanName = newAshaForm.name.startsWith('ASHA ') ? newAshaForm.name : `ASHA ${newAshaForm.name}`;
    const newWorker = {
      id: `ASHA-0${ashaList.length + 1}`,
      name: cleanName,
      phone: newAshaForm.phone || '9876543235',
      ward: newAshaForm.ward || 'Sitapur Ward 4',
      households: Number(newAshaForm.households) || 220,
      status: newAshaForm.status || 'Active on Duty',
    };
    const updated = [...ashaList, newWorker];
    setAshaList(updated);
    try { localStorage.setItem('sehatsaarthi_asha_roster', JSON.stringify(updated)); } catch(e) {}
    showToast(`${newWorker.name} successfully onboarded to ASHA workforce roster!`);
    setActiveModal(null);
    setNewAshaForm({ name: '', phone: '', ward: 'Sitapur Ward 4', households: 220, status: 'Active on Duty' });
  };

  // 4. Record Vitals & Triage
  const handleSaveVitals = async (e) => {
    e.preventDefault();
    setSubmittingVitals(true);
    try {
      const [sys, dia] = vitalsForm.bp.includes('/') ? vitalsForm.bp.split('/') : [vitalsForm.bp, '80'];
      const targetPatientId = selectedPatient?._id || '6aa974847fbaf7f52bfb3707';

      const payload = {
        patientId: targetPatientId,
        riskLevel: vitalsForm.urgent ? 'high' : 'medium',
        vitals: {
          systolicBP: Number(sys) || 120,
          diastolicBP: Number(dia) || 80,
          heartRate: Number(vitalsForm.pulse) || 72,
          spO2: Number(vitalsForm.spo2) || 98,
          temperature: Number(vitalsForm.temp) || 98.6,
          bloodSugar: Number(vitalsForm.sugar) || 100,
        },
        symptoms: ['routine_checkup'],
        notes: vitalsForm.notes || 'Routine vitals updated by Community Health Worker (ANM/CHO).',
      };

      await api.post('/health-worker/triage', payload);

      const vitalsSummary = `BP ${payload.vitals.systolicBP}/${payload.vitals.diastolicBP} mmHg • Pulse ${payload.vitals.heartRate} • SpO2 ${payload.vitals.spO2}%`;
      const updated = patients.map(p => {
        if (p._id === targetPatientId || p.id === selectedPatient?.id || p.name === selectedPatient?.name) {
          return {
            ...p,
            lastVitals: vitalsSummary,
            vitals: payload.vitals,
            risk: vitalsForm.urgent ? 'High Risk' : p.risk,
            riskColor: vitalsForm.urgent ? true : p.riskColor,
          };
        }
        return p;
      });
      setPatients(updated);
      try { localStorage.setItem('sehatsaarthi_village_patients', JSON.stringify(updated)); } catch(e) {}

      showToast(`Vitals for ${selectedPatient?.name} recorded & synced to ABDM Health Grid!`);
      setActiveModal(null);
    } catch {
      const vitalsSummary = `BP ${vitalsForm.bp} mmHg • Pulse ${vitalsForm.pulse} • SpO2 ${vitalsForm.spo2}%`;
      const updated = patients.map(p => {
        if (p.name === selectedPatient?.name) {
          return { ...p, lastVitals: vitalsSummary };
        }
        return p;
      });
      setPatients(updated);
      try { localStorage.setItem('sehatsaarthi_village_patients', JSON.stringify(updated)); } catch(e) {}
      showToast(`Vitals for ${selectedPatient?.name} saved locally!`);
      setActiveModal(null);
    } finally {
      setSubmittingVitals(false);
    }
  };

  // 5. Register New Citizen
  const handleRegisterCitizen = async (e) => {
    e.preventDefault();
    if (!newCitizen.name) {
      showToast('Please enter citizen name');
      return;
    }

    const randomAbha = `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
    let serverId = `local-${Date.now()}`;
    try {
      const res = await api.post('/health-worker/register-citizen', newCitizen);
      if (res.data?.data?._id) serverId = res.data.data._id;
    } catch(err) {
      console.warn('Citizen saved locally:', err);
    }

    const newEntry = {
      _id: serverId,
      id: patients.length + 1,
      name: newCitizen.name,
      age: `${newCitizen.age || '30'} yrs`,
      gender: newCitizen.gender,
      icon: newCitizen.gender === 'Female' ? 'person_4' : 'person',
      risk: newCitizen.risk,
      riskColor: newCitizen.risk === 'High Risk',
      type: 'New Household Registration (नवीन पंजीयन)',
      phone: newCitizen.phone || '9876543299',
      village: newCitizen.village,
      abha: randomAbha,
      condition: newCitizen.condition,
      meds: 'Pending clinical assessment',
      allergies: newCitizen.allergies,
      emergencyContact: `Family Member (+91 ${newCitizen.phone || '9876543299'})`,
      lastVitals: 'Pending first vitals check',
      vitals: { systolicBP: 120, diastolicBP: 80, heartRate: 72, spO2: 98, temperature: 98.6 },
      referredDoctor: 'Dr. Rajesh Sharma (CHC Sitapur Central)',
      assignedAsha: newCitizen.assignedAsha,
    };

    const updated = [newEntry, ...patients];
    setPatients(updated);
    try { localStorage.setItem('sehatsaarthi_village_patients', JSON.stringify(updated)); } catch(e) {}

    showToast(`Citizen "${newCitizen.name}" registered with ABHA: ${randomAbha}! Assigned to ${newCitizen.assignedAsha}.`);
    setActiveModal(null);
    setNewCitizen({
      name: '',
      age: '',
      gender: 'Female',
      phone: '',
      village: 'Sitapur Ward 4',
      condition: 'Routine Health Check',
      allergies: 'None reported',
      risk: 'Routine',
      assignedAsha: 'ASHA Sunita Devi',
    });
  };

  // 6. Log Vaccination Dose
  const handleLogVaccineDose = (e) => {
    e.preventDefault();
    if (!selectedVaccine) return;

    const updated = vaccines.map(v => {
      if (v.id === selectedVaccine.id) {
        return {
          ...v,
          status: 'completed',
          batchNo: vaccineLogForm.batchNo || 'SII-COV-8291',
          facility: vaccineLogForm.facility || 'Anganwadi Centre 3',
          completedDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        };
      }
      return v;
    });

    setVaccines(updated);
    try { localStorage.setItem('sehatsaarthi_village_vaccines', JSON.stringify(updated)); } catch(e) {}
    showToast(`Vaccination dose for "${selectedVaccine.childName}" verified & logged on U-WIN Grid!`);
    setActiveModal(null);
  };

  // Filters
  const filteredTasks = tasks.filter(t => {
    if (taskFilter === 'PENDING') return t.status === 'pending';
    if (taskFilter === 'IN_PROGRESS') return t.status === 'in_progress';
    if (taskFilter === 'COMPLETED') return t.status === 'completed';
    return true;
  });

  const filteredPatients = patients.filter(p => {
    const term = registrySearch.toLowerCase();
    const matchesSearch = !term || (
      p.name.toLowerCase().includes(term) ||
      p.abha.includes(term) ||
      p.phone.includes(term) ||
      p.village.toLowerCase().includes(term)
    );
    const matchesWard = wardFilter === 'ALL' || p.village.includes(wardFilter);
    return matchesSearch && matchesWard;
  });

  const filteredVaccines = vaccines.filter(v => {
    if (vaccineFilter === 'DUE') return v.status === 'due';
    if (vaccineFilter === 'SCHEDULED') return v.status === 'scheduled';
    if (vaccineFilter === 'COMPLETED') return v.status === 'completed';
    return true;
  });

  return (
    <div className="bg-[#fbfaf7] text-slate-900 font-sans min-h-screen">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-[120] bg-slate-900 text-amber-300 px-5 py-3 rounded-2xl shadow-xl border border-amber-400/50 flex items-center gap-3 text-sm font-bold animate-bounce">
          <span className="material-symbols-outlined text-amber-400">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER: Health Worker Supervisor Console */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs w-full">
        <div className="w-full px-6 lg:px-12 xl:px-16 flex items-center justify-between gap-8 h-20">
          {/* Logo with Govt Health Worker Console Badge */}
          <Link to="/health-worker" className="flex items-center gap-3.5 shrink-0 group">
            <img src="/images/logo-transparent.png" alt="SehatSaarthi" className="w-11 h-11 rounded-2xl object-cover shrink-0 notranslate" translate="no" />
            <div className="flex flex-col">
              <span className="font-brand font-black text-slate-900 tracking-tight text-2xl leading-none group-hover:text-amber-700 transition-colors notranslate" translate="no">SehatSaarthi</span>
              <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 self-start mt-1">
                Govt Portal • Health Worker Console
              </span>
            </div>
          </Link>

          {/* Navigation Items */}
          <nav className="hidden lg:flex items-center gap-2 xl:gap-3">
            <button 
              onClick={() => setActiveTab('tasks')} 
              className={`px-3 py-2 font-extrabold text-sm rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'tasks' 
                  ? 'bg-amber-600 text-white shadow-sm' 
                  : 'text-slate-700 hover:text-amber-800 hover:bg-amber-50/70'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">assignment_turned_in</span>
              <span>ASHA Task Delegation</span>
              <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-1.5 py-0.2 rounded-full border border-amber-300">
                {tasks.filter(t => t.status !== 'completed').length}
              </span>
            </button>

            <div className="h-6 w-[2px] bg-slate-300 rounded-full shrink-0"></div>

            <button 
              onClick={() => setActiveTab('vitals-triage')} 
              className={`px-3 py-2 font-extrabold text-sm rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'vitals-triage' 
                  ? 'bg-amber-600 text-white shadow-sm' 
                  : 'text-slate-700 hover:text-amber-800 hover:bg-amber-50/70'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">favorite</span>
              <span>Vitals &amp; Triage</span>
            </button>

            <div className="h-6 w-[2px] bg-slate-300 rounded-full shrink-0"></div>

            <button 
              onClick={() => setActiveTab('registry')} 
              className={`px-3 py-2 font-extrabold text-sm rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'registry' 
                  ? 'bg-amber-600 text-white shadow-sm' 
                  : 'text-slate-700 hover:text-amber-800 hover:bg-amber-50/70'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">group</span>
              <span>Registry</span>
            </button>

            <div className="h-6 w-[2px] bg-slate-300 rounded-full shrink-0"></div>

            <button 
              onClick={() => setActiveTab('immunization')} 
              className={`px-3 py-2 font-extrabold text-sm rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'immunization' 
                  ? 'bg-amber-600 text-white shadow-sm' 
                  : 'text-slate-700 hover:text-amber-800 hover:bg-amber-50/70'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">vaccines</span>
              <span>Immunization</span>
            </button>
            
            <div className="h-6 w-[2px] bg-slate-300 rounded-full shrink-0"></div>

            <button 
              onClick={() => setActiveTab('requests')} 
              className={`px-3 py-2 font-extrabold text-sm rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'requests' 
                  ? 'bg-amber-600 text-white shadow-sm' 
                  : 'text-slate-700 hover:text-amber-800 hover:bg-amber-50/70'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">home_health</span>
              <span>Visit Requests</span>
              {citizenRequests.filter(r => r.status === 'pending').length > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse shadow-2xs">
                  {citizenRequests.filter(r => r.status === 'pending').length}
                </span>
              )}
            </button>
          </nav>

          {/* Right Action Controls: Clean Language + Logout */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="h-8 w-[2px] bg-slate-300 rounded-full hidden lg:block mr-1"></div>

            <LanguageSelector />

            <button 
              onClick={() => { if (window.confirm('Are you sure you want to logout?')) logout(); }} 
              className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 border border-slate-200 flex items-center justify-center transition-all shadow-xs cursor-pointer" 
              title="Logout"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="w-full px-6 lg:px-12 xl:px-16 pt-28 pb-16">
        {/* Top Health Worker Hero Banner */}
        <div className="bg-gradient-to-r from-amber-500/15 via-amber-100/40 to-transparent p-6 sm:p-8 rounded-3xl border-2 border-amber-300 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-amber-300 text-amber-900 text-xs font-extrabold mb-3 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>National Health Mission • Primary Healthcare Supervision</span>
              </div>
              <h1 className="font-heading text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Community Health Worker (ANM / CHO) Console
              </h1>
              <p className="text-base text-slate-700 font-semibold mt-1">
                Health Supervisor: <span className="text-amber-800 underline decoration-amber-400 decoration-2">{user?.name || 'Rekha Rani (Senior ANM / CHO)'}</span> • Supervising 8 Grassroot ASHA Workers across 1,200 Households
              </p>
            </div>

            <div className="bg-white border-2 border-amber-300 p-5 rounded-3xl shadow-md flex items-center gap-4 self-start md:self-auto shrink-0">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border-2 border-amber-300 flex items-center justify-center text-amber-700 shrink-0 shadow-xs">
                <span className="material-symbols-outlined text-[30px]">health_and_safety</span>
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-black mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                  <span>SUPERVISORY DUTY ACTIVE</span>
                </div>
                <div className="flex items-center gap-2 bg-amber-100 text-amber-950 border-2 border-amber-300 px-3 py-1 rounded-xl shadow-xs my-1">
                  <span className="material-symbols-outlined text-[16px] text-amber-700">supervisor_account</span>
                  <span className="text-sm font-black tracking-tight">8 ASHA Workers Under Supervision</span>
                </div>
                <span className="text-xs text-slate-600 font-bold block mt-0.5">Sitapur Rural Block Sector</span>
              </div>
            </div>
          </div>
        </div>

        {/* Supervisory Key Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-xs">
            <span className="text-xs font-extrabold text-slate-500 uppercase">ASHA Workforce</span>
            <p className="text-3xl font-black text-slate-900 mt-1">8 ASHAs</p>
            <span className="text-[11px] text-emerald-700 font-extrabold flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              All Active on Ground
            </span>
          </div>

          <div className="bg-amber-50/70 p-5 rounded-2xl border-2 border-amber-300 shadow-xs">
            <span className="text-xs font-extrabold text-amber-800 uppercase">Active Field Tasks</span>
            <p className="text-3xl font-black text-amber-950 mt-1">{tasks.filter(t => t.status !== 'completed').length}</p>
            <span className="text-[11px] text-amber-900 font-semibold mt-0.5 block">Delegated to ASHA workers</span>
          </div>

          <div className="bg-rose-50/70 p-5 rounded-2xl border-2 border-rose-300 shadow-xs">
            <span className="text-xs font-extrabold text-rose-800 uppercase">High-Risk Triage</span>
            <p className="text-3xl font-black text-rose-950 mt-1">{patients.filter(p => p.riskColor).length}</p>
            <span className="text-[11px] text-rose-800 font-extrabold mt-0.5 block">Requires Medical Officer</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-xs">
            <span className="text-xs font-extrabold text-slate-500 uppercase">Pending Requests</span>
            <p className="text-3xl font-black text-slate-900 mt-1">{citizenRequests.filter(r => r.status === 'pending').length}</p>
            <span className="text-[11px] text-slate-500 font-semibold mt-0.5 block">Citizen requests to delegate</span>
          </div>
        </div>

        {/* TAB 1: ASHA TASK ASSIGNMENT & DELEGATION (CORE WORKFLOW) */}
        {activeTab === 'tasks' && (
          <div className="flex flex-col w-full animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-3 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">
                    Field Task Delegation to ASHA Workers
                  </h2>
                  <span className="bg-amber-100 text-amber-900 text-xs font-black px-2.5 py-0.5 rounded-full border border-amber-300">
                    Supervisor Hub
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                  Health Worker assigns household visits, maternal checkups, and routine surveillance to grassroot ASHA workers.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal('assign-task')}
                  className="px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-black text-xs shadow-sm flex items-center gap-2 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span className="material-symbols-outlined text-[18px]">add_task</span>
                  <span>Assign New Task to ASHA</span>
                </button>
              </div>
            </div>

            {/* Filter Chips for Tasks */}
            <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-2xl w-fit border border-slate-200">
              {[
                { key: 'ALL', label: `All Tasks (${tasks.length})` },
                { key: 'PENDING', label: `Pending (${tasks.filter(t => t.status === 'pending').length})` },
                { key: 'IN_PROGRESS', label: `In Progress (${tasks.filter(t => t.status === 'in_progress').length})` },
                { key: 'COMPLETED', label: `Completed (${tasks.filter(t => t.status === 'completed').length})` },
              ].map(f => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setTaskFilter(f.key)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    taskFilter === f.key 
                      ? 'bg-amber-600 text-white shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Task Cards */}
            <div className="space-y-4">
              {filteredTasks.map(t => {
                const isCompleted = t.status === 'completed';
                const isInProgress = t.status === 'in_progress';

                return (
                  <div 
                    key={t._id || t.taskId}
                    className={`bg-white p-5 sm:p-6 rounded-3xl border-2 transition-all shadow-sm ${
                      isCompleted ? 'border-slate-200 bg-slate-50/40' :
                      t.priority === 'urgent' ? 'border-rose-400 bg-rose-50/20' : 'border-amber-300'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div>
                        {/* Header row: Task ID, Priority, ASHA Worker Name */}
                        <div className="flex flex-wrap items-center gap-2.5 mb-2">
                          <span className="font-mono text-xs font-black text-amber-950 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-300">
                            {t.taskId}
                          </span>
                          <span className="text-xs font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-xl border border-slate-200 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px] text-amber-700">badge</span>
                            <span>Assigned To: <strong className="text-amber-900">{t.ashaWorker?.name}</strong> ({t.ashaWorker?.ward})</span>
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            t.priority === 'urgent' ? 'bg-rose-100 text-rose-900 border border-rose-300' :
                            t.priority === 'high' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {t.priority}
                          </span>
                        </div>

                        {/* Patient & Task Details */}
                        <h3 className="text-lg font-black text-slate-900 mb-0.5">
                          {t.taskType} — <span className="text-amber-950">{t.patientName}</span>
                        </h3>
                        <p className="text-xs text-slate-600 font-semibold flex flex-wrap items-center gap-2">
                          <span>📍 {t.patientAddress}</span>
                          <span>•</span>
                          <span>📞 Patient: {t.patientPhone}</span>
                          <span>•</span>
                          <span>Slot: {t.scheduledTime} ({t.scheduledDate})</span>
                        </p>

                        {/* Field Instructions */}
                        <div className="mt-2.5 p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-xs font-medium text-amber-950">
                          <strong className="text-amber-900 font-black mr-1">Supervisor Instructions for ASHA:</strong>
                          "{t.instructions}"
                        </div>

                        {/* Outcome / Completion Report */}
                        {t.outcomeNotes && (
                          <div className="mt-2 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-950 font-bold">
                            <strong className="text-emerald-900 font-black mr-1">ASHA Field Outcome Report:</strong>
                            {t.outcomeNotes}
                          </div>
                        )}
                      </div>

                      {/* Status & Action Buttons */}
                      <div className="flex flex-wrap lg:flex-col items-end gap-2 shrink-0 self-start lg:self-auto">
                        <span className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border shadow-2xs ${
                          isCompleted ? 'bg-emerald-100 text-emerald-900 border-emerald-300' :
                          isInProgress ? 'bg-sky-100 text-sky-900 border-sky-300' : 'bg-amber-100 text-amber-900 border-amber-300'
                        }`}>
                          {isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Pending Field Visit'}
                        </span>

                        <div className="flex items-center gap-2 mt-1">
                          <a 
                            href={`tel:${t.ashaWorker?.phone}`} 
                            className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold flex items-center gap-1"
                            title="Call ASHA on phone"
                          >
                            <span className="material-symbols-outlined text-[16px] text-amber-700">call</span>
                            <span>Call ASHA</span>
                          </a>

                          {!isCompleted && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedTask(t);
                                setActiveModal('update-task');
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black shadow-xs cursor-pointer"
                            >
                              Log ASHA Report
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: CITIZEN VITALS & TRIAGE MANAGEMENT */}
        {activeTab === 'vitals-triage' && (
          <div className="flex flex-col w-full animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-3 border-b border-slate-200">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">
                  Citizen Clinical Vitals &amp; Triage Records
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                  Health Worker digitally manages and updates vitals collected from field kits and village health post OPDs.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {patients.map(p => (
                <div 
                  key={p._id || p.id}
                  className={`bg-white p-5 rounded-3xl border-2 transition-all shadow-sm ${
                    p.riskColor ? 'border-rose-300 bg-rose-50/15' : 'border-slate-200 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shrink-0 border ${
                        p.riskColor ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        <span className="material-symbols-outlined text-[26px]">{p.icon}</span>
                      </div>
                      <div>
                        <h4 className="text-base font-black text-slate-900">{p.name}</h4>
                        <p className="text-xs text-slate-500 font-semibold">{p.age} • {p.gender} • {p.village}</p>
                      </div>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                      p.riskColor ? 'bg-rose-100 text-rose-900 border-rose-300' : 'bg-amber-100 text-amber-900 border-amber-300'
                    }`}>
                      {p.risk}
                    </span>
                  </div>

                  {/* Vitals Grid */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs mb-3">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Blood Pressure</span>
                      <strong className="text-slate-900 font-black">{p.vitals?.systolicBP}/{p.vitals?.diastolicBP} mmHg</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Heart Rate</span>
                      <strong className="text-slate-900 font-black">{p.vitals?.heartRate} bpm</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">SpO2 / Sugar</span>
                      <strong className="text-slate-900 font-black">{p.vitals?.spO2}% • {p.vitals?.bloodSugar || '98'}mg</strong>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mb-3">
                    <strong className="text-slate-900 font-bold">Assigned ASHA:</strong> {p.assignedAsha || 'ASHA Sunita Devi'}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPatient(p);
                        setActiveModal('dossier');
                      }}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold"
                    >
                      Dossier
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPatient(p);
                        setVitalsForm({
                          bp: `${p.vitals?.systolicBP || 120}/${p.vitals?.diastolicBP || 80}`,
                          pulse: String(p.vitals?.heartRate || 72),
                          spo2: String(p.vitals?.spO2 || 98),
                          temp: String(p.vitals?.temperature || 98.6),
                          sugar: String(p.vitals?.bloodSugar || 100),
                          notes: '',
                          urgent: p.riskColor,
                        });
                        setActiveModal('vitals');
                      }}
                      className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black shadow-xs cursor-pointer flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[15px]">edit_note</span>
                      <span>Update Vitals</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: REGISTRY (SUB-TABS: CITIZEN REGISTRY & ASHA WORKER REGISTRY) */}
        {activeTab === 'registry' && (
          <div className="flex flex-col w-full animate-fadeIn">
            {/* Top Sub-Tab Switcher */}
            <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full sm:w-fit border border-slate-200 mb-6 gap-2">
              <button
                type="button"
                onClick={() => setRegistrySubTab('citizens')}
                className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  registrySubTab === 'citizens'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">person</span>
                <span>Citizen Registry ({patients.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setRegistrySubTab('asha')}
                className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  registrySubTab === 'asha'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">badge</span>
                <span>ASHA Worker Registry ({ashaList.length})</span>
              </button>
            </div>

            {/* SUB-TAB 1: CITIZEN REGISTRY */}
            {registrySubTab === 'citizens' && (
              <div className="animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">Citizen Health Registry</h1>
                      <span className="bg-amber-100 text-amber-900 text-xs font-black px-2.5 py-0.5 rounded-full border border-amber-300">
                        {patients.length} Registered Households
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium">Digital ABHA health records of village households managed by the Community Health Worker.</p>
                  </div>
                  <button 
                    onClick={() => setActiveModal('register-citizen')}
                    className="bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white px-5 py-3 rounded-xl font-extrabold text-xs shadow-sm flex items-center gap-2 transition-all self-start sm:self-auto cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                    <span>Register New Citizen</span>
                  </button>
                </div>

                <div className="bg-white border-2 border-slate-200/90 rounded-3xl overflow-hidden shadow-sm">
                  <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <span className="material-symbols-outlined text-[20px]">search</span>
                      </span>
                      <input 
                        type="text" 
                        value={registrySearch}
                        onChange={(e) => setRegistrySearch(e.target.value)}
                        placeholder="Search by Citizen Name, ABHA ID (e.g. 91-4820), or Phone..." 
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500" 
                      />
                    </div>
                    <select 
                      value={wardFilter}
                      onChange={(e) => setWardFilter(e.target.value)}
                      className="bg-white px-4 py-2.5 border border-slate-300 rounded-xl text-xs font-extrabold text-slate-800 focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="ALL">All Wards (Rampur &amp; Sitapur)</option>
                      <option value="Ward 1">Ward 1 (North Rampur)</option>
                      <option value="Ward 2">Ward 2 (Central)</option>
                      <option value="Ward 3">Ward 3 (East Sub-Centre)</option>
                      <option value="Ward 4">Ward 4 (Sitapur Road)</option>
                    </select>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {filteredPatients.map(c => (
                      <div key={c._id || c.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center font-bold text-xl">
                            {c.name[0]}
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-base font-extrabold text-slate-900">{c.name}</h4>
                              <span className="text-xs text-slate-500 font-bold">• {c.age}</span>
                              <span className="text-xs font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300">{c.abha}</span>
                            </div>
                            <p className="text-xs text-slate-500 font-semibold mt-0.5">{c.village} • Ph: {c.phone} • Assigned ASHA: <strong className="text-slate-800">{c.assignedAsha || 'ASHA Sunita Devi'}</strong></p>
                            <p className="text-[11px] text-slate-600 mt-0.5">
                              <strong>Clinical State:</strong> {c.condition}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                          <button 
                            onClick={() => {
                              setSelectedPatient(c);
                              setActiveModal('dossier');
                            }}
                            className="h-10 px-4 rounded-xl border border-slate-300 bg-white hover:bg-amber-50 hover:text-amber-800 hover:border-amber-300 text-slate-800 text-xs font-extrabold transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
                          >
                            <span className="material-symbols-outlined text-[16px] text-amber-700">description</span>
                            <span>View Dossier</span>
                          </button>

                          <button 
                            onClick={() => { 
                              setSelectedPatient(c); 
                              setActiveModal('vitals'); 
                            }}
                            className="h-10 px-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black shadow-xs transition-all cursor-pointer flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[16px]">favorite</span>
                            <span>Vitals</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 2: ASHA WORKER REGISTRY */}
            {registrySubTab === 'asha' && (
              <div className="animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">ASHA Worker Workforce Registry</h1>
                      <span className="bg-amber-100 text-amber-900 text-xs font-black px-2.5 py-0.5 rounded-full border border-amber-300">
                        {ashaList.length} Field Workers
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium">
                      Grassroot ASHA workers deployed in Sitapur &amp; Rampur rural sectors under your supervisory oversight.
                    </p>
                  </div>

                  <button 
                    onClick={() => setActiveModal('add-asha')}
                    className="bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white px-5 py-3 rounded-xl font-extrabold text-xs shadow-sm flex items-center gap-2 transition-all self-start sm:self-auto cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                    <span>Onboard New ASHA</span>
                  </button>
                </div>

                {/* ASHA Workforce Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {ashaList.map(a => {
                    const activeAshaTasks = tasks.filter(t => t.ashaWorker?.name === a.name && t.status !== 'completed').length;
                    const isDutyActive = a.status === 'Active on Duty';

                    return (
                      <div 
                        key={a.id}
                        className="bg-white p-5 rounded-3xl border-2 border-slate-200 hover:border-amber-400 transition-all shadow-sm flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-2xl bg-amber-50 border-2 border-amber-300 flex items-center justify-center font-black text-amber-900 text-base shrink-0">
                                {a.name.replace('ASHA ', '').charAt(0)}
                              </div>
                              <div>
                                <h3 className="text-base font-black text-slate-900 leading-tight">{a.name}</h3>
                                <span className="text-[11px] font-mono font-bold text-amber-900 bg-amber-50 px-2 py-0.2 rounded border border-amber-200">
                                  {a.id}
                                </span>
                              </div>
                            </div>

                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${
                              isDutyActive ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-amber-100 text-amber-900 border-amber-300'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isDutyActive ? 'bg-emerald-600 animate-pulse' : 'bg-amber-600'}`}></span>
                              {a.status}
                            </span>
                          </div>

                          <div className="space-y-1.5 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200 mb-4">
                            <div className="flex justify-between">
                              <span className="text-slate-500 font-semibold">Assigned Ward:</span>
                              <strong className="text-slate-900 font-extrabold">{a.ward}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500 font-semibold">Households Covered:</span>
                              <strong className="text-slate-900 font-extrabold">{a.households} Households</strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500 font-semibold">Active Field Tasks:</span>
                              <strong className={`${activeAshaTasks > 0 ? 'text-amber-950 font-black' : 'text-slate-500'}`}>
                                {activeAshaTasks} Pending Tasks
                              </strong>
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          <a 
                            href={`tel:${a.phone}`}
                            className="px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-xs font-extrabold flex items-center gap-1 shadow-2xs"
                          >
                            <span className="material-symbols-outlined text-[16px] text-amber-700">call</span>
                            <span>Call</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => {
                              setTaskForm(prev => ({
                                ...prev,
                                ashaName: a.name,
                                patientAddress: a.ward,
                              }));
                              setActiveModal('assign-task');
                            }}
                            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-black shadow-xs cursor-pointer flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[16px]">add_task</span>
                            <span>Assign Task</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: VILLAGE IMMUNIZATION TRACKER */}
        {activeTab === 'immunization' && (
          <div className="flex flex-col w-full animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-heading">Village Immunization Management</h1>
                <p className="text-sm text-slate-600 font-medium">Mission Indradhanush vaccination schedule for infants and pregnant mothers overseen by Health Worker.</p>
              </div>

              <button
                type="button"
                onClick={() => setActiveModal('schedule-chart')}
                className="px-4 py-2.5 bg-white hover:bg-amber-50 text-amber-900 border-2 border-amber-300 font-black text-xs rounded-xl shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto"
              >
                <span className="material-symbols-outlined text-[18px] text-amber-700">calendar_month</span>
                <span>National Vaccine Schedule Chart</span>
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-2xl w-fit border border-slate-200">
              {[
                { key: 'ALL', label: `All (${vaccines.length})` },
                { key: 'DUE', label: `Due Today (${vaccines.filter(v => v.status === 'due').length})` },
                { key: 'SCHEDULED', label: `Scheduled (${vaccines.filter(v => v.status === 'scheduled').length})` },
                { key: 'COMPLETED', label: `Completed (${vaccines.filter(v => v.status === 'completed').length})` },
              ].map(f => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setVaccineFilter(f.key)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    vaccineFilter === f.key 
                      ? 'bg-amber-600 text-white shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Vaccine Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredVaccines.map(vac => {
                const isCompleted = vac.status === 'completed';
                const isDue = vac.status === 'due';

                return (
                  <div 
                    key={vac.id} 
                    className={`bg-white p-6 sm:p-7 border-2 rounded-3xl shadow-sm border-l-8 transition-all ${
                      isCompleted ? 'border-slate-200 border-l-emerald-600 bg-emerald-50/10' :
                      isDue ? 'border-amber-300 border-l-rose-500' : 'border-slate-200 border-l-amber-500'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-extrabold text-slate-900">{vac.childName}</h3>
                          <span className="text-xs text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded">{vac.age}</span>
                        </div>
                        <p className="text-xs text-slate-500 font-semibold mt-0.5">{vac.motherName} • {vac.village}</p>
                        <span className="text-[11px] text-amber-900 font-bold block mt-0.5">Mobilizer: {vac.assignedAsha}</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-black border uppercase tracking-wider ${
                        isCompleted ? 'bg-emerald-100 text-emerald-900 border-emerald-300' :
                        isDue ? 'bg-rose-100 text-rose-900 border-rose-300' : 'bg-amber-100 text-amber-900 border-amber-300'
                      }`}>
                        {isCompleted ? 'Completed' : vac.dueDate}
                      </span>
                    </div>

                    <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200 text-xs font-bold text-amber-950 my-3.5">
                      <span className="text-[10px] text-amber-800 uppercase block font-black">Prescribed Vaccination:</span>
                      <span className="text-sm font-black text-slate-900 block mt-0.5">{vac.vaccineName}</span>
                      <span className="text-xs text-slate-500 font-semibold">{vac.doseNumber} • {vac.facility}</span>
                    </div>

                    {isCompleted ? (
                      <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between text-xs text-emerald-950 font-bold">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-emerald-600 text-[20px]">verified</span>
                          <span>Administered &amp; Logged on U-WIN Grid</span>
                        </div>
                        <span className="font-mono text-[11px] text-slate-500">{vac.batchNo || 'BATCH-OK'}</span>
                      </div>
                    ) : (
                      <button 
                        type="button"
                        onClick={() => {
                          setSelectedVaccine(vac);
                          setActiveModal('log-vaccine');
                        }}
                        className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-extrabold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">vaccines</span>
                        <span>Log Vaccination Dose (खुराक दर्ज करें)</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: CITIZEN VISIT REQUESTS DELEGATION */}
        {activeTab === 'requests' && (
          <div className="flex flex-col w-full animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-3 border-b border-slate-200">
              <div>
                <h1 className="font-heading text-3xl font-black text-slate-900 tracking-tight">
                  Citizen Home Visit Requests Delegation
                </h1>
                <p className="text-sm text-slate-600 font-medium">
                  Review incoming visit requests and delegate households to appropriate ASHA field workers.
                </p>
              </div>
            </div>

            {citizenRequests.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border-2 border-slate-200 text-center">
                <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">home_health</span>
                <h3 className="text-lg font-black text-slate-800">No Visit Requests Received</h3>
                <p className="text-xs text-slate-500 mt-1">When citizens request a home visit from their dashboard, they will appear here in real-time.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {citizenRequests.map(req => (
                  <div 
                    key={req._id || req.requestId} 
                    className="bg-white p-5 sm:p-6 rounded-3xl border-2 border-slate-200 hover:border-amber-400 transition-all shadow-sm"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-lg font-black text-slate-900">{req.patientName}</h3>
                          <span className="font-mono text-xs font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            {req.requestId || 'REQ-01'}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${
                            req.status === 'completed' ? 'bg-emerald-100 text-emerald-900' :
                            req.status === 'in_progress' ? 'bg-sky-100 text-sky-900' :
                            req.status === 'scheduled' ? 'bg-amber-100 text-amber-900' : 'bg-rose-100 text-rose-900'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-bold">
                          Reason: <span className="text-slate-900">{req.reason}</span> • Slot: {req.preferredSlot}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">Address: {req.patientAddress} • Phone: {req.patientPhone}</p>
                        {req.notes && <p className="text-xs text-slate-600 italic mt-1">"{req.notes}"</p>}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <a 
                          href={`tel:${req.patientPhone}`}
                          className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-xs font-extrabold flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[16px] text-amber-700">call</span>
                          <span>Call Citizen</span>
                        </a>

                        {req.status === 'pending' && (
                          <button
                            type="button"
                            onClick={() => {
                              setTaskForm({
                                ashaName: 'ASHA Sunita Devi',
                                patientName: req.patientName,
                                patientAddress: req.patientAddress,
                                patientPhone: req.patientPhone,
                                taskType: 'Home Visit & Vitals',
                                priority: req.urgency === 'urgent' ? 'urgent' : 'routine',
                                scheduledDate: 'Today',
                                scheduledTime: req.preferredSlot || '10:00 AM',
                                instructions: `Citizen request: ${req.reason}. ${req.notes || ''}`,
                              });
                              setActiveModal('assign-task');
                              handleUpdateVisitStatus(req._id, 'scheduled', 'Delegated to ASHA Sunita Devi');
                            }}
                            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black shadow-xs cursor-pointer flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[16px]">person_add</span>
                            <span>Assign to ASHA</span>
                          </button>
                        )}

                        {req.status === 'scheduled' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateVisitStatus(req._id, 'completed', 'Visit completed and vitals recorded')}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs cursor-pointer"
                          >
                            Mark Completed
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPatient({
                              _id: req.patient || '6aa974847fbaf7f52bfb3707',
                              name: req.patientName,
                              age: 'Adult',
                              phone: req.patientPhone,
                              village: req.patientAddress,
                              abha: '91-4820-1940-2810'
                            });
                            setActiveModal('vitals');
                          }}
                          className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black cursor-pointer flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[16px] text-amber-700">favorite</span>
                          <span>Record Vitals</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL 1: ASSIGN TASK TO ASHA WORKER */}
      {activeModal === 'assign-task' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl border-2 border-amber-400 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between border-b-4 border-amber-500">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[22px]">add_task</span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-white font-heading">Delegate Field Task to ASHA</h3>
                  <p className="text-xs text-amber-300/80 font-bold">Assign household duty to ground health worker</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveModal(null)} 
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 transition-colors cursor-pointer shadow-sm"
                title="Close"
              >
                <span className="material-symbols-outlined text-[20px] font-bold text-slate-900">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-6 overflow-y-auto space-y-3.5 text-xs">
              {/* Select ASHA Worker */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                  Assign to ASHA Worker <span className="text-rose-500">*</span>
                </label>
                <select
                  value={taskForm.ashaName}
                  onChange={e => setTaskForm({...taskForm, ashaName: e.target.value})}
                  className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-amber-500"
                >
                  {ASHA_WORKFORCE.map(a => (
                    <option key={a.id} value={a.name}>
                      {a.name} ({a.ward} • {a.households} HH)
                    </option>
                  ))}
                </select>
              </div>

              {/* Patient Name & Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">Citizen Name <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={taskForm.patientName}
                    onChange={e => setTaskForm({...taskForm, patientName: e.target.value})}
                    placeholder="e.g. Kamla Devi"
                    className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">Citizen Phone</label>
                  <input
                    type="tel"
                    value={taskForm.patientPhone}
                    onChange={e => setTaskForm({...taskForm, patientPhone: e.target.value})}
                    placeholder="9876543251"
                    className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">Household Address / Village Ward</label>
                <input
                  type="text"
                  value={taskForm.patientAddress}
                  onChange={e => setTaskForm({...taskForm, patientAddress: e.target.value})}
                  placeholder="e.g. Rampur Ward 2, House 14"
                  className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Task Type & Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">Task Nature</label>
                  <select
                    value={taskForm.taskType}
                    onChange={e => setTaskForm({...taskForm, taskType: e.target.value})}
                    className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-amber-500"
                  >
                    <option value="Home Visit & Vitals">Home Visit &amp; Vitals</option>
                    <option value="Antenatal Checkup (ANC)">Antenatal Checkup (ANC)</option>
                    <option value="Infant Immunization Reminders">Infant Immunization</option>
                    <option value="Jan Aushadhi Medicine Refill">Medicine Delivery</option>
                    <option value="Chronic NCD Follow-up">Chronic NCD Follow-up</option>
                    <option value="Fever & Vector Surveillance">Fever &amp; Vector Surveillance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={e => setTaskForm({...taskForm, priority: e.target.value})}
                    className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-amber-500"
                  >
                    <option value="routine">Routine</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent / Stat</option>
                  </select>
                </div>
              </div>

              {/* Instructions for ASHA */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">Supervisor Instructions for ASHA Worker</label>
                <textarea
                  rows="2"
                  value={taskForm.instructions}
                  onChange={e => setTaskForm({...taskForm, instructions: e.target.value})}
                  placeholder="e.g. Check BP with digital cuff, supply IFA, advise hospital delivery..."
                  className="w-full bg-slate-50 px-3.5 py-2 rounded-xl border-2 border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-amber-500"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black shadow-xs"
                >
                  Delegate Task to ASHA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: UPDATE TASK / LOG ASHA REPORT */}
      {activeModal === 'update-task' && selectedTask && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-3xl border-2 border-amber-400 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between border-b-4 border-amber-500">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[20px]">fact_check</span>
                </div>
                <div>
                  <h3 className="text-base font-black text-white font-heading">Log ASHA Field Report</h3>
                  <p className="text-xs text-amber-300/80 font-bold">{selectedTask.taskId} • {selectedTask.patientName}</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveModal(null)} 
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 transition-colors cursor-pointer shadow-sm"
                title="Close"
              >
                <span className="material-symbols-outlined text-[20px] font-bold text-slate-900">close</span>
              </button>
            </div>

            <div className="p-6 space-y-3.5 text-xs">
              <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200">
                <span className="text-[10px] text-amber-800 font-bold uppercase block">Field Worker</span>
                <strong className="text-slate-900 font-black text-sm">{selectedTask.ashaWorker?.name}</strong>
                <p className="text-slate-600 mt-1"><strong>Task:</strong> {selectedTask.taskType}</p>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">Update Task Status</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateTaskStatus(selectedTask._id, 'in_progress')}
                    className="p-3 rounded-xl border-2 border-sky-300 bg-sky-50 text-sky-950 font-black text-center"
                  >
                    Mark In-Progress
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateTaskStatus(selectedTask._id, 'completed', 'ASHA visited household. Citizen confirmed stable condition.')}
                    className="p-3 rounded-xl border-2 border-emerald-400 bg-emerald-100 text-emerald-950 font-black text-center"
                  >
                    Mark Completed
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: RECORD VITALS & TRIAGE */}
      {activeModal === 'vitals' && selectedPatient && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl border-2 border-amber-400 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white border-b-4 border-amber-500">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <span className="material-symbols-outlined text-[24px]">favorite</span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-white font-heading">Record Citizen Vitals &amp; Triage</h3>
                  <p className="text-xs text-amber-300/80 font-bold">{selectedPatient.name} • {selectedPatient.age} • {selectedPatient.village}</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveModal(null)} 
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 transition-colors cursor-pointer shadow-sm"
                title="Close"
              >
                <span className="material-symbols-outlined text-[20px] font-bold text-slate-900">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveVitals} className="p-6 overflow-y-auto flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Blood Pressure (mmHg)</label>
                  <input 
                    type="text" 
                    value={vitalsForm.bp} 
                    onChange={e => setVitalsForm({...vitalsForm, bp: e.target.value})} 
                    className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-extrabold text-sm focus:outline-none focus:border-amber-500" 
                    placeholder="120/80"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Heart Rate (BPM)</label>
                  <input 
                    type="number" 
                    value={vitalsForm.pulse} 
                    onChange={e => setVitalsForm({...vitalsForm, pulse: e.target.value})} 
                    className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-extrabold text-sm focus:outline-none focus:border-amber-500" 
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Oxygen SpO2 (%)</label>
                  <input 
                    type="number" 
                    value={vitalsForm.spo2} 
                    onChange={e => setVitalsForm({...vitalsForm, spo2: e.target.value})} 
                    className="w-full bg-slate-50 px-3 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-extrabold text-sm focus:outline-none focus:border-amber-500" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Temp (°F)</label>
                  <input 
                    type="text" 
                    value={vitalsForm.temp} 
                    onChange={e => setVitalsForm({...vitalsForm, temp: e.target.value})} 
                    className="w-full bg-slate-50 px-3 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-extrabold text-sm focus:outline-none focus:border-amber-500" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Sugar (mg/dL)</label>
                  <input 
                    type="number" 
                    value={vitalsForm.sugar} 
                    onChange={e => setVitalsForm({...vitalsForm, sugar: e.target.value})} 
                    className="w-full bg-slate-50 px-3 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-extrabold text-sm focus:outline-none focus:border-amber-500" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">Clinical Observations &amp; Symptoms</label>
                <textarea 
                  rows="2" 
                  value={vitalsForm.notes} 
                  onChange={e => setVitalsForm({...vitalsForm, notes: e.target.value})} 
                  placeholder="e.g. Regular medication compliance, mild joint pain..." 
                  className="w-full bg-slate-50 px-3.5 py-2 rounded-xl border-2 border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-amber-500"
                ></textarea>
              </div>

              <div className="p-3 bg-rose-50 border-2 border-rose-200 rounded-2xl flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="urgentFlag" 
                  checked={vitalsForm.urgent} 
                  onChange={e => setVitalsForm({...vitalsForm, urgent: e.target.checked})} 
                  className="w-5 h-5 text-rose-600 rounded border-slate-300 focus:ring-rose-500 cursor-pointer" 
                />
                <label htmlFor="urgentFlag" className="text-xs font-extrabold text-rose-900 cursor-pointer">
                  Flag as High-Risk for Medical Officer / Tele-Consultation
                </label>
              </div>

              <button 
                type="submit" 
                disabled={submittingVitals}
                className="w-full bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white py-3.5 rounded-xl font-extrabold text-sm shadow-sm mt-2 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {submittingVitals ? (
                  <>
                    <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
                    <span>Saving to MongoDB Atlas...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">cloud_upload</span>
                    <span>Save Vitals to ABDM Grid</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: CLINICAL DOSSIER */}
      {activeModal === 'dossier' && selectedPatient && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-2xl rounded-3xl border-2 border-amber-400 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between border-b-4 border-amber-500">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[24px]">badge</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-black tracking-wider text-amber-300 block">Ayushman Bharat Digital Mission (ABDM)</span>
                  <h3 className="text-lg font-black text-white">{selectedPatient.name} — Clinical Dossier</h3>
                </div>
              </div>
              <button 
                onClick={() => setActiveModal(null)} 
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 transition-colors cursor-pointer shadow-sm"
                title="Close"
              >
                <span className="material-symbols-outlined text-[20px] font-bold text-slate-900">close</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-300 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">ABHA ID</span>
                  <strong className="font-mono text-amber-950 font-black">{selectedPatient.abha}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Age / Gender</span>
                  <strong className="text-slate-900 font-black">{selectedPatient.age} • {selectedPatient.gender || 'Female'}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Village Ward</span>
                  <strong className="text-slate-900 font-black">{selectedPatient.village}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Assigned ASHA</span>
                  <strong className="text-slate-900 font-black">{selectedPatient.assignedAsha || 'ASHA Sunita Devi'}</strong>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] uppercase font-black text-slate-500 block mb-1">Primary Clinical Diagnosis</span>
                  <p className="text-xs font-black text-slate-900">{selectedPatient.condition}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] uppercase font-black text-slate-500 block mb-1">Active Prescribed Medications</span>
                  <p className="text-xs font-bold text-amber-950">{selectedPatient.meds}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200">
                  <span className="text-[10px] uppercase font-black text-rose-800 block mb-1">Known Drug Allergies</span>
                  <p className="text-xs font-black text-rose-950">{selectedPatient.allergies}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] uppercase font-black text-slate-500 block mb-1">Emergency Household Contact</span>
                  <p className="text-xs font-extrabold text-slate-900">{selectedPatient.emergencyContact}</p>
                </div>
              </div>

              <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase font-black text-amber-900 block">Last Recorded Clinical Vitals</span>
                  <p className="text-sm font-black text-slate-900 mt-0.5">{selectedPatient.lastVitals}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal('vitals');
                  }}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-black text-xs shadow-xs cursor-pointer"
                >
                  Update Vitals Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: REGISTER NEW CITIZEN */}
      {activeModal === 'register-citizen' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl border-2 border-amber-400 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between border-b-4 border-amber-500">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[22px]">person_add</span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-white font-heading">Register Household Citizen</h3>
                  <p className="text-xs text-amber-300/80 font-bold">Issue rural digital health profile with ABHA</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveModal(null)} 
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 transition-colors cursor-pointer shadow-sm"
                title="Close"
              >
                <span className="material-symbols-outlined text-[20px] font-bold text-slate-900">close</span>
              </button>
            </div>

            <form onSubmit={handleRegisterCitizen} className="p-6 overflow-y-auto space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">Full Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={newCitizen.name}
                  onChange={e => setNewCitizen({...newCitizen, name: e.target.value})}
                  placeholder="e.g. Shakuntala Devi"
                  className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">Age (Years) <span className="text-rose-500">*</span></label>
                  <input
                    type="number"
                    value={newCitizen.age}
                    onChange={e => setNewCitizen({...newCitizen, age: e.target.value})}
                    placeholder="e.g. 26"
                    className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">Gender</label>
                  <select
                    value={newCitizen.gender}
                    onChange={e => setNewCitizen({...newCitizen, gender: e.target.value})}
                    className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-amber-500"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">Mobile Phone</label>
                  <input
                    type="tel"
                    value={newCitizen.phone}
                    onChange={e => setNewCitizen({...newCitizen, phone: e.target.value})}
                    placeholder="9876543210"
                    className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">Village / Ward</label>
                  <select
                    value={newCitizen.village}
                    onChange={e => setNewCitizen({...newCitizen, village: e.target.value})}
                    className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-amber-500"
                  >
                    <option value="Sitapur Ward 4">Sitapur Ward 4</option>
                    <option value="Rampur Ward 1">Rampur Ward 1</option>
                    <option value="Rampur Ward 2">Rampur Ward 2</option>
                    <option value="Rampur Ward 3">Rampur Ward 3</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">Assign Responsible ASHA</label>
                <select
                  value={newCitizen.assignedAsha}
                  onChange={e => setNewCitizen({...newCitizen, assignedAsha: e.target.value})}
                  className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-amber-500"
                >
                  {ASHA_WORKFORCE.map(a => (
                    <option key={a.id} value={a.name}>{a.name} ({a.ward})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">Health Condition / Symptoms</label>
                <input
                  type="text"
                  value={newCitizen.condition}
                  onChange={e => setNewCitizen({...newCitizen, condition: e.target.value})}
                  placeholder="e.g. Trimester 2 Pregnancy, Hypertension, Seasonal Flu"
                  className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black shadow-xs"
                >
                  Register &amp; Generate ABHA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: LOG VACCINE DOSE */}
      {activeModal === 'log-vaccine' && selectedVaccine && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-3xl border-2 border-amber-400 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between border-b-4 border-amber-500">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[22px]">vaccines</span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-white font-heading">Log Vaccine Administration</h3>
                  <p className="text-xs text-amber-300/80 font-bold">{selectedVaccine.childName} • {selectedVaccine.vaccineName}</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveModal(null)} 
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 transition-colors cursor-pointer shadow-sm"
                title="Close"
              >
                <span className="material-symbols-outlined text-[20px] font-bold text-slate-900">close</span>
              </button>
            </div>

            <form onSubmit={handleLogVaccineDose} className="p-6 space-y-3.5 text-xs">
              <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200">
                <strong className="text-slate-900 font-black block">{selectedVaccine.childName} ({selectedVaccine.age})</strong>
                <p className="text-slate-600 font-semibold mt-0.5">{selectedVaccine.vaccineName} • {selectedVaccine.doseNumber}</p>
                <p className="text-[11px] text-amber-900 font-bold mt-0.5">Assigned ASHA Mobilizer: {selectedVaccine.assignedAsha}</p>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">Vaccine Batch / Lot Number <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={vaccineLogForm.batchNo}
                  onChange={e => setVaccineLogForm({...vaccineLogForm, batchNo: e.target.value})}
                  className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-amber-500 font-mono"
                  placeholder="e.g. SII-COV-8291"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">Administered At Facility / Booth</label>
                <input
                  type="text"
                  value={vaccineLogForm.facility}
                  onChange={e => setVaccineLogForm({...vaccineLogForm, facility: e.target.value})}
                  className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">Cold Chain &amp; Observation Notes</label>
                <textarea
                  rows="2"
                  value={vaccineLogForm.notes}
                  onChange={e => setVaccineLogForm({...vaccineLogForm, notes: e.target.value})}
                  className="w-full bg-slate-50 px-3.5 py-2 rounded-xl border-2 border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-amber-500"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black shadow-xs"
                >
                  Verify &amp; Log on U-WIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 7: NATIONAL VACCINE SCHEDULE CHART */}
      {activeModal === 'schedule-chart' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-2xl rounded-3xl border-2 border-amber-400 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between border-b-4 border-amber-500">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[24px]">calendar_month</span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-white font-heading">National Immunization Schedule (NIS)</h3>
                  <p className="text-xs text-amber-300/80 font-bold">Universal Immunization Programme • Mission Indradhanush</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveModal(null)} 
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 transition-colors cursor-pointer shadow-sm"
                title="Close"
              >
                <span className="material-symbols-outlined text-[20px] font-bold text-slate-900">close</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-3 text-xs">
              {[
                { age: 'At Birth (जन्म के समय)', vaccines: 'BCG, OPV-0 Dose, Hepatitis B Birth Dose' },
                { age: '6 Weeks (6 सप्ताह)', vaccines: 'OPV-1, Pentavalent-1, Rotavirus-1, fIPV-1, PCV-1' },
                { age: '10 Weeks (10 सप्ताह)', vaccines: 'OPV-2, Pentavalent-2, Rotavirus-2' },
                { age: '14 Weeks (14 सप्ताह)', vaccines: 'OPV-3, Pentavalent-3, Rotavirus-3, fIPV-2, PCV-2' },
                { age: '9-12 Months (9-12 माह)', vaccines: 'MR-1 (Measles-Rubella), JE-1, PCV Booster, Vitamin A (1st Dose)' },
                { age: '16-24 Months (16-24 माह)', vaccines: 'MR-2, DPT Booster-1, OPV Booster, JE-2, Vitamin A (2nd Dose)' },
                { age: '5-6 Years (5-6 वर्ष)', vaccines: 'DPT Booster-2' },
                { age: '10 & 16 Years (10 और 16 वर्ष)', vaccines: 'Tetanus & adult Diphtheria (Td)' },
                { age: 'Pregnant Women (गर्भवती महिलाएं)', vaccines: 'Td-1 (Early pregnancy), Td-2 (4 weeks later) or Td Booster' },
              ].map((item, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-extrabold text-slate-900 text-xs sm:w-1/3">{item.age}</span>
                  <span className="text-amber-950 font-black text-xs sm:w-2/3">{item.vaccines}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 8: ONBOARD NEW ASHA WORKER */}
      {activeModal === 'add-asha' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-3xl border-2 border-amber-400 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between border-b-4 border-amber-500">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[22px]">badge</span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-white font-heading">Onboard New ASHA Field Worker</h3>
                  <p className="text-xs text-amber-300/80 font-bold">Register grassroot worker in sector roster</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveModal(null)} 
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 transition-colors cursor-pointer shadow-sm"
                title="Close"
              >
                <span className="material-symbols-outlined text-[20px] font-bold text-slate-900">close</span>
              </button>
            </div>

            <form onSubmit={handleRegisterAsha} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">ASHA Worker Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={newAshaForm.name}
                  onChange={e => setNewAshaForm({...newAshaForm, name: e.target.value})}
                  placeholder="e.g. ASHA Rekha Sharma"
                  className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">Mobile Phone Number <span className="text-rose-500">*</span></label>
                <input
                  type="tel"
                  value={newAshaForm.phone}
                  onChange={e => setNewAshaForm({...newAshaForm, phone: e.target.value})}
                  placeholder="9876543235"
                  className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">Assigned Sector / Ward</label>
                  <select
                    value={newAshaForm.ward}
                    onChange={e => setNewAshaForm({...newAshaForm, ward: e.target.value})}
                    className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-amber-500"
                  >
                    <option value="Sitapur Ward 4">Sitapur Ward 4</option>
                    <option value="Rampur Ward 1">Rampur Ward 1</option>
                    <option value="Rampur Ward 2">Rampur Ward 2</option>
                    <option value="Rampur Ward 3">Rampur Ward 3</option>
                    <option value="Sitapur Ward 2">Sitapur Ward 2</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">Households Covered</label>
                  <input
                    type="number"
                    value={newAshaForm.households}
                    onChange={e => setNewAshaForm({...newAshaForm, households: e.target.value})}
                    className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">Initial Duty Status</label>
                <select
                  value={newAshaForm.status}
                  onChange={e => setNewAshaForm({...newAshaForm, status: e.target.value})}
                  className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-amber-500"
                >
                  <option value="Active on Duty">Active on Duty</option>
                  <option value="Field Survey">Field Survey</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black shadow-xs"
                >
                  Onboard to Roster
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
