const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const apiRoutes = require('./routes');
const { testConnection } = require('./config/db');
const errorHandler = require('./middleware/error.middleware');

const path = require('path');
const fs = require('fs');

const app = express();

// Ensure uploads directory exists (safely handle read-only serverless filesystems)
const uploadsDir = path.join(__dirname, '../uploads/avatars');
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (err) {
  console.warn('⚠️ Notice: Uploads directory could not be created (read-only filesystem or serverless env):', err.message);
}

// Security Headers Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Enable CORS (supports single URL, comma-separated URLs, or local fallback)
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map(url => url.trim())
  : ['http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, origin);
    }
    if (process.env.NODE_ENV !== 'production' || origin.startsWith('http://localhost:')) {
      return callback(null, origin);
    }
    return callback(null, origin);
  },
  credentials: true
}));

// Serve Uploaded Files & Preset Avatars Statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/avatars', express.static(path.join(__dirname, '../../Avatars')));

// Body Parsing Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logging Middleware for Development
if (process.env.NODE_ENV !== 'test') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
  });
}

// Health Check Endpoint
app.get('/api/health', async (req, res, next) => {
  try {
    const dbStatus = await testConnection();
    res.status(200).json({
      success: true,
      message: 'TAPASYA API is running',
      environment: process.env.NODE_ENV || 'development',
      database: dbStatus.connected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
});

// Test Error Handler Route (for verification suite)
if (process.env.NODE_ENV === 'test') {
  app.get('/api/test-error', (req, res, next) => {
    const err = new Error('Custom Test Server Error');
    err.statusCode = 400;
    next(err);
  });
}

// Mount Main API Routes Architecture
app.use('/api', apiRoutes);

// 404 Not Found Handler for Unmatched Routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;
