import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

// In-memory cache for GET requests
const cache = new Map();
const CACHE_TTL = 30000; // 30 seconds

const getCacheKey = (config) => {
  return `${config.method}:${config.url}:${JSON.stringify(config.params || {})}`;
};

// Request interceptor - add auth token + check cache
api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('sehatsaarthi_user') || localStorage.getItem('aarogyanet_user');
  if (stored) {
    try {
      const { token } = JSON.parse(stored);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch (e) {}
  }

  // Return cached response for GET requests
  if (config.method === 'get' && config._cache !== false) {
    const key = getCacheKey(config);
    const cached = cache.get(key);
    if (cached && Date.now() - cached.time < CACHE_TTL) {
      config.adapter = () => {
        return Promise.resolve({
          data: cached.data,
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        });
      };
    }
  }

  return config;
});

// Response interceptor - cache GET responses + handle 401
api.interceptors.response.use(
  (res) => {
    // Cache successful GET responses
    if (res.config.method === 'get' && res.config._cache !== false) {
      const key = getCacheKey(res.config);
      cache.set(key, { data: res.data, time: Date.now() });
      // Evict old entries
      if (cache.size > 100) {
        const oldest = cache.keys().next().value;
        cache.delete(oldest);
      }
    }
    return res;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sehatsaarthi_user');
      localStorage.removeItem('aarogyanet_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Helper to clear cache (call on logout or mutations)
export const clearApiCache = () => cache.clear();

export default api;
