import { Router } from 'express';
import { authController } from '../controllers/auth.controller';

const router = Router();

/**
 * @route POST /api/auth/login
 * @desc Autentica un utente
 * @access Public
 */
router.post('/login', (req, res) => authController.login(req, res));

export default router;
