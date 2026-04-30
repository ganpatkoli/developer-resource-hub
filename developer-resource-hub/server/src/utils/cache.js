import redisClient from "../config/redis.js";

/**
 * Cache middleware for Express
 * @param {string} keyPrefix - Prefix for the cache key
 * @param {number} duration - Cache duration in seconds
 */
export const cacheMiddleware = (keyPrefix, duration = 300) => {
  return async (req, res, next) => {
    if (!redisClient.isOpen) return next();

    const key = `${keyPrefix}:${req.originalUrl || req.url}`;
    
    try {
      const cachedData = await redisClient.get(key);
      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }

      // Override res.json to cache the response
      const originalJson = res.json;
      res.json = (data) => {
        redisClient.setEx(key, duration, JSON.stringify(data));
        return originalJson.call(res, data);
      };

      next();
    } catch (err) {
      console.error("Cache Middleware Error:", err);
      next();
    }
  };
};

/**
 * Clear cache by pattern
 * @param {string} pattern - Key pattern to clear
 */
export const clearCache = async (pattern) => {
  if (!redisClient.isOpen) return;
  try {
    const keys = await redisClient.keys(`${pattern}:*`);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (err) {
    console.error("Clear Cache Error:", err);
  }
};
