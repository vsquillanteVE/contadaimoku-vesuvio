"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsHeadersMiddleware = exports.corsMiddleware = void 0;
const cors_1 = __importDefault(require("cors"));
const config_1 = __importDefault(require("../config"));
/**
 * Middleware CORS configurato
 */
exports.corsMiddleware = (0, cors_1.default)({
    origin: config_1.default.cors.origins,
    methods: config_1.default.cors.methods,
    allowedHeaders: config_1.default.cors.allowedHeaders,
    credentials: config_1.default.cors.credentials
});
/**
 * Middleware per aggiungere manualmente gli header CORS
 * @param req Richiesta Express
 * @param res Risposta Express
 * @param next Funzione next
 */
const corsHeadersMiddleware = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', config_1.default.cors.methods.join(', '));
    res.header('Access-Control-Allow-Headers', config_1.default.cors.allowedHeaders.join(', '));
    res.header('Access-Control-Allow-Credentials', String(config_1.default.cors.credentials));
    // Gestisci le richieste OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    next();
};
exports.corsHeadersMiddleware = corsHeadersMiddleware;
