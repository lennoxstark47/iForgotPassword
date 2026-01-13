/**
 * Express application setup
 */

import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import 'express-async-errors';
import { config } from './config';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from './middleware/error.middleware';
import { apiLimiter } from './middleware/ratelimit.middleware';
import routes from './routes';
import logger from './utils/logger';

const app: Express = express();

// Security middleware
// Configure CSP to allow Swagger UI
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'validator.swagger.io'],
      },
    },
  })
);
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
  })
);

// Body parsing with reasonable limits
// Encrypted vault items should not exceed 1MB per request
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Rate limiting
app.use(apiLimiter);

// Request logging
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Swagger API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'iForgotPassword API Documentation',
}));

// Swagger JSON endpoint
app.get('/api-docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Routes
app.use(routes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      statusCode: 404,
    },
  });
});

// Error handling
app.use(errorHandler);

export default app;
