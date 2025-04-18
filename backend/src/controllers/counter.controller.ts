import { Request, Response } from 'express';
import { dbService } from '../services/db.service';
import { backupService } from '../services/backup.service';

/**
 * Controller per gestire le operazioni sul contatore
 */
export class CounterController {
  /**
   * Test per verificare la tabella daimoku_log
   * @param req Richiesta Express
   * @param res Risposta Express
   */
  async testDaimokuLog(req: Request, res: Response): Promise<void> {
    try {
      console.log('[TEST-DAIMOKU-LOG] Starting test...');

      // Ottieni il conteggio attuale
      const count = await dbService.getCount();
      console.log(`[TEST-DAIMOKU-LOG] Current count: ${count}`);

      // Ottieni i log di daimoku
      const logs = await dbService.getDaimokuLogs(10, 0);
      console.log(`[TEST-DAIMOKU-LOG] Found ${logs.length} logs`);

      // Verifica se la tabella daimoku_log esiste
      const tableExists = logs !== null;
      console.log(`[TEST-DAIMOKU-LOG] Table exists: ${tableExists}`);

      // Restituisci il risultato
      res.json({
        success: true,
        count,
        tableExists,
        logs,
        environment: {
          nodeEnv: process.env.NODE_ENV,
          vercel: process.env.VERCEL ? true : false,
          databaseUrl: process.env.DATABASE_URL ? 'Set (length: ' + process.env.DATABASE_URL.length + ')' : 'Not set'
        }
      });
    } catch (error) {
      console.error('[TEST-DAIMOKU-LOG] Error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'production' ? '(hidden in production)' : error instanceof Error ? error.stack : 'No stack trace'
      });
    }
  }
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

      // Raccogli informazioni sul client
      const clientInfo = JSON.stringify({
        ip: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        referer: req.headers.referer,
        timestamp: new Date().toISOString()
      });

      // Incrementa il contatore
      const count = await dbService.incrementCount(amount, clientInfo);

      // Esegui un backup automatico in background solo se non siamo in ambiente serverless
      if (!process.env.VERCEL) {
        this.triggerAutomaticBackup();
      } else {
        console.log('[COUNTER] Skipping automatic backup in serverless environment');
      }

      // Restituisci il risultato
      res.json({ count });
    } catch (error) {
      console.error('Error incrementing count:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Esegue un backup automatico in background
   * @private
   */
  private triggerAutomaticBackup(): void {
    // Esegui il backup in modo asincrono senza attendere il completamento
    backupService.backupDaimokuLogs()
      .then(filePath => {
        console.log(`Automatic backup created successfully: ${filePath}`);
      })
      .catch(error => {
        console.error('Error creating automatic backup:', error);
      });
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

  /**
   * Ottiene la cronologia dei log di daimoku
   * @param req Richiesta Express
   * @param res Risposta Express
   */
  async getDaimokuLogs(req: Request, res: Response): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;

      const logs = await dbService.getDaimokuLogs(limit, offset);
      res.json({ logs });
    } catch (error) {
      console.error('Error getting daimoku logs:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Ottiene statistiche sui log di daimoku
   * @param req Richiesta Express
   * @param res Risposta Express
   */
  async getDaimokuStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await dbService.getDaimokuStats();
      res.json({ stats });
    } catch (error) {
      console.error('Error getting daimoku stats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Esporta i log di daimoku in formato CSV
   * @param req Richiesta Express
   * @param res Risposta Express
   */
  async exportDaimokuLogs(req: Request, res: Response): Promise<void> {
    try {
      const logs = await dbService.getDaimokuLogs(10000, 0); // Ottieni fino a 10000 log

      // Crea l'intestazione del CSV
      let csv = 'ID,Amount,Hours,Minutes,Total Minutes,Status,Created At\n';

      // Aggiungi ogni log al CSV
      logs.forEach(log => {
        csv += `${log.id},${log.amount},${log.hours},${log.minutes},${log.total_minutes},"${log.status}","${log.created_at}"\n`;
      });

      // Imposta gli header per il download del file
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=daimoku_logs.csv');

      // Invia il CSV
      res.send(csv);
    } catch (error) {
      console.error('Error exporting daimoku logs:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

// Esporta un'istanza singleton del controller
export const counterController = new CounterController();
