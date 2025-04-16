// Importa il servizio PostgreSQL
import { postgresDBService, Message, User, MessageHistoryItem } from './db.postgres.service';

// Esporta le interfacce
export { Message, User, MessageHistoryItem };

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
   * @returns Il nuovo conteggio
   */
  async incrementCount(amount: number = 1): Promise<number> {
    return postgresDBService.incrementCount(amount);
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
}

// Esporta un'istanza singleton del servizio
export const dbService = new DBService();
