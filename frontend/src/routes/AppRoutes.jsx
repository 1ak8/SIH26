import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import PatientDashboard from '../pages/patient/Dashboard';
import DoctorList from '../pages/patient/DoctorList';
import MedicineHistory from '../pages/patient/MedicineHistory';
import HealthWorkerDashboard from '../pages/health-worker/Dashboard';
import DoctorDashboard from '../pages/doctor/Dashboard';
import PatientQueue from '../pages/doctor/PatientQueue';
import Prescriptions from '../pages/doctor/Prescriptions';
import LabOrders from '../pages/doctor/LabOrders';
import ConsultationHistory from '../pages/doctor/ConsultationHistory';
import AdminDashboard from '../pages/government/Dashboard';
import { useAuth } from '../context/AuthContext';

const roleHome = { patient: '/patient', health_worker: '/health-worker', doctor: '/doctor', admin: '/admin' };

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={roleHome[user.role] || '/'} replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={roleHome[user.role] || '/'} replace /> : <Register />} />
      <Route path="/patient" element={<ProtectedRoute roles={['patient']}><PatientDashboard /></ProtectedRoute>} />
      <Route path="/patient/doctors" element={<ProtectedRoute roles={['patient']}><DoctorList /></ProtectedRoute>} />
      <Route path="/patient/medicines" element={<ProtectedRoute roles={['patient']}><MedicineHistory /></ProtectedRoute>} />
      <Route path="/health-worker" element={<ProtectedRoute roles={['health_worker']}><HealthWorkerDashboard /></ProtectedRoute>} />
      <Route path="/doctor" element={<ProtectedRoute roles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
      <Route path="/doctor/queue" element={<ProtectedRoute roles={['doctor']}><PatientQueue /></ProtectedRoute>} />
      <Route path="/doctor/prescriptions" element={<ProtectedRoute roles={['doctor']}><Prescriptions /></ProtectedRoute>} />
      <Route path="/doctor/labs" element={<ProtectedRoute roles={['doctor']}><LabOrders /></ProtectedRoute>} />
      <Route path="/doctor/history" element={<ProtectedRoute roles={['doctor']}><ConsultationHistory /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to={user ? (roleHome[user.role] || '/login') : '/login'} replace />} />
    </Routes>
  );
};

export default AppRoutes;
