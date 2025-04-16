import { Request, Response, NextFunction } from 'express';

/**
 * Middleware per gestire le richieste a endpoint non trovati
 * @param req Richiesta Express
 * @param res Risposta Express
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  console.log(`Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Endpoint non trovato' });
};

/**
 * Middleware per gestire gli errori
 * @param err Errore
 * @param req Richiesta Express
 * @param res Risposta Express
 * @param next Funzione next
 */
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
};
