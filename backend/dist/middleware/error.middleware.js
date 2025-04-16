"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.notFoundHandler = void 0;
/**
 * Middleware per gestire le richieste a endpoint non trovati
 * @param req Richiesta Express
 * @param res Risposta Express
 */
const notFoundHandler = (req, res) => {
    console.log(`Route not found: ${req.method} ${req.url}`);
    res.status(404).json({ error: 'Endpoint non trovato' });
};
exports.notFoundHandler = notFoundHandler;
/**
 * Middleware per gestire gli errori
 * @param err Errore
 * @param req Richiesta Express
 * @param res Risposta Express
 * @param next Funzione next
 */
const errorHandler = (err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
    });
};
exports.errorHandler = errorHandler;
