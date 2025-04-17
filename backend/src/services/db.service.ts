// Importa il servizio PostgreSQL
import { postgresDBService, Message, User, MessageHistoryItem, DaimokuLogItem } from './db.postgres.service';

// Esporta le interfacce
export { Message, User, MessageHistoryItem, DaimokuLogItem };

/**
 * Classe per gestire le operazioni sul database
 */
class DBService {
  /**
   * Ottiene il conteggio attuale
   * @returns Il conteggio attuale
   */
  async getCount(): Promise<number> {
    return postgresDBService.getCount();
  }

  /**
   * Incrementa il conteggio
   * @param amount Quantità da incrementare (default: 1)
   * @param clientInfo Informazioni sul client (opzionale)
   * @returns Il nuovo conteggio
   */
  async incrementCount(amount: number = 1, clientInfo: string = ''): Promise<number> {
    return postgresDBService.incrementCount(amount, clientInfo);
  }

  /**
   * Resetta il conteggio a 0
   * @returns true se l'operazione è riuscita
   */
  async resetCount(): Promise<boolean> {
    return postgresDBService.resetCount();
  }

  /**
   * Ottiene il messaggio attuale
   * @returns Il messaggio attuale
   */
  async getMessage(): Promise<Message> {
    return postgresDBService.getMessage();
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
    return postgresDBService.updateMessage(content, htmlContent, fullContent, objectivesContent);
  }

  /**
   * Ottiene la cronologia dei messaggi
   * @param limit Numero massimo di messaggi da restituire (default: 10)
   * @returns La cronologia dei messaggi
   */
  async getMessageHistory(limit: number = 10): Promise<MessageHistoryItem[]> {
    return postgresDBService.getMessageHistory(limit);
  }

  /**
   * Autentica un utente
   * @param username Nome utente
   * @param password Password
   * @returns L'utente autenticato o null se l'autenticazione fallisce
   */
  async authenticateUser(username: string, password: string): Promise<User | null> {
    return postgresDBService.authenticateUser(username, password);
  }

  /**
   * Ottiene la cronologia dei log di daimoku
   * @param limit Numero massimo di log da restituire (default: 100)
   * @param offset Offset per la paginazione (default: 0)
   * @returns La cronologia dei log di daimoku
   */
  async getDaimokuLogs(limit: number = 100, offset: number = 0): Promise<DaimokuLogItem[]> {
    return postgresDBService.getDaimokuLogs(limit, offset);
  }

  /**
   * Ottiene statistiche sui log di daimoku
   * @returns Statistiche sui log di daimoku
   */
  async getDaimokuStats(): Promise<{ total: number, totalHours: number, totalMinutes: number, successCount: number, errorCount: number }> {
    return postgresDBService.getDaimokuStats();
  }
}

// Esporta un'istanza singleton del servizio
export const dbService = new DBService();
