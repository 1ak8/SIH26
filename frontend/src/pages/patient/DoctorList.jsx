import { Link } from 'react-router-dom';
import PatientNavbar from '../../components/PatientNavbar';

export default function DoctorList() {
  return (
    <div className="bg-surface-container-lowest text-on-surface font-sans min-h-screen pt-20 px-4">
      <PatientNavbar />
      <div className="max-w-4xl mx-auto">
        <Link to="/patient" className="text-primary hover:underline font-bold mb-6 inline-block">&larr; Back to Dashboard</Link>
        <h1 className="text-headline-lg font-bold mb-4">Doctors Availability List</h1>
        <p className="text-body-md text-secondary mb-8">View and book available doctors at your district hospital or state medical college.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-surface-container p-6 rounded-xl border border-surface-variant">
            <h2 className="text-headline-sm font-bold">Dr. Rajesh Sharma</h2>
            <p className="text-secondary text-sm mb-4">General Medicine • CHC Sitapur Central</p>
            <button className="bg-primary text-on-primary font-bold px-4 py-2 rounded-lg w-full hover:bg-surface-tint">Book Appointment</button>
          </div>
          <div className="bg-surface-container p-6 rounded-xl border border-surface-variant">
            <h2 className="text-headline-sm font-bold">Dr. Ananya Gupta</h2>
            <p className="text-secondary text-sm mb-4">Pediatrics • District Hospital</p>
            <button className="bg-primary text-on-primary font-bold px-4 py-2 rounded-lg w-full hover:bg-surface-tint">Book Appointment</button>
          </div>
        </div>
      </div>
    </div>
  );
}
