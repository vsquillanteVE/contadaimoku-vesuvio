"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.counterController = exports.CounterController = void 0;
const db_service_1 = require("../services/db.service");
/**
 * Controller per gestire le operazioni sul contatore
 */
class CounterController {
    /**
     * Ottiene il conteggio attuale
     * @param req Richiesta Express
     * @param res Risposta Express
     */
    async getCount(req, res) {
        try {
            const count = await db_service_1.dbService.getCount();
            res.json({ count });
        }
        catch (error) {
            console.error('Error getting count:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    /**
     * Incrementa il conteggio
     * @param req Richiesta Express
     * @param res Risposta Express
     */
    async incrementCount(req, res) {
        try {
            const amount = req.body.amount ? parseInt(req.body.amount) : 1;
            const count = await db_service_1.dbService.incrementCount(amount);
            res.json({ count });
        }
        catch (error) {
            console.error('Error incrementing count:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    /**
     * Resetta il conteggio
     * @param req Richiesta Express
     * @param res Risposta Express
     */
    async resetCount(req, res) {
        try {
            const result = await db_service_1.dbService.resetCount();
            res.json({ success: result });
        }
        catch (error) {
            console.error('Error resetting count:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
exports.CounterController = CounterController;
// Esporta un'istanza singleton del controller
exports.counterController = new CounterController();
