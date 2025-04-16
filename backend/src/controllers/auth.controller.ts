import { Request, Response } from 'express';
import { dbService } from '../services/db.service';

/**
 * Controller per gestire l'autenticazione
 */
export class AuthController {
  /**
   * Gestisce il login
   * @param req Richiesta Express
   * @param res Risposta Express
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({ error: 'Username and password are required' });
        return;
      }

      const user = await dbService.authenticateUser(username, password);

      if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      // In un'app reale, qui genereremmo un token JWT
      res.json({ 
        user: {
          id: user.id,
          username: user.username
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error during login' });
    }
  }
}

// Esporta un'istanza singleton del controller
export const authController = new AuthController();
