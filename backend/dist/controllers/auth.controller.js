"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const db_service_1 = require("../services/db.service");
/**
 * Controller per gestire l'autenticazione
 */
class AuthController {
    /**
     * Gestisce il login
     * @param req Richiesta Express
     * @param res Risposta Express
     */
    async login(req, res) {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                res.status(400).json({ error: 'Username and password are required' });
                return;
            }
            const user = await db_service_1.dbService.authenticateUser(username, password);
            if (!user) {
                res.status(401).json({ error: 'Invalid credentials' });
                return;
            }
            // In un'app reale, qui genereremmo un token JWT
            res.json({
                user: {
                    id: user.id,
                    username: user.username
                }
            });
        }
        catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Internal server error during login' });
        }
    }
}
exports.AuthController = AuthController;
// Esporta un'istanza singleton del controller
exports.authController = new AuthController();
