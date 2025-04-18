import { DaimokuLogItem } from './db.postgres.service';

/**
 * Servizio per gestire i backup dei dati
 * Versione compatibile con ambiente serverless
 */
export class BackupService {
  /**
   * Costruttore
   */
  constructor() {
    console.log('[BACKUP] Initializing backup service in serverless mode');
  }

  /**
   * Crea un backup dei log di daimoku
   * In ambiente serverless, questa funzione non fa nulla
   * @returns Un messaggio che indica che il backup non è supportato
   */
  async backupDaimokuLogs(): Promise<string> {
    console.log('[BACKUP] Backup operation requested but not supported in serverless environment');
    return 'Backup not supported in serverless environment';
  }

  /**
   * Ottiene la lista dei backup disponibili
   * In ambiente serverless, questa funzione restituisce un array vuoto
   * @returns Array vuoto
   */
  getAvailableBackups(): string[] {
    console.log('[BACKUP] getAvailableBackups called but not supported in serverless environment');
    return [];
  }

  /**
   * Ottiene il contenuto di un backup
   * In ambiente serverless, questa funzione lancia un errore
   * @param fileName Nome del file di backup
   * @returns Mai restituito
   */
  getBackupContent(fileName: string): any {
    console.log('[BACKUP] getBackupContent called but not supported in serverless environment');
    throw new Error('Backup operations not supported in serverless environment');
  }

  /**
   * Elimina un backup
   * In ambiente serverless, questa funzione lancia un errore
   * @param fileName Nome del file di backup
   * @returns Mai restituito
   */
  deleteBackup(fileName: string): boolean {
    console.log('[BACKUP] deleteBackup called but not supported in serverless environment');
    throw new Error('Backup operations not supported in serverless environment');
  }
}

// Esporta un'istanza singleton del servizio
export const backupService = new BackupService();
