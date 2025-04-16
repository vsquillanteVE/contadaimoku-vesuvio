import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import config from './config';
import { corsMiddleware, corsHeadersMiddleware } from './middleware/cors.middleware';
import { notFoundHandler, errorHandler } from './middleware/error.middleware';
import apiRoutes from './routes';

// Carica le variabili d'ambiente
dotenv.config();

// Stampa le variabili d'ambiente per debug
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
console.log('PGHOST:', process.env.PGHOST || 'Not set');
console.log('PGUSER:', process.env.PGUSER || 'Not set');
console.log('PGDATABASE:', process.env.PGDATABASE || 'Not set');
console.log('PGPASSWORD:', process.env.PGPASSWORD ? 'Set' : 'Not set');

// Inizializza l'app Express
const app = express();

// Middleware
app.use(corsMiddleware);
app.use(corsHeadersMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes API
app.use('/api', apiRoutes);

// Serve file statici in produzione
if (config.env === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
  });
}

// Middleware per gestire gli errori
app.use(notFoundHandler);
app.use(errorHandler);

// Avvia il server o esporta l'app per Vercel
if (process.env.VERCEL === '1') {
  // Esporta l'app Express come funzione serverless
  module.exports = app;
} else {
  // Avvia il server per lo sviluppo locale
  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });
}

// Esporta l'app per Vercel
export default app;

// Esporta l'app per CommonJS
module.exports = app;
