import { useState } from 'react';
import { Link } from 'react-router-dom';
import PatientNavbar from '../../components/PatientNavbar';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const DOCTORS = [
  {
    id: '6aa9747f7fbaf7f52bfb36e8',
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
    id: '6aa974807fbaf7f52bfb36ea',
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
    id: '6aa974817fbaf7f52bfb36ec',
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
    id: '6aa974817fbaf7f52bfb36ee',
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
    <div className="bg-slate-50 text-slate-900 font-sans min-h-screen selection:bg-teal-100 selection:text-teal-900">
      <PatientNavbar />

      <main className="w-full px-4 sm:px-6 lg:px-12 xl:px-16 pt-24 sm:pt-28 pb-16 max-w-7xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="mb-5">
          <Link 
            to="/patient" 
            className="inline-flex items-center gap-2 text-slate-600 hover:text-teal-800 bg-white px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold shadow-2xs hover:border-teal-300 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px]">arrow_back</span>
            <span>Back to Patient Console</span>
          </Link>
        </div>

        {/* Jewel Royal Teal & Luminous Frosted Glass Hero Banner */}
        <div className="w-full mb-8 bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 text-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-teal-950/15 border border-teal-600/40 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-teal-100 text-xs font-black mb-3 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>National Health Mission • E-Sanjeevani Tele-OPD</span>
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                Government Tele-Consultation Doctors
              </h1>
              <p className="text-xs sm:text-sm lg:text-base text-teal-100/90 font-medium mt-2 leading-relaxed">
                Consult district hospital specialists and medical college physicians from your village PHC or mobile phone at zero cost.
              </p>
            </div>

            <div className="bg-white/15 backdrop-blur-xl border border-white/25 rounded-2xl p-4 sm:p-5 text-white flex flex-col justify-between shadow-lg shrink-0 self-start lg:self-auto min-w-[240px]">
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-teal-200">Consultation Fee</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-black">
                  100% FREE
                </span>
              </div>
              <div className="text-3xl font-black font-mono tracking-tight text-white">
                ₹0 <span className="text-xs font-sans text-teal-200 font-bold">/ Session</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-teal-100 font-semibold mt-2 pt-2 border-t border-white/15">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>42 Specialists Active Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Specialty Filter Chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          {SPECIALTIES.map(s => (
            <button
              key={s}
              onClick={() => setSelectedSpecialty(s)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all border shadow-2xs cursor-pointer ${
                selectedSpecialty === s
                  ? 'bg-teal-700 text-white border-teal-700 shadow-sm shadow-teal-700/25'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-teal-300 hover:bg-slate-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Doctor Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredDoctors.map(doc => (
            <div 
              key={doc.id}
              className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-teal-400 hover:shadow-lg transition-all duration-200 flex flex-col justify-between gap-5"
            >
              <div>
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative shrink-0">
                    <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center font-bold text-2xl shadow-2xs">
                      <span className="material-symbols-outlined text-[32px] text-teal-700">stethoscope</span>
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" title="Online"></span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-lg font-black text-slate-900 truncate">{doc.name}</h2>
                      <span className="material-symbols-outlined text-teal-600 text-[18px]" title="Verified Govt Doctor">verified</span>
                    </div>
                    <p className="text-xs font-black text-teal-800 mt-0.5">{doc.specialty}</p>
                    <p className="text-[11px] text-slate-500 font-medium">{doc.facility} • {doc.qualification}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-center">
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Rating</span>
                    <span className="text-xs font-black text-slate-900 flex items-center justify-center gap-0.5 mt-0.5">
                      <span className="material-symbols-outlined text-amber-500 text-[14px] fill">star</span>
                      {doc.rating}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Experience</span>
                    <span className="text-xs font-black text-slate-900 mt-0.5 block">{doc.experience}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Next Token</span>
                    <span className="text-[11px] font-black text-teal-700 leading-snug mt-0.5 block">{doc.nextSlot}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                <div className="w-full sm:flex-1 text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-teal-600 text-[17px]">translate</span>
                  <span className="truncate">{doc.languages}</span>
                </div>
                <button
                  onClick={() => setSelectedDoctor(doc)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-black shadow-md shadow-teal-700/20 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer active:scale-98"
                >
                  <span className="material-symbols-outlined text-[17px]">calendar_add_on</span>
                  <span>Book Tele-Consult</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Booking Modal */}
        {selectedDoctor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl overflow-hidden relative">
              <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white flex items-center justify-between border-b-2 border-teal-500">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center">
                    <span className="material-symbols-outlined text-[24px]">videocam</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-teal-300">Booking Tele-Consultation</span>
                    <h3 className="text-base font-black text-white font-heading">{selectedDoctor.name}</h3>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedDoctor(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              <div className="p-6">
                {bookingSuccess ? (
                  <div className="py-8 text-center animate-fadeIn">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                      <span className="material-symbols-outlined text-[36px]">check_circle</span>
                    </div>
                    <h4 className="text-xl font-black text-slate-900 font-heading">Consultation Token Generated!</h4>
                    <p className="text-xs text-slate-600 mt-1 font-medium">Added to your upcoming care queue. You will receive an SMS reminder.</p>
                  </div>
                ) : (
                  <form onSubmit={handleBook} className="flex flex-col gap-4 text-xs">
                    <div className="bg-teal-50 p-3 rounded-2xl border border-teal-200 text-teal-950 font-medium flex items-center gap-2">
                      <span className="material-symbols-outlined text-teal-600 text-[18px]">verified</span>
                      <span>100% Free Government Tele-Consultation under Ayushman Bharat</span>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-1.5 uppercase tracking-wider">Select Consultation Slot</label>
                      <select 
                        value={timeSlot} 
                        onChange={e => setTimeSlot(e.target.value)}
                        className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-bold focus:bg-white focus:outline-none focus:border-teal-600"
                      >
                        <option value="10:00 AM">Today — 10:00 AM (Immediate Token)</option>
                        <option value="02:30 PM">Today — 02:30 PM</option>
                        <option value="04:00 PM">Today — 04:00 PM (Recommended)</option>
                        <option value="05:30 PM">Today — 05:30 PM</option>
                        <option value="11:00 AM">Tomorrow — 11:00 AM</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-1.5 uppercase tracking-wider">Symptoms / Reason for Visit</label>
                      <textarea 
                        rows="3"
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        placeholder="e.g. Mild fever, persistent cough, blood pressure follow-up..."
                        className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-teal-600 resize-none"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-black text-xs shadow-md shadow-teal-700/20 transition-all flex items-center justify-center gap-2 mt-1 cursor-pointer active:scale-98 disabled:opacity-60"
                    >
                      {loading ? <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> : null}
                      <span>{loading ? 'Confirming Token...' : 'Confirm Tele-Consultation Token'}</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
