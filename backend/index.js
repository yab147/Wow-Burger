import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import menuItemRoutes from './routes/menuItemRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================
// MIDDLEWARE
// ============================================================

// CORS — Allow requests from Vite dev server
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Request logging (development)
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// ============================================================
// API ROUTES
// ============================================================

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/menu-items', menuItemRoutes);

// Root endpoint welcome message
app.get('/', (req, res) => {
  res.send('<h1>🍔 Wow Burger API is running!</h1><p>Use the frontend application to browse the menu, or visit <a href="/api/health">/api/health</a> for server status.</p>');
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const dbStatus = await testConnection();
  res.json({
    success: true,
    message: 'Wow Burger API is running 🍔',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    dbStatus: dbStatus,
    envCheck: {
      has_host: !!process.env.DB_HOST,
      has_port: !!process.env.DB_PORT,
      has_user: !!process.env.DB_USER,
      has_password: !!process.env.DB_PASSWORD,
      has_database: !!process.env.DB_NAME,
      has_ssl: !!process.env.DB_SSL,
      db_host_value: process.env.DB_HOST ? `${process.env.DB_HOST.slice(0, 10)}...` : null,
    }
  });
});

// 404 handler for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
});

// ============================================================
// ERROR HANDLING
// ============================================================
app.use(errorHandler);

// ============================================================
// START SERVER
// ============================================================
async function startServer() {
  // Test database connection
  const dbStatus = await testConnection();
  const dbConnected = dbStatus.success;
  
  if (!dbConnected) {
    console.warn('⚠️  Server starting without database connection.');
    console.warn('   Make sure MySQL is running and .env is configured correctly.');
  }

  app.listen(PORT, () => {
    console.log('');
    console.log('🍔 ═══════════════════════════════════════');
    console.log(`   Wow Burger API Server`);
    console.log(`   Running on: http://localhost:${PORT}`);
    console.log(`   API Health: http://localhost:${PORT}/api/health`);
    console.log(`   Database:   ${dbConnected ? '✅ Connected' : '❌ Not connected'}`);
    console.log('═══════════════════════════════════════════');
    console.log('');
  });
}

startServer();
