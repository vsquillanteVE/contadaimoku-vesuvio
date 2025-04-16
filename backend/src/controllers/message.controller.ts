import { Request, Response } from 'express';
import { dbService } from '../services/db.service';

/**
 * Controller per gestire le operazioni sui messaggi
 */
export class MessageController {
  /**
   * Ottiene il messaggio attuale
   * @param req Richiesta Express
   * @param res Risposta Express
   */
  async getMessage(req: Request, res: Response): Promise<void> {
    try {
      const message = await dbService.getMessage();
      res.json({ message });
    } catch (error) {
      console.error('Error getting message:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Aggiorna il messaggio
   * @param req Richiesta Express
   * @param res Risposta Express
   */
  async updateMessage(req: Request, res: Response): Promise<void> {
    try {
      const { content, htmlContent, fullContent, objectivesContent, username, password } = req.body;

      // Verifica le credenziali
      const user = await dbService.authenticateUser(username, password);
      if (!user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Aggiorna il messaggio
      const message = await dbService.updateMessage(content, htmlContent, fullContent, objectivesContent);
      res.json({ message });
    } catch (error) {
      console.error('Error updating message:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Ottiene la cronologia dei messaggi
   * @param req Richiesta Express
   * @param res Risposta Express
   */
  async getMessageHistory(req: Request, res: Response): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const history = await dbService.getMessageHistory(limit);
      res.json({ history });
    } catch (error) {
      console.error('Error getting message history:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

// Esporta un'istanza singleton del controller
export const messageController = new MessageController();
