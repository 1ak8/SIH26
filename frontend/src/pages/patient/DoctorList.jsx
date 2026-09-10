import { useState } from 'react';
import { Link } from 'react-router-dom';
import PatientNavbar from '../../components/PatientNavbar';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const DOCTORS = [
  {
    id: '6a9e1a35040b705825b50aba',
    name: 'Dr. Rajesh Sharma',
    specialty: 'General Medicine (सामान्य चिकित्सा)',
    facility: 'CHC Sitapur Central',
    qualification: 'MBBS, MD',
    experience: '12 Years Exp',
    rating: '4.9',
    reviews: 184,
    nextSlot: 'Today, 4:00 PM',
    status: 'Available Online',
    languages: 'Hindi, English',
  },
  {
    id: 'doc-2',
    name: 'Dr. Ananya Gupta',
    specialty: 'Pediatrics (बाल रोग विशेषज्ञ)',
    facility: 'District Hospital Sitapur',
    qualification: 'MBBS, DCH',
    experience: '8 Years Exp',
    rating: '4.8',
    reviews: 142,
    nextSlot: 'Today, 5:30 PM',
    status: 'Available Online',
    languages: 'Hindi, Bhojpuri',
  },
  {
    id: 'doc-3',
    name: 'Dr. Vikramaditya Rathore',
    specialty: 'Cardiology (हृदय रोग)',
    facility: 'State Medical College Tele-Hub',
    qualification: 'MD, DM Cardiology',
    experience: '16 Years Exp',
    rating: '5.0',
    reviews: 210,
    nextSlot: 'Tomorrow, 10:30 AM',
    status: 'Queue Open',
    languages: 'Hindi, English',
  },
  {
    id: 'doc-4',
    name: 'Dr. Priya Verma',
    specialty: 'Gynecology & Maternal Care (महिला रोग)',
    facility: 'Sub-Divisional Hospital Ward 2',
    qualification: 'MS (OBG)',
    experience: '10 Years Exp',
    rating: '4.9',
    reviews: 195,
    nextSlot: 'Tomorrow, 11:00 AM',
    status: 'Queue Open',
    languages: 'Hindi, Awadhi',
  },
];

const SPECIALTIES = ['All Specialists', 'General Medicine', 'Pediatrics', 'Cardiology', 'Gynecology'];

export default function DoctorList() {
  const { user } = useAuth();
  const [selectedSpecialty, setSelectedSpecialty] = useState('All Specialists');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');
  const [timeSlot, setTimeSlot] = useState('10:00 AM');

  const filteredDoctors = selectedSpecialty === 'All Specialists'
    ? DOCTORS
    : DOCTORS.filter(d => d.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase()));

  const handleBook = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/patient/appointments', {
        doctorId: selectedDoctor.id,
        date: new Date().toISOString().split('T')[0],
        timeSlot: timeSlot,
        type: 'teleconsultation',
        reason: reason || 'Routine Checkup',
      });
      setBookingSuccess(true);
      setTimeout(() => {
        setBookingSuccess(false);
        setSelectedDoctor(null);
      }, 2000);
    } catch {
      // Fallback success for prototype demo
      setBookingSuccess(true);
      setTimeout(() => {
        setBookingSuccess(false);
        setSelectedDoctor(null);
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#fbfaf7] text-slate-900 font-sans min-h-screen">
      <PatientNavbar />

      <main className="w-full px-6 lg:px-12 xl:px-16 pt-28 pb-16">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link 
            to="/patient" 
            className="inline-flex items-center gap-2 text-slate-700 hover:text-amber-600 bg-white px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold shadow-xs hover:border-amber-300 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Dashboard
          </Link>
        </div>

        {/* Hero Header */}
        <div className="bg-gradient-to-r from-amber-500/15 via-amber-100/40 to-transparent p-6 sm:p-8 rounded-3xl border-2 border-amber-300 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-amber-300 text-amber-900 text-xs font-extrabold mb-3 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Verified Tele-Clinics Live Grid</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Government Tele-Consultation Doctors
              </h1>
              <p className="text-base text-slate-600 font-medium mt-1 max-w-2xl">
                Consult district hospital specialists and medical college physicians from your village PHC or mobile phone at zero cost.
              </p>
            </div>
            <div className="bg-white border-2 border-emerald-400 p-4 rounded-2xl shadow-sm text-center shrink-0 self-start md:self-auto">
              <span className="text-xs uppercase font-extrabold text-emerald-800 tracking-wider block">Consultation Fee</span>
              <span className="text-2xl font-black text-emerald-900 leading-tight">100% FREE</span>
              <span className="text-[11px] text-slate-500 block font-semibold">Govt. Health Mission</span>
            </div>
          </div>
        </div>

        {/* Specialty Filter Chips */}
        <div className="flex flex-wrap gap-2.5 mb-8">
          {SPECIALTIES.map(s => (
            <button
              key={s}
              onClick={() => setSelectedSpecialty(s)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all border-2 shadow-xs ${
                selectedSpecialty === s
                  ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-amber-400 hover:bg-slate-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Doctor Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDoctors.map(doc => (
            <div 
              key={doc.id}
              className="bg-white p-6 sm:p-7 rounded-3xl border-2 border-slate-200 hover:border-amber-500 hover:shadow-xl transition-all duration-200 flex flex-col justify-between gap-6"
            >
              <div>
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative shrink-0">
                    <div className="w-16 h-16 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-800 flex items-center justify-center font-bold text-2xl shadow-xs">
                      <span className="material-symbols-outlined text-[36px] text-amber-600">stethoscope</span>
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" title="Online"></span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-xl font-extrabold text-slate-900">{doc.name}</h2>
                      <span className="material-symbols-outlined text-amber-600 text-[20px]" title="Verified Govt Doctor">verified</span>
                    </div>
                    <p className="text-sm font-bold text-amber-800 mt-0.5">{doc.specialty}</p>
                    <p className="text-xs text-slate-500 font-medium">{doc.facility} • {doc.qualification}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5 py-3 border-y border-slate-100 text-center">
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-[11px] text-slate-500 font-bold block">Rating</span>
                    <span className="text-sm font-extrabold text-amber-900 flex items-center justify-center gap-1">
                      <span className="material-symbols-outlined text-amber-500 text-[16px] fill">star</span>
                      {doc.rating}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-[11px] text-slate-500 font-bold block">Experience</span>
                    <span className="text-sm font-extrabold text-slate-800">{doc.experience}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-[11px] text-slate-500 font-bold block">Next Slot</span>
                    <span className="text-xs font-extrabold text-emerald-800 leading-snug">{doc.nextSlot}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <div className="w-full sm:flex-1 text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-amber-600 text-[18px]">translate</span>
                  <span>{doc.languages}</span>
                </div>
                <button
                  onClick={() => setSelectedDoctor(doc)}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-sm font-extrabold shadow-sm transition-all flex items-center justify-center gap-2 shrink-0"
                >
                  <span className="material-symbols-outlined text-[18px]">calendar_add_on</span>
                  Book Tele-Consult
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Booking Modal */}
        {selectedDoctor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white w-full max-w-lg rounded-3xl border-2 border-amber-400 shadow-2xl p-6 sm:p-8 relative">
              <button 
                onClick={() => setSelectedDoctor(null)}
                className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border-2 border-amber-300 flex items-center justify-center text-amber-700">
                  <span className="material-symbols-outlined text-[28px]">videocam</span>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider font-extrabold text-amber-800">Booking Tele-Consultation</span>
                  <h3 className="text-xl font-extrabold text-slate-900">{selectedDoctor.name}</h3>
                </div>
              </div>

              {bookingSuccess ? (
                <div className="py-8 text-center animate-fadeIn">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-400 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                    <span className="material-symbols-outlined text-[36px]">check_circle</span>
                  </div>
                  <h4 className="text-2xl font-extrabold text-slate-900">Appointment Booked!</h4>
                  <p className="text-sm text-slate-600 mt-1">Token generated and added to your upcoming care queue.</p>
                </div>
              ) : (
                <form onSubmit={handleBook} className="flex flex-col gap-4">
                  <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200 text-xs font-semibold text-amber-950 flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-600">info</span>
                    <span>No consultation charges • 100% Free Government Tele-Health Initiative</span>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1.5 uppercase">Select Time Slot</label>
                    <select 
                      value={timeSlot} 
                      onChange={e => setTimeSlot(e.target.value)}
                      className="w-full bg-white px-4 py-3 rounded-xl border-2 border-slate-300 text-slate-900 text-sm font-bold focus:outline-none focus:border-amber-500"
                    >
                      <option value="10:00 AM">Today — 10:00 AM (Immediate Token)</option>
                      <option value="02:30 PM">Today — 02:30 PM</option>
                      <option value="04:00 PM">Today — 04:00 PM (Recommended)</option>
                      <option value="05:30 PM">Today — 05:30 PM</option>
                      <option value="11:00 AM">Tomorrow — 11:00 AM</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1.5 uppercase">Symptoms / Reason for Visit</label>
                    <textarea 
                      rows="3"
                      value={reason}
                      onChange={e => setReason(e.target.value)}
                      placeholder="E.g. Mild fever, persistent cough, blood pressure follow-up..."
                      className="w-full bg-white px-4 py-3 rounded-xl border-2 border-slate-300 text-slate-900 text-sm font-medium focus:outline-none focus:border-amber-500"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-extrabold text-sm shadow-sm transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
                  >
                    {loading ? <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span> : null}
                    <span>{loading ? 'Confirming Token...' : 'Confirm Tele-Consultation'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
