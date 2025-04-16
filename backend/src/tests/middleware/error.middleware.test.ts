import { Request, Response, NextFunction } from 'express';
import { notFoundHandler, errorHandler } from '../../middleware/error.middleware';

describe('Error Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    // Reset dei mock
    jest.clearAllMocks();

    // Mock di req, res e next
    jsonMock = jest.fn().mockReturnThis();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    
    req = {};
    res = {
      json: jsonMock,
      status: statusMock
    };
    next = jest.fn();
  });

  describe('notFoundHandler', () => {
    it('dovrebbe restituire un errore 404', () => {
      // Chiama il middleware
      notFoundHandler(req as Request, res as Response, next);

      // Verifica che il middleware abbia restituito un errore 404
      expect(res.status).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Endpoint non trovato' });
    });
  });

  describe('errorHandler', () => {
    it('dovrebbe gestire gli errori e restituire un errore 500', () => {
      // Crea un errore
      const error = new Error('Test error');

      // Spia console.error
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Chiama il middleware
      errorHandler(error, req as Request, res as Response, next);

      // Verifica che il middleware abbia gestito l'errore
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Internal server error',
        message: 'Test error'
      });

      // Ripristina console.error
      consoleErrorSpy.mockRestore();
    });

    it('dovrebbe gestire gli errori con uno status code personalizzato', () => {
      // Crea un errore con uno status code personalizzato
      const error: any = new Error('Test error');
      error.statusCode = 400;

      // Spia console.error
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Chiama il middleware
      errorHandler(error, req as Request, res as Response, next);

      // Verifica che il middleware abbia gestito l'errore
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Bad request',
        message: 'Test error'
      });

      // Ripristina console.error
      consoleErrorSpy.mockRestore();
    });
  });
});
