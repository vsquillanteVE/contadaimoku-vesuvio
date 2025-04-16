"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Configurazione dell'applicazione
exports.default = {
    // Porta del server
    port: process.env.PORT || 3001,
    // Ambiente
    env: process.env.NODE_ENV || 'development',
    // Flag per Vercel
    isVercel: process.env.VERCEL === '1',
    // Configurazione CORS
    cors: {
        origins: ['https://contadaimoku-vesuvio.vercel.app', 'https://contadaimoku-vesuvio-be.vercel.app', 'http://localhost:5173', '*'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'X-Requested-With', 'Accept', 'Origin', 'Pragma', 'Expires'],
        credentials: true
    },
    // Credenziali admin (in un'app reale, queste dovrebbero essere in variabili d'ambiente)
    admin: {
        username: 'admin',
        password: 'vesuvio2025'
    }
};
