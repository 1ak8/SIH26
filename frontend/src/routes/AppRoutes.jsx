import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import PatientDashboard from '../pages/patient/Dashboard';
import DoctorList from '../pages/patient/DoctorList';
import MedicineHistory from '../pages/patient/MedicineHistory';
import AmbulanceAvailability from '../pages/patient/AmbulanceAvailability';
import ImmunizationMaternal from '../pages/patient/ImmunizationMaternal';
import PatientReferrals from '../pages/patient/Referrals';
import PatientLabReports from '../pages/patient/LabReports';
import HealthWorkerDashboard from '../pages/health-worker/Dashboard';
import DoctorDashboard from '../pages/doctor/Dashboard';
import PatientQueue from '../pages/doctor/PatientQueue';
import Prescriptions from '../pages/doctor/Prescriptions';
import LabOrders from '../pages/doctor/LabOrders';
import ConsultationHistory from '../pages/doctor/ConsultationHistory';
import DoctorReferrals from '../pages/doctor/Referrals';
import AdminDashboard from '../pages/government/Dashboard';
import { useAuth } from '../context/AuthContext';

const roleHome = { patient: '/patient', health_worker: '/health-worker', doctor: '/doctor', admin: '/admin' };

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={<Navigate to={user ? (roleHome[user.role] || '/login') : '/login'} replace />} />
      <Route path="/login" element={user ? <Navigate to={roleHome[user.role] || '/'} replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={roleHome[user.role] || '/'} replace /> : <Register />} />
      
      {/* Patient Routes */}
      <Route path="/patient" element={<ProtectedRoute roles={['patient']}><PatientDashboard /></ProtectedRoute>} />
      <Route path="/patient/doctors" element={<ProtectedRoute roles={['patient']}><DoctorList /></ProtectedRoute>} />
      <Route path="/patient/medicines" element={<ProtectedRoute roles={['patient']}><MedicineHistory /></ProtectedRoute>} />
      <Route path="/patient/ambulance" element={<ProtectedRoute roles={['patient']}><AmbulanceAvailability /></ProtectedRoute>} />
      <Route path="/patient/immunization" element={<ProtectedRoute roles={['patient']}><ImmunizationMaternal /></ProtectedRoute>} />
      <Route path="/patient/referrals" element={<ProtectedRoute roles={['patient']}><PatientReferrals /></ProtectedRoute>} />
      <Route path="/patient/lab-reports" element={<ProtectedRoute roles={['patient']}><PatientLabReports /></ProtectedRoute>} />
      
      {/* Health Worker Routes */}
      <Route path="/health-worker/*" element={<ProtectedRoute roles={['health_worker']}><HealthWorkerDashboard /></ProtectedRoute>} />
      
      {/* Doctor Routes */}
      <Route path="/doctor" element={<ProtectedRoute roles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
      <Route path="/doctor/queue" element={<ProtectedRoute roles={['doctor']}><PatientQueue /></ProtectedRoute>} />
      <Route path="/doctor/prescriptions" element={<ProtectedRoute roles={['doctor']}><Prescriptions /></ProtectedRoute>} />
      <Route path="/doctor/labs" element={<ProtectedRoute roles={['doctor']}><LabOrders /></ProtectedRoute>} />
      <Route path="/doctor/history" element={<ProtectedRoute roles={['doctor']}><ConsultationHistory /></ProtectedRoute>} />
      <Route path="/doctor/referrals" element={<ProtectedRoute roles={['doctor']}><DoctorReferrals /></ProtectedRoute>} />
      
      {/* Admin Routes */}
      <Route path="/admin/*" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      
      <Route path="*" element={<Navigate to={user ? (roleHome[user.role] || '/login') : '/login'} replace />} />
    </Routes>
  );
};

export default AppRoutes;
