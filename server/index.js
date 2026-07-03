import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import 'express-async-errors';
import dotenv from 'dotenv';
import { initializeDatabase } from './config/database.js';
import authRoutes from './routes/auth.js';
import documentRoutes from './routes/documents.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// =========================
// SECURITY MIDDLEWARE
// =========================
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

// =========================
// RATE LIMITING
// =========================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Trop de requêtes, réessayez plus tard' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Trop de tentatives de connexion' }
});

// =========================
// APPLY LIMITERS
// =========================
app.use('/api/', limiter);
app.use('/api/auth', authLimiter);

// =========================
// BODY PARSING
// =========================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// =========================
// STATIC FILES (UPLOADS)
// =========================
// ⚠️ futur amélioration: sécuriser par middleware auth
app.use('/uploads', express.static('./uploads'));

// =========================
// ROUTES
// =========================
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);

// =========================
// HEALTH CHECK (PRO)
// =========================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'iFac+ API',
    timestamp: new Date().toISOString()
  });
});

// =========================
// ERROR HANDLER
// =========================
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);

  res.status(500).json({
    error: 'Erreur interne du serveur'
  });
});

// =========================
// START SERVER
// =========================
const startServer = async () => {
  try {
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`✅ iFac+ Server running on http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
