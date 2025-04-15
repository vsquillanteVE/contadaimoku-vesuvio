const { Pool } = require('pg');
require('dotenv').config();

// Configurazione del pool di connessioni PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Inizializza il database con le tabelle necessarie
async function initializeDatabase() {
  const client = await pool.connect();
  try {
    // Crea la tabella per il contatore
    await client.query(`
      CREATE TABLE IF NOT EXISTS counter (
        id SERIAL PRIMARY KEY,
        value INTEGER NOT NULL DEFAULT 0
      )
    `);

    // Verifica se esiste già un record per il contatore
    const counterResult = await client.query('SELECT * FROM counter LIMIT 1');
    if (counterResult.rows.length === 0) {
      // Inserisci il valore iniziale del contatore
      await client.query('INSERT INTO counter (value) VALUES (0)');
    }

    // Crea la tabella per il messaggio corrente
    await client.query(`
      CREATE TABLE IF NOT EXISTS message (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        html_content TEXT NOT NULL,
        full_content TEXT NOT NULL,
        objectives_content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Verifica se esiste già un record per il messaggio
    const messageResult = await client.query('SELECT * FROM message LIMIT 1');
    if (messageResult.rows.length === 0) {
      // Inserisci il messaggio iniziale
      await client.query(`
        INSERT INTO message (content, html_content, full_content, objectives_content)
        VALUES (
          'Niente può distruggere i tesori del cuore.',
          '<p>Niente può distruggere i tesori del cuore.</p>',
          '<div class="message-highlight"><p>Niente può distruggere i tesori del cuore.</p></div>',
          '<li>Realizziamo in Unità 10.000.000 di Daimoku per la protezione e la buona salute di tutti i praticanti e di tutti i cittadini del Vesuvio</li><li>Studiamo insieme le guide di Sensei</li>'
        )
      `);
    }

    // Crea la tabella per la cronologia dei messaggi
    await client.query(`
      CREATE TABLE IF NOT EXISTS message_history (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        html_content TEXT NOT NULL,
        full_content TEXT NOT NULL,
        objectives_content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crea la tabella per gli utenti
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Verifica se esiste già un utente admin
    const userResult = await client.query('SELECT * FROM users WHERE username = $1', ['admin']);
    if (userResult.rows.length === 0) {
      // Inserisci l'utente admin
      await client.query(`
        INSERT INTO users (username, password)
        VALUES ('admin', 'vesuvio2025')
      `);
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    client.release();
  }
}

// Inizializza il database all'avvio
initializeDatabase().catch(console.error);

// Get the current count
async function getCount() {
  try {
    const result = await pool.query('SELECT value FROM counter LIMIT 1');
    return result.rows[0]?.value || 0;
  } catch (error) {
    console.error('Error getting count:', error);
    return 0;
  }
}

// Increment the count
async function incrementCount(amount = 1) {
  try {
    const result = await pool.query(
      'UPDATE counter SET value = value + $1 RETURNING value',
      [amount]
    );
    return result.rows[0]?.value || 0;
  } catch (error) {
    console.error('Error incrementing count:', error);
    throw error;
  }
}

// Reset the count (for testing purposes)
async function resetCount() {
  try {
    await pool.query('UPDATE counter SET value = 0');
    return true;
  } catch (error) {
    console.error('Error resetting count:', error);
    throw error;
  }
}

// Get the current message
async function getMessage() {
  try {
    const result = await pool.query('SELECT * FROM message ORDER BY id DESC LIMIT 1');
    if (result.rows.length === 0) {
      return {
        content: 'Niente può distruggere i tesori del cuore.',
        htmlContent: '<p>Niente può distruggere i tesori del cuore.</p>',
        fullContent: '<div class="message-highlight"><p>Niente può distruggere i tesori del cuore.</p></div>',
        objectivesContent: '<li>Realizziamo in Unità 10.000.000 di Daimoku per la protezione e la buona salute di tutti i praticanti e di tutti i cittadini del Vesuvio</li><li>Studiamo insieme le guide di Sensei</li>'
      };
    }
    
    const message = result.rows[0];
    return {
      content: message.content,
      htmlContent: message.html_content,
      fullContent: message.full_content,
      objectivesContent: message.objectives_content
    };
  } catch (error) {
    console.error('Error getting message:', error);
    return {
      content: 'Niente può distruggere i tesori del cuore.',
      htmlContent: '<p>Niente può distruggere i tesori del cuore.</p>',
      fullContent: '<div class="message-highlight"><p>Niente può distruggere i tesori del cuore.</p></div>',
      objectivesContent: '<li>Realizziamo in Unità 10.000.000 di Daimoku per la protezione e la buona salute di tutti i praticanti e di tutti i cittadini del Vesuvio</li><li>Studiamo insieme le guide di Sensei</li>'
    };
  }
}

// Update the message
async function updateMessage(content, htmlContent, fullContent, objectivesContent) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Get current message
    const currentMessage = await getMessage();
    
    // Add to history first
    await client.query(
      'INSERT INTO message_history (content, html_content, full_content, objectives_content) VALUES ($1, $2, $3, $4)',
      [currentMessage.content, currentMessage.htmlContent, currentMessage.fullContent, currentMessage.objectivesContent]
    );
    
    // Update current message
    await client.query(
      'UPDATE message SET content = $1, html_content = $2, full_content = $3, objectives_content = $4, created_at = CURRENT_TIMESTAMP',
      [content, htmlContent, fullContent, objectivesContent]
    );
    
    await client.query('COMMIT');
    
    return {
      content,
      htmlContent,
      fullContent,
      objectivesContent
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating message:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Get message history
async function getMessageHistory(limit = 10) {
  try {
    const result = await pool.query(
      'SELECT * FROM message_history ORDER BY created_at DESC LIMIT $1',
      [limit]
    );
    
    return result.rows.map(row => ({
      id: row.id,
      content: row.content,
      html_content: row.html_content,
      full_content: row.full_content,
      objectives_content: row.objectives_content,
      created_at: row.created_at
    }));
  } catch (error) {
    console.error('Error getting message history:', error);
    return [];
  }
}

// Authenticate user
async function authenticateUser(username, password) {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND password = $2',
      [username, password]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const user = result.rows[0];
    return {
      id: user.id,
      username: user.username
    };
  } catch (error) {
    console.error('Error authenticating user:', error);
    return null;
  }
}

module.exports = {
  getCount,
  incrementCount,
  resetCount,
  getMessage,
  updateMessage,
  getMessageHistory,
  authenticateUser
};
