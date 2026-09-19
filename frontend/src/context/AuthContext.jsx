import { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import api, { clearApiCache } from '../services/api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

let socket = null;
export const getSocket = () => socket;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Instant load from localStorage cache
    const stored = localStorage.getItem('sehatsaarthi_user') || localStorage.getItem('aarogyanet_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        connectSocket(parsed);
      } catch (e) {
        localStorage.removeItem('sehatsaarthi_user');
        localStorage.removeItem('aarogyanet_user');
      }
    }
    setLoading(false);

    // Background token verification (non-blocking)
    if (stored) {
      api.get('/auth/me', { _cache: false }).then(res => {
        if (res.data?.data) {
          const updated = res.data.data;
          const current = JSON.parse(stored);
          // Update localStorage if user data changed
          const merged = { ...current, ...updated, token: current.token };
          localStorage.setItem('sehatsaarthi_user', JSON.stringify(merged));
          setUser(merged);
        }
      }).catch(() => {
        // Token invalid - but don't logout immediately, let cached data work
      });
    }
  }, []);

  const connectSocket = (userData) => {
    if (socket?.connected) return;
    socket = io('http://localhost:5000', { transports: ['websocket', 'polling'] });
    socket.on('connect', () => {
      socket.emit('join', userData.role);
      if (userData.role === 'patient') socket.emit('join', 'patient');
      else if (userData.role === 'doctor') socket.emit('join', 'doctor');
      else if (userData.role === 'health_worker') socket.emit('join', 'health_worker');
      else if (userData.role === 'admin') socket.emit('join', 'admin');
    });
    socket.on('appointment:booked', (data) => {
      setNotifications(prev => [{ id: Date.now(), text: `New appointment booked: ${data.timeSlot}`, time: new Date() }, ...prev]);
    });
    socket.on('appointment:confirmed', (data) => {
      setNotifications(prev => [{ id: Date.now(), text: `Appointment confirmed`, time: new Date() }, ...prev]);
    });
    socket.on('prescription:new', (data) => {
      setNotifications(prev => [{ id: Date.now(), text: `New prescription: ${data.prescription?.diagnosis || 'prescription'}`, time: new Date() }, ...prev]);
    });
    socket.on('triage:new', (data) => {
      setNotifications(prev => [{ id: Date.now(), text: `New triage: ${data.riskLevel} risk`, time: new Date() }, ...prev]);
    });
    socket.on('referral:new', () => {
      setNotifications(prev => [{ id: Date.now(), text: `New referral created`, time: new Date() }, ...prev]);
    });
    socket.on('queue:updated', (data) => {
      setNotifications(prev => [{ id: Date.now(), text: `Queue status: ${data.status}`, time: new Date() }, ...prev]);
    });
    socket.on('patient:updated', () => {
      setNotifications(prev => [{ id: Date.now(), text: `Patient profile updated`, time: new Date() }, ...prev]);
    });
  };

  const login = async (email, password) => {
    clearApiCache();
    const { data } = await api.post('/auth/login', { email, password });
    const userData = data.data;
    localStorage.setItem('sehatsaarthi_user', JSON.stringify(userData));
    localStorage.removeItem('aarogyanet_user');
    setUser(userData);
    connectSocket(userData);
    return userData;
  };

  const register = async (formData) => {
    clearApiCache();
    const { data } = await api.post('/auth/register', formData);
    const userData = data.data;
    localStorage.setItem('sehatsaarthi_user', JSON.stringify(userData));
    localStorage.removeItem('aarogyanet_user');
    setUser(userData);
    connectSocket(userData);
    return userData;
  };

  const logout = () => {
    clearApiCache();
    localStorage.removeItem('sehatsaarthi_user');
    localStorage.removeItem('aarogyanet_user');
    setUser(null);
    setNotifications([]);
    if (socket) { socket.disconnect(); socket = null; }
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, notifications, setNotifications }}>
      {children}
    </AuthContext.Provider>
  );
};
