import DoctorNavbar from '../../components/DoctorNavbar';
import ReferralTrackingPanel from '../../components/ReferralTrackingPanel';

export default function DoctorReferrals() {
  return (
    <div className="min-h-screen bg-slate-50 selection:bg-teal-100 selection:text-teal-900">
      <DoctorNavbar />
      <main className="w-full px-4 sm:px-6 lg:px-12 xl:px-16 pt-24 sm:pt-28 pb-16 max-w-7xl mx-auto">
        <ReferralTrackingPanel userRole="doctor" />
      </main>
    </div>
  );
}
