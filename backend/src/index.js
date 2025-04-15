const express = require('express');
const cors = require('cors');
const path = require('path');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: '*', // Consenti tutte le origini
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Database in memoria
const inMemoryDB = {
  counter: 0,
  message: {
    content: 'Niente può distruggere i tesori del cuore.',
    htmlContent: '<p>Niente può distruggere i tesori del cuore.</p>',
    fullContent: '<div class="message-highlight"><p>Niente può distruggere i tesori del cuore.</p></div>',
    objectivesContent: '<li>Realizziamo in Unità 10.000.000 di Daimoku per la protezione e la buona salute di tutti i praticanti e di tutti i cittadini del Vesuvio</li><li>Studiamo insieme le guide di Sensei</li>'
  },
  messageHistory: [],
  users: [
    { id: 1, username: 'admin', password: 'vesuvio2025' }
  ]
};

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!', env: process.env.NODE_ENV || 'development', vercel: process.env.VERCEL || 'not-vercel' });
});

// Get count route
app.get('/api/count', (req, res) => {
  res.json({ count: inMemoryDB.counter });
});

// Increment count route
app.post('/api/count', (req, res) => {
  const amount = req.body.amount ? parseInt(req.body.amount) : 1;
  inMemoryDB.counter += amount;
  res.json({ count: inMemoryDB.counter });
});

// Get message route
app.get('/api/message', (req, res) => {
  res.json({ message: inMemoryDB.message });
});

// Login route
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const user = inMemoryDB.users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  res.json({ user: { id: user.id, username: user.username } });
});

// Update message route (protected with authentication)
app.post('/api/message', (req, res) => {
  const { content, htmlContent, fullContent, objectivesContent, username, password } = req.body;

  // Authenticate user
  const user = inMemoryDB.users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!content || !htmlContent || !fullContent || !objectivesContent) {
    return res.status(400).json({ error: 'Content, HTML content, full content, and objectives content are required' });
  }

  // Add current message to history
  inMemoryDB.messageHistory.push({
    id: inMemoryDB.messageHistory.length + 1,
    content: inMemoryDB.message.content,
    html_content: inMemoryDB.message.htmlContent,
    full_content: inMemoryDB.message.fullContent,
    objectives_content: inMemoryDB.message.objectivesContent,
    created_at: new Date().toISOString()
  });

  // Update message
  inMemoryDB.message = {
    content,
    htmlContent,
    fullContent,
    objectivesContent
  };

  res.json({ message: inMemoryDB.message });
});

// Get message history
app.get('/api/message/history', (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : 10;
  const history = inMemoryDB.messageHistory.slice(0, limit);
  res.json({ history });
});

// 404 handler
app.use((req, res) => {
  console.log(`Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Endpoint non trovato' });
});

// Error handler
app.use((err, req, res, next) => {
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
