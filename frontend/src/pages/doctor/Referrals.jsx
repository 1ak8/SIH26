import DoctorNavbar from '../../components/DoctorNavbar';
import ReferralTrackingPanel from '../../components/ReferralTrackingPanel';

export default function DoctorReferrals() {
  return (
    <div className="min-h-screen bg-slate-100">
      <DoctorNavbar />
      <main className="w-full px-6 lg:px-12 xl:px-16 pt-28 pb-16">
        <ReferralTrackingPanel userRole="doctor" />
      </main>
    </div>
  );
}
