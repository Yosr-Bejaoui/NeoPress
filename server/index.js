import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createServer as createHttpServer } from 'http';
import { createServer as createHttpsServer } from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { securityHeaders, corsMiddleware } from './middleware/security.js';
import { generalLimiter, authLimiter, articleGenerationLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFoundHandler, logger } from './middleware/errorHandler.js';
import { createIndexes, monitorConnection } from './utils/database.js';

import newsRoutes from './routes/news.js';
import articleRoutes from './routes/articleRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

console.log('Loaded routes:', {
  news: typeof newsRoutes === 'function',
  articles: typeof articleRoutes === 'function',
  analytics: typeof analyticsRoutes === 'function',
  admin: typeof adminRoutes === 'function'
});

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const requiredEnvVars = ['JWT_SECRET', 'MONGODB_URI', 'GEMINI_API_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  logger.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

logger.info('Environment Configuration:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Not set',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY ? 'Set' : 'Not set',
  NEWSAPI_API_KEY: process.env.NEWSAPI_API_KEY ? 'Set' : 'Not set'
});

const app = express();

app.use(securityHeaders);
app.use(corsMiddleware);

app.use(generalLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'NeoPress API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.use("/api/news", newsRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/auth", authLimiter, adminRoutes);

// Log registered routes for debugging
console.log('Registered API routes:');
console.log('  - /api/news/*');
console.log('  - /api/articles/*');
console.log('  - /api/analytics/*');
console.log('  - /api/auth/login (POST)');
console.log('  - /api/auth/register (POST)');
console.log('  - /api/auth/me (GET)');

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'NeoPress API',
      version: '1.0.0',
      documentation: '/api/docs',
      health: '/health'
    });
  });
}

app.use(notFoundHandler);

app.use(errorHandler);

const HTTP_PORT = process.env.PORT || 5001;
const HTTPS_PORT = process.env.HTTPS_PORT || 5443;

let httpServer, httpsServer;

httpServer = createHttpServer(app);

try {
  const sslOptions = {
    key: fs.readFileSync(path.join(__dirname, 'ssl', 'privkey.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'ssl', 'fullchain.pem')),
    ca: fs.readFileSync(path.join(__dirname, 'ssl', 'chain.pem'))
  };
  httpsServer = createHttpsServer(sslOptions, app);
  logger.info('SSL certificates loaded successfully');
} catch (error) {
  logger.warn('SSL certificates not found or invalid. HTTPS server will not start.');
  logger.debug('SSL error:', error.message);
}

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MongoDB URI is not defined');
    }

    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      heartbeatFrequencyMS: 10000,
      minHeartbeatFrequencyMS: 3000,
      retryWrites: true,
      retryReads: true,
      w: 'majority'
    });
    
    logger.info('✅ MongoDB connected successfully');
    
    await createIndexes();
    
    monitorConnection();
  } catch (error) {
    logger.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const gracefulShutdown = async (signal) => {
  try {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);
    
    await new Promise(resolve => httpServer.close(resolve));
    logger.info('HTTP server closed');
    
    if (httpsServer) {
      await new Promise(resolve => httpsServer.close(resolve));
      logger.info('HTTPS server closed');
    }
    
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
    
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
  

};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

const startServer = async () => {
  try {
    await connectDB();
    
    httpServer.listen(HTTP_PORT, () => {
      logger.info(`HTTP Server running on port ${HTTP_PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      logger.info(`Health check: http://localhost:${HTTP_PORT}/health`);
    });

    if (httpsServer) {
      httpsServer.listen(HTTPS_PORT, () => {
        logger.info(`HTTPS Server running on port ${HTTPS_PORT}`);
      });
    }

    if (process.send) {
      process.send('ready');
    }
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

process.on('SIGUSR2', () => {
  logger.info('Received SIGUSR2 signal. Reloading app...');
  gracefulShutdown('SIGUSR2');
});

startServer();
