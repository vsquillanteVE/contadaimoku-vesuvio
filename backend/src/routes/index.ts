import { Router } from 'express';
import counterRoutes from './counter.routes';
import messageRoutes from './message.routes';
import authRoutes from './auth.routes';
import backupRoutes from './backup.routes';
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

/**
 * @route POST /api/test-log
 * @desc Test route per inserire un record nella tabella daimoku_log
 * @access Public
 */
router.post('/test-log', async (req, res) => {
  try {
    console.log('[TEST-LOG] Starting test log insertion...');
    
    // Crea un pool di connessioni
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    // Informazioni di test
    const amount = 1;
    const hours = 0;
    const minutes = 1;
    const clientInfo = JSON.stringify({
      source: 'test-log-endpoint',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      vercel: process.env.VERCEL ? true : false
    });
    
    console.log('[TEST-LOG] Client info:', clientInfo);
    
    // Inserisci il record di test
    console.log('[TEST-LOG] Inserting test log entry...');
    const result = await pool.query(
      `INSERT INTO daimoku_log
      (amount, hours, minutes, total_minutes, client_info, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id`,
      [amount, hours, minutes, amount, clientInfo, 'test']
    );
    
    console.log(`[TEST-LOG] Test log entry inserted successfully with ID: ${result.rows[0]?.id}`);
    
    // Verifica il contenuto della tabella
    const countResult = await pool.query('SELECT COUNT(*) FROM daimoku_log');
    const count = parseInt(countResult.rows[0]?.count) || 0;
    
    // Restituisci il risultato
    res.json({
      success: true,
      logId: result.rows[0]?.id,
      totalLogs: count,
      message: 'Test log entry inserted successfully'
    });
  } catch (error) {
    console.error('[TEST-LOG] Error inserting test log entry:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? '(hidden in production)' : error.stack
    });
  }
});

/**
 * @route GET /api/test-log-table
 * @desc Test route per verificare la tabella daimoku_log
 * @access Public
 */
router.get('/test-log-table', async (req, res) => {
  try {
    console.log('[TEST-LOG-TABLE] Checking daimoku_log table...');
    
    // Crea un pool di connessioni
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    // Verifica se esiste la tabella daimoku_log
    const tableResult = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'daimoku_log'
      )
    `);
    
    const tableExists = tableResult.rows[0].exists;
    console.log(`[TEST-LOG-TABLE] daimoku_log table exists: ${tableExists}`);
    
    // Se la tabella esiste, ottieni informazioni sulle colonne
    let columns = [];
    if (tableExists) {
      const columnsResult = await pool.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'daimoku_log'
      `);
      
      columns = columnsResult.rows;
      console.log('[TEST-LOG-TABLE] daimoku_log columns:', columns);
      
      // Ottieni il numero di record nella tabella
      const countResult = await pool.query('SELECT COUNT(*) FROM daimoku_log');
      const count = parseInt(countResult.rows[0]?.count) || 0;
      console.log(`[TEST-LOG-TABLE] daimoku_log record count: ${count}`);
      
      // Ottieni i permessi sulla tabella
      const permissionsResult = await pool.query(`
        SELECT grantee, privilege_type
        FROM information_schema.table_privileges
        WHERE table_schema = 'public'
        AND table_name = 'daimoku_log'
      `);
      
      const permissions = permissionsResult.rows;
      console.log('[TEST-LOG-TABLE] daimoku_log permissions:', permissions);
      
      // Restituisci il risultato
      res.json({
        success: true,
        tableExists,
        columns,
        recordCount: count,
        permissions
      });
    } else {
      // Se la tabella non esiste, restituisci un errore
      res.json({
        success: false,
        tableExists,
        error: 'daimoku_log table does not exist'
      });
    }
  } catch (error) {
    console.error('[TEST-LOG-TABLE] Error checking daimoku_log table:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? '(hidden in production)' : error.stack
    });
  }
});

// Registra le routes
router.use('/count', counterRoutes);
router.use('/message', messageRoutes);
router.use('/auth', authRoutes);
router.use('/backup', backupRoutes);

export default router;
