import rateLimit from 'express-rate-limit';


export const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, 
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, 
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 1000)
    });
  }
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, 
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
});

export const articleGenerationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, 
  max: 10, 
  message: {
    success: false,
    message: 'Rate limit exceeded. You can generate up to 10 articles every 5 minutes.',
    retryAfter: 300,
    remaining: 0
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const retryAfter = Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000);
    res.status(429).json({
      success: false,
      message: 'Rate limit exceeded. You can generate up to 10 articles every 5 minutes.',
      retryAfter,
      remaining: req.rateLimit.remaining,
      nextReset: req.rateLimit.resetTime
    });
  }
});

