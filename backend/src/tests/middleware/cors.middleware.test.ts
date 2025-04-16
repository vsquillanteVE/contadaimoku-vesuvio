import { Request, Response, NextFunction } from 'express';
import { corsMiddleware, corsHeadersMiddleware } from '../../middleware/cors.middleware';
import config from '../../config';

describe('CORS Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    // Reset dei mock
    jest.clearAllMocks();

    // Mock di req, res e next
    req = {
      headers: {
        origin: 'http://localhost:5173'
      },
      method: 'GET'
    };
    res = {
      header: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      end: jest.fn()
    };
    next = jest.fn();
  });

  describe('corsMiddleware', () => {
    it('dovrebbe configurare il middleware CORS', () => {
      // Chiama il middleware
      corsMiddleware(req as Request, res as Response, next);

      // Verifica che il middleware sia stato configurato correttamente
      expect(res.header).toHaveBeenCalledWith('Access-Control-Allow-Origin', 'http://localhost:5173');
      expect(next).toHaveBeenCalled();
    });

    it('dovrebbe gestire origini non consentite', () => {
      // Configura la richiesta con un'origine non consentita
      req.headers.origin = 'http://evil-site.com';

      // Chiama il middleware
      corsMiddleware(req as Request, res as Response, next);

      // Verifica che il middleware abbia gestito l'origine non consentita
      expect(res.header).not.toHaveBeenCalledWith('Access-Control-Allow-Origin', 'http://evil-site.com');
      expect(next).toHaveBeenCalled();
    });

    it('dovrebbe gestire richieste senza origine', () => {
      // Configura la richiesta senza origine
      req.headers.origin = undefined;

      // Chiama il middleware
      corsMiddleware(req as Request, res as Response, next);

      // Verifica che il middleware abbia gestito la richiesta senza origine
      expect(res.header).not.toHaveBeenCalledWith('Access-Control-Allow-Origin', expect.any(String));
      expect(next).toHaveBeenCalled();
    });
  });

  describe('corsHeadersMiddleware', () => {
    it('dovrebbe configurare gli header CORS', () => {
      // Chiama il middleware
      corsHeadersMiddleware(req as Request, res as Response, next);

      // Verifica che gli header CORS siano stati configurati correttamente
      expect(res.header).toHaveBeenCalledWith('Access-Control-Allow-Origin', 'http://localhost:5173');
      expect(res.header).toHaveBeenCalledWith('Access-Control-Allow-Methods', expect.any(String));
      expect(res.header).toHaveBeenCalledWith('Access-Control-Allow-Headers', expect.any(String));
      expect(res.header).toHaveBeenCalledWith('Access-Control-Allow-Credentials', 'true');
      expect(res.header).toHaveBeenCalledWith('Access-Control-Max-Age', '86400');
      expect(next).toHaveBeenCalled();
    });

    it('dovrebbe gestire richieste OPTIONS', () => {
      // Configura la richiesta come OPTIONS
      req.method = 'OPTIONS';

      // Chiama il middleware
      corsHeadersMiddleware(req as Request, res as Response, next);

      // Verifica che il middleware abbia gestito la richiesta OPTIONS
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.end).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('dovrebbe gestire richieste senza origine', () => {
      // Configura la richiesta senza origine
      req.headers.origin = undefined;

      // Chiama il middleware
      corsHeadersMiddleware(req as Request, res as Response, next);

      // Verifica che il middleware abbia gestito la richiesta senza origine
      expect(res.header).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
      expect(next).toHaveBeenCalled();
    });
  });
});
