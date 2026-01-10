/**
 * Error handling middleware
 */

import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  // Log the error
  logger.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
  });

  // Handle known errors
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        message: error.message,
        statusCode: error.statusCode,
        details: error.details,
      },
    });
  }

  // Handle unknown errors
  return res.status(500).json({
    success: false,
    error: {
      message: 'Internal Server Error',
      statusCode: 500,
    },
  });
}
