"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageController = exports.MessageController = void 0;
const db_service_1 = require("../services/db.service");
/**
 * Controller per gestire le operazioni sui messaggi
 */
class MessageController {
    /**
     * Ottiene il messaggio attuale
     * @param req Richiesta Express
     * @param res Risposta Express
     */
    async getMessage(req, res) {
        try {
            const message = await db_service_1.dbService.getMessage();
            res.json({ message });
        }
        catch (error) {
            console.error('Error getting message:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    /**
     * Aggiorna il messaggio
     * @param req Richiesta Express
     * @param res Risposta Express
     */
    async updateMessage(req, res) {
        try {
            const { content, htmlContent, fullContent, objectivesContent, username, password } = req.body;
            // Verifica le credenziali
            const user = await db_service_1.dbService.authenticateUser(username, password);
            if (!user) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            // Aggiorna il messaggio
            const message = await db_service_1.dbService.updateMessage(content, htmlContent, fullContent, objectivesContent);
            res.json({ message });
        }
        catch (error) {
            console.error('Error updating message:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    /**
     * Ottiene la cronologia dei messaggi
     * @param req Richiesta Express
     * @param res Risposta Express
     */
    async getMessageHistory(req, res) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit) : 10;
            const history = await db_service_1.dbService.getMessageHistory(limit);
            res.json({ history });
        }
        catch (error) {
            console.error('Error getting message history:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
exports.MessageController = MessageController;
// Esporta un'istanza singleton del controller
exports.messageController = new MessageController();
