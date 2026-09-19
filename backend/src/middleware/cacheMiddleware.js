// Simple in-memory cache middleware for GET routes
const responseCache = new Map();
const CACHE_TTL = 15000; // 15 seconds

const cacheMiddleware = (ttl = CACHE_TTL) => (req, res, next) => {
  if (req.method !== 'GET') return next();

  const key = `${req.originalUrl}:${req.user?._id || 'public'}`;
  const cached = responseCache.get(key);

  if (cached && Date.now() - cached.time < ttl) {
    return res.json(cached.data);
  }

  // Override res.json to cache the response
  const originalJson = res.json.bind(res);
  res.json = (data) => {
    responseCache.set(key, { data, time: Date.now() });
    // Evict old entries
    if (responseCache.size > 200) {
      const oldest = responseCache.keys().next().value;
      responseCache.delete(oldest);
    }
    return originalJson(data);
  };

  next();
};

module.exports = cacheMiddleware;
