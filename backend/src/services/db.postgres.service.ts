import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Carica le variabili d'ambiente
dotenv.config();

// Stampa le variabili d'ambiente per debug
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
console.log('PGHOST:', process.env.PGHOST || 'Not set');

// Crea un pool di connessioni
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Definizione delle interfacce
export interface Message {
  content: string;
  htmlContent: string;
  fullContent: string;
  objectivesContent: string;
}

export interface User {
  id: number;
  username: string;
  password: string;
}

export interface MessageHistoryItem {
  id: number;
  content: string;
  html_content: string;
  full_content: string;
  objectives_content: string;
  created_at: string;
}

export interface DaimokuLogItem {
  id: number;
  amount: number;
  hours: number;
  minutes: number;
  total_minutes: number;
  client_info: string;
  status: string;
  created_at: string;
}

/**
 * Classe per gestire le operazioni sul database PostgreSQL
 */
class PostgresDBService {
  /**
   * Inizializza il database
   */
  async initDatabase(): Promise<void> {
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

      // Crea la tabella daimoku_log se non esiste
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
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  /**
   * Ottiene il conteggio attuale
   * @returns Il conteggio attuale
   */
  async getCount(): Promise<number> {
    try {
      const result = await pool.query('SELECT value FROM counter LIMIT 1');
      return result.rows[0]?.value || 0;
    } catch (error) {
      console.error('Error getting count:', error);
      throw error;
    }
  }

  /**
   * Incrementa il conteggio
   * @param amount Quantità da incrementare (default: 1)
   * @param clientInfo Informazioni sul client (opzionale)
   * @returns Il nuovo conteggio
   */
  async incrementCount(amount: number = 1, clientInfo: string = ''): Promise<number> {
    const client = await pool.connect();
    try {
      // Inizia una transazione
      await client.query('BEGIN');

      // Incrementa il contatore
      const result = await client.query(
        'UPDATE counter SET value = value + $1 RETURNING value',
        [amount]
      );

      const newCount = result.rows[0]?.value || 0;

      // Calcola ore e minuti
      const hours = Math.floor(amount / 60);
      const minutes = amount % 60;

      // Registra l'operazione nel log
      await client.query(
        `INSERT INTO daimoku_log
        (amount, hours, minutes, total_minutes, client_info, status)
        VALUES ($1, $2, $3, $4, $5, $6)`,
        [amount, hours, minutes, amount, clientInfo, 'success']
      );

      // Commit della transazione
      await client.query('COMMIT');

      return newCount;
    } catch (error) {
      // Rollback in caso di errore
      await client.query('ROLLBACK');
      console.error('Error incrementing count:', error);

      // Tenta di registrare l'errore nel log
      try {
        const errorMessage = error instanceof Error ? error.message : 'unknown error';
        await pool.query(
          `INSERT INTO daimoku_log
          (amount, hours, minutes, total_minutes, client_info, status)
          VALUES ($1, $2, $3, $4, $5, $6)`,
          [amount, Math.floor(amount / 60), amount % 60, amount, clientInfo, `error: ${errorMessage}`]
        );
      } catch (logError) {
        console.error('Error logging failed operation:', logError);
      }

      throw error;
    } finally {
      // Rilascia il client
      client.release();
    }
  }

  /**
   * Resetta il conteggio a 0
   * @returns true se l'operazione è riuscita
   */
  async resetCount(): Promise<boolean> {
    try {
      await pool.query('UPDATE counter SET value = 0');
      return true;
    } catch (error) {
      console.error('Error resetting count:', error);
      throw error;
    }
  }

  /**
   * Ottiene il messaggio attuale
   * @returns Il messaggio attuale
   */
  async getMessage(): Promise<Message> {
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
    } catch (error) {
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
  async updateMessage(content: string, htmlContent: string, fullContent: string, objectivesContent: string): Promise<Message> {
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
    } catch (error) {
      console.error('Error updating message:', error);
      throw error;
    }
  }

  /**
   * Ottiene la cronologia dei messaggi
   * @param limit Numero massimo di messaggi da restituire (default: 10)
   * @returns La cronologia dei messaggi
   */
  async getMessageHistory(limit: number = 10): Promise<MessageHistoryItem[]> {
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
    } catch (error) {
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
  async authenticateUser(username: string, password: string): Promise<User | null> {
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
    } catch (error) {
      console.error('Error authenticating user:', error);
      throw error;
    }
  }

  /**
   * Ottiene la cronologia dei log di daimoku
   * @param limit Numero massimo di log da restituire (default: 100)
   * @param offset Offset per la paginazione (default: 0)
   * @returns La cronologia dei log di daimoku
   */
  async getDaimokuLogs(limit: number = 100, offset: number = 0): Promise<DaimokuLogItem[]> {
    try {
      const result = await pool.query(`
        SELECT * FROM daimoku_log
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
      `, [limit, offset]);

      return result.rows.map(row => ({
        id: row.id,
        amount: row.amount,
        hours: row.hours,
        minutes: row.minutes,
        total_minutes: row.total_minutes,
        client_info: row.client_info,
        status: row.status,
        created_at: row.created_at.toISOString()
      }));
    } catch (error) {
      console.error('Error getting daimoku logs:', error);
      throw error;
    }
  }

  /**
   * Ottiene statistiche sui log di daimoku
   * @returns Statistiche sui log di daimoku
   */
  async getDaimokuStats(): Promise<{ total: number, totalHours: number, totalMinutes: number, successCount: number, errorCount: number }> {
    try {
      // Ottieni il totale dei minuti di daimoku
      const totalResult = await pool.query(`
        SELECT
          SUM(total_minutes) as total_minutes,
          COUNT(*) as total_count,
          COUNT(CASE WHEN status = 'success' THEN 1 END) as success_count,
          COUNT(CASE WHEN status != 'success' THEN 1 END) as error_count
        FROM daimoku_log
      `);

      const totalMinutes = parseInt(totalResult.rows[0]?.total_minutes) || 0;
      const totalHours = Math.floor(totalMinutes / 60);
      const remainingMinutes = totalMinutes % 60;

      return {
        total: totalMinutes,
        totalHours: totalHours,
        totalMinutes: remainingMinutes,
        successCount: parseInt(totalResult.rows[0]?.success_count) || 0,
        errorCount: parseInt(totalResult.rows[0]?.error_count) || 0
      };
    } catch (error) {
      console.error('Error getting daimoku stats:', error);
      throw error;
    }
  }
}

// Esporta un'istanza singleton del servizio
export const postgresDBService = new PostgresDBService();

// Inizializza il database
postgresDBService.initDatabase().catch(error => {
  console.error('Failed to initialize database:', error);
});
