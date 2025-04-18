"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const counter_controller_1 = require("../controllers/counter.controller");
const router = (0, express_1.Router)();
/**
 * @route GET /api/count
 * @desc Ottiene il conteggio attuale
 * @access Public
 */
router.get('/', (req, res) => counter_controller_1.counterController.getCount(req, res));
/**
 * @route POST /api/count
 * @desc Incrementa il conteggio
 * @access Public
 */
router.post('/', (req, res) => counter_controller_1.counterController.incrementCount(req, res));
/**
 * @route DELETE /api/count
 * @desc Resetta il conteggio
 * @access Private (in un'app reale, questo dovrebbe essere protetto)
 */
router.delete('/', (req, res) => counter_controller_1.counterController.resetCount(req, res));
/**
 * @route POST /api/count/reset
 * @desc Resetta il conteggio (alternativa a DELETE per compatibilità)
 * @access Private
 */
router.post('/reset', (req, res) => counter_controller_1.counterController.resetCount(req, res));
/**
 * @route GET /api/count/logs
 * @desc Ottiene la cronologia dei log di daimoku
 * @access Private
 */
router.get('/logs', (req, res) => counter_controller_1.counterController.getDaimokuLogs(req, res));
/**
 * @route GET /api/count/stats
 * @desc Ottiene statistiche sui log di daimoku
 * @access Public
 */
router.get('/stats', (req, res) => counter_controller_1.counterController.getDaimokuStats(req, res));
/**
 * @route GET /api/count/export
 * @desc Esporta i log di daimoku in formato CSV
 * @access Private
 */
router.get('/export', (req, res) => counter_controller_1.counterController.exportDaimokuLogs(req, res));
/**
 * @route GET /api/count/test-daimoku-log
 * @desc Test per verificare la tabella daimoku_log
 * @access Public
 */
router.get('/test-daimoku-log', (req, res) => counter_controller_1.counterController.testDaimokuLog(req, res));
exports.default = router;
