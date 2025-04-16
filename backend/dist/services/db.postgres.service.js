"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postgresDBService = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
// Carica le variabili d'ambiente
dotenv_1.default.config();
// Stampa le variabili d'ambiente per debug
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
console.log('PGHOST:', process.env.PGHOST || 'Not set');
// Crea un pool di connessioni
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});
/**
 * Classe per gestire le operazioni sul database PostgreSQL
 */
class PostgresDBService {
    /**
     * Inizializza il database
     */
    async initDatabase() {
        try {
            // Crea la tabella counter se non esiste
            await pool.query(`
        CREATE TABLE IF NOT EXISTS counter (
          id SERIAL PRIMARY KEY,
          value INTEGER NOT NULL DEFAULT 0
        )
      `);
            // Crea la tabella message se non esiste
            await pool.query(`
        CREATE TABLE IF NOT EXISTS message (
          id SERIAL PRIMARY KEY,
          content TEXT NOT NULL,
          html_content TEXT NOT NULL,
          full_content TEXT NOT NULL,
          objectives_content TEXT NOT NULL
        )
      `);
            // Crea la tabella message_history se non esiste
            await pool.query(`
        CREATE TABLE IF NOT EXISTS message_history (
          id SERIAL PRIMARY KEY,
          content TEXT NOT NULL,
          html_content TEXT NOT NULL,
          full_content TEXT NOT NULL,
          objectives_content TEXT NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
            // Crea la tabella users se non esiste
            await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL
        )
      `);
            // Verifica se esiste un contatore
            const counterResult = await pool.query('SELECT * FROM counter LIMIT 1');
            if (counterResult.rows.length === 0) {
                // Inserisci il contatore iniziale
                await pool.query('INSERT INTO counter (value) VALUES (0)');
            }
            // Verifica se esiste un messaggio
            const messageResult = await pool.query('SELECT * FROM message LIMIT 1');
            if (messageResult.rows.length === 0) {
                // Inserisci il messaggio iniziale
                await pool.query(`
          INSERT INTO message (content, html_content, full_content, objectives_content)
          VALUES (
            'Niente può distruggere i tesori del cuore.',
            '<p>Niente può distruggere i tesori del cuore.</p>',
            '<div class="message-highlight"><p>Niente può distruggere i tesori del cuore.</p></div>',
            '<li>Realizziamo in Unità 10.000.000 di Daimoku per la protezione e la buona salute di tutti i praticanti e di tutti i cittadini del Vesuvio</li><li>Studiamo insieme le guide di Sensei</li>'
          )
        `);
            }
            // Verifica se esiste un utente admin
            const userResult = await pool.query('SELECT * FROM users WHERE username = $1', ['admin']);
            if (userResult.rows.length === 0) {
                // Inserisci l'utente admin
                await pool.query(`
          INSERT INTO users (username, password)
          VALUES ('admin', 'vesuvio2025')
        `);
            }
            console.log('Database initialized successfully');
        }
        catch (error) {
            console.error('Error initializing database:', error);
            throw error;
        }
    }
    /**
     * Ottiene il conteggio attuale
     * @returns Il conteggio attuale
     */
    async getCount() {
        try {
            const result = await pool.query('SELECT value FROM counter LIMIT 1');
            return result.rows[0]?.value || 0;
        }
        catch (error) {
            console.error('Error getting count:', error);
            throw error;
        }
    }
    /**
     * Incrementa il conteggio
     * @param amount Quantità da incrementare (default: 1)
     * @returns Il nuovo conteggio
     */
    async incrementCount(amount = 1) {
        try {
            const result = await pool.query('UPDATE counter SET value = value + $1 RETURNING value', [amount]);
            return result.rows[0]?.value || 0;
        }
        catch (error) {
            console.error('Error incrementing count:', error);
            throw error;
        }
    }
    /**
     * Resetta il conteggio a 0
     * @returns true se l'operazione è riuscita
     */
    async resetCount() {
        try {
            await pool.query('UPDATE counter SET value = 0');
            return true;
        }
        catch (error) {
            console.error('Error resetting count:', error);
            throw error;
        }
    }
    /**
     * Ottiene il messaggio attuale
     * @returns Il messaggio attuale
     */
    async getMessage() {
        try {
            const result = await pool.query('SELECT * FROM message LIMIT 1');
            if (result.rows.length === 0) {
                throw new Error('No message found');
            }
            const row = result.rows[0];
            return {
                content: row.content,
                htmlContent: row.html_content,
                fullContent: row.full_content,
                objectivesContent: row.objectives_content
            };
        }
        catch (error) {
            console.error('Error getting message:', error);
            throw error;
        }
    }
    /**
     * Aggiorna il messaggio
     * @param content Contenuto del messaggio
     * @param htmlContent Contenuto HTML del messaggio
     * @param fullContent Contenuto completo del messaggio
     * @param objectivesContent Contenuto degli obiettivi
     * @returns Il messaggio aggiornato
     */
    async updateMessage(content, htmlContent, fullContent, objectivesContent) {
        try {
            // Ottieni il messaggio corrente
            const currentMessage = await this.getMessage();
            // Aggiungi il messaggio corrente alla cronologia
            await pool.query(`
        INSERT INTO message_history (content, html_content, full_content, objectives_content)
        VALUES ($1, $2, $3, $4)
      `, [
                currentMessage.content,
                currentMessage.htmlContent,
                currentMessage.fullContent,
                currentMessage.objectivesContent
            ]);
            // Aggiorna il messaggio
            await pool.query(`
        UPDATE message
        SET content = $1, html_content = $2, full_content = $3, objectives_content = $4
      `, [content, htmlContent, fullContent, objectivesContent]);
            return {
                content,
                htmlContent,
                fullContent,
                objectivesContent
            };
        }
        catch (error) {
            console.error('Error updating message:', error);
            throw error;
        }
    }
    /**
     * Ottiene la cronologia dei messaggi
     * @param limit Numero massimo di messaggi da restituire (default: 10)
     * @returns La cronologia dei messaggi
     */
    async getMessageHistory(limit = 10) {
        try {
            const result = await pool.query(`
        SELECT * FROM message_history
        ORDER BY created_at DESC
        LIMIT $1
      `, [limit]);
            return result.rows.map(row => ({
                id: row.id,
                content: row.content,
                html_content: row.html_content,
                full_content: row.full_content,
                objectives_content: row.objectives_content,
                created_at: row.created_at.toISOString()
            }));
        }
        catch (error) {
            console.error('Error getting message history:', error);
            throw error;
        }
    }
    /**
     * Autentica un utente
     * @param username Nome utente
     * @param password Password
     * @returns L'utente autenticato o null se l'autenticazione fallisce
     */
    async authenticateUser(username, password) {
        try {
            const result = await pool.query(`
        SELECT * FROM users
        WHERE username = $1 AND password = $2
      `, [username, password]);
            if (result.rows.length === 0) {
                return null;
            }
            const row = result.rows[0];
            return {
                id: row.id,
                username: row.username,
                password: row.password
            };
        }
        catch (error) {
            console.error('Error authenticating user:', error);
            throw error;
        }
    }
}
// Esporta un'istanza singleton del servizio
exports.postgresDBService = new PostgresDBService();
// Inizializza il database
exports.postgresDBService.initDatabase().catch(error => {
    console.error('Failed to initialize database:', error);
});
