const cache = require('../../config/cache');

class CacheService {
  constructor() {
    this.cacheExpiry = process.env.CACHE_TTL || 3600; // Default to 1 hour
  }

  async get(key) {
    try {
      const data = cache.get(key);
      return data || null;
    } catch (error) {
      console.error(`Cache GET error for key ${key}:`, error);
      return null;
    }
  }

  async set(key, value, expiry = this.cacheExpiry) {
    try {
      cache.set(key, value, expiry);
    } catch (error) {
      console.error(`Cache SET error for key ${key}:`, error);
    }
  }

  async del(key) {
    try {
      cache.del(key);
    } catch (error) {
      console.error(`Cache DEL error for key ${key}:`, error);
    }
  }

  async delByPattern(pattern) {
    try {
      const keys = cache.keys();
      const matchingKeys = keys.filter(key => {
        // Simple pattern matching - supports * wildcard
        const regexPattern = pattern.replace(/\*/g, '.*');
        const regex = new RegExp(`^${regexPattern}$`);
        return regex.test(key);
      });
      
      if (matchingKeys.length > 0) {
        cache.del(matchingKeys);
      }
    } catch (error) {
      console.error(`Cache DEL by pattern error for pattern ${pattern}:`, error);
    }
  }

  // Additional utility methods for node-cache
  async flush() {
    try {
      cache.flushAll();
    } catch (error) {
      console.error('Cache FLUSH error:', error);
    }
  }

  async getStats() {
    try {
      return cache.getStats();
    } catch (error) {
      console.error('Cache STATS error:', error);
      return null;
    }
  }

  async keys() {
    try {
      return cache.keys();
    } catch (error) {
      console.error('Cache KEYS error:', error);
      return [];
    }
  }

  async has(key) {
    try {
      return cache.has(key);
    } catch (error) {
      console.error(`Cache HAS error for key ${key}:`, error);
      return false;
    }
  }
}

module.exports = new CacheService();