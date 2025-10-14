const rateLimit = require('express-rate-limit');
const { AppError } = require('../utils/errorHandler');

// Rate limiter for API requests
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  handler: (req, res) => {
    throw new AppError('Too many requests from this IP, please try again after 15 minutes', 429);
  },
});

// More strict rate limiter for auth endpoints
exports.authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 requests per windowMs
  message: 'Too many login attempts, please try again after an hour',
  handler: (req, res) => {
    throw new AppError('Too many login attempts, please try again after an hour', 429);
  },
});