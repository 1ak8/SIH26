import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('sehatsaarthi_user') || localStorage.getItem('aarogyanet_user');
  if (stored) {
    const { token } = JSON.parse(stored);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sehatsaarthi_user');
      localStorage.removeItem('aarogyanet_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
