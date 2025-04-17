import fs from 'fs';
import path from 'path';
import { dbService } from './db.service';
import { DaimokuLogItem } from './db.postgres.service';

/**
 * Servizio per gestire i backup dei dati
 */
export class BackupService {
  /**
   * Directory dove salvare i backup
   */
  private backupDir: string;

  /**
   * Costruttore
   * @param backupDir Directory dove salvare i backup (default: './backups')
   */
  constructor(backupDir: string = './backups') {
    this.backupDir = backupDir;
    this.ensureBackupDirExists();
  }

  /**
   * Assicura che la directory dei backup esista
   */
  private ensureBackupDirExists(): void {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  /**
   * Crea un backup dei log di daimoku
   * @param startDate Data di inizio (opzionale)
   * @param endDate Data di fine (opzionale)
   * @param maxBackups Numero massimo di backup da mantenere (default: 10)
   * @returns Percorso del file di backup
   */
  async backupDaimokuLogs(startDate?: Date, endDate?: Date, maxBackups: number = 10): Promise<string> {
    try {
      // Ottieni tutti i log
      const logs = await dbService.getDaimokuLogs(10000, 0);

      // Filtra i log per data se necessario
      const filteredLogs = this.filterLogsByDate(logs, startDate, endDate);

      // Crea il nome del file di backup
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const fileName = `daimoku_logs_${timestamp}.json`;
      const filePath = path.join(this.backupDir, fileName);

      // Crea l'oggetto di backup
      const backup = {
        timestamp: new Date().toISOString(),
        totalLogs: filteredLogs.length,
        logs: filteredLogs
      };

      // Salva il backup su file
      fs.writeFileSync(filePath, JSON.stringify(backup, null, 2));

      // Elimina i backup più vecchi se necessario
      this.cleanupOldBackups(maxBackups);

      return filePath;
    } catch (error) {
      console.error('Error creating daimoku logs backup:', error);
      throw error;
    }
  }

  /**
   * Elimina i backup più vecchi mantenendo solo un numero specificato di backup più recenti
   * @param maxBackups Numero massimo di backup da mantenere
   */
  private cleanupOldBackups(maxBackups: number): void {
    try {
      // Ottieni tutti i backup disponibili
      const backups = this.getAvailableBackups();

      // Se il numero di backup è inferiore o uguale al massimo, non fare nulla
      if (backups.length <= maxBackups) {
        return;
      }

      // Ordina i backup per data (dal più vecchio al più recente)
      backups.sort((a, b) => {
        // Estrai la data dal nome del file
        const dateA = a.match(/daimoku_logs_(.*)\.json/)?.[1] || '';
        const dateB = b.match(/daimoku_logs_(.*)\.json/)?.[1] || '';
        return dateA.localeCompare(dateB);
      });

      // Calcola quanti backup eliminare
      const backupsToDelete = backups.length - maxBackups;

      // Elimina i backup più vecchi
      for (let i = 0; i < backupsToDelete; i++) {
        const backupToDelete = backups[i];
        this.deleteBackup(backupToDelete);
        console.log(`Deleted old backup: ${backupToDelete}`);
      }
    } catch (error) {
      console.error('Error cleaning up old backups:', error);
    }
  }

  /**
   * Filtra i log per data
   * @param logs Log da filtrare
   * @param startDate Data di inizio (opzionale)
   * @param endDate Data di fine (opzionale)
   * @returns Log filtrati
   */
  private filterLogsByDate(logs: DaimokuLogItem[], startDate?: Date, endDate?: Date): DaimokuLogItem[] {
    if (!startDate && !endDate) {
      return logs;
    }

    return logs.filter(log => {
      const logDate = new Date(log.created_at);

      if (startDate && endDate) {
        return logDate >= startDate && logDate <= endDate;
      } else if (startDate) {
        return logDate >= startDate;
      } else if (endDate) {
        return logDate <= endDate;
      }

      return true;
    });
  }

  /**
   * Ottiene la lista dei backup disponibili
   * @returns Lista dei backup disponibili
   */
  getAvailableBackups(): string[] {
    try {
      this.ensureBackupDirExists();

      // Ottieni tutti i file nella directory dei backup
      const files = fs.readdirSync(this.backupDir);

      // Filtra solo i file JSON
      return files.filter(file => file.endsWith('.json'));
    } catch (error) {
      console.error('Error getting available backups:', error);
      throw error;
    }
  }

  /**
   * Ottiene il contenuto di un backup
   * @param fileName Nome del file di backup
   * @returns Contenuto del backup
   */
  getBackupContent(fileName: string): any {
    try {
      const filePath = path.join(this.backupDir, fileName);

      // Verifica che il file esista
      if (!fs.existsSync(filePath)) {
        throw new Error(`Backup file ${fileName} not found`);
      }

      // Leggi il contenuto del file
      const content = fs.readFileSync(filePath, 'utf8');

      // Converti il contenuto in oggetto JSON
      return JSON.parse(content);
    } catch (error) {
      console.error(`Error reading backup file ${fileName}:`, error);
      throw error;
    }
  }

  /**
   * Elimina un backup
   * @param fileName Nome del file di backup
   * @returns true se l'operazione è riuscita
   */
  deleteBackup(fileName: string): boolean {
    try {
      const filePath = path.join(this.backupDir, fileName);

      // Verifica che il file esista
      if (!fs.existsSync(filePath)) {
        throw new Error(`Backup file ${fileName} not found`);
      }

      // Elimina il file
      fs.unlinkSync(filePath);

      return true;
    } catch (error) {
      console.error(`Error deleting backup file ${fileName}:`, error);
      throw error;
    }
  }
}

// Esporta un'istanza singleton del servizio
export const backupService = new BackupService();
