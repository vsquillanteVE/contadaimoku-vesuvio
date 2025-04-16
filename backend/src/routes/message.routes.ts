import { Router } from 'express';
import { messageController } from '../controllers/message.controller';

const router = Router();

/**
 * @route GET /api/message
 * @desc Ottiene il messaggio attuale
 * @access Public
 */
router.get('/', (req, res) => messageController.getMessage(req, res));

/**
 * @route POST /api/message
 * @desc Aggiorna il messaggio
 * @access Private
 */
router.post('/', (req, res) => messageController.updateMessage(req, res));

/**
 * @route GET /api/message/history
 * @desc Ottiene la cronologia dei messaggi
 * @access Public
 */
router.get('/history', (req, res) => messageController.getMessageHistory(req, res));

export default router;
