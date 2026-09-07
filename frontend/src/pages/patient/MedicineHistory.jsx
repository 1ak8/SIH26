import { Link } from 'react-router-dom';
import PatientNavbar from '../../components/PatientNavbar';

export default function MedicineHistory() {
  return (
    <div className="bg-surface-container-lowest text-on-surface font-sans min-h-screen pt-20 px-4">
      <PatientNavbar />
      <div className="max-w-4xl mx-auto">
        <Link to="/patient" className="text-primary hover:underline font-bold mb-6 inline-block">&larr; Back to Dashboard</Link>
        <h1 className="text-headline-lg font-bold mb-4">Medicine Reports & History</h1>
        <p className="text-body-md text-secondary mb-8">View your past prescriptions and order medicines from Jan Aushadhi Kendra.</p>
        
        <div className="bg-surface-container p-6 rounded-xl border border-surface-variant mb-4">
          <h2 className="text-headline-sm font-bold mb-2">Prescription - 12 Aug 2026</h2>
          <ul className="list-disc pl-5 text-secondary mb-4">
            <li>Paracetamol 500mg - 10 tablets</li>
            <li>Vitamin C - 30 tablets</li>
          </ul>
          <button className="bg-primary text-on-primary font-bold px-5 py-2.5 rounded-xl shadow-sm hover:bg-surface-tint hover:shadow transition-all flex items-center justify-center gap-2 w-full sm:w-auto">
            <span className="material-symbols-outlined text-[20px]">local_pharmacy</span>
            Re-order from Jan Aushadhi
          </button>
        </div>
      </div>
    </div>
  );
}
