import { Router } from 'express';
import counterRoutes from './counter.routes';
import messageRoutes from './message.routes';
import authRoutes from './auth.routes';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Carica le variabili d'ambiente
dotenv.config();

const router = Router();

/**
 * @route GET /api/test
 * @desc Test route
 * @access Public
 */
router.get('/test', (req, res) => {
  res.json({
    message: 'API is working!',
    env: process.env.NODE_ENV || 'development',
    vercel: process.env.VERCEL || 'not-vercel',
    database_url: process.env.DATABASE_URL ? 'Set' : 'Not set',
    pghost: process.env.PGHOST || 'Not set',
    pguser: process.env.PGUSER || 'Not set',
    pgdatabase: process.env.PGDATABASE || 'Not set',
    pgpassword: process.env.PGPASSWORD ? 'Set' : 'Not set'
  });
});

/**
 * @route GET /api/test-db
 * @desc Test database connection
 * @access Public
 */
router.get('/test-db', async (req, res) => {
  try {
    // Crea un pool di connessioni
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });

    // Testa la connessione
    const result = await pool.query('SELECT NOW()');

    // Verifica se esiste la tabella counter
    const tableResult = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'counter'
      )
    `);

    // Ottieni il valore del contatore
    let counterValue = null;
    if (tableResult.rows[0].exists) {
      const counterResult = await pool.query('SELECT value FROM counter LIMIT 1');
      if (counterResult.rows.length > 0) {
        counterValue = counterResult.rows[0].value;
      }
    }

    res.json({
      success: true,
      timestamp: result.rows[0].now,
      tableExists: tableResult.rows[0].exists,
      counterValue
    });
  } catch (error) {
    console.error('Database connection error:', error);
    const err = error as Error;
    res.status(500).json({
      success: false,
      error: err.message,
      stack: err.stack
    });
  }
});

// Registra le routes
router.use('/count', counterRoutes);
router.use('/message', messageRoutes);
router.use('/auth', authRoutes);

export default router;
