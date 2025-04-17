#!/usr/bin/env node

/**
 * Script di backup per i log di daimoku
 * 
 * Questo script si connette al database PostgreSQL, scarica tutti i log di daimoku
 * e li salva in un file JSON locale.
 * 
 * Uso:
 *   node backup.js
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const os = require('os');

// Configurazione
const config = {
  // Directory dove salvare i backup (nella directory del progetto)
  backupDir: path.join(__dirname, '..', 'backups'),
  
  // Numero massimo di backup da mantenere
  maxBackups: 30,
  
  // Connessione al database
  database: {
    connectionString: 'postgres://neondb_owner:npg_LX1pK5triPfQ@ep-holy-breeze-a5vu69xw-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require'
  }
};

/**
 * Assicura che la directory dei backup esista
 */
function ensureBackupDirExists() {
  if (!fs.existsSync(config.backupDir)) {
    fs.mkdirSync(config.backupDir, { recursive: true });
    console.log(`Directory dei backup creata: ${config.backupDir}`);
  }
}

/**
 * Ottiene tutti i log di daimoku dal database
 * @returns {Promise<Array>} Log di daimoku
 */
async function getDaimokuLogs() {
  const client = new Client(config.database);
  
  try {
    await client.connect();
    console.log('Connesso al database');
    
    const result = await client.query(`
      SELECT * FROM daimoku_log
      ORDER BY created_at DESC
    `);
    
    console.log(`Ottenuti ${result.rows.length} log di daimoku`);
    
    return result.rows;
  } catch (error) {
    console.error('Errore durante il recupero dei log di daimoku:', error);
    throw error;
  } finally {
    await client.end();
    console.log('Connessione al database chiusa');
  }
}

/**
 * Ottiene le statistiche sui log di daimoku
 * @returns {Promise<Object>} Statistiche sui log di daimoku
 */
async function getDaimokuStats() {
  const client = new Client(config.database);
  
  try {
    await client.connect();
    
    const result = await client.query(`
      SELECT 
        SUM(total_minutes) as total_minutes,
        COUNT(*) as total_count,
        COUNT(CASE WHEN status = 'success' THEN 1 END) as success_count,
        COUNT(CASE WHEN status != 'success' THEN 1 END) as error_count
      FROM daimoku_log
    `);
    
    const totalMinutes = parseInt(result.rows[0]?.total_minutes) || 0;
    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;
    
    return {
      total: totalMinutes,
      totalHours,
      totalMinutes: remainingMinutes,
      successCount: parseInt(result.rows[0]?.success_count) || 0,
      errorCount: parseInt(result.rows[0]?.error_count) || 0
    };
  } catch (error) {
    console.error('Errore durante il recupero delle statistiche:', error);
    throw error;
  } finally {
    await client.end();
  }
}

/**
 * Crea un backup dei log di daimoku
 * @returns {Promise<string>} Percorso del file di backup
 */
async function createBackup() {
  try {
    // Assicura che la directory dei backup esista
    ensureBackupDirExists();
    
    // Ottieni i log di daimoku
    const logs = await getDaimokuLogs();
    
    // Ottieni le statistiche
    const stats = await getDaimokuStats();
    
    // Crea l'oggetto di backup
    const backup = {
      timestamp: new Date().toISOString(),
      stats,
      totalLogs: logs.length,
      logs
    };
    
    // Crea il nome del file di backup
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const fileName = `daimoku_logs_${timestamp}.json`;
    const filePath = path.join(config.backupDir, fileName);
    
    // Salva il backup su file
    fs.writeFileSync(filePath, JSON.stringify(backup, null, 2));
    
    console.log(`Backup creato: ${filePath}`);
    
    // Elimina i backup più vecchi se necessario
    cleanupOldBackups();
    
    return filePath;
  } catch (error) {
    console.error('Errore durante la creazione del backup:', error);
    throw error;
  }
}

/**
 * Elimina i backup più vecchi mantenendo solo un numero specificato di backup più recenti
 */
function cleanupOldBackups() {
  try {
    // Ottieni tutti i file nella directory dei backup
    const files = fs.readdirSync(config.backupDir);
    
    // Filtra solo i file JSON
    const backups = files.filter(file => file.endsWith('.json'));
    
    // Se il numero di backup è inferiore o uguale al massimo, non fare nulla
    if (backups.length <= config.maxBackups) {
      return;
    }
    
    // Ottieni le informazioni sui file
    const backupFiles = backups.map(file => {
      const filePath = path.join(config.backupDir, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        path: filePath,
        created: stats.birthtime
      };
    });
    
    // Ordina i backup per data (dal più vecchio al più recente)
    backupFiles.sort((a, b) => a.created.getTime() - b.created.getTime());
    
    // Calcola quanti backup eliminare
    const backupsToDelete = backupFiles.length - config.maxBackups;
    
    // Elimina i backup più vecchi
    for (let i = 0; i < backupsToDelete; i++) {
      const backupToDelete = backupFiles[i];
      fs.unlinkSync(backupToDelete.path);
      console.log(`Backup eliminato: ${backupToDelete.name}`);
    }
  } catch (error) {
    console.error('Errore durante la pulizia dei backup vecchi:', error);
  }
}

/**
 * Funzione principale
 */
async function main() {
  try {
    console.log('Avvio del backup dei log di daimoku...');
    
    const filePath = await createBackup();
    
    console.log('Backup completato con successo!');
    console.log(`File di backup: ${filePath}`);
  } catch (error) {
    console.error('Errore durante il backup:', error);
    process.exit(1);
  }
}

// Esegui la funzione principale
main();
