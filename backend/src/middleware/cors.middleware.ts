import { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import config from '../config';

/**
 * Middleware CORS configurato
 */
export const corsMiddleware = cors({
  origin: config.cors.origins,
  methods: config.cors.methods,
  allowedHeaders: config.cors.allowedHeaders,
  credentials: config.cors.credentials
});

/**
 * Middleware per aggiungere manualmente gli header CORS
 * @param req Richiesta Express
 * @param res Risposta Express
 * @param next Funzione next
 */
export const corsHeadersMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Permetti tutte le origini in sviluppo o usa quelle configurate
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cache-Control, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // 24 ore

  // Gestisci le richieste OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  next();
};
