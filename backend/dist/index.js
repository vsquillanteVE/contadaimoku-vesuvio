"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const config_1 = __importDefault(require("./config"));
const cors_middleware_1 = require("./middleware/cors.middleware");
const error_middleware_1 = require("./middleware/error.middleware");
const routes_1 = __importDefault(require("./routes"));
// Carica le variabili d'ambiente
dotenv_1.default.config();
// Stampa le variabili d'ambiente per debug
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
console.log('PGHOST:', process.env.PGHOST || 'Not set');
console.log('PGUSER:', process.env.PGUSER || 'Not set');
console.log('PGDATABASE:', process.env.PGDATABASE || 'Not set');
console.log('PGPASSWORD:', process.env.PGPASSWORD ? 'Set' : 'Not set');
// Inizializza l'app Express
const app = (0, express_1.default)();
// Middleware
app.use(cors_middleware_1.corsMiddleware);
app.use(cors_middleware_1.corsHeadersMiddleware);
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Routes API
app.use('/api', routes_1.default);
// Serve file statici in produzione
if (config_1.default.env === 'production') {
    app.use(express_1.default.static(path_1.default.join(__dirname, '../../frontend/dist')));
    app.get('*', (req, res) => {
        res.sendFile(path_1.default.join(__dirname, '../../frontend/dist/index.html'));
    });
}
// Middleware per gestire gli errori
app.use(error_middleware_1.notFoundHandler);
app.use(error_middleware_1.errorHandler);
// Avvia il server o esporta l'app per Vercel
if (process.env.VERCEL === '1') {
    // Esporta l'app Express come funzione serverless
    module.exports = app;
}
else {
    // Avvia il server per lo sviluppo locale
    app.listen(config_1.default.port, () => {
        console.log(`Server running on port ${config_1.default.port}`);
    });
}
// Esporta l'app per Vercel
exports.default = app;
// Esporta l'app per CommonJS
module.exports = app;
