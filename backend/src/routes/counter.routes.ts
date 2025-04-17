import { Router } from 'express';
import { counterController } from '../controllers/counter.controller';

const router = Router();

/**
 * @route GET /api/count
 * @desc Ottiene il conteggio attuale
 * @access Public
 */
router.get('/', (req, res) => counterController.getCount(req, res));

/**
 * @route POST /api/count
 * @desc Incrementa il conteggio
 * @access Public
 */
router.post('/', (req, res) => counterController.incrementCount(req, res));

/**
 * @route DELETE /api/count
 * @desc Resetta il conteggio
 * @access Private (in un'app reale, questo dovrebbe essere protetto)
 */
router.delete('/', (req, res) => counterController.resetCount(req, res));

/**
 * @route POST /api/count/reset
 * @desc Resetta il conteggio (alternativa a DELETE per compatibilità)
 * @access Private
 */
router.post('/reset', (req, res) => counterController.resetCount(req, res));

/**
 * @route GET /api/count/logs
 * @desc Ottiene la cronologia dei log di daimoku
 * @access Private
 */
router.get('/logs', (req, res) => counterController.getDaimokuLogs(req, res));

/**
 * @route GET /api/count/stats
 * @desc Ottiene statistiche sui log di daimoku
 * @access Public
 */
router.get('/stats', (req, res) => counterController.getDaimokuStats(req, res));

/**
 * @route GET /api/count/export
 * @desc Esporta i log di daimoku in formato CSV
 * @access Private
 */
router.get('/export', (req, res) => counterController.exportDaimokuLogs(req, res));

export default router;
