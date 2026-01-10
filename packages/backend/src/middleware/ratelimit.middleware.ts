/**
 * Rate limiting middleware
 */

import rateLimit from 'express-rate-limit';
import { config } from '../config';
import {
  MAX_LOGIN_ATTEMPTS,
  MAX_REGISTRATION_ATTEMPTS,
  RATE_LIMIT_WINDOW_MS,
} from '@iforgotpassword/shared-constants';

/**
 * General API rate limiter
 */
export const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Login rate limiter (stricter)
 */
export const loginLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: MAX_LOGIN_ATTEMPTS,
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

/**
 * Registration rate limiter
 */
export const registrationLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: MAX_REGISTRATION_ATTEMPTS,
  message: 'Too many registration attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});
