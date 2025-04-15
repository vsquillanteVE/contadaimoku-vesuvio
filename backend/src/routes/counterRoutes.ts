import express from 'express';
import { getCurrentCount, addToCount } from '../controllers/counterController';

const router = express.Router();

// Get the current count
router.get('/', getCurrentCount);

// Increment the count
router.post('/', addToCount);

export default router;
