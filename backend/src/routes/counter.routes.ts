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

export default router;
