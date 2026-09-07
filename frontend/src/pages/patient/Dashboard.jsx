import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import PatientNavbar from '../../components/PatientNavbar';

export default function PatientDashboard() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    api.get('/patient/dashboard').then(r => setData(r.data.data)).catch(() => {});
  }, []);

  const vitals = data?.profile?.vitals;

  return (
    <div className="bg-surface-container-lowest text-on-surface font-sans min-h-screen">
      <PatientNavbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* MAIN */}
      <main className="w-full bg-surface-container-lowest max-w-7xl mx-auto px-4 lg:px-8 pt-20">
        {activeTab === 'dashboard' && (
          <div className="flex flex-col w-full pb-8">
            {/* Welcome Header */}
            <div className="w-full py-5">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
                <div>
                  <h1 className="text-headline-lg font-bold text-on-surface tracking-tight">{t('welcomeBack')}, {user?.name?.split(' ')[0] || 'Aditya'}</h1>
                  <p className="text-body-md text-secondary mt-1">Sitapur Rural Sub-Centre • ABHA: {user?.abhaId || '91-4820-1940-2810'}</p>
                </div>
                <div className="inline-flex items-center gap-2 bg-surface-container px-4 py-1.5 rounded-full border border-surface-variant text-on-surface text-label-md">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary-container inline-block"></span>
                  <span>{t('activeCitizenHealthRecord')}</span>
                </div>
              </div>

              {/* Primary Care Services */}
              <section className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">apps</span>
                    </div>
                    <h2 className="text-headline-md font-bold text-on-surface">{t('primaryCareServices')}</h2>
                    <span className="bg-surface-container text-on-surface-variant text-label-sm px-2 py-0.5 rounded-full border border-surface-variant font-bold hidden sm:inline">{t('fastAccess')}</span>
                  </div>
                  <span className="text-label-sm text-secondary">{t('selectAnyServiceToBegin')}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {[
                    { icon: 'calendar_month', title: t('bookTeleConsult'), desc: t('consultChc'), badge: t('freeGovService'), action: () => navigate('/patient/doctors') },
                    { icon: 'medication', title: t('orderFreeMedicines'), desc: t('janAushadhiRefill'), badge: t('subsidizedFree'), action: () => navigate('/patient/medicines') },
                    { icon: 'science', title: t('labTestsReports'), desc: t('diagnosticHistoryVitals'), badge: t('instantSync'), action: () => setActiveModal('lab-tests') },
                    { icon: 'near_me', title: t('findNearestPhc'), desc: t('dispensariesSubCentres'), badge: 'Sitapur Ward 4', action: () => setActiveModal('find-phc') },
                  ].map(card => (
                    <button key={card.title} onClick={card.action} className="group text-left bg-surface-container-low p-6 rounded-xl border border-surface-variant hover:border-primary-container hover:bg-surface-container hover:shadow-sm transition-all flex flex-col justify-between focus:outline-none focus:ring-4 focus:ring-primary-container" type="button">
                      <div className="flex items-center justify-between w-full mb-5">
                        <div className="w-12 h-12 rounded-xl bg-surface-container-lowest text-primary border border-surface-variant flex items-center justify-center group-hover:bg-primary-container group-hover:text-on-primary-container transition-colors shadow-sm">
                          <span className="material-symbols-outlined text-[28px]">{card.icon}</span>
                        </div>
                        <span className="material-symbols-outlined text-secondary group-hover:text-primary group-hover:translate-x-1 transition-all text-[22px]">arrow_forward</span>
                      </div>
                      <div>
                        <span className="text-headline-sm font-bold text-on-surface block mb-1">{card.title}</span>
                        <p className="text-body-md text-secondary mb-2">{card.desc}</p>
                        <span className="inline-block bg-surface-container-lowest text-primary text-label-sm font-bold px-2 py-0.5 rounded border border-surface-variant">{card.badge}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              {/* Upcoming Care */}
              <section className="mb-8">
                <div className="bg-surface-container p-6 rounded-xl border-2 border-surface-variant">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5 border-b border-surface-variant pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-secondary text-on-secondary flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[20px]">event_upcoming</span>
                      </div>
                      <h2 className="text-headline-md font-bold text-on-surface">Your Upcoming Care</h2>
                      <span className="bg-primary-container text-on-primary-container text-label-sm font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider text-[13px]">Next 48 Hours</span>
                    </div>
                    <div className="inline-flex items-center gap-2 text-primary text-label-md font-bold">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary-container inline-block"></span>
                      <span>Live Queue Monitored</span>
                    </div>
                  </div>
                  {data?.upcomingAppointments?.length > 0 ? (
                    data.upcomingAppointments.map(a => (
                      <div key={a._id} className="bg-surface-container-lowest p-6 rounded-xl border border-surface-variant shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-3">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          <div className="flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-surface-container-low border border-surface-variant text-center shrink-0">
                            <span className="text-label-sm text-secondary font-bold uppercase">{new Date(a.date).toLocaleDateString('en', {weekday:'short'})}</span>
                            <span className="text-headline-md font-bold text-primary leading-tight">{a.timeSlot}</span>
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="text-headline-sm font-bold text-on-surface">{a.doctor?.name || 'Dr. Rajesh Sharma'}</span>
                              <span className="bg-surface-container text-primary font-bold px-2 py-0.5 rounded text-label-sm border border-surface-variant">Tele-Consult</span>
                              <span className="bg-surface-container-low text-secondary font-bold px-2 py-0.5 rounded text-label-sm">Queue #{a.tokenNumber}</span>
                            </div>
                            <p className="text-body-md text-secondary">General Medicine • ABHA Linked Consultation</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <button className="h-12 px-4 rounded-lg border border-surface-variant text-on-surface text-label-md font-bold hover:bg-surface-container transition-colors" type="button">View Vitals & Notes</button>
                          <button className="h-12 px-6 rounded-lg bg-primary text-on-primary text-label-md font-bold hover:bg-surface-tint transition-colors flex items-center gap-2 shadow-sm" type="button">
                            <span className="material-symbols-outlined text-[20px]">videocam</span>Enter Consultation
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-surface-container-lowest p-6 rounded-xl border border-surface-variant shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-surface-container-low border border-surface-variant text-center shrink-0">
                          <span className="text-label-sm text-secondary font-bold uppercase">Today</span>
                          <span className="text-headline-md font-bold text-primary leading-tight">4:00</span>
                          <span className="text-[11px] text-secondary font-bold uppercase">PM</span>
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-headline-sm font-bold text-on-surface">Dr. Rajesh Sharma</span>
                            <span className="bg-surface-container text-primary font-bold px-2 py-0.5 rounded text-label-sm border border-surface-variant">Tele-Consult</span>
                            <span className="bg-surface-container-low text-secondary font-bold px-2 py-0.5 rounded text-label-sm">Queue #04</span>
                          </div>
                          <p className="text-body-md text-secondary">General Medicine • CHC Sitapur Central • ABHA Linked Consultation</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <button className="h-12 px-4 rounded-lg border border-surface-variant text-on-surface text-label-md font-bold hover:bg-surface-container transition-colors" type="button">View Vitals & Notes</button>
                        <button className="h-12 px-6 rounded-lg bg-primary text-on-primary text-label-md font-bold hover:bg-surface-tint transition-colors flex items-center gap-2 shadow-sm" type="button">
                          <span className="material-symbols-outlined text-[20px]">videocam</span>Enter Consultation
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Bottom Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Village Health Camp */}
                <div className="md:col-span-2 bg-surface-container-lowest p-6 rounded-xl border border-surface-variant flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary shrink-0">
                      <span className="material-symbols-outlined text-[26px]">vaccines</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-label-sm uppercase tracking-wider text-secondary font-bold">Village Health Camp</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                        <span className="text-label-sm text-primary font-bold">This Thursday</span>
                      </div>
                      <p className="text-headline-sm font-bold text-on-surface">Immunization & Maternal Health Checkup</p>
                      <p className="text-body-md text-secondary">Anganwadi Centre 3 • Walk-in free for all mothers and infants</p>
                    </div>
                  </div>
                </div>

                {/* ASHA Companion Card */}
                <div className="bg-surface-container-lowest p-6 rounded-xl border-2 border-primary-container shadow-sm flex flex-col justify-between gap-3 relative overflow-hidden">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <div className="w-14 h-14 rounded-full bg-primary-container/20 text-on-primary-container border-2 border-primary-container flex items-center justify-center font-bold">
                          <span className="material-symbols-outlined text-[30px] text-primary">health_and_safety</span>
                        </div>
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-surface-container-lowest" title="Active in Village"></span>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-label-sm text-secondary uppercase font-bold tracking-wider">Village ASHA Companion</span>
                          <span className="inline-flex items-center text-primary text-[11px] font-bold bg-surface-container px-1.5 py-0.5 rounded border border-surface-variant">Active Today</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <h3 className="text-headline-sm font-bold text-on-surface leading-tight">Sunita Devi</h3>
                          <span className="material-symbols-outlined text-primary text-[18px]" title="Govt Certified ASHA">verified</span>
                        </div>
                        <p className="text-[12px] text-secondary">Govt Certified • Sitapur Ward 4</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface-container-low p-2.5 rounded-lg border border-surface-variant/70 text-secondary text-[13px] leading-snug">
                    Assigned for home visits, immunizations, medicine refills & urgent PHC escorts.
                    <div className="mt-1 text-[12px] font-bold text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px] text-primary">schedule</span>
                      <span>Available 8:00 AM – 6:00 PM</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <a href="tel:9876543210" className="h-12 px-3 rounded-lg bg-primary text-on-primary text-label-md font-bold hover:bg-surface-tint flex items-center justify-center gap-2 shadow-sm transition-colors text-center">
                      <span className="material-symbols-outlined text-[18px]">call</span>
                      <span>Call Sunita Devi</span>
                    </a>
                    <button type="button" className="h-12 px-3 rounded-lg bg-surface-container-lowest border border-surface-variant text-on-surface text-label-md font-bold hover:bg-surface-container flex items-center justify-center gap-1.5 transition-colors text-center">
                      <span className="material-symbols-outlined text-[18px] text-secondary">home_health</span>
                      <span>Request Visit</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="py-8 animate-fadeIn max-w-3xl mx-auto">
            <h2 className="text-headline-md font-bold text-on-surface mb-6">Citizen Profile Settings</h2>
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-variant shadow-sm mb-6">
              <h3 className="text-headline-sm font-bold border-b border-surface-variant pb-3 mb-4">{t('personalDetails')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-secondary mb-1">{t('fullName')}</label>
                  <p className="text-body-lg text-on-surface">{user?.name || 'Aditya Sharma'}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-secondary mb-1">{t('abhaId')}</label>
                  <p className="text-body-lg font-mono text-on-surface">{user?.abhaId || '91-4820-1940-2810'}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-secondary mb-1">{t('mobileNumber')}</label>
                  <p className="text-body-lg text-on-surface">{user?.phone || '+91 9876543210'}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-secondary mb-1">{t('linkedSubCentre')}</label>
                  <p className="text-body-lg text-on-surface">Sitapur Rural SC (Ward 4)</p>
                </div>
              </div>
              <div className="mt-6">
                <button onClick={() => setActiveModal('edit-profile')} className="bg-surface-container px-4 py-2.5 rounded-lg border border-surface-variant text-sm font-bold text-on-surface hover:bg-surface-variant transition-colors">{t('editProfileInformation')}</button>
              </div>
            </div>
            
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-variant shadow-sm">
              <h3 className="text-headline-sm font-bold border-b border-surface-variant pb-3 mb-4">{t('connectedDevicesSync')}</h3>
              <p className="text-body-md text-secondary mb-4">{t('noPortableDevices')}</p>
              <button className="bg-primary-container text-on-primary-container px-4 py-2.5 rounded-lg border border-primary-container/50 text-sm font-bold hover:bg-[#ffb95f] transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">watch</span>
                <span>{t('connectBluetoothMonitor')}</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-surface border-t border-surface-variant mt-8">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="md:col-span-2 flex flex-col gap-2">
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

      {/* Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-surface-variant flex items-center justify-between bg-surface-container-low">
              <h3 className="text-headline-sm font-bold text-on-surface">
                {activeModal === 'lab-tests' && 'Lab Tests & Reports'}
                {activeModal === 'find-phc' && 'Find Nearest PHC'}
                {activeModal === 'edit-profile' && 'Edit Profile Information'}
              </h3>
              <button onClick={() => setActiveModal(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-variant text-on-surface-variant transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto">
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
                    <button onClick={() => { setActiveModal(null); alert('Appointment Booked!'); }} className="w-full bg-primary text-on-primary py-3.5 rounded-xl font-bold hover:bg-surface-tint shadow-sm transition-colors mt-2">Find Next Available Doctor</button>
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
                    <button onClick={() => { setActiveModal(null); alert('Order Placed!'); }} className="w-full bg-primary text-on-primary py-3.5 rounded-xl font-bold hover:bg-surface-tint shadow-sm transition-colors mt-2">Proceed to Order</button>
                  </div>
                )}
                {/* Lab Tests */}
                {activeModal === 'lab-tests' && (
                  <div className="flex flex-col gap-3">
                    <p className="text-body-md text-secondary mb-2">Recent diagnostic reports synchronized from your PHC.</p>
                    <div className="p-4 rounded-xl border border-surface-variant flex items-center justify-between">
                      <div>
                        <p className="font-bold text-on-surface text-sm">Complete Blood Count (CBC)</p>
                        <p className="text-[12px] text-secondary">Ordered by Dr. Sharma • 2 days ago</p>
                      </div>
                      <button className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
                        <span className="material-symbols-outlined text-[18px]">download</span> PDF
                      </button>
                    </div>
                    <div className="p-4 rounded-xl border border-surface-variant flex items-center justify-between">
                      <div>
                        <p className="font-bold text-on-surface text-sm">HbA1c & Fasting Sugar</p>
                        <p className="text-[12px] text-secondary">Ordered by Dr. Verma • 1 month ago</p>
                      </div>
                      <button className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
                        <span className="material-symbols-outlined text-[18px]">download</span> PDF
                      </button>
                    </div>
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
                    <button onClick={() => { setActiveModal(null); alert('Profile updated successfully!'); }} className="w-full bg-primary text-on-primary py-3.5 rounded-xl font-bold hover:bg-surface-tint shadow-sm transition-colors mt-2">Save Changes</button>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
