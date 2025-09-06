import rateLimit from 'express-rate-limit';


export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes..
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});

// Auth rate limiter (stricter)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes..
  max: 5, // limit each IP to 5 login attempts per windowMs..
  message: {
    error: 'Too many authentication attempts, please try again later.'
  }
});

// Media upload limiter
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each user to 10 uploads per hour..
  message: {
    error: 'Too many uploads, please try again later.'
  }
});