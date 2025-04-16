import { Request, Response } from 'express';
import { authController } from '../../controllers/auth.controller';
import { dbService } from '../../services/db.service';

// Mock del servizio DB
jest.mock('../../services/db.service', () => ({
  dbService: {
    authenticateUser: jest.fn()
  }
}));

describe('AuthController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    // Reset dei mock
    jest.clearAllMocks();

    // Mock di req e res
    jsonMock = jest.fn().mockReturnThis();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    
    req = {};
    res = {
      json: jsonMock,
      status: statusMock
    };
  });

  describe('login', () => {
    it('dovrebbe autenticare un utente con credenziali valide', () => {
      // Configura il mock
      const mockUser = { id: 1, username: 'admin', password: 'vesuvio2025' };
      (dbService.authenticateUser as jest.Mock).mockReturnValue(mockUser);

      // Configura la richiesta
      req.body = { username: 'admin', password: 'vesuvio2025' };

      // Chiama il controller
      authController.login(req as Request, res as Response);

      // Verifica che il servizio sia stato chiamato
      expect(dbService.authenticateUser).toHaveBeenCalledWith('admin', 'vesuvio2025');

      // Verifica la risposta
      expect(res.json).toHaveBeenCalledWith({
        user: {
          id: 1,
          username: 'admin'
        }
      });
    });

    it('dovrebbe restituire un errore 401 per credenziali non valide', () => {
      // Configura il mock
      (dbService.authenticateUser as jest.Mock).mockReturnValue(null);

      // Configura la richiesta
      req.body = { username: 'admin', password: 'wrong-password' };

      // Chiama il controller
      authController.login(req as Request, res as Response);

      // Verifica che il servizio sia stato chiamato
      expect(dbService.authenticateUser).toHaveBeenCalledWith('admin', 'wrong-password');

      // Verifica la risposta
      expect(res.status).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });

    it('dovrebbe restituire un errore 400 se mancano campi obbligatori', () => {
      // Configura la richiesta con campi mancanti
      req.body = { username: 'admin' }; // password mancante

      // Chiama il controller
      authController.login(req as Request, res as Response);

      // Verifica che il servizio NON sia stato chiamato
      expect(dbService.authenticateUser).not.toHaveBeenCalled();

      // Verifica la risposta
      expect(res.status).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Username and password are required' });
    });

    it('dovrebbe gestire gli errori', () => {
      // Configura il mock per lanciare un errore
      (dbService.authenticateUser as jest.Mock).mockImplementation(() => {
        throw new Error('Test error');
      });

      // Configura la richiesta
      req.body = { username: 'admin', password: 'vesuvio2025' };

      // Spia console.error
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Chiama il controller
      authController.login(req as Request, res as Response);

      // Verifica che l'errore sia stato gestito
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Internal server error during login' });

      // Ripristina console.error
      consoleErrorSpy.mockRestore();
    });
  });
});
