import { Router } from 'express';
import counterRoutes from './counter.routes';
import messageRoutes from './message.routes';
import authRoutes from './auth.routes';
// import backupRoutes from './backup.routes';
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
    const err = error as Error;
    res.status(500).json({
      success: false,
      error: err.message,
      stack: process.env.NODE_ENV === 'production' ? '(hidden in production)' : err.stack
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
    const err = error as Error;
    res.status(500).json({
      success: false,
      error: err.message,
      stack: process.env.NODE_ENV === 'production' ? '(hidden in production)' : err.stack
    });
  }
});

// Registra le routes
router.use('/count', counterRoutes);
router.use('/message', messageRoutes);
router.use('/auth', authRoutes);
// router.use('/backup', backupRoutes);

/**
 * @route POST /api/debug-daimoku-log
 * @desc Endpoint di debug per testare l'inserimento nella tabella daimoku_log
 * @access Public
 */
router.post('/debug-daimoku-log', async (req, res) => {
  try {
    console.log('[DEBUG-DAIMOKU-LOG] Starting debug log insertion...');

    // Crea un pool di connessioni
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });

    // Verifica se esiste la tabella daimoku_log
    console.log('[DEBUG-DAIMOKU-LOG] Checking if daimoku_log table exists...');
    const tableResult = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'daimoku_log'
      )
    `);

    const tableExists = tableResult.rows[0].exists;
    console.log(`[DEBUG-DAIMOKU-LOG] daimoku_log table exists: ${tableExists}`);

    if (!tableExists) {
      // Se la tabella non esiste, creala
      console.log('[DEBUG-DAIMOKU-LOG] Creating daimoku_log table...');
      await pool.query(`
        CREATE TABLE IF NOT EXISTS daimoku_log (
          id SERIAL PRIMARY KEY,
          amount INTEGER NOT NULL,
          hours INTEGER NOT NULL,
          minutes INTEGER NOT NULL,
          total_minutes INTEGER NOT NULL,
          client_info TEXT,
          status TEXT NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
      console.log('[DEBUG-DAIMOKU-LOG] daimoku_log table created successfully');
    } else {
      // Se la tabella esiste, ottieni informazioni sulle colonne
      const columnsResult = await pool.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'daimoku_log'
      `);

      console.log('[DEBUG-DAIMOKU-LOG] daimoku_log columns:');
      columnsResult.rows.forEach(row => {
        console.log(`- ${row.column_name}: ${row.data_type}`);
      });

      // Ottieni il numero di record nella tabella
      const countResult = await pool.query('SELECT COUNT(*) FROM daimoku_log');
      const count = parseInt(countResult.rows[0]?.count) || 0;
      console.log(`[DEBUG-DAIMOKU-LOG] daimoku_log record count: ${count}`);
    }

    // Informazioni di test
    const amount = 1;
    const hours = 0;
    const minutes = 1;
    const clientInfo = JSON.stringify({
      source: 'debug-daimoku-log-endpoint',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      vercel: process.env.VERCEL ? true : false,
      database_url: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 20) + '...' : 'Not set'
    });

    console.log('[DEBUG-DAIMOKU-LOG] Client info:', clientInfo);
    console.log('[DEBUG-DAIMOKU-LOG] Database URL:', process.env.DATABASE_URL ? 'Set (length: ' + process.env.DATABASE_URL.length + ')' : 'Not set');

    // Inserisci il record di test
    console.log('[DEBUG-DAIMOKU-LOG] Inserting test log entry...');
    const result = await pool.query(
      `INSERT INTO daimoku_log
      (amount, hours, minutes, total_minutes, client_info, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id`,
      [amount, hours, minutes, amount, clientInfo, 'debug-test']
    );

    console.log(`[DEBUG-DAIMOKU-LOG] Test log entry inserted successfully with ID: ${result.rows[0]?.id}`);

    // Verifica il contenuto della tabella dopo l'inserimento
    const afterCountResult = await pool.query('SELECT COUNT(*) FROM daimoku_log');
    const afterCount = parseInt(afterCountResult.rows[0]?.count) || 0;

    // Ottieni gli ultimi 5 record per verifica
    const recentLogsResult = await pool.query('SELECT * FROM daimoku_log ORDER BY created_at DESC LIMIT 5');

    // Restituisci il risultato
    res.json({
      success: true,
      logId: result.rows[0]?.id,
      totalLogs: afterCount,
      message: 'Debug test log entry inserted successfully',
      tableExists,
      recentLogs: recentLogsResult.rows,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercel: process.env.VERCEL ? true : false,
        databaseUrl: process.env.DATABASE_URL ? 'Set (length: ' + process.env.DATABASE_URL.length + ')' : 'Not set'
      }
    });
  } catch (error) {
    console.error('[DEBUG-DAIMOKU-LOG] Error:', error);
    const err = error as Error;
    res.status(500).json({
      success: false,
      error: err.message,
      stack: process.env.NODE_ENV === 'production' ? '(hidden in production)' : err.stack,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercel: process.env.VERCEL ? true : false,
        databaseUrl: process.env.DATABASE_URL ? 'Set (length: ' + process.env.DATABASE_URL.length + ')' : 'Not set'
      }
    });
  }
});

/**
 * @route POST /api/direct-db-test
 * @desc Test diretto della connessione al database e delle operazioni sulla tabella daimoku_log
 * @access Public
 */
router.post('/direct-db-test', async (req, res) => {
  try {
    console.log('[DIRECT-DB-TEST] Starting direct database test...');

    // Crea un pool di connessioni
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });

    // Risultati dei test
    const testResults: any = {
      connection: false,
      tables: {} as any,
      permissions: {} as any,
      insertTest: false,
      insertError: null as any,
      queryTest: false,
      queryError: null as any,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercel: process.env.VERCEL ? true : false,
        databaseUrl: process.env.DATABASE_URL ? 'Set (length: ' + process.env.DATABASE_URL.length + ')' : 'Not set'
      } as any
    };

    // Test 1: Connessione al database
    try {
      console.log('[DIRECT-DB-TEST] Testing database connection...');
      const connResult = await pool.query('SELECT NOW()');
      testResults.connection = true;
      console.log('[DIRECT-DB-TEST] Database connection successful:', connResult.rows[0].now);
    } catch (connError) {
      console.error('[DIRECT-DB-TEST] Database connection error:', connError);
      testResults.connection = false;
      const err = connError as Error;
      testResults.environment.connectionError = err.message;
    }

    // Test 2: Verifica delle tabelle
    try {
      console.log('[DIRECT-DB-TEST] Checking tables...');
      const tablesResult = await pool.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
      `);

      const tables = tablesResult.rows.map(row => row.table_name);
      testResults.tables.list = tables;
      console.log('[DIRECT-DB-TEST] Tables found:', tables);

      // Verifica specifica per daimoku_log
      const daimokuLogExists = tables.includes('daimoku_log');
      testResults.tables.daimoku_log_exists = daimokuLogExists;

      if (daimokuLogExists) {
        // Ottieni informazioni sulle colonne
        const columnsResult = await pool.query(`
          SELECT column_name, data_type
          FROM information_schema.columns
          WHERE table_schema = 'public'
          AND table_name = 'daimoku_log'
        `);

        testResults.tables.daimoku_log_columns = columnsResult.rows;
        console.log('[DIRECT-DB-TEST] daimoku_log columns:', columnsResult.rows);

        // Ottieni il numero di record
        const countResult = await pool.query('SELECT COUNT(*) FROM daimoku_log');
        testResults.tables.daimoku_log_count = parseInt(countResult.rows[0].count);
        console.log('[DIRECT-DB-TEST] daimoku_log record count:', countResult.rows[0].count);
      }
    } catch (tablesError) {
      console.error('[DIRECT-DB-TEST] Error checking tables:', tablesError);
      const err = tablesError as Error;
      testResults.tables.error = err.message;
    }

    // Test 3: Verifica dei permessi
    try {
      console.log('[DIRECT-DB-TEST] Checking permissions...');
      const permissionsResult = await pool.query(`
        SELECT grantee, table_name, privilege_type
        FROM information_schema.table_privileges
        WHERE table_schema = 'public'
        AND table_name = 'daimoku_log'
      `);

      testResults.permissions.daimoku_log = permissionsResult.rows;
      console.log('[DIRECT-DB-TEST] daimoku_log permissions:', permissionsResult.rows);
    } catch (permissionsError) {
      console.error('[DIRECT-DB-TEST] Error checking permissions:', permissionsError);
      const err = permissionsError as Error;
      testResults.permissions.error = err.message;
    }

    // Test 4: Inserimento di un record di test
    try {
      console.log('[DIRECT-DB-TEST] Testing insert operation...');

      // Se la tabella non esiste, creala
      if (!testResults.tables.daimoku_log_exists) {
        console.log('[DIRECT-DB-TEST] Creating daimoku_log table...');
        await pool.query(`
          CREATE TABLE IF NOT EXISTS daimoku_log (
            id SERIAL PRIMARY KEY,
            amount INTEGER NOT NULL,
            hours INTEGER NOT NULL,
            minutes INTEGER NOT NULL,
            total_minutes INTEGER NOT NULL,
            client_info TEXT,
            status TEXT NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT NOW()
          )
        `);
        console.log('[DIRECT-DB-TEST] daimoku_log table created successfully');
      }

      // Inserisci un record di test
      const insertResult = await pool.query(`
        INSERT INTO daimoku_log
        (amount, hours, minutes, total_minutes, client_info, status)
        VALUES (1, 0, 1, 1, $1, 'direct-test')
        RETURNING id
      `, [JSON.stringify({
        source: 'direct-db-test',
        timestamp: new Date().toISOString()
      })]);

      testResults.insertTest = true;
      testResults.insertId = insertResult.rows[0].id;
      console.log('[DIRECT-DB-TEST] Insert test successful, ID:', insertResult.rows[0].id);
    } catch (insertError) {
      console.error('[DIRECT-DB-TEST] Error during insert test:', insertError);
      testResults.insertTest = false;
      const err = insertError as Error;
      testResults.insertError = err.message;
    }

    // Test 5: Query per verificare l'inserimento
    try {
      console.log('[DIRECT-DB-TEST] Testing query operation...');
      const queryResult = await pool.query('SELECT * FROM daimoku_log ORDER BY created_at DESC LIMIT 5');

      testResults.queryTest = true;
      testResults.recentLogs = queryResult.rows;
      console.log('[DIRECT-DB-TEST] Query test successful, recent logs:', queryResult.rows);
    } catch (queryError) {
      console.error('[DIRECT-DB-TEST] Error during query test:', queryError);
      testResults.queryTest = false;
      const err = queryError as Error;
      testResults.queryError = err.message;
    }

    // Restituisci i risultati dei test
    res.json({
      success: true,
      testResults
    });
  } catch (error) {
    console.error('[DIRECT-DB-TEST] Unexpected error:', error);
    const err = error as Error;
    res.status(500).json({
      success: false,
      error: err.message,
      stack: process.env.NODE_ENV === 'production' ? '(hidden in production)' : err.stack
    });
  }
});

export default router;
