"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const counter_routes_1 = __importDefault(require("./counter.routes"));
const message_routes_1 = __importDefault(require("./message.routes"));
const auth_routes_1 = __importDefault(require("./auth.routes"));
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
// Carica le variabili d'ambiente
dotenv_1.default.config();
const router = (0, express_1.Router)();
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
        const pool = new pg_1.Pool({
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
    }
    catch (error) {
        console.error('Database connection error:', error);
        const err = error;
        res.status(500).json({
            success: false,
            error: err.message,
            stack: err.stack
        });
    }
});
// Registra le routes
router.use('/count', counter_routes_1.default);
router.use('/message', message_routes_1.default);
router.use('/auth', auth_routes_1.default);
exports.default = router;
