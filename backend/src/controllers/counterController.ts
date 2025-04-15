import { Request, Response } from 'express';
import { getCount, incrementCount } from '../db';

// Get the current count
export const getCurrentCount = (req: Request, res: Response) => {
  try {
    const count = getCount();
    res.json({ count });
  } catch (error) {
    console.error('Error getting count:', error);
    res.status(500).json({ error: 'Failed to get count' });
  }
};

// Increment the count
export const addToCount = (req: Request, res: Response) => {
  try {
    const amount = req.body.amount ? parseInt(req.body.amount) : 1;
    const newCount = incrementCount(amount);
    res.json({ count: newCount });
  } catch (error) {
    console.error('Error incrementing count:', error);
    res.status(500).json({ error: 'Failed to increment count' });
  }
};
