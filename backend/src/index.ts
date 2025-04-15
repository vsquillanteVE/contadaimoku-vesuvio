import express from 'express';
import cors from 'cors';
import path from 'path';
import { getCount, incrementCount, getMessage, updateMessage } from './db';

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Get count route
app.get('/api/count', (req, res) => {
  try {
    const count = getCount();
    res.json({ count });
  } catch (error) {
    console.error('Error getting count:', error);
    res.status(500).json({ error: 'Failed to get count' });
  }
});

// Increment count route
app.post('/api/count', (req, res) => {
  try {
    const amount = req.body.amount ? parseInt(req.body.amount) : 1;
    const newCount = incrementCount(amount);
    res.json({ count: newCount });
  } catch (error) {
    console.error('Error incrementing count:', error);
    res.status(500).json({ error: 'Failed to increment count' });
  }
});

// Get message route
app.get('/api/message', (req, res) => {
  try {
    const message = getMessage();
    res.json({ message });
  } catch (error) {
    console.error('Error getting message:', error);
    res.status(500).json({ error: 'Failed to get message' });
  }
});

// Update message route (protected with password)
app.post('/api/message', (req, res) => {
  try {
    const { content, password } = req.body;

    // Verifica la password (in un'applicazione reale, usare metodi più sicuri)
    if (password !== 'vesuvio2025') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const updatedMessage = updateMessage(content);
    res.json({ message: updatedMessage });
  } catch (error) {
    console.error('Error updating message:', error);
    res.status(500).json({ error: 'Failed to update message' });
  }
});

// 404 handler
app.use((req, res) => {
  console.log(`Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Endpoint non trovato' });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
  });
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
