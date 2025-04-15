import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { getCount, incrementCount, getMessage, updateMessage, authenticateUser } from './db';

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['https://contadaimoku-vesuvio.vercel.app', 'http://localhost:5173'], // Origini specifiche
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middleware per aggiungere manualmente gli header CORS
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Gestisci le richieste OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get('/api/test', (req: Request, res: Response) => {
  res.json({ message: 'API is working!', env: process.env.NODE_ENV || 'development', vercel: process.env.VERCEL || 'not-vercel' });
});

// Get count route
app.get('/api/count', async (req: Request, res: Response) => {
  try {
    const count = getCount();
    res.json({ count });
  } catch (error) {
    console.error('Error getting count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Increment count route
app.post('/api/count', async (req: Request, res: Response) => {
  try {
    const amount = req.body.amount ? parseInt(req.body.amount) : 1;
    const count = incrementCount(amount);
    res.json({ count });
  } catch (error) {
    console.error('Error incrementing count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get message route
app.get('/api/message', async (req: Request, res: Response) => {
  try {
    const message = getMessage();
    res.json({ message });
  } catch (error) {
    console.error('Error getting message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login route
app.post('/api/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = authenticateUser(username, password);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// Update message route (protected with authentication)
app.post('/api/message', async (req: Request, res: Response) => {
  try {
    const { content, htmlContent, fullContent, objectivesContent, username, password } = req.body;

    // Authenticate user
    const user = authenticateUser(username, password);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!content || !htmlContent || !fullContent || !objectivesContent) {
      return res.status(400).json({ error: 'Content, HTML content, full content, and objectives content are required' });
    }

    // Update message
    const message = updateMessage(content, htmlContent, fullContent, objectivesContent);

    res.json({ message });
  } catch (error) {
    console.error('Error updating message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 404 handler
app.use((req: Request, res: Response) => {
  console.log(`Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Endpoint non trovato' });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
});

// Vercel serverless function handler
if (process.env.VERCEL === '1') {
  // Export the Express app as a serverless function
  module.exports = app;
} else {
  // Start the server for local development
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
