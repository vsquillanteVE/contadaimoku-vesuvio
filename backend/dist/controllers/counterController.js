"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addToCount = exports.getCurrentCount = void 0;
const db_1 = require("../db");
// Get the current count
const getCurrentCount = (req, res) => {
    try {
        const count = (0, db_1.getCount)();
        res.json({ count });
    }
    catch (error) {
        console.error('Error getting count:', error);
        res.status(500).json({ error: 'Failed to get count' });
    }
};
exports.getCurrentCount = getCurrentCount;
// Increment the count
const addToCount = (req, res) => {
    try {
        const amount = req.body.amount ? parseInt(req.body.amount) : 1;
        const newCount = (0, db_1.incrementCount)(amount);
        res.json({ count: newCount });
    }
    catch (error) {
        console.error('Error incrementing count:', error);
        res.status(500).json({ error: 'Failed to increment count' });
    }
};
exports.addToCount = addToCount;
