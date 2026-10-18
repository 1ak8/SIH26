import { useState } from 'react';
import { Link } from 'react-router-dom';
import PatientNavbar from '../../components/PatientNavbar';
import { useAuth } from '../../context/AuthContext';

const AMBULANCE_FLEET = [
  {
    id: 'AMB-108-01',
    plate: 'UP-34-G-1081',
    type: 'ALS',
    typeName: 'Advanced Life Support (ALS ICU)',
    vehicle: 'Force Traveller ICU Ambulance',
    equipment: ['Ventilator', 'Defibrillator', 'Multipara Cardiac Monitor', 'High-Flow Oxygen', 'Emergency Drugs Kit'],
    baseStation: 'CHC Sitapur Central (Bay 1)',
    distanceKm: 2.1,
    etaMinutes: 6,
    pilotName: 'Rameshwar Yadav',
    pilotPhone: '+91 98765 10801',
    emtName: 'EMT Sunita Kumari',
    emtQual: 'ALS Certified Paramedic',
    status: 'Available',
    statusNote: 'Parked at Bay 1 • Ready to Roll',
    fuelLevel: '95%',
    oxygenStatus: 'Full (1000L IP)',
  },
  {
    id: 'AMB-108-02',
    plate: 'UP-34-G-1082',
    type: 'BLS',
    typeName: 'Basic Life Support (BLS Rapid)',
    vehicle: 'Tata Winger First Responder',
    equipment: ['Oxygen Cylinder 500L', 'Spine Board & Collar', 'First Aid Trauma Bag', 'Glucometer & BP Unit'],
    baseStation: 'Sitapur Ward 4 Panchayat Post',
    distanceKm: 3.4,
    etaMinutes: 9,
    pilotName: 'Dinesh Kumar',
    pilotPhone: '+91 98765 10802',
    emtName: 'EMT Manoj Singh',
    emtQual: 'First Responder Trained',
    status: 'Available',
    statusNote: 'Active on Sector Route',
    fuelLevel: '88%',
    oxygenStatus: 'Full (500L IP)',
  },
  {
    id: 'AMB-108-03',
    plate: 'UP-34-G-1083',
    type: 'ALS',
    typeName: 'Maternal & Neonatal ICU (ALS)',
    vehicle: 'Mahindra Bolero Specialized ICU',
    equipment: ['Baby Incubator', 'Neonatal Resuscitation Unit', 'Maternal Delivery Kit', 'Oxygen & Suction'],
    baseStation: 'District Women Hospital Sitapur',
    distanceKm: 4.8,
    etaMinutes: 13,
    pilotName: 'Rajesh Pal',
    pilotPhone: '+91 98765 10803',
    emtName: 'EMT Aarti Devi',
    emtQual: 'Neonatal & OBG Specialist',
    status: 'Available',
    statusNote: 'Stationed at Maternity Wing',
    fuelLevel: '90%',
    oxygenStatus: 'Full (1000L IP)',
  },
  {
    id: 'AMB-108-04',
    plate: 'UP-34-G-1084',
    type: 'BLS',
    typeName: 'Rural Sub-Centre Rapid BLS',
    vehicle: 'Tata Winger 4x4 Rural Unit',
    equipment: ['Oxygen Cylinder', 'Fracture Splints', 'Suction Machine', 'Emergency Stretcher'],
    baseStation: 'Rampur Sub-Centre Chowk',
    distanceKm: 6.2,
    etaMinutes: 15,
    pilotName: 'Suraj Prakash',
    pilotPhone: '+91 98765 10804',
    emtName: 'EMT Anand Verma',
    emtQual: 'Trauma Care Trained',
    status: 'Available',
    statusNote: 'Stationed near Gram Panchayat',
    fuelLevel: '82%',
    oxygenStatus: 'Full (500L IP)',
  },
  {
    id: 'AMB-108-05',
    plate: 'UP-34-G-1085',
    type: 'ALS',
    typeName: 'Highway Trauma ALS Rescue',
    vehicle: 'Ashok Leyland Heavy Trauma Rescue',
    equipment: ['Hydraulic Extrication Kit', 'Cardiac Pacing Defib', 'Transport Ventilator', 'Cold Storage Blood Unit'],
    baseStation: 'NH-24 Toll Plaza Highway Post',
    distanceKm: 7.5,
    etaMinutes: 18,
    pilotName: 'Kuldeep Rawat',
    pilotPhone: '+91 98765 10805',
    emtName: 'EMT Dr. K.K. Srivastava',
    emtQual: 'Trauma & Disaster EMT',
    status: 'On Standby',
    statusNote: 'Highway Patrol Standby',
    fuelLevel: '98%',
    oxygenStatus: 'Full (1500L IP)',
  },
  {
    id: 'AMB-108-06',
    plate: 'UP-34-G-1086',
    type: 'BLS',
    typeName: 'Rapid First Responder Ambulance',
    vehicle: 'Maruti Suzuki Eeco Medical',
    equipment: ['Oxygen Kit', 'Automated External Defib (AED)', 'Cervical Immobilizer', 'First Aid Bag'],
    baseStation: 'Maholi PHC Emergency Bay',
    distanceKm: 9.1,
    etaMinutes: 22,
    pilotName: 'Vikas Mishra',
    pilotPhone: '+91 98765 10806',
    emtName: 'EMT Sanjay Dubey',
    emtQual: 'Certified Basic Life Saver',
    status: 'Available',
    statusNote: 'PHC Standby',
    fuelLevel: '76%',
    oxygenStatus: 'Full (500L IP)',
  },
  {
    id: 'AMB-108-07',
    plate: 'UP-34-G-1087',
    type: 'BLS',
    typeName: 'Community Transit Ambulance',
    vehicle: 'Tata Winger Medical',
    equipment: ['Oxygen Unit', 'Wheelchair Lift', 'First Aid'],
    baseStation: 'Khairabad Health Post',
    distanceKm: 11.4,
    etaMinutes: 27,
    pilotName: 'Harishankar Shukla',
    pilotPhone: '+91 98765 10807',
    emtName: 'EMT Pooja Tiwari',
    emtQual: 'BLS Certified',
    status: 'Returning to Base',
    statusNote: 'Returning from District Hospital',
    fuelLevel: '64%',
    oxygenStatus: '80%',
  },
];

const TRAUMA_HOSPITALS = [
  { name: 'CHC Sitapur Central Trauma Ward', distance: '2.1 km', beds: 6, icu: 2, bloodBank: 'Available', phone: '05862-242108' },
  { name: 'District Hospital Sitapur Emergency Wing', distance: '4.9 km', beds: 14, icu: 6, bloodBank: '24x7 Ready', phone: '05862-243108' },
  { name: 'State Medical College Trauma Care Centre', distance: '18.5 km', beds: 32, icu: 12, bloodBank: 'Level 1 Hub', phone: '05862-248108' },
];

export default function AmbulanceAvailability() {
  const { user } = useAuth();
  const [filterType, setFilterType] = useState('ALL');
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [emergencyType, setEmergencyType] = useState('cardiac');
  const [pickupAddress, setPickupAddress] = useState('Ward No. 4, Near Primary School, Rampur-Sitapur, UP 261001');
  const [patientContact, setPatientContact] = useState(user?.phone || '9876543210');
  const [dispatchConfirmed, setDispatchConfirmed] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredFleet = AMBULANCE_FLEET.filter(amb => {
    if (filterType === 'ALL') return true;
    if (filterType === 'ALS') return amb.type === 'ALS';
    if (filterType === 'BLS') return amb.type === 'BLS';
    if (filterType === 'NEAREST') return amb.distanceKm <= 5.0;
    return true;
  });

  const handleOpenDispatch = (amb) => {
    setSelectedAmbulance(amb);
    setDispatchModalOpen(true);
    setDispatchConfirmed(null);
  };

  const handleConfirmDispatch = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const token = `DISPATCH-108-${Math.floor(1000 + Math.random() * 9000)}`;
      setDispatchConfirmed({
        token,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ambulance: selectedAmbulance,
        emergencyType,
        pickupAddress,
        eta: selectedAmbulance.etaMinutes,
      });
    }, 1200);
  };

  return (
    <div className="bg-slate-50 text-slate-900 font-sans min-h-screen selection:bg-rose-100 selection:text-rose-900">
      <PatientNavbar />

      <main className="w-full px-4 sm:px-6 lg:px-12 xl:px-16 pt-24 sm:pt-28 pb-16 max-w-7xl mx-auto">
        {/* Breadcrumb navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mb-4">
          <Link to="/patient" className="hover:text-teal-700 transition-colors">Dashboard</Link>
          <span>/</span>
          <span className="text-slate-800 font-bold">108 Emergency Ambulance Grid</span>
        </div>

        {/* HERO BANNER: 108 Emergency Grid */}
        <div className="bg-gradient-to-r from-slate-950 via-rose-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-rose-500/30 shadow-xl mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-rose-300 text-xs font-black mb-3 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                <span>National Emergency Medical Service (EMS 108) • GPS Grid</span>
              </div>
              <h1 className="font-heading text-3xl sm:text-4xl lg:text-[40px] font-black text-white tracking-tight leading-tight">
                Live Ambulance Telemetry &amp; Dispatch
              </h1>
              <p className="text-sm sm:text-base text-slate-300 font-medium mt-2 leading-relaxed">
                Real-time tracking for Advanced Life Support (ALS ICU) and Basic Life Support (BLS) units in <span className="text-rose-300 font-bold underline decoration-rose-400 decoration-2">Sitapur Rural Sector</span>. Guaranteed Golden-Hour protocol.
              </p>
            </div>

            {/* Emergency Direct Call Box */}
            <div className="bg-white/10 backdrop-blur-md border border-rose-400/40 p-5 sm:p-6 rounded-3xl shadow-lg flex flex-col sm:flex-row items-center gap-5 self-start lg:self-auto shrink-0">
              <div className="w-14 h-14 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-600/30">
                <span className="material-symbols-outlined text-[30px] animate-pulse">call</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-black tracking-widest text-rose-300 block">Immediate SOS Dispatch</span>
                <a 
                  href="tel:108" 
                  className="text-2xl sm:text-3xl font-black text-white hover:text-rose-300 tracking-tight flex items-center gap-2 leading-tight mt-0.5"
                >
                  <span>Dial 108 Toll-Free</span>
                  <span className="material-symbols-outlined text-[22px]">north_east</span>
                </a>
                <span className="text-[11px] text-slate-300 font-medium block mt-1">24x7 Government GPS Ambulance Fleet</span>
              </div>
            </div>
          </div>
        </div>

        {/* METRICS STRIP: Live Fleet Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[26px]">airport_shuttle</span>
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 block leading-tight font-mono">6 Units</span>
              <span className="text-xs text-slate-500 font-bold">Ready to Roll</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[26px]">timer</span>
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 block leading-tight font-mono">6 - 9 Mins</span>
              <span className="text-xs text-slate-500 font-bold">Avg Sector Response</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[26px]">medical_services</span>
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 block leading-tight font-mono">3 ALS ICU</span>
              <span className="text-xs text-slate-500 font-bold">Ventilator Equipped</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[26px]">near_me</span>
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 block leading-tight font-mono">2.1 KM</span>
              <span className="text-xs text-slate-500 font-bold">Nearest Unit (6m ETA)</span>
            </div>
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] uppercase font-black text-slate-400 tracking-wider mr-2">Filter Fleet:</span>
            {[
              { key: 'ALL', label: 'All Units (7)' },
              { key: 'ALS', label: 'ALS ICU (3)' },
              { key: 'BLS', label: 'BLS Rapid (4)' },
              { key: 'NEAREST', label: 'Nearest < 5 KM (3)' },
            ].map(f => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilterType(f.key)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  filterType === f.key
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-200 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>GPS Tracking Active • Auto-Refresh 15s</span>
          </div>
        </div>

        {/* AMBULANCE GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {filteredFleet.map(amb => (
            <div
              key={amb.id}
              className={`bg-white rounded-3xl border p-6 flex flex-col justify-between shadow-2xs hover:shadow-xl hover:-translate-y-1 transition-all duration-200 ${
                amb.type === 'ALS' ? 'border-rose-200 hover:border-rose-400' : 'border-slate-200 hover:border-teal-400'
              }`}
            >
              <div>
                {/* Header Badge Row */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-2xs ${
                      amb.type === 'ALS' ? 'bg-rose-600' : 'bg-teal-700'
                    }`}>
                      <span className="material-symbols-outlined text-[26px]">airport_shuttle</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-black text-slate-900">{amb.plate}</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                          amb.type === 'ALS' 
                            ? 'bg-rose-50 text-rose-900 border border-rose-200' 
                            : 'bg-teal-50 text-teal-900 border border-teal-200'
                        }`}>
                          {amb.type}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 font-semibold">{amb.vehicle}</span>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-black px-2.5 py-1 rounded-full shrink-0 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    {amb.status}
                  </span>
                </div>

                {/* Distance & ETA Box */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 mb-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Distance to You</span>
                    <span className="text-lg font-black text-slate-900 font-mono">{amb.distanceKm} KM</span>
                  </div>
                  <div className="h-8 w-[1px] bg-slate-200"></div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Estimated ETA</span>
                    <span className="text-lg font-black text-rose-600 flex items-center justify-end gap-1 font-mono">
                      <span className="material-symbols-outlined text-[17px]">near_me</span>
                      {amb.etaMinutes} Mins
                    </span>
                  </div>
                </div>

                {/* Base Post & Crew */}
                <div className="space-y-2 mb-4 text-xs">
                  <div className="flex items-center gap-2 text-slate-700 font-medium">
                    <span className="material-symbols-outlined text-slate-400 text-[16px]">location_on</span>
                    <span className="font-semibold text-slate-900">{amb.baseStation}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 font-medium">
                    <span className="material-symbols-outlined text-slate-400 text-[16px]">person</span>
                    <span>Pilot: <strong>{amb.pilotName}</strong> • {amb.pilotPhone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 font-medium">
                    <span className="material-symbols-outlined text-slate-400 text-[16px]">health_and_safety</span>
                    <span>{amb.emtName} ({amb.emtQual})</span>
                  </div>
                </div>

                {/* Key Equipment Chips */}
                <div className="mb-5">
                  <span className="text-[10px] uppercase font-black text-slate-400 block mb-1.5">Onboard Medical Kit</span>
                  <div className="flex flex-wrap gap-1.5">
                    {amb.equipment.map((eq, i) => (
                      <span key={i} className="text-[10px] font-bold bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md">
                        {eq}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handleOpenDispatch(amb)}
                  className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <span className="material-symbols-outlined text-[17px]">emergency</span>
                  <span>Request Dispatch</span>
                </button>

                <a
                  href={`tel:${amb.pilotPhone.replace(/\s/g, '')}`}
                  className="h-10 w-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 flex items-center justify-center transition-all shrink-0 cursor-pointer"
                  title={`Call Pilot: ${amb.pilotName}`}
                >
                  <span className="material-symbols-outlined text-[19px]">call</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* NEAREST EMERGENCY TRAUMA CENTRES */}
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">local_hospital</span>
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight font-heading">Nearest Emergency &amp; Trauma Casualty Wards</h2>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">Government designated destination facilities for 108 transit</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-900 border border-rose-200 text-xs font-black px-3 py-1 rounded-full self-start sm:self-auto">
              Live Bed Telemetry
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TRAUMA_HOSPITALS.map((hosp, i) => (
              <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <span className="text-base font-black text-slate-900 block mb-1">{hosp.name}</span>
                  <span className="text-xs text-slate-500 font-bold block mb-3">Transit Distance: {hosp.distance}</span>
                  <div className="space-y-1.5 text-xs text-slate-700 font-medium mb-4">
                    <div className="flex items-center justify-between">
                      <span>Casualty Beds Available:</span>
                      <strong className="text-emerald-700 font-black text-sm">{hosp.beds} Beds</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>ICU Resuscitation Beds:</span>
                      <strong className="text-rose-700 font-black text-sm">{hosp.icu} Beds</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Blood Bank Status:</span>
                      <strong className="text-slate-900 font-bold">{hosp.bloodBank}</strong>
                    </div>
                  </div>
                </div>
                <a
                  href={`tel:${hosp.phone}`}
                  className="w-full py-2.5 px-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-900 font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[16px] text-rose-600">call</span>
                  <span>Contact Casualty: {hosp.phone}</span>
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* 108 EMERGENCY DISPATCH MODAL */}
        {dispatchModalOpen && selectedAmbulance && (
          <div className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 animate-fadeIn max-h-[90vh] overflow-y-auto">
              {!dispatchConfirmed ? (
                <div>
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center font-bold">
                        <span className="material-symbols-outlined text-[24px]">emergency</span>
                      </div>
                      <div>
                        <h3 className="font-heading text-xl font-black text-slate-900">Request 108 Dispatch</h3>
                        <span className="text-xs text-rose-700 font-bold">Ambulance {selectedAmbulance.plate} ({selectedAmbulance.type})</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDispatchModalOpen(false)}
                      className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>

                  <form onSubmit={handleConfirmDispatch} className="space-y-4">
                    {/* Emergency Nature Selector */}
                    <div>
                      <label className="block text-xs uppercase font-black text-slate-700 mb-2">Nature of Medical Emergency</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { key: 'cardiac', label: 'Chest Pain / Cardiac', icon: 'favorite' },
                          { key: 'trauma', label: 'Accident / Trauma', icon: 'car_crash' },
                          { key: 'maternal', label: 'Maternal / Delivery', icon: 'child_care' },
                          { key: 'fever_resp', label: 'High Fever / Dyspnea', icon: 'air' },
                        ].map(opt => (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() => setEmergencyType(opt.key)}
                            className={`p-3 rounded-xl border text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                              emergencyType === opt.key
                                ? 'bg-rose-50 border-rose-500 text-rose-900 shadow-2xs'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'
                            }`}
                          >
                            <span className="material-symbols-outlined text-rose-600 text-[18px]">{opt.icon}</span>
                            <span>{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Patient Contact */}
                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-1">Emergency Contact Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={patientContact}
                        onChange={e => setPatientContact(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 font-mono"
                        placeholder="10 digit mobile number"
                      />
                    </div>

                    {/* Pickup Address */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-black text-slate-700">Pickup Location (GPS Auto-Selected)</label>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Accuracy ±5m</span>
                      </div>
                      <textarea
                        rows={2}
                        required
                        value={pickupAddress}
                        onChange={e => setPickupAddress(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 resize-none"
                      />
                    </div>

                    {/* Dispatch Notice */}
                    <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200 text-xs text-rose-900 font-medium">
                      <strong>Immediate Protocol:</strong> Unit will roll from <strong>{selectedAmbulance.baseStation}</strong> with an estimated ETA of <strong>{selectedAmbulance.etaMinutes} minutes</strong>. Keep your phone line free.
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setDispatchModalOpen(false)}
                        className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-2 py-3 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md shadow-rose-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-75"
                      >
                        {isSubmitting ? (
                          <>
                            <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                            <span>Dispatching Unit...</span>
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-[18px]">send</span>
                            <span>Confirm &amp; Dispatch 108</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                /* DISPATCH CONFIRMED VIEW */
                <div className="text-center py-2">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4 border border-emerald-300 shadow-sm">
                    <span className="material-symbols-outlined text-[36px] animate-bounce">check</span>
                  </div>
                  <span className="text-[10px] uppercase font-black tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-300 inline-block mb-2">
                    Ambulance Dispatched
                  </span>
                  <h3 className="font-heading text-2xl font-black text-slate-900 mb-1">
                    Help is On The Way!
                  </h3>
                  <p className="text-xs text-slate-600 font-medium mb-5">
                    Your request has been routed to 108 Central Command &amp; Unit Pilot
                  </p>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2 mb-6 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="text-slate-500 font-bold">Dispatch Tracking ID:</span>
                      <span className="font-mono text-sm font-black text-slate-900">{dispatchConfirmed.token}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="text-slate-500 font-bold">Assigned Vehicle:</span>
                      <strong className="text-slate-900 font-black">{dispatchConfirmed.ambulance.plate} ({dispatchConfirmed.ambulance.type})</strong>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="text-slate-500 font-bold">Estimated Arrival:</span>
                      <strong className="text-rose-700 font-black text-sm">{dispatchConfirmed.eta} Minutes (Approx)</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-bold">Pilot Contact:</span>
                      <a href={`tel:${dispatchConfirmed.ambulance.pilotPhone.replace(/\s/g, '')}`} className="text-rose-700 font-black underline">
                        {dispatchConfirmed.ambulance.pilotPhone}
                      </a>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <a
                      href={`tel:${dispatchConfirmed.ambulance.pilotPhone.replace(/\s/g, '')}`}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">call</span>
                      <span>Direct Call Ambulance Driver</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setDispatchModalOpen(false)}
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Close &amp; Monitor Live Map
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
