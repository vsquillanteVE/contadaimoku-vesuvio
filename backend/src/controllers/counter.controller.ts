import { Request, Response } from 'express';
import { dbService } from '../services/db.service';

/**
 * Controller per gestire le operazioni sul contatore
 */
export class CounterController {
  /**
   * Ottiene il conteggio attuale
   * @param req Richiesta Express
   * @param res Risposta Express
   */
  async getCount(req: Request, res: Response): Promise<void> {
    try {
      const count = await dbService.getCount();
      res.json({ count });
    } catch (error) {
      console.error('Error getting count:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Incrementa il conteggio
   * @param req Richiesta Express
   * @param res Risposta Express
   */
  async incrementCount(req: Request, res: Response): Promise<void> {
    try {
      const amount = req.body.amount ? parseInt(req.body.amount) : 1;
      const count = await dbService.incrementCount(amount);
      res.json({ count });
    } catch (error) {
      console.error('Error incrementing count:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Resetta il conteggio
   * @param req Richiesta Express
   * @param res Risposta Express
   */
  async resetCount(req: Request, res: Response): Promise<void> {
    try {
      const result = await dbService.resetCount();
      res.json({ success: result });
    } catch (error) {
      console.error('Error resetting count:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

// Esporta un'istanza singleton del controller
export const counterController = new CounterController();
