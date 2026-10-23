import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import logger from '../utils/logger';
import ILimiterOptions from '../interfaces/rateLimit.interface';

/**
 * Factory creating rate limiters with security warning logging and unified JSON responses
 */
const createLimiter = (customOptions: ILimiterOptions) => {
  const { limiterName = 'GlobalAPI', ...rateLimitOptions } = customOptions;

  return rateLimit({
    standardHeaders: 'draft-7', // returns RateLimit-* headers
    legacyHeaders: false, // disables X-RateLimit-*
    skip: () => process.env.NODE_ENV === 'test',
    handler: (req: Request, res: Response, _next: NextFunction, options: any) => {
      const status = options.statusCode || 429;
      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';

      logger.warn(
        `[RATE_LIMIT_EXCEEDED] Limiter: ${limiterName} | IP: ${clientIp} | ` +
        `Route: ${req.method} ${req.originalUrl} | User-Agent: ${userAgent}`
      );

      res.status(status).json({
        status,
        message: options.message || 'Too many requests, please try again later.'
      });
    },
    ...rateLimitOptions
  });
};

/**
 * 1. Global API Limiter: protects entire /api namespace from denial of service and scraping
 * Default: 300 requests per 15 minutes per IP
 */
export const apiLimiter = createLimiter({
  limiterName: 'GlobalAPI',
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_API_MAX) || 300,
  message: 'Too many requests from this IP. Please try again after 15 minutes.'
});

/**
 * 2. Strict Auth Limiter: protects /register and /login from credential brute-forcing
 * Default: 10 attempts per 15 minutes per IP
 */
export const authLimiter = createLimiter({
  limiterName: 'Auth',
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_AUTH_MAX) || 10,
  message: 'Too many authentication attempts. Please try again after 15 minutes.'
});

/**
 * 3. Upload Limiter: protects media upload and FFmpeg processing from compute exhaustion
 * Default: 30 uploads per hour per IP
 */
export const uploadLimiter = createLimiter({
  limiterName: 'Upload',
  windowMs: 60 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_UPLOAD_MAX) || 30,
  message: 'Media upload limit reached. Please try again later.'
});

export default {
  apiLimiter,
  authLimiter,
  uploadLimiter
};
