import { Request, Response } from 'express';
import { counterController } from '../../controllers/counter.controller';
import { dbService } from '../../services/db.service';

// Mock del servizio DB
jest.mock('../../services/db.service', () => ({
  dbService: {
    getCount: jest.fn(),
    incrementCount: jest.fn(),
    resetCount: jest.fn()
  }
}));

describe('CounterController', () => {
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

  describe('getCount', () => {
    it('dovrebbe restituire il conteggio attuale', () => {
      // Configura il mock
      (dbService.getCount as jest.Mock).mockReturnValue(42);

      // Chiama il controller
      counterController.getCount(req as Request, res as Response);

      // Verifica che il servizio sia stato chiamato
      expect(dbService.getCount).toHaveBeenCalled();

      // Verifica la risposta
      expect(res.json).toHaveBeenCalledWith({ count: 42 });
    });

    it('dovrebbe gestire gli errori', () => {
      // Configura il mock per lanciare un errore
      (dbService.getCount as jest.Mock).mockImplementation(() => {
        throw new Error('Test error');
      });

      // Spia console.error
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Chiama il controller
      counterController.getCount(req as Request, res as Response);

      // Verifica che l'errore sia stato gestito
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Internal server error' });

      // Ripristina console.error
      consoleErrorSpy.mockRestore();
    });
  });

  describe('incrementCount', () => {
    it('dovrebbe incrementare il conteggio di 1 per default', () => {
      // Configura il mock
      (dbService.incrementCount as jest.Mock).mockReturnValue(43);

      // Configura la richiesta
      req.body = {};

      // Chiama il controller
      counterController.incrementCount(req as Request, res as Response);

      // Verifica che il servizio sia stato chiamato con il valore predefinito
      expect(dbService.incrementCount).toHaveBeenCalledWith(1);

      // Verifica la risposta
      expect(res.json).toHaveBeenCalledWith({ count: 43 });
    });

    it('dovrebbe incrementare il conteggio della quantità specificata', () => {
      // Configura il mock
      (dbService.incrementCount as jest.Mock).mockReturnValue(47);

      // Configura la richiesta
      req.body = { amount: 5 };

      // Chiama il controller
      counterController.incrementCount(req as Request, res as Response);

      // Verifica che il servizio sia stato chiamato con il valore specificato
      expect(dbService.incrementCount).toHaveBeenCalledWith(5);

      // Verifica la risposta
      expect(res.json).toHaveBeenCalledWith({ count: 47 });
    });

    it('dovrebbe gestire gli errori', () => {
      // Configura il mock per lanciare un errore
      (dbService.incrementCount as jest.Mock).mockImplementation(() => {
        throw new Error('Test error');
      });

      // Configura la richiesta
      req.body = { amount: 5 };

      // Spia console.error
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Chiama il controller
      counterController.incrementCount(req as Request, res as Response);

      // Verifica che l'errore sia stato gestito
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Internal server error' });

      // Ripristina console.error
      consoleErrorSpy.mockRestore();
    });
  });

  describe('resetCount', () => {
    it('dovrebbe resettare il conteggio', () => {
      // Configura il mock
      (dbService.resetCount as jest.Mock).mockReturnValue(true);

      // Chiama il controller
      counterController.resetCount(req as Request, res as Response);

      // Verifica che il servizio sia stato chiamato
      expect(dbService.resetCount).toHaveBeenCalled();

      // Verifica la risposta
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it('dovrebbe gestire gli errori', () => {
      // Configura il mock per lanciare un errore
      (dbService.resetCount as jest.Mock).mockImplementation(() => {
        throw new Error('Test error');
      });

      // Spia console.error
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Chiama il controller
      counterController.resetCount(req as Request, res as Response);

      // Verifica che l'errore sia stato gestito
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Internal server error' });

      // Ripristina console.error
      consoleErrorSpy.mockRestore();
    });
  });
});
