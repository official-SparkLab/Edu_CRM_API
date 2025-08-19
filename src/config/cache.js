const NodeCache = require('node-cache');

// Create a new cache instance with default TTL of 1 hour (3600 seconds)
const cache = new NodeCache({
  stdTTL: process.env.CACHE_TTL || 3600, // Default TTL in seconds
  checkperiod: 600, // Check for expired keys every 10 minutes
  useClones: false, // Don't clone objects for better performance
  deleteOnExpire: true // Automatically delete expired keys
});

// Cache event listeners
cache.on('expired', (key, value) => {
  console.log(`Cache key expired: ${key}`);
});

cache.on('flush', () => {
  console.log('Cache flushed');
});

cache.on('error', (err) => {
  console.error('Cache error:', err);
});

module.exports = cache;
