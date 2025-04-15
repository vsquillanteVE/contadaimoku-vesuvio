// Serverless function entry point for Vercel
const app = require('../src/index');

// Set environment variable to indicate we're running in Vercel
process.env.VERCEL = '1';

module.exports = app;
