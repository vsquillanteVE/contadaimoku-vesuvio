// Definizione delle interfacce
import { persistenceService } from './persistence.service';

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

/**
 * Classe per gestire le operazioni sul database
 */
class DBService {
  /**
   * Ottiene il conteggio attuale
   * @returns Il conteggio attuale
   */
  getCount(): number {
    return persistenceService.getData().counter;
  }

  /**
   * Incrementa il conteggio
   * @param amount Quantità da incrementare (default: 1)
   * @returns Il nuovo conteggio
   */
  incrementCount(amount: number = 1): number {
    const newCount = persistenceService.getData().counter + amount;
    persistenceService.updateCounter(newCount);
    return newCount;
  }

  /**
   * Resetta il conteggio a 0
   * @returns true se l'operazione è riuscita
   */
  resetCount(): boolean {
    persistenceService.updateCounter(0);
    return true;
  }

  /**
   * Ottiene il messaggio attuale
   * @returns Il messaggio attuale
   */
  getMessage(): Message {
    return persistenceService.getData().message;
  }

  /**
   * Aggiorna il messaggio
   * @param content Contenuto del messaggio
   * @param htmlContent Contenuto HTML del messaggio
   * @param fullContent Contenuto completo del messaggio
   * @param objectivesContent Contenuto degli obiettivi
   * @returns Il messaggio aggiornato
   */
  updateMessage(content: string, htmlContent: string, fullContent: string, objectivesContent: string): Message {
    const newMessage: Message = {
      content,
      htmlContent,
      fullContent,
      objectivesContent
    };
    
    persistenceService.updateMessage(newMessage);
    return newMessage;
  }

  /**
   * Ottiene la cronologia dei messaggi
   * @param limit Numero massimo di messaggi da restituire (default: 10)
   * @returns La cronologia dei messaggi
   */
  getMessageHistory(limit: number = 10): MessageHistoryItem[] {
    return persistenceService.getData().messageHistory.slice(0, limit);
  }

  /**
   * Autentica un utente
   * @param username Nome utente
   * @param password Password
   * @returns L'utente autenticato o null se l'autenticazione fallisce
   */
  authenticateUser(username: string, password: string): User | null {
    const user = persistenceService.getData().users.find(u => u.username === username && u.password === password);
    return user || null;
  }
}

// Esporta un'istanza singleton del servizio
export const dbService = new DBService();
